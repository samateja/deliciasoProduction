// main.js
var crypto = require('crypto'),algorithm = 'aes-256-ctr',  password = 'd6F3Efeq';
var nodemailer = require('nodemailer');
var emailUserName="xyz@gmail.com";
var emailPassword="zyz";
var helpers = {
 randomString:function(len,type) {
  var charSet =  'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  var alphabetsOnly = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
  var digitsOnly = '0123456789';

      if(type=="alphabets")
      {
        var randomString = '';
        for (var i = 0; i < len; i++) {
            var randomPoz = Math.floor(Math.random() * alphabetsOnly.length);
            randomString += alphabetsOnly.substring(randomPoz,randomPoz+1);
        }
        return randomString;
      }
      else if (type=="digits") {

        var randomString = '';
        for (var i = 0; i < len; i++) {
            var randomPoz = Math.floor(Math.random() * digitsOnly.length);
            randomString += digitsOnly.substring(randomPoz,randomPoz+1);
        }
        return randomString;
      }
      else if (type=="mixed") {
        var randomString = '';
        for (var i = 0; i < len; i++) {
            var randomPoz = Math.floor(Math.random() * charSet.length);
            randomString += charSet.substring(randomPoz,randomPoz+1);
        }
        return randomString;
      }
},
 encrypt:function(text){
  try{
  var cipher = crypto.createCipher(algorithm,password)
  var crypted = cipher.update(text,'utf8','hex')
  crypted += cipher.final('hex');
  console.log(crypted);
  return crypted;
  }
  catch(e){
    throw e;
  }

},

 decrypt:function(text){
   try{
    var response=[];
  var decipher = crypto.createDecipher(algorithm,password)
  var dec = decipher.update(text,'hex','utf8')
  dec += decipher.final('utf8');
  return dec;
  }
  catch(e){
    throw e;
  }
},
 sendMail:function(toMail,subject,body)
{
   var transporter = nodemailer.createTransport({
                    service: 'Gmail',
                    auth: {
                    user: emailUserName,
                    pass: emailPassword
                    }
                    });

                    var mailOptions = {
                    from: emailUserName,
                    to: toMail,
                    subject: subject,
                    html:body
                    }

                    transporter.sendMail(mailOptions, function(error, info){
                    if(error){
                    res.send(error);
                    }else{
                    return true;
                    };
                    });
}

};
module.exports=helpers;