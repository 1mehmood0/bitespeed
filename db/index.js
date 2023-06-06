const mysql = require("mysql")

let connection = mysql.createConnection({
    host: 'localhost',
    port: '3307',
    user: 'root',
    password: process.env.DB_PASS,
    database: process.env.DB_NAME
});


module.exports = connection