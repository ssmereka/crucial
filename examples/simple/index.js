var express = require('express'),
    crave = require('crave');
    mongoose = require('mongoose'),
    path = require('path');

var config = {
  //
  // Server configs can be placed here.
  //
};

// Create an express application object.
var app = express();

// Method to connect to a MongoDB database.
var connect = function(callback) {
  mongoose.connect('mongodb://localhost/crucial-example-simple');
  mongoose.connection.on('error', console.error.bind(console, 'connection error:'));
  mongoose.connection.once('open', function() {
    callback(undefined, mongoose);
  });
};

// Method to connect to database and start the server.
var start = function(err, files) {
  if(err) return console.log(err);

  connect(function(err) {
    if(err) return console.log(err);

    var server = app.listen(3000, function() {
      var serverInfo = this.address();
      var address = (serverInfo.address === "0.0.0.0") ? "localhost" : serverInfo.address;

      console.log("Listening on http://%s:%s", address, serverInfo.port);
    });
  });
};

// Setup crave to use filenames to identify a file.
crave.setConfig({
  identification: {    // Variables related to how to find and require files are stored here.
    type: "filename",  // Determines how to find files.  Available options are: 'string', 'filename'
    identifier: "_"    // Determines how to identify the files.
  }
});

// Recursively load all files of the specified type(s) that are also located in the specified folder.
crave.directory(path.resolve("./app"), [ "model", "controller" ], start, app, config);