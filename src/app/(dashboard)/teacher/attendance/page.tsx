import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";
import { AttendanceClient } from "./attendance-client";

export default async function AttendancePage() {
  const session = await getSession();
  if (!session) return null;

  const teacher = await prisma.teacher.findFirst({
    where: { userId: session.userId },
    include: {
      teacherClasses: {
        include: {
          class: { select: { id: true, name: true, section: true } },
        },
      },
    },
  });

  // Unique classes
  const classMap = new Map<string, { id: string; name: string; section: string }>();
  teacher?.teacherClasses.forEach((tc) => {
    classMap.set(tc.classId, tc.class);
  });
  const classes = Array.from(classMap.values());

  return <AttendanceClient classes={classes} />;
}
