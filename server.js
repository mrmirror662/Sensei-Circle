
import mysql from 'mysql2/promise';
import express from 'express'
import bodyParser from 'body-parser';
import dotenv from 'dotenv';
import * as db from './database.js';

//for url encoding
let urlencodedParser = bodyParser.urlencoded({ extended: false });

dotenv.config();



//constants
const PORT_NO = process.env.PORT_NO;
let app = express();
app.use(bodyParser.urlencoded({ extended: false }));

// parse application/json
app.use(bodyParser.json());
// Get the client

// Create the connection to database
const connection = await mysql.createConnection({
    host: process.env.host,
    user: process.env.user,
    database: process.env.db,
    password: process.env.password
});


const internalErrorJSON = { flag: 500, msg: 'server error' };


app.get('/signup', function (req, res) {
    res.sendFile('index_test.html', { root: "." });

});
app.get('/login', function (req, res) {
    res.sendFile('dummy_login.html', { root: "." });

});
app.post("/signup", async function (req, res) {
    console.log(req.body);
    const usn = req.body.usn;
    const name = req.body.name;
    const password = req.body.password;
    const phone_no = req.body.phone_no;
    const email = req.body.email;

    if (!usn || !name || !password || !phone_no || !email) {
        res.json({ flag: "404", msg: "No value entered in one of the fields" });
        res.end();// end the response

        return;
    }

    try {
        let studentExists = await db.StudentExists(usn);
        if (studentExists) {
            res.json({ flag: "404", msg: "account already exists" });
            res.end();// end the response
            return;
        }

    } catch (err) {
        console.error(err);
        res.json(internalErrorJSON);
        return;
    }

    try {
        db.InsertStudent({ name: name, usn: usn, password: password, email: email, phone_no: phone_no });
    }
    catch (err) {
        console.error(err);
        res.json(internalErrorJSON);
        res.end();// end the response
        return;
    }
    res.json({ flag: "200", msg: "new accound signed up" });
    res.end();
});
app.post("/login", async function (req, res) {
    const usn = req.body.usn;
    const password = req.body.password;

    let studentExists = false;
    try {
        studentExists = await db.StudentExists(usn);
    } catch (err) {
        res.json(internalErrorJSON);
        console.error(err);
        return;
    }

    if (!usn) {
        res.json({ flag: "404", msg: "incorrect usn" }); // end the response
        return;
    }
    if (studentExists) {
        res.json({ flag: "404", msg: "user does not exist" }); // end the response
        return;
    }
    let studentCheckPassword = false;
    try {
        studentCheckPassword = await db.StudentCheckPassword({ usn: usn, password: password });
    } catch (err) {
        console.error(err);
        res.json(internalErrorJSON);
        res.end();// end the response
        return;
    }
    res.json({ flag: "200", msg: "account found" });
    res.end();
});
let server = app.listen(3000, function () {
    let host = server.address().address;
    let port = server.address().port;
});
