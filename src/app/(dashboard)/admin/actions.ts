"use server";

import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";
import bcrypt from "bcryptjs";
import { revalidatePath } from "next/cache";

// ─── Students ────────────────────────────────────────

export async function createStudent(formData: FormData) {
  const session = await getSession();
  if (!session || session.role !== "ADMIN") throw new Error("Unauthorized");

  const name = formData.get("name") as string;
  const email = formData.get("email") as string;
  const password = formData.get("password") as string;
  const classId = formData.get("classId") as string;
  const rollNumber = formData.get("rollNumber") as string;
  const parentName = formData.get("parentName") as string;
  const parentPhone = formData.get("parentPhone") as string;
  const phone = formData.get("phone") as string;

  const passwordHash = await bcrypt.hash(password, 10);

  await prisma.user.create({
    data: {
      name,
      email,
      passwordHash,
      role: "STUDENT",
      phone: phone || null,
      student: {
        create: {
          classId,
          rollNumber,
          parentName: parentName || null,
          parentPhone: parentPhone || null,
        },
      },
    },
  });

  revalidatePath("/admin/students");
}

export async function deleteStudent(userId: string) {
  const session = await getSession();
  if (!session || session.role !== "ADMIN") throw new Error("Unauthorized");

  await prisma.user.delete({ where: { id: userId } });
  revalidatePath("/admin/students");
}

// ─── Teachers ────────────────────────────────────────

export async function createTeacher(formData: FormData) {
  const session = await getSession();
  if (!session || session.role !== "ADMIN") throw new Error("Unauthorized");

  const name = formData.get("name") as string;
  const email = formData.get("email") as string;
  const password = formData.get("password") as string;
  const phone = formData.get("phone") as string;

  const passwordHash = await bcrypt.hash(password, 10);

  await prisma.user.create({
    data: {
      name,
      email,
      passwordHash,
      role: "TEACHER",
      phone: phone || null,
      teacher: { create: {} },
    },
  });

  revalidatePath("/admin/teachers");
}

export async function deleteTeacher(userId: string) {
  const session = await getSession();
  if (!session || session.role !== "ADMIN") throw new Error("Unauthorized");

  await prisma.user.delete({ where: { id: userId } });
  revalidatePath("/admin/teachers");
}

export async function assignTeacherToClass(formData: FormData) {
  const session = await getSession();
  if (!session || session.role !== "ADMIN") throw new Error("Unauthorized");

  const teacherId = formData.get("teacherId") as string;
  const classId = formData.get("classId") as string;
  const subjectId = formData.get("subjectId") as string;

  await prisma.teacherClass.create({
    data: { teacherId, classId, subjectId },
  });

  revalidatePath("/admin/teachers");
}

export async function removeTeacherAssignment(id: string) {
  const session = await getSession();
  if (!session || session.role !== "ADMIN") throw new Error("Unauthorized");

  await prisma.teacherClass.delete({ where: { id } });
  revalidatePath("/admin/teachers");
}

// ─── Classes ─────────────────────────────────────────

export async function createClass(formData: FormData) {
  const session = await getSession();
  if (!session || session.role !== "ADMIN") throw new Error("Unauthorized");

  const name = formData.get("name") as string;
  const section = formData.get("section") as string;
  const academicYear = formData.get("academicYear") as string;

  await prisma.class.create({ data: { name, section, academicYear } });
  revalidatePath("/admin/classes");
}

export async function createSubject(formData: FormData) {
  const session = await getSession();
  if (!session || session.role !== "ADMIN") throw new Error("Unauthorized");

  const name = formData.get("name") as string;
  const classId = formData.get("classId") as string;

  await prisma.subject.create({ data: { name, classId } });
  revalidatePath("/admin/classes");
}

export async function deleteClass(id: string) {
  const session = await getSession();
  if (!session || session.role !== "ADMIN") throw new Error("Unauthorized");

  await prisma.class.delete({ where: { id } });
  revalidatePath("/admin/classes");
}

// ─── Exams ───────────────────────────────────────────

export async function createExam(formData: FormData) {
  const session = await getSession();
  if (!session || session.role !== "ADMIN") throw new Error("Unauthorized");

  const name = formData.get("name") as string;
  const classId = formData.get("classId") as string;
  const subjectId = formData.get("subjectId") as string;
  const date = formData.get("date") as string;
  const totalMarks = parseInt(formData.get("totalMarks") as string);

  await prisma.exam.create({
    data: { name, classId, subjectId, date: new Date(date), totalMarks },
  });

  revalidatePath("/admin/exams");
}

export async function deleteExam(id: string) {
  const session = await getSession();
  if (!session || session.role !== "ADMIN") throw new Error("Unauthorized");

  await prisma.exam.delete({ where: { id } });
  revalidatePath("/admin/exams");
}
