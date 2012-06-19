var Router = require('router-line').Router,
  package = require('../package.json'),
  env = require('../../common/lib/env'),
  pubsub = require('../../common/lib/pubsub'),
  parse = require('./parse'),
  redis = require('redis'),
  uuid = require('node-uuid');

console.log(redis);

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
  parse.json(req, res, function (body) {
    var accountName = body.accountName,
      password = body.password;

    res.json({
      id: accountName
    });

    /*
    if (!required(accountName) || !required(passwd)) {
      return res.badRequest('Account name and password is required.');
    }

    if (!minlen(accountName, 3)) {
      return res.badRequest('Account length must be greater than 3.');
    }

    if (!minlen(passwd, 6)) {
      return res.badRequest('Password length must be greater than 6.');
    }

    db.account.exists(accountName, function (exist) {
      if (exist) {
        res.badRequest(accountName + ' is already exists.');
      } else {
        db.account.regist(accountName, passwd, function (err, account) {
          if (err) {
            console.error(err);
            res.json(500, 'Unexpeced error');
          } else {
            res.json({
              id: account.id
            });
          }
        });
      }
    });
    */
  });
});

/**
 * Login API endpoint.
 * Login with posted credentials.
 *
 * @url POST /accounts/auth
 */
router.add('POST', '/accounts/auth', function (req, res) {
  parse.json(req, res, function (body) {
    var accountName = body.accountName,
      password = body.password;

    var credentialId = uuid.v1();
    var credentialSecret = uuid.v4();

    res.json({
      id: accountName,
      credentials: {
        id: credentialId,
        secret: credentialSecret
      }
    });
  });
});

/**
 * Application create API endpoint.
 * Create a new application.
 *
 * @url POST /apps
 */
router.add('POST', '/apps', function (req, res) {
  parse.json(req, res, function (body) {
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
