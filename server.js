const http = require("http");
const { Server } = require("socket.io");

const PORT = process.env.PORT || 5000;

const server = http.createServer((req, res) => {
  // Simple health check endpoint for Cloudflare Tunnel / Vercel web check
  if (req.url === "/" || req.url === "/health") {
    res.writeHead(200, {
      "Content-Type": "application/json",
      "Access-Control-Allow-Origin": "*",
    });
    res.end(
      JSON.stringify({
        status: "ok",
        service: "MysoMeet Socket.io Signaling Server",
        timestamp: Date.now(),
      })
    );
    return;
  }
  res.writeHead(404);
  res.end();
});

const io = new Server(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"],
  },
  transports: ["websocket", "polling"],
});

io.on("connection", (socket) => {
  console.log(`[Signaling] Socket connected: ${socket.id}`);

  // Join meeting room
  socket.on("join-room", ({ roomId, peerId, userInfo }) => {
    socket.join(roomId);
    socket.data.peerId = peerId;
    socket.data.roomId = roomId;
    socket.data.userInfo = userInfo || {};

    console.log(`[Signaling] Peer ${peerId} (${socket.id}) joined room: ${roomId}`);

    // Notify others in this room that a new user connected
    socket.to(roomId).emit("user-connected", {
      peerId,
      socketId: socket.id,
      userInfo: socket.data.userInfo,
    });
  });

  // Direct P2P signaling: offer, answer, ice-candidate
  socket.on("signal", ({ to, data }) => {
    // 'to' can be target socketId or target peerId
    io.to(to).emit("signal", {
      from: socket.id,
      fromPeerId: socket.data.peerId,
      data,
    });
  });

  // Dedicated WebRTC signal routing
  socket.on("offer", ({ targetPeerId, sdp }) => {
    socket.to(socket.data.roomId).emit("offer", {
      senderPeerId: socket.data.peerId,
      senderSocketId: socket.id,
      targetPeerId,
      sdp,
    });
  });

  socket.on("answer", ({ targetPeerId, sdp }) => {
    socket.to(socket.data.roomId).emit("answer", {
      senderPeerId: socket.data.peerId,
      senderSocketId: socket.id,
      targetPeerId,
      sdp,
    });
  });

  socket.on("ice-candidate", ({ targetPeerId, candidate }) => {
    socket.to(socket.data.roomId).emit("ice-candidate", {
      senderPeerId: socket.data.peerId,
      senderSocketId: socket.id,
      targetPeerId,
      candidate,
    });
  });

  // In-room chat
  socket.on("send-chat", ({ roomId, message }) => {
    io.to(roomId).emit("chat-message", message);
  });

  // Disconnect handling
  socket.on("disconnecting", () => {
    socket.rooms.forEach((room) => {
      socket.to(room).emit("user-disconnected", {
        peerId: socket.data.peerId,
        socketId: socket.id,
      });
    });
    console.log(`[Signaling] Socket disconnected: ${socket.id} (peer: ${socket.data.peerId})`);
  });
});

server.listen(PORT, "0.0.0.0", () => {
  console.log(`🚀 MysoMeet Socket.io Signaling Server running on port ${PORT}`);
  console.log(`🔗 Local: http://localhost:${PORT}`);
});
