let ioInstance;
module.exports = {
  init: server => {
    const io = require("socket.io")(server, { cors: { origin: "*" } });
    io.on("connection", socket => {
      const { userId } = socket.handshake.query;
      if (userId) socket.join(userId);
    });
    ioInstance = io;
    return io;
  },
  getIO: () => {
    if (!ioInstance) throw new Error("Socket.io not initialized");
    return ioInstance;
  }
};
