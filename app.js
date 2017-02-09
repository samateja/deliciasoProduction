var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var session = require('express-session');
var app = express();
var port = process.env.PORT || '8081';
app.listen(port, function () {
console.log('app listening on port '+port+'!')
})
// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');
//un comment
// uncomment after placing your favicon in /public
//app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
app.use(logger('dev'));
app.use(session({
    secret: '2C32-4D44-WppQ38S',
    resave: true,
    saveUninitialized: true
}));
 app.use(express.static('public'));
//app.use(express.static(path.join(__dirname, 'public')));
//import routes
var routes = require('./routes/index');
var login = require('./routes/login');
var dashboard = require('./routes/dashboard');
var customer = require('./routes/customers');
var order = require('./routes/order');
var payment = require('./routes/payment');
var product = require('./routes/product');

app.use('/', routes);
app.use('/login', login);
app.use('/dashboard', dashboard);
app.use('/customers', customer);
app.use('/order', order);
app.use('/payment', payment);
app.use('/products', product);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  var err = new Error('Not Found');
  err.status = 404;
  next(err);
});

// error handlers
// development error handler
// will print stacktrace
if (app.get('env') === 'development') {
  app.use(function(err, req, res, next) {
    res.status(err.status || 500);
    res.render('error', {
      message: err.message,
      error: err
    });
  });
}

// production error handler
// no stacktraces leaked to user
app.use(function(err, req, res, next) {
  res.status(err.status || 500);
  res.render('error', {
    message: err.message,
    error: {}
  });
});


module.exports = app;
