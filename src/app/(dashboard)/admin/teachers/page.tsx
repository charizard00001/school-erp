import { prisma } from "@/lib/prisma";
import { TeachersClient } from "./teachers-client";

export default async function TeachersPage() {
  const [teachers, classes, subjects] = await Promise.all([
    prisma.teacher.findMany({
      include: {
        user: { select: { id: true, name: true, email: true, phone: true } },
        teacherClasses: {
          include: {
            class: { select: { name: true, section: true } },
            subject: { select: { name: true } },
          },
        },
      },
      orderBy: { user: { name: "asc" } },
    }),
    prisma.class.findMany({ orderBy: [{ name: "asc" }, { section: "asc" }] }),
    prisma.subject.findMany({
      include: { class: { select: { name: true, section: true } } },
      orderBy: { name: "asc" },
    }),
  ]);

  return <TeachersClient teachers={teachers} classes={classes} subjects={subjects} />;
}
