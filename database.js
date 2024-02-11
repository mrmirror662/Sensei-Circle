import mysql from "mysql2/promise";
import dotenv from "dotenv";

//config env var
dotenv.config();

//shortcut
let log = console.log;

// Create the connection to database
const connection = await init();
let deleteStudentIntervalId = setInterval(
  deleteExpiredStudentSessions,
  10 * 60 * 1000
);
deleteExpiredStudentSessions();

let deleteMentorIntervalId = setInterval(
  deleteExpiredMentorSessions,
  10 * 60 * 1000
);
deleteExpiredMentorSessions();

async function init() {
  try {
    let c = await mysql.createConnection({
      host: process.env.host,
      user: process.env.user,
      database: process.env.db,
      password: process.env.password,
    });
    console.log(
      `DB initialized with \nhost:${process.env.host}\nuser:${process.env.user}\ndb:${process.env.db}`
    );
    //TO:DO perform table checks;
    return c;
  } catch (err) {
    console.error(`error db initialization Error:${err}`);
    process.exit();
  }
}
export async function StudentExists(usn) {
  let q_ = "select usn from student_credentials where usn=?";

  try {
    const [results, fields] = await connection.query(q_, [usn]);
    if (results.length !== 0) return true;
    return false;
  } catch (err) {
    console.error("Error checking user", err);
    throw "Error checking user";
  }
}

export async function InsertStudent(student) {
  let q = "insert into student_credentials values(?,?);";
  let q_ = "insert into student_information values(?,?,?,?,?,?);";

  try {
    const [results, fields] = await connection.query(q, [
      student.usn,
      student.password,
    ]);
    const [results1, fields1] = await connection.query(q_, [
      student.name,
      student.usn,
      student.phone_no,
      student.email,
      student.branch_id,
      student.semester,
    ]);
  } catch (err) {
    console.error("Error inserting user", err);
    throw "Error inserting user";
  }
}
export async function StudentCheckPassword(student) {
  let q_ = "select usn,password from student_credentials where usn=?";

  try {
    const [results, fields] = await connection.query(q_, [student.usn]);

    if (results.length == 0) {
      return false;
    }
    if (results[0]["password"] !== student.password) {
      return false;
    }
    return true;
  } catch (err) {
    console.error("Error authenticating  user", err);
    throw "Error authenticating  user";
  }
}

function generateSessionID() {
  return Math.random().toString(36).substr(2, 8);
}
export async function AddStudentToSession(usn) {
  let session_id = generateSessionID();
  let q = "insert into student_session_info values(?,?,now());";

  try {
    const [results, fields] = await connection.query(q, [session_id, usn]);
  } catch (err) {
    console.error(err);
    throw "error in adding to session";
  }

  return session_id;
}
export async function RemoveStudentSession(session_id) {
  let q = "delete from student_session_info where session_id=?";

  try {
    const [results, fields] = await connection.query(q, [session_id]);
  } catch (err) {
    console.error(err);

    throw "error deleteing from session";
  }
}

export async function IsStudentInSession(usn) {
  let q = "select usn from student_session_info where usn=?";

  try {
    const [results, fields] = await connection.query(q, [usn]);
    if (results.length !== 0) return true;
    return false;
  } catch (err) {
    console.error("Error checking user", err);
    throw "Error checking user";
  }
}
export async function IsStudentInSessionSID(session_id) {
  let q = "select session_id from student_session_info where session_id=?";

  try {
    const [results, fields] = await connection.query(q, [session_id]);
    if (results.length !== 0) return true;
    return false;
  } catch (err) {
    console.error("Error checking user", err);
    throw "Error checking user";
  }
}

export async function FetchUSNFromSID(session_id) {
  let q = "select usn from student_session_info where session_id=?";

  try {
    const [results, fields] = await connection.query(q, [session_id]);
    if (results.length == 0) throw "session not found";
    return results[0]["usn"];
  } catch (err) {
    console.error("Error checking user", err);
    throw "Error checking user";
  }
}

export async function deleteExpiredStudentSessions() {
  console.log("deleting expired sessions");
  let q =
    "delete from student_session_info  where t < now() - interval 30 minute;";
  try {
    const [results, fields] = await connection.query(q);
  } catch (err) {
    console.error(err);

    throw "error deleting expired sessions";
  }
}

export async function MentorExists(mentor_id) {
  let q_ = "select mentor_id from mentor_credentials where mentor_id=?";

  try {
    const [results, fields] = await connection.query(q_, [mentor_id]);
    if (results.length !== 0) return true;
    return false;
  } catch (err) {
    console.error("Error checking user", err);
    throw "Error checking user";
  }
}

export async function InsertMentor(mentor) {
  let q = "insert into mentor_credentials values(?,?);";
  let q_ = "insert into mentor_information values(?,?,?,?,?);";

  try {
    const [results, fields] = await connection.query(q, [
      mentor.mentor_id,
      mentor.password,
    ]);
    const [results1, fields1] = await connection.query(q_, [
      mentor.name,
      mentor.mentor_id,
      mentor.phone_no,
      mentor.email,
      mentor.branch_id,
    ]);
  } catch (err) {
    console.error("Error inserting user", err);
    throw "Error inserting user";
  }
}
export async function MentorCheckPassword(mentor) {
  let q_ =
    "select mentor_id,password from mentor_credentials where mentor_id=?";

  try {
    const [results, fields] = await connection.query(q_, [mentor.mentor_id]);

    if (results.length == 0) {
      return false;
    }
    if (results[0]["password"] !== mentor.password) {
      return false;
    }
    return true;
  } catch (err) {
    console.error("Error authenticating  user", err);
    throw "Error authenticating  user";
  }
}

export async function AddMentorToSession(mentor_id) {
  let session_id = generateSessionID();
  let q = "insert into mentor_session_info values(?,?,now());";

  try {
    const [results, fields] = await connection.query(q, [
      session_id,
      mentor_id,
    ]);
  } catch (err) {
    console.error(err);
    throw "error adding mentor to session";
  }

  return session_id;
}
export async function RemoveMentorSession(session_id) {
  let q = "delete from mentor_session_info where session_id=?";

  try {
    const [results, fields] = await connection.query(q, [session_id]);
  } catch (err) {
    console.error(err);

    throw "error removing mentor from session";
  }
}

export async function IsMentorInSession(mentor_id) {
  let q = "select mentor_id from mentor_session_info where mentor_id=?";

  try {
    const [results, fields] = await connection.query(q, [mentor_id]);
    if (results.length !== 0) return true;
    return false;
  } catch (err) {
    console.error("Error checking user", err);
    throw "Error checking user";
  }
}
export async function IsMentorInSessionSID(session_id) {
  let q = "select session_id from mentor_session_info where session_id=?";

  try {
    const [results, fields] = await connection.query(q, [session_id]);
    if (results.length !== 0) return true;
    return false;
  } catch (err) {
    console.error("Error checking user", err);
    throw "Error checking user";
  }
}
export async function FetchMentorIDFromSID(session_id) {
  let q = "select mentor_id from mentor_session_info where session_id=?";

  try {
    const [results, fields] = await connection.query(q, [session_id]);
    if (results.length == 0) throw "session not found";
    return results[0]["mentor_id"];
  } catch (err) {
    console.error("Error checking user", err);
    throw "Error checking user";
  }
}
export async function deleteExpiredMentorSessions() {
  console.log("deleting expired sessions");
  let q =
    "delete from mentor_session_info  where t < now() - interval 30 minute;";
  try {
    const [results, fields] = await connection.query(q);
  } catch (err) {
    console.error(err);

    throw "error deleting expired mentor sessions";
  }
}
export async function CourseExists(course_id) {
  let q_ = "select course_id from course_information where course_id=?";

  try {
    const [results, fields] = await connection.query(q_, [course_id]);
    if (results.length !== 0) return true;
    return false;
  } catch (err) {
    console.error("Error checking course", err);
    throw "Error checking course";
  }
}

export async function InsertCourse(course) {
  let q = "insert into course_information values(?,?,?)";
  try {
    const [results, fields] = await connection.query(q, [
      course.course_id,
      course.course_name,
      course.semester,
    ]);
  } catch (err) {
    console.error("Error inserting course", err);
    throw "Error inserting course";
  }
}

export async function AcademiaExists(usn, course_id) {
  let q =
    "select usn,course_id from academic_details where usn=? and course_id=?";
  try {
    const [results, fields] = await connection.query(q, [usn, course_id]);
    if (results.length !== 0) return true;
    return false;
  } catch (err) {
    console.error("Error checking academia", err);
    throw "Error checking academia";
  }
}

export async function AcademiaInsert(academia) {
  let q =
    "INSERT INTO academic_details (usn, course_id, IA1, IA2, IA3, assignment_1, assignment_2, activity, Total_internal_marks,attendance) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?) ON DUPLICATE KEY UPDATE IA1 = IFNULL(VALUES(IA1), IA1),IA2 = IFNULL(VALUES(IA2), IA2),IA3 = IFNULL(VALUES(IA3), IA3),assignment_1 = IFNULL(VALUES(assignment_1), assignment_1),assignment_2 = IFNULL(VALUES(assignment_2), assignment_2),activity = IFNULL(VALUES(activity), activity),Total_internal_marks = IFNULL(VALUES(Total_internal_marks), Total_internal_marks),attendance=IFNULL(VALUES(attendance),attendance);";
  try {
    const [results, fields] = await connection.query(q, [
      academia.usn,
      academia.course_id,
      academia.ia_1,
      academia.ia_2,
      academia.ia_3,
      academia.assignment_1,
      academia.assignment_2,
      academia.activity,
      academia.total,
      academia.attendance,
    ]);
  } catch (err) {
    console.error("Error inserting academia", err);
    throw "Error inserting academia";
  }
  let q_ =
    "UPDATE academic_details SET Total_internal_marks= ifnull(IA1,0) + ifnull(IA2,0) + ifnull(IA3,0) + ifnull(assignment_1,0) +ifnull(assignment_2,0) + ifnull(activity,0) WHERE usn=? and course_id=?;";
  try {
    const [results, fields] = await connection.query(q_, [
      academia.usn,
      academia.course_id,
    ]);
  } catch (err) {
    console.error("Error checking academia", err);
    throw "Error checking academia";
  }
}

export async function StudentAcademiaFetch(session_id) {
  let q =
    "select a.* from academic_details a , student_session_info s where s.session_id=? and a.usn=s.usn";
  try {
    const [results, fields] = await connection.query(q, [session_id]);
    console.log(results);
    return results;
  } catch (err) {
    console.error("Error checking academia", err);
    throw "Error checking academia";
  }
}
export async function MentorAcademiaFetch(session_id, usn) {
  let q =
    "select a.* from academic_details a , mentor_session_info m, student_mentor_table sm where m.session_id=? and m.mentor_id=sm.mentor_id and sm.usn=? and sm.usn=a.usn";
  try {
    const [results, fields] = await connection.query(q, [session_id, usn]);
    console.log(results);
    return results;
  } catch (err) {
    console.error("Error checking academia", err);
    throw "Error checking academia";
  }
}
export async function MentorStudentExists(mentor_id, usn) {
  let q =
    "select mentor_id,usn from student_mentor_table where mentor_id=? and usn=?";

  try {
    const [results, fields] = await connection.query(q, [mentor_id, usn]);
    if (results.length !== 0) return true;
    return false;
  } catch (err) {
    console.error("Error checking mentor_student", err);
    throw "Error checking mentor_student";
  }
}
export async function RegisterStudentToMentor(mentor_id, usn) {
  let q = "insert into student_mentor_table values(?,?)";
  try {
    const [results, fields] = await connection.query(q, [mentor_id, usn]);
  } catch (err) {
    console.error("Error registering to mentor", err);
    throw "Error registering student to mentor";
  }
}

export async function DeregisterStudentToMentor(mentor_id, usn) {
  let q = "delete from student_mentor_table where mentor_id = ? and usn = ?;";
  try {
    const [results, fields] = await connection.query(q, [mentor_id, usn]);
  } catch (err) {
    console.error("Error deregistering to mentor", err);
    throw "Error deregistering student to mentor";
  }
}
export async function FetchStudentDetailsFromMentorID(mentor_id) {
  let q =
    "select si.* from student_mentor_table sm, student_information si where sm.mentor_id = ? and sm.usn = si.usn;";
  try {
    const [results, fields] = await connection.query(q, [mentor_id]);
    return results;
  } catch (err) {
    console.error("Error fetching student details ", err);
    throw "Error fetching student details ";
  }
}

export async function MentorPushNotification(mentor_id, msg) {
  let q = "insert into notification values(?,now(),?);";
  try {
    const [results, fields] = await connection.query(q, [mentor_id, msg]);
  } catch (err) {
    console.error("Error inserting notification", err);
    throw "Error inserting notification";
  }
}

export async function MentorFetchNotification(mentor_id) {
  let q =
    "select * from notification where mentor_id = ? order by time desc limit 30;";
  try {
    const [results, fields] = await connection.query(q, [mentor_id]);
    return results;
  } catch (err) {
    console.error("Error fetching notification", err);
    throw "Error fetching notification";
  }
}

export async function StudentFetchNotification(usn) {
  let q =
    "select n.time , n.msg from notification n,student_mentor_table ms where ms.usn = ? and ms.mentor_id = n.mentor_id ";
  try {
    const [results, fields] = await connection.query(q, [usn]);
    return results;
  } catch (err) {
    console.error("Error fetching notification", err);
    throw "Error fetching notification";
  }
}

export async function StudentPushIssue(usn, msg) {
  let q = "insert into issues values(?,now(),?);";
  try {
    const [results, fields] = await connection.query(q, [usn, msg]);
  } catch (err) {
    console.error("Error inserting issues", err);
    throw "Error inserting issues";
  }
}

export async function MentorFetchIssue(mentor_id) {
  let q =
    "select i.time , i.msg from issues i where i.usn in(select usn from student_mentor_table sm where sm.mentor_id=?) order by time desc limit 30;"; //TO:FIX (bs code)
  try {
    const [results, fields] = await connection.query(q, [mentor_id]);
    return results;
  } catch (err) {
    console.error("Error fetching issues", err);
    throw "Error fetching issues";
  }
}

export async function StudentFetchIssue(usn) {
  let q = "select * from issues where usn = ? order by time desc limit 30";
  try {
    const [results, fields] = await connection.query(q, [usn]);
    return results;
  } catch (err) {
    console.error("Error fetching issues", err);
    throw "Error fetching issues";
  }
}

export async function StudentPushFeedback(usn, meeting_date, feedback) {
  let q = "insert into meeting_feedback values(? ,? ,? ,0)";
  try {
    const [results, fields] = await connection.query(q, [
      usn,
      meeting_date,
      feedback,
    ]);
  } catch (err) {
    console.error("Error inserting feedback", err);
    throw "Error inserting feedback";
  }
}

export async function ValidateMeetingAttendance(usn, meeting_date) {
  let q =
    "update meeting_feedback set attended=1 where usn=? and meeting_date=?";
  try {
    const [results, fields] = await connection.query(q, [usn, meeting_date]);
    return results;
  } catch (err) {
    console.error("Error Validating Attendance", err);
    throw "Error Validating Attendance";
  }
}

export async function StudentFetchFeedback(usn) {
  let q =
    "select meeting_date,feedback from meeting_feedback where usn = ? and attended=1 order by meeting_date desc limit 30";
  try {
    const [results, fields] = await connection.query(q, [usn]);
    return results;
  } catch (err) {
    console.error("Error fetching feedbacks", err);
    throw "Error fetching feedbacks";
  }
}
export async function MentorFetchFeedback(mentor_id) {
  let q =
    "select i.usn,i.meeting_date,i.feedback from meeting_feedback i where i.usn in(select usn from student_mentor_table sm where sm.mentor_id=?) and attended=1 order by meeting_date desc limit 30;"; //TO:FIX (bs code)
  try {
    const [results, fields] = await connection.query(q, [mentor_id]);
    return results;
  } catch (err) {
    console.error("Error fetching feedbacks", err);
    throw "Error fetching feedbacks";
  }
}
