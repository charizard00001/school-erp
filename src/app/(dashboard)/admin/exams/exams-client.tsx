"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Plus, Trash2 } from "lucide-react";
import { createExam, deleteExam } from "../actions";

interface Exam {
  id: string;
  name: string;
  date: Date;
  totalMarks: number;
  class: { name: string; section: string };
  subject: { name: string };
  _count: { marks: number };
}

interface ClassWithSubjects {
  id: string;
  name: string;
  section: string;
  subjects: { id: string; name: string }[];
}

export function ExamsClient({ exams, classes }: { exams: Exam[]; classes: ClassWithSubjects[] }) {
  const [open, setOpen] = useState(false);
  const [selectedClassId, setSelectedClassId] = useState("");

  const selectedClass = classes.find((c) => c.id === selectedClassId);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Exams</h1>
          <p className="text-muted-foreground mt-1">Manage examinations</p>
        </div>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger className="inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium bg-primary text-primary-foreground shadow-xs hover:bg-primary/90 h-9 px-4 py-2 cursor-pointer">
            <Plus className="w-4 h-4" /> Create Exam
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create New Exam</DialogTitle>
            </DialogHeader>
            <form
              action={async (formData) => {
                await createExam(formData);
                setOpen(false);
              }}
              className="space-y-4"
            >
              <div className="space-y-2">
                <Label htmlFor="examName">Exam Name</Label>
                <Input id="examName" name="name" placeholder="e.g. Mid-Term" required />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Class</Label>
                  <select
                    name="classId"
                    className="w-full border rounded-md px-3 py-2 text-sm"
                    required
                    value={selectedClassId}
                    onChange={(e) => setSelectedClassId(e.target.value)}
                  >
                    <option value="">Select class</option>
                    {classes.map((c) => (
                      <option key={c.id} value={c.id}>Class {c.name}-{c.section}</option>
                    ))}
                  </select>
                </div>
                <div className="space-y-2">
                  <Label>Subject</Label>
                  <select name="subjectId" className="w-full border rounded-md px-3 py-2 text-sm" required>
                    <option value="">Select subject</option>
                    {(selectedClass?.subjects || []).map((s) => (
                      <option key={s.id} value={s.id}>{s.name}</option>
                    ))}
                  </select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="date">Date</Label>
                  <Input id="date" name="date" type="date" required />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="totalMarks">Total Marks</Label>
                  <Input id="totalMarks" name="totalMarks" type="number" defaultValue="100" required />
                </div>
              </div>
              <Button type="submit" className="w-full">Create Exam</Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="border rounded-lg">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Exam</TableHead>
              <TableHead>Class</TableHead>
              <TableHead>Subject</TableHead>
              <TableHead>Date</TableHead>
              <TableHead>Total Marks</TableHead>
              <TableHead>Entries</TableHead>
              <TableHead className="w-16">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {exams.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center text-muted-foreground py-8">
                  No exams created yet
                </TableCell>
              </TableRow>
            ) : (
              exams.map((e) => (
                <TableRow key={e.id}>
                  <TableCell className="font-medium">{e.name}</TableCell>
                  <TableCell>
                    <Badge variant="secondary">Class {e.class.name}-{e.class.section}</Badge>
                  </TableCell>
                  <TableCell>{e.subject.name}</TableCell>
                  <TableCell>{new Date(e.date).toLocaleDateString()}</TableCell>
                  <TableCell>{e.totalMarks}</TableCell>
                  <TableCell>{e._count.marks}</TableCell>
                  <TableCell>
                    <form action={deleteExam.bind(null, e.id)}>
                      <Button variant="ghost" size="icon" className="text-red-500 hover:text-red-700">
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </form>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
