import "dotenv/config";
import { generateText, tool } from "ai";
import { createGroq } from "@ai-sdk/groq";
import { z } from "zod";

const groq = createGroq({ apiKey: process.env.GROQ_API_KEY });

async function test() {
  console.log("Testing generateText with maxSteps...\n");
  
  const result = await generateText({
    model: groq("llama-3.3-70b-versatile"),
    system: "You are a school assistant.",
    messages: [{ role: "user", content: "show school statistics" }],
    tools: {
      getSchoolStats: tool({
        description: "Get school statistics",
        parameters: z.object({}),
        execute: async () => {
          console.log("  [tool] getSchoolStats called!");
          return { totalStudents: 25, totalTeachers: 5, totalClasses: 24 };
        },
      }),
    },
    maxSteps: 5,
  });

  console.log("Text:", result.text);
  console.log("Steps:", result.steps.length);
  for (const s of result.steps) {
    console.log("  Step:", s.finishReason, "text:", s.text?.substring(0, 100), "toolCalls:", s.toolCalls?.length);
  }
}

test().catch(e => console.error("ERR:", e));
