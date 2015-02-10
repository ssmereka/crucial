/* ************************************************** *
 * ******************** Constructor & Globals
 * ************************************************** */

var config,
    log;

var Sanitize = function(_config, _log) {
  initialize(_config, _log);
};

var initialize = function(_config, _log) {
  log = _log;

  if(_config) {
    config = _config;
  } else if( ! config) {
    config = require("../config/index.js")
  }
};

/* ************************************************** *
 * ******************** Private Methods
 * ************************************************** */

/**
 * Create and return a method to remove secret data
 * from mongoose schema object.  Attach this method
 * to a mongoose schema.
 */
var createMongooseMethod = function(schema) {
  log.t("Create mongoose sanitize method.");
  //log.t("%s", JSON.stringify(schema, undefined, 2));

  return function(next) {
    return sanitize(this, next);
  }
};

/**
 * Remove secret data from a mongoose schema object.
 */
var sanitize = function(obj, next) {
  obj = obj.toObject();

  delete obj.__v;
  next(undefined, obj);
};


/* ************************************************** *
 * ******************** Public API
 * ************************************************** */

Sanitize.prototype.createMongooseMethod = createMongooseMethod;

exports = module.exports = Sanitize;
exports = Sanitize;