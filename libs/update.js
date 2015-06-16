
/* ************************************************** *
 * ******************** Constructor & Globals
 * ************************************************** */

var async = require('async'),
  config,
  log,
  _ = require('lodash');

var hashPattern = /(.*)Hash$/;
var passwordPattern = /^password$/;

var Update = function(_config, _log) {
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
var createMongooseMethod = function(schema) {
  log.t("Create mongoose update method.");
  //log.t("%s", JSON.stringify(schema, undefined, 2));

  // List of validation methods for the schema object.
  var updateMethods = [];

  // Loop through each property in the schema and create a validation method.
  for(var key in schema.paths) {
    if(schema.paths.hasOwnProperty(key)) {
      var type;

      // Get the type of variable
      if(schema.paths[key]["instance"] !== undefined) {
        type = schema.paths[key]["instance"];
      } else if(schema.paths[key].options !== undefined) {
        if(_.isFunction(schema.paths[key].options.type)) {
          var func = schema.paths[key].options.type.toString();
          type = func.substring(9, func.indexOf("("));
        } else if(_.isObject(schema.paths[key].options.type)) {
          type = "Array";
        }

      } else {
        // Unknown type.
        log.d("Update Method:  Type is unknown for key "+key);
      }

      updateMethods.push(makeUpdatePropertyMethod(key, type));
    }
  }

  // Create the virtual attribute map and return the model's new update method.
  return update(updateMethods, createSetVirtualMap(schema));
};

/**
 * Create an object that maps virtual attributes to
 * asynchronous setter methods, if available.
 * @param schema is the Model's schema object.
 * @returns {Object} an object with attributes as keys and setter methods as their values.
 */
var createSetVirtualMap = function(schema) {
  if( ! schema || ! schema.virtuals) {
    return {};
  }

  var virtualMethods = {};

  for(var attribute in schema.virtuals) {
    if(schema.virtuals.hasOwnProperty(attribute)) {
      var methodName = 'set' + capitalizeFirstLetter(attribute);
      if(schema.methods[methodName] != undefined) {
        log.t("Adding virtual method: %s", methodName);
        virtualMethods[attribute] = methodName;
      }
    }
  }

  return virtualMethods;
};

/**
 * Capitalize the first letter of a string and return it.
 * @param {String} s is the string to be capitalized.
 * @returns {string} the capitalized string.
 */
var capitalizeFirstLetter = function(s) {
  return s.charAt(0).toUpperCase() + s.slice(1);
};

/**
 * Update an object's properties based on user input.
 * The update method validates user input by looping
 * through each validation method in the updateMethod list.
 * Finally the object is saved if changes were made.
 */
var update = function(updateMethods, virtualMethodMap) {
  return function(newObj, userId, next) {
    var obj = this,
      originalObject = JSON.parse(JSON.stringify(obj));

    preUpdate(obj, newObj, userId, function(err, newObj) {

      log.t("User " + userId + " is updating schema object.");

      // Set the lastUpdatedBy field
      if(userId) {
        if(userId._id) {
          userId = userId._id;
        }
        obj.lastUpdatedBy = userId;
      }

      obj.lastUpdated = Date.now();

      // Loop through each validation method updating the
      // current object when the user input is valid.
      for(var i = updateMethods.length - 1; i >= 0; --i) {
        obj = updateMethods[i](obj, newObj);
      }

      // Asynchronously call each virtual setter method for any
      // virtual attribute included in the update object.
      var tasks = [];
      for(var key in virtualMethodMap) {
        if(virtualMethodMap.hasOwnProperty(key) && virtualMethodMap[key] !== undefined && newObj[key] !== undefined) {
          tasks.push(updateVirtualMethod(obj, virtualMethodMap[key], newObj[key]));
        }
      }

      // Run the asynchronous tasks.
      async.series(tasks, function(err, results) {
        if(err) {
          next(err);
        } else {

          preSave(originalObject, obj, userId, function(err, obj) {
            if(err) {
              next(err);
            } else {
              obj.save(function(err, obj) {
                if(err) {
                  next(err);
                } else {
                  postSave(originalObject, obj, userId, next);
                }
              });
            }
          });
        }
      });
    });
  };
};

var preUpdate = function(originalObject, newObj, userId, cb) {
  if(originalObject['preUpdate']) {
    originalObject.preUpdate(originalObject, newObj, userId, cb);
  } else {
    cb(undefined, newObj);
  }
};

var preSave = function(originalObject, newObject, user, cb) {
  if(newObject['preSaveUpdate']) {
    newObject.preSaveUpdate(originalObject, newObject, user, cb);
  } else {
    cb(undefined, newObject);
  }
};

var postSave = function(originalObject, newObject, user, cb) {
  if(newObject['postSaveUpdate']) {
    newObject.postSaveUpdate(originalObject, newObject, cb);
  } else {
    cb(undefined, newObject);
  }
};

/**
 * Create an update virtual attribute method for use with
 * the async library.
 * @param obj is the model object to be updated.
 * @param method is the setter method to be called.
 * @param value is the potential new value for the virtual attribute.
 * @returns {Function} the update method.
 */
var updateVirtualMethod = function(obj, method, value) {
  return function (cb) {
    obj[method](value, cb);
  }
};


/**
 * Create a method to update a schema's properties based
 * on each property type (i.e. boolean, string, array, etc).
 * This method validates user input and should perform strong
 * checking.
 *
 * @key is the object's property to be validated.
 * @type is the type of the object's property to be validated.
 *
 * @curObj is the schema object to be updated.
 * @newObj is the user input the schema object will be updated against.
 */
function makeUpdatePropertyMethod(key, type) {
  //log.t("MakeUpdatePropertyMethod: key=" + key + ", type=" + type);
  return function(curObj, newObj) {
    //log.t("Update: \n%s\n%s\n", JSON.stringify(curObj, undefined, 2), JSON.stringify(newObj, undefined, 2));

    // Get the property value from the new object.
    var newValue;
    try {
      newValue = eval("newObj." + key);
    } catch(err) {
      // If the new object does not contain a property
      // with the chosen key, then no updates need to be made.
      return curObj;
    }

    // Check if the new object contains the property with
    // the named key.
    var keys = key.split("."),
      property = keys[keys.length-1],
      parents = key.substring(0, key.length-property.length);

    // If the new object does not contain the named property, no
    // updates need to be made.
    if( ! eval("(newObj."+parents+"hasOwnProperty('"+property+"'))")) {
      return curObj;
    }

    // If the property is defined and has a value of
    // undefined, then update the value to undefined.
    if(newValue === undefined || newValue === "undefined") {
      eval("curObj."+key+" = undefined");
      log.t("Update", key + " updated to " + newValue);
      return curObj;
    }

    // Otherwise, check if the value is valid
    var value = undefined;

    //console.log(property + ": " + newValue);


    log.t("Update: " + type + " " + newValue);

    switch(type) {
      case 'Array':
        if(_.isArray(newValue)) {
          value = newValue;
        }
        break;
      case 'Boolean':
        if(_.isBoolean(newValue)) {
          value = newValue;
        }
        break;
      case 'Buffer':
        // TODO: Sanitize a buffer.
        value = newValue;
        break;
      case 'Date':
        //TODO: Test
        if(_.isDate(newValue)) {
          value = newValue;
        }
        break;
      case 'Mixed':
        // TODO: Sanitize mixed.
        value = newValue;
        break;
      case 'Number':
        if(_.isNumber) {
          value = newValue;
        }
        break;
      case 'ObjectID':
        value = newValue;
        break;
      case 'String':
        if(_.isString) {
          value = newValue;
        }
        break;
      default:
        log.i("Processing '"+key+": "+newValue+"'");
        log.e("Mongoose property type is unknown: " + type);
        // TODO: For now just assume undefined is a date, because mongoose is dumb:
        value = newValue;
        //value = sanitize.date(newValue);
        break;
    }

    // If the value is valid, update the current schema object
    // with the new value from the update object.
    if(value !== undefined) {
      eval("curObj."+key+" = value");
      log.t("Update", key + " updated to " + newValue);
    }

    // Return the possibly updated object.
    return curObj;
  }
}

/* ************************************************** *
 * ******************** Public API
 * ************************************************** */

Update.prototype.createMongooseMethod = createMongooseMethod;

exports = module.exports = Update;
exports = Update;


/**
 * Updates a single object from a previously run query
 * with fields values from the request body.  Then sets
 * the response object to the updated object.  This will
 * return a route method, meaning a function that accepts
 * request, response, and next as parameters.
 *
 * @isSanitized is a flag that, when true or undefined,
 * triggers the return object to be sanitized, if possible.
 */
/*

 var updateRoute = function(isSanitized) {
 return function(req, res, next) {
 // If the CRUD request is already handled, move on.
 if(isCrudRequestHandled(req)) {
 log.t(traceHeader, "updateRoute: CRUD route is already handled, skipping this route method.", trace);
 return next();
 }

 // Retrieve the object to update from the query result.
 var obj = req.queryResult;

 // If there wasn't a result, move on.
 if( ! obj) {
 return next();
 }

 // Update the object using the request body and currently authenticated user.
 obj.update(req.body, (req.user) ? req.user._id : undefined, function(err, obj) {
 // If an error occurred, pass it on.
 if(err) {
 return next(err);
 }

 // Remove private properties in the object.
 obj = sanitizeObject(obj, isSanitized);

 // Mark the CRUD request as handled.
 setCrudRequestHandled(req);

 // Set the response object to the updated object.
 sender.setResponse(obj, req, res, next);
 });
 };
 }

 */