import "dotenv/config";
import { streamText, tool } from "ai";
import { createGroq } from "@ai-sdk/groq";
import { z } from "zod";

const groq = createGroq({ apiKey: process.env.GROQ_API_KEY });

async function test() {
  console.log("Testing streamText multi-step with tools...\n");

  const result = streamText({
    model: groq("llama-3.3-70b-versatile"),
    system: "You are a school assistant.",
    messages: [{ role: "user", content: "show school statistics" }],
    tools: {
      getSchoolStats: tool({
        description: "Get school statistics",
        parameters: z.object({}),
        execute: async () => {
          console.log("  [tool] getSchoolStats executed!");
          return { totalStudents: 25, totalTeachers: 5, totalClasses: 24 };
        },
      }),
    },
    maxSteps: 5,
  });

  console.log("--- Full stream events ---");
  for await (const part of result.fullStream) {
    if (part.type === "text-delta") {
      process.stdout.write(part.textDelta);
    } else if (part.type === "tool-call") {
      console.log(`\n[tool-call] ${part.toolName}`);
    } else if (part.type === "tool-result") {
      console.log(`[tool-result] ${part.toolName}: ${JSON.stringify(part.result ?? "none").substring(0, 200)}`);
    } else if (part.type === "error") {
      console.log(`[ERROR]`, part.error);
    } else {
      console.log(`[${part.type}]`);
    }
  }
  console.log("\n--- Done ---");
}

test().catch(e => console.error("ERR:", e));
