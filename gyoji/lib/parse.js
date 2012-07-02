/**
 * Parse POST JSON data.
 * If parse failed, callback is not called and return error response to client.
 *
 * @param {http.ServerRequest} req HTTP request
 * @param {Function(err, body)} callback
 */
exports.json = function (req, res, callback) {
  req.setEncoding('utf8');
  var body = '';

  var contentType = req.headers['content-type'];
  if (contentType !== 'application/json') {
    process.nextTick(function () {
      var msg = 'Content-Type must be application/json, but ' + contentType;
      callback(new Error(msg));
    });
  }

  req.on('error', function (err) {
    callback(err);
  });

  req.on('data', function (chunk) {
    body += chunk;
  });

  req.on('end', function () {
    try {
      var obj = JSON.parse(body);
      callback(null, obj);
    } catch (e) {
      callback(e);
    }
  });
}
