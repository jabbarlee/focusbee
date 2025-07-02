const { Server } = require("socket.io");
const http = require("http");

const server = http.createServer();
const io = new Server(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"],
  },
});

io.on("connection", (socket) => {
  console.log("Client connected:", socket.id);

  // Join a session room
  socket.on("join-session", (sessionId) => {
    socket.join(sessionId);
    console.log(`Client ${socket.id} joined session ${sessionId}`);
  });

  // Handle phone connection
  socket.on("phone-connected", (data) => {
    console.log("Phone connected to session:", data.sessionId);
    socket.to(data.sessionId).emit("phone-connected", data);
  });

  // Handle ritual step updates
  socket.on("ritual-step", (data) => {
    console.log("Ritual step update:", data);
    socket.to(data.sessionId).emit("ritual-step", data);
  });

  // Handle timer selection
  socket.on("timer-selected", (data) => {
    console.log("Timer selected:", data);
    socket.to(data.sessionId).emit("timer-selected", data);
  });

  // Handle ritual completion
  socket.on("ritual-complete", (data) => {
    console.log("Ritual complete:", data);
    socket.to(data.sessionId).emit("ritual-complete", data);
  });

  socket.on("disconnect", () => {
    console.log("Client disconnected:", socket.id);
  });
});

const PORT = process.env.WEBSOCKET_PORT || 3001;
server.listen(PORT, () => {
  console.log(`WebSocket server running on port ${PORT}`);
});
