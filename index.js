const express = require("express");
require("dotenv").config();

const app = express();
const PORT = "9020"
const connection = require("./db/index")
//console.log("conn->", connection)

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

const identityRouter = require("./routes/identity");
app.use("/", identityRouter);

app.get('/', (req, res) => {
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