import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CalendarCheck, BookOpen, Users } from "lucide-react";

export default async function TeacherDashboard() {
  const session = await getSession();
  if (!session) return null;

  const teacher = await prisma.teacher.findFirst({
    where: { userId: session.userId },
    include: {
      teacherClasses: {
        include: {
          class: {
            include: { _count: { select: { students: true } } },
          },
          subject: true,
        },
      },
    },
  });

  const assignedClasses = teacher?.teacherClasses || [];
  const classIds = [...new Set(assignedClasses.map((tc) => tc.classId))];

  const today = new Date(new Date().toISOString().split("T")[0]);
  const todayAttendanceCount = await prisma.attendance.count({
    where: { classId: { in: classIds }, date: today },
  });

  const hasMarkedToday = todayAttendanceCount > 0;

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold">Teacher Dashboard</h1>
        <p className="text-muted-foreground mt-1">Welcome back, {session.name}</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Assigned Classes</CardTitle>
            <div className="p-2 rounded-lg bg-blue-50 text-blue-600">
              <BookOpen className="w-4 h-4" />
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">{classIds.length}</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Students</CardTitle>
            <div className="p-2 rounded-lg bg-green-50 text-green-600">
              <Users className="w-4 h-4" />
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">
              {assignedClasses.reduce((sum, tc) => sum + tc.class._count.students, 0)}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Today&apos;s Attendance</CardTitle>
            <div className={`p-2 rounded-lg ${hasMarkedToday ? "bg-green-50 text-green-600" : "bg-orange-50 text-orange-600"}`}>
              <CalendarCheck className="w-4 h-4" />
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">{hasMarkedToday ? "Done" : "Pending"}</p>
          </CardContent>
        </Card>
      </div>

      <div>
        <h2 className="text-xl font-semibold mb-4">Your Assignments</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {assignedClasses.map((tc) => (
            <Card key={tc.id}>
              <CardContent className="pt-6">
                <p className="font-semibold">Class {tc.class.name}-{tc.class.section}</p>
                <p className="text-sm text-muted-foreground">{tc.subject.name}</p>
                <p className="text-xs text-muted-foreground mt-1">
                  {tc.class._count.students} students
                </p>
              </CardContent>
            </Card>
          ))}
          {assignedClasses.length === 0 && (
            <p className="text-muted-foreground col-span-full">No classes assigned yet. Contact admin.</p>
          )}
        </div>
      </div>
    </div>
  );
}
