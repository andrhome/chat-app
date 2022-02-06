const express = require('express');
const http = require('http');
const path = require('path');
const socketio = require('socket.io');
const Filter = require('bad-words');
const { generateMessage } = require('./utils/messages');

const app = express();
const server = http.createServer(app)
const io = socketio(server);
const port = process.env.PORT || 3000;

const publicDirPath = path.join(__dirname, '../public');

// Setup static directory to serve
app.use(express.static(publicDirPath));

const events = {
  connection: 'connection',
  join: 'join',
  message: 'message',
  sendMessage: 'sendMessage',
  sendLocation: 'sendLocation',
  locationMessage: 'locationMessage',
  disconnect: 'disconnect'
};

// On the "connection" event handler
io.on(events.connection, (socket) => {
  console.log('New WebSocket connection!')

  socket.on(events.join, ({ username, room }) => {
    socket.join(room);

    socket.emit(events.message, generateMessage('Welcome!'));
    socket.broadcast.to(room).emit(
      events.message, generateMessage(`${username} has joined!`)
    );
  });

  // On the "sendMessage" event handler
  socket.on(events.sendMessage, (message, callback) => {
    const filter = new Filter();
    if (filter.isProfane(message)) {
      return callback('Profanity is not allowed!');
    }

    io.emit(events.message, generateMessage(message));
    callback();
  });

  // On the "sendLocation" event handler
  socket.on(events.sendLocation, (location, callback) => {
    const locationMessage = `https://google.com/maps?q=${location.lat},${location.long}`;
    socket.emit(events.locationMessage, generateMessage(locationMessage));
    callback('Location shared!');
  });

  // On the "disconnect" event handler
  socket.on(events.disconnect, () => {
    io.emit(events.message, generateMessage('A user has left!'));
  });
});

server.listen(port, () => {
  console.log(`Server is up on port ${port}!`);
});
