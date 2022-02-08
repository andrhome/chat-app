const generateMessage = (username, text) => ({
  username,
  text,
  time: new Date().getTime()
});

module.exports = {
  generateMessage
}
