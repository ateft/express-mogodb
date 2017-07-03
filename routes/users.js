const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
passport =require('passport');

// Bring in models
let User = require('../models/user');

router.get('/register', function(req, res){
  res.render('register');
})

router.post('/register', function(req, res){

  req.checkBody('name', 'Name is required').notEmpty();
  req.checkBody('email', 'Email is required').notEmpty();
  req.checkBody('email', 'Email is not valid').isEmail();
  req.checkBody('username', 'Username is required').notEmpty();
  req.checkBody('password', 'Password is required').notEmpty();
  req.checkBody('password2', 'Check Password is required').notEmpty();
  req.checkBody('password2', 'Password do not match').equals(req.body.password);

  let user = new User();
  user.name = req.body.name;
  user.email = req.body.email;
  user.username = req.body.username;
  user.password = req.body.password;
  // Get errors
  let errors = req.validationErrors();
  if(errors){
    res.render('register', {
      user: user,
      errors: errors
    })
  }else{

    bcrypt.genSalt(10, function(err, salt){
      bcrypt.hash(user.password, salt, function(err, hash){
        if(err){
          console.log(err);
        }else{
          user.password = hash;
          user.save(function(err){
            if(err){
              console.log(err);
              return;
            } else {
              req.flash('success', 'You are now registered and can login');
              res.redirect('/users/login');
            }
          });
        }
      });
    });
  }
});

// Login form
router.get('/login', function(req, res){
  res.render('login');
});

// Login process
router.post('/login', function(req, res, next){
  passport.authenticate('local', {
    successRedirect: '/',
    failureRedirect: '/users/login',
    failureFlash: true
  })(req, res, next);
});

router.get('/logout', function(req, res){
  req.logout();
  req.flash('sucess', 'You are logged out');
  res.redirect('/users/login');
});

module.exports = router;
