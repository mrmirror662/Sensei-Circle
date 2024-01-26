
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
app.get('/student_signup', function (req, res) {
    res.sendFile('/html/signup/student_signup.html', { root: "." });

});
app.get('/student_login', function (req, res) {
    res.sendFile('/html/login/student_login.html', { root: "." });

});

app.get('/mentor_signup', function (req, res) {
    res.sendFile('/html/signup/mentor_signup.html', { root: "." });

});
app.get('/mentor_login', function (req, res) {
    res.sendFile('/html/login/mentor_login.html', { root: "." });

});


app.post("/student_signup", async function (req, res) {
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
app.post("/student_login", async function (req, res) {
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















app.post("/mentor_signup", async function (req, res) {
    const mentor_id = req.body.mentor_id;
    const name = req.body.name;
    const password = req.body.password;
    const phone_no = req.body.phone_no;
    const email = req.body.email;
    const branch_id = req.body.branch_id;
    console.log(req.body);
    if (!mentor_id || !name || !password || !phone_no || !email || !branch_id) {
        res.json(GenErrorJSON("No value entered in one of the fields"));
        res.end();// end the response

        return;
    }

    try {
        let mentorExists = await db.MentorExists(mentor_id);
        if (mentorExists) {
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
        db.InsertMentor({ name: name, mentor_id: mentor_id, password: password, email: email, phone_no: phone_no ,branch_id:branch_id});
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
app.post("/mentor_login", async function (req, res) {
    const mentor_id = req.body.mentor_id;
    const password = req.body.password;

    let mentorExists = false;
    try {
        mentorExists = await db.MentorExists(mentor_id);
    } catch (err) {
        res.json(internalErrorJSON);
        console.error(err);
        return;
    }

    if (!mentor_id) {
        res.json(GenErrorJSON("incorrect mentor id"));
        res.end(); // end the response
        return;
    }
    if (!mentorExists) {
        res.json(GenErrorJSON("user does not exist"));
        res.end();// end the response
        return;
    }
    let mentorCheckPassword = false;
    try {
        mentorCheckPassword = await db.MentorCheckPassword({ mentor_id: mentor_id, password: password });
    } catch (err) {
        console.error(err);
        res.json(internalErrorJSON);
        res.end();// end the response
        return;
    }
    if (!mentorCheckPassword) {
        res.json(GenErrorJSON("incorrect password"));
        res.end();// end the response
        return;
    }
    res.json(GenSuccessJSON("account found"));
    res.end();
});

let server = app.listen(PORT_NO, function () {
    let host = server.address().address;
    let port = server.address().port;
});
