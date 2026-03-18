SELECT 
  (SELECT count(*) FROM "User") as users,
  (SELECT count(*) FROM "User" WHERE "role" = 'ADMIN') as admins,
  (SELECT count(*) FROM "User" WHERE "role" = 'TEACHER') as teachers,
  (SELECT count(*) FROM "User" WHERE "role" = 'STUDENT') as students,
  (SELECT count(*) FROM "Class") as classes,
  (SELECT count(*) FROM "Student") as student_records,
  (SELECT count(*) FROM "Subject") as subjects,
  (SELECT count(*) FROM "Exam") as exams,
  (SELECT count(*) FROM "Mark") as marks,
  (SELECT count(*) FROM "Attendance") as attendance;
