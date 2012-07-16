var Schema = require('./schema'),
  util = require('util'),
  uuid = require('node-uuid')
;

/**
 * Keypair table.
 *
 * @constructor
 */
var Keypair = module.exports = function (db, tableName) {
  Schema.call(this, db, tableName, {
    applicationId: String,
    accessKeyId: String
  });
};
util.inherits(Keypair, Schema);

/**
 * Create a new keypair.
 *
 * @param {String} applicationId The owner application ID of the keypair
 * @param {Function} callback
 */
Keypair.prototype.create = function (applicationId, callback) {
  var now = Date.now();

  var keypair = {
    applicationId: applicationId,
    accessKeyId: uuid.v4(),
    accessSecretKey: uuid.v4(),
    createdAt: now,
    updatedAt: now
  };

  this.table.put(keypair).save(function (err) {
    if (err) return callback(err);
    callback(null, keypair);
  });
};

/**
 * Find keypair by applicationId and accessKeyId
 *
 * @param {String} applicationId The owner application ID of the keypair
 * @param {String} accessKeyId The access key id
 * @param {Function(err, keypair)}callback
 */
Keypair.prototype.find = function (applicationId, accessKeyId, callback) {
  var key = {
    applicationId: applicationId,
    accessKeyId: accessKeyId
  };
  return this.findByKey(key, callback);
};

/**
 * Find keypair by applicationId array.
 *
 * @param {String} applicationIds The owner application ID array of the keypair
 * @param {Function(err, Array(keypair))}callback
 */
Keypair.prototype.findByApplicationIds = function (applicationIds, callback) {
  if (!applicationIds || applicationIds.length === 0) {
    process.nextTick(function () {
      callback(null, []);
    });
  }

  var pred = {
    applicationId: { 'in': applicationIds }
  };

  this
    .table
    .scan(pred)
    .fetch(callback);
};