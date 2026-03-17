import { tool } from "ai";
import { z } from "zod";
import { prisma } from "@/lib/prisma";

export const chatbotTools = {
  getStudentInfo: tool({
    description: "Search for a student by name or roll number. Returns student details including class, attendance, and marks.",
    inputSchema: z.object({
      query: z.string().describe("Student name or roll number to search for"),
    }),
    execute: async ({ query }) => {
      const students = await prisma.student.findMany({
        where: {
          OR: [
            { user: { name: { contains: query, mode: "insensitive" } } },
            { rollNumber: { contains: query, mode: "insensitive" } },
          ],
        },
        include: {
          user: { select: { name: true, email: true } },
          class: { select: { name: true, section: true } },
        },
        take: 5,
      });

      if (students.length === 0) return { message: "No students found matching the query." };

      return {
        students: students.map((s) => ({
          id: s.id,
          name: s.user.name,
          email: s.user.email,
          class: `${s.class.name}-${s.class.section}`,
          rollNumber: s.rollNumber,
        })),
      };
    },
  }),

  getAttendanceSummary: tool({
    description: "Get attendance summary for a class within a date range. Returns present/absent/late counts per student.",
    inputSchema: z.object({
      className: z.string().describe("Class name like '10'"),
      section: z.string().describe("Section like 'A'"),
      startDate: z.string().describe("Start date in YYYY-MM-DD format"),
      endDate: z.string().describe("End date in YYYY-MM-DD format"),
    }),
    execute: async ({ className, section, startDate, endDate }) => {
      const cls = await prisma.class.findFirst({
        where: { name: className, section },
      });
      if (!cls) return { error: `Class ${className}-${section} not found.` };

      const students = await prisma.student.findMany({
        where: { classId: cls.id },
        include: {
          user: { select: { name: true } },
          attendances: {
            where: {
              date: { gte: new Date(startDate), lte: new Date(endDate) },
            },
          },
        },
        orderBy: { rollNumber: "asc" },
      });

      const summary = students.map((s) => ({
        name: s.user.name,
        rollNumber: s.rollNumber,
        present: s.attendances.filter((a) => a.status === "PRESENT").length,
        absent: s.attendances.filter((a) => a.status === "ABSENT").length,
        late: s.attendances.filter((a) => a.status === "LATE").length,
        total: s.attendances.length,
      }));

      const totalDays = summary.length > 0 ? summary[0].total : 0;

      return {
        class: `${className}-${section}`,
        dateRange: `${startDate} to ${endDate}`,
        totalDays,
        totalStudents: students.length,
        students: summary,
      };
    },
  }),

  getClassPerformance: tool({
    description: "Get class performance analytics for a specific exam. Returns marks distribution, average, highest, lowest, and pass rate.",
    inputSchema: z.object({
      className: z.string().describe("Class name like '10'"),
      section: z.string().describe("Section like 'A'"),
      examName: z.string().describe("Exam name like 'Mid-Term'"),
    }),
    execute: async ({ className, section, examName }) => {
      const cls = await prisma.class.findFirst({
        where: { name: className, section },
      });
      if (!cls) return { error: `Class ${className}-${section} not found.` };

      const exams = await prisma.exam.findMany({
        where: { classId: cls.id, name: { contains: examName, mode: "insensitive" } },
        include: {
          subject: { select: { name: true } },
          marks: {
            include: { student: { include: { user: { select: { name: true } } } } },
          },
        },
      });

      if (exams.length === 0) return { error: `No exams found matching "${examName}" for Class ${className}-${section}.` };

      const subjectResults = exams.map((exam) => {
        const marks = exam.marks.map((m) => ({
          name: m.student.user.name,
          marks: m.marksObtained,
          percentage: Math.round((m.marksObtained / exam.totalMarks) * 100),
        }));

        const avg = marks.length > 0 ? Math.round(marks.reduce((s, m) => s + m.percentage, 0) / marks.length) : 0;
        const highest = marks.length > 0 ? Math.max(...marks.map((m) => m.percentage)) : 0;
        const lowest = marks.length > 0 ? Math.min(...marks.map((m) => m.percentage)) : 0;
        const passRate = marks.length > 0 ? Math.round((marks.filter((m) => m.percentage >= 40).length / marks.length) * 100) : 0;

        return {
          subject: exam.subject.name,
          totalMarks: exam.totalMarks,
          studentsCount: marks.length,
          average: avg,
          highest,
          lowest,
          passRate,
          toppers: marks.sort((a, b) => b.percentage - a.percentage).slice(0, 3),
        };
      });

      return {
        class: `${className}-${section}`,
        exam: examName,
        subjects: subjectResults,
      };
    },
  }),

  generateReportCard: tool({
    description: "Generate a report card for a student. Returns the student's marks across all exams for the current academic year along with attendance summary.",
    inputSchema: z.object({
      studentName: z.string().describe("Full or partial name of the student"),
      className: z.string().optional().describe("Class name to narrow search"),
      section: z.string().optional().describe("Section to narrow search"),
    }),
    execute: async ({ studentName, className, section }) => {
      const whereClause: Record<string, unknown> = {
        user: { name: { contains: studentName, mode: "insensitive" } },
      };

      if (className && section) {
        whereClause.class = { name: className, section };
      }

      const student = await prisma.student.findFirst({
        where: whereClause,
        include: {
          user: { select: { name: true, email: true } },
          class: { select: { name: true, section: true, academicYear: true } },
          marks: {
            include: {
              exam: { include: { subject: { select: { name: true } } } },
            },
            orderBy: { exam: { date: "asc" } },
          },
          attendances: true,
        },
      });

      if (!student) return { error: `Student "${studentName}" not found.` };

      const totalDays = student.attendances.length;
      const presentDays = student.attendances.filter((a) => a.status === "PRESENT" || a.status === "LATE").length;

      const subjectMap = new Map<string, { marks: number; total: number; exam: string }[]>();
      for (const m of student.marks) {
        const subjectName = m.exam.subject.name;
        if (!subjectMap.has(subjectName)) subjectMap.set(subjectName, []);
        subjectMap.get(subjectName)!.push({
          marks: m.marksObtained,
          total: m.exam.totalMarks,
          exam: m.exam.name,
        });
      }

      const subjects = Array.from(subjectMap.entries()).map(([name, exams]) => {
        const avgPct = Math.round(exams.reduce((s, e) => s + (e.marks / e.total) * 100, 0) / exams.length);
        return {
          subject: name,
          exams: exams.map((e) => ({ exam: e.exam, marks: e.marks, total: e.total, percentage: Math.round((e.marks / e.total) * 100) })),
          averagePercentage: avgPct,
          status: avgPct >= 40 ? "PASS" : "FAIL",
        };
      });

      const overallAvg = subjects.length > 0 ? Math.round(subjects.reduce((s, sub) => s + sub.averagePercentage, 0) / subjects.length) : 0;

      return {
        reportCard: {
          studentName: student.user.name,
          class: `${student.class.name}-${student.class.section}`,
          academicYear: student.class.academicYear,
          rollNumber: student.rollNumber,
          attendance: {
            totalDays,
            presentDays,
            percentage: totalDays > 0 ? Math.round((presentDays / totalDays) * 100) : 0,
          },
          subjects,
          overallAverage: overallAvg,
          overallStatus: overallAvg >= 40 ? "PASS" : "FAIL",
        },
      };
    },
  }),

  getSchoolStats: tool({
    description: "Get overall school statistics including total students, teachers, classes, and attendance overview.",
    inputSchema: z.object({}),
    execute: async () => {
      const [students, teachers, classes, todayDate] = await Promise.all([
        prisma.student.count(),
        prisma.teacher.count(),
        prisma.class.count(),
        Promise.resolve(new Date(new Date().toISOString().split("T")[0])),
      ]);

      const todayAttendance = await prisma.attendance.groupBy({
        by: ["status"],
        where: { date: todayDate },
        _count: true,
      });

      return {
        totalStudents: students,
        totalTeachers: teachers,
        totalClasses: classes,
        todayAttendance: todayAttendance.map((a) => ({
          status: a.status,
          count: a._count,
        })),
      };
    },
  }),
};
