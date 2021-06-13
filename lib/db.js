var mysql = require('mysql');
var db = mysql.createConnection({
    host:'database-1.ce9lv9pci00i.ap-northeast-2.rds.amazonaws.com',
    user:'admin',
    password:'12345678!',
    database:'yachoo'
  });
db.connect();
module.exports = db;