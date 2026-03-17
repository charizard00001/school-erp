import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(request: NextRequest) {
  const studentId = request.nextUrl.searchParams.get("studentId");

  if (!studentId) {
    return NextResponse.json({ error: "studentId required" }, { status: 400 });
  }

  const student = await prisma.student.findUnique({
    where: { id: studentId },
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

  if (!student) {
    return NextResponse.json({ error: "Student not found" }, { status: 404 });
  }

  const totalDays = student.attendances.length;
  const presentDays = student.attendances.filter(
    (a) => a.status === "PRESENT" || a.status === "LATE"
  ).length;

  // Group marks by subject
  const subjectMap = new Map<string, { exam: string; marks: number; total: number }[]>();
  for (const m of student.marks) {
    const subName = m.exam.subject.name;
    if (!subjectMap.has(subName)) subjectMap.set(subName, []);
    subjectMap.get(subName)!.push({
      exam: m.exam.name,
      marks: m.marksObtained,
      total: m.exam.totalMarks,
    });
  }

  const subjects = Array.from(subjectMap.entries()).map(([name, exams]) => {
    const avgPct = Math.round(
      exams.reduce((s, e) => s + (e.marks / e.total) * 100, 0) / exams.length
    );
    return { subject: name, exams, averagePercentage: avgPct };
  });

  const overallAvg =
    subjects.length > 0
      ? Math.round(subjects.reduce((s, sub) => s + sub.averagePercentage, 0) / subjects.length)
      : 0;

  // Return JSON data — client will render as PDF or formatted view
  return NextResponse.json({
    student: {
      name: student.user.name,
      email: student.user.email,
      class: `${student.class.name}-${student.class.section}`,
      academicYear: student.class.academicYear,
      rollNumber: student.rollNumber,
    },
    attendance: {
      totalDays,
      presentDays,
      percentage: totalDays > 0 ? Math.round((presentDays / totalDays) * 100) : 0,
    },
    subjects,
    overallAverage: overallAvg,
    overallStatus: overallAvg >= 40 ? "PASS" : "FAIL",
    generatedAt: new Date().toISOString(),
  });
}
