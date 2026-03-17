import { prisma } from "@/lib/prisma";
import { ExamsClient } from "./exams-client";

export default async function ExamsPage() {
  const [exams, classes] = await Promise.all([
    prisma.exam.findMany({
      include: {
        class: { select: { name: true, section: true } },
        subject: { select: { name: true } },
        _count: { select: { marks: true } },
      },
      orderBy: { date: "desc" },
    }),
    prisma.class.findMany({
      include: { subjects: { select: { id: true, name: true } } },
      orderBy: [{ name: "asc" }, { section: "asc" }],
    }),
  ]);

  return <ExamsClient exams={exams} classes={classes} />;
}
