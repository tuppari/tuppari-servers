var
  wss = require('./lib/wss'),
  Sub = require('../common/lib/pubsub').Sub,
  env = require('../common/lib/env'),
  util = require('util'),
  redis = require('redis');

/*
 * WebSocket settings.
 */

var io = wss.listen(env('PORT'), function (server, hostName, port) {
  console.log('harite server (%s) listen on %d', hostName, port);
});

var sub = new Sub(redis, env('REDIS_URL'));

io.on('connection', function (socket) {
  console.log('connected %s', socket.id);

  socket.on('bind', function (applicationId, data) {
    socket.join(applicationId, data.channelName, data.eventName);
    sub.bind(applicationId, data.channelName, data.eventName);
  });

  socket.on('log', function (eventType) {
    var args = Array.prototype.slice.call(arguments, 1);
    console.log(eventType, args);
  });

});

/*
 * Redis settings.
 */

sub.on('error', function (err) {
  console.error('subscriber error: ' + util.inspect(err, true));
});

sub.on('message', function (applicationId, channelName, eventName, data) {
  var key = applicationId + ':' + channelName + ':' + eventName;
  this.emit('log', 'message', key, data);
  io.broadcast(key, data);
});

io.on('log', function (eventType) {
  var args = Array.prototype.slice.call(arguments, 1);
  console.log(eventType, args);
});

sub.on('log', function (eventType) {
  var args = Array.prototype.slice.call(arguments, 1);
  console.log(eventType, args);
});
