var Router = require('router-line').Router,
  redis = require('redis'),
  uuid = require('node-uuid'),
  parse = require('./parse'),
  db = require('./db'),
  package = require('../package.json'),
  env = require('../../common/lib/env'),
  pubsub = require('../../common/lib/pubsub'),
  validation = require('./validation');

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

    if (!validation.required(accountName) || !validation.required(password)) {
      return res.badRequest('Account name and password is required.');
    }

    db.account.login(accountName, password, function (err, account) {
      if (err) {
        return res.json(401, { reason: 'accountName or password is wrong' });
      }

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
 * Applications API endpoint.
 *
 * @url POST /applications
 */
router.add('POST', '/applications', function (req, res) {
  parse.json(req, res, function (err, body) {
    if (err) {
      return res.badRequest(err.message);
    }

    var auth = parse.parseAuthorizationHeader(req);
    var accountId = auth.credential;

    db.account.find(accountId, function (err, account) {
      if (err) return res.badRequest(err.message);

      if (!parse.isValidRequest(req, auth, account.credentials, body)) {
        return res.badRequest('Invalid signature');
      }

      var applicationName = body.applicationName;
      var operation = req.headers['x-tuppari-operation'];

      switch (operation) {
      case 'CreateApplication':
        db.application.create(account.id, applicationName, function (err, app) {
          if (err) return res.badRequest(err.message);

          db.keypair.create(app.applicationId, function (err, keypair) {
            if (err) return res.badRequest(err);

            res.json({
              applicationName: applicationName,
              applicationId: keypair.applicationId,
              accessKeyId: keypair.accessKeyId,
              accessSecretKey: keypair.accessSecretKey
            });
          });
        });
        break;

      case 'ListApplication':
        db.application.list(account.id, function (err, applications) {
          if (err) return res.badRequest(err);

          var appIds = [],
              apps = {},
              keys = {};

          if (!applications || applications.length === 0) {
            return res.json({});
          }

          applications.forEach(function (app) {
            appIds.push(app.applicationId);
          });

          db.keypair.findByApplicationIds(appIds, function (err, keypairs) {
            if (err) return res.badRequest(err);

            keypairs.forEach(function (keypair) {
              keys[keypair.applicationId] = {
                accessKeyId: keypair.accessKeyId,
                accessSecretKey: keypair.accessSecretKey
              };
            });

            applications.forEach(function (app) {
              apps[app.name] = {
                name: app.name,
                applicationId: app.applicationId,
                accessKeyId: keys[app.applicationId].accessKeyId,
                accessSecretKey: keys[app.applicationId].accessSecretKey
              };
            });

            res.json(apps);
          });
        });
        break;

      default:
        return res.badRequest(new Error('Invalid operation "' + operation + '"'));
      }
    });
  });
});

/**
 * Message publish API endpoint.
 * Publish message to specified channel of specified application.
 *
 * @url POST /messages
 */
router.add('POST', '/messages', function (req, res) {
  parse.json(req, res, function (err, body) {
    if (err) {
      return res.badRequest(err.message);
    }

    var auth = parse.parseAuthorizationHeader(req);
    var accessKeyId = auth.credential;

    var applicationId = body.applicationId;
    if (!validation.required(applicationId)) {
      return res.badRequest('appliationId is required');
    }

    db.keypair.find(applicationId, accessKeyId, function (err, keypair) {
      if (err) return res.badRequest(err.message);

      if (!parse.isValidRequest(req, auth, keypair.accessSecretKey, body)) {
        return res.badRequest('Invalid signature');
      }

      var channel = body.channel;
      var event = body.event;
      var message = body.message;

      if (!validation.required(channel) || !validation.required(event)) {
        return res.badRequest('channel and event is required');
      }

      var operation = req.headers['x-tuppari-operation'];

      switch (operation) {
      case 'PublishMessage':
        pub.publish(applicationId, channel, event, message, function (err) {
          if (err) return res.badRequest(err.message);

          res.json({
            applicationId: applicationId,
            channel: channel,
            event: event,
            message: message,
            publishedAt: Date.now()
          });
        });
        break;

      default:
        return res.badRequest(new Error('Invalid operation "' + operation + '"'));
      }
    });
  });

});
