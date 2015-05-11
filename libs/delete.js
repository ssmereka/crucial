/* ************************************************** *
 * ******************** Constructor & Globals
 * ************************************************** */

var config,
  log;

var Delete = function(_config, _log) {
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
 * Create and return a method to validate and update a
 * mongoose schema object instance.  Attach this method
 * to the mongoose schema.
 */
var createDeleteMongooseMethod = function(schema) {
  log.t("Create mongoose delete method.");

  return deleteMethod;
};

/**
 * Update an object's properties based on user input.
 * The update method validates user input by looping
 * through each validation method in the updateMethod list.
 * Finally the object is saved if changes were made.
 */
var deleteMethod = function(userId, next) {
  var obj = this;

  log.t("User "+userId+" is deleting schema object.");

  if(obj[config.delete.deletedPropertyName] === false) {
    var update = {};
    update[config.delete.deletedPropertyName] = true;
    obj.update(update, userId, next);
  } else {
    log.t("Object is already deleted.");
    next(undefined, obj);
  }
};

/**
 * Create and return a method to validate and update a
 * mongoose schema object instance.  Attach this method
 * to the mongoose schema.
 */
var createUndeleteMongooseMethod = function(schema) {
  log.t("Create mongoose undelete method.");

  return undelete;
};

/**
 * Update an object's properties based on user input.
 * The update method validates user input by looping
 * through each validation method in the updateMethod list.
 * Finally the object is saved if changes were made.
 */
var undelete = function(userId, next) {
  var obj = this;

  log.t("User "+userId+" is undeleting schema object.");

  if(obj[config.delete.deletedPropertyName] === true) {
    var update = {};
    update[config.delete.deletedPropertyName] = false;
    obj.update(update, userId, next);
  } else {
    log.t("Object is already undeleted.");
    next(undefined, obj);
  }
};


/* ************************************************** *
 * ******************** Public API
 * ************************************************** */

Delete.prototype.createDeleteMongooseMethod = createDeleteMongooseMethod;
Delete.prototype.createUndeleteMongooseMethod = createUndeleteMongooseMethod;

exports = module.exports = Delete;
exports = Delete;