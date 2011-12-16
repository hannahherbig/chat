var app = require('express').createServer(),
     io = require('socket.io').listen(app);

var port = process.env.PORT || 3000;

socks = [];

app.get('/', function (req, res) {
  res.sendfile(__dirname + '/index.html');
});

app.listen(port, function() { console.log("Listening on " + port); });

io.sockets.on('connection', function (socket) {
  function find_sock(id) {
    for(i in socks)
      if (socks[i].id == id)
        return i;
  }

  for (var i in socks) {
    socket.emit('new',    socks[i]);
    socket.emit('update', socks[i]);
  };

  io.sockets.emit('new', { id: socket.id });
  socks.push({ id: socket.id });

  socket.on('disconnect', function () {
    io.sockets.emit('remove', { id: socket.id });

    socks.splice(find_sock(socket.id), 1);
  });

  socket.on('update', function (data) {
    data.id = socket.id;
    io.sockets.emit('update', data);

    socks[find_sock(socket.id)] = data;
  });
});