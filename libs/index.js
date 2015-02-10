var Update = require('./update.js'),
    Log = require("./log/");

var Crucial = function() {
  log = new Log(true, true, true);
  update = new Update(log);
};

var mongoose = function(Schema, options) {
  // If update method is not defined, add it.
  if( ! Schema.methods["update"]) {
    Schema.methods.update = update.createMongooseMethod(Schema);
  }

  // If delete method is not defined, add it.
  if( ! Schema.methods["delete"]) {
    //Schema.methods.delete = remove.createMongooseMethod(Schema);
  }

  // If sanitize method is not defined, add it.
  if( ! Schema.methods["delete"]) {
    //Schema.methods.sanitize = sanitize.createMongooseMethod(Schema);
  }
};


/* ************************************************** *
 * ******************** Public API
 * ************************************************** */

Crucial.prototype.mongoose = mongoose;

exports = module.exports = new Crucial();
exports = Crucial;