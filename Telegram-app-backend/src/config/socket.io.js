let io;

const initializeSocket = (server) => {
  const { Server } = require("socket.io");
  io = new Server(server, {
    transports: ["websocket"],
    cors: {
      origin: "*",
      methods: ["GET", "POST"],
    },
  });

  io.on("connection", (socket) => {
    console.log(`Socket connected: ${socket.id}`);

    socket.on("createTask", (task) => {
      console.log("Task received:", task);
      io.emit("taskCreated", { message: "A new task was created!", task });
    });

    socket.on("disconnect", () => {
      console.log(`Socket disconnected: ${socket.id}`);
    });
  });

  return io;
};

const getIoInstance = () => {
  if (!io) {
    throw new Error("Socket.IO not initialized");
  }
  return io;
};

module.exports = { initializeSocket, getIoInstance };
