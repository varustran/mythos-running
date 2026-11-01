/**
 * MysoMeet WebRTC Peer Connection Manager
 * Standardized for Socket.io and Next.js / React:
 * 1. Global Multi-STUN Servers
 * 2. Strict ICE Candidate Queueing (candidateQueue processed ONLY after setRemoteDescription completes)
 * 3. Track Replacement API for smooth Screen Sharing without peer renegotiation
 * 4. Lifecyle-safe track muting (track.enabled = false/true)
 * 5. Full cleanup on exit
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
  private candidateQueue: RTCIceCandidateInit[] = [];
  private hasRemoteDescription = false;
  private events: PeerEvents;
  private isPolite: boolean;
  private makingOffer = false;

  constructor(peerId: string, myPeerId: string, events: PeerEvents, localStream?: MediaStream) {
    this.peerId = peerId;
    this.events = events;
    // Tie-breaker: lexicographical comparison determines polite peer
    this.isPolite = myPeerId > peerId;

    this.pc = new RTCPeerConnection(RTC_CONFIG);
    this.setupListeners();

    if (localStream) {
      localStream.getTracks().forEach((track) => {
        try {
          this.pc.addTrack(track, localStream);
        } catch (e) {
          console.warn(`[WebRTC] Failed to add track for peer ${peerId}:`, e);
        }
      });
    }
  }

  private setupListeners() {
    // 1. ICE Candidate generated locally
    this.pc.onicecandidate = (e) => {
      if (e.candidate) {
        this.events.onIceCandidate(this.peerId, e.candidate.toJSON());
      }
    };

    // 2. Remote track received
    this.pc.ontrack = (event) => {
      console.log(`[WebRTC] ontrack received from ${this.peerId}:`, event.track.kind);
      if (event.streams && event.streams[0]) {
        this.events.onRemoteStream(this.peerId, event.streams[0]);
      } else {
        const inboundStream = new MediaStream([event.track]);
        this.events.onRemoteStream(this.peerId, inboundStream);
      }
    };

    // 3. Connection state changes
    this.pc.onconnectionstatechange = () => {
      console.log(`[WebRTC] Peer ${this.peerId} state:`, this.pc.connectionState);
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
        return; // Impolite peer ignores offer collision
      }

      await this.pc.setRemoteDescription(new RTCSessionDescription(offer));
      this.hasRemoteDescription = true;
      await this.flushCandidateQueue();

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
        await this.flushCandidateQueue();
      }
    } catch (err) {
      console.warn(`[WebRTC] Error handling answer from ${this.peerId}:`, err);
    }
  }

  /**
   * Safe ICE Candidate Queueing:
   * DO NOT call addIceCandidate before setRemoteDescription completes!
   */
  public async addIceCandidate(candidate: RTCIceCandidateInit) {
    if (!this.hasRemoteDescription || !this.pc.remoteDescription) {
      this.candidateQueue.push(candidate);
      return;
    }

    try {
      await this.pc.addIceCandidate(new RTCIceCandidate(candidate));
    } catch (err) {
      console.warn(`[WebRTC] Error adding ICE candidate for ${this.peerId}:`, err);
    }
  }

  /**
   * Flush all candidateQueue once remoteDescription is set
   */
  private async flushCandidateQueue() {
    while (this.candidateQueue.length > 0) {
      const cand = this.candidateQueue.shift();
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
   * Replace Track smoothly for Screen Sharing without renegotiating
   */
  public async replaceVideoTrack(newTrack: MediaStreamTrack | null): Promise<void> {
    const sender = this.pc.getSenders().find((s) => s.track?.kind === "video");
    if (sender) {
      try {
        await sender.replaceTrack(newTrack);
      } catch (err) {
        console.warn(`[WebRTC] Replace video track failed for ${this.peerId}:`, err);
      }
    }
  }

  /**
   * Replace Audio Track
   */
  public async replaceAudioTrack(newTrack: MediaStreamTrack | null): Promise<void> {
    const sender = this.pc.getSenders().find((s) => s.track?.kind === "audio");
    if (sender) {
      try {
        await sender.replaceTrack(newTrack);
      } catch (err) {
        console.warn(`[WebRTC] Replace audio track failed for ${this.peerId}:`, err);
      }
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
