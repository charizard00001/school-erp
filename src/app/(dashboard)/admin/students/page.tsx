import { prisma } from "@/lib/prisma";
import { StudentsClient } from "./students-client";

export default async function StudentsPage() {
  const [students, classes] = await Promise.all([
    prisma.student.findMany({
      include: {
        user: { select: { id: true, name: true, email: true, phone: true } },
        class: { select: { id: true, name: true, section: true } },
      },
      orderBy: { user: { name: "asc" } },
    }),
    prisma.class.findMany({ orderBy: [{ name: "asc" }, { section: "asc" }] }),
  ]);

  return <StudentsClient students={students} classes={classes} />;
}
