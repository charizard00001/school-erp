import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";
import { MarksClient } from "./marks-client";

export default async function MarksPage() {
  const session = await getSession();
  if (!session) return null;

  const teacher = await prisma.teacher.findFirst({
    where: { userId: session.userId },
    include: {
      teacherClasses: {
        include: {
          class: { select: { id: true, name: true, section: true } },
          subject: { select: { id: true, name: true } },
        },
      },
    },
  });

  const teacherClasses = teacher?.teacherClasses || [];

  // Get exams for assigned class-subject combinations
  const exams = await prisma.exam.findMany({
    where: {
      OR: teacherClasses.map((tc) => ({
        classId: tc.classId,
        subjectId: tc.subjectId,
      })),
    },
    include: {
      class: { select: { name: true, section: true } },
      subject: { select: { name: true } },
    },
    orderBy: { date: "desc" },
  });

  return <MarksClient exams={exams} />;
}
