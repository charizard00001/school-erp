-- Seed script for School ERP
-- Generated for execution via supabase db query --linked

-- Clean existing data (in order of dependencies)
DELETE FROM "ChatMessage";
DELETE FROM "Mark";
DELETE FROM "Attendance";
DELETE FROM "Exam";
DELETE FROM "TeacherClass";
DELETE FROM "Student";
DELETE FROM "Teacher";
DELETE FROM "Subject";
DELETE FROM "Class";
DELETE FROM "User";

-- Create Admin user
-- password: admin123 (bcrypt hash)
INSERT INTO "User" (id, email, "passwordHash", name, phone, role, "createdAt", "updatedAt")
VALUES (
  'admin001',
  'admin@school.com',
  '$2b$10$D5l5Zi7v7oMU78AmKaloUO.uykX5hm1zz.CaDZKc.paOCnBGeJd5C',
  'Admin User',
  '9999999999',
  'ADMIN',
  NOW(),
  NOW()
);

-- Create Classes (1-12, sections A and B)
INSERT INTO "Class" (id, name, section, "academicYear") VALUES
('cls-01a', '1', 'A', '2025-2026'), ('cls-01b', '1', 'B', '2025-2026'),
('cls-02a', '2', 'A', '2025-2026'), ('cls-02b', '2', 'B', '2025-2026'),
('cls-03a', '3', 'A', '2025-2026'), ('cls-03b', '3', 'B', '2025-2026'),
('cls-04a', '4', 'A', '2025-2026'), ('cls-04b', '4', 'B', '2025-2026'),
('cls-05a', '5', 'A', '2025-2026'), ('cls-05b', '5', 'B', '2025-2026'),
('cls-06a', '6', 'A', '2025-2026'), ('cls-06b', '6', 'B', '2025-2026'),
('cls-07a', '7', 'A', '2025-2026'), ('cls-07b', '7', 'B', '2025-2026'),
('cls-08a', '8', 'A', '2025-2026'), ('cls-08b', '8', 'B', '2025-2026'),
('cls-09a', '9', 'A', '2025-2026'), ('cls-09b', '9', 'B', '2025-2026'),
('cls-10a', '10', 'A', '2025-2026'), ('cls-10b', '10', 'B', '2025-2026'),
('cls-11a', '11', 'A', '2025-2026'), ('cls-11b', '11', 'B', '2025-2026'),
('cls-12a', '12', 'A', '2025-2026'), ('cls-12b', '12', 'B', '2025-2026');

-- Create Subjects for Class 10A and 10B
INSERT INTO "Subject" (id, name, "classId") VALUES
('sub-10a-math', 'Mathematics', 'cls-10a'),
('sub-10a-eng', 'English', 'cls-10a'),
('sub-10a-sci', 'Science', 'cls-10a'),
('sub-10a-ss', 'Social Studies', 'cls-10a'),
('sub-10a-hin', 'Hindi', 'cls-10a'),
('sub-10b-math', 'Mathematics', 'cls-10b'),
('sub-10b-eng', 'English', 'cls-10b'),
('sub-10b-sci', 'Science', 'cls-10b'),
('sub-10b-ss', 'Social Studies', 'cls-10b'),
('sub-10b-hin', 'Hindi', 'cls-10b');

-- Create Teacher users (password: teacher123)
INSERT INTO "User" (id, email, "passwordHash", name, phone, role, "createdAt", "updatedAt") VALUES
('tchr-u1', 'teacher@school.com', '$2b$10$7uBLZKNLSk9q7x8CQ1XVo.RZPcW9MUX9qQL3McX8yeskTJ546/iUC', 'Priya Sharma', '9876543210', 'TEACHER', NOW(), NOW()),
('tchr-u2', 'rajesh@school.com', '$2b$10$7uBLZKNLSk9q7x8CQ1XVo.RZPcW9MUX9qQL3McX8yeskTJ546/iUC', 'Rajesh Kumar', '9876543211', 'TEACHER', NOW(), NOW()),
('tchr-u3', 'anita@school.com', '$2b$10$7uBLZKNLSk9q7x8CQ1XVo.RZPcW9MUX9qQL3McX8yeskTJ546/iUC', 'Anita Singh', '9876543212', 'TEACHER', NOW(), NOW()),
('tchr-u4', 'vikram@school.com', '$2b$10$7uBLZKNLSk9q7x8CQ1XVo.RZPcW9MUX9qQL3McX8yeskTJ546/iUC', 'Vikram Patel', '9876543213', 'TEACHER', NOW(), NOW()),
('tchr-u5', 'sunita@school.com', '$2b$10$7uBLZKNLSk9q7x8CQ1XVo.RZPcW9MUX9qQL3McX8yeskTJ546/iUC', 'Sunita Verma', '9876543214', 'TEACHER', NOW(), NOW());

INSERT INTO "Teacher" (id, "userId") VALUES
('tchr-1', 'tchr-u1'),
('tchr-2', 'tchr-u2'),
('tchr-3', 'tchr-u3'),
('tchr-4', 'tchr-u4'),
('tchr-5', 'tchr-u5');

-- Assign teachers to Class 10A
INSERT INTO "TeacherClass" (id, "teacherId", "classId", "subjectId") VALUES
('tc-1', 'tchr-1', 'cls-10a', 'sub-10a-math'),
('tc-2', 'tchr-2', 'cls-10a', 'sub-10a-eng'),
('tc-3', 'tchr-3', 'cls-10a', 'sub-10a-sci'),
('tc-4', 'tchr-4', 'cls-10a', 'sub-10a-ss'),
('tc-5', 'tchr-5', 'cls-10a', 'sub-10a-hin'),
-- First 3 teachers also in 10B
('tc-6', 'tchr-1', 'cls-10b', 'sub-10b-math'),
('tc-7', 'tchr-2', 'cls-10b', 'sub-10b-eng'),
('tc-8', 'tchr-3', 'cls-10b', 'sub-10b-sci');

-- Create Student users (password: student123)
INSERT INTO "User" (id, email, "passwordHash", name, phone, role, "createdAt", "updatedAt") VALUES
('stu-u01', 'student@school.com', '$2b$10$baax3j95SN0lZMgyC/3N7OOEGy2G03WwC1JS0sq3YAjKIMQLqDH1m', 'Rahul Sharma', NULL, 'STUDENT', NOW(), NOW()),
('stu-u02', 'priya1@school.com', '$2b$10$baax3j95SN0lZMgyC/3N7OOEGy2G03WwC1JS0sq3YAjKIMQLqDH1m', 'Priya Verma', NULL, 'STUDENT', NOW(), NOW()),
('stu-u03', 'amit2@school.com', '$2b$10$baax3j95SN0lZMgyC/3N7OOEGy2G03WwC1JS0sq3YAjKIMQLqDH1m', 'Amit Patel', NULL, 'STUDENT', NOW(), NOW()),
('stu-u04', 'sneha3@school.com', '$2b$10$baax3j95SN0lZMgyC/3N7OOEGy2G03WwC1JS0sq3YAjKIMQLqDH1m', 'Sneha Singh', NULL, 'STUDENT', NOW(), NOW()),
('stu-u05', 'vikram4@school.com', '$2b$10$baax3j95SN0lZMgyC/3N7OOEGy2G03WwC1JS0sq3YAjKIMQLqDH1m', 'Vikram Kumar', NULL, 'STUDENT', NOW(), NOW()),
('stu-u06', 'neha5@school.com', '$2b$10$baax3j95SN0lZMgyC/3N7OOEGy2G03WwC1JS0sq3YAjKIMQLqDH1m', 'Neha Gupta', NULL, 'STUDENT', NOW(), NOW()),
('stu-u07', 'rohan6@school.com', '$2b$10$baax3j95SN0lZMgyC/3N7OOEGy2G03WwC1JS0sq3YAjKIMQLqDH1m', 'Rohan Joshi', NULL, 'STUDENT', NOW(), NOW()),
('stu-u08', 'pooja7@school.com', '$2b$10$baax3j95SN0lZMgyC/3N7OOEGy2G03WwC1JS0sq3YAjKIMQLqDH1m', 'Pooja Yadav', NULL, 'STUDENT', NOW(), NOW()),
('stu-u09', 'arjun8@school.com', '$2b$10$baax3j95SN0lZMgyC/3N7OOEGy2G03WwC1JS0sq3YAjKIMQLqDH1m', 'Arjun Mishra', NULL, 'STUDENT', NOW(), NOW()),
('stu-u10', 'kavita9@school.com', '$2b$10$baax3j95SN0lZMgyC/3N7OOEGy2G03WwC1JS0sq3YAjKIMQLqDH1m', 'Kavita Reddy', NULL, 'STUDENT', NOW(), NOW()),
('stu-u11', 'suresh10@school.com', '$2b$10$baax3j95SN0lZMgyC/3N7OOEGy2G03WwC1JS0sq3YAjKIMQLqDH1m', 'Suresh Sharma', NULL, 'STUDENT', NOW(), NOW()),
('stu-u12', 'meera11@school.com', '$2b$10$baax3j95SN0lZMgyC/3N7OOEGy2G03WwC1JS0sq3YAjKIMQLqDH1m', 'Meera Verma', NULL, 'STUDENT', NOW(), NOW()),
('stu-u13', 'aditya12@school.com', '$2b$10$baax3j95SN0lZMgyC/3N7OOEGy2G03WwC1JS0sq3YAjKIMQLqDH1m', 'Aditya Patel', NULL, 'STUDENT', NOW(), NOW()),
('stu-u14', 'riya13@school.com', '$2b$10$baax3j95SN0lZMgyC/3N7OOEGy2G03WwC1JS0sq3YAjKIMQLqDH1m', 'Riya Singh', NULL, 'STUDENT', NOW(), NOW()),
('stu-u15', 'deepak14@school.com', '$2b$10$baax3j95SN0lZMgyC/3N7OOEGy2G03WwC1JS0sq3YAjKIMQLqDH1m', 'Deepak Kumar', NULL, 'STUDENT', NOW(), NOW()),
-- Class 10B students
('stu-u16', 'nehab0@school.com', '$2b$10$baax3j95SN0lZMgyC/3N7OOEGy2G03WwC1JS0sq3YAjKIMQLqDH1m', 'Neha Singh', NULL, 'STUDENT', NOW(), NOW()),
('stu-u17', 'rohanb1@school.com', '$2b$10$baax3j95SN0lZMgyC/3N7OOEGy2G03WwC1JS0sq3YAjKIMQLqDH1m', 'Rohan Kumar', NULL, 'STUDENT', NOW(), NOW()),
('stu-u18', 'poojab2@school.com', '$2b$10$baax3j95SN0lZMgyC/3N7OOEGy2G03WwC1JS0sq3YAjKIMQLqDH1m', 'Pooja Gupta', NULL, 'STUDENT', NOW(), NOW()),
('stu-u19', 'arjunb3@school.com', '$2b$10$baax3j95SN0lZMgyC/3N7OOEGy2G03WwC1JS0sq3YAjKIMQLqDH1m', 'Arjun Joshi', NULL, 'STUDENT', NOW(), NOW()),
('stu-u20', 'kavitab4@school.com', '$2b$10$baax3j95SN0lZMgyC/3N7OOEGy2G03WwC1JS0sq3YAjKIMQLqDH1m', 'Kavita Yadav', NULL, 'STUDENT', NOW(), NOW()),
('stu-u21', 'sureshb5@school.com', '$2b$10$baax3j95SN0lZMgyC/3N7OOEGy2G03WwC1JS0sq3YAjKIMQLqDH1m', 'Suresh Mishra', NULL, 'STUDENT', NOW(), NOW()),
('stu-u22', 'meerab6@school.com', '$2b$10$baax3j95SN0lZMgyC/3N7OOEGy2G03WwC1JS0sq3YAjKIMQLqDH1m', 'Meera Reddy', NULL, 'STUDENT', NOW(), NOW()),
('stu-u23', 'adityab7@school.com', '$2b$10$baax3j95SN0lZMgyC/3N7OOEGy2G03WwC1JS0sq3YAjKIMQLqDH1m', 'Aditya Sharma', NULL, 'STUDENT', NOW(), NOW()),
('stu-u24', 'riyab8@school.com', '$2b$10$baax3j95SN0lZMgyC/3N7OOEGy2G03WwC1JS0sq3YAjKIMQLqDH1m', 'Riya Verma', NULL, 'STUDENT', NOW(), NOW()),
('stu-u25', 'deepakb9@school.com', '$2b$10$baax3j95SN0lZMgyC/3N7OOEGy2G03WwC1JS0sq3YAjKIMQLqDH1m', 'Deepak Patel', NULL, 'STUDENT', NOW(), NOW());

-- Create Student records
INSERT INTO "Student" (id, "userId", "classId", "rollNumber", "parentName", "parentPhone") VALUES
('stu-01', 'stu-u01', 'cls-10a', '001', 'Mr./Mrs. Sharma', '9876543200'),
('stu-02', 'stu-u02', 'cls-10a', '002', 'Mr./Mrs. Verma', '9876543201'),
('stu-03', 'stu-u03', 'cls-10a', '003', 'Mr./Mrs. Patel', '9876543202'),
('stu-04', 'stu-u04', 'cls-10a', '004', 'Mr./Mrs. Singh', '9876543203'),
('stu-05', 'stu-u05', 'cls-10a', '005', 'Mr./Mrs. Kumar', '9876543204'),
('stu-06', 'stu-u06', 'cls-10a', '006', 'Mr./Mrs. Gupta', '9876543205'),
('stu-07', 'stu-u07', 'cls-10a', '007', 'Mr./Mrs. Joshi', '9876543206'),
('stu-08', 'stu-u08', 'cls-10a', '008', 'Mr./Mrs. Yadav', '9876543207'),
('stu-09', 'stu-u09', 'cls-10a', '009', 'Mr./Mrs. Mishra', '9876543208'),
('stu-10', 'stu-u10', 'cls-10a', '010', 'Mr./Mrs. Reddy', '9876543209'),
('stu-11', 'stu-u11', 'cls-10a', '011', 'Mr./Mrs. Sharma', '9876543210'),
('stu-12', 'stu-u12', 'cls-10a', '012', 'Mr./Mrs. Verma', '9876543211'),
('stu-13', 'stu-u13', 'cls-10a', '013', 'Mr./Mrs. Patel', '9876543212'),
('stu-14', 'stu-u14', 'cls-10a', '014', 'Mr./Mrs. Singh', '9876543213'),
('stu-15', 'stu-u15', 'cls-10a', '015', 'Mr./Mrs. Kumar', '9876543214'),
-- Class 10B students
('stu-16', 'stu-u16', 'cls-10b', '016', 'Mr./Mrs. Singh', '9876543300'),
('stu-17', 'stu-u17', 'cls-10b', '017', 'Mr./Mrs. Kumar', '9876543301'),
('stu-18', 'stu-u18', 'cls-10b', '018', 'Mr./Mrs. Gupta', '9876543302'),
('stu-19', 'stu-u19', 'cls-10b', '019', 'Mr./Mrs. Joshi', '9876543303'),
('stu-20', 'stu-u20', 'cls-10b', '020', 'Mr./Mrs. Yadav', '9876543304'),
('stu-21', 'stu-u21', 'cls-10b', '021', 'Mr./Mrs. Mishra', '9876543305'),
('stu-22', 'stu-u22', 'cls-10b', '022', 'Mr./Mrs. Reddy', '9876543306'),
('stu-23', 'stu-u23', 'cls-10b', '023', 'Mr./Mrs. Sharma', '9876543307'),
('stu-24', 'stu-u24', 'cls-10b', '024', 'Mr./Mrs. Verma', '9876543308'),
('stu-25', 'stu-u25', 'cls-10b', '025', 'Mr./Mrs. Patel', '9876543309');

-- Create Exams for Class 10A
INSERT INTO "Exam" (id, name, "classId", "subjectId", date, "totalMarks") VALUES
('exam-mt-math', 'Mid-Term', 'cls-10a', 'sub-10a-math', '2025-09-15', 100),
('exam-mt-eng', 'Mid-Term', 'cls-10a', 'sub-10a-eng', '2025-09-15', 100),
('exam-mt-sci', 'Mid-Term', 'cls-10a', 'sub-10a-sci', '2025-09-15', 100),
('exam-mt-ss', 'Mid-Term', 'cls-10a', 'sub-10a-ss', '2025-09-15', 100),
('exam-mt-hin', 'Mid-Term', 'cls-10a', 'sub-10a-hin', '2025-09-15', 100),
('exam-fn-math', 'Final', 'cls-10a', 'sub-10a-math', '2026-02-15', 100),
('exam-fn-eng', 'Final', 'cls-10a', 'sub-10a-eng', '2026-02-15', 100),
('exam-fn-sci', 'Final', 'cls-10a', 'sub-10a-sci', '2026-02-15', 100),
('exam-fn-ss', 'Final', 'cls-10a', 'sub-10a-ss', '2026-02-15', 100),
('exam-fn-hin', 'Final', 'cls-10a', 'sub-10a-hin', '2026-02-15', 100);

-- Create Marks (random-ish data for 15 students x 10 exams = 150 rows)
INSERT INTO "Mark" (id, "studentId", "examId", "marksObtained") VALUES
-- Mid-Term Math
('m001', 'stu-01', 'exam-mt-math', 78), ('m002', 'stu-02', 'exam-mt-math', 85),
('m003', 'stu-03', 'exam-mt-math', 62), ('m004', 'stu-04', 'exam-mt-math', 91),
('m005', 'stu-05', 'exam-mt-math', 45), ('m006', 'stu-06', 'exam-mt-math', 73),
('m007', 'stu-07', 'exam-mt-math', 88), ('m008', 'stu-08', 'exam-mt-math', 56),
('m009', 'stu-09', 'exam-mt-math', 67), ('m010', 'stu-10', 'exam-mt-math', 82),
('m011', 'stu-11', 'exam-mt-math', 71), ('m012', 'stu-12', 'exam-mt-math', 94),
('m013', 'stu-13', 'exam-mt-math', 53), ('m014', 'stu-14', 'exam-mt-math', 76),
('m015', 'stu-15', 'exam-mt-math', 89),
-- Mid-Term English
('m016', 'stu-01', 'exam-mt-eng', 82), ('m017', 'stu-02', 'exam-mt-eng', 76),
('m018', 'stu-03', 'exam-mt-eng', 91), ('m019', 'stu-04', 'exam-mt-eng', 68),
('m020', 'stu-05', 'exam-mt-eng', 55), ('m021', 'stu-06', 'exam-mt-eng', 87),
('m022', 'stu-07', 'exam-mt-eng', 72), ('m023', 'stu-08', 'exam-mt-eng', 63),
('m024', 'stu-09', 'exam-mt-eng', 84), ('m025', 'stu-10', 'exam-mt-eng', 78),
('m026', 'stu-11', 'exam-mt-eng', 65), ('m027', 'stu-12', 'exam-mt-eng', 90),
('m028', 'stu-13', 'exam-mt-eng', 47), ('m029', 'stu-14', 'exam-mt-eng', 81),
('m030', 'stu-15', 'exam-mt-eng', 73),
-- Mid-Term Science
('m031', 'stu-01', 'exam-mt-sci', 69), ('m032', 'stu-02', 'exam-mt-sci', 92),
('m033', 'stu-03', 'exam-mt-sci', 58), ('m034', 'stu-04', 'exam-mt-sci', 84),
('m035', 'stu-05', 'exam-mt-sci', 41), ('m036', 'stu-06', 'exam-mt-sci', 77),
('m037', 'stu-07', 'exam-mt-sci', 86), ('m038', 'stu-08', 'exam-mt-sci', 52),
('m039', 'stu-09', 'exam-mt-sci', 71), ('m040', 'stu-10', 'exam-mt-sci', 88),
('m041', 'stu-11', 'exam-mt-sci', 63), ('m042', 'stu-12', 'exam-mt-sci', 95),
('m043', 'stu-13', 'exam-mt-sci', 49), ('m044', 'stu-14', 'exam-mt-sci', 73),
('m045', 'stu-15', 'exam-mt-sci', 81),
-- Mid-Term Social Studies
('m046', 'stu-01', 'exam-mt-ss', 85), ('m047', 'stu-02', 'exam-mt-ss', 71),
('m048', 'stu-03', 'exam-mt-ss', 66), ('m049', 'stu-04', 'exam-mt-ss', 92),
('m050', 'stu-05', 'exam-mt-ss', 53), ('m051', 'stu-06', 'exam-mt-ss', 79),
('m052', 'stu-07', 'exam-mt-ss', 74), ('m053', 'stu-08', 'exam-mt-ss', 61),
('m054', 'stu-09', 'exam-mt-ss', 88), ('m055', 'stu-10', 'exam-mt-ss', 76),
('m056', 'stu-11', 'exam-mt-ss', 69), ('m057', 'stu-12', 'exam-mt-ss', 83),
('m058', 'stu-13', 'exam-mt-ss', 44), ('m059', 'stu-14', 'exam-mt-ss', 77),
('m060', 'stu-15', 'exam-mt-ss', 91),
-- Mid-Term Hindi
('m061', 'stu-01', 'exam-mt-hin', 74), ('m062', 'stu-02', 'exam-mt-hin', 88),
('m063', 'stu-03', 'exam-mt-hin', 71), ('m064', 'stu-04', 'exam-mt-hin', 65),
('m065', 'stu-05', 'exam-mt-hin', 48), ('m066', 'stu-06', 'exam-mt-hin', 82),
('m067', 'stu-07', 'exam-mt-hin', 79), ('m068', 'stu-08', 'exam-mt-hin', 57),
('m069', 'stu-09', 'exam-mt-hin', 75), ('m070', 'stu-10', 'exam-mt-hin', 84),
('m071', 'stu-11', 'exam-mt-hin', 67), ('m072', 'stu-12', 'exam-mt-hin', 91),
('m073', 'stu-13', 'exam-mt-hin', 52), ('m074', 'stu-14', 'exam-mt-hin', 78),
('m075', 'stu-15', 'exam-mt-hin', 86),
-- Final Math
('m076', 'stu-01', 'exam-fn-math', 82), ('m077', 'stu-02', 'exam-fn-math', 89),
('m078', 'stu-03', 'exam-fn-math', 67), ('m079', 'stu-04', 'exam-fn-math', 94),
('m080', 'stu-05', 'exam-fn-math', 51), ('m081', 'stu-06', 'exam-fn-math', 78),
('m082', 'stu-07', 'exam-fn-math', 91), ('m083', 'stu-08', 'exam-fn-math', 60),
('m084', 'stu-09', 'exam-fn-math', 72), ('m085', 'stu-10', 'exam-fn-math', 86),
('m086', 'stu-11', 'exam-fn-math', 75), ('m087', 'stu-12', 'exam-fn-math', 97),
('m088', 'stu-13', 'exam-fn-math', 58), ('m089', 'stu-14', 'exam-fn-math', 80),
('m090', 'stu-15', 'exam-fn-math', 93),
-- Final English
('m091', 'stu-01', 'exam-fn-eng', 86), ('m092', 'stu-02', 'exam-fn-eng', 79),
('m093', 'stu-03', 'exam-fn-eng', 94), ('m094', 'stu-04', 'exam-fn-eng', 72),
('m095', 'stu-05', 'exam-fn-eng', 59), ('m096', 'stu-06', 'exam-fn-eng', 90),
('m097', 'stu-07', 'exam-fn-eng', 76), ('m098', 'stu-08', 'exam-fn-eng', 67),
('m099', 'stu-09', 'exam-fn-eng', 88), ('m100', 'stu-10', 'exam-fn-eng', 82),
('m101', 'stu-11', 'exam-fn-eng', 70), ('m102', 'stu-12', 'exam-fn-eng', 93),
('m103', 'stu-13', 'exam-fn-eng', 51), ('m104', 'stu-14', 'exam-fn-eng', 85),
('m105', 'stu-15', 'exam-fn-eng', 77),
-- Final Science
('m106', 'stu-01', 'exam-fn-sci', 73), ('m107', 'stu-02', 'exam-fn-sci', 95),
('m108', 'stu-03', 'exam-fn-sci', 62), ('m109', 'stu-04', 'exam-fn-sci', 87),
('m110', 'stu-05', 'exam-fn-sci', 46), ('m111', 'stu-06', 'exam-fn-sci', 81),
('m112', 'stu-07', 'exam-fn-sci', 89), ('m113', 'stu-08', 'exam-fn-sci', 56),
('m114', 'stu-09', 'exam-fn-sci', 75), ('m115', 'stu-10', 'exam-fn-sci', 91),
('m116', 'stu-11', 'exam-fn-sci', 68), ('m117', 'stu-12', 'exam-fn-sci', 98),
('m118', 'stu-13', 'exam-fn-sci', 54), ('m119', 'stu-14', 'exam-fn-sci', 77),
('m120', 'stu-15', 'exam-fn-sci', 84),
-- Final Social Studies
('m121', 'stu-01', 'exam-fn-ss', 89), ('m122', 'stu-02', 'exam-fn-ss', 75),
('m123', 'stu-03', 'exam-fn-ss', 70), ('m124', 'stu-04', 'exam-fn-ss', 95),
('m125', 'stu-05', 'exam-fn-ss', 57), ('m126', 'stu-06', 'exam-fn-ss', 83),
('m127', 'stu-07', 'exam-fn-ss', 78), ('m128', 'stu-08', 'exam-fn-ss', 65),
('m129', 'stu-09', 'exam-fn-ss', 91), ('m130', 'stu-10', 'exam-fn-ss', 80),
('m131', 'stu-11', 'exam-fn-ss', 73), ('m132', 'stu-12', 'exam-fn-ss', 87),
('m133', 'stu-13', 'exam-fn-ss', 48), ('m134', 'stu-14', 'exam-fn-ss', 81),
('m135', 'stu-15', 'exam-fn-ss', 94),
-- Final Hindi
('m136', 'stu-01', 'exam-fn-hin', 78), ('m137', 'stu-02', 'exam-fn-hin', 92),
('m138', 'stu-03', 'exam-fn-hin', 75), ('m139', 'stu-04', 'exam-fn-hin', 69),
('m140', 'stu-05', 'exam-fn-hin', 52), ('m141', 'stu-06', 'exam-fn-hin', 86),
('m142', 'stu-07', 'exam-fn-hin', 83), ('m143', 'stu-08', 'exam-fn-hin', 61),
('m144', 'stu-09', 'exam-fn-hin', 79), ('m145', 'stu-10', 'exam-fn-hin', 88),
('m146', 'stu-11', 'exam-fn-hin', 71), ('m147', 'stu-12', 'exam-fn-hin', 94),
('m148', 'stu-13', 'exam-fn-hin', 56), ('m149', 'stu-14', 'exam-fn-hin', 82),
('m150', 'stu-15', 'exam-fn-hin', 90);

-- Create Attendance records (last 22 weekdays for Class 10A students)
-- Mostly PRESENT with some LATE and ABSENT
DO $$
DECLARE
  d DATE;
  stu_id TEXT;
  rand_val FLOAT;
  att_status "AttendanceStatus";
  day_offset INT;
  att_count INT := 0;
BEGIN
  FOR day_offset IN 1..30 LOOP
    d := CURRENT_DATE - day_offset;
    -- Skip weekends
    IF EXTRACT(DOW FROM d) IN (0, 6) THEN CONTINUE; END IF;

    FOR i IN 1..15 LOOP
      stu_id := 'stu-' || LPAD(i::TEXT, 2, '0');
      rand_val := random();
      IF rand_val > 0.15 THEN
        att_status := 'PRESENT';
      ELSIF rand_val > 0.05 THEN
        att_status := 'LATE';
      ELSE
        att_status := 'ABSENT';
      END IF;

      INSERT INTO "Attendance" (id, "studentId", "classId", date, status, "markedById")
      VALUES (
        'att-' || day_offset || '-' || i,
        stu_id,
        'cls-10a',
        d,
        att_status,
        'admin001'
      );
      att_count := att_count + 1;
    END LOOP;
  END LOOP;

  RAISE NOTICE 'Created % attendance records', att_count;
END $$;
