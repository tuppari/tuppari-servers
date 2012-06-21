/*
 * Redis Pub/Sub wrapper
 */

var url = require('url'),
    util = require('util'),
    EventEmitter = require('events').EventEmitter;

/**
 * Create redis client from Redis URL Schema like 'redis://username:password@host:1234/'.
 *
 * @param {String} redisUrl Redis URL schema to connect.
 * @param {Object} [options] Option parameters pass to redis client
 * @param {Function(err, client)} [authCallback] Callback function when called client auth success or failed.
 * @return {redis.Client} Redis client instance
 */
function createClient(redis, redisUrl, options, authCallback) {
  options = options || { max_attempts: 10 };
  var uri = parseRedisUrl(redis, redisUrl);
  var client = new redis.createClient(uri.port, uri.host, options);
  if (uri.pass) {
    client.auth_path = uri.pass;
    client.auth_callback = authCallback || function (err, res) { if (err) return client.emit('error', err); };
  }

  return client;
}

function parseRedisUrl(redis, redisUrl) {
  var redisUri, options;

  redisUri = url.parse(redisUrl);
  options = {
    host: redisUri.hostname,
    port: redisUri.port || 6379
  };

  if (redisUri.auth && redisUri.auth.split(':').length === 2) {
    options.pass = redisUri.auth.split(':')[1];
  }

  if (redis.debug_mode) {
    console.log('Connected to redis: %s', redisUrl);
    console.log(options);
  }

  return options;
}

/**
 * Make unique key from applicationId, channelName and eventName.
 *
 * @param applicationId
 * @param channelName
 * @param eventName
 */
function makeKey(applicationId, channelName, eventName) {
  return util.format('%s:%s:%s', applicationId, channelName, eventName);
}

function splitKey(key) {
  return key.split(':');
}

/**
 * Message publisher wrapper
 *
 * @param {Object} redis Redis module instance
 * @param {String} redisUrl Redis URL to connect
 * @constructor
 */
var Pub = exports.Pub = function (redis, redisUrl) {
  var self = this;

  var client = createClient(redis, redisUrl);

  client.on('error', function (err) {
    self.emit('error', err);
  });

  self.client = client;

  EventEmitter.call(self);
}
util.inherits(Pub, EventEmitter);

/**
 * Publish data.
 *
 * @param {String} applicatioName The application name to publish
 * @param {String} channelName The channel name to publish
 * @param {String} eventName The event name to publish
 * @param {Object} data Data to publish
 */
Pub.prototype.publish = function (applicationId, channelName, eventName, data) {
  if (this.client && this.client.connected) {
    var key = makeKey(applicationId, channelName, eventName);
    var val = data;
    if (typeof data === 'object') {
      val = JSON.stringify(data);
    }
    this.emit('log', 'Pub::publish', key, val);
    this.client.publish(key, val);
  }
};

/**
 * Close publish connection.
 *
 * @param {Function} callback Callback function called connection closed.
 */
Pub.prototype.close = function (callback) {
  var self = this,
    client = self.client;

  if (client && client.connected) {
    client.quit();
    client.on('end', function () {
      callback();
    });
  } else {
    callback();
  }
};

/**
 * Return redis client is connected or not.
 */
Pub.prototype.isConnected = function () {
  return this.client && this.client.connected;
};

/**
 * Return retry count is not get max retry attempts.
 */
Pub.prototype.canRetry = function () {
  return this.client && this.client.attempts < this.client.max_attempts;
};

/**
 * Message subscriber wrapper
 *
 * @param {Object} redis Redis module instance
 * @param {String} redisUrl Redis URL to connect
 * @constructor
 */
var Sub = exports.Sub = function (redis, redisUrl) {
  var self = this;

  var client = createClient(redis, redisUrl);

  client.on('error', function (err) {
    self.emit('error', err);
  });

  client.on('message', function (key, message) {
    var keys = splitKey(key);
    self.emit('message', keys[0], keys[1], keys[2], message);
  });

  self.client = client;

  EventEmitter.call(self);
}
util.inherits(Sub, EventEmitter);

/**
 * Close connection.
 *
 * @param {Function} callback Callback function called connection closed.
 */
Sub.prototype.close = function (callback) {
  var self = this,
    client = self.client;

  if (client && client.connected) {
    client.quit();
    client.on('end', function () {
      self.emit('close');
      callback();
    });
  } else {
    callback();
  }
};

/**
 * Return redis client is connected or not.
 */
Sub.prototype.isConnected = function () {
  return this.client && this.client.connected;
};

/**
 * Return retry count is not get max retry attempts.
 */
Sub.prototype.canRetry = function () {
  return this.client && this.client.attempts < this.client.max_attempts;
};

/**
 * Subscribe specified event.
 *
 * @param {Striing} eventName Subscribe event name
 */
Sub.prototype.bind = function (applicationId, channelName, eventName) {
  var key = makeKey(applicationId, channelName, eventName);
  this.emit('log', 'Sub::bind', key);
  this.client.subscribe(key);
};

/*
 * Pub/Sub key generation methods
 */

exports.makeKey = makeKey;

exports.splitKey = splitKey;