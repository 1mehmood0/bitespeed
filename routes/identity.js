const router = require("express").Router();
const Query = require("../db/query")
const moment = require("moment");
const { all } = require("axios");

router.post("/identify", contactTrace)

async function contactTrace(req, res) {
    const { email, phoneNumber } = req.body;
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
        const primaryPresent = isPrimaryContactPresent(allRowsForEmailOrPhone);
        console.log("isPRESTNN???", primaryPresent);
        if (!primaryPresent) {
            const primaryContactId = allRowsForEmailOrPhone[0].linkedId;
            const primaryContact = await Query.getById(primaryContactId);
            console.log("++++", primaryContact);
            allRowsForEmailOrPhone.push(primaryContact[0]);
        }

        const exactData = await Query.getByEmailAndPhone(email, phoneNumber);
        //console.log("ED--->>", exactData);
        if (exactData.length != 0) {
            res.send({ "contact": responseMapper(allRowsForEmailOrPhone) })
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
                res.status(200).send({ contact: responseMapper(allRowsForEmailOrPhone) });

            }
        }
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
    console.log("Data TO MAPP->", data)
    const responseData = {
        emails: [],
        phoneNumbers: [],
        secondaryContactIds: []
    }
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
    return responseData;
}

async function primaryIdFinder(data) {
    let id;
    data.forEach(row => {
        if (row.linkPrecedence == 'primary') {
            id = row.id;
            return;
        }
    })
    return id;
}

function isPrimaryContactPresent(data) {
    let primaryPresentFlag = false;
    data.forEach(row => {
        console.log("ER_>", row);
        if (row.linkPrecedence == 'primary') {
            primaryPresentFlag = true;
            return;
        }
    })
    return primaryPresentFlag;
}



module.exports = router;