// Socket communication for real-time updates
let io;

// Initialize socket.io
exports.init = (server) => {
  io = require('socket.io')(server, {
    cors: {
      origin: '*',
      methods: ['GET', 'POST']
    }
  });
  
  io.on('connection', (socket) => {
    console.log('New client connected');
    
    // Join a report room
    socket.on('join_report', (reportId) => {
      socket.join(reportId);
      console.log(`Client joined report room: ${reportId}`);
    });
    
    // Leave a report room
    socket.on('leave_report', (reportId) => {
      socket.leave(reportId);
      console.log(`Client left report room: ${reportId}`);
    });
    
    // Disconnect event
    socket.on('disconnect', () => {
      console.log('Client disconnected');
    });
  });
  
  return io;
};

// Emit a new report event
exports.emitNewReport = (report) => {
  if (io) {
    io.emit('new_report', report);
  }
};

// Emit a report status change event
exports.emitStatusChange = (reportUpdate) => {
  if (io) {
    io.to(reportUpdate.reportId).emit('report_status_changed', reportUpdate);
  }
};

// Emit a new message event
exports.emitNewMessage = (message) => {
  if (io) {
    io.to(message.reportId).emit('new_message', message);
  }
};
