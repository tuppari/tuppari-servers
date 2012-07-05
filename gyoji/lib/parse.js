var crypto = require('crypto'),
  qs = require('querystring');

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
};


/**
 * Validate parameters
 */

/**
 * Return the signature in the request is valid or not.
 *
 * @param {http.Request} Current request
 * @param {String} secretKey Secret access key
 * @param {Object} body Request body
 * @return {Boolean} The signature in the request is valid or not
 */
exports.isValidRequest = function (req, secretKey, body) {
  var sendSignature = req.param('auth_signature');
  var validSignature = exports.sign(req, secretKey, body);

  return sendSignature === validSignature;
};

/**
 * Return signature generated from request, request body and secret key.
 *
 * @param {http.Request} req
 * @param {String} secretKey
 * @param {Object} body
 * @return {String} signature
 */
exports.sign = function (req, secretKey, body) {
  var params = {
    public_key: req.param('public_key'),
    auth_timestamp: req.param('auth_timestamp'),
    auth_version: req.param('auth_version')
  };

  if (body) {
    params.body_hash = crypto.createHash('md5').update(JSON.stringify(body), 'utf8').digest('hex');
  }

  var queryString = qs.stringify(params);
  var signData = [ req.method, req.pathname, queryString ].join('\n');

  console.log(params);
  var signature = crypto.createHmac('sha256', secretKey).update(signData).digest('hex');
  console.log(signature);

  return signature;
};
