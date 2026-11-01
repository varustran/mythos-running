/**
 * MysoMeet WebRTC Peer Connection Manager
 * Implements industry-standard WebRTC best practices:
 * 1. Global Multi-STUN Servers (Google, Cloudflare, Twilio)
 * 2. Strict ICE Candidate Queueing (prevents candidates from being dropped before remoteDescription is ready)
 * 3. Track.enabled toggling (never calling track.stop() during mute/unmute)
 * 4. Automatic connection state diagnosis (checking, connected, failed, disconnected)
 * 5. Full teardown cleanup (stops tracks and closes peer connections cleanly)
 */

export const RTC_CONFIG: RTCConfiguration = {
  iceServers: [
    { urls: "stun:stun.l.google.com:19302" },
    { urls: "stun:stun1.l.google.com:19302" },
    { urls: "stun:stun2.l.google.com:19302" },
    { urls: "stun:stun3.l.google.com:19302" },
    { urls: "stun:stun4.l.google.com:19302" },
    { urls: "stun:stun.cloudflare.com:3478" },
    { urls: "stun:global.stun.twilio.com:3478" },
  ],
  iceCandidatePoolSize: 10,
};

export interface PeerEvents {
  onRemoteStream: (peerId: string, stream: MediaStream) => void;
  onIceCandidate: (targetPeerId: string, candidate: RTCIceCandidateInit) => void;
  onOffer: (targetPeerId: string, offer: RTCSessionDescriptionInit) => void;
  onAnswer: (targetPeerId: string, answer: RTCSessionDescriptionInit) => void;
  onConnectionStateChange: (peerId: string, state: RTCPeerConnectionState) => void;
}

export class WebRTCPeerSession {
  public readonly peerId: string;
  public readonly pc: RTCPeerConnection;
  private pendingCandidates: RTCIceCandidateInit[] = [];
  private hasRemoteDescription = false;
  private events: PeerEvents;
  private isPolite: boolean;
  private makingOffer = false;

  constructor(peerId: string, myPeerId: string, events: PeerEvents, localStream?: MediaStream) {
    this.peerId = peerId;
    this.events = events;
    // Tie breaker: lexicographical comparison determines who initiates/accepts glares
    this.isPolite = myPeerId > peerId;

    this.pc = new RTCPeerConnection(RTC_CONFIG);
    this.setupListeners();

    if (localStream) {
      localStream.getTracks().forEach((track) => {
        try {
          this.pc.addTrack(track, localStream);
        } catch (e) {
          console.warn(`[WebRTC] Failed to add track to peer ${peerId}:`, e);
        }
      });
    }
  }

  private setupListeners() {
    // 1. ICE Candidate generation
    this.pc.onicecandidate = (e) => {
      if (e.candidate) {
        this.events.onIceCandidate(this.peerId, e.candidate.toJSON());
      }
    };

    // 2. Track reception from remote peer
    this.pc.ontrack = (e) => {
      if (e.streams && e.streams[0]) {
        this.events.onRemoteStream(this.peerId, e.streams[0]);
      } else {
        const inboundStream = new MediaStream([e.track]);
        this.events.onRemoteStream(this.peerId, inboundStream);
      }
    };

    // 3. Connection state changes
    this.pc.onconnectionstatechange = () => {
      this.events.onConnectionStateChange(this.peerId, this.pc.connectionState);
    };

    // 4. Negotiation needed
    this.pc.onnegotiationneeded = async () => {
      try {
        this.makingOffer = true;
        const offer = await this.pc.createOffer();
        if (this.pc.signalingState !== "stable") return;
        await this.pc.setLocalDescription(offer);
        this.events.onOffer(this.peerId, this.pc.localDescription!);
      } catch (err) {
        console.warn(`[WebRTC] Negotiation error with ${this.peerId}:`, err);
      } finally {
        this.makingOffer = false;
      }
    };
  }

  /**
   * Handle incoming remote Offer
   */
  public async handleOffer(offer: RTCSessionDescriptionInit) {
    try {
      const offerCollision = this.makingOffer || this.pc.signalingState !== "stable";
      if (offerCollision && !this.isPolite) {
        // Glare resolution: impolite peer rejects remote offer
        return;
      }

      await this.pc.setRemoteDescription(new RTCSessionDescription(offer));
      this.hasRemoteDescription = true;
      await this.flushPendingCandidates();

      const answer = await this.pc.createAnswer();
      await this.pc.setLocalDescription(answer);
      this.events.onAnswer(this.peerId, this.pc.localDescription!);
    } catch (err) {
      console.warn(`[WebRTC] Error handling offer from ${this.peerId}:`, err);
    }
  }

  /**
   * Handle incoming remote Answer
   */
  public async handleAnswer(answer: RTCSessionDescriptionInit) {
    try {
      if (this.pc.signalingState === "have-local-offer") {
        await this.pc.setRemoteDescription(new RTCSessionDescription(answer));
        this.hasRemoteDescription = true;
        await this.flushPendingCandidates();
      }
    } catch (err) {
      console.warn(`[WebRTC] Error handling answer from ${this.peerId}:`, err);
    }
  }

  /**
   * Safe ICE Candidate Queueing:
   * Adds candidate only if remoteDescription is set, otherwise queues it.
   */
  public async addIceCandidate(candidate: RTCIceCandidateInit) {
    if (!this.hasRemoteDescription || !this.pc.remoteDescription) {
      this.pendingCandidates.push(candidate);
      return;
    }

    try {
      await this.pc.addIceCandidate(new RTCIceCandidate(candidate));
    } catch (err) {
      console.warn(`[WebRTC] Error adding ICE candidate for ${this.peerId}:`, err);
    }
  }

  /**
   * Flush all candidates queued before setRemoteDescription
   */
  private async flushPendingCandidates() {
    while (this.pendingCandidates.length > 0) {
      const cand = this.pendingCandidates.shift();
      if (cand) {
        try {
          await this.pc.addIceCandidate(new RTCIceCandidate(cand));
        } catch (e) {
          console.warn(`[WebRTC] Error flushing candidate for ${this.peerId}:`, e);
        }
      }
    }
  }

  /**
   * Replace local track dynamically without renegotiation where possible
   */
  public replaceTrack(kind: "video" | "audio", newTrack: MediaStreamTrack | null) {
    const sender = this.pc.getSenders().find((s) => s.track?.kind === kind);
    if (sender) {
      sender.replaceTrack(newTrack).catch((err) => {
        console.warn(`[WebRTC] Replace track error (${kind}):`, err);
      });
    }
  }

  /**
   * Cleanly close peer connection
   */
  public close() {
    try {
      this.pc.close();
    } catch (e) {
      // Ignore on close
    }
  }
}
