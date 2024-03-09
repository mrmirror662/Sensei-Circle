create database if not exists mentor_management_system;

use  mentor_management_system;

create table if not exists student_credentials( usn char(10) primary key,password varchar(32));

create table if not exists branch(branch_id varchar(10) primary key,branch_name varchar(32));

create table if not exists student_information(name varchar(255) , usn char(10) primary key,phone_no char(10),email varchar(255),branch_id char(10),semester int, foreign key(usn) references student_credentials(usn) on delete cascade );

create table if not exists course_information(course_id char(10) primary key,course_name varchar(255),course_credits int,semester int);

create table if not exists academic_details(usn char(10) ,course_id char(10),IA1 int,IA2 int,IA3 int,assignment_1 int,assignment_2 int,activity int,Total_internal_marks int,attendance int, primary key(usn,course_id),foreign key (usn) references student_information(usn),foreign key (course_id) references course_information(course_id));

create table if not exists mentor_credentials( mentor_id char(10) primary key,password varchar(32));

create table if not exists mentor_information(name varchar(255) , mentor_id char(10) primary key,phone_no char(10),email varchar(255),branch_id char(10), foreign key(mentor_id) references mentor_credentials(mentor_id) on delete cascade );

create table if not exists student_session_info(session_id char(8) , usn char(10), t timestamp);

create table if not exists mentor_session_info(session_id char(8) , mentor_id char(10), t timestamp);

create table if not exists student_mentor_table(mentor_id char(10),usn char(10),primary key (mentor_id,usn),foreign key(mentor_id) references mentor_credentials(mentor_id) on delete cascade,foreign key(usn) references student_credentials(usn) on delete cascade );

create table if not exists notification(mentor_id char(10),time timestamp,msg text, primary key(mentor_id,time));

create table if not exists issues(usn char(10),time timestamp,msg text, primary key(usn,time));

create table if not exists meeting_feedback(usn char(10),meeting_date date,feedback text,attended tinyint(1) default 0,primary key(usn,meeting_date));

DELIMITER //

CREATE PROCEDURE InsertOrUpdateAcademia(academia_usn CHAR(10), academia_course_id CHAR(10), academia_ia_1 INT, academia_ia_2 INT, academia_ia_3 INT, academia_assignment_1 INT, academia_assignment_2 INT, academia_activity INT, academia_total INT, academia_attendance INT)
BEGIN
  INSERT INTO academic_details (usn, course_id, IA1, IA2, IA3, assignment_1, assignment_2, activity, Total_internal_marks, attendance)
  VALUES (academia_usn, academia_course_id, academia_ia_1, academia_ia_2, academia_ia_3, academia_assignment_1, academia_assignment_2, academia_activity, academia_total, academia_attendance)
  ON DUPLICATE KEY UPDATE
    IA1 = IFNULL(VALUES(IA1), IA1),
    IA2 = IFNULL(VALUES(IA2), IA2),
    IA3 = IFNULL(VALUES(IA3), IA3),
    assignment_1 = IFNULL(VALUES(assignment_1), assignment_1),
    assignment_2 = IFNULL(VALUES(assignment_2), assignment_2),
    activity = IFNULL(VALUES(activity), activity),
    Total_internal_marks = IFNULL(VALUES(Total_internal_marks), Total_internal_marks),
    attendance = IFNULL(VALUES(attendance), attendance);
END //

DELIMITER ;

CREATE TRIGGER CalculateTotalMarks
BEFORE INSERT ON academic_details
FOR EACH ROW
SET NEW.Total_internal_marks = COALESCE(NEW.IA1, 0) + COALESCE(NEW.IA2, 0) + COALESCE(NEW.IA3, 0) + COALESCE(NEW.assignment_1, 0) + COALESCE(NEW.assignment_2, 0) + COALESCE(NEW.activity, 0);

CREATE TRIGGER CalculateTotalMarksUpdate
BEFORE UPDATE ON academic_details
FOR EACH ROW
SET NEW.Total_internal_marks = COALESCE(NEW.IA1, 0) + COALESCE(NEW.IA2, 0) + COALESCE(NEW.IA3, 0) + COALESCE(NEW.assignment_1, 0) + COALESCE(NEW.assignment_2, 0) + COALESCE(NEW.activity, 0);

