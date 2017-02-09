var express = require('express');
var router = express.Router();
var connection = require('./db');
router.get('/',checkAuth, function(req, res, next) {
  res.render('Dashboard/MainDashboard');
});
router.get('/api/GetPastOrderDetails/:Mobile',checkAuth, function(req, res) {
connection.query('SELECT Id FROM customers WHERE Mobile = ?',[req.params.Mobile],function(err,doc){
if(err)
throw err;

  if(doc!=""&&doc!=null)  
  {
    connection.query("SELECT customers.Id AS CustomerId,customers.Name,customers.Mobile,customers.Email,customers.Gender,customers.Address,customers.Zip, orders.Id AS OrderId,orders.DeliveryType,orders.DeliveryDateTime,orders.Comments AS OrderComments,orders.PickUpDateTime,payments.PaymentStatus,cakeorders.DeliveryStatus,cakeorders.Id AS CakeOrderId, cakeorders.Size,cakeorders.Shape,cakeorders.Type,cakeorders.Amount,cakeorders.Message,cakeorders.DecorationInstr,cakeorders.IngredientInstr,cakeorders.Occasion,cakeorders.Comments AS CakeOrderComments, payments.PaidAmount,payments.BalanceAmount,payments.Discount FROM customers INNER JOIN orders ON customers.Id=orders.CustomerId INNER JOIN cakeorders ON orders.Id=cakeorders.OrderId INNER JOIN payments ON cakeorders.Id=payments.Id WHERE payments.PaymentStatus = ? AND customers.Id = ?",['0',doc[0].Id], function(err1, doc1){
      if(err1)
      throw err1;
    connection.query("SELECT customers.Id AS CustomerId,customers.Name,customers.Mobile,customers.Email,customers.Gender,customers.Address,customers.Zip, orders.Id AS OrderId,orders.DeliveryType,orders.DeliveryDateTime,orders.Comments AS OrderComments,orders.PickUpDateTime,payments.PaymentStatus,cakeorders.DeliveryStatus,cakeorders.Id AS CakeOrderId, cakeorders.Size,cakeorders.Shape,cakeorders.Type,cakeorders.Amount,cakeorders.Message,cakeorders.DecorationInstr,cakeorders.IngredientInstr,cakeorders.Occasion,cakeorders.Comments AS CakeOrderComments, payments.PaidAmount,payments.BalanceAmount,payments.Discount FROM customers INNER JOIN orders ON customers.Id=orders.CustomerId INNER JOIN cakeorders ON orders.Id=cakeorders.OrderId INNER JOIN payments ON cakeorders.Id=payments.Id WHERE payments.PaymentStatus = ? AND customers.Id = ?",['1',doc[0].Id], function(err2, doc2){

      if(err2)
      throw err2;
        res.send({"Pending":doc1,"Partial":doc2});
    });
    });
  }
  else {
    res.send({Message:"No user exist with this mobile number"});
  }
});
});

router.get('/api/GetCounts',checkAuth, function(req, res) {
connection.query('SELECT COUNT(*) AS CustomerCount FROM customers;SELECT COUNT(*) AS CakeCount FROM orders;SELECT COUNT(*) AS PendingPayments FROM payments WHERE PaymentStatus=0;SELECT COUNT(*) AS PartialPayments FROM payments WHERE PaymentStatus=1;SELECT COUNT(*) AS CompletedPayments FROM payments WHERE PaymentStatus=2;SELECT SUM(PaidAmount) AS TotalCollection FROM payments',function(err, doc){
    if(err)
    throw err;
   
    connection.query('SELECT COUNT(*)AS counts,MONTHNAME(OrderDate) AS Month  FROM cakeorders GROUP BY MONTH(OrderDate);',function(err1, doc1){
      res.send({"CustomerCount":doc[0][0].CustomerCount,"CakeCount":doc[1][0].CakeCount,"PendingPayments":doc[2][0].PendingPayments,"PartialPayments":doc[3][0].PartialPayments,"CompletedPayments":doc[4][0].CompletedPayments,"TotalCollection":doc[5][0].TotalCollection,"OrderStats":doc1});
});
  });
}); 

 function  checkAuth(req, res, next) {
  if (!req.session.user_id) {
   res.redirect('/');
  } else {
    next();
  }
}
module.exports = router;