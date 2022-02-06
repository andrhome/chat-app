const socket = io();

// Elements
const $messageForm = document.querySelector('#messageForm');
const $formInput = $messageForm.querySelector('input');
const $formButton = $messageForm.querySelector('button');
const locationButtonElem = document.querySelector('#send-location');
const $messages = document.querySelector('#messages');

// Templates
const messageTemplate = document.querySelector('#message-template').innerHTML;
const locationTemplate = document.querySelector('#location-template').innerHTML;

// Options
const  { username, room } = Qs.parse(location.search, { ignoreQueryPrefix: true });

socket.on('message', (message) => {
  const html = Mustache.render(messageTemplate, {
    message: message.text,
    time: moment(message.createdAt).format('hh:mm a')
  });
  $messages.insertAdjacentHTML('beforeend', html);
});

$messageForm.addEventListener('submit', (ev) => {
  ev.preventDefault();

  $formButton.setAttribute('disabled', 'disabled');

  const message = ev.target.elements.message.value;

  socket.emit('sendMessage', message, (error) => {
    $formButton.removeAttribute('disabled');
    $formInput.value = '';
    $formInput.focus();

    if (error) {
      return console.log(error);
    }

    console.log('Message delivered!');
  });
});

socket.on('locationMessage', (message) => {
  const html = Mustache.render(locationTemplate, {
    url: message.text,
    time: moment(message.createdAt).format('hh:mm a')
  });
  $messages.insertAdjacentHTML('beforeend', html);
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
    socket.emit('sendLocation', locationData, (acknowledgement) => {
      if (acknowledgement) {
        locationButtonElem.removeAttribute('disabled');
        console.log(acknowledgement);
      }
    });
  });
})

socket.emit('join', { username, room });
