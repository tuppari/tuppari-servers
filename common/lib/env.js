/**
 * Returns a value related by given key.
 * This method search following priority.
 *
 * 1. NPM package config
 * 2. NPM config
 * 3. process.env
 *
 * @param {String} key Environment key
 * @param {String} [defaultValue] Default value if key not found.
 * @return {String}
 */
module.exports = function (key, defaultValue) {
  var NPM_PACKAGE_PREFIX = 'npm_package_config_';
  var NPM_PREFIX = 'npm_config_';

  var value = process.env[NPM_PACKAGE_PREFIX + key];
  if (!value) {
    value = process.env[NPM_PREFIX + key];
    if (!value) {
      value = process.env[key];
    }
  }

  value = (!value && defaultValue) ? defaultValue : value;

  if (process.env.NODE_ENV !== 'production') {
    console.log('%s=%s', key, value);
  }
  return value;
};