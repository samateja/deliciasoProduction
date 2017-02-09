var express = require('express');
var expressValidator = require('express-validator');
var router = express.Router();
var bodyParser = require('body-parser');
var app = express();
var connection = require('./db');
 router.use(bodyParser.json());
 router.use(bodyParser.urlencoded({ extended: true }));
 router.use(expressValidator());

// If dashboard graph has issue run the following query
connection.query("SET sql_mode=(SELECT REPLACE(@@sql_mode,'ONLY_FULL_GROUP_BY',''));",function (err,res){
     if(err)
    throw err;
    console.log("success")
});

router.get('/',checkAuth, function(req, res, next) {
  res.render('Products/ProductDetails');
});

router.get('/GetProductData/:Product',checkAuth, function(req, res, next) {
var Data = req.params.Product;
if(Data!=""&&Data!=null&&Data!=undefined)
{
  connection.query('SELECT Id,ProductName FROM products WHERE ProductName LIKE ?',['%' + Data + '%'], function(err, doc){
    res.json(doc);
    });
}
});

router.post('/Updateproduct', function(req, res, next) {   
    var Id = req.body.P_id;
    var data = req.body;
    connection.query('UPDATE products SET ? WHERE product_id = ?',[{ 'baker_id': data.baker_id,'product_fields_json':data.product_fields_json}, Id],function(err, doc){
        console.log(doc)
        if (err){
            res.send({"message":err,"status":0});
        }
        res.send({"message":doc,"status":1});
        
    });
});

router.post('/Addproduct', function(req, res, next) {
connection.query('SELECT * FROM products_master WHERE Product_desc = "'+req.body.product_name+'"', function(err, data){
        if( data.length == 0){  // New Product, when product doesnt exist.
            var product_desc = {'Product_desc':req.body.product_name};
             connection.query('INSERT INTO products_master SET ?', product_desc, function(err1, response) {
                  if(err1)
                    throw err1;
                 if (response.insertId != '' || response.insertId != null){
                     var product_deliciaso = {"product_id":response.insertId,"baker_id":req.session.baker_id}
                     connection.query('INSERT INTO products SET ?', product_deliciaso, function(err2, response1) {
                        if(err2)
                         throw err2;
                         if (response1.affectedRows > 0){  
                             res.send({"p_id":response.insertId,"Baker_id":req.session.baker_id,"message":"Succesfully added New Product for this baker","status":1});
                         }
                         
                     });
                 }
             
             });
        }  // end of creating new product
        else { // check for duplicate product for particular Baker
            connection.query('SELECT * FROM products WHERE product_id="'+ data[0].Id+'" AND baker_id ="'+req.session.baker_id+'"' , function(err, data1){
                if (data1.length > 0){
                    res.send({"message":"Product already exists for this baker","status":0});
                }
                else{
                    var product_deliciaso = {"product_id":data[0].Id,"baker_id":req.session.baker_id}
                     connection.query('INSERT INTO products SET ?', product_deliciaso, function(err3, response3) {
                        if(err3)
                         throw err3;
                         if (response3.affectedRows > 0){ 
                             res.send({"p_id":data[0].Id,"Baker_id":req.session.baker_id,"message":"Succesfully added New Product for this baker fetched from existing","status":1});
                         }
                         
                     });
                    
                }   
            });
               
        }
        
    });
});
function checkAuth(req, res, next) {
  if (!req.session.user_id) {
   res.redirect('/');
  } else {
    next();
  }
}

module.exports = router;