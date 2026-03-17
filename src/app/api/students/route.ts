import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl;
  const classId = searchParams.get("classId");
  const dateStr = searchParams.get("date");

  if (!classId) {
    return NextResponse.json({ students: [] });
  }

  const students = await prisma.student.findMany({
    where: { classId },
    include: {
      user: { select: { name: true } },
      attendances: dateStr
        ? {
            where: { date: new Date(dateStr) },
            select: { status: true },
            take: 1,
          }
        : false,
    },
    orderBy: { rollNumber: "asc" },
  });

  const result = students.map((s) => ({
    id: s.id,
    rollNumber: s.rollNumber,
    user: s.user,
    attendance: dateStr && s.attendances?.length > 0 ? s.attendances[0] : null,
  }));

  return NextResponse.json({ students: result });
}
