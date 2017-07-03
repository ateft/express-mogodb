const express = require('express');
const router = express.Router();

// Bring in models
let Article = require('../models/article');
let User = require('../models/user');

// Add article Route
router.get('/add', ensureAuthenticated, function(req, res){
  res.render('add_article', {
    title: 'Add an articles'
  });
});

// Add article
router.post('/add', ensureAuthenticated, function(req, res){

  req.checkBody('title', 'Title is required').notEmpty();
  req.checkBody('body', 'Body is required').notEmpty();

  // Get errors
  let errors = req.validationErrors();
  if(errors){
    res.render('add_article', {
      title: "Add Article",
      errors: errors
    })
  }else{
    let article = new Article();
    article.title = req.body.title;
    article.author = req.user._id;
    article.body = req.body.body;

    article.save(function(err){
      if(err){
        console.log(err);
        return;
      } else {
        req.flash('success', 'Article added');
        res.redirect('/');
      }
    });
  }
});

// Update an article
router.post('/edit/:id', ensureAuthenticated, function(req, res){
  let article = {};
  article.title = req.body.title;
  article.author = req.user._id;
  article.body = req.body.body;

  let query = {_id: req.params.id}

  Article.update(query, article, function(err){
    if(err){
      console.log(err);
      return;
    } else {
      req.flash('success', 'Article updated');
      res.redirect('/');
    }
  });

});
// Delete an article
router.delete('/:id', function(req, res){
  let query = {_id:req.params.id};
  Article.remove(query, function(err){
    if(err){
      console.log(err);
    }
    res.send('Success');
  });
});


// Edit article Route
router.get('/edit/:id', function(req, res){
  Article.findById(req.params.id, function(err, article){

    if(!req.user || article.author != req.user._id){
      req.flash('danger', 'Not allowed to edit this article');
      res.redirect('/');
    }else{
      res.render('edit_article', {
        article: article
      });
    }
  });
});

// Get single articles
router.get('/:id', function(req, res){
  Article.findById(req.params.id, function(err, article){
    User.findById(article.author, function(err, user){
      res.render('article', {
        article: article,
        author: user.name
      });
    });
  });
});

function ensureAuthenticated(req, res, next){
  if(req.isAuthenticated()){
    return next();
  }else{
    req.flash('danger', 'Please login');
    res.redirect('/users/login')
  }
}

module.exports = router;
