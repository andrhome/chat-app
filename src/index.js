const express = require('express');
const http = require('http');
const path = require('path');
const socketio = require('socket.io');

const app = express();
const server = http.createServer(app)
const io = socketio(server);
const port = process.env.PORT || 3000;

const publicDirPath = path.join(__dirname, '../public');

// Setup static directory to serve
app.use(express.static(publicDirPath));

io.on('connection', () => {
  console.log('New WebSocket connection!')
});

server.listen(port, () => {
  console.log(`Server is up on port ${port}!`);
});
