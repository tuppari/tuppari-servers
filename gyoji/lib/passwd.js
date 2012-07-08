var crypto = require('crypto');

/**
 * Stretch password with salt.
 *
 * @param password Raw password to stretch
 * @param salt Password salt
 * @param callback
 */
function stretch(password, salt, callback) {
  crypto.pbkdf2(password, salt, 4096, 32, function (err, key) {
    if (err) return callback(err);
    callback(null, new Buffer(key, 'binary').toString('hex'));
  });
}

exports.stretch = stretch;