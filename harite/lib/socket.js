var
  util = require('util'),
  uuid = require('node-uuid'),
  EventEmitter = require('events').EventEmitter,
  pubsub = require('../../common/lib/pubsub');

/**
 * WebSocket wrapper class.
 *
 * @constructor
 */
var Socket = module.exports = function (manager, client) {
  var self = this;

  client.on('message', function (message) {
    self._parse(message, function (err, event, applicationId, data) {
      if (err) {
        // ignore error
        self.emit('log', 'error', err);
        return;
      }
      self.emit('log', 'Socket::message', event, applicationId, data);
      self.emit(event, applicationId, data);
    });
  });

  client.on('close', function() {
    manager.disconnect(self, function () {
      self.emit('close');
    });
  });

  self.id = uuid.v1().toString();
  self.manager = manager;
  self.client = client;
};
util.inherits(Socket, EventEmitter);

/**
 * Send message via managed client.
 *
 * @param {String} message Message to send
 */
Socket.prototype.send = function (message, callback) {
  this.client.send(message, callback);
};

/**
 * Send object as JSON string via managed client.
 *
 * @param {Object} obj Object to send
 */
Socket.prototype.json = function (obj, callback) {
  this.send(JSON.stringify(obj), callback);
};

/**
 * Join on specified room.
 *
 * @param {String} applicationId
 * @param {String} channelName
 * @param {String} eventName
 */
Socket.prototype.join = function (applicationId, channelName, eventName) {
  var room = pubsub.makeKey(applicationId, channelName, eventName);
  this.emit('log', 'Socket::join', room);
  this.manager.addToRoom(room, this.id);
};

/**
 * Leave from specified room.
 *
 * @param {String} applicationId
 * @param {String} channelName
 * @param {String} eventName
 */
Socket.prototype.leave = function (applicationId, channelName, eventName) {
  var room = pubsub.makeKey(applicationId, channelName, eventName);
  this.emit('log', 'Socket::leave', room);
  this.manager.removeFromRoom(room, this.id);
};

/**
 * Parse message.
 *
 * @private
 */
Socket.prototype._parse = function (message, callback) {
  try {
    var command = JSON.parse(message),
      event = command.event,
      applicationId = command.applicationId,
      data = command.data;

    this.emit('log', 'Socket::_parse', message, command);

    if (event && applicationId) {
      callback(null, event, applicationId, data);
    } else {
      callback(new Error('Required parameter not specified'));
    }
  } catch (err) {
    callback(err);
  }
};