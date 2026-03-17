import { prisma } from "@/lib/prisma";
import { ClassesClient } from "./classes-client";

export default async function ClassesPage() {
  const classes = await prisma.class.findMany({
    include: {
      subjects: { select: { id: true, name: true } },
      _count: { select: { students: true } },
    },
    orderBy: [{ name: "asc" }, { section: "asc" }],
  });

  return <ClassesClient classes={classes} />;
}
