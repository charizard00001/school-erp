import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(request: NextRequest) {
  const examId = request.nextUrl.searchParams.get("examId");
  if (!examId) return NextResponse.json({ students: [] });

  const exam = await prisma.exam.findUnique({ where: { id: examId }, select: { classId: true } });
  if (!exam) return NextResponse.json({ students: [] });

  const students = await prisma.student.findMany({
    where: { classId: exam.classId },
    include: {
      user: { select: { name: true } },
      marks: { where: { examId }, select: { marksObtained: true } },
    },
    orderBy: { rollNumber: "asc" },
  });

  return NextResponse.json({ students });
}
