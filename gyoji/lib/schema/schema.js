var util = require('util'),
  EventEmitter = require('events').EventEmitter;

/**
 * Create schema entity.
 *
 * @param {dynamo} db DynamoDB instance
 * @param {String} tableName Table name
 * @param {Object} schema DynamoDB schema information
 *
 * @constructor
 */
var Schema = module.exports = function (db, tableName, schema) {
  this.table = db.get(tableName);
  this.schema = schema;

  this.__defineGetter__('tableName', function () {
    return tableName;
  });
};
util.inherits(Schema, EventEmitter);

/**
 * Returns a model specified by the given key.
 *
 * @param {Object} key Key object of this schema
 * @param {Function} callback
 */
Schema.prototype.findByKey = function (key, callback) {
  var self = this;

  self.table
    .get(key)
    .fetch(function (err, data) {
      if (err) return callback(err);

      if (!data || data.length === 0) {
        callback(null, null);
      } else if (data.length === 1) {
        callback(null, data[0]);
      } else {
        callback(null, data);
      }
    });
};


