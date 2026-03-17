import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Seeding database...");

  // Clean existing data
  await prisma.chatMessage.deleteMany();
  await prisma.mark.deleteMany();
  await prisma.attendance.deleteMany();
  await prisma.exam.deleteMany();
  await prisma.teacherClass.deleteMany();
  await prisma.student.deleteMany();
  await prisma.teacher.deleteMany();
  await prisma.subject.deleteMany();
  await prisma.class.deleteMany();
  await prisma.user.deleteMany();

  const hash = (pw: string) => bcrypt.hashSync(pw, 10);

  // ─── Admin ─────────────────────────────────────
  await prisma.user.create({
    data: {
      name: "Admin User",
      email: "admin@school.com",
      passwordHash: hash("admin123"),
      role: "ADMIN",
      phone: "9999999999",
    },
  });
  console.log("✅ Admin created");

  // ─── Classes (1-12, sections A,B) ──────────────
  const classData: { name: string; section: string }[] = [];
  for (let i = 1; i <= 12; i++) {
    for (const sec of ["A", "B"]) {
      classData.push({ name: String(i), section: sec });
    }
  }

  const classes = await Promise.all(
    classData.map((c) =>
      prisma.class.create({
        data: { ...c, academicYear: "2025-2026" },
      })
    )
  );
  console.log(`✅ ${classes.length} classes created`);

  // ─── Subjects per class ────────────────────────
  const subjectNames = ["Mathematics", "English", "Science", "Social Studies", "Hindi"];
  const subjects = [];
  for (const cls of classes) {
    for (const sName of subjectNames) {
      subjects.push(
        await prisma.subject.create({
          data: { name: sName, classId: cls.id },
        })
      );
    }
  }
  console.log(`✅ ${subjects.length} subjects created`);

  // ─── Teachers ──────────────────────────────────
  const teacherData = [
    { name: "Priya Sharma", email: "teacher@school.com", phone: "9876543210" },
    { name: "Rajesh Kumar", email: "rajesh@school.com", phone: "9876543211" },
    { name: "Anita Singh", email: "anita@school.com", phone: "9876543212" },
    { name: "Vikram Patel", email: "vikram@school.com", phone: "9876543213" },
    { name: "Sunita Verma", email: "sunita@school.com", phone: "9876543214" },
  ];

  const teachers = await Promise.all(
    teacherData.map((t) =>
      prisma.user.create({
        data: {
          name: t.name,
          email: t.email,
          passwordHash: hash("teacher123"),
          role: "TEACHER",
          phone: t.phone,
          teacher: { create: {} },
        },
        include: { teacher: true },
      })
    )
  );
  console.log(`✅ ${teachers.length} teachers created`);

  // Assign teachers to classes (Class 10A and 10B)
  const class10A = classes.find((c) => c.name === "10" && c.section === "A")!;
  const class10B = classes.find((c) => c.name === "10" && c.section === "B")!;
  const class10ASubjects = subjects.filter((s) => s.classId === class10A.id);
  const class10BSubjects = subjects.filter((s) => s.classId === class10B.id);

  for (let i = 0; i < teacherData.length; i++) {
    const teacher = teachers[i].teacher!;
    // Assign to Class 10A
    if (class10ASubjects[i]) {
      await prisma.teacherClass.create({
        data: {
          teacherId: teacher.id,
          classId: class10A.id,
          subjectId: class10ASubjects[i].id,
        },
      });
    }
    // First 3 teachers also teach in 10B
    if (i < 3 && class10BSubjects[i]) {
      await prisma.teacherClass.create({
        data: {
          teacherId: teacher.id,
          classId: class10B.id,
          subjectId: class10BSubjects[i].id,
        },
      });
    }
  }
  console.log("✅ Teacher assignments created");

  // ─── Students ──────────────────────────────────
  const firstNames = [
    "Rahul", "Priya", "Amit", "Sneha", "Vikram",
    "Neha", "Rohan", "Pooja", "Arjun", "Kavita",
    "Suresh", "Meera", "Aditya", "Riya", "Deepak",
  ];
  const lastNames = [
    "Sharma", "Verma", "Patel", "Singh", "Kumar",
    "Gupta", "Joshi", "Yadav", "Mishra", "Reddy",
  ];

  const studentUsers = [];
  let rollCounter = 1;

  // Add students to Class 10A (15 students)
  for (let i = 0; i < 15; i++) {
    const firstName = firstNames[i % firstNames.length];
    const lastName = lastNames[i % lastNames.length];
    const name = `${firstName} ${lastName}`;
    const email = i === 0 ? "student@school.com" : `${firstName.toLowerCase()}${i}@school.com`;

    const user = await prisma.user.create({
      data: {
        name,
        email,
        passwordHash: hash("student123"),
        role: "STUDENT",
        student: {
          create: {
            classId: class10A.id,
            rollNumber: String(rollCounter++).padStart(3, "0"),
            parentName: `Mr./Mrs. ${lastName}`,
            parentPhone: `98765${String(43200 + i).padStart(5, "0")}`,
          },
        },
      },
      include: { student: true },
    });
    studentUsers.push(user);
  }

  // Add 10 students to Class 10B
  for (let i = 0; i < 10; i++) {
    const firstName = firstNames[(i + 5) % firstNames.length];
    const lastName = lastNames[(i + 3) % lastNames.length];
    const name = `${firstName} ${lastName}`;
    const email = `${firstName.toLowerCase()}b${i}@school.com`;

    await prisma.user.create({
      data: {
        name,
        email,
        passwordHash: hash("student123"),
        role: "STUDENT",
        student: {
          create: {
            classId: class10B.id,
            rollNumber: String(rollCounter++).padStart(3, "0"),
            parentName: `Mr./Mrs. ${lastName}`,
            parentPhone: `98765${String(43300 + i).padStart(5, "0")}`,
          },
        },
      },
    });
  }
  console.log("✅ 25 students created");

  // ─── Exams ─────────────────────────────────────
  const examTypes = ["Mid-Term", "Final"];
  const exams = [];

  for (const examName of examTypes) {
    for (const sub of class10ASubjects) {
      exams.push(
        await prisma.exam.create({
          data: {
            name: examName,
            classId: class10A.id,
            subjectId: sub.id,
            date: examName === "Mid-Term" ? new Date("2025-09-15") : new Date("2026-02-15"),
            totalMarks: 100,
          },
        })
      );
    }
  }
  console.log(`✅ ${exams.length} exams created`);

  // ─── Marks (random) ────────────────────────────
  const class10AStudents = await prisma.student.findMany({
    where: { classId: class10A.id },
  });

  let marksCount = 0;
  for (const exam of exams) {
    for (const student of class10AStudents) {
      const marks = Math.floor(Math.random() * 60) + 30; // 30-89
      await prisma.mark.create({
        data: {
          studentId: student.id,
          examId: exam.id,
          marksObtained: Math.min(marks, 100),
        },
      });
      marksCount++;
    }
  }
  console.log(`✅ ${marksCount} marks entries created`);

  // ─── Attendance (last 30 days) ─────────────────
  const adminUser = await prisma.user.findFirst({ where: { role: "ADMIN" } });
  let attendanceCount = 0;

  for (let dayOffset = 1; dayOffset <= 30; dayOffset++) {
    const date = new Date();
    date.setDate(date.getDate() - dayOffset);
    // Skip weekends
    if (date.getDay() === 0 || date.getDay() === 6) continue;

    const dateOnly = new Date(date.toISOString().split("T")[0]);

    for (const student of class10AStudents) {
      const rand = Math.random();
      const status = rand > 0.15 ? "PRESENT" : rand > 0.05 ? "LATE" : "ABSENT";
      await prisma.attendance.create({
        data: {
          studentId: student.id,
          classId: class10A.id,
          date: dateOnly,
          status,
          markedById: adminUser!.id,
        },
      });
      attendanceCount++;
    }
  }
  console.log(`✅ ${attendanceCount} attendance records created`);

  console.log("\n🎉 Seeding complete!");
  console.log("─────────────────────────────────────");
  console.log("Demo credentials:");
  console.log("  Admin:   admin@school.com / admin123");
  console.log("  Teacher: teacher@school.com / teacher123");
  console.log("  Student: student@school.com / student123");
  console.log("─────────────────────────────────────");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
