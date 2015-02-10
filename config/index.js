var path = require("path");

var debug = (process.env.CRUCIAL_DEBUG && (process.env.CRUCIAL_DEBUG === true || process.env.CRUCIAL_DEBUG.toLowerCase() === "true")) ? true : false,
    trace = (process.env.CRUCIAL_TRACE && (process.env.CRUCIAL_TRACE === true || process.env.CRUCIAL_TRACE.toLowerCase() === "true")) ? true : false,
    error = (process.env.CRUCIAL_ERROR && (process.env.CRUCIAL_ERROR === false || process.env.CRUCIAL_ERROR.toLowerCase() === "false")) ? false : true;

/**
 * Makes the default configuration object available when requiring the file.
 */
exports = module.exports = {

  // Configure the create method attached by default to schema objects.
  "create": {

  },

  // When true, additional logs are displayed by crave.
  "debug": debug,

  // Configure the delete method attached by default to schema objects.
  "delete": {

    // You can choose to mark a schema object as deleted rather
    // than actually deleting it.  This will configure the field name
    // you are using to flag a schema object as deleted.
    deletedPropertyName: "deleted"
  },

  // When true, logs related to error messages are displayed by crave.
  "error": error,

  // Configure the purge method attached by default to schema objects.
  "purge": {

  },

  // Configure the sanitize method attached by default to schema objects.
  "sanitize": {

  },

  // When true, additional trace logs are displayed by crave.
  // Trace messages relate to the events or actions that occur.
  "trace": trace,

  // Configure the update method attached by default to schema objects.
  "update": {

  }

};



