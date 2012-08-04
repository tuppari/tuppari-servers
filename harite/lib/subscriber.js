var EventEmitter = require('events').EventEmitter,
  util = require('util'),
  SNSClient = require('aws-snsclient');

/*
 * Message subscriber wrapper
 *
 * @constructor
 */
function Subscriber() {
  var self = this;

  var client = SNSClient(function (sns) {
    self.emit('log', 'Subscribe:sns', sns);

    var notification, key, keys, message;
    try {
      notification = JSON.parse(sns.Message);
      key = notification.key;
      message = notification.message;
      self.emit('log', 'Subscribe:message', key, message);
      self.emit('message', key, message);
    } catch (e) {
      self.emit('error', e);
    }
  });

  self.client = client;

  EventEmitter.call(self);
}
util.inherits(Subscriber, EventEmitter);

/**
 * Handle Amazon SNS request.
 *
 * @param {http.ServerRequest} req
 * @param {http.ServerResponse} res
 */
Subscriber.prototype.handleRequest = function (req, res) {
  return this.client(req, res);
};

module.exports = Subscriber;