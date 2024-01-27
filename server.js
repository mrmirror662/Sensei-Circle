import mysql from "mysql2/promise";
import express from "express";
import bodyParser from "body-parser";
import dotenv from "dotenv";
import * as db from "./database.js";

dotenv.config();

//constants
const PORT_NO = process.env.PORT_NO;
let app = express();

app.use(bodyParser.urlencoded({ extended: false }));
// parse application/json
app.use(bodyParser.json());

const internalErrorJSON = { flag: 500, msg: "server error" };
const GenErrorJSON = function (msg) {
  return { flag: 404, msg: msg };
};
const GenSuccessJSON = function (msg) {
  return { flag: 200, msg: msg };
};
app.get("/student_signup", function (req, res) {
  res.sendFile("/html/signup/student_signup.html", { root: "." });
});
app.get("/student_login", function (req, res) {
  res.sendFile("/html/login/student_login.html", { root: "." });
});

app.get("/mentor_signup", function (req, res) {
  res.sendFile("/html/signup/mentor_signup.html", { root: "." });
});
app.get("/mentor_login", function (req, res) {
  res.sendFile("/html/login/mentor_login.html", { root: "." });
});
app.get("/course_information_fill", function (req, res) {
  res.sendFile("/html/course_info_fill.html", { root: "." });
});
app.get("/academic_details_fill", function (req, res) {
  res.sendFile("/html/academic_details_fill.html", { root: "." });
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
  if (
    !usn ||
    !name ||
    !password ||
    !phone_no ||
    !email ||
    !branch_id ||
    !semester
  ) {
    res.json(GenErrorJSON("No value entered in one of the fields"));
    res.end(); // end the response

    return;
  }

  try {
    let studentExists = await db.StudentExists(usn);
    if (studentExists) {
      res.json(GenErrorJSON("account already exists"));
      res.end(); // end the response
      return;
    }
  } catch (err) {
    console.error(err);
    res.json(internalErrorJSON);
    return;
  }

  try {
    db.InsertStudent({
      name: name,
      usn: usn,
      password: password,
      email: email,
      phone_no: phone_no,
      semester: semester,
      branch_id: branch_id,
    });
  } catch (err) {
    console.error(err);
    res.json(internalErrorJSON);
    res.end(); // end the response
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
    res.end(); // end the response
    return;
  }
  //check password
  let studentCheckPassword = false;
  try {
    studentCheckPassword = await db.StudentCheckPassword({
      usn: usn,
      password: password,
    });
  } catch (err) {
    console.error(err);
    res.json(internalErrorJSON);
    res.end(); // end the response
    return;
  }
  if (!studentCheckPassword) {
    res.json(GenErrorJSON("incorrect password"));
    res.end(); // end the response
    return;
  }

  //add to session
  try {
    let isInSession = await db.IsStudentInSession(usn);

    if (isInSession) {
      res.json({ flag: 404, msg: "already in session" });
      res.end();
      return;
    }
    let s_id = await db.AddStudentToSession(usn);
    res.json({ flag: 200, msg: "accound found", session_id: s_id });
    res.end();
  } catch (err) {
    console.error(err);
    res.json(GenErrorJSON);
    res.end();
    return;
  }
});
app.post("/student_logout", async function (req, res) {
  let s_id = req.body.session_id;

  try {
    let isInSession = await db.IsStudentInSessionSID(s_id);

    if (!isInSession) {
      res.json({ flag: 404, msg: "invalid session ID" });
      res.end();
      return;
    }
    db.RemoveStudentSession(s_id);
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
    res.end(); // end the response

    return;
  }

  try {
    let mentorExists = await db.MentorExists(mentor_id);
    if (mentorExists) {
      res.json(GenErrorJSON("account already exists"));
      res.end(); // end the response
      return;
    }
  } catch (err) {
    console.error(err);
    res.json(internalErrorJSON);
    return;
  }

  try {
    db.InsertMentor({
      name: name,
      mentor_id: mentor_id,
      password: password,
      email: email,
      phone_no: phone_no,
      branch_id: branch_id,
    });
  } catch (err) {
    console.error(err);
    res.json(internalErrorJSON);
    res.end(); // end the response
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
    res.end(); // end the response
    return;
  }
  let mentorCheckPassword = false;
  try {
    mentorCheckPassword = await db.MentorCheckPassword({
      mentor_id: mentor_id,
      password: password,
    });
  } catch (err) {
    console.error(err);
    res.json(internalErrorJSON);
    res.end(); // end the response
    return;
  }
  if (!mentorCheckPassword) {
    res.json(GenErrorJSON("incorrect password"));
    res.end(); // end the response
    return;
  }
  //add to session
  try {
    let isInSession = await db.IsMentorInSession(mentor_id);

    if (isInSession) {
      res.json({ flag: 404, msg: "already in session" });
      res.end();
      return;
    }
    let s_id = await db.AddMentorToSession(mentor_id);
    res.json({ flag: 200, msg: "accound found", session_id: s_id });
    res.end();
  } catch (err) {
    console.error(err);
    res.json(GenErrorJSON);
    res.end();
    return;
  }
});

app.post("/mentor_logout", async function (req, res) {
  let s_id = req.body.session_id;

  try {
    let isInSession = await db.IsMentorInSessionSID(s_id);

    if (!isInSession) {
      res.json({ flag: 404, msg: "invalid session ID" });
      res.end();
      return;
    }
    db.RemoveMentorSession(s_id);
    res.json({ flag: 200, msg: "logged out!" });
    res.end();
  } catch (err) {
    console.error(err);
    res.json(GenErrorJSON);
    res.end();
    return;
  }
});
//to-do
app.post("/course_information_fill", async function (req, res) {
  /*let course_id=req.body.course_id;
    let course_name=req.body.course_name;
    let semester=Number(req.body.semester);
    if(!course_id || !course_name || !semester){
        res.json(GenErrorJSON("One of the fields is incomplete."))
        res.end();
        return;
    }
    try{
        let course_exists=await db.CourseExists(course_id);
        if(course_exists){
        res.json(GenErrorJSON("Course already exists."))
        res.end();
            return; 
        } 
    }catch (err) {
        console.error(err);
        res.json(GenErrorJSON);
        res.end();
        return;
    }
    try {
        db.InsertCourse({ course_id: course_id, course_name: course_name,semester:semester});
    }
    catch (err) {
        console.error(err);
        res.json(internalErrorJSON);
        res.end();// end the response
        return;
    }
    res.json(GenSuccessJSON("new course added"));
    res.end();
    */
  res.json(GenErrorJSON("To be implemented."));
  res.end();
  return;
});

function replaceEmptyStringsWithNull(obj) {
  let sum = 0;
  for (const key in obj) {
    if (typeof obj[key] === "string" && obj[key].trim() === "") obj[key] = null;
    else if (typeof obj[key] === "string" && obj[key].trim() !== "") {
      obj[key] = Number(obj[key]);
      sum += obj[key];
    } else if (typeof obj[key] === "object" && obj[key] !== null)
      obj[key] = replaceEmptyStringsWithNull(obj[key]); // Recursive call for nested objects
  }
  obj.total = sum;
  console.log(obj);
  return obj;
}

app.post("/academic_details_fill", async function (req, res) {

    const session_id = req.body.session_id;
    try {
      let isInSession = await db.IsMentorInSessionSID(session_id);
      if (!isInSession) {
        res.json({ flag: 404, msg: "Invalid session id" });
        res.end();
        return;
      }
    } catch (err) {
      console.error(err);
      res.json(GenErrorJSON);
      res.end();
      return;
    }
  console.log(req.body);
  let usn = req.body.usn;
  let course_id = req.body.course_id;
  let ia_1 = req.body.IA_1;
  let ia_2 = req.body.IA_2;
  let ia_3 = req.body.IA_3;
  let assignment_1 = req.body.assignment_1;
  let assignment_2 = req.body.assignment_2;
  let activity = req.body.activity;
  if (!course_id || !usn) {
    res.json(GenErrorJSON("One of the fields is incomplete."));
    res.end();
    return;
  }

  let academia = {
    ia_1: ia_1,
    ia_2: ia_2,
    ia_3: ia_3,
    assignment_1: assignment_1,
    assignment_2: assignment_2,
    activity: activity,
  };

  academia = replaceEmptyStringsWithNull(academia); //checking whether user has entered empty string and convert to null
  academia.usn = usn;
  academia.course_id = course_id;
  try {
    let academia_exists = await db.AcademiaExists(usn, course_id);
    if (academia_exists) {
      db.AcademiaInsert(academia);
      res.json({ flag: 200, msg: "Successfully updated" });
    } else {
      db.AcademiaInsert(academia);
      res.json({ flag: 200, msg: "Successfully inserted" });
    }
    res.end();
    return;
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
