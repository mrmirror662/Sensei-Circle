
import mysql from 'mysql2/promise';
import dotenv from 'dotenv';

//config env var
dotenv.config();

//shortcut
let log = console.log;


// Create the connection to database
const connection = await init();
async function init() {

    try {
        let c = await mysql.createConnection({
            host: process.env.host,
            user: process.env.user,
            database: process.env.db,
            password: process.env.password
        });
        console.log(`DB initialized with \nhost:${process.env.host}\nuser:${process.env.user}\ndb:${process.env.db}`)
        return c;
    }
    catch (err) {
        console.error(`error db initialization Error:${err}`);
        process.exit();
    }
}
export async function StudentExists(usn) {
    let q_ = 'select usn from student_credentials where usn=?';

    try {
        const [results, fields] = await connection.query(
            q_, [usn]
        );
        if (results.length !== 0)
            return true;
        return false;
    } catch (err) {
        console.error("Error checking user", err);
        throw err;
    }


}

export async function InsertStudent(student) {
    let q = 'insert into student_credentials values(?,?);';
    let q_ = 'insert into student_information values(?,?,?,?,?,?);';

    try {
        const [results, fields] = await connection.query(
            q, [student.usn, student.password]

        );
        const [results1, fields1] = await connection.query(
            q_, [student.name, student.usn, student.phone_no, student.email, student.branch_id, student.semester]

        );
    } catch (err) {
        console.error("Error inserting user", err);
        throw err;
    }
}
export async function StudentCheckPassword(student) {
    let q_ = 'select usn,password from student_credentials where usn=?';

    try {
        const [results, fields] = await connection.query(
            q_, [student.usn]
        );

        if (results.length == 0) {
            return false;
        }
        if (results[0]["password"] !== student.password) {
            return false;
        }
        return true;
    } catch (err) {
        console.error("Error authenticating  user", err);
        throw err;
    }

}

function generateSessionID() {
    return Math.random().toString(36).substr(2, 8);
}
export async function AddToSession(usn) {
    let session_id = generateSessionID();
    let q = 'insert into student_session_info values(?,?);';

    try {
        const [results, fields] = await connection.query(
            q, [session_id, usn]
        );
    }
    catch (err) {
        console.error(err);
        throw err;
    }

    return session_id;

}
export async function RemoveSession(session_id) {
    let q = 'delete from student_session_info where session_id=?';

    try {
        const [results, fields] = await connection.query(
            q, [session_id]
        );
    }
    catch (err) {
        console.error(err);
        throw err;
    }


}
export async function IsInSession(usn) {
    let q = 'select usn from student_session_info where usn=?';

    try {
        const [results, fields] = await connection.query(
            q, [usn]
        );
        if (results.length !== 0)
            return true;
        return false;
    } catch (err) {
        console.error("Error checking user", err);
        throw err;
    }
}
export async function IsInSessionSID(session_id) {
    let q = 'select session_id from student_session_info where session_id=?';

    try {
        const [results, fields] = await connection.query(
            q, [session_id]
        );
        if (results.length !== 0)
            return true;
        return false;
    } catch (err) {
        console.error("Error checking user", err);
        throw err;
    }
} 