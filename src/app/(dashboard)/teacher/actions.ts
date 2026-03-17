"use server";

import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";
import { revalidatePath } from "next/cache";

export async function markAttendance(formData: FormData) {
  const session = await getSession();
  if (!session || (session.role !== "TEACHER" && session.role !== "ADMIN")) {
    throw new Error("Unauthorized");
  }

  const classId = formData.get("classId") as string;
  const dateStr = formData.get("date") as string;
  const date = new Date(dateStr);

  // Get all students in the class
  const students = await prisma.student.findMany({
    where: { classId },
    select: { id: true },
  });

  // Get absent/late student IDs from form
  const absentIds = formData.getAll("absent").map(String);
  const lateIds = formData.getAll("late").map(String);

  // Upsert attendance for each student
  for (const student of students) {
    let status: "PRESENT" | "ABSENT" | "LATE" = "PRESENT";
    if (absentIds.includes(student.id)) status = "ABSENT";
    else if (lateIds.includes(student.id)) status = "LATE";

    await prisma.attendance.upsert({
      where: { studentId_date: { studentId: student.id, date } },
      update: { status, markedById: session.userId },
      create: {
        studentId: student.id,
        classId,
        date,
        status,
        markedById: session.userId,
      },
    });
  }

  revalidatePath("/teacher/attendance");
}

export async function saveMarks(formData: FormData) {
  const session = await getSession();
  if (!session || (session.role !== "TEACHER" && session.role !== "ADMIN")) {
    throw new Error("Unauthorized");
  }

  const examId = formData.get("examId") as string;
  const entries = formData.getAll("studentId");

  for (const studentId of entries) {
    const marks = formData.get(`marks_${studentId}`) as string;
    if (!marks) continue;

    await prisma.mark.upsert({
      where: { studentId_examId: { studentId: studentId as string, examId } },
      update: { marksObtained: parseInt(marks) },
      create: {
        studentId: studentId as string,
        examId,
        marksObtained: parseInt(marks),
      },
    });
  }

  revalidatePath("/teacher/marks");
}
