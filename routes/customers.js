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
  res.render('Customers/CustomerDetails');
});


router.get('/GetReferedByData/:ReferedBy',checkAuth, function(req, res, next) {
var Data = req.params.ReferedBy;
if(Data!=""&&Data!=null&&Data!=undefined)
{
  connection.query('SELECT Id,Name,Mobile,Email FROM customers WHERE Name LIKE ? OR Mobile LIKE ? OR Email LIKE ?',['%' + Data + '%','%' + Data + '%','%' + Data + '%'], function(err, doc){
    res.json(doc);
    });
}
});
    
      
router.post('/QuickSave',checkAuth, function(req, res, next) {
  var CustomerData = req.body;
  var tags=CustomerData.selectedTags;
  delete CustomerData["selectedTags"];
if(CustomerData.Name==""||CustomerData.Name==null)
{
  delete CustomerData["Name"];
}
    if(CustomerData.Id==""||CustomerData.Id==null)
{
  delete CustomerData["Id"];
}
    
if(CustomerData.Email==""||CustomerData.Email==null)
{
  delete CustomerData["Email"];
}
if(CustomerData.Gender==""||CustomerData.Gender==null)
{
  delete CustomerData["Gender"];
}
if(CustomerData.Address==""||CustomerData.Address==null)
{
  delete CustomerData["Address"];
}
if(CustomerData.Zip==""||CustomerData.Zip==null)
{
  delete CustomerData["Zip"];
}
/* Begin transaction */
connection.beginTransaction(function(err) {
  if (err) { throw err; }
 CustomerData['BakerId'] = req.session.baker_id; 
 connection.query('SELECT Id FROM customers WHERE Mobile=?',[CustomerData.Mobile], function(err, doc){
  if (err)
   { 
      connection.rollback(function() {
        throw err;
      });
    }
 
  if(doc!="" && doc!=null)
  {
   connection.query('UPDATE customers SET ? WHERE Mobile = ?', [CustomerData,CustomerData.Mobile], function(err1, doc1) {
      if(err1)
    { 
      connection.rollback(function() {
        throw err1;
      });
    }

     connection.query('DELETE FROM customertags WHERE CustomerId = ? ', [doc[0].Id], function(err2, doc2) {
     if(err2)
    { 
      connection.rollback(function() {
        throw err2;
      });
      }

       });
       //save tag
    for(var i=0;i<tags.length;i++){
     var tag={CustomerId:doc[0].Id,TagId:tags[i].Id};
     connection.query('INSERT INTO customertags SET ?', tag, function(err2, doc2) {
     if(err2)
    { 
      connection.rollback(function() {
        throw err2;
      });
      }
       });
         connection.commit(function(err) {
        if (err) { 
          connection.rollback(function() {
            throw err;
          });
        }
        console.log('Transaction Complete.');
      });
    }
    connection.query('SELECT  Id,MAX(orders.OrderId) AS OrderId FROM orders  JOIN ( SELECT orders.OrderId FROM orders ORDER BY OrderId DESC LIMIT 1) latest WHERE BakerId ='+req.session.baker_id,function(err_Id,doc_id){
        if(err_Id)
            {
                connection.rollback(function() {
                    throw err_Id;
                  });
            }
        res.send({"Data":doc1,"Status":1,"Prev_OrderId":doc_id});
       });
      
   });
  }
else {
    console.log("else part")
    console.log(connection);
  connection.query('INSERT INTO customers SET ?', CustomerData, function(err2, doc2) {
      console.log('INSERT INTO customers SET ?'+ CustomerData)
    if(err2)
   { 
      connection.rollback(function() {
        throw err2;
      });
    }
    for(var i=0;i<tags.length;i++){
     var tag={CustomerId:doc2.insertId,TagId:tags[i].Id};
     connection.query('INSERT INTO customertags SET ?', tag, function(err2, doc2) {
     if(err2)
    { 
      connection.rollback(function() {  
        throw err2;
      });
      }
       });
          connection.commit(function(err) {
        if (err) { 
          connection.rollback(function() {
            throw err;
          });
        }
        console.log('Transaction Complete.');  
      });
    }
      connection.query('SELECT  Id,MAX(orders.OrderId) AS OrderId FROM orders  JOIN ( SELECT orders.OrderId FROM orders ORDER BY OrderId DESC LIMIT 1) latest WHERE BakerId ='+req.session.baker_id,function(err_prevId,doc_prevId){
        if(err_prevId)
            throw err_prevId;
       });
    res.send({"Data":doc2,"Status":2,"Prev_OrderId":doc_prevId});  
  });
}
});

});

});
router.get('/GetCustomer/:mobile',checkAuth, function(req, res, next) {
var mobile = req.params.mobile;
console.log('SELECT Id,Name,Mobile,Email,Gender,Address,Zip FROM customers WHERE Mobile='+mobile);
connection.query('SELECT Id,Name,Mobile,Email,Gender,Address,Zip FROM customers WHERE Mobile='+mobile, function(err, doc){

  if(doc!=""&&doc!=null)
  {
    var CustomerId = doc[0].Id;
	
    connection.query('SELECT Id,DeliveryAddress,Zip,CustomerId FROM deliveryaddress WHERE CustomerId='+CustomerId, function(err1, doc1){
      if (err1)
      throw err1;

      else {
        connection.query('SELECT p1.product_id,p2.Product_desc,p1.product_fields_json FROM `products` p1 INNER JOIN `products_master` p2 ON p1.product_id = p2.Id WHERE p1.baker_id ='+req.session.baker_id, function(err2, doc2){
          if (err2)
          throw err2;
            connection.query('SELECT  Id,MAX(orders.OrderId) AS OrderId FROM orders  JOIN ( SELECT orders.OrderId FROM orders ORDER BY OrderId DESC LIMIT 1) latest WHERE BakerId ='+req.session.baker_id,function(err4,doc4){
                if(err4)
                    throw err4;
                connection.query('SELECT Id,OrganizationName,Email,Mobile,OrganizationAddress,OrganizationZip FROM bakers WHERE Mobile= '+mobile+' ',function(address_err,doc_address) {
                    if (address_err){
                    throw address_err;
                }
                    console.log('select * from customertags where CustomerId= '+CustomerId);
                    connection.query('select * from customertags where CustomerId= '+CustomerId,function(err_tag,doc_tag){
                        if(err_tag){
                            throw err_tag;
                        }
                        res.send({"Customer":doc,"tags":doc_tag, "DeliveryAddress":doc1,"ProductCategory":doc2,"Prev_OrderId":doc4,"Org_address":doc_address});
                    });
                    
                });
                
            });
          
        });
        
      }
    });
  }
  else {
	  
    connection.query('SELECT p1.product_id,p2.Product_desc,p1.product_fields_json FROM `products` p1 INNER JOIN `products_master` p2 ON p1.product_id = p2.Id WHERE p1.baker_id ='+req.session.baker_id, function(err3, doc3){
          if (err3){
			  console.log(err3);
			   throw err3;
		  }
            connection.query('SELECT  Id,MAX(orders.OrderId) AS OrderId FROM orders  JOIN ( SELECT orders.OrderId FROM orders ORDER BY OrderId DESC LIMIT 1) latest WHERE BakerId ='+req.session.baker_id,function(err5,doc5){
                if(err5){
					 console.log(err5);
                    throw err5;
				}
            connection.query('select * from customertags where CustomerId= 0',function(err_tag,doc_tag){
                        if(err_tag){
                            throw err_tag;
                        } 
                        res.send({"ProductCategory":doc3,"Prev_OrderId":doc5,"tags":doc_tag});
                        
                    });
                 
                //res.send({"Customer":doc,"DeliveryAddress":doc1,"ProductCategory":doc2,"Prev_OrderId":doc4});
            });
         
        });
  }
  });
});
router.get('/GetCustomerData/:api',checkAuth, function(req, res, next) {
      connection.query("SELECT Id, Name,Mobile,Email,Gender,Address,Zip FROM customers where BakerId="+req.session.baker_id, function(err, doc){
        if(err)
        throw err;
        res.send(doc)
      });
    });
router.post('/SendPromotionalEmail',checkAuth,function(req, res, next){  
 console.log(req.body);
 try{
 sendMail(req.body.recipients,req.body.subject,req.body.body);
 res.send({"flag":true});
 }
 catch(e){
    res.send({"flag":false});
 }
});

router.post('/ValidateCustomerData',checkAuth,function(req, res, next){
console.log("here");
  console.log(req.body);
req.check('Name','Name is mandatory').notEmpty();
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

router.post('/ValidateQuickSave',checkAuth,function(req,res){

  req.check('Mobile','Mobile number required for quick save').notEmpty();
  req.check('Mobile','Mobile number should be digits.').isNumeric();
  req.check('Mobile','Mobile number should have 10 digits.').len(10,10);
  var errors = req.validationErrors();
  res.send(errors,200);
});

router.get('/GetTags',checkAuth, function(req, res, next) {
  connection.query('SELECT Id,TagName FROM tags ', function(err, tags){
    res.json(tags);
    });
});

router.post('/SaveTag',function (req, res) {
    console.log(req.body)
  try{
    var tag={'TagName': req.body.tagName};
     connection.query('SELECT Id,TagName FROM tags WHERE TagName="'+req.body.tagName+'"', function(err, tags){
         if(err)
       throw err;
       if(tags.length==0){   
    connection.query('INSERT INTO tags SET ?', tag, function(err1, response) {
      if(err1)
       throw err1;
      res.json({ status:true, data:{ id:response.insertId,tagName:req.body.tagName} });
       
    })
       }
       else{
         res.json({ status:true, data:{ id:tags[0].Id,tagName:tags[0].TagName} });
       }
    });
    

  }
  catch(e){
       res.json({ status: false, data:{ id:response.insertId,tagName:req.body.tagName} });
  throw e;
  }
  
});

router.get('/GetTaggedCustomers/:id', function(req, res, next) {
  connection.query('SELECT CustomerId FROM customertags WHERE TagId='+ req.params.id , function(err, data){
       if(err)
          throw err;
          res.send({customers:data});
          });
});

router.post('/SendIndividualSMS',checkAuth,function(req,res){

  client.get('http://promo.variformsolutions.co.in/api/v3/?method=sms&api_key=A0c12b3bda0ee4564994faa12741cdaf7&to='+req.body.To+'&sender=BULKSMS&message='+req.body.Message, function (data, response) {
    res.send(data);
  });
});

router.post('/SendBulkSMS',checkAuth,function(req,res){

  client.get('http://promo.variformsolutions.co.in/api/v3/?method=sms&api_key=A0c12b3bda0ee4564994faa12741cdaf7&to='+req.body.To+'&sender=BULKSMS&message='+req.body.Message, function (data, response) {
    res.send(data);
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