import { generateText, convertToModelMessages } from "ai";
import { createGroq } from "@ai-sdk/groq";
import { executePython } from "@/lib/python-sandbox";

const groq = createGroq({
  apiKey: process.env.GROQ_API_KEY,
});

const SYSTEM_PROMPT = `You are a helpful School ERP assistant with direct PostgreSQL database access via Python.

When you need data from the database, output a Python code block like this:

\`\`\`python
result = query("SELECT COUNT(*) as count FROM \\"Student\\"")
print(result[0]["count"])
\`\`\`

AVAILABLE FUNCTIONS (pre-loaded, do NOT import them):
- query(sql, params=None) → list of dicts
- query_one(sql, params=None) → single dict or None
- print_json(data) → pretty-prints as JSON
- print_table(rows) → prints ASCII table

RULES:
- The database is READ-ONLY.
- Use parameterized queries with %s for user-provided values.
- Table/column names with uppercase MUST be double-quoted: "User", "classId", "rollNumber", "studentId", etc.
- Always print() your results so they appear in the output.
- Do NOT import query, query_one, etc — they are already available.

DATABASE SCHEMA:
- "User" (id, email, name, phone, role [ADMIN/TEACHER/STUDENT], "createdAt")
- "Class" (id, name, section, "academicYear")
- "Subject" (id, name, "classId"→Class)
- "Student" (id, "userId"→User, "classId"→Class, "rollNumber", "parentName", "parentPhone")
- "Teacher" (id, "userId"→User)
- "TeacherClass" ("teacherId"→Teacher, "classId"→Class, "subjectId"→Subject)
- "Attendance" ("studentId"→Student, "classId"→Class, date, status [PRESENT/ABSENT/LATE])
- "Exam" (id, name, "classId"→Class, "subjectId"→Subject, date, "totalMarks")
- "Mark" ("studentId"→Student, "examId"→Exam, "marksObtained")

COMMON JOINS:
- Student + name: SELECT s.*, u.name FROM "Student" s JOIN "User" u ON s."userId" = u.id
- Attendance stats: SELECT status, COUNT(*) FROM "Attendance" WHERE "classId"=%s GROUP BY status
- Marks + exam: SELECT m.*, e.name, e."totalMarks" FROM "Mark" m JOIN "Exam" e ON m."examId"=e.id

For any data question, output a \`\`\`python code block immediately. For general questions (greetings, explanations), respond normally without code.
Today's date: ${new Date().toISOString().split("T")[0]}.`;

function extractCodeBlock(text: string): string | null {
  // Match ```python ... ``` or ``` ... ``` code blocks
  const match = text.match(/```(?:python)?\s*\n([\s\S]*?)```/);
  return match ? match[1].trim() : null;
}

export async function POST(req: Request) {
  try {
    const body = await req.json();

    const rawMessages = (body.messages ?? []).map((msg: Record<string, unknown>) => {
      if (msg.parts) return msg;
      return { ...msg, parts: [{ type: "text", text: msg.content }] };
    });
    const coreMessages = await convertToModelMessages(rawMessages);

    // Step 1: Ask the model to respond (may include a code block)
    const result = await generateText({
      model: groq("llama-3.3-70b-versatile"),
      system: SYSTEM_PROMPT,
      messages: coreMessages,
    });

    let finalText = result.text;
    const code = extractCodeBlock(finalText);

    if (code) {
      // Step 2: Execute the Python code
      console.log("[chat] executing python:\n" + code.slice(0, 300));
      const execResult = await executePython(code);
      console.log("[chat] python result:", execResult.output.slice(0, 300), execResult.error || "");

      // Step 3: Ask model to present the result naturally
      const userQuestion = coreMessages.filter(m => m.role === "user").pop();
      const questionText = typeof userQuestion?.content === "string"
        ? userQuestion.content
        : Array.isArray(userQuestion?.content)
          ? userQuestion.content.map(p => ("text" in p ? p.text : "")).join(" ")
          : "";

      const followUp = await generateText({
        model: groq("llama-3.3-70b-versatile"),
        messages: [
          {
            role: "user" as const,
            content: `The user asked: "${questionText}"

I ran this database query and got:
${execResult.error ? `Error: ${execResult.error}\nOutput: ${execResult.output}` : `Output: ${execResult.output}`}

${execResult.error ? "Explain the error briefly and suggest what might be wrong." : "Present this result clearly and concisely. Do NOT include any code blocks or tool calls in your response."}`,
          },
        ],
      });
      finalText = followUp.text;
    }

    return new Response(finalText, {
      headers: {
        "Content-Type": "text/plain; charset=utf-8",
      },
    });
  } catch (error) {
    console.error("[chat] error:", error);
    return new Response(
      JSON.stringify({ error: String(error) }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
}
