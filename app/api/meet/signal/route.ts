import { NextResponse } from "next/server";

interface PeerSignal {
  senderId: string;
  senderName: string;
  senderHandle: string;
  senderAvatar?: string;
  targetId?: string;
  type: "join" | "leave" | "offer" | "answer" | "candidate" | "heartbeat";
  payload?: any;
  timestamp: number;
}

interface RoomState {
  peers: Record<
    string,
    {
      id: string;
      name: string;
      handle: string;
      avatar?: string;
      lastSeen: number;
    }
  >;
  signals: PeerSignal[];
}

// Global in-memory signaling store (survives warm serverless invocations)
const rooms: Record<string, RoomState> = {};

function getRoom(roomId: string): RoomState {
  if (!rooms[roomId]) {
    rooms[roomId] = {
      peers: {},
      signals: [],
    };
  }
  return rooms[roomId];
}

function cleanStalePeers(room: RoomState) {
  const now = Date.now();
  for (const peerId in room.peers) {
    if (now - room.peers[peerId].lastSeen > 35000) {
      delete room.peers[peerId];
    }
  }
  // Keep signals younger than 30s
  room.signals = room.signals.filter((s) => now - s.timestamp < 30000);
}

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const roomId = searchParams.get("roomId");
    const peerId = searchParams.get("peerId");

    if (!roomId) {
      return NextResponse.json({ error: "Missing roomId" }, { status: 400 });
    }

    const room = getRoom(roomId);
    cleanStalePeers(room);

    // If peerId provided, update its heartbeat
    if (peerId && room.peers[peerId]) {
      room.peers[peerId].lastSeen = Date.now();
    }

    // Get signals meant for this peer or broadcast
    const pendingSignals = peerId
      ? room.signals.filter(
          (s) => s.senderId !== peerId && (!s.targetId || s.targetId === peerId)
        )
      : [];

    return NextResponse.json({
      peers: Object.values(room.peers),
      signals: pendingSignals,
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { roomId, peerId, type, senderName, senderHandle, senderAvatar, targetId, payload } = body;

    if (!roomId || !peerId) {
      return NextResponse.json({ error: "Missing roomId or peerId" }, { status: 400 });
    }

    const room = getRoom(roomId);
    cleanStalePeers(room);

    if (type === "join" || type === "heartbeat") {
      room.peers[peerId] = {
        id: peerId,
        name: senderName || "Thành viên Myso",
        handle: senderHandle || "user",
        avatar: senderAvatar,
        lastSeen: Date.now(),
      };
    } else if (type === "leave") {
      delete room.peers[peerId];
    } else {
      // Signal (offer, answer, candidate)
      const sig: PeerSignal = {
        senderId: peerId,
        senderName: senderName || "Thành viên",
        senderHandle: senderHandle || "user",
        senderAvatar,
        targetId,
        type,
        payload,
        timestamp: Date.now(),
      };
      room.signals.push(sig);
    }

    return NextResponse.json({
      success: true,
      activePeersCount: Object.keys(room.peers).length,
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
