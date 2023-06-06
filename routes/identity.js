const router = require("express").Router();
const Query = require("../db/query")
const moment = require("moment");
const { all } = require("axios");
var _ = require('lodash');

router.post("/identify", contactTrace)

async function contactTrace(req, res) {
    const { email, phoneNumber } = req.body;
    if (email == null && phoneNumber == null) {
        res.status(400).send({ message: "BAD REQUEST" })
        return;
    }
    const allRowsForEmailOrPhone = await Query.getByEmailOrPhone(email, phoneNumber);
    if (email == null && phoneNumber) {
        console.log("in null email");
        const uniqueEmailIds = new Set();
        allRowsForEmailOrPhone.forEach(contact => {
            uniqueEmailIds.add(contact.email);
        })
        const uniqueEmailIdsArr = [...uniqueEmailIds]

        uniqueEmailIdsArr.forEach(async email => {
            const dataForEachEmail = await Query.getByEmailAndPhone(email, null);
            dataForEachEmail.forEach(contact => {
                if (!allRowsForEmailOrPhone.includes(contact))
                    allRowsForEmailOrPhone.push(contact);
            })
        })
    }
    if (email && phoneNumber == null) {
        console.log("in null phone");
        const uniquePhonenumbers = new Set();
        allRowsForEmailOrPhone.forEach(contact => {
            uniquePhonenumbers.add(contact.phoneNumber);
        })
        const uniquePhonenumbersArr = [...uniquePhonenumbers]
        uniquePhonenumbersArr.forEach(async number => {
            const dataForEachNumber = await Query.getByEmailAndPhone(null, number);
            dataForEachNumber.forEach(contact => {
                if (!allRowsForEmailOrPhone.includes(contact.id))
                    allRowsForEmailOrPhone.push(contact);
            })
        })
    }

    /*
    *if email&phone==null then throw error.

    *Get all rows for phone and email.
        *if phone/email is null:-
            *Then get all rows again for that email/phone.
            *With each row again find with the respective email/phone.

    *If Rows Not Present:-
        * Make primary Contact.
        
    * Else :-
        *Check if primary contact is missing then add through linkedId as id primary key.
        *If primary contact is present then add all the linkedId.
        *Find exact match of the request:-
            *If Present then return the consolidated Response.
            *If Not Present then create secondary contact and 
                display the consolidated result along with the inserted data.
        
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
        const primaryContacts = primaryPresent.primaryContacts;
        if (!primaryPresent.primaryPresentFlag) {
            const primaryContactId = allRowsForEmailOrPhone[0].linkedId;
            const primaryContact = await Query.getById(primaryContactId);
            console.log("++++", primaryContact);
            allRowsForEmailOrPhone.push(primaryContact[0]);
        } else {
            const linkedContacts = await Query.getByLinkedId(allRowsForEmailOrPhone[0].id);
            linkedContacts.forEach(contact => {
                allRowsForEmailOrPhone.push(contact)
            })

        }

        const exactData = await Query.getByEmailAndPhone(email, phoneNumber);
        console.log('EXAACTTTdataa---->', exactData);
        console.log("allRowsForEmailOrPhone ====>>", allRowsForEmailOrPhone);

        if (exactData.length != 0) {
            res.send({ "contact": responseMapper(allRowsForEmailOrPhone) })
        }
        else {
            console.log("primarySwitch", primaryPresent);
            if (primaryPresent.count > 1) {
                await changePrimaryToSecondary(primaryContacts);
                const updatedAllRowsForEmailOrPhone = await Query.getByEmailOrPhone(email, phoneNumber);
                res.status(200).send({ contact: responseMapper(updatedAllRowsForEmailOrPhone) });

            }
            else {
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
    data = _.uniqBy(JSON.parse(JSON.stringify(data)), "id");
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


        if (!responseData.emails.includes(contact.email) && contact.email != null) {
            responseData['emails'].push(contact.email);
        }
        if (!responseData.phoneNumbers.includes(contact.phoneNumber) && contact.phoneNumber != null) {
            responseData['phoneNumbers'].push(contact.phoneNumber);
        }

    });
    return responseData;
}

function primaryIdFinder(data) {
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
    let count = 0;
    let primaryContacts = []
    data.forEach(row => {
        //console.log("ER_>", row);
        if (row.linkPrecedence == 'primary') {
            primaryPresentFlag = true;
            count++;
            primaryContacts.push(row);
        }
    })
    return {
        primaryPresentFlag,
        count,
        primaryContacts
    }
}

async function changePrimaryToSecondary(primaryContacts) {
    console.log("----Switching primary to SEcondary----");
    const id = []
    primaryContacts.forEach(contact => {
        id.push(contact.id);
    })
    id.sort((a, b) => {
        return a - b;
    })
    const primaryId = id[0];
    id.shift();
    id.forEach(async id => {
        await Query.updateLinkPrecedenceById(id, primaryId, "secondary")
    })
    return;
}





module.exports = router;