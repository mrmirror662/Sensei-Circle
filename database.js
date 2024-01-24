
import mysql from 'mysql2/promise';
import express from 'express'
import bodyParser from 'body-parser';
let urlencodedParser = bodyParser.urlencoded({ extended: false });
// Create the connection to database

//constants
const PORT_NO = 3000;
let app = express();
app.use(bodyParser.urlencoded({ extended: false }));

// parse application/json
app.use(bodyParser.json());
// Get the client
const connection = await mysql.createConnection({
    host: 'localhost',
    user: 'root',
    database: 'mentor_management_system',
    password: 'Manwithoutlove@1024'
});






app.get('/', function (req, res) {
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
    
    if(!usn || !name || !password || !phone_no || !email){
        res.json({ flag: "404", msg: "No value entered in one of the fields" }); // end the response
        return;
    } 

    let q_ = 'select usn from student where usn=?';
    console.log(q_);
    const [results1, fields1] = await connection.query(
        q_,[usn]
    );
    console.log(results1.length);
    if (results1.length !== 0) {
        res.json({ flag: "404", msg: "account already exists" }); // end the response
        return;
    }
    try {
        let q = 'insert into student values(?,?,?,?,?)';
        const [results, fields] = await connection.query(
            q ,[name,usn,password,phone_no,email]
        )
    }
    catch (err) {
        console.log(err);
        res.json({ flag: "500", msg: "internal error" }); // end the response
        res.end();
        return;
    }
    res.json({ flag: "200", msg: "new accound signed up" });
    res.end();
});
app.post("/login", async function (req, res) {
    console.log(req.body);
    const usn = req.body.usn;
    const password = req.body.password;
    let q = 'select * from student where usn=?';
    console.log(q);
    const [results, fields] = await connection.query(
        q,[usn]
    );
    
    if(!usn || results.length===0){
        res.json({ flag: "404", msg: "incorrect usn" }); // end the response
        return;
    }
    console.log(results[0]["password"]);
    if (results[0]["password"] != password) {
        res.json({ flag: "404", msg: "incorrect password" }); // end the response
        return;
    }
    res.json({ flag: "200", msg: "account found,logging in" });
    res.end();
});
let server = app.listen(3000, function () {
    let host = server.address().address;
    let port = server.address().port;
});
