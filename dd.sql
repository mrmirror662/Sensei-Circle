use mentor_management_system;


-- Dummy data for student_credentials table
INSERT INTO student_credentials VALUES
  ('1js21cs001','111'),
  ('1js21cs002','111'),
  ('1js21cs003','111'),
  ('1js21cs004','111'),
  ('1js21cs031','111'),
  ('1js21cs032','111'),
  ('1js21cs033','111'),
  ('1js21cs034','111'),
  ('1js21cs035','111');

-- Dummy data for branch table
INSERT INTO branch VALUES
  ('cse','computer science and engineering'),
  ('ise','information science and technology'),
  ('aiml','applied machine learning');

-- Dummy data for course_information table
INSERT INTO course_information VALUES
  ('21cs44','dbms',5),
  ('21cs22','aiml',5),
  ('21cs51','atc',5);

-- Dummy data for student_information table
INSERT INTO student_information (name, usn, phone_no, email, branch_id, semester) VALUES
  ('Student1', '1js21cs001', '1234567890', 'student1@example.com', 'cse', 1),
  ('Student2', '1js21cs002', '1234567891', 'student2@example.com', 'ise', 2),
  ('Student3', '1js21cs003', '1234567892', 'student3@example.com', 'aiml', 3),
  -- Add more dummy data for other students and semesters

-- Dummy data for mentor_credentials table
INSERT INTO mentor_credentials VALUES
  ('mentor1', 'password1'),
  ('mentor2', 'password2'),
  ('mentor3', 'password3');

-- Dummy data for mentor_information table
INSERT INTO mentor_information (name, mentor_id, phone_no, email, branch_id) VALUES
  ('Mentor1', 'mentor1', '9876543210', 'mentor1@example.com', 'cse'),
  ('Mentor2', 'mentor2', '9876543211', 'mentor2@example.com', 'ise'),
  ('Mentor3', 'mentor3', '9876543212', 'mentor3@example.com', 'aiml');
  -- Add more dummy data for other mentors

-- Dummy data for student_mentor_table
INSERT INTO student_mentor_table (mentor_id, usn) VALUES
  ('mentor1', '1js21cs001'),
  ('mentor2', '1js21cs002'),
  ('mentor3', '1js21cs003'),
  ('mentor1', '1js21cs004'),
  ('mentor2', '1js21cs031'),
  ('mentor3', '1js21cs032'),
  ('mentor1', '1js21cs033'),
  ('mentor2', '1js21cs034'),
  ('mentor3', '1js21cs035');

-- Dummy data for notification table (repeated for mentor-student pairs)
INSERT INTO notification (mentor_id, time, msg) VALUES
  ('mentor1', CURRENT_TIMESTAMP, 'Welcome to the mentoring program'),
  ('mentor2', CURRENT_TIMESTAMP, 'Important meeting tomorrow'),
  ('mentor3', CURRENT_TIMESTAMP, 'New course information available'),
  ('mentor1', CURRENT_TIMESTAMP, 'Welcome to the mentoring program'),
  ('mentor2', CURRENT_TIMESTAMP, 'Important meeting tomorrow'),
  ('mentor3', CURRENT_TIMESTAMP, 'New course information available'),
  ('mentor1', CURRENT_TIMESTAMP, 'Welcome to the mentoring program'),
  ('mentor2', CURRENT_TIMESTAMP, 'Important meeting tomorrow'),
  ('mentor3', CURRENT_TIMESTAMP, 'New course information available');