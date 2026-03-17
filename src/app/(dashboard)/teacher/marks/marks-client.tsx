"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import { saveMarks } from "../actions";

interface Exam {
  id: string;
  name: string;
  totalMarks: number;
  class: { name: string; section: string };
  subject: { name: string };
}

interface StudentMark {
  id: string;
  rollNumber: string;
  user: { name: string };
  marks: { marksObtained: number }[];
}

export function MarksClient({ exams }: { exams: Exam[] }) {
  const [selectedExam, setSelectedExam] = useState("");
  const [students, setStudents] = useState<StudentMark[]>([]);
  const [loading, setLoading] = useState(false);
  const [saved, setSaved] = useState(false);

  const exam = exams.find((e) => e.id === selectedExam);

  useEffect(() => {
    if (!selectedExam) return;
    setLoading(true);
    fetch(`/api/marks?examId=${selectedExam}`)
      .then((r) => r.json())
      .then((data) => setStudents(data.students || []))
      .finally(() => setLoading(false));
  }, [selectedExam]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Enter Marks</h1>
        <p className="text-muted-foreground mt-1">Select an exam and enter marks for students</p>
      </div>

      <div className="space-y-2">
        <Label>Exam</Label>
        <Select value={selectedExam} onValueChange={(v) => { setSelectedExam(v ?? ""); setSaved(false); }}>
          <SelectTrigger className="w-96">
            <SelectValue placeholder="Select exam" />
          </SelectTrigger>
          <SelectContent>
            {exams.map((e) => (
              <SelectItem key={e.id} value={e.id}>
                {e.name} — Class {e.class.name}-{e.class.section} ({e.subject.name})
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {selectedExam && students.length > 0 && (
        <form
          action={async (formData) => {
            await saveMarks(formData);
            setSaved(true);
          }}
        >
          <input type="hidden" name="examId" value={selectedExam} />

          <div className="border rounded-lg">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-20">Roll No</TableHead>
                  <TableHead>Student Name</TableHead>
                  <TableHead className="w-40">Marks (out of {exam?.totalMarks})</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {students.map((s) => (
                  <TableRow key={s.id}>
                    <TableCell className="font-mono">{s.rollNumber}</TableCell>
                    <TableCell className="font-medium">{s.user.name}</TableCell>
                    <TableCell>
                      <input type="hidden" name="studentId" value={s.id} />
                      <Input
                        name={`marks_${s.id}`}
                        type="number"
                        min={0}
                        max={exam?.totalMarks}
                        defaultValue={s.marks?.[0]?.marksObtained ?? ""}
                        placeholder="—"
                        className="w-24"
                      />
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>

          <div className="mt-4 flex items-center gap-4">
            <Button type="submit" size="lg">Save Marks</Button>
            {saved && <span className="text-green-600 text-sm font-medium">✓ Saved successfully</span>}
          </div>
        </form>
      )}

      {selectedExam && !loading && students.length === 0 && (
        <p className="text-muted-foreground">No students found for this exam&apos;s class.</p>
      )}
      {loading && <p className="text-muted-foreground">Loading students...</p>}
    </div>
  );
}
