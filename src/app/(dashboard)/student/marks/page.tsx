import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";
import { Badge } from "@/components/ui/badge";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";

export default async function StudentMarksPage() {
  const session = await getSession();
  if (!session) return null;

  const student = await prisma.student.findFirst({
    where: { userId: session.userId },
  });

  if (!student) return <p>Student record not found.</p>;

  const marks = await prisma.mark.findMany({
    where: { studentId: student.id },
    include: {
      exam: {
        include: {
          subject: { select: { name: true } },
        },
      },
    },
    orderBy: { exam: { date: "desc" } },
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">My Marks</h1>
        <p className="text-muted-foreground mt-1">All your exam results</p>
      </div>

      <div className="border rounded-lg">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Exam</TableHead>
              <TableHead>Subject</TableHead>
              <TableHead>Date</TableHead>
              <TableHead>Marks</TableHead>
              <TableHead>Percentage</TableHead>
              <TableHead>Status</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {marks.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center text-muted-foreground py-8">
                  No exam results yet
                </TableCell>
              </TableRow>
            ) : (
              marks.map((m) => {
                const pct = Math.round((m.marksObtained / m.exam.totalMarks) * 100);
                const passed = pct >= 40;
                return (
                  <TableRow key={m.id}>
                    <TableCell className="font-medium">{m.exam.name}</TableCell>
                    <TableCell>{m.exam.subject.name}</TableCell>
                    <TableCell>{new Date(m.exam.date).toLocaleDateString()}</TableCell>
                    <TableCell>
                      {m.marksObtained}/{m.exam.totalMarks}
                    </TableCell>
                    <TableCell className="font-bold">{pct}%</TableCell>
                    <TableCell>
                      <Badge variant={passed ? "default" : "destructive"}>
                        {passed ? "Pass" : "Fail"}
                      </Badge>
                    </TableCell>
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
