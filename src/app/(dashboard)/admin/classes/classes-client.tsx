"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Plus, Trash2, BookOpen } from "lucide-react";
import { createClass, createSubject, deleteClass } from "../actions";

interface ClassData {
  id: string;
  name: string;
  section: string;
  academicYear: string;
  subjects: { id: string; name: string }[];
  _count: { students: number };
}

export function ClassesClient({ classes }: { classes: ClassData[] }) {
  const [addClassOpen, setAddClassOpen] = useState(false);
  const [addSubjectOpen, setAddSubjectOpen] = useState(false);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Classes</h1>
          <p className="text-muted-foreground mt-1">Manage classes and subjects</p>
        </div>
        <div className="flex gap-2">
          <Dialog open={addSubjectOpen} onOpenChange={setAddSubjectOpen}>
            <DialogTrigger className="inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium border border-input bg-background shadow-xs hover:bg-accent hover:text-accent-foreground h-9 px-4 py-2 cursor-pointer">
              <BookOpen className="w-4 h-4" /> Add Subject
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Add Subject to Class</DialogTitle>
              </DialogHeader>
              <form
                action={async (formData) => {
                  await createSubject(formData);
                  setAddSubjectOpen(false);
                }}
                className="space-y-4"
              >
                <div className="space-y-2">
                  <Label>Class</Label>
                  <select name="classId" className="w-full border rounded-md px-3 py-2 text-sm" required>
                    <option value="">Select class</option>
                    {classes.map((c) => (
                      <option key={c.id} value={c.id}>Class {c.name}-{c.section}</option>
                    ))}
                  </select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="subjectName">Subject Name</Label>
                  <Input id="subjectName" name="name" placeholder="e.g. Mathematics" required />
                </div>
                <Button type="submit" className="w-full">Add Subject</Button>
              </form>
            </DialogContent>
          </Dialog>

          <Dialog open={addClassOpen} onOpenChange={setAddClassOpen}>
            <DialogTrigger className="inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium bg-primary text-primary-foreground shadow-xs hover:bg-primary/90 h-9 px-4 py-2 cursor-pointer">
              <Plus className="w-4 h-4" /> Add Class
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Add New Class</DialogTitle>
              </DialogHeader>
              <form
                action={async (formData) => {
                  await createClass(formData);
                  setAddClassOpen(false);
                }}
                className="space-y-4"
              >
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Class Name</Label>
                    <select name="name" className="w-full border rounded-md px-3 py-2 text-sm" required>
                      {Array.from({ length: 12 }, (_, i) => (
                        <option key={i + 1} value={String(i + 1)}>{i + 1}</option>
                      ))}
                    </select>
                  </div>
                  <div className="space-y-2">
                    <Label>Section</Label>
                    <select name="section" className="w-full border rounded-md px-3 py-2 text-sm" required>
                      {["A", "B", "C", "D"].map((s) => (
                        <option key={s} value={s}>{s}</option>
                      ))}
                    </select>
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="academicYear">Academic Year</Label>
                  <Input id="academicYear" name="academicYear" defaultValue="2025-2026" required />
                </div>
                <Button type="submit" className="w-full">Create Class</Button>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {classes.length === 0 ? (
          <p className="col-span-full text-center text-muted-foreground py-8">
            No classes created yet
          </p>
        ) : (
          classes.map((c) => (
            <Card key={c.id}>
              <CardHeader className="flex flex-row items-start justify-between pb-2">
                <div>
                  <CardTitle className="text-lg">Class {c.name}-{c.section}</CardTitle>
                  <p className="text-xs text-muted-foreground">{c.academicYear}</p>
                </div>
                <form action={deleteClass.bind(null, c.id)}>
                  <Button variant="ghost" size="icon" className="text-red-500 hover:text-red-700 -mt-1">
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </form>
              </CardHeader>
              <CardContent className="space-y-3">
                <p className="text-sm text-muted-foreground">{c._count.students} students</p>
                <div className="flex flex-wrap gap-1">
                  {c.subjects.length === 0 ? (
                    <span className="text-xs text-muted-foreground">No subjects</span>
                  ) : (
                    c.subjects.map((s) => (
                      <Badge key={s.id} variant="secondary" className="text-xs">{s.name}</Badge>
                    ))
                  )}
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}
