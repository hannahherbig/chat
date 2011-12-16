var app = require('express').createServer(),
     io = require('socket.io').listen(app);

var port = process.env.PORT || 3000;
app.listen(port, function() { console.log("Listening on " + port); });

app.get('/', function (req, res) {
  res.sendfile(__dirname + '/index.html');
});

socks = {};

io.sockets.on('connection', function (socket) {
  for (var i in socks) {
    socket.emit('new',    { id: i });
    socket.emit('update', { id: i, text: socks[i] });
  }

  io.sockets.emit('new', { id: socket.id });
  socks[socket.id] = "";

  socket.on('disconnect', function () {
    io.sockets.emit('remove', { id: socket.id });
  });

  socket.on('update', function (data) {
    io.sockets.emit('update', { id: socket.id, text: data.text });
    socks[socket.id] = data.text;
  });
});