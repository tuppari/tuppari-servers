var
  http = require('http'),
  util = require('util');

exports.Manager = require('./manager');

/**
 * Attaches a manager.
 *
 * @param {HTTPServer/Number} a HTTP server or a port number to listen on.
 * @param {Object} options to be passed to Manager and/or HTTP server.
 * @param {Function} callback if a port is supplied.
 */

exports.listen = function (server, options, callback) {
  if (typeof options === 'function') {
    callback = options;
    options = {};
  }

  if (typeof server === 'string') {
    server = parseInt(server);
  }

  if (typeof server === 'number') {
    var port = server;

    if (options && options.key) {
      server = require('https').createServer(options);
    } else {
      server = require('http').createServer();
    }

    server.on('request', function (req, res) {
      res.writeHead(200, { 'Content-Type': 'text/plain'});
      res.end('Welcome to tuppari push server.');
    });

    server.listen(port, callback);
  }

  return new exports.Manager(server, options);
};