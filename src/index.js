const server = require('./server');
const socketio = require('socket.io');
const Filter = require('bad-words');

const { generateMessage } = require('./utils/messages');
const {
  addUser,
  getUser,
  getUsersInRoom,
  removeUser
} = require('./utils/users');

const io = socketio(server);

// Socket events list
const events = {
  connection: 'connection',
  join: 'join',
  roomData: 'roomData',
  message: 'message',
  sendMessage: 'sendMessage',
  sendLocation: 'sendLocation',
  locationMessage: 'locationMessage',
  disconnect: 'disconnect'
};

// On the "connection" event handler
io.on(events.connection, (socket) => {
  console.log('New WebSocket connection!')

  socket.on(events.join, (options, callback) => {
    const { error, user } = addUser({ id: socket.id, ...options });

    if (error) {
      return callback(error);
    }

    socket.join(user.room);

    socket.emit(events.message, generateMessage('Admin', 'Welcome!'));
    socket.broadcast.to(user.room).emit(
      events.message,
      generateMessage('Admin', `${user.username} has joined!`)
    );

    io.to(user.room).emit(events.roomData, {
      room: user.room,
      users: getUsersInRoom(user.room)
    });

    callback();
  });

  // On the "sendMessage" event handler
  socket.on(events.sendMessage, (message, callback) => {
    const user = getUser(socket.id);
    const filter = new Filter();

    if (filter.isProfane(message)) {
      return callback('Profanity is not allowed!');
    }

    io.to(user.room).emit(events.message, generateMessage(user.username, message));
    callback();
  });

  // On the "sendLocation" event handler
  socket.on(events.sendLocation, (location, callback) => {
    const user = getUser(socket.id);
    const locationMessage = `https://google.com/maps?q=${location.lat},${location.long}`;

    io.to(user.room).emit(events.locationMessage, generateMessage(user.username, locationMessage));
    callback('Location shared!');
  });

  // On the "disconnect" event handler
  socket.on(events.disconnect, () => {
    const user = removeUser(socket.id);

    if (user) {
      io.to(user.room).emit(events.message, generateMessage('Admin', `${user.username} has left!`));

      io.to(user.room).emit(events.roomData, {
        room: user.room,
        users: getUsersInRoom(user.room)
      });
    }
  });
});
