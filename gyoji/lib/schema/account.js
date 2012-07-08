var Schema = require('./schema'),
  util = require('util'),
  crypto = require('crypto'),
  uuid = require('node-uuid'),
  passwd = require('../passwd');

/**
 * Account table.
 *
 * @constructor
 */
var Account = module.exports = function (db, tableName) {
  Schema.call(this, db, tableName, {
    id: String
  });
};
util.inherits(Account, Schema);

/**
 * Create a new account.
 *
 * @param {String} accountId Account ID to create.
 * @param {String} password Account password
 * @param {Function} callback
 */
Account.prototype.create = function (accountId, password, callback) {
  var self = this;

  self.exists(accountId, function (exist) {
    if (exist) {
      callback(new Error(util.format('%s is already exists.', accountId)));
    } else {
      var salt = crypto.randomBytes(32).toString('hex');
      passwd.stretch(password, salt, function (err, credentials) {
        if (err) return callback(err);

        var now = Date.now();

        var account = {
          id: accountId,
          salt: salt,
          credentials: credentials,
          createdAt: now,
          updatedAt: now
        };

        self.table.put(account).save(function (err) {
          if (err) return callback(err);
          callback(null, account);
        });
      });
    }
  });
};

/**
 * Returns account is exist or not.
 *
 * @param accountId Account ID to find
 * @param callback
 */
Account.prototype.exists = function (accountId, callback) {
  this.find(accountId, function (err, data) {
    callback(!!data);
  });
};

/**
 * Find account by account ID.
 *
 * @param accountId Account Id to find
 * @param callback
 */
Account.prototype.find = function (accountId, callback) {
  var key = {
    id: accountId
  };
  return this.findByKey(key, callback);
};

/**
 * Return login success or failed.
 *
 * @param {String} accountId Account ID to login
 * @param {String} password Account password
 * @param {Function(err, account)} , accoucallback
 */
Account.prototype.login = function (accountId, password, callback) {
  var self = this;

  self.find(accountId, function (err, account) {
    if (err) return callback(err);

    stretch(password, account.salt, function (err, credentials) {
      if (err) return callback(err);

      if (account.credentials === credentials) {
        callback(null, account);
      } else {
        callback(new Error('Credentials not match'));
      }
    });
  });
};