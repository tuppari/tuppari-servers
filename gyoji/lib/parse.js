/**
 * Parse POST JSON data.
 * If parse failed, callback is not called and return error response to client.
 *
 * @param {http.ServerRequest} req HTTP request
 * @param {Function(body)} callback
 */
exports.json = function (req, res, callback) {
  req.setEncoding('utf8');
  var body = '';

  var contentType = req.headers['content-type'];
  if (contentType !== 'application/json') {
    res.badRequest('Content-Type must be application/json, but ' + contentType);
  }

  req.on('error', function (err) {
    res.badRequest(err);
  });

  req.on('data', function (chunk) {
    body += chunk;
  });

  req.on('end', function () {
    try {
      var obj = JSON.parse(body);
      callback(obj);
    } catch (e) {
      res.badRequest(e);
    }
  });
}
