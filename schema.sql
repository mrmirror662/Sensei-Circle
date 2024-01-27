create database if not exists mentor_management_system;

use  mentor_management_system;

create table if not exists student_credentials( usn char(10) primary key,password varchar(32));

create table if not exists branch(branch_id varchar(10) primary key,branch_name varchar(32));

create table if not exists student_information(name varchar(255) , usn char(10) primary key,phone_no char(10),email varchar(255),branch_id char(10),semester int, foreign key(usn) references student_credentials(usn) on delete cascade );

create table if not exists course_information(course_id char(10) primary key,course_name varchar(255),semester int);

create table if not exists academic_details(usn char(10) ,course_id char(10),IA1 int,IA2 int,IA3 int,assignment_1 int,assignment_2 int,activity int,Total_internal_marks int, primary key(usn,course_id),foreign key (usn) references student_information(usn),foreign key (course_id) references course_information(course_id));

create table if not exists mentor_credentials( mentor_id char(10) primary key,password varchar(32));

create table if not exists mentor_information(name varchar(255) , mentor_id char(10) primary key,phone_no char(10),email varchar(255),branch_id char(10), foreign key(mentor_id) references mentor_credentials(mentor_id) on delete cascade );

create table if not exists student_session_info(session_id char(8) , usn char(10), t timestamp);

create table if not exists mentor_session_info(session_id char(8) , mentor_id char(10), t timestamp);
