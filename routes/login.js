var express = require('express');
var router = express.Router();
var connection = require('./db');
var bodyParser = require('body-parser');
var helpers = require("./helpers.js");
var path = require('path');
var multer = require('multer');
var crypto = require('crypto')
var storage = multer.diskStorage({
  destination: './public/upload/',
  filename: function (req, file, cb) {
    crypto.pseudoRandomBytes(16, function (err, raw) {
      if (err) return cb(err)

      cb(null, raw.toString('hex') + path.extname(file.originalname))
    })
  }
})

var upload = multer({ storage: storage })
 router.use(bodyParser.json());
 router.use(bodyParser.urlencoded({ extended: true }));
 router.use(bodyParser.json({uploadDir:'./public/upload'}));


router.get('/signup', function(req, res, next) {
  res.render('Login/Register');
});

router.post('/CheckDuplicate', function(req, res, next) {
var data = req.body;
connection.query('SELECT * FROM bakers WHERE OrganizationName="'+ req.body.organizationName+'"', function(err, data){
  var query='SELECT * FROM users WHERE email="'+ req.body.user_email+'" or mobile="'+ req.body.user_mobile+'"';
  console.log(data);
  connection.query(query , function(err1, data1){
    res.send({isCompanyExist:data.length > 0,isUserExist:data1.length > 0});
    });
    });
});
router.post('/login', function(req, res, next) {
  var query='SELECT * FROM users WHERE (email="'+ req.body.user_email+'" or mobile="'+ req.body.user_email+'") and password="'+helpers.encrypt(req.body.password)+'"';
  console.log(query);
  connection.query(query , function(err1, data){
    if(err1)
     throw err1;
     var isSuccess=false;
    if(data.length > 0){
 if(!data[0].isEmailConfirmed) {
  res.send({success:isSuccess,data:"You are not yet activated your store . Please Check your Email to activate your store.."});
  }else{
  isSuccess=data.length>0;
      req.session.user_id =data[0].Id;
      req.session.baker_id = data[0].bakerId;
      var get_logo = 'SELECT LogoPath FROM bakers WHERE Id=?'
        connection.query(get_logo ,data[0].bakerId, function(err2, result){
          if(err2)
           throw err2;
          res.send({success:isSuccess,data:data,logo:result[0].LogoPath});
        });
    }
      }
      else {
             res.send({success:isSuccess,data:"Invalid user name and password."});
      }

  });
});
router.get('/Logout',checkAuth, function (req, res) {
  console.log("logout");
  req.session.destroy();
  res.redirect('/');
});
router.get('/validate/:id', function(req, res, next) {
var id = req.params.id;
try{
    var query='SELECT * FROM users WHERE  Id="'+helpers.decrypt(id)+'"';
  console.log(query);
  connection.query(query , function(err1, data){
    if(err1)
     throw err1;
    if(data.length > 0){
    connection.query('UPDATE users SET isEmailConfirmed = ? WHERE Id = ?', [true, helpers.decrypt(id)],function(err,data1){
    if(err)
     throw err;
     req.session.emailConfirmMsg="Your store activated, Please login.";
     res.redirect('/');
     });
    }else{
    res.send({success:true,msg:"Invalid link"},400);
    }
  });
}
catch(e){
res.send({success:false,msg:e},400);
}
});

router.get('/CheckEmail', function(req, res, next) {
    res.send({success:true,msg: req.session.emailConfirmMsg},200);
});

router.post('/SendOtp', function(req, res, next) {
  var query='SELECT * FROM users WHERE  mobile="'+ req.body.mobile+'"';
 connection.query(query , function(err1, data){
  if(err1)
     throw err1;
    if(data.length > 0){
         var otp=helpers.randomString(4,"digits");
         var Msg = "Hi "+otp+",Your order has been completed successfully with Deliciaso."
         client.get('http://promo.variformsolutions.co.in/api/v3/?method=sms&api_key=A0c12b3bda0ee4564994faa12741cdaf7&to=9591654078&sender=BULKSMS&message='+Msg, function (data2, response) {
          console.log(response);
          if(response)
          {
            OTPData={"UserId":data[0].Id,"OTP":otp};
            connection.query('INSERT INTO otp SET ?', OTPData,function(err,data1){
              if(err)
                 throw err;
                 res.send({success:true,data:data},200);
              });
          }
        });
    }
  else{
      res.send({success:false,data:"Mobile number not exist."},200);
  }
 });

});

router.post('/Register',upload.single('file'),function (req, res) {
var data = req.file;
if(data.mimetype =='image/jpeg' || data.mimetype == 'image/png')
{
   var url = data.filename;
   try{
   var baker={'OrganizationName': req.body.organizationName ,'Mobile': req.body.organizationMobile, 'Email':req.body.organizationEmail, 'ContactName':req.body.userName, 'OrganizationAddress':req.body.organizationAddress, 'OrganizationZip':req.body.organizationZip, 'VatNo':req.body.organizationVatNo, 'ValidUpTo':req.body.OrganizationValidUpto,'LogoPath':url};
    connection.query('INSERT INTO bakers SET ?', baker, function(err, response) {
       if(err)
       throw err;
       var bakerId=response.insertId ;
     var user={'username':req.body.userName,'email':req.body.user_email,'mobile':req.body.user_mobile,'password':helpers.encrypt(req.body.user_password),'bakerId':bakerId };
          connection.query('INSERT INTO users SET ?', user, function(err1, response1) {
       if(err1)
       throw err1;
         req.session.user_id =response1.insertId;
         req.session.baker_id = bakerId;
         res.send(response1,200);
         var encryptId=helpers.encrypt((response1.insertId).toString());
         console.log(encryptId);
          var hostname = req.headers.host; // hostname = 'localhost:8080'
          var url='http://' + hostname + "/login/validate/"+encryptId;
          fs = require('fs');
          fs.readFile('./public/emailverification.html', 'utf8', function (err,data) {
           if (err) {
               return console.log(err);
            }
            data=data.replace("$$activationlink$$", "<a href='"+url+"' >click here </a>");
               data=data.replaceAll('$$username$$',  req.body.userName);
            console.log(data);
            helpers.sendMail(req.body.user_email,"Welcome to Deliciaso.",data)
});
         });
     });
   }

   catch(err2){
   throw err2;
   }
}
else {
    res.json({ status: 'failure', message: 'Please upload image file'});
}

});
String.prototype.replaceAll = function(searchStr, replaceStr) {
    var str = this;
    
    // escape regexp special characters in search string
    searchStr = searchStr.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&');
    
    return str.replace(new RegExp(searchStr, 'gi'), replaceStr);
};
 function  checkAuth(req, res, next) {
  if (!req.session.user_id) {
   res.redirect('/');
  } else {
    next();
  }
}

module.exports = router;