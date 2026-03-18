import "dotenv/config";
import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });
const prisma = new PrismaClient({ adapter });

async function test() {
  try {
    // Test basic queries that chatbot tools use
    console.log("=== Testing Prisma queries used by chatbot tools ===\n");

    const students = await prisma.student.count();
    console.log("Student count:", students);

    const teachers = await prisma.teacher.count();
    console.log("Teacher count:", teachers);

    const classes = await prisma.class.count();
    console.log("Class count:", classes);

    // Test search student (getStudentInfo tool)
    const found = await prisma.student.findMany({
      where: {
        OR: [
          { user: { name: { contains: "Rahul", mode: "insensitive" } } },
          { rollNumber: { contains: "001", mode: "insensitive" } },
        ],
      },
      include: {
        user: { select: { name: true, email: true } },
        class: { select: { name: true, section: true } },
      },
      take: 5,
    });
    console.log("\nSearch 'Rahul':", found.map(s => `${s.user.name} (${s.class.name}-${s.class.section})`));

    console.log("\n=== All Prisma queries work! ===");
  } catch (error) {
    console.error("ERROR:", error);
  } finally {
    await prisma.$disconnect();
  }
}

test();
