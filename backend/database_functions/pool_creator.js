const mysql = require("mysql2/promise");
const { host, user, password, database } = require("../creds");
let pool = mysql.createPool({
  connectionLimit: 50,
  host: host,
  user: user,
  password: password,
  database: database,
  multipleStatements: true
});

module.exports = pool;
