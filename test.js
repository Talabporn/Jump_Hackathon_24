const express = require('express')
const app = express()
const cors = require('cors')
const bodyParser = require('body-parser')
const request = require('request').defaults({strictSSL: true});

const domain = 'https://iot-apiv3.ais.co.th/'

app.use(bodyParser.json())
app.use(cors())


// ให้บริการไฟล์สถิติจากโฟลเดอร์ public
app.use(express.static('public'));


app.post('/4WE/SMS' , async (req, res) => {

    const authResult = await fetchAuth().catch((e) => {console.log(e)})
    const authorization = 'bearer ' + JSON.parse(authResult).access_token
    const result = await fetch('api/v3/bdg/sms' , authorization, req.body).catch((e) => {
        console.log(e)
        res.status(400).json(e)
    })
    res.status(200).send(result)
});

app.post('/4WE/OTP/SEND' , async (req, res) => {

    const authResult = await fetchAuth().catch((e) => {console.log(e)})
    const authorization = 'bearer ' + JSON.parse(authResult).access_token
    const result = await fetch('api/v3/gsso/otp/send' , authorization, req.body).catch((e) => {
        console.log(e)
        res.status(400).json(e)
    })
    res.status(200).send(result)
});

app.post('/4WE/OTP/CONFIRM' , async (req, res) => {

    const authResult = await fetchAuth().catch((e) => {console.log(e)})
    const authorization = 'bearer ' + JSON.parse(authResult).access_token
    const result = await fetch('api/v3/gsso/otp/confirm' , authorization, req.body).catch((e) => {
        console.log(e)
        res.status(400).json(e)
    })
    res.status(200).send(result)
});

app.post('/4WE/NUMVERIFY' , async (req, res) => {

    // console.log("1")

    const authResult = await fetchNumber().catch((e) => {console.log(e)})
    // console.log("2")
    // const authorization = 'bearer ' + JSON.parse(authResult).access_token
    // const result = await fetch('api/v3/gsso/otp/confirm' , authorization, req.body).catch((e) => {
    //     console.log(e)
    //     res.status(400).json(e)
    // })
    res.status(200).send(authResult)
});

process.on('uncaughtException', (err) => {
    console.log(err)
});

app.listen(8090 , () => {       
    console.log('Start server at port 8090');
});

const fetch = (URI , authorization, reqBody) => {
    return new Promise((resolve , reject) => {
        console.log("=====")
        console.log(reqBody)
        let postHeader = {}
        postHeader['Content-Type'] = 'application/json'
        postHeader['Authorization'] = authorization
        postHeader['X-Tid'] = createTransactionID(14)
        postHeader['X-Requester'] = 'Web Broker'

        let options = {}
        options['method'] = 'POST'
        options['url'] = domain + URI
        options['headers'] = postHeader
        options['body'] = reqBody
        options['json'] = true

        console.log("\r\n======= API Request =======\r\n")
        console.log(options,"\r\n")
        request(options, function(err, res, body) {
            if (err) {
                console.log(err)
                if (isJSON(err)) reject({description:JSON.parse(err)});
                reject({description:err});
            } else { 

                console.log("\r\n======= API Response =======\r\n")
                console.log(body)
                if (isJSON(body)){
                    resolve(body);
                } else {
                    resolve({data:body})
                }
                
            }
           
        })
        // request
    })
    //  promise
}

fetchAuth = () => {    
    return new Promise((resolve, reject) => {
            var options = {
                url: domain + 'auth/v3.2/oauth/token' , 
                method: 'post',
                headers: {"content-type":"application/x-www-form-urlencoded"} ,
                form: {
                    "client_id":'h3LiqNTNC5q02m9kQWrlx4cl5gK2xxIDhReVBAGo9yg=',
                    "client_secret":'41c5ce1a90254d03aaa9a526f2fd66c3',
                    "grant_type":"client_credentials",
                    "nonce": createTransactionID(14)
                }
            };
            
        
        console.log("\r\n======= Authentication Request =======\r\n")
        console.log(options)

        request(options, function(err,res,body) {             
            if (err) {
                console.log(err)
                reject({description:err});
            } else {    
                if (isJSON(body) == true) {
                    console.log("\r\n======= Authentication Response =======\r\n")
                    console.log(JSON.parse(body))
                    resolve(body);
                } else {
                    reject({description:"response from AIS is not JSON format"});
                }
            }
        })
    })
}

isJSON = (str) => {
    if (typeof str === null || typeof str === undefined) {return false;}
    if (typeof str === 'string') {
        try {
            JSON.parse(str);
        } catch (err) { return false;}
    }
    return true;
}

createTransactionID = (n) => { // 14 digit
      let c = new Date();
      let transactionID = c.getFullYear().toString();    
      transactionID += str_pad((c.getMonth()+1).toString());    
      transactionID += str_pad(c.getDate().toString());    
      transactionID += str_pad(c.getHours().toString());
      transactionID += str_pad(c.getMinutes().toString());
      transactionID += str_pad(c.getSeconds().toString());
      return (n > 14 ? transactionID + generateRandomNumber(n-14) : transactionID);
}

str_pad = (str) => {
    return ('0' + str).slice(-2);
}

const fetchNumber = (URI , authorization, reqBody) => {
    return new Promise((resolve , reject) => {
        console.log("=====")
        console.log(reqBody)
        let postHeader = {}
        postHeader['Content-Type'] = 'application/json'
        postHeader['Authorization'] = 'Bearer eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCIsImtpZCI6IjExMFh5QTN6SWQifQ.eyJpc3MiOiJodHRwczovL2FkbWQtc3RnLmFkbGRpZ2l0YWxzZXJ2aWNlLmNvbSIsInN1YiI6InRva2VuX2F1dGhlbnRpY2F0aW9uX2NvZGUiLCJhdWQiOiJESElpQ0c5V0hJUVpUQkYrQ3kzZ2dtaVp5cE5Zb1lqaE1pM3ZocTg0c2xZUnZWL2VreFUrOWc9PSIsImV4cCI6MTcyMDc1ODEwMiwiaWF0IjoxNzE5NzIxMzAyLCJqdGkiOiJNMFpQUVV0WFJXNHhVamR5U0VVNVRHMUVZMjB4TnpFNU56SXhNekF5MnhQbTg1d3dBNGtHMGk4c1hOYm16WCIsInBpZCI6Imd1ZXN0OmRtV0FBQUFBSE9WeXd0ZmQ6OWNiM2ZjNjViZGM3YjREMnZkUC82SWxGYyIsImNsaWVudCI6Ik9UQXdNREF3TURBd01EQTBORFEwTERSM1pYeENjbTkzYzJWeWZERXVNQzR3Iiwic3NpZCI6IjJ4UG04NXd3QTRrRzBpOHNYTmJtelgiLCJ1aWQiOiJkbVdIT1Z5d3RmZCIsImF1dCI6eyJ0eXBlIjoibXNpc2RuIiwiYWN0aW9uIjoibG9naW4iLCJsb2dpbl9jaGFubmVsIjoiYXV0b19nc21hIiwibmV0d29yayI6ImFpcyIsImlzX2F1dG9fcmVnaXN0ZXIiOmZhbHNlfSwibmJmIjoxNzE5NzIxMDAyLCJuZXR3b3JrX2RldGVjdGVkX251bWJlciI6IndjRVBMTDhIRndIQlBXYz0ifQ.mVL-zjaKESEUBx6D3UI1yt_b-TtN7s9UfeNbIDGoEQKD9x3ukGHBJV6ETjAAZ7Kay0nVOhtDeEXZXPFn4_UNkH1BX4QTze2jp9cAh_R7CrZh8C-z9Z6zXwTJz78ZQ6uGfRavNGTTYjsvjy5lR55mFSTqaiLlZY4FtRi6Is600KUHsNixSE3-krU_DFX98Addz7aA2-u7GWKo5AERj9xWtwxFEFBWg6JXCmZ7G8A1pFPALbJEYqmkUpUjhpXE7xAMiV1Y6-C9ri4ZvfmqYab-0IMkcMrJPBd8onW_nGfzwkKb9wYgFMvTXYRaStmPSnaoU153tLSwwWkJTuUziGwp6w'
        postHeader['X-Tid'] = createTransactionID(14)
        postHeader['X-Requester'] = 'Web Broker'
        postHeader['origin'] = 'https://api-stg.adldigitalservice.com'


        let options = {}
        options['method'] = 'POST'
        options['url'] = 'https://api-stg.adldigitalservice.com/camara/number-verification/v0/verify'
        options['headers'] = postHeader
        options['body'] = {
            "phoneNumber": "66631954349",
             // body: JSON.stringify(requestBody)
    }
        options['json'] = true

        console.log("\r\n======= API Request =======\r\n")
        console.log(options,"\r\n")
        request(options, function(err, res, body) {
            console.log(body)
            if (err) {
                console.log(err)
                if (isJSON(err)) reject({description:JSON.parse(err)});
                reject({description:err});
            } else { 

                console.log("\r\n======= API Response =======\r\n")
                console.log(body)
                if (isJSON(body)){
                    resolve(body);
                } else {
                    resolve({data:body})
                }
                
            }
           
        })
        // request
    })
    //  promise
}