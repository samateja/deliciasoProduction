var express = require('express');
var router = express.Router();
router.get('/', function(req, res, next) {
  res.render('Login/login');
});

router.get('/SendEmail',checkAuth, function(req, res, next) {
  res.render('Customers/SendMail');
});

router.get('/editInvoice',checkAuth, function(req, res, next) {
  res.render('Orders/EditInvoice/editInvoice');
});
 function  checkAuth(req, res, next) {
  if (!req.session.user_id) {
   res.redirect('/');
  } else {
    next();
  }
}

module.exports = router;