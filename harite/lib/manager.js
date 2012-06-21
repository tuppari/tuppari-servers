var
  WebSocketServer = require('ws').Server,
  util = require('util'),
  EventEmitter = require('events').EventEmitter,
  Socket = require('./socket'),
  pubsub = require('../../common/lib/pubsub');

/**
 * Socket management class.
 *
 * @constructor
 */
var Manager = module.exports = function (server, options, callback) {
  var self = this;

  callback = callback || function () {};
  options = options || {};

  options.server = server;
  var wss = new WebSocketServer(options, callback);

  wss.on('connection', function (client) {
    var socket = new Socket(self, client);
    self.sockets[socket.id] = socket;
    self.emit('connection', socket);
  });

  wss.on('error', function (err) {
    self.emit('error', err);
  });

  self.server = server;
  self.options = options;
  self.webSocketServer = wss;

  self.sockets = {};
  self.rooms = {};
};
util.inherits(Manager, EventEmitter);

/**
 * Handle socket disconnect event.
 *
 * @param {Socket} socket Disconnected socket
 */
Manager.prototype.disconnect = function (socket, callback) {
  var self = this;
  var keys = Object.keys(self.rooms);

  for (var i = 0, l = keys.length; i < l; i++) {
    self.removeFromRoom(keys[i], socket);
  }

  delete self.sockets[socket.id];

  callback();
};

/**
 * Add a socket to specified room.
 *
 * @param {String} roomName A room name to add
 * @param {String} ID of socket to add
 */
Manager.prototype.addToRoom = function (roomName, socketId) {
  var self = this;
  var rooms = self.rooms;
  rooms[roomName] = rooms[roomName] || {};
  rooms[roomName][socketId] = true;
};

/**
 * Remove the socket from specified room.
 *
 * @param {String} roomName A room name to remove.
 * @param {String} socketId ID of socket to remove.
 */
Manager.prototype.removeFromRoom = function (roomName, socketId) {
  var self = this;
  var room = self.rooms[roomName];

  if (room) {
    delete room[socketId];
  }
};

/**
 * Broadcast message to sockets in the specified room.
 *
 * @param {String} roomName Room name to broadcast.
 * @param {String} eventName Event name.
 * @param {Object} message Message to broadcast.
 */
Manager.prototype.broadcast = function (roomName, message) {
  function ignoreError(err) { /* always volatile message, so ignore error. */ };

  this.emit('log', 'Manager::broadcast', roomName, message);

  if (this.rooms[roomName]) {
    var sockets = this.sockets;
    var keys = Object.keys(this.rooms[roomName]);
    var key, socket, msg, i, l;

    for (i = 0, l = keys.length; i < l; i++) {
      key = keys[i];
      socket = sockets[key];
      msg = {
        room: roomName,
        message: message
      };

      socket.json(msg, ignoreError);
    }
  }
};