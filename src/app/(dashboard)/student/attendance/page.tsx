import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default async function StudentAttendancePage() {
  const session = await getSession();
  if (!session) return null;

  const student = await prisma.student.findFirst({
    where: { userId: session.userId },
  });

  if (!student) return <p>Student record not found.</p>;

  const attendance = await prisma.attendance.findMany({
    where: { studentId: student.id },
    orderBy: { date: "desc" },
    take: 60,
  });

  const total = attendance.length;
  const present = attendance.filter((a) => a.status === "PRESENT").length;
  const late = attendance.filter((a) => a.status === "LATE").length;
  const absent = attendance.filter((a) => a.status === "ABSENT").length;

  const statusColors: Record<string, string> = {
    PRESENT: "bg-green-100 text-green-800",
    ABSENT: "bg-red-100 text-red-800",
    LATE: "bg-yellow-100 text-yellow-800",
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">My Attendance</h1>
        <p className="text-muted-foreground mt-1">Your attendance records</p>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-muted-foreground">Total Days</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{total}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-green-600">Present</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{present}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-yellow-600">Late</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{late}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-red-600">Absent</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{absent}</p>
          </CardContent>
        </Card>
      </div>

      <div className="space-y-2">
        {attendance.length === 0 ? (
          <p className="text-muted-foreground">No attendance records yet.</p>
        ) : (
          attendance.map((a) => (
            <div
              key={a.id}
              className="flex items-center justify-between p-3 border rounded-lg"
            >
              <span className="text-sm font-medium">
                {new Date(a.date).toLocaleDateString("en-IN", {
                  weekday: "short",
                  year: "numeric",
                  month: "short",
                  day: "numeric",
                })}
              </span>
              <Badge className={statusColors[a.status]}>{a.status}</Badge>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
