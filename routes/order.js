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
  res.render('NewOrder/index');
});


router.put('/:Id',checkAuth, function(req, res, next) {
var Id = req.params.Id;
var Data = req.body;

connection.query('UPDATE cakeorder SET ? WHERE Id = ?',[{ Name: Data.CakeName,Size:Data.Size,Quantity:Data.Quantity,Shape:Data.Shape,Type:Data.Type,Amount:Data.Amount,Message:Data.Message,DecorationInstr:Data.DecorationInstr,IngredientInstr:Data.IngredientInstr,OrderDate:Data.OrderDate,DeliveryDate:Data.DeliveryDate,Occasion:Data.Occasion,Comments:Data.Comments }, Id],function(err, doc){
  if(doc!=""&&doc!=null)
  {
    connection.query('SELECT Id,Name AS CakeName,Size,Quantity,Shape,Type,Message,Amount,DecorationInstr,IngredientInstr,OrderDate,DeliveryDate,Occasion,Comments FROM cakeorder WHERE Id='+Id, function(err2, doc2){
    res.json(doc2)
    });
  }
  else
  {
    console.log(err);
  }
});

});



router.post('/PlaceOrder',checkAuth, function(req, res, next) {

  var CustomerData = req.body.cust;
  var NewDeliveryAddress = req.body.NewDeliveryAddress;
  var Billing = req.body.Billing;
  var Cake = req.body.Cake;
  var Product = req.body.Product;
  var payment = [];
  var test = [];
  var OrderId = req.body.OrderId;

   // console.log(req.session.baker_id)
    //return;
  connection.query('SELECT Id FROM customers WHERE Mobile=?',[CustomerData.Mobile], function(err, doc){
    if (err)
     throw err;

    if(doc!=""&&doc!=null)
    {
//      connection.query('UPDATE customers SET ? WHERE Mobile = ?',[CustomerData, CustomerData.Mobile],function(err1, doc1){
//        if (err1){
//            res.send({"test":err1});
//            throw err1;
//        }
         

        if(Billing.DeliveryType=="DoorDelivery")
        {
          if(NewDeliveryAddress)
          {
            var NewAddress = {"DeliveryAddress":NewDeliveryAddress,"CustomerId":CustomerData.Id,"BakerId":req.session.baker_id};
            connection.query('INSERT INTO deliveryaddress SET ?', NewAddress, function(error, docs) {
              Billing["DeliveryAddressId"] = docs.insertId;
              Billing["CustomerId"] = CustomerData.Id;
              Billing["BakerId"] = req.session.baker_id;
              Billing["OrderId"] = OrderId;
              connection.query('INSERT INTO orders SET ?', Billing, function(err2, doc2) {
                if (err2)
                 throw err2;

                  var OrderId = doc2.insertId;
                  var InsertCakeData;
                  for (var i=0;i<Cake.length;i++)
                  {
                    Cake[i]["PaymentStatus"] ="0";
                    Cake[i]["DeliveryStatus"]="0";
                    Cake[i]["CustomerId"] = CustomerData.Id;
                    Cake[i]["OrderId"] = OrderId;
                    Cake[i]["BakerId"] = req.session.baker_id;
                    // if(Product[i].Id!=undefined)
                    // {
                    // Cake[i]["CakeName"] = Product[i].Id;
                    // }
                    // else {
                    //   connection.query('INSERT INTO products SET ?', Product[i], function(errP, docP) {
                    //     if(errP)
                    //     throw errp;
                    //     console.log(docP.insertId);
                    //    Cake[i]["CakeName"] = docP.insertId;
                    //
                    //   });
                    //
                    // }
                  }
                  
                    connection.query('INSERT INTO cakeorders SET ?', Cake[i], function(err3, doc3) {
                      if (err3)
                       throw err3;
                       payment[i] ={'PaymentStatus':'0','CakeOrderId':OrderId,'BakerId':req.session.baker_id,'OrderId':OrderId};
                       connection.query('INSERT INTO payments SET ?',payment[i], function(err4, doc4) {
                         if (err4)
                          throw err4;

                         test.push(doc4);
//                         if(test.length == Cake.length)
//                         {
//                           var Msg = "Hi "+CustomerData.Name+",Your order has been completed successfully with Deliciaso.";
//                           client.get('http://promo.variformsolutions.co.in/api/v3/?method=sms&api_key=A0c12b3bda0ee4564994faa12741cdaf7&to='+CustomerData.Mobile+'&sender=BULKSMS&message='+Msg, function (data, response) {
//
//                           if(response)
//                           {
//                             res.send(test);
//                           }
//                           });
//
//                         }
                           
                         res.send(test); 
                       });
                    });
            });
            });
          }
          else
          {
            Billing["BakerId"] = req.session.baker_id;
            Billing["CustomerId"] = CustomerData.Id;
            Billing["OrderId"] = OrderId;
            connection.query('INSERT INTO orders SET ?', Billing, function(err5, doc5) {
              if (err5)
               throw err5;

                var OrderId = doc5.insertId;
                var InsertCakeData;
                for (var i=0;i<Cake.length;i++)
                {
                  Cake[i]["PaymentStatus"] ="0";
                  Cake[i]["DeliveryStatus"]="0";
                  Cake[i]["CustomerId"] = CustomerData.Id;
                  Cake[i]["OrderId"] = OrderId;
                  Cake[i]["BakerId"] = req.session.baker_id;
                   delete Cake[i]["product_name"];    
                  connection.query('INSERT INTO cakeorders SET ?', Cake[i], function(err6, doc6) {
                    if (err6)
                     throw err6;
                    
                  });
                    
                }
                 payment[i] ={'PaymentStatus':'0','CakeOrderId':OrderId,'BakerId':req.session.baker_id,'OrderId':OrderId};
                     connection.query('INSERT INTO payments SET ?',payment[i], function(err7, doc7) {

                       test.push(doc7);
//                       if(test.length == Cake.length)
//                       {
//                         var Msg = "Hi "+CustomerData.Name+",Your order has been completed successfully with Deliciaso.";
//                         client.get('http://promo.variformsolutions.co.in/api/v3/?method=sms&api_key=A0c12b3bda0ee4564994faa12741cdaf7&to='+CustomerData.Mobile+'&sender=BULKSMS&message='+Msg, function (data, response) {
//
//                         if(response)
//                         {
//                           res.send(test);
//                         }
//                         });
//                       }
                         res.send(test);
                     });
          });
          }
        }
        else
        {
            
           
          Billing["CustomerId"] = CustomerData.Id;
          Billing["BakerId"] = req.session.baker_id;
          Billing["OrderId"] = OrderId;    
          connection.query('INSERT INTO orders SET ?', Billing, function(err8, doc8) {
            if (err8)
             throw err8;

              var OrderId = doc8.insertId;
              var InsertCakeData;
              for (var i=0;i<Cake.length;i++)
              {
                Cake[i]["PaymentStatus"] ="0";
                Cake[i]["DeliveryStatus"]="0";
                Cake[i]["CustomerId"] = CustomerData.Id;
                Cake[i]["OrderId"] = OrderId;
                Cake[i]["BakerId"] = req.session.baker_id;
                  delete Cake[i]["product_name"]; 
                connection.query('INSERT INTO cakeorders SET ?', Cake[i], function(err9, doc9) {
                  if (err9)
                   throw err9;
                   
                });
              }
               payment[i] ={'PaymentStatus':'0','CakeOrderId':OrderId,'BakerId':req.session.baker_id,'OrderId':OrderId};
                   connection.query('INSERT INTO payments SET ?',payment[i], function(err10, doc10) {

                     test.push(doc10);
//                     if(test.length == Cake.length)
//                     {
//                       var Msg = "Hi "+CustomerData.Name+",Your order has been completed successfully with Deliciaso.";
//                       client.get('http://promo.variformsolutions.co.in/api/v3/?method=sms&api_key=A0c12b3bda0ee4564994faa12741cdaf7&to='+CustomerData.Mobile+'&sender=BULKSMS&message='+Msg, function (data, response) {
//
//                       if(response)
//                       {
//                         res.send(test);
//                       }
//                       });
//                     }
                       res.send(test);  
                   });
        });
        }

      // });
    }
    else
    {
      connection.query('INSERT INTO customers SET ?', CustomerData, function(err11, doc11) {
        if (err11)
         throw err11;

          var CustomerId = doc11.insertId;
          if(Billing.DeliveryType=="DoorDelivery")
          {
            if(NewDeliveryAddress)
            {
              var NewAddress = {"DeliveryAddress":NewDeliveryAddress,"CustomerId":CustomerId};
              connection.query('INSERT INTO deliveryaddress SET ?', NewAddress, function(err12, doc12) {
                Billing["DeliveryAddressId"] = doc12.insertId;
                Billing["CustomerId"] = CustomerId;
                Billing["BakerId"] = req.session.baker_id;
                Billing["OrderId"] = OrderId;  
                connection.query('INSERT INTO orders SET ?', Billing, function(err13, doc13) {
                  if (err13)
                   throw err13;

                  var OrderId1 = doc13.insertId;
                  var InsertCakeData1;
                  for (var i=0;i<Cake.length;i++)
                  {
                    Cake[i]["PaymentStatus"] ="0";
                    Cake[i]["DeliveryStatus"]="0";
                    Cake[i]["CustomerId"] = CustomerId;
                    Cake[i]["OrderId"] = OrderId1;
                    Cake[i]["BakerId"] = req.session.baker_id;
                      delete Cake[i]["product_name"]; 
                    connection.query('INSERT INTO cakeorders SET ?', Cake[i], function(err14, doc14) {
                      if (err14)
                       throw err14;

                    });
                      
                  }
                    
                payment[i] ={'PaymentStatus':'0','CakeOrderId':OrderId,'BakerId':req.session.baker_id,'OrderId':OrderId};
               connection.query('INSERT INTO payments SET ?',payment[i], function(err15, doc15) {

                 test.push(doc15);
                   res.send(test);
//                 if(test.length == Cake.length)
//                 {
//                   var Msg = "Hi "+CustomerData.Name+",Your order has been completed successfully with Deliciaso.";
//                   client.get('http://promo.variformsolutions.co.in/api/v3/?method=sms&api_key=A0c12b3bda0ee4564994faa12741cdaf7&to='+CustomerData.Mobile+'&sender=BULKSMS&message='+Msg, function (data, response) {
//
//                   if(response)
//                   {
//                     res.send(test);
//                   }
//                   });
//                 }

               });
                });
              });
            }
            else
            {
              Billing["CustomerId"] = CustomerId;
              Billing["BakerId"] = req.session.baker_id;
              Billing["OrderId"] = OrderId;    
              connection.query('INSERT INTO orders SET ?', Billing, function(err16, doc16) {
                if (err16)
                 throw err16;

                var OrderId1 = doc16.insertId;
                var InsertCakeData1;
                for (var i=0;i<Cake.length;i++)
                {
                  Cake[i]["PaymentStatus"] ="0";
                  Cake[i]["DeliveryStatus"]="0";
                  Cake[i]["CustomerId"] = CustomerId;
                  Cake[i]["OrderId"] = OrderId1;
                  Cake[i]["BakerId"] = req.session.baker_id;
                   delete Cake[i]["product_name"];  
                  connection.query('INSERT INTO cakeorders SET ?', Cake[i], function(err17, doc17) {
                    if (err17)
                     throw err17;


                  });
                }
                  payment[i] ={'PaymentStatus':'0','CakeOrderId':OrderId,'BakerId':req.session.baker_id,'OrderId':OrderId};
                     connection.query('INSERT INTO payments SET ?',payment[i], function(err18, doc18) {

                       test.push(doc18);
//                       if(test.length == Cake.length)
//                       {
//                         var Msg = "Hi "+CustomerData.Name+",Your order has been completed successfully with Deliciaso.";
//                         client.get('http://promo.variformsolutions.co.in/api/v3/?method=sms&api_key=A0c12b3bda0ee4564994faa12741cdaf7&to='+CustomerData.Mobile+'&sender=BULKSMS&message='+Msg, function (data, response) {
//
//                         if(response)
//                         {
//                           res.send(test);
//                          }
//                         });
//                       }
                        res.send(test);
                     });
              });
            }
          }
          else
          {

              Billing["CustomerId"] = CustomerId;
              Billing["BakerId"] = req.session.baker_id;
              Billing["OrderId"] = OrderId;
              connection.query('INSERT INTO orders SET ?', Billing, function(err19, doc19) {
                if (err19)
                 throw err19;

                var OrderId1 = doc19.insertId;
                var InsertCakeData1;
                for (var i=0;i<Cake.length;i++)
                {
                  Cake[i]["PaymentStatus"] ="0";  
                  Cake[i]["DeliveryStatus"]="0";
                  Cake[i]["CustomerId"] = CustomerId;
                  Cake[i]["OrderId"] = OrderId1;
                  Cake[i]["BakerId"] = req.session.baker_id;
                  delete Cake[i]["product_name"];   
                  connection.query('INSERT INTO cakeorders SET ?', Cake[i], function(err20, doc20) {
                    if (err20)
                     throw err20;


                  });
                }
                 payment[i] ={'PaymentStatus':'0','CakeOrderId':OrderId,'BakerId':req.session.baker_id,'OrderId':OrderId};
                     connection.query('INSERT INTO payments SET ?',payment[i], function(err21, doc21) {

                       test.push(doc21);
                         res.send(test);
//                       if(test.length == Cake.length)
//                       {
//                         var Msg = "Hi "+CustomerData.Name+",Your order has been completed successfully with Deliciaso.";
//                         client.get('http://promo.variformsolutions.co.in/api/v3/?method=sms&api_key=A0c12b3bda0ee4564994faa12741cdaf7&to='+CustomerData.Mobile+'&sender=BULKSMS&message='+Msg, function (data, response) {
//
//                         if(response)
//                         {
//                           res.send(test);
//
//                         }
//                         });
//                       }

                     });
              });
          }


      });

    }
  });

});


router.post('/UpdateInvoiceOrder',checkAuth, function(req, res, next) {

  var CustomerData = req.body.cust;
  var NewDeliveryAddress = req.body.NewDeliveryAddress;
  var Billing = req.body.Billing;
  var Cake = req.body.Cake;
  var OrderId = req.body.OrderId;
  //var Product = req.body.Product;
  var payment = [];
  var test = [];
  var InsertedId =[];
  var cakeOrderedId;
  var CakeOrderInserts = [];
  var P_id;
    console.log("InvoiceId")
    console.log(OrderId)
//res.send({"hello":Billing}); 
//return false;
   // console.log(req.session.baker_id)
    //return;
   // console.log('SELECT Id FROM customers WHERE Mobile=?' + [CustomerData.Mobile]);
    
  connection.query('SELECT Id FROM customers WHERE Mobile=?',[CustomerData.Mobile], function(err, doc){
      console.log("having issue 1")
      
    if (err)
        {
            throw err;
        }
     //throw err;

    if(doc!=""&&doc!=null)   
    {
        
    //console.log('UPDATE customers SET ? WHERE Mobile = ?'+ [CustomerData, CustomerData.Mobile])
    
//    connection.query('UPDATE customers SET ? WHERE Mobile = ?',[CustomerData, CustomerData.Mobile],function(err1, doc1){
//        if (err1){
//            //throw err1;
//            res.send(err1);  
//        }
         

        if(Billing.DeliveryType=="DoorDelivery")
        {
          if(NewDeliveryAddress)
          {
            var NewAddress = {"DeliveryAddress":NewDeliveryAddress,"CustomerId":CustomerData.Id,"BakerId":req.session.baker_id};
              
             connection.query('UPDATE orders SET ? WHERE OrderId = ? AND BakerId=? AND CustomerId = ?', [Billing,OrderId,req.session.baker_id,CustomerData.Id], function(err5, doc5) {
              if (err5)
               throw err5;
                
                //var OrderId = doc5.insertId;
                var InsertCakeData;
                for (var i=0;i<Cake.length;i++)     
                {
                        Cake[i]["PaymentStatus"] ="0";  
                        Cake[i]["DeliveryStatus"]="0";
                        Cake[i]["CustomerId"] = CustomerData.Id;
                        Cake[i]["OrderId"] = OrderId;
                        Cake[i]["BakerId"] = req.session.baker_id;
                        Cake[i]["Product_amount"] = Cake[i].AMOUNT;
                    var P_amount = Cake[i].AMOUNT;
                    P_id = Cake[i].Product_id;
                    var product_data = Cake[i].product_fields_json;  
                    var O_Id = Cake[i].OrderId;  
                        console.log("issue 2")
                        console.log(Cake[i]);
                        console.log('SELECT * FROM cakeorders WHERE (Product_id = '+P_id+' AND CustomerId = '+CustomerData.Id+' AND BakerID = '+req.session.baker_id+' AND OrderId = '+OrderId+')');
                    
                        connection.query('SELECT * FROM cakeorders WHERE (Product_id = '+P_id+' AND CustomerId = '+CustomerData.Id+' AND BakerID = '+req.session.baker_id+' AND OrderId = '+OrderId+')',function(err_cakeorders, doc_cakeorders) {
                            console.log("came to select cakeorders")
                            //console.log(doc_cakeorders.length)
                           // console.log(doc_cakeorders)
                            //res.send({"cakeOrdersData":doc_cakeorders});
                        if (err_cakeorders){
                            throw err_cakeorders;
                        }

                        if (doc_cakeorders.length == 0){ 
                            console.log("Insert Cake Orders record")
                            console.log(Cake)
                            for (var j=0;j<Cake.length;j++){  
                                if (P_id == Cake[j].Product_id ){
                                    //var cake_amt = Cake[j].AMOUNT;
                                    //Cake[j]["Product_amount"] = cake_amt;
                                    //delete Cake[j]["AMOUNT"];
                                    delete Cake[j]["ProductName"];
                                    console.log(Cake[j])
                                   connection.query('INSERT INTO cakeorders SET ?', Cake[j], function(err_doc_InsertCakeOrders, doc_InsertCakeOrders) {
                                        if (err_doc_InsertCakeOrders){
                                            throw err_doc_InsertCakeOrders;
                                        }
                                         InsertedId.push(doc_InsertCakeOrders.insertId);
                                      });
                                    }
                                }
                             
                        }
                        else{
                            console.log("came to update");

                            for (var k=0;k<Cake.length;k++){  
                                    Cake[k]["CustomerId"] = CustomerData.Id;
                                    Cake[k]["OrderId"] = OrderId;
                                    Cake[k]["Product_amount"] = Cake[k].AMOUNT;
                                 
                                 delete Cake[k]["AMOUNT"];
                                 delete Cake[k]["ProductName"];
                                var product_id = Cake[k].Product_id;
                                var O_Id = Cake[k].InvoiceId;
                                delete Cake[k]["InvoiceId"];
                                delete Cake[k]["OrderDate"];
                                console.log(Cake[k]);
                                connection.query('UPDATE cakeorders SET ? WHERE OrderId = ? AND BakerId=? AND CustomerId = ? AND Product_id = ?', [Cake[k],O_Id,req.session.baker_id,CustomerData.Id,product_id], function(err_updateCakeOrder, doc_updateCakeOrder) {
                                if (err_updateCakeOrder){
                                    console.log("error in err_updateCakeOrder;")
                                    throw err_updateCakeOrder;
                                }

                               });

                            }
                           //var update_cake_orders = {'Product_amount':P_amount,'product_fields_json':product_data};
                            
                            //console.log(update_cake_orders)
                        
                            
                        }      
                     }); 
                }

                connection.query('select * from payments WHERE (OrderId ='+OrderId+' AND BakerId='+req.session.baker_id+' )',function(err_payments,doc_payments){
                    if (err_payments){
                        throw err_payments;
                    }
                    
                        console.log("came to payments update")
                        payment[i] ={'PaymentStatus':'0','OrderId':OrderId,'BakerId':req.session.baker_id};
                        
                    console.log(payment[i]);
                    
                    connection.query('UPDATE payments SET ? WHERE OrderId = ? AND BakerId=?', [payment[i],OrderId,req.session.baker_id], function(err_updatePayment, doc_updatePayment) {
                       // console.log(doc_updatePayment)
                        if (err_updatePayment){
                            console.log("came to err_updatePayment")
                            throw err_updatePayment;
                        }
                        console.log(doc_updatePayment)
                       test.push(doc_updatePayment);
                        //console.log(res);
                       if(test.length > 0)
                       {
                         var Msg = "Hi "+CustomerData.Name+",Your order has been completed successfully with Deliciaso.";
//                         client.get('http://promo.variformsolutions.co.in/api/v3/?method=sms&api_key=A0c12b3bda0ee4564994faa12741cdaf7&to='+CustomerData.Mobile+'&sender=BULKSMS&message='+Msg, function (data, response) {
//
//                         if(response)
//                         {
//                           res.send(test);
//                         }
//                         });
                           console.log(test)
                           res.send(test);
                           //send_message(test)
                          
                       }
                        
                });
                        
     
                    
                });
                

          });
                
                
            //});
          }
          else
          {
            Billing["BakerId"] = req.session.baker_id;
            Billing["CustomerId"] = CustomerData.Id;
            Billing["OrderId"] = OrderId;
              
            connection.query('UPDATE orders SET ? WHERE OrderId = ? AND BakerId=? AND CustomerId = ?', [Billing,OrderId,req.session.baker_id,CustomerData.Id], function(err5, doc5) {
              if (err5)
               throw err5;
                
                //var OrderId = doc5.insertId;
                var InsertCakeData;
                for (var i=0;i<Cake.length;i++)     
                {
                        Cake[i]["PaymentStatus"] ="0";  
                        Cake[i]["DeliveryStatus"]="0";
                        Cake[i]["CustomerId"] = CustomerData.Id;
                        Cake[i]["OrderId"] = OrderId;
                        Cake[i]["BakerId"] = req.session.baker_id;
                        Cake[i]["Product_amount"] = Cake[i].AMOUNT;
                    var P_amount = Cake[i].AMOUNT;
                    P_id = Cake[i].Product_id;
                    var product_data = Cake[i].product_fields_json;  
                    var O_Id = Cake[i].OrderId;  
                        console.log("issue 2")
                        console.log(Cake[i]);
                        console.log('SELECT * FROM cakeorders WHERE (Product_id = '+P_id+' AND CustomerId = '+CustomerData.Id+' AND BakerID = '+req.session.baker_id+' AND OrderId = '+OrderId+')');
                    
                        connection.query('SELECT * FROM cakeorders WHERE (Product_id = '+P_id+' AND CustomerId = '+CustomerData.Id+' AND BakerID = '+req.session.baker_id+' AND OrderId = '+OrderId+')',function(err_cakeorders, doc_cakeorders) {
                            console.log("came to select cakeorders")
                            //console.log(doc_cakeorders.length)
                           // console.log(doc_cakeorders)
                            //res.send({"cakeOrdersData":doc_cakeorders});
                        if (err_cakeorders){
                            throw err_cakeorders;
                        }

                        if (doc_cakeorders.length == 0){ 
                            console.log("Insert Cake Orders record")
                            console.log(Cake)
                            for (var j=0;j<Cake.length;j++){  
                                if (P_id == Cake[j].Product_id ){
                                    //var cake_amt = Cake[j].AMOUNT;
                                    //Cake[j]["Product_amount"] = cake_amt;
                                    //delete Cake[j]["AMOUNT"];
                                    delete Cake[j]["ProductName"];
                                    console.log(Cake[j])
                                   connection.query('INSERT INTO cakeorders SET ?', Cake[j], function(err_doc_InsertCakeOrders, doc_InsertCakeOrders) {
                                        if (err_doc_InsertCakeOrders){
                                            throw err_doc_InsertCakeOrders;
                                        }
                                         InsertedId.push(doc_InsertCakeOrders.insertId);
                                      });
                                    }
                                }
                             
                        }
                        else{
                            console.log("came to update");

                            for (var k=0;k<Cake.length;k++){  
                                    Cake[k]["CustomerId"] = CustomerData.Id;
                                    Cake[k]["OrderId"] = OrderId;
                                    Cake[k]["Product_amount"] = Cake[k].AMOUNT;
                                 
                                 delete Cake[k]["AMOUNT"];
                                 delete Cake[k]["ProductName"];
                                var product_id = Cake[k].Product_id;
                                var O_Id = Cake[k].InvoiceId;
                                delete Cake[k]["InvoiceId"];
                                delete Cake[k]["OrderDate"];
                                console.log(Cake[k]);
                                connection.query('UPDATE cakeorders SET ? WHERE OrderId = ? AND BakerId=? AND CustomerId = ? AND Product_id = ?', [Cake[k],O_Id,req.session.baker_id,CustomerData.Id,product_id], function(err_updateCakeOrder, doc_updateCakeOrder) {
                                if (err_updateCakeOrder){
                                    console.log("error in err_updateCakeOrder;")
                                    throw err_updateCakeOrder;
                                }

                               });

                            }
                           //var update_cake_orders = {'Product_amount':P_amount,'product_fields_json':product_data};
                            
                            //console.log(update_cake_orders)
                        
                            
                        }      
                     }); 
                }

                connection.query('select * from payments WHERE (OrderId ='+OrderId+' AND BakerId='+req.session.baker_id+' )',function(err_payments,doc_payments){
                    if (err_payments){
                        throw err_payments;  
                    }
                    
                        console.log("came to payments update")
                        payment[i] ={'PaymentStatus':'0','OrderId':OrderId,'BakerId':req.session.baker_id};
                        
                    console.log(payment[i]);
                    
                    connection.query('UPDATE payments SET ? WHERE OrderId = ? AND BakerId=?', [payment[i],OrderId,req.session.baker_id], function(err_updatePayment, doc_updatePayment) {
                       // console.log(doc_updatePayment)
                        if (err_updatePayment){
                            console.log("came to err_updatePayment")
                            throw err_updatePayment;
                        }
                        console.log(doc_updatePayment)
                       test.push(doc_updatePayment);
                        //console.log(res);
                       if(test.length > 0)
                       {
                         var Msg = "Hi "+CustomerData.Name+",Your order has been completed successfully with Deliciaso.";
//                         client.get('http://promo.variformsolutions.co.in/api/v3/?method=sms&api_key=A0c12b3bda0ee4564994faa12741cdaf7&to='+CustomerData.Mobile+'&sender=BULKSMS&message='+Msg, function (data, response) {
//
//                         if(response)
//                         {
//                           res.send(test);
//                         }
//                         });
                           console.log(test)
                           res.send(test);
                           //send_message(test)
                          
                       }
                        
                });
                        
     
                    
                });
                

          });
     
              
              
          }
        }
        else
        {  
            
       Billing["BakerId"] = req.session.baker_id;
            Billing["CustomerId"] = CustomerData.Id;
            Billing["OrderId"] = OrderId;
              
            connection.query('UPDATE orders SET ? WHERE OrderId = ? AND BakerId=? AND CustomerId = ?', [Billing,OrderId,req.session.baker_id,CustomerData.Id], function(err5, doc5) {
              if (err5)
               throw err5;
                
                //var OrderId = doc5.insertId;
                var InsertCakeData;
                for (var i=0;i<Cake.length;i++)     
                {
                        Cake[i]["PaymentStatus"] ="0";  
                        Cake[i]["DeliveryStatus"]="0";
                        Cake[i]["CustomerId"] = CustomerData.Id;
                        Cake[i]["OrderId"] = OrderId;
                        Cake[i]["BakerId"] = req.session.baker_id;
                        Cake[i]["Product_amount"] = Cake[i].AMOUNT;
                    var P_amount = Cake[i].AMOUNT;
                    P_id = Cake[i].Product_id;
                    var product_data = Cake[i].product_fields_json;  
                    var O_Id = Cake[i].OrderId;  
                        console.log("issue 2")
                        console.log(Cake[i]);
                        console.log('SELECT * FROM cakeorders WHERE (Product_id = '+P_id+' AND CustomerId = '+CustomerData.Id+' AND BakerID = '+req.session.baker_id+' AND OrderId = '+OrderId+')');
                    
                        connection.query('SELECT * FROM cakeorders WHERE (Product_id = '+P_id+' AND CustomerId = '+CustomerData.Id+' AND BakerID = '+req.session.baker_id+' AND OrderId = '+OrderId+')',function(err_cakeorders, doc_cakeorders) {
                            console.log("came to select cakeorders")
                            //console.log(doc_cakeorders.length)
                           // console.log(doc_cakeorders)
                            //res.send({"cakeOrdersData":doc_cakeorders});
                        if (err_cakeorders){
                            throw err_cakeorders;
                        }

                        if (doc_cakeorders.length == 0){ 
                            console.log("Insert Cake Orders record")
                            //console.log(Cake[j])
                            for (var j=0;j<Cake.length;j++){
                                if (P_id == Cake[j].ProductName ){
                                    Cake[j]["Product_amount"] = Cake[j].AMOUNT;
                                 delete Cake[j]["ProductName"];
                                   connection.query('INSERT INTO cakeorders SET ?', Cake[j], function(err_doc_InsertCakeOrders, doc_InsertCakeOrders) {
                                        if (err_doc_InsertCakeOrders){
                                            throw err_doc_InsertCakeOrders;
                                        }
                                         InsertedId.push(doc_InsertCakeOrders.insertId);
                                      });
                                    }

                            }
                            console.log(InsertedId);  
                        }
                        else{
                            console.log("came to update");

                            //delete Cake[i];
                           var update_cake_orders = {'Product_amount':P_amount,'product_fields_json':product_data};
                            
                            console.log(update_cake_orders)
                            
                        connection.query('UPDATE cakeorders SET ? WHERE OrderId = ? AND BakerId=? AND CustomerId = ? AND Product_id = ?', [update_cake_orders,O_Id,req.session.baker_id,CustomerData.Id,P_id], function(err_updateCakeOrder, doc_updateCakeOrder) {
                            if (err_updateCakeOrder){
                                console.log("error in err_updateCakeOrder;")
                                throw err_updateCakeOrder;
                            }
                             
                           });
                        }      
                     }); 
                }

                connection.query('select * from payments WHERE (OrderId ='+OrderId+' AND BakerId='+req.session.baker_id+' )',function(err_payments,doc_payments){
                    if (err_payments){
                        throw err_payments;
                    }
                    
                        console.log("came to payments update")
                        payment[i] ={'PaymentStatus':'0','OrderId':OrderId,'BakerId':req.session.baker_id};
                        
                    console.log(payment[i]);
                    
                    connection.query('UPDATE payments SET ? WHERE OrderId = ? AND BakerId=?', [payment[i],OrderId,req.session.baker_id], function(err_updatePayment, doc_updatePayment) {
                       // console.log(doc_updatePayment)
                        if (err_updatePayment){
                            console.log("came to err_updatePayment")
                            throw err_updatePayment;
                        }
                        console.log(doc_updatePayment)
                       test.push(doc_updatePayment);
                        //console.log(res);
                       if(test.length > 0)
                       {
                         var Msg = "Hi "+CustomerData.Name+",Your order has been completed successfully with Deliciaso.";
//                         client.get('http://promo.variformsolutions.co.in/api/v3/?method=sms&api_key=A0c12b3bda0ee4564994faa12741cdaf7&to='+CustomerData.Mobile+'&sender=BULKSMS&message='+Msg, function (data, response) {
//
//                         if(response)
//                         {
//                           res.send(test);
//                         }
//                         });
                           console.log(test)
                           res.send(test);
                           //send_message(test)
                          
                       }
                        
                });
                        
     
                    
                });
                

          });
            
        }

      // });
    }
    else
    {
      //connection.query('INSERT INTO customers SET ?', CustomerData, function(err11, doc11) {


          var CustomerId = CustomerData.Id;
          if(Billing.DeliveryType=="DoorDelivery")
          {
            if(NewDeliveryAddress)
            {
              var NewAddress = {"DeliveryAddress":NewDeliveryAddress,"CustomerId":CustomerId};
                
              connection.query('INSERT INTO deliveryaddress SET ?', NewAddress, function(err12, doc12) {
                Billing["DeliveryAddressId"] = doc12.insertId;
                Billing["CustomerId"] = CustomerId;
                Billing["BakerId"] = req.session.baker_id;
                Billing["OrderId"] = OrderId;
                 connection.query('UPDATE orders SET ? WHERE OrderId = ? AND BakerId=? AND CustomerId = ?', [Billing,OrderId,req.session.baker_id,CustomerData.Id], function(err5, doc5) {
              if (err5)
               throw err5;
                
                //var OrderId = doc5.insertId;
                var InsertCakeData;
                for (var i=0;i<Cake.length;i++)     
                {
                        Cake[i]["PaymentStatus"] ="0";  
                        Cake[i]["DeliveryStatus"]="0";
                        Cake[i]["CustomerId"] = CustomerData.Id;
                        Cake[i]["OrderId"] = OrderId;
                        Cake[i]["BakerId"] = req.session.baker_id;
                        Cake[i]["Product_amount"] = Cake[i].AMOUNT;
                    var P_amount = Cake[i].AMOUNT;
                    P_id = Cake[i].Product_id;
                    var product_data = Cake[i].product_fields_json;  
                    var O_Id = Cake[i].OrderId;  
                        console.log("issue 2")
                        console.log(Cake[i]);
                        console.log('SELECT * FROM cakeorders WHERE (Product_id = '+P_id+' AND CustomerId = '+CustomerData.Id+' AND BakerID = '+req.session.baker_id+' AND OrderId = '+OrderId+')');
                    
                        connection.query('SELECT * FROM cakeorders WHERE (Product_id = '+P_id+' AND CustomerId = '+CustomerData.Id+' AND BakerID = '+req.session.baker_id+' AND OrderId = '+OrderId+')',function(err_cakeorders, doc_cakeorders) {
                            console.log("came to select cakeorders")
                            //console.log(doc_cakeorders.length)
                           // console.log(doc_cakeorders)
                            //res.send({"cakeOrdersData":doc_cakeorders});
                        if (err_cakeorders){
                            throw err_cakeorders;
                        }

                        if (doc_cakeorders.length == 0){ 
                            console.log("Insert Cake Orders record")
                            //console.log(Cake[j])
                            for (var j=0;j<Cake.length;j++){
                                if (P_id == Cake[j].Product_id ){
                                    Cake[j]["Product_amount"] = Cake[j].AMOUNT;
                                 delete Cake[j]["ProductName"];
                                   connection.query('INSERT INTO cakeorders SET ?', Cake[j], function(err_doc_InsertCakeOrders, doc_InsertCakeOrders) {
                                        if (err_doc_InsertCakeOrders){
                                            throw err_doc_InsertCakeOrders;
                                        }
                                         InsertedId.push(doc_InsertCakeOrders.insertId);
                                      });
                                    }

                            }
                            console.log(InsertedId);  
                        }
                        else{
                            console.log("came to update");

                            //delete Cake[i];
                           var update_cake_orders = {'Product_amount':P_amount,'product_fields_json':product_data};
                            
                            console.log(update_cake_orders)
                            
                        connection.query('UPDATE cakeorders SET ? WHERE OrderId = ? AND BakerId=? AND CustomerId = ? AND Product_id = ?', [update_cake_orders,O_Id,req.session.baker_id,CustomerData.Id,P_id], function(err_updateCakeOrder, doc_updateCakeOrder) {
                            if (err_updateCakeOrder){
                                console.log("error in err_updateCakeOrder;")
                                throw err_updateCakeOrder;
                            }
                             
                           });
                        }      
                     }); 
                }

                connection.query('select * from payments WHERE (OrderId ='+OrderId+' AND BakerId='+req.session.baker_id+' )',function(err_payments,doc_payments){
                    if (err_payments){
                        throw err_payments;
                    }
                    
                        console.log("came to payments update")
                        payment[i] ={'PaymentStatus':'0','OrderId':OrderId,'BakerId':req.session.baker_id};
                        
                    console.log(payment[i]);
                    
                    connection.query('UPDATE payments SET ? WHERE OrderId = ? AND BakerId=?', [payment[i],OrderId,req.session.baker_id], function(err_updatePayment, doc_updatePayment) {
                       // console.log(doc_updatePayment)
                        if (err_updatePayment){
                            console.log("came to err_updatePayment")
                            throw err_updatePayment;
                        }
                        console.log(doc_updatePayment)
                       test.push(doc_updatePayment);
                        //console.log(res);
                       if(test.length > 0)
                       {
                         var Msg = "Hi "+CustomerData.Name+",Your order has been completed successfully with Deliciaso.";
//                         client.get('http://promo.variformsolutions.co.in/api/v3/?method=sms&api_key=A0c12b3bda0ee4564994faa12741cdaf7&to='+CustomerData.Mobile+'&sender=BULKSMS&message='+Msg, function (data, response) {
//
//                         if(response)
//                         {
//                           res.send(test);
//                         }
//                         });
                           console.log(test)
                           res.send(test);
                           //send_message(test)
                          
                       }
                        
                });
                        
     
                    
                });
                

          });
                  
              });
            }
            else
            {
            Billing["BakerId"] = req.session.baker_id;
            Billing["CustomerId"] = CustomerData.Id;
            Billing["OrderId"] = OrderId;
              
            connection.query('UPDATE orders SET ? WHERE OrderId = ? AND BakerId=? AND CustomerId = ?', [Billing,OrderId,req.session.baker_id,CustomerData.Id], function(err5, doc5) {
              if (err5)
               throw err5;
                
                //var OrderId = doc5.insertId;
                var InsertCakeData;
                for (var i=0;i<Cake.length;i++)     
                {
                        Cake[i]["PaymentStatus"] ="0";  
                        Cake[i]["DeliveryStatus"]="0";
                        Cake[i]["CustomerId"] = CustomerData.Id;
                        Cake[i]["OrderId"] = OrderId;
                        Cake[i]["BakerId"] = req.session.baker_id;
                        Cake[i]["Product_amount"] = Cake[i].AMOUNT;
                    var P_amount = Cake[i].AMOUNT;
                    P_id = Cake[i].Product_id;
                    var product_data = Cake[i].product_fields_json;  
                    var O_Id = Cake[i].OrderId;  
                        console.log("issue 2")
                        console.log(Cake[i]);
                        console.log('SELECT * FROM cakeorders WHERE (Product_id = '+P_id+' AND CustomerId = '+CustomerData.Id+' AND BakerID = '+req.session.baker_id+' AND OrderId = '+OrderId+')');
                    
                        connection.query('SELECT * FROM cakeorders WHERE (Product_id = '+P_id+' AND CustomerId = '+CustomerData.Id+' AND BakerID = '+req.session.baker_id+' AND OrderId = '+OrderId+')',function(err_cakeorders, doc_cakeorders) {
                            console.log("came to select cakeorders")
                            //console.log(doc_cakeorders.length)
                           // console.log(doc_cakeorders)
                            //res.send({"cakeOrdersData":doc_cakeorders});
                        if (err_cakeorders){
                            throw err_cakeorders;
                        }

                        if (doc_cakeorders.length == 0){ 
                            console.log("Insert Cake Orders record")
                            //console.log(Cake[j])
                            for (var j=0;j<Cake.length;j++){
                                if (P_id == Cake[j].Product_id ){
                                    Cake[j]["Product_amount"] = Cake[j].AMOUNT;
                                 delete Cake[j]["ProductName"];
                                   connection.query('INSERT INTO cakeorders SET ?', Cake[j], function(err_doc_InsertCakeOrders, doc_InsertCakeOrders) {
                                        if (err_doc_InsertCakeOrders){
                                            throw err_doc_InsertCakeOrders;
                                        }
                                         InsertedId.push(doc_InsertCakeOrders.insertId);
                                      });
                                    }

                            }
                            console.log(InsertedId);  
                        }
                        else{
                            console.log("came to update");

                            //delete Cake[i];
                           var update_cake_orders = {'Product_amount':P_amount,'product_fields_json':product_data};
                            
                            console.log(update_cake_orders)
                            
                        connection.query('UPDATE cakeorders SET ? WHERE OrderId = ? AND BakerId=? AND CustomerId = ? AND Product_id = ?', [update_cake_orders,O_Id,req.session.baker_id,CustomerData.Id,P_id], function(err_updateCakeOrder, doc_updateCakeOrder) {
                            if (err_updateCakeOrder){
                                console.log("error in err_updateCakeOrder;")
                                throw err_updateCakeOrder;
                            }
                             
                           });
                        }      
                     }); 
                }

                connection.query('select * from payments WHERE (OrderId ='+OrderId+' AND BakerId='+req.session.baker_id+' )',function(err_payments,doc_payments){
                    if (err_payments){
                        throw err_payments;
                    }
                    
                        console.log("came to payments update")
                        payment[i] ={'PaymentStatus':'0','OrderId':OrderId,'BakerId':req.session.baker_id};
                        
                    console.log(payment[i]);
                    
                    connection.query('UPDATE payments SET ? WHERE OrderId = ? AND BakerId=?', [payment[i],OrderId,req.session.baker_id], function(err_updatePayment, doc_updatePayment) {
                       // console.log(doc_updatePayment)
                        if (err_updatePayment){
                            console.log("came to err_updatePayment")
                            throw err_updatePayment;
                        }
                        console.log(doc_updatePayment)
                       test.push(doc_updatePayment);
                        //console.log(res);
                       if(test.length > 0)
                       {
                         var Msg = "Hi "+CustomerData.Name+",Your order has been completed successfully with Deliciaso.";
//                         client.get('http://promo.variformsolutions.co.in/api/v3/?method=sms&api_key=A0c12b3bda0ee4564994faa12741cdaf7&to='+CustomerData.Mobile+'&sender=BULKSMS&message='+Msg, function (data, response) {
//
//                         if(response)
//                         {
//                           res.send(test);
//                         }
//                         });
                           console.log(test)
                           res.send(test);
                           //send_message(test)
                          
                       }
                        
                });
                        
     
                    
                });
                

          });
            }
          }
          else
          {

             Billing["BakerId"] = req.session.baker_id;
            Billing["CustomerId"] = CustomerData.Id;
            Billing["OrderId"] = OrderId;
              
            connection.query('UPDATE orders SET ? WHERE OrderId = ? AND BakerId=? AND CustomerId = ?', [Billing,OrderId,req.session.baker_id,CustomerData.Id], function(err5, doc5) {
              if (err5)
               throw err5;
                
                //var OrderId = doc5.insertId;
                var InsertCakeData;
                for (var i=0;i<Cake.length;i++)     
                {
                        Cake[i]["PaymentStatus"] ="0";  
                        Cake[i]["DeliveryStatus"]="0";
                        Cake[i]["CustomerId"] = CustomerData.Id;
                        Cake[i]["OrderId"] = OrderId;
                        Cake[i]["BakerId"] = req.session.baker_id;
                    var P_amount = Cake[i].Product_amount;
                    P_id = Cake[i].Product_id;
                    var product_data = Cake[i].product_fields_json;  
                    var O_Id = Cake[i].OrderId;  
                        console.log("issue 2")
                        console.log(Cake[i]);
                        console.log('SELECT * FROM cakeorders WHERE (Product_id = '+P_id+' AND CustomerId = '+CustomerData.Id+' AND BakerID = '+req.session.baker_id+' AND OrderId = '+OrderId+')');
                    
                        connection.query('SELECT * FROM cakeorders WHERE (Product_id = '+P_id+' AND CustomerId = '+CustomerData.Id+' AND BakerID = '+req.session.baker_id+' AND OrderId = '+OrderId+')',function(err_cakeorders, doc_cakeorders) {
                            console.log("came to select cakeorders")
                            //console.log(doc_cakeorders.length)
                           // console.log(doc_cakeorders)
                            //res.send({"cakeOrdersData":doc_cakeorders});
                        if (err_cakeorders){
                            throw err_cakeorders;
                        }

                        if (doc_cakeorders.length == 0){ 
                            console.log("Insert Cake Orders record")
                            //console.log(Cake[j])
                            for (var j=0;j<Cake.length;j++){
                                if (P_id == Cake[j].Product_id ){
                                 delete Cake[j]["product_name"];
                                   connection.query('INSERT INTO cakeorders SET ?', Cake[j], function(err_doc_InsertCakeOrders, doc_InsertCakeOrders) {
                                        if (err_doc_InsertCakeOrders){
                                            throw err_doc_InsertCakeOrders;
                                        }
                                         InsertedId.push(doc_InsertCakeOrders.insertId);
                                      });
                                    }

                            }
                            console.log(InsertedId);  
                        }
                        else{
                            console.log("came to update");

                            //delete Cake[i];
                           var update_cake_orders = {'Product_amount':P_amount,'product_fields_json':product_data};
                            
                            console.log(update_cake_orders)
                            
                        connection.query('UPDATE cakeorders SET ? WHERE OrderId = ? AND BakerId=? AND CustomerId = ? AND Product_id = ?', [update_cake_orders,O_Id,req.session.baker_id,CustomerData.Id,P_id], function(err_updateCakeOrder, doc_updateCakeOrder) {
                            if (err_updateCakeOrder){
                                console.log("error in err_updateCakeOrder;")
                                throw err_updateCakeOrder;
                            }
                             
                           });
                        }      
                     }); 
                }

                connection.query('select * from payments WHERE (OrderId ='+OrderId+' AND BakerId='+req.session.baker_id+' )',function(err_payments,doc_payments){
                    if (err_payments){
                        throw err_payments;
                    }
                    
                        console.log("came to payments update")
                        payment[i] ={'PaymentStatus':'0','OrderId':OrderId,'BakerId':req.session.baker_id};
                        
                    console.log(payment[i]);
                    
                    connection.query('UPDATE payments SET ? WHERE OrderId = ? AND BakerId=?', [payment[i],OrderId,req.session.baker_id], function(err_updatePayment, doc_updatePayment) {
                       // console.log(doc_updatePayment)
                        if (err_updatePayment){
                            console.log("came to err_updatePayment")
                            throw err_updatePayment;
                        }
                        console.log(doc_updatePayment)
                       test.push(doc_updatePayment);
                        //console.log(res);
                       if(test.length > 0)
                       {
                         var Msg = "Hi "+CustomerData.Name+",Your order has been completed successfully with Deliciaso.";
//                         client.get('http://promo.variformsolutions.co.in/api/v3/?method=sms&api_key=A0c12b3bda0ee4564994faa12741cdaf7&to='+CustomerData.Mobile+'&sender=BULKSMS&message='+Msg, function (data, response) {
//
//                         if(response)
//                         {
//                           res.send(test);
//                         }
//                         });
                           console.log(test)
                           res.send(test);
                           //send_message(test)
                          
                       }
                        
                });
                        
     
                    
                });
                

          });
          }


     // });

    }
  });    

});



router.post('/GetInvoiceData',checkAuth, function(req, res, next) { 
    console.log(req.body);
    var invoiceData = req.body;
    var invoice_id = invoiceData.InvoiceId;
    var customerId = invoiceData.customeID;
    connection.query("SELECT cakeorders.OrderId AS InvoiceId,cakeorders.Product_id,products_master.Product_desc AS ProductName,cakeorders.Product_amount AS AMOUNT,cakeorders.product_fields_json,cakeorders.OrderDate FROM cakeorders JOIN products_master ON products_master.Id = cakeorders.Product_id WHERE cakeorders.BakerID = "+req.session.baker_id+" AND cakeorders.CustomerId = "+customerId+" AND cakeorders.OrderId = "+invoice_id+" ",function(invoice_err,OrderData){
       
        if(invoice_err){
            throw invoice_err;
        }
        else{
            res.send ({"InvoiceData":OrderData});
        }
        
    });

});

router.get('/GetOrderData/:api',checkAuth, function(req, res, next) {
        var partial_products_data   = [];
        var partial_products_data   = [];
        var completed_products_data = [];
        var cancelled_products_data = [];
    connection.query("SELECT c.Id AS customeID,c.Name,c.Email,c.Mobile,orders.DeliveryType,orders.OrderId AS InvoiceId,orders.Amount AS TotalAmount,orders.DeliveryDateTime,DeliveryType,DeliveryCharge,payments.PaidAmount AS Payable_amount,payments.PaymentStatus AS PaymentStatus,payments.BalanceAmount,payments.Discount FROM customers c,orders INNER JOIN customers ON orders.CustomerId=customers.Id INNER JOIN payments ON payments.OrderId = orders.OrderId WHERE payments.BakerId = "+req.session.baker_id+" AND payments.PaymentStatus = '0' AND orders.CustomerId=c.Id", function(err, doc){
      if(err){
         throw err; 
      }
      else{
          var pending_products_data = [];
          if (doc.length != 0){
            for (var i=0;i<doc.length;i++){
               var InvoiceId = doc[i].InvoiceId;
                connection.query("SELECT cakeorders.OrderId AS InvoiceId,cakeorders.Product_id,products_master.Product_desc,cakeorders.Product_amount,cakeorders.OrderDate,cakeorders.PaymentStatus,cakeorders.DeliveryStatus,cakeorders.product_fields_json FROM customers INNER JOIN cakeorders ON cakeorders.CustomerId=customers.Id INNER JOIN products_master  ON products_master.Id = cakeorders.Product_id WHERE cakeorders.BakerId = "+req.session.baker_id+" AND cakeorders.OrderId ="+InvoiceId+" ",function(product_err,product_data){
                    if (product_err){
                        throw product_err;
                    }
                    else{
                        pending_products_data.push(product_data);
                    }     
             
                }); 
            } 
          }
      }
      connection.query("SELECT c.Id AS customeID,c.Name,c.Email,c.Mobile,orders.DeliveryType,orders.OrderId AS InvoiceId,orders.Amount AS TotalAmount,orders.DeliveryDateTime,DeliveryType,DeliveryCharge,payments.PaymentStatus AS PaymentStatus,payments.PaidAmount AS Payable_amount,payments.BalanceAmount,payments.Discount FROM customers c,orders INNER JOIN customers ON orders.CustomerId=customers.Id INNER JOIN payments ON payments.OrderId = orders.OrderId WHERE payments.BakerId = "+req.session.baker_id+" AND payments.PaymentStatus = '1' AND orders.CustomerId=c.Id", function(err1, doc1){
        if(err1){
            throw err1;
        }
        else{
            
          if (doc1.length != 0){
            for (var i=0;i<doc1.length;i++){
               var InvoiceId = doc1[i].InvoiceId;
                connection.query("SELECT cakeorders.OrderId AS InvoiceId,cakeorders.Product_id,products_master.Product_desc,cakeorders.Product_amount,cakeorders.OrderDate,cakeorders.PaymentStatus,cakeorders.DeliveryStatus,cakeorders.product_fields_json FROM customers INNER JOIN cakeorders ON cakeorders.CustomerId=customers.Id INNER JOIN products_master  ON products_master.Id = cakeorders.Product_id WHERE cakeorders.BakerId = "+req.session.baker_id+" AND cakeorders.OrderId ="+InvoiceId+" ",function(partial_product_err,partial_product_data){
                    if (partial_product_err){
                        throw partial_product_err;
                    }
                    else{
                        partial_products_data.push(partial_product_data);
                    }     
                }); 
            } 
          }
        }
        connection.query("SELECT c.Id AS customeID,c.Name,c.Email,c.Mobile,orders.DeliveryType,orders.OrderId AS InvoiceId,orders.Amount AS TotalAmount,orders.DeliveryDateTime,DeliveryType,DeliveryCharge,payments.PaymentStatus AS PaymentStatus,payments.PaidAmount AS Payable_amount,payments.BalanceAmount,payments.Discount FROM customers c,orders INNER JOIN customers ON orders.CustomerId=customers.Id INNER JOIN payments ON payments.OrderId = orders.OrderId WHERE payments.BakerId = "+req.session.baker_id+" AND payments.PaymentStatus = '2' AND orders.CustomerId=c.Id", function(err2, doc2){
          if(err2){
              throw err2;
          }
          else{
             if (doc2.length != 0){
                for (var i=0;i<doc2.length;i++){
                   var InvoiceId = doc2[i].InvoiceId;
                    connection.query("SELECT cakeorders.OrderId AS InvoiceId,cakeorders.Product_id,products_master.Product_desc,cakeorders.Product_amount,cakeorders.OrderDate,cakeorders.PaymentStatus,cakeorders.DeliveryStatus,cakeorders.product_fields_json FROM customers INNER JOIN cakeorders ON cakeorders.CustomerId=customers.Id INNER JOIN products_master  ON products_master.Id = cakeorders.Product_id WHERE cakeorders.BakerId = "+req.session.baker_id+" AND cakeorders.OrderId ="+InvoiceId+" ",function(completed_product_err,Completed_products_data){
                        if (completed_product_err){
                            throw completed_product_err;
                        }
                        else{
                            completed_products_data.push(Completed_products_data);
                        }     
                    }); 
                } 
            } 
          }
          connection.query("SELECT c.Id AS customeID,c.Name,c.Email,c.Mobile,orders.DeliveryType,orders.OrderId AS InvoiceId,orders.Amount AS TotalAmount,orders.DeliveryDateTime,DeliveryType,DeliveryCharge,payments.PaymentStatus AS PaymentStatus,payments.PaidAmount AS Payable_amount,payments.BalanceAmount,payments.Discount,payments.CancelReason,payments.CancelledDate FROM customers c,orders INNER JOIN customers ON orders.CustomerId=customers.Id INNER JOIN payments ON payments.OrderId = orders.OrderId WHERE payments.BakerId = "+req.session.baker_id+" AND payments.PaymentStatus = '3' AND orders.CustomerId=c.Id", function(err3, doc3){
              if(err3){
                  throw err3;
              }
              else{
                if (doc3.length != 0){
                    for (var i=0;i<doc3.length;i++){
                       var InvoiceId = doc3[i].InvoiceId;
                        connection.query("SELECT cakeorders.OrderId AS InvoiceId,cakeorders.Product_id,products_master.Product_desc,cakeorders.Product_amount,cakeorders.OrderDate,cakeorders.PaymentStatus,cakeorders.DeliveryStatus,cakeorders.product_fields_json FROM customers INNER JOIN cakeorders ON cakeorders.CustomerId=customers.Id INNER JOIN products_master  ON products_master.Id = cakeorders.Product_id WHERE cakeorders.BakerId = "+req.session.baker_id+" AND cakeorders.OrderId ="+InvoiceId+" ",function(cancelled_product_err,cancelled_products_data){
                            if (cancelled_product_err){
                                throw cancelled_product_err;
                            }
                            else{
                                cancelled_products_data.push(cancelled_products_data);
                            }     
                        }); 
                      } 
                    } 
                  }
              
          res.send({"Pending":doc,"Pending_products_data":pending_products_data,
                    "Partial":doc1,"partial_products_data":partial_products_data,
                    "Completed":doc2, "completed_products_data":completed_products_data,
                    "Cancelled":doc3,"cancelled_products_data":cancelled_products_data});
        });
        });
      });
     
    });
  });


router.post('/ValidateCakeOrder',checkAuth,function(req,res){

  req.check('CakeName','Flavour Name is mandatory').notEmpty();
  req.check('CakeName','Maximum character(Max.50) limit exceeded for cake flavour.').len(0,50);
  // req.check('Type','Type is mandatory').notEmpty();
  req.check('Size','Size is mandatory').notEmpty();
  req.check('Amount','Amount is mandatory').notEmpty();
  req.check('Amount','Only integers are allowed for Amount.').isNumeric();

if(req.body.Quantity!=undefined)
{
    if(req.body.Quantity!="")
    {
      req.check('Quantity','Only integers are allowed for Quantity.').isNumeric();
    }
}


  var errors = req.validationErrors();
  console.log(errors);
  if (errors) {
    res.send(errors,200);
    return;
  }
  else
  {
    res.send(errors,200);
  }
});


router.post('/ValidateStep1',checkAuth,function(req,res){
console.log("came");
console.log(req.body);
req.check('Mobile','Mobile number required').notEmpty();
req.check('Mobile','Mobile number should be digits.').isNumeric();
req.check('Mobile','Mobile number should have 10 digits.').len(10,10);

req.check('Name','Customer Name required').notEmpty();
req.check('Name','Customer name length limit exceeded.').len(0,50);




if(req.body.Email!="")
{
  req.check('Email', 'Email is not valid.').isEmail();
}
if(req.body.Zip!="")
{
  req.check('Zip','Zip code should be digits.').isNumeric();
  req.check('Zip','Zip code should be 6 digits.').len(6,6);
}

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

router.post('/ValidateStep2',checkAuth,function(req,res){
console.log("came to step2");
console.log(req.body);
var Data = req.body;
console.log(Data);

if (errors) {
  res.send(errors,200);
  return;
}
else
{
  res.send(errors,200);
}

});


router.post('/EditCakeOrder',checkAuth,function(req,res){

console.log(req.body);
connection.query('UPDATE cakeorders SET ? WHERE Id = ?',[req.body, req.body.Id],function(err1, doc1){
res.send(doc1);
});

});  

router.post('/api/CancelPendingOrder',checkAuth,function(req,res){

connection.query('UPDATE payments SET ? WHERE OrderId = ?',[req.body, req.body.OrderId],function(err, doc){
  if(err)
  throw err;

  if(doc)
  {
    connection.query('SELECT CustomerId FROM cakeorders WHERE Id='+req.body.OrderId,function(err1, doc1){
      if(err1)
      throw err1;

      connection.query('SELECT Name,Mobile,Email FROM customers WHERE Id='+doc1[0].CustomerId,function(err2, doc2){
        if(err2)
        throw err2;
            var Message = 'Hi '+doc2[0].Name+', Your order has been cancelled successfully.';

           res.send(doc);
      });
    });
  }
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