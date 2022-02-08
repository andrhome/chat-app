const socket = io();

// Elements
const $messageForm = document.querySelector('#messageForm');
const $formInput = $messageForm.querySelector('input');
const $formButton = $messageForm.querySelector('button');
const locationButtonElem = document.querySelector('#send-location');
const $messages = document.querySelector('#messages');
const $sidebar = document.querySelector('#sidebar');

// Templates
const messageTemplate = document.querySelector('#message-template').innerHTML;
const locationTemplate = document.querySelector('#location-template').innerHTML;
const sidebarTemplate = document.querySelector('#sidebar-template').innerHTML;

// Options
const  { username, room } = Qs.parse(location.search, { ignoreQueryPrefix: true });

const autoscroll = () => {
  // New message element
  const $newMessage = $messages.lastElementChild;

  // Height of the new message
  const newMessageStyles = getComputedStyle($newMessage);
  const newMessageMargin = parseInt(newMessageStyles.marginBottom);
  const newMessageHeight = $newMessage.offsetHeight + newMessageMargin;

  // Visible height
  const visibleHeight = $messages.offsetHeight;

  // Height of messages container
  const containerHeight = $messages.scrollHeight;
  const scrollOffset = $messages.scrollTop + visibleHeight;

  if (containerHeight - newMessageHeight <= scrollOffset) {
    $messages.scrollTop = $messages.scrollHeight;
  }
};

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

socket.emit(events.join, { username, room }, (error) => {
  if (error) {
    alert(error)
    location.href = '/'
  }
});

socket.on(events.roomData, ({ room, users }) => {
  $sidebar.innerHTML = Mustache.render(sidebarTemplate, {
    room,
    users
  });
});

socket.on(events.message, (message) => {
  const html = Mustache.render(messageTemplate, {
    username: message.username,
    message: message.text,
    time: moment(message.time).format('hh:mm a')
  });
  $messages.insertAdjacentHTML('beforeend', html);

  autoscroll();
});

$messageForm.addEventListener('submit', (ev) => {
  ev.preventDefault();

  $formButton.setAttribute('disabled', 'disabled');

  const message = ev.target.elements.message.value;

  socket.emit(events.sendMessage, message, (error) => {
    $formButton.removeAttribute('disabled');
    $formInput.value = '';
    $formInput.focus();

    if (error) {
      return console.log(error);
    }

    console.log('Message delivered!');
  });
});

socket.on(events.locationMessage, (message) => {
  const html = Mustache.render(locationTemplate, {
    username: message.username,
    url: message.text,
    time: moment(message.time).format('hh:mm a')
  });
  $messages.insertAdjacentHTML('beforeend', html);

  autoscroll();
});

locationButtonElem.addEventListener('click', () => {
  if (!navigator.geolocation) {
    return alert('Geolocation is not supported by your browser!');
  }

  locationButtonElem.setAttribute('disabled', 'disabled');

  navigator.geolocation.getCurrentPosition((position) => {
    const locationData = {
      lat: position.coords.latitude,
      long: position.coords.longitude,
    };
    socket.emit(events.sendLocation, locationData, (acknowledgement) => {
      if (acknowledgement) {
        locationButtonElem.removeAttribute('disabled');
        console.log(acknowledgement);
      }
    });
  });
})
