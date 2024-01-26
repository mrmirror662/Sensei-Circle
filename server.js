
import mysql from 'mysql2/promise';
import express from 'express'
import bodyParser from 'body-parser';
import dotenv from 'dotenv';
import * as db from './database.js';


dotenv.config();



//constants
const PORT_NO = process.env.PORT_NO;
let app = express();

app.use(bodyParser.urlencoded({ extended: false }));
// parse application/json
app.use(bodyParser.json());




const internalErrorJSON = { flag: 500, msg: 'server error' };
const GenErrorJSON = function (msg) {
    return { flag: 404, msg: msg };
}
const GenSuccessJSON = function (msg) {
    return { flag: 200, msg: msg };
}
app.get('/signup', function (req, res) {
    res.sendFile('index_test.html', { root: "." });

});
app.get('/login', function (req, res) {
    res.sendFile('dummy_login.html', { root: "." });

});
app.post("/signup", async function (req, res) {
    const usn = req.body.usn;
    const name = req.body.name;
    const password = req.body.password;
    const phone_no = req.body.phone_no;
    const email = req.body.email;
    const semester = Number(req.body.semester);
    const branch_id = req.body.branch_id;
    console.log(req.body);
    if (!usn || !name || !password || !phone_no || !email || !branch_id || !semester) {
        res.json(GenErrorJSON("No value entered in one of the fields"));
        res.end();// end the response

        return;
    }

    try {
        let studentExists = await db.StudentExists(usn);
        if (studentExists) {
            res.json(GenErrorJSON("account already exists"));
            res.end();// end the response
            return;
        }

    } catch (err) {
        console.error(err);
        res.json(internalErrorJSON);
        return;
    }

    try {
        db.InsertStudent({ name: name, usn: usn, password: password, email: email, phone_no: phone_no, semester: semester, branch_id: branch_id });
    }
    catch (err) {
        console.error(err);
        res.json(internalErrorJSON);
        res.end();// end the response
        return;
    }
    res.json(GenSuccessJSON("new accound signed up"));
    res.end();
});
app.post("/login", async function (req, res) {
    const usn = req.body.usn;
    const password = req.body.password;
    //check for account existance
    let studentExists = false;
    try {
        studentExists = await db.StudentExists(usn);
    } catch (err) {
        res.json(internalErrorJSON);
        console.error(err);
        return;
    }
    //check for null usn
    if (!usn) {
        res.json(GenErrorJSON("incorrect usn"));
        res.end(); // end the response
        return;
    }

    if (!studentExists) {
        res.json(GenErrorJSON("user does not exist"));
        res.end();// end the response
        return;
    }
    //check password
    let studentCheckPassword = false;
    try {
        studentCheckPassword = await db.StudentCheckPassword({ usn: usn, password: password });
    } catch (err) {
        console.error(err);
        res.json(internalErrorJSON);
        res.end();// end the response
        return;
    }
    if (!studentCheckPassword) {
        res.json(GenErrorJSON("incorrect password"));
        res.end();// end the response
        return;
    }

    //add to session
    try {
        let isInSession = await db.IsInSession(usn);

        if (isInSession) {
            res.json({ flag: 404, msg: "already in session" });
            res.end();
            return;
        }
        let s_id = await db.AddToSession(usn);
        res.json({ flag: 200, msg: "accound found", session_id: s_id });
        res.end();
    }
    catch (err) {
        console.error(err);
        res.json(GenErrorJSON);
        res.end();
        return;
    }

});
app.post("/logout", async function (req, res) {
    let s_id = req.body.session_id;


    try {
        let isInSession = await db.IsInSessionSID(s_id);

        if (!isInSession) {
            res.json({ flag: 404, msg: "invalid session ID" });
            res.end();
            return;
        }
        db.RemoveSession(s_id);
        res.json({ flag: 200, msg: "logged out!" });
        res.end();
    } catch (err) {
        console.error(err);
        res.json(GenErrorJSON);
        res.end();
        return;
    }
});
let server = app.listen(PORT_NO, function () {
    let host = server.address().address;
    let port = server.address().port;
});
