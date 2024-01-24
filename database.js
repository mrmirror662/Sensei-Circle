
import mysql from 'mysql2/promise';
import dotenv from 'dotenv';

//config env var
dotenv.config();

// Create the connection to database
const connection = await init();
async function init() {
    return await mysql.createConnection({
        host: process.env.host,
        user: process.env.user,
        database: process.env.db,
        password: process.env.password
    });
}
export async function StudentExists(usn) {
    let q_ = 'select usn from student where usn=?';

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
    let q = 'insert into student values(?,?,?,?,?)';

    try {
        const [results, fields] = await connection.query(
            q, [student.name, student.usn, student.password, student.phone_no, student.email]
        )
    } catch (err) {
        console.error("Error inserting user", err);
        throw err;
    }
}
export async function StudentCheckPassword(student) {
    let q_ = 'select usn from student where usn=?';

    try {
        const [results, fields] = await connection.query(
            q_, [student.usn]
        );
        if (results.length == 0)
            return false;
        if (results[0]["password"] != student.password)
            return false;
        return true;
    } catch (err) {
        console.error("Error authenticating  user", err);
        throw err;
    }

}