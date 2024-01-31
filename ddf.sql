create database if not exists mentor_management_system;

-- Dummy data for branch table
insert into branch values
  ('cse','computer science and engineering'),
  ('ise','information science and technology'),
  ('aiml','applied machine learning');

-- Dummy data for course_information table
insert into course_information values
  ('21cs44','dbms',5),
  ('21cs22','aiml',5),
  ('21cs51','atc',5);

-- Dummy data for student_credentials table
insert into student_credentials values
  ('1js21cs001','111'),
  ('1js21cs002','111'),
  ('1js21cs003','111'),
  ('1js21cs004','111'),
  ('1js21cs031','111'),
  ('1js21cs032','111'),
  ('1js21cs033','111'),
  ('1js21cs034','111'),
  ('1js21cs035','111');

-- Dummy data for student_information table
insert into student_information (name, usn, phone_no, email, branch_id, semester) values
  ('Srinivasan', '1js21cs001', '1234567890', 'srinivasan@example.com', 'cse', 1),
  ('Rajalakshmi', '1js21cs002', '1234567891', 'rajalakshmi@example.com', 'ise', 2),
  ('Venkatesh', '1js21cs003', '1234567892', 'venkatesh@example.com', 'aiml', 3),
  ('Lakshmi', '1js21cs004', '1234567893', 'lakshmi@example.com', 'cse', 1),
  ('Prasad', '1js21cs031', '1234567894', 'prasad@example.com', 'ise', 2),
  ('Divya', '1js21cs032', '1234567895', 'divya@example.com', 'aiml', 3),
  ('Kumar', '1js21cs033', '1234567896', 'kumar@example.com', 'cse', 1),
  ('Anusha', '1js21cs034', '1234567897', 'anusha@example.com', 'ise', 2),
  ('Raghav', '1js21cs035', '1234567898', 'raghav@example.com', 'aiml', 3);


-- Dummy data for mentor_credentials table
insert into mentor_credentials values
  ('mentor1', 'password1'),
  ('mentor2', 'password2'),
  ('mentor3', 'password3');

-- Dummy data for mentor_information table
insert into mentor_information (name, mentor_id, phone_no, email, branch_id) values
  ('Arjun Kumar', 'mentor1', '9876543210', 'mentor1@example.com', 'cse'),  -- North Indian name
  ('Divya Nair', 'mentor2', '9876543211', 'mentor2@example.com', 'ise'),  -- South Indian name
  ('Rajesh Singh', 'mentor3', '9876543212', 'mentor3@example.com', 'aiml');  -- North Indian name


-- Dummy data for student_mentor_table
insert into student_mentor_table (mentor_id, usn) values
  ('mentor1', '1js21cs001'),
  ('mentor2', '1js21cs002'),
  ('mentor3', '1js21cs003'),
  ('mentor1', '1js21cs004'),
  ('mentor2', '1js21cs031'),
  ('mentor3', '1js21cs032'),
  ('mentor1', '1js21cs033'),
  ('mentor2', '1js21cs034'),
  ('mentor3', '1js21cs035');



insert into academic_details (usn, course_id, IA1, IA2, IA3, assignment_1, assignment_2, activity, Total_internal_marks, attendance) values 
('1js21cs001', '21cs44', 6, 4, 7, 10, 8, 2, 37, 78), 
('1js21cs002', '21cs22', 9, 19, 6, 9, 3, 1, 47, 95), 
('1js21cs003', '21cs51', 14, 12, 18, 2, 4, 5, 55, 65), 
('1js21cs004', '21cs44', 18, 17, 8, 7, 2, 2, 54, 64), 
('1js21cs031', '21cs22', 19, 7, 9, 5, 8, 4, 52, 82), 
('1js21cs032', '21cs51', 2, 11, 6, 6, 5, 6, 36, 75),
('1js21cs033', '21cs44', 1, 18, 1, 10, 10, 4, 44, 63),
('1js21cs034', '21cs22', 17, 15, 10, 2, 5, 7, 56, 65),
('1js21cs035', '21cs51', 20, 13, 15, 4, 4, 10, 66, 67);

insert into notification values
  ('mentor1', '2024-01-31 12:00:00', 'Dummy notification 1'),
  ('mentor1', '2024-01-31 12:30:00', 'Dummy notification 2'),
  ('mentor2', '2024-01-31 13:15:00', 'Dummy notification 3'),
  ('mentor3', '2024-01-31 14:00:00', 'Dummy notification 4');