const router = require("express").Router();
const connection = require("../db/index");
const moment = require("moment");

router.post("/identify", contactTrace)

async function contactTrace(req, res) {
    const data = { 'email': "msyed7008@gmail.cm", 'phoneNumber': '1234567895' };
    const { email, phoneNumber } = req.body;
    let linkPrecedence = "primary";
    let query = 'SELECT * FROM contact WHERE email = ? OR phoneNumber = ?';
    console.log(moment().format('yyyy-MM-DD hh:mm:ss.SS'))
    connection.query(query, [email, phoneNumber], (err, data) => {
        if (err) {
            console.log("Query Failed", err);
        }
        console.log("daTA FROM OR QUERY->>", data[0]);
        /*If Data Not  Present:-

            * Make primary COntact
            * else create secondary contact
            
               */
        if (data.length == 0) {
            linkPrecedence = 'primary';
            let data = {
                linkPrecedence: linkPrecedence,
                email: email,
                phoneNumber: phoneNumber,
                createdAt: moment().format('yyyy-MM-DD hh:mm:ss.SS ')
            }
            let queryToinsert = 'INSERT into contact SET ?'
            connection.query(queryToinsert, [data], (err, data) => {
                if (err) {
                    console.log("Query Failed", err);
                    res.status(500).send("Internal Error")
                }
                else {
                    console.log("inserted successfully")
                    res.status(200).send(responseMapper(data));
                }
            })
        }

        else {
            const queryForExactMatch = 'SELECT * FROM contact WHERE email = ? AND phoneNumber = ?';
            connection.query(queryForExactMatch, [email, phoneNumber], (err, data) => {
                if (err) console.log("Error in query");
                else {
                    console.log("EXACTDATA->>", data);
                }
            });
            console.log("Data already present")
            res.send({ "contact": responseMapper(data) })
        }

    })


}
/*
{
        "contact":{
            "primaryContatctId": 1,
            "emails": ["lorraine@hillvalley.edu","mcfly@hillvalley.edu"]
            "phoneNumbers": ["123456"]
            "secondaryContactIds": [23]
        }
    }
*/
function responseMapper(data) {
    const responseData = {
        emails: [],
        phoneNumbers: [],
        secondaryContactIds: []
    }
    responseData['primaryContactId'] = data[0].id;
    data.forEach(contact => {
        responseData['emails'].push(contact.email);
        responseData['phoneNumbers'].push(contact.phoneNumber);
        responseData['secondaryContactIds'].push(contact.id)
    });
    responseData['secondaryContactIds'].pop(responseData['primaryContactId']);
    //console.log(responseData);
    return responseData;
}

module.exports = router;