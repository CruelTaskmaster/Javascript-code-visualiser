var express = require('express');
var router = express.Router();
var path = require('path');

router.get('/', function(req, res){
  res.render('index', {
    title: 'Code visualiser'
  });
});

router.get('/about', function(req, res){
  res.render('about', {
    title: 'About'
  });
});

router.get('/contact', function(req, res){
  res.render('contact', {
    title: 'Contact'
  });
});

module.exports = router;