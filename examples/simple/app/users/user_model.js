module.exports = function(app, config) {

  // Get the crucial plugin
  //var crucial = require('crucial');
  var crucial = require((require('path')).resolve('../../libs/index.js'));


  var db = require("mongoose"),   // Get the connected database object.
      Schema = db.Schema,         // Mongoose schema object for Mongo DB documents.
      ObjectId = Schema.ObjectId; // Object ID used in mongoose schemas

  // Define the user schema in the database.
  var User = new db.Schema({
    activated: { type: Boolean, default: false },
    dateCreated: { type: Date, default: Date.now },
    roles: [{ type: ObjectId }],
    username: String,
    passwordHash: String
  });

  // Add addition fields and methods to this schema to
  // create, read, update, and delete schema objects.
  User.plugin(crucial.mongoose);

  // Export the user schema into the database object.
  db.model('User', User);
};