/* ************************************************** *
 * ******************** Constructor & Globals
 * ************************************************** */

var config,
    log,
    _ = require('lodash');

var Purge = function(_config, _log) {
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
 * Create and return a method to remove an existing
 * mongoose schema object from the database.  Attach
 * this method to a mongoose schema.
 */
var createMongooseMethod = function(schema) {
  log.t("Create mongoose purge method.");
  //log.t("%s", JSON.stringify(schema, undefined, 2));

  return purge;
};

/**
 * Delete an object from the database and track
 * the user who did it.
 */
var purge = function(userId, next) {
  next = (next) ? next : function(err) {
    if(err) {
      log.e(err);
    }
  };

  var obj = this;

  if( ! _.isObject(obj)) {
    next(new Error("Cannot purge an undefined or invalid object."));
  } else {
    obj.remove(next);
  }
};


/* ************************************************** *
 * ******************** Public API
 * ************************************************** */

Purge.prototype.createMongooseMethod = createMongooseMethod;

exports = module.exports = Purge;
exports = Purge;