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
import { Plus, Trash2, LinkIcon } from "lucide-react";
import { createTeacher, deleteTeacher, assignTeacherToClass, removeTeacherAssignment } from "../actions";

interface TeacherClass {
  id: string;
  class: { name: string; section: string };
  subject: { name: string };
}

interface Teacher {
  id: string;
  user: { id: string; name: string; email: string; phone: string | null };
  teacherClasses: TeacherClass[];
}

interface ClassItem { id: string; name: string; section: string }
interface SubjectItem { id: string; name: string; class: { name: string; section: string } }

export function TeachersClient({
  teachers, classes, subjects,
}: {
  teachers: Teacher[];
  classes: ClassItem[];
  subjects: SubjectItem[];
}) {
  const [addOpen, setAddOpen] = useState(false);
  const [assignOpen, setAssignOpen] = useState(false);
  const [selectedTeacher, setSelectedTeacher] = useState<string>("");
  const [selectedClass, setSelectedClass] = useState<string>("");

  const filteredSubjects = subjects.filter((s) => {
    if (!selectedClass) return true;
    const cls = classes.find((c) => c.id === selectedClass);
    if (!cls) return false;
    return s.class.name === cls.name && s.class.section === cls.section;
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Teachers</h1>
          <p className="text-muted-foreground mt-1">Manage teacher records and class assignments</p>
        </div>
        <div className="flex gap-2">
          <Dialog open={assignOpen} onOpenChange={setAssignOpen}>
            <DialogTrigger className="inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium border border-input bg-background shadow-xs hover:bg-accent hover:text-accent-foreground h-9 px-4 py-2 cursor-pointer">
              <LinkIcon className="w-4 h-4" /> Assign to Class
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Assign Teacher to Class</DialogTitle>
              </DialogHeader>
              <form
                action={async (formData) => {
                  await assignTeacherToClass(formData);
                  setAssignOpen(false);
                }}
                className="space-y-4"
              >
                <div className="space-y-2">
                  <Label>Teacher</Label>
                  <select name="teacherId" className="w-full border rounded-md px-3 py-2 text-sm" required
                    value={selectedTeacher} onChange={(e) => setSelectedTeacher(e.target.value)}>
                    <option value="">Select teacher</option>
                    {teachers.map((t) => (
                      <option key={t.id} value={t.id}>{t.user.name}</option>
                    ))}
                  </select>
                </div>
                <div className="space-y-2">
                  <Label>Class</Label>
                  <select name="classId" className="w-full border rounded-md px-3 py-2 text-sm" required
                    value={selectedClass} onChange={(e) => setSelectedClass(e.target.value)}>
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
                    {filteredSubjects.map((s) => (
                      <option key={s.id} value={s.id}>{s.name}</option>
                    ))}
                  </select>
                </div>
                <Button type="submit" className="w-full">Assign</Button>
              </form>
            </DialogContent>
          </Dialog>

          <Dialog open={addOpen} onOpenChange={setAddOpen}>
            <DialogTrigger className="inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium bg-primary text-primary-foreground shadow-xs hover:bg-primary/90 h-9 px-4 py-2 cursor-pointer">
              <Plus className="w-4 h-4" /> Add Teacher
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Add New Teacher</DialogTitle>
              </DialogHeader>
              <form
                action={async (formData) => {
                  await createTeacher(formData);
                  setAddOpen(false);
                }}
                className="space-y-4"
              >
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">Name</Label>
                    <Input id="name" name="name" required />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <Input id="email" name="email" type="email" required />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="password">Password</Label>
                    <Input id="password" name="password" type="password" required />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="phone">Phone</Label>
                    <Input id="phone" name="phone" />
                  </div>
                </div>
                <Button type="submit" className="w-full">Create Teacher</Button>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <div className="border rounded-lg">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Phone</TableHead>
              <TableHead>Assigned Classes</TableHead>
              <TableHead className="w-16">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {teachers.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center text-muted-foreground py-8">
                  No teachers found
                </TableCell>
              </TableRow>
            ) : (
              teachers.map((t) => (
                <TableRow key={t.id}>
                  <TableCell className="font-medium">{t.user.name}</TableCell>
                  <TableCell>{t.user.email}</TableCell>
                  <TableCell>{t.user.phone || "—"}</TableCell>
                  <TableCell>
                    <div className="flex flex-wrap gap-1">
                      {t.teacherClasses.length === 0 ? (
                        <span className="text-muted-foreground text-sm">None</span>
                      ) : (
                        t.teacherClasses.map((tc) => (
                          <Badge key={tc.id} variant="secondary" className="text-xs">
                            {tc.class.name}-{tc.class.section} ({tc.subject.name})
                            <button
                              className="ml-1 hover:text-red-500"
                              onClick={() => removeTeacherAssignment(tc.id)}
                            >
                              ×
                            </button>
                          </Badge>
                        ))
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    <form action={deleteTeacher.bind(null, t.user.id)}>
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
