var mysql = require('mysql');
var db = mysql.createConnection({
    host:'localhost',
    user:'root',
    password:'wndudwjd1',
    database:'study_db'
  });
db.connect();
module.exports = db;
