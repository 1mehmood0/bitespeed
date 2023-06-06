const router = require("express").Router();
const connection = require("../db/index");
const Query = require("../db/query")
const moment = require("moment");
const { all } = require("axios");

router.post("/identify", contactTrace)

async function contactTrace(req, res) {
    const data = { 'email': "msyed7008@gmail.cm", 'phoneNumber': '1234567895' };
    const { email, phoneNumber } = req.body;
    let linkPrecedence = "primary";
    const allRowsForEmailOrPhone = await Query.getByEmailOrPhone(email, phoneNumber);
    console.log("allRowsForEmailOrPhone", allRowsForEmailOrPhone);
    /*If Data Not  Present:-

        * Make primary COntact
        * else create secondary contact
        
           */
    if (allRowsForEmailOrPhone.length == 0) {
        let data = {
            linkPrecedence: 'primary',
            email: email,
            phoneNumber: phoneNumber,
            createdAt: moment().format('yyyy-MM-DD hh:mm:ss.SS ')
        }
        try {
            const dataForInserted = await Query.insertIntoDatabase(data);
            //console.log("dataForinserted", dataForInserted);
            res.status(200).send({
                "contact": {
                    "primaryContatctId": dataForInserted.insertId,
                    "emails": [email],
                    "phoneNumbers": [phoneNumber],
                    "secondaryContactIds": []
                }
            });
        } catch (error) {
            console.log("Query Failed", error);
        }


    }

    else {
        const exactData = await Query.getByEmailAndPhone(email, phoneNumber);
        //console.log("ED--->>", exactData);
        if (exactData.length != 0) {
            res.send({ "contact": responseMapper(exactData) })
        }
        else {
            if (allRowsForEmailOrPhone) {
                const linkedId = primaryIdFinder(allRowsForEmailOrPhone);
                linkPrecedence = "secondary";
                let dataSecondary = {
                    linkPrecedence: 'secondary',
                    email: email,
                    phoneNumber: phoneNumber,
                    linkedId: linkedId,
                    createdAt: moment().format('yyyy-MM-DD hh:mm:ss.SS ')
                }
                //console.log(dataSecondary, "<--")
                const dataForInserted = await Query.insertIntoDatabase(dataSecondary);
                dataSecondary['id'] = dataForInserted.insertId;
                allRowsForEmailOrPhone.push(dataSecondary);
                res.status(200).send(responseMapper(allRowsForEmailOrPhone));

            }
        }
        console.log("Data already present")
        //
    }

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
    //responseData['primaryContactId'] = data[0].id;
    data.forEach(contact => {
        if (contact.linkPrecedence == 'primary') {
            responseData['primaryContactId'] = contact.id;
        }
        else {
            responseData['secondaryContactIds'].push(contact.id)
        }
        if (!responseData.emails.includes(contact.email)) {
            responseData['emails'].push(contact.email);
        }
        if (!responseData.phoneNumbers.includes(contact.phoneNumber)) {
            responseData['phoneNumbers'].push(contact.phoneNumber);
        }

    });
    //responseData['secondaryContactIds'].pop(responseData['primaryContactId']);
    //console.log(responseData);
    return responseData;
}

function primaryIdFinder(data) {
    let id;
    data.forEach(row => {
        console.log("ER_>", row);
        if (row.linkPrecedence == 'primary') {
            id = row.id;
            return;
        }
    })
    return id;
}

module.exports = router;