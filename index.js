const express = require("express");
require("dotenv").config();

const app = express();
const PORT = "9020"
const mysql = require("mysql")

let connection = mysql.createConnection({
    host: 'localhost',
    port: '3307',
    user: 'root',
    password: process.env.DB_PASS,
    database: process.env.DB_NAME
});
//console.log("conn->", connection)


app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use('/', (req, res) => {
    res.send("backend running");
})

app.listen(PORT, () => {
    console.log(`Server running on PORT ${PORT}`)
    connection.connect((err) => {
        if (err) {
            throw new Error("Connection Failed", err);
        }
        console.log("Connected to DB")
    })
})