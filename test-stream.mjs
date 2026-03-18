import "dotenv/config";
import { streamText, tool } from "ai";
import { createGroq } from "@ai-sdk/groq";
import { z } from "zod";

const groq = createGroq({ apiKey: process.env.GROQ_API_KEY });

async function test() {
  console.log("Testing streamText with tool calls...\n");

  const result = streamText({
    model: groq("llama-3.3-70b-versatile"),
    system: "You are a school assistant. Today is 2026-03-18.",
    messages: [{ role: "user", content: "show school statistics" }],
    tools: {
      getSchoolStats: tool({
        description: "Get school statistics",
        inputSchema: z.object({}),
        execute: async () => {
          console.log("[tool] getSchoolStats called!");
          return { totalStudents: 25, totalTeachers: 5, totalClasses: 24 };
        },
      }),
    },
    maxSteps: 5,
    onStepFinish: (step) => {
      console.log("[step]", {
        stepType: step.stepType,
        hasText: !!step.text,
        textLen: step.text?.length,
        toolCalls: step.toolCalls?.length,
      });
    },
  });

  console.log("\n--- Consuming text stream ---");
  const text = await result.text;
  console.log("FULL TEXT:", text);
  console.log("TEXT LENGTH:", text.length);

  console.log("\n--- Consuming textStream ---");
  // Also check the underlying stream
  const steps = await result.steps;
  console.log("STEPS:", steps.length);
  for (const s of steps) {
    console.log("  Step:", s.stepType, "text:", s.text?.substring(0, 80), "toolCalls:", s.toolCalls?.length);
  }
}

test().catch(e => console.error("ERR:", e));
