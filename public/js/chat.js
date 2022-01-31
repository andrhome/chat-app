const socket = io();

socket.on('message', (message) => {
  console.log(message);
});

document.querySelector('#messageForm').addEventListener('submit', (ev) => {
  ev.preventDefault();

  const message = ev.target.elements.message.value;

  socket.emit('sendMessage', message);
});
