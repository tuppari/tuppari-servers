var
  wss = require('./lib/wss'),
  Subscriber = require('./lib/subscriber'),
  env = require('../common/lib/env'),
  util = require('util'),
  url = require('url'),
  aws2js = require('aws2js');

var debug = (env('NODE_ENV') !== 'production');

function eventLogger(eventType) {
  var args = Array.prototype.slice.call(arguments, 1);
  var d = new Date();
  var dateString = util.format('%s-%d-%sT%s:%s:%s.%s', d.getFullYear(), d.getMonth() + 1, d.getDate(), d.getHours(), d.getMinutes(), d.getSeconds(), d.getMilliseconds());
  console.log(dateString, eventType, args);
}

var hostName = env('HOST_NAME');
var accessKeyId = env('AWS_ACCESS_KEY_ID');
var secretAccessKey = env('AWS_SECRET_ACCESS_KEY');
var topicArn = env('SNS_TOPIC_ARN');
var errorTopicArn = env('ERROR_TOPIC_ARN');

var sns = aws2js.load('sns', accessKeyId, secretAccessKey);
sns.setRegion(env('AWS_REGION', 'us-east-1'));

function errorNotify(subject, message) {
  sns.request('Publish', {
    Subject: util.format('[%s]: %s', hostName, subject),
    Message: message,
    TopicArn: errorTopicArn
  }, function () {});
}

/*
 * WebSocket settings.
 */

var subscriber = new Subscriber();

var io = wss.listen(env('PORT'), function (server, hostName, port) {
  server.on('request', function (req, res) {
    var uri = url.parse(req.url);
    if (req.method === 'POST' && uri.pathname === '/receive') {
      subscriber.handleRequest(req, res);
    } else {
      res.writeHead(200, {
        'Content-Type': 'text/plain'
      });
      res.end('Welcome to tuppari push server.');
    }
  });

  sns.request('Subscribe', {
    Protocol: 'http',
    Endpoint: util.format('http://%s:%d/receive', hostName, port),
    TopicArn: topicArn
  }, function (err, response) {
    if (err) {
      eventLogger('subscribe:error', err);
      server.close();
    } else {
      eventLogger('subscribe:success', response);
    }
  });

  var msg = util.format('harite server listen on %d', port);
  eventLogger('Harite server start', msg);
  errorNotify('Harite server start', msg);
});

io.on('connection', function (socket) {
  socket.on('bind', function (applicationId, data) {
    socket.join(applicationId, data.channelName, data.eventName);
  });

  if (debug) {
    socket.on('log', eventLogger);
  }
});

/*
 * Redis settings.
 */

subscriber.on('error', function (err) {
  eventLogger('subscribe:error', err.stack);
});

subscriber.on('message', function (key, data) {
  io.broadcast(key, data);
});

if (debug) {
  io.on('log', eventLogger);
  subscriber.on('log', eventLogger);
}

process.on('uncaughtException', function (err) {
  eventLogger('uncaughtException', err.stack);
  errorNotify('uncaughtException', err.stack)
});