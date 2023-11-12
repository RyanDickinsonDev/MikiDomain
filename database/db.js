const mysql = require("mysql2");
const session = require("express-session");
const MYSQL_STORED = require("express-mysql-session")(session);

const pool = mysql.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASS,
  database: process.env.DB_NAME,
  socketPath: "/var/run/mysqld/mysqld.sock",
  connectionLimit: 10,
});

// Timeout session after 20 Minutes based on checkExpirationInterval
const sessionStore = new MYSQL_STORED(
  { clearExpired: true, checkExpirationInterval: 1200000 },
  pool
);

module.exports = {
  sessionStore,
};

module.exports = pool.promise();