var express = require('express');
var expressValidator = require('express-validator');
var router = express.Router();
var bodyParser = require('body-parser');
var app = express();
var Client = require('node-rest-client').Client;
var client = new Client();
var connection = require('./db');
router.use(bodyParser.json());
 router.use(bodyParser.urlencoded({ extended: true }));
 router.use(expressValidator());
router.get('/',checkAuth, function(req, res, next) {
  res.render('Orders/PaymentManagement');
});
router.post('/MakePayment',checkAuth,function(req, res, next){ 
  connection.query('UPDATE payments SET ? WHERE OrderId = ?',[req.body, req.body.OrderId],function(err, doc){
    if(err)
    throw err;
if(doc)
{
  connection.query('SELECT CustomerId FROM cakeorders WHERE Id='+req.body.OrderId,function(err1, doc1){
    if(err1)
    throw err

    connection.query('SELECT Name,Mobile,Email FROM customers WHERE Id='+doc1[0].CustomerId,function(err2, doc2){
      if(err2)
      throw err2
      if(req.body.PaymentStatus=="2")
      {
          var Message = 'Hi '+doc2[0].Name+',Your payment of Rs.'+req.body.PaidAmount+' completed successfully with Deliciaso.';
          client.get('http://promo.variformsolutions.co.in/api/v3/?method=sms&api_key=A0c12b3bda0ee4564994faa12741cdaf7&to='+doc2[0].Mobile+'&sender=BULKSMS&message='+Message, function (data, response) {

          if(response)
          {
            res.send(doc);
          }
          });
      }
      else if(req.body.PaymentStatus=="1")
      {
        console.log("came");
        var Msg = "Hi "+doc2[0].Name+",Your partial payment of Rs."+req.body.PaidAmount+" completed successfully with Deliciaso. Balance Amount: Rs."+req.body.BalanceAmount+"";
        client.get('http://promo.variformsolutions.co.in/api/v3/?method=sms&api_key=A0c12b3bda0ee4564994faa12741cdaf7&to='+doc2[0].Mobile+'&sender=BULKSMS&message='+Msg, function (data, response) {

        if(response)
        {
          res.send(doc);
        }
        });
      }

    });
  });
}

  });
});

router.post('/ValidatePendingPayment',checkAuth,function(req,res){

req.check('TotalAmount','Payable Amount required').notEmpty();
req.check('PaymentType','Please mention the payment type.').notEmpty();
req.check('Payable_amount','Paid amount required.').notEmpty();
req.check('Payable_amount','Paid amount required.').notEmpty();
req.check('Payable_amount','Amount should be digits.').isNumeric();
req.check('PaymentStatus','Payment status required.').notEmpty();


  var errors = req.validationErrors();
  if (errors) {
    res.send(errors,200);
    return;
  }
  else
  {
    res.send(errors,200);
  }
});
router.post('/ValidatePartialPayment',checkAuth,function(req,res){

req.check('PaymentType','Please mention the payment type.').notEmpty();
req.check('PaymentStatus','Payment status required.').notEmpty();
req.check('DueAmount','Due amount is required.').notEmpty();
req.check('DueAmount','DueAmount should be digits.').isNumeric();

  var errors = req.validationErrors();
  if (errors) {
    res.send(errors,200);
    return;
  }
  else
  {
    res.send(errors,200);
  }
});

function checkAuth(req, res, next) {
  if (!req.session.user_id) {
   res.redirect('/');
  } else {
    next();
  }
}


module.exports = router;