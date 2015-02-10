var Purge = require("./purge.js"),
    Delete = require("./delete.js"),
    Sanitize = require("./sanitize.js"),
    Update = require('./update.js'),
    Log = require("./log/");

var log,
    purge,
    remove,
    sanitize,
    update;

/**
 * Constructor to configure a new crucial instance.
 * @param config is an object used to configure how Crucial will work.
 */
var Crucial = function(config) {
  setConfig(config);
};

/**
 * Configure Crucial using a special config object.
 * @param config is an object used to configure how Crucial will work.
 */
var setConfig = function(config) {
  log = new Log(config.debug, config.trace, config.error);
  purge = new Purge(config, log);
  remove = new Delete(config, log);
  sanitize = new Sanitize(config, log);
  update = new Update(config, log);
};

/**
 * A Mongoose plugin used to add methods to a Schema object.
 * If a method already exists it will not be overridden.
 * @param Schema is a database object used to interact with a Mongo DB database.
 * @param options is the schema's current options/configurations object.
 */
var mongoose = function(Schema, options) {
  // If update method is not defined, add it.
  if( ! Schema.methods["update"]) {
    Schema.methods.update = update.createMongooseMethod(Schema);
  }

  // If delete method is not defined, add it.
  if( ! Schema.methods["delete"]) {
    Schema.methods.delete = remove.createDeleteMongooseMethod(Schema);
  }

  // If undelete method is not defined, add it.
  if( ! Schema.methods["undelete"]) {
    Schema.methods.undelete = remove.createUndeleteMongooseMethod(Schema);
  }

  // If purge method is not defined, add it.
  if( ! Schema.methods["purge"]) {
    Schema.methods.purge = purge.createMongooseMethod(Schema);
  }

  // If sanitize method is not defined, add it.
  if( ! Schema.methods["sanitize"]) {
    Schema.methods.sanitize = sanitize.createMongooseMethod(Schema);
  }
};


/* ************************************************** *
 * ******************** Public API
 * ************************************************** */

Crucial.prototype.mongoose = mongoose;
Crucial.prototype.setConfig = setConfig;

exports = module.exports = new Crucial(require("../config/index.js"));
exports = Crucial;