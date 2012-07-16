var Schema = require('./schema'),
  util = require('util'),
  uuid = require('node-uuid');

/**
 * Application table.
 *
 * @constructor
 */
var Application = module.exports = function (db, tableName) {
  Schema.call(this, db, tableName, {
    accountId: String,
    name: String
  });
};
util.inherits(Application, Schema);

/**
 * Create a new application.
 *
 * @param {String} ownerAccount Application owner account ID
 * @param {String} applicationName The application name you want to create
 * @param {Function(err, application)} callback
 */
Application.prototype.create = function (ownerAccountId, applicationName, callback) {
  var self = this;

  self.find(ownerAccountId, applicationName, function (err, app) {
    if (err) return callback(err);

    console.log(app);

    if (app) {
      return callback(new Error(util.format('application [%s:%s] is already exists', ownerAccountId, applicationName)));
    }

    var now = Date.now();

    var application = {
      accountId: ownerAccountId,
      name: applicationName,
      applicationId: uuid.v1(),
      createdAt: now,
      updatedAt: now
    };

    self.table.put(application).save(function (err) {
      if (err) return callback(err);
      callback(null, application);
    });
  });
};

/**
 * Find application of the account.
 *
 * @param {String} ownerAccountId Application owner account ID
 * @param {String} applicationName The name of t he applciation
 * @param {Function(err, application)} callback
 */
Application.prototype.find = function (ownerAccountId, applicationName, callback) {
  var key = {
    accountId: ownerAccountId,
    name: applicationName
  };
  this.findByKey(key, callback);
};

/**
 * List application of the account.
 *
 * @param {String} ownerAccountId Application owner account ID
 * @param {Function(err, applications)} callback
 */
Application.prototype.list = function (accountId, callback) {
  this
    .table
    .query({
      accountId: accountId
    })
    .fetch(callback);
};
