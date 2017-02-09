var mysql = require('mysql');

//var connection = mysql.createConnection({
//  host     : 'foxglove.arvixe.com',
//  user     : 'deliciasotest',
//  password : 'deliciasotest',
//  database: 'deliciasotest',
//  multipleStatements: true
//});

var connection = mysql.createConnection({
  host     : 'localhost',
  user     : 'root',
  password : '',
  database: 'deliciaso',
  multipleStatements: true
});

connection.connect(function(err) {
    if (err) throw err;
      console.log('You are now connected db...');
});

module.exports = connection;