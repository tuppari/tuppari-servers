var EventEmitter = require('events').EventEmitter,
  util = require('util'),
  aws2js = require('aws2js'),
  env = require('../../common/lib/env');

var accessKeyId = env('AWS_ACCESS_KEY_ID');
var secretAccessKey = env('AWS_SECRET_ACCESS_KEY');
var topicArn = env('SNS_TOPIC_ARN');

var sns = aws2js.load('sns', accessKeyId, secretAccessKey);
sns.setRegion(env('AWS_REGION', 'us-east-1'));

/**
 * Message publisher wrapper
 *
 * @constructor
 */
var Publisher = module.exports = function () {
  var self = this;
  EventEmitter.call(self);
}
util.inherits(Publisher, EventEmitter);

/**
 * Publish data.
 *
 * @param {String} applicatioId The application Id
 * @param {String} channelName The channel name to publish
 * @param {String} eventName The event name to publish
 * @param {Object} data Data to publish
 */
Publisher.prototype.publish = function (applicationId, channelName, eventName, data, callback) {
  var self = this;

  var key, val, message;

  key = [ applicationId, channelName, eventName].join(':');
  val = data;
  if (typeof data !== 'string') {
    val = JSON.stringify(data);
  }
  message = {
    key: key,
    message: val
  };

  this.emit('log', 'Pub::publish', key, val);

  sns.request('Publish', {
    Message: JSON.stringify(message),
    TopicArn: topicArn
  }, function (err, response) {
    if (err) {
      callback(err);
    } else {
      callback(null, response);
    }
  });
};