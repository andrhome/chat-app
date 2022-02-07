const express = require('express');
const http = require('http');
const path = require('path');
const app = express();
const port = process.env.PORT || 3000;

const server = http.createServer(app)

const publicDirPath = path.join(__dirname, '../public');

// Setup static directory to serve
app.use(express.static(publicDirPath));

server.listen(port, () => {
  console.log(`Server is up on port ${port}!`);
});

module.exports = server;
