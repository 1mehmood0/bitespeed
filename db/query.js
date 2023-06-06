const connection = require("./index");
const moment = require("moment");


async function getByEmailOrPhone(email, phoneNumber) {
    let query = 'SELECT * FROM contact WHERE email = ? OR phoneNumber = ?';
    //console.log(moment().format('yyyy-MM-DD hh:mm:ss.SS'))
    return new Promise((resolve, reject) => {
        connection.query(query, [email, phoneNumber], (err, data) => {
            if (err) {
                console.log("Query Failed", err);
                reject(err);
            }
            //console.log("daTA FROM OR QUERY->>", data[0]);
            return resolve(data);
        })

    })
}

async function insertIntoDatabase(data) {

    let queryToinsert = 'INSERT into contact SET ?'
    return new Promise((resolve, reject) => {
        connection.query(queryToinsert, [data], (err, data) => {
            if (err) {
                console.log("Query Failed", err);
                return reject(err);

            }
            else {
                console.log("inserted successfully")
                console.log(data)
                resolve(data);
            }
        })
    })

}

async function getByEmailAndPhone(email, phoneNumber) {
    let query = 'SELECT * FROM contact WHERE email = ? AND phoneNumber = ?';
    //console.log(moment().format('yyyy-MM-DD hh:mm:ss.SS'))
    return new Promise((resolve, reject) => {
        connection.query(query, [email, phoneNumber], (err, data) => {
            if (err) {
                console.log("Query Failed", err);
                reject(err);
            }
            //console.log("daTA FROM AND QUERY->>", data[0]);
            return resolve(data);
        })

    })
}

async function getById(id) {
    let query = 'SELECT * FROM contact WHERE id = ?';
    //console.log(moment().format('yyyy-MM-DD hh:mm:ss.SS'))
    return new Promise((resolve, reject) => {
        connection.query(query, [id], (err, data) => {
            if (err) {
                console.log("Query Failed", err);
                reject(err);
            }
            //console.log("daTA FROM AND QUERY->>", data[0]);
            return resolve(data);
        })

    })
}

module.exports = { getByEmailOrPhone, insertIntoDatabase, getByEmailAndPhone, getById }