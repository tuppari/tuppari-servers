var crypto = require('crypto'),
  qs = require('querystring'),
  url = require('url'),
  sign = require('tuppari').sign;

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
exports.isValidRequest = function (req, auth, secretKey, body) {
  var headers = req.headers;
  var authorization = headers['authorization'];

  if (!authorization) {
    return false;
  }

  if (!auth.signedHeaders || auth.signedHeaders.length === 0) {
    return false;
  }

  var requestDateTime = Date.parse(headers['x-tuppari-date']);
  if (isNaN(requestDateTime)) {
    return false;
  }
  var requestDate = new Date(requestDateTime);

  var method = req.method;
  var uri = url.parse(req.url);
  var hostname = headers['host'];
  var path = uri.pathname;
  var query = uri.query;

  var signedHeaders = {};
  var i, len, k, v;
  for (i = 0, len = auth.signedHeaders.length; i < len; ++i) {
    k = auth.signedHeaders[i];
    v = headers[k];
    if (!v) {
      return false;
    }
    signedHeaders[k] = v;
  }

  var result = sign.createAuthorizationHeader(method, hostname, path, query, signedHeaders, body, requestDate, auth.credential, secretKey);
  console.log(result);

  return authorization === result;
};

exports.parseAuthorizationHeader = function (req) {
  var authorization = req.headers['authorization'];
  if (!authorization) {
    return {};
  }

  var v = authorization.split(' ');
  console.log(v);
  var algorithm = v[0];
  var params = splitAuthParam(v[1]);

  return {
    algorithm: algorithm,
    credential: params['Credential'],
    signedHeaders: params['SignedHeaders'].split(';'),
    signature: params['Signature']
  };
}

function splitAuthParam(authParam) {
  var params = authParam.split(',');
  var result = {};
  var i, len, p, v;
  for (i = 0, len = params.length; i < len; ++i) {
    p = params[i];
    v = p.split('=');
    result[v[0]] = v[1];
  }
  return result;
}
