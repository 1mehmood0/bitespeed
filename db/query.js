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
    console.log(email, phoneNumber, "<---in getBYBOTH");
    let query;
    let variable = []
    if (email == null) {
        query = 'SELECT * FROM contact WHERE phoneNumber = ?'
        variable = [phoneNumber]
    }
    if (phoneNumber == null) {
        query = 'SELECT * FROM contact WHERE email = ?';
        variable = [email]
    }
    if (email != null && phoneNumber != null) {
        query = 'SELECT * FROM contact WHERE email = ? AND phoneNumber = ?';
        variable = [email, phoneNumber]
    }
    //console.log(moment().format('yyyy-MM-DD hh:mm:ss.SS'))
    return new Promise((resolve, reject) => {
        connection.query(query, variable, (err, data) => {
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

async function updateLinkPrecedenceById(id, linkedId, linkPrecedence) {
    const updatedAt = moment().format('yyyy-MM-DD hh:mm:ss.SS ');
    let query = 'UPDATE contact SET linkPrecedence = ?,linkedId = ?,updatedAt= ? WHERE id = ?';
    return new Promise((resolve, reject) => {
        connection.query(query, [linkPrecedence, linkedId, updatedAt, id], (err, data) => {
            if (err) {
                console.log("Query Failed", err);
                reject(err);
            }
            //console.log("daTA FROM AND QUERY->>", data[0]);
            console.log("UPDATEEE DATA--->>>>>>", data)
            return resolve(data);
        })

    })
}

async function getByLinkedId(id) {
    let query = 'SELECT * FROM contact WHERE linkedId = ?';
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

module.exports = {
    getByEmailOrPhone,
    insertIntoDatabase,
    getByEmailAndPhone,
    getById,
    updateLinkPrecedenceById,
    getByLinkedId
}