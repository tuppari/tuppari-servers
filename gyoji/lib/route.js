var Router = require('router-line').Router,
  parse = require('./parse'),
  redis = require('redis'),
  uuid = require('node-uuid'),
  package = require('../package.json'),
  env = require('../../common/lib/env'),
  pubsub = require('../../common/lib/pubsub'),
  validation = require('./validation'),
  db = require('./db')
;

var router = module.exports = new Router();

if (env('NODE_ENV') !== 'production') {
  redis.debug_mode = true;
}
var pub = new pubsub.Pub(redis, env('REDIS_URL'));

/**
 * Return application info.
 */
router.add('GET', '/info', {
  name: package.name,
  version: package.version
});

/**
 * Register API endpoint.
 * Regist a new account and return the account information.
 *
 * @url POST /accounts/register
 */
router.add('POST', '/accounts/register', function (req, res) {
  parse.json(req, res, function (err, body) {
    if (err) {
      return res.badRequest(err.message);
    }

    var accountName = body.accountName,
      password = body.password;

    if (!validation.required(accountName) || !validation.required(password)) {
      return res.badRequest('Account name and password is required.');
    }

    if (!validation.minlen(accountName, 3)) {
      return res.badRequest('Account length must be greater than 3.');
    }

    if (!validation.minlen(password, 6)) {
      return res.badRequest('Password length must be greater than 6.');
    }

    db.account.exists(accountName, function (exist) {
      if (exist) {
        res.badRequest(accountName + ' is already exists.');
      } else {
        db.account.create(accountName, password, function (err, account) {
          if (err) {
            console.error(err);
            res.json(500, 'Unexpeced error');
          } else {
            res.json(account);
          }
        });
      }
    });
  });
});

/**
 * Login API endpoint.
 * Login with posted credentials.
 *
 * @url POST /accounts/auth
 */
router.add('POST', '/accounts/auth', function (req, res) {
  parse.json(req, res, function (err, body) {
    if (err) {
      return res.badRequest(err.message);
    }

    var accountName = body.accountName,
      password = body.password;

    db.account.login(accountName, password, function (err, account) {
      if (err) return res.badRequest(err.message);

      res.json({
        accountName: accountName,
        credentials: {
          id: accountName,
          secret: account.credentials
        }
      });
    });
  });
});

/**
 * Application create API endpoint.
 * Create a new application.
 *
 * @url POST /applications
 */
router.add('POST', '/applications', function (req, res) {
  parse.json(req, res, function (err, body) {
    if (err) {
      return res.badRequest(err.message);
    }

    var accountId = req.param('public_key');
    db.account.find(accountId, function (err, account) {
      if (err) return res.badRequest(err.message);

      if (!parse.isValidRequest(req, account.credentials, body)) {
        return res.badRequest('Invalid signature');
      }

      var applicationName = body.applicationName;

      var applicationId = uuid.v1();
      var accessKeyId = uuid.v4();
      var accessSecretKey = uuid.v4();

      res.json({
        applicationName: applicationName,
        applicationId: applicationId,
        accessKeyId: accessKeyId,
        accessSecretKey: accessSecretKey
      });
    });
  });
});

/**
 * Message publish API endpoint.
 * Publish message to specified channel of specified application.
 *
 * @url POST /messages/[applicationId]
 */
router.add('POST', '/publish/:applicationId', function (req, res) {
  parse.json(req, res, function (body) {
    var applicationId = req.param('applicationId');
    var channelName = body.channelName;
    var eventName = body.eventName;
    var message = body.data;

    pub.publish(applicationId, channelName, eventName, message);

    res.json({
      status: "success"
    });
  });
});
