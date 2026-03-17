import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CalendarCheck, FileText, TrendingUp } from "lucide-react";

export default async function StudentDashboard() {
  const session = await getSession();
  if (!session) return null;

  const student = await prisma.student.findFirst({
    where: { userId: session.userId },
    include: {
      class: { select: { name: true, section: true } },
    },
  });

  if (!student) return <p>Student record not found.</p>;

  // Attendance stats
  const totalAttendance = await prisma.attendance.count({
    where: { studentId: student.id },
  });
  const presentCount = await prisma.attendance.count({
    where: { studentId: student.id, status: "PRESENT" },
  });
  const lateCount = await prisma.attendance.count({
    where: { studentId: student.id, status: "LATE" },
  });
  const attendancePercent =
    totalAttendance > 0
      ? Math.round(((presentCount + lateCount) / totalAttendance) * 100)
      : 0;

  // Recent marks
  const recentMarks = await prisma.mark.findMany({
    where: { studentId: student.id },
    include: {
      exam: {
        include: { subject: { select: { name: true } } },
      },
    },
    orderBy: { exam: { date: "desc" } },
    take: 5,
  });

  const avgPercent =
    recentMarks.length > 0
      ? Math.round(
          recentMarks.reduce(
            (sum, m) => sum + (m.marksObtained / m.exam.totalMarks) * 100,
            0
          ) / recentMarks.length
        )
      : 0;

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold">Student Dashboard</h1>
        <p className="text-muted-foreground mt-1">
          Welcome, {session.name} — Class {student.class.name}-{student.class.section}
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Attendance
            </CardTitle>
            <div className="p-2 rounded-lg bg-green-50 text-green-600">
              <CalendarCheck className="w-4 h-4" />
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">{attendancePercent}%</p>
            <p className="text-xs text-muted-foreground mt-1">
              {presentCount + lateCount}/{totalAttendance} days present
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Avg. Score
            </CardTitle>
            <div className="p-2 rounded-lg bg-blue-50 text-blue-600">
              <TrendingUp className="w-4 h-4" />
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">{avgPercent}%</p>
            <p className="text-xs text-muted-foreground mt-1">
              Across {recentMarks.length} exams
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Exams Taken
            </CardTitle>
            <div className="p-2 rounded-lg bg-purple-50 text-purple-600">
              <FileText className="w-4 h-4" />
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">{recentMarks.length}</p>
          </CardContent>
        </Card>
      </div>

      {/* Recent Results */}
      <div>
        <h2 className="text-xl font-semibold mb-4">Recent Results</h2>
        {recentMarks.length === 0 ? (
          <p className="text-muted-foreground">No exam results yet.</p>
        ) : (
          <div className="space-y-2">
            {recentMarks.map((m) => {
              const pct = Math.round((m.marksObtained / m.exam.totalMarks) * 100);
              return (
                <div
                  key={m.id}
                  className="flex items-center justify-between p-4 border rounded-lg"
                >
                  <div>
                    <p className="font-medium">{m.exam.name}</p>
                    <p className="text-sm text-muted-foreground">{m.exam.subject.name}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-bold">
                      {m.marksObtained}/{m.exam.totalMarks}
                    </p>
                    <Badge variant={pct >= 40 ? "default" : "destructive"}>
                      {pct}%
                    </Badge>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
