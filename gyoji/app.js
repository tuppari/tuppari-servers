var router = require('./lib/route'),
  env = require('../common/lib/env'),
  http = require('http'),
  url = require('url'),
  util = require('util');

var DEBUG = (env('NODE_ENV') !== 'production');
var debug = function() {
  if (DEBUG) {
    var args = Array.prototype.slice.call(arguments, 0);
    console.log.apply(console, args);
  }
};

function eventLogger(eventType) {
  var args = Array.prototype.slice.call(arguments, 1);
  var d = new Date();
  var dateString = util.format('%s-%d-%sT%s:%s:%s.%s', d.getFullYear(), d.getMonth() + 1, d.getDate(), d.getHours(), d.getMinutes(), d.getSeconds(), d.getMilliseconds());
  console.log(dateString, eventType, args);
}

process.on('uncaughtException', function (err) {
  eventLogger('uncaughtException', err.stack);
});

var app = http.createServer(function (req, res) {
  var uri, r, handler;

  res.send = function (status, contentType, body) {
    res.writeHead(status, { 'Content-Type': contentType });
    res.end(body);
  };

  res.json = function (status, obj) {
    if (typeof status !== 'number' && !obj) {
      obj = status;
      status = 200;
    }
    var body = obj ? JSON.stringify(typeof obj === 'string' ? { cause: obj } : obj) : '{}';
    res.send(status, 'application/json', body);
  };

  res.badRequest = function(obj) {
    res.json(400, obj);
  };

  debug(req.method, req.url, req.headers);

  uri = url.parse(req.url, true);
  r = router.route(req.method, uri.pathname);
  if (r) {
    req.param = function (key) {
      return r.params[key] ? r.params[key] : uri.query[key];
    }

    req.pathname = uri.pathname;
    debug('Request path: %s', req.pathname);

    handler = r.value;
    if (typeof handler === 'function') {
      try {
        handler(req, res, r.params);
      } catch (e) {
        res.json(500, { reason: 'Unexpected error', url: req.url });
      }
    } else if (typeof handler === 'string') {
      res.send(200, 'text/plain', handler);
    } else {
      res.json(200, handler);
    }
  } else {
    res.json(404, { reason: 'This not the URL you are looking for', url: req.url });
  }
});

app.listen(env('PORT'), function() {
  eventLogger('server:start', util.format('Gyoji server listen on port %d', app.address().port));
});