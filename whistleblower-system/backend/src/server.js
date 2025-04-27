const app = require('./app');
const http = require('http');
const socketIo = require('socket.io');
const PORT = process.env.PORT || 3001;

// Create HTTP server
const server = http.createServer(app);

// Initialize Socket.IO
const io = socketIo(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"]
  }
});

// Socket.IO connection
io.on('connection', (socket) => {
  console.log('New client connected');
  
  // Join a report room
  socket.on('join_report', (reportId) => {
    socket.join(`report_${reportId}`);
    console.log(`Client joined room for report ${reportId}`);
  });
  
  // Leave a report room
  socket.on('leave_report', (reportId) => {
    socket.leave(`report_${reportId}`);
    console.log(`Client left room for report ${reportId}`);
  });
  
  // Disconnect
  socket.on('disconnect', () => {
    console.log('Client disconnected');
  });
});

// Add Socket.IO instance to app for use in routes
app.set('io', io);

server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
