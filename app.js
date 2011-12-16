var app      = require('express').createServer(),
    io       = require('socket.io').listen(app),
    markdown = require('markdown').markdown.toHTML;

var port = process.env.PORT || 3000;

Array.prototype.remove = function(from, to) {
  var rest = this.slice((to || from) + 1 || this.length);
  this.length = from < 0 ? this.length + from : from;
  return this.push.apply(this, rest);
};

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

  console.log({ connect: socket.id });
  io.sockets.emit('new', { id: socket.id });
  socks.push({ id: socket.id });

  socket.on('disconnect', function () {
    console.log({ disconnect: socket.id });
    io.sockets.emit('remove', { id: socket.id });

    socks.remove(find_sock(socket.id));

    console.log(socks);
  });

  socket.on('update', function (data) {
    console.log({ update: data });
    data.id = socket.id;
    data.text = markdown(data.text);

    io.sockets.emit('update', data);

    socks[find_sock(socket.id)] = data;

    console.log(socks);
  });

  console.log(socks);
});