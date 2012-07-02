/*
 * Validation
 */

/**
 * Check required.
 *
 * @param v
 * @return {*}
 */
exports.required = function (v) {
  return v !== null && v !== undefined;
};

exports.minlen = function (v, len) {
  if (!v || typeof v !== 'string') {
    return false;
  }
  return v.length >= len;
};