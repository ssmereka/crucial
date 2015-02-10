module.exports = function (app, config) {

  // Get the connected database object.
  var db = require("mongoose");

  // Get the User schema from the database object.
  var User = db.model("User");

  // A route to find and return all users in the database.
  app.get('/users', function (req, res, next) {
    User.find().exec(function(err, users) {
      res.send(err || (( ! users || users.length == 0) ? undefined : users) || "There are no users in the database.");
    });
  });

  // A route to add a new user to the database.
  app.post('/users', function(req, res, next) {

    console.log("BODY:!");
    console.log(req.body);
    req.user = "578972a2c8a826d43a261abc";

    var user = new User();
    user.update(req.body, req.user, function(err, user) {
      res.send(err || user);
    });
  });

  // Route to update an existing user in the database.
  app.post('/users/:id', function(req, res, next) {
    User.findById(req.params.id, function(err, user) {
      if(err) {
        res.send(err);
      } else if( ! user){
        res.send("User with id " + req.params.id + " was not found.");
      } else {
        user.update(req.body, req.user, function(err, user) {
          res.send(err || user);
        });
      }
    });
  });

  // Route to delete an existing user in the database.
  app.delete('/users/:id/purge', function(req, res, next) {
    User.findById(req.params.id, function(err, user) {
      if(err) {
        res.send(err);
      } else if( ! user){
        res.send("User with id " + req.params.id + " was not found.");
      } else {
        user.purge(req.user, function(err, user) {
          res.send(err || user);
        });
      }
    });
  });

  // Route to delete an existing user in the database.
  app.post('/users/:id/undelete', function(req, res, next) {
    User.findById(req.params.id, function(err, user) {
      if(err) {
        res.send(err);
      } else if( ! user){
        res.send("User with id " + req.params.id + " was not found.");
      } else {
        user.undelete(req.user, function(err, user) {
          res.send(err || user);
        });
      }
    });
  });

  // Route to delete an existing user in the database.
  app.delete('/users/:id', function(req, res, next) {
    User.findById(req.params.id, function(err, user) {
      if(err) {
        res.send(err);
      } else if( ! user){
        res.send("User with id " + req.params.id + " was not found.");
      } else {
        user.delete(req.user, function(err, user) {
          res.send(err || user);
        });
      }
    });
  });



};