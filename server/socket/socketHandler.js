// Socket.IO event handler
const socketHandler = (io) => {
  io.on('connection', (socket) => {
    console.log(`🔌 User connected: ${socket.id}`);

    // Join user's personal room for targeted notifications
    socket.on('joinRoom', (userId) => {
      if (userId) {
        socket.join(userId);
        console.log(`👤 User ${userId} joined their notification room`);
      }
    });

    // Join role-based room (admin/authority)
    socket.on('joinRoleRoom', (role) => {
      if (['admin', 'authority'].includes(role)) {
        socket.join(role);
        console.log(`🛡️ User joined ${role} room`);
      }
    });

    // Listen for location updates from users viewing the map
    socket.on('viewingMap', (data) => {
      socket.join('map-viewers');
    });

    socket.on('disconnect', () => {
      console.log(`🔌 User disconnected: ${socket.id}`);
    });
  });
};

module.exports = socketHandler;
