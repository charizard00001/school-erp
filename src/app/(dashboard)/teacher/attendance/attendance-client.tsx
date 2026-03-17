"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { markAttendance } from "../actions";

interface ClassItem {
  id: string;
  name: string;
  section: string;
}

interface Student {
  id: string;
  rollNumber: string;
  user: { name: string };
  attendance?: { status: string } | null;
}

export function AttendanceClient({ classes }: { classes: ClassItem[] }) {
  const [selectedClass, setSelectedClass] = useState("");
  const [date, setDate] = useState(new Date().toISOString().split("T")[0]);
  const [students, setStudents] = useState<Student[]>([]);
  const [statuses, setStatuses] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    if (!selectedClass || !date) return;
    setLoading(true);
    fetch(`/api/students?classId=${selectedClass}&date=${date}`)
      .then((r) => r.json())
      .then((data) => {
        setStudents(data.students || []);
        const initial: Record<string, string> = {};
        (data.students || []).forEach((s: Student) => {
          initial[s.id] = s.attendance?.status || "PRESENT";
        });
        setStatuses(initial);
      })
      .finally(() => setLoading(false));
  }, [selectedClass, date]);

  function toggleStatus(studentId: string) {
    setStatuses((prev) => {
      const current = prev[studentId] || "PRESENT";
      const next = current === "PRESENT" ? "ABSENT" : current === "ABSENT" ? "LATE" : "PRESENT";
      return { ...prev, [studentId]: next };
    });
    setSaved(false);
  }

  const statusColors: Record<string, string> = {
    PRESENT: "bg-green-100 text-green-800 border-green-300",
    ABSENT: "bg-red-100 text-red-800 border-red-300",
    LATE: "bg-yellow-100 text-yellow-800 border-yellow-300",
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Mark Attendance</h1>
        <p className="text-muted-foreground mt-1">Select a class and date, then mark attendance</p>
      </div>

      <div className="flex gap-4 items-end">
        <div className="space-y-2">
          <Label>Class</Label>
          <Select value={selectedClass} onValueChange={(v) => setSelectedClass(v ?? "")}>
            <SelectTrigger className="w-48">
              <SelectValue placeholder="Select class" />
            </SelectTrigger>
            <SelectContent>
              {classes.map((c) => (
                <SelectItem key={c.id} value={c.id}>Class {c.name}-{c.section}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2">
          <Label>Date</Label>
          <Input type="date" value={date} onChange={(e) => setDate(e.target.value)} className="w-48" />
        </div>
      </div>

      {selectedClass && students.length > 0 && (
        <form
          action={async (formData) => {
            await markAttendance(formData);
            setSaved(true);
          }}
        >
          <input type="hidden" name="classId" value={selectedClass} />
          <input type="hidden" name="date" value={date} />

          <Card>
            <CardHeader>
              <CardTitle className="text-lg">
                Students ({students.length}) — Click to toggle status
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {students.map((s) => {
                const status = statuses[s.id] || "PRESENT";
                return (
                  <div key={s.id} className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex items-center gap-3">
                      <span className="text-sm font-mono text-muted-foreground w-8">{s.rollNumber}</span>
                      <span className="font-medium">{s.user.name}</span>
                    </div>
                    <button type="button" onClick={() => toggleStatus(s.id)}>
                      <Badge className={`${statusColors[status]} cursor-pointer border`}>
                        {status}
                      </Badge>
                    </button>
                    {status === "ABSENT" && <input type="hidden" name="absent" value={s.id} />}
                    {status === "LATE" && <input type="hidden" name="late" value={s.id} />}
                  </div>
                );
              })}
            </CardContent>
          </Card>

          <div className="mt-4 flex items-center gap-4">
            <Button type="submit" size="lg">Save Attendance</Button>
            {saved && <span className="text-green-600 text-sm font-medium">✓ Saved successfully</span>}
          </div>
        </form>
      )}

      {selectedClass && !loading && students.length === 0 && (
        <p className="text-muted-foreground">No students in this class.</p>
      )}
      {loading && <p className="text-muted-foreground">Loading students...</p>}
    </div>
  );
}
