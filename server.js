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
app.get("/home", async function (req, res) {
  res.sendFile("/html/home.html", { root: "." });
});
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
app.get("/academic_details_fetch", function (req, res) {
  res.sendFile("/html/academic_details_fetch.html", { root: "." });
});
app.get("/mentor_register_student", async function (req, res) {
  res.sendFile("/html/mentor_register_student.html", { root: "." });
});
app.get("/mentor_students_fetch", async function (req, res) {
  res.sendFile("/html/mentor_students_fetch.html", { root: "." });
});
app.get("/notifications", async function (req, res) {
  res.sendFile("/html/notifications.html", { root: "." });
});

app.get("/issues", async function (req, res) {
  res.sendFile("/html/issues.html", { root: "." });
});
app.get("/student_upload_mentor_form", async function (req, res) {
  res.sendFile("/html/upload_file.html", { root: "." });
});

app.get("/feedback", async function (req, res) {
  res.sendFile("/html/mentor_feedback.html", { root: "." });
});

app.post("/student_signup", async function (req, res) {
  const usn = req.body.usn;
  const name = req.body.name;
  const password = req.body.password;
  const phone_no = req.body.phone_no;
  const email = req.body.email;
  const semester = Number(req.body.semester);
  const branch_id = req.body.branch_id;
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
    res.json(GenErrorJSON(err));
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
    res.json(GenErrorJSON(err));
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
    res.json(GenErrorJSON(err));
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
    res.json(GenErrorJSON(err));
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
    res.json(GenErrorJSON(err));
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
    res.json(GenErrorJSON(err));
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
    res.json(GenErrorJSON(err));
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
    res.json(GenErrorJSON(err));
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
    res.json(GenErrorJSON(err));
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
    res.json(GenErrorJSON(err));
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
    res.json(GenErrorJSON(err));
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
    res.json(GenErrorJSON(err));
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
      if (key !== "attendance") sum += obj[key];
    } else if (typeof obj[key] === "object" && obj[key] !== null)
      obj[key] = replaceEmptyStringsWithNull(obj[key]); // Recursive call for nested objects
  }
  obj.total = sum;
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
    res.json(GenErrorJSON(err));
    res.end();
    return;
  }

  let usn = req.body.usn;
  let course_id = req.body.course_id;
  let ia_1 = req.body.IA_1;
  let ia_2 = req.body.IA_2;
  let ia_3 = req.body.IA_3;
  let assignment_1 = req.body.assignment_1;
  let assignment_2 = req.body.assignment_2;
  let activity = req.body.activity;
  let attendance = req.body.attendance;
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
    attendance: attendance,
    activity: activity,
  };

  academia = replaceEmptyStringsWithNull(academia); //checking whether user has entered empty string and convert to null
  academia.usn = usn;
  academia.course_id = course_id;
  try {
    const mentor_id = await db.FetchMentorIDFromSID(session_id);
    let mentorStudentExists = await db.MentorStudentExists(mentor_id, usn);
    if (!mentorStudentExists) {
      res.json(GenErrorJSON("Student not registered."));
      res.end();
      return;
    }
  } catch (err) {
    console.error(err);
    res.json(GenErrorJSON(err));
    res.end();
    return;
  }
  try {
    let academiaExists = await db.AcademiaExists(usn, course_id);
    if (academiaExists) {
      await db.AcademiaInsert(academia);
      res.json({ flag: 200, msg: "Successfully updated" });
    } else {
      await db.AcademiaInsert(academia);
      res.json({ flag: 200, msg: "Successfully inserted" });
    }
    res.end();
    return;
  } catch (err) {
    console.error(err);
    res.json(GenErrorJSON(err));
    res.end();
    return;
  }
});

app.post("/mentor_academic_details_fetch", async function (req, res) {
  const session_id = req.body.session_id;
  const usn = req.body.usn;
  try {
    let isInSession = await db.IsMentorInSessionSID(session_id);
    if (!isInSession) {
      res.json({ flag: 404, msg: "Invalid session id" });
      res.end();
      return;
    }
  } catch (err) {
    console.error(err);
    res.json(GenErrorJSON(err));
    res.end();
    return;
  }

  try {
    const academic_details = await db.MentorAcademiaFetch(session_id, usn);
    if (academic_details.length == 0) {
      res.json({ flag: 404, msg: "No academic details" });
      res.end();
      return;
    }
    res.json({
      flag: 200,
      msg: "Fetch successful",
      academic_details: academic_details,
    });
    res.end();
    return;
  } catch (err) {
    console.error(err);
    res.json(GenErrorJSON(err));
    res.end();
    return;
  }
});

app.post("/student_academic_details_fetch", async function (req, res) {
  const session_id = req.body.session_id;
  try {
    let isInSession = await db.IsStudentInSessionSID(session_id);
    if (!isInSession) {
      res.json({ flag: 404, msg: "Invalid session id" });
      res.end();
      return;
    }
  } catch (err) {
    console.error(err);
    res.json(GenErrorJSON(err));
    res.end();
    return;
  }

  try {
    const academic_details = await db.StudentAcademiaFetch(session_id);
    if (academic_details.length == 0) {
      res.json({ flag: 404, msg: "No academic details" });
      res.end();
      return;
    }
    res.json({
      flag: 200,
      msg: "Fetch successful",
      academic_details: academic_details,
    });
    res.end();
    return;
  } catch (err) {
    console.error(err);
    res.json(GenErrorJSON(err));
    res.end();
    return;
  }
});
app.post("/mentor_register_student", async function (req, res) {
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
    res.json(GenErrorJSON(err));
    res.end();
    return;
  }
  const usn = req.body.usn;
  const mentor_id = await db.FetchMentorIDFromSID(session_id);
  if (!usn || !mentor_id) {
    res.json(GenErrorJSON("invalid fields"));
  }

  try {
    let mentorStudentExists = await db.MentorStudentExists(mentor_id, usn);

    if (mentorStudentExists) {
      res.json(GenErrorJSON("student already registered!"));
      res.end();
      return;
    }
    await db.RegisterStudentToMentor(mentor_id, usn);
    res.json(GenSuccessJSON("student registered"));
    res.end();
  } catch (err) {
    console.error("POST : ", err);
    res.json(GenErrorJSON(err));
    res.end();
    return;
  }
});
app.post("/mentor_deregister_student", async function (req, res) {
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
    res.json(GenErrorJSON(err));
    res.end();
    return;
  }
  const usn = req.body.usn;
  const mentor_id = await db.FetchMentorIDFromSID(session_id);
  if (!usn || !mentor_id) {
    res.json(GenErrorJSON("invalid fields"));
  }

  try {
    let mentorStudentExists = await db.MentorStudentExists(mentor_id, usn);

    if (!mentorStudentExists) {
      res.json(GenErrorJSON("student not  registered!"));
      res.end();
      return;
    }
    await db.DeregisterStudentToMentor(mentor_id, usn);
    res.json(GenSuccessJSON("student deregistered"));
    res.end();
  } catch (err) {
    console.error("POST : ", err);
    res.json(GenErrorJSON(err));
    res.end();
    return;
  }
});

app.post("/mentor_students_fetch", async function (req, res) {
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
    res.json(GenErrorJSON(err));
    res.end();
    return;
  }

  try {
    const mentor_id = await db.FetchMentorIDFromSID(session_id);
    const studentDetails = await db.FetchStudentDetailsFromMentorID(mentor_id);
    res.json({ flag: 200, studentDetails });
    res.end();
  } catch (err) {
    console.error(err);
    res.json(GenErrorJSON(err));
    res.end();
  }
});
app.post("/mentor_push_notification", async function (req, res) {
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
    res.json(GenErrorJSON(err));
    res.end();
    return;
  }
  const msg = req.body.msg;
  if (!msg) {
    res.json(GenErrorJSON("empty message."));
    res.end();
    return;
  }
  const mentor_id = await db.FetchMentorIDFromSID(session_id);
  try {
    await db.MentorPushNotification(mentor_id, msg);
  } catch (err) {
    console.error(err);
    res.json(GenErrorJSON(err));
    res.end();
    return;
  }
  res.json(GenSuccessJSON("notification pushed."));
  res.end();
});
app.post("/mentor_fetch_notification", async function (req, res) {
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
    res.json(GenErrorJSON(err));
    res.end();
    return;
  }
  const mentor_id = await db.FetchMentorIDFromSID(session_id);
  try {
    const results = await db.MentorFetchNotification(mentor_id);
    res.json({ flag: 200, results });
    res.end();
  } catch (err) {
    console.error(err);
    res.json(GenErrorJSON(err));
    res.end();
    return;
  }
});
app.post("/student_fetch_notification", async function (req, res) {
  const session_id = req.body.session_id;
  try {
    let isInSession = await db.IsStudentInSessionSID(session_id);
    if (!isInSession) {
      res.json({ flag: 404, msg: "Invalid session id" });
      res.end();
      return;
    }
  } catch (err) {
    console.error(err);
    res.json(GenErrorJSON(err));
    res.end();
    return;
  }
  const usn = await db.FetchUSNFromSID(session_id);
  try {
    const results = await db.StudentFetchNotification(usn);
    res.json({ flag: 200, results });
    res.end();
  } catch (err) {
    console.error(err);
    res.json(GenErrorJSON(err));
    res.end();
    return;
  }
});

app.post("/student_push_issue", async function (req, res) {
  const session_id = req.body.session_id;
  try {
    let isInSession = await db.IsStudentInSessionSID(session_id);
    if (!isInSession) {
      res.json(GenErrorJSON("Invalid session id"));
      res.end();
      return;
    }
  } catch (err) {
    console.error(err);
    res.json(GenErrorJSON(err));
    res.end();
    return;
  }
  const msg = req.body.msg;
  if (!msg) {
    res.json(GenErrorJSON("empty message."));
    res.end();
    return;
  }
  const usn = await db.FetchUSNFromSID(session_id);
  try {
    await db.StudentPushIssue(usn, msg);
  } catch (err) {
    console.error(err);
    res.json(GenErrorJSON(err));
    res.end();
    return;
  }
  res.json(GenSuccessJSON("issue pushed."));
  res.end();
});
app.post("/mentor_fetch_issue", async function (req, res) {
  const session_id = req.body.session_id;
  try {
    let isInSession = await db.IsMentorInSessionSID(session_id);
    if (!isInSession) {
      res.json(GenErrorJSON("Invalid session id"));
      res.end();
      return;
    }
  } catch (err) {
    console.error(err);
    res.json(GenErrorJSON(err));
    res.end();
    return;
  }
  const mentor_id = await db.FetchMentorIDFromSID(session_id);

  try {
    const results = await db.MentorFetchIssue(mentor_id);
    res.json({ flag: 200, results });
    res.end();
  } catch (err) {
    console.error(err);
    res.json(GenErrorJSON(err));
    res.end();
    return;
  }
});
app.post("/student_fetch_issue", async function (req, res) {
  const session_id = req.body.session_id;
  try {
    let isInSession = await db.IsStudentInSessionSID(session_id);
    if (!isInSession) {
      res.json(GenErrorJSON("Invalid session id"));
      res.end();
      return;
    }
  } catch (err) {
    console.error(err);
    res.json(GenErrorJSON(err));
    res.end();
    return;
  }
  const usn = await db.FetchUSNFromSID(session_id);
  try {
    const results = await db.StudentFetchIssue(usn);
    res.json({ flag: 200, results });
    res.end();
  } catch (err) {
    console.error(err);
    res.json(GenErrorJSON("error fetching issue."));
    res.end();
    return;
  }
});

function isDocxFile(name) {
  // Get the file extension (case-insensitive)
  const extension = name.toLowerCase().split(".").pop();

  // Check for the DOCX extension
  return extension === "docx";
}
// Require the upload middleware
import fileUpload from "express-fileupload";
import path from "path";
import { fileURLToPath } from "url";
import { dirname } from "path";
import { abort } from "process";
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
app.post(
  "/student_upload_mentor_form",
  fileUpload({ createParentPath: true }),
  async function (req, res) {
    const session_id = req.body.session_id;
    try {
      let isInSession = await db.IsStudentInSessionSID(session_id);
      if (!isInSession) {
        res.json({ flag: 404, msg: "Invalid session id" });
        res.end();
        return;
      }
    } catch (err) {
      console.error(err);
      res.json(GenErrorJSON(err));
      res.end();
      return;
    }
    const usn = await db.FetchUSNFromSID(session_id);
    let mentor_form = req.files.mentor_form;
    if (!isDocxFile(mentor_form.name)) {
      res.json(GenErrorJSON("not a docx file."));
      res.end();
      return;
    }

    const targetPath = path.join(__dirname, "/forms/", `${usn}.docx`); // Use dynamic filename or extension

    mentor_form.mv(targetPath, function (err) {
      if (err) {
        console.log(err);
      }
    });
    res.json(GenSuccessJSON("file uploaded!"));
    res.end();
  }
);
import fs from "fs";

app.post("/mentor_download_mentor_form", async function (req, res) {
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
    res.json(GenErrorJSON(err));
    res.end();
    return;
  }

  let usn = req.body.usn;
  if (!usn) {
    res.json(GenErrorJSON("empty field."));
    res.end();
    return;
  }
  let mentor_id = await db.FetchMentorIDFromSID(session_id);
  const mentorStudentExist = await db.MentorStudentExists(mentor_id, usn);
  if (!mentorStudentExist) {
    res.json(GenErrorJSON("invalid usn"));
    res.end();
    return;
  }

  // Set the appropriate headers for file download
  res.setHeader("Content-Disposition", `attachment; filename=${usn}.docx`);
  res.setHeader("Content-Type", "application/octet-stream"); // Or specify the appropriate content type
  const targetPath = path.join(__dirname, "/forms"); // Use dynamic filename or extension

  // Send the file as a response
  res.download(`forms/${usn}.docx`, (err) => {
    if (err) {
      // Handle error if any
      console.error("Error downloading file:", err);
      res.status(500).send("Error downloading file");
    }
  });
});

app.post("/student_push_feedback", async function (req, res) {
  const session_id = req.body.session_id;
  try {
    let isInSession = await db.IsStudentInSessionSID(session_id);
    if (!isInSession) {
      res.json(GenErrorJSON("Invalid session id"));
      res.end();
      return;
    }
  } catch (err) {
    console.error(err);
    res.json(GenErrorJSON(err));
    res.end();
    return;
  }
  const meeting_date = req.body.meeting_date;
  const feedback = req.body.feedback;
  if (!feedback || !meeting_date) {
    res.json(GenErrorJSON("One of the fields are empty."));
    res.end();
    return;
  }
  const usn = await db.FetchUSNFromSID(session_id);
  try {
    await db.StudentPushFeedback(usn, meeting_date, feedback);
  } catch (err) {
    console.error(err);
    res.json(GenErrorJSON(err));
    res.end();
    return;
  }
  res.json(GenSuccessJSON("Feedback pushed."));
  res.end();
});

app.post("/mentor_fetch_feedback", async function (req, res) {
  const session_id = req.body.session_id;
  try {
    let isInSession = await db.IsMentorInSessionSID(session_id);
    if (!isInSession) {
      res.json(GenErrorJSON("Invalid session id"));
      res.end();
      return;
    }
  } catch (err) {
    console.error(err);
    res.json(GenErrorJSON(err));
    res.end();
    return;
  }
  const mentor_id = await db.FetchMentorIDFromSID(session_id);

  try {
    const results = await db.MentorFetchFeedback(mentor_id);
    if (results.length == 0) throw "No feedbacks!";
    res.json({ flag: 200, results });
    res.end();
  } catch (err) {
    console.error(err);
    res.json(GenErrorJSON(err));
    res.end();
    return;
  }
});

app.post("/student_fetch_feedback", async function (req, res) {
  const session_id = req.body.session_id;
  try {
    let isInSession = await db.IsStudentInSessionSID(session_id);
    if (!isInSession) {
      res.json(GenErrorJSON("Invalid session id"));
      res.end();
      return;
    }
  } catch (err) {
    console.error(err);
    res.json(GenErrorJSON(err));
    res.end();
    return;
  }
  const usn = await db.FetchUSNFromSID(session_id);
  try {
    const results = await db.StudentFetchFeedback(usn);
    if (results.length == 0) throw "No feedbacks!";
    res.json({ flag: 200, results });
    res.end();
  } catch (err) {
    console.error(err);
    res.json(GenErrorJSON(err));
    res.end();
    return;
  }
});

app.post("/mentor_validate_meeting_attendance", async function (req, res) {
  const session_id = req.body.session_id;
  const meeting_date = req.body.meeting_date;
  const usn = req.body.usn;
  if (!usn || !meeting_date) {
    res.json(GenErrorJSON("One of the fields are empty."));
    res.end();
    return;
  }
  try {
    let isInSession = await db.IsMentorInSessionSID(session_id);
    if (!isInSession) {
      res.json(GenErrorJSON("Invalid session id"));
      res.end();
      return;
    }
  } catch (err) {
    console.error(err);
    res.json(GenErrorJSON(err));
    res.end();
    return;
  }

  try {
    const results = await db.ValidateMeetingAttendance(usn, meeting_date);
    if (results.affectedRows == 0) throw "Validation failed";
  } catch (err) {
    console.error(err);
    res.json(GenErrorJSON(err));
    res.end();
    return;
  }
  res.json(GenSuccessJSON("Attendance Validated."));
  res.end();
});

let server = app.listen(PORT_NO, function () {
  let host = server.address().address;
  let port = server.address().port;
});
