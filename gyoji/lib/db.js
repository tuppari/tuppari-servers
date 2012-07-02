var dynamo = require('dynamo'),
  async = require('async'),
  util = require('util'),
  env = require('../../common/lib/env');

var client = dynamo.createClient({
  accessKeyId: env('AWS_ACCESS_KEY_ID'),
  secretAccessKey: env('AWS_SECRET_ACCESS_KEY')
});

var db = client.get(env('AWS_REGION', 'us-east-1'));

/**
 * Tables.
 *
 * @private
 */
var tables = {};

/*
 * Schemas.
 */

exports.account = schema('account');

/**
 * Returns actual table name from table ID.
 *
 * @private
 */
function actualTableName(tableId) {
  var envKey = util.format('%s_TABLE_NAME', tableId.toUpperCase());
  return env(envKey);
}

/**
 * Returns a new scheme instance.
 */
function schema(tableId) {
  var TableDef = require('./schema/' + tableId);
  var table = new TableDef(db, actualTableName(tableId));
  tables[tableId] = table;
  return table;
}

/**
 * Create DynamoDB tables if not exists.
 *
 * @param {String} tableId
 * @param {Object} options
 * @param {Function} callback
 */
function createIfNotExist(tableId, callback) {
  var tableName = actualTableName(tableId);
  var options = { schema: tables[tableId].schema };

  db.get(tableName).fetch(function (err, table) {
    if (err) {
      if (err.name && err.name.indexOf('ResourceNotFoundException') !== -1) {
        console.log('Create request for tableId = %s, options = %s', tableId, options);
        console.log('Actual table name is %s.', tableName);

        options.name = tableName;
        db.add(options).save(function (err, table) {
          if (err) return callback(err);

          table.watch(function (err, table) {
            if (err) return callback(err);
            if (table.TableStatus === 'ACTIVE') {
              console.log('%s is activated.', tableName);
              callback();
            }
          });
        });
      } else {
        return callback(err);
      }
    } else {
      callback(null, table);
    }
  });
}

/**
 * Create DynamoDB tables for tuppari.
 *
 * @param {Function(err, table)} callback
 */
exports.createTables = function (callback) {
  async.forEachSeries(
    Object.keys(tables),
    function (tableId, next) {
      createIfNotExist(tableId, function (err, table) {
        next(err, table);
      });
    },
    callback
  );
};

/**
 * Delete all DynamoDB tables for tuppari.
 *
 * @param {Function(err, table)} callback
 */
exports.deleteTables = function (callback) {
  async.forEachSeries(
    Object.keys(tables),
    function (tableId, next) {
      var tableName = actualTableName(tableId);
      db.remove(tableName, function (err) {
        if (err) return next(err);
        console.log('Delete table name = %s', tableName);
        next();
      });
    },
    callback
  );
};