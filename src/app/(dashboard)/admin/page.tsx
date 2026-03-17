import { prisma } from "@/lib/prisma";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, UserCheck, BookOpen, CalendarCheck } from "lucide-react";

export default async function AdminDashboard() {
  const [studentCount, teacherCount, classCount, todayAttendance] =
    await Promise.all([
      prisma.student.count(),
      prisma.teacher.count(),
      prisma.class.count(),
      prisma.attendance.count({
        where: {
          date: new Date(new Date().toISOString().split("T")[0]),
          status: "PRESENT",
        },
      }),
    ]);

  const totalStudents = studentCount || 0;
  const todayTotal = await prisma.attendance.count({
    where: { date: new Date(new Date().toISOString().split("T")[0]) },
  });

  const attendancePercent =
    todayTotal > 0 ? Math.round((todayAttendance / todayTotal) * 100) : 0;

  const stats = [
    { label: "Total Students", value: totalStudents, icon: Users, color: "text-blue-600 bg-blue-50" },
    { label: "Total Teachers", value: teacherCount, icon: UserCheck, color: "text-green-600 bg-green-50" },
    { label: "Total Classes", value: classCount, icon: BookOpen, color: "text-purple-600 bg-purple-50" },
    { label: "Today's Attendance", value: `${attendancePercent}%`, icon: CalendarCheck, color: "text-orange-600 bg-orange-50" },
  ];

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold">Admin Dashboard</h1>
        <p className="text-muted-foreground mt-1">Overview of your school</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat) => (
          <Card key={stat.label}>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                {stat.label}
              </CardTitle>
              <div className={`p-2 rounded-lg ${stat.color}`}>
                <stat.icon className="w-4 h-4" />
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold">{stat.value}</p>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
