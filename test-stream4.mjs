import "dotenv/config";
import { streamText, tool } from "ai";
import { createGroq } from "@ai-sdk/groq";
import { z } from "zod";

const groq = createGroq({ apiKey: process.env.GROQ_API_KEY });

async function test() {
  const result = streamText({
    model: groq("llama-3.3-70b-versatile"),
    system: "You are a school assistant.",
    messages: [{ role: "user", content: "show school statistics" }],
    tools: {
      getSchoolStats: tool({
        description: "Get school statistics",
        parameters: z.object({}),
        execute: async () => {
          return { totalStudents: 25, totalTeachers: 5, totalClasses: 24 };
        },
      }),
    },
    maxSteps: 5,
  });

  for await (const part of result.fullStream) {
    if (part.type === "tool-result") {
      console.log("tool-result keys:", Object.keys(part));
      console.log("tool-result full:", JSON.stringify(part, null, 2));
    } else if (part.type === "text-delta") {
      process.stdout.write(part.textDelta);
    } else if (part.type === "finish-step") {
      console.log("[finish-step] keys:", Object.keys(part));
      console.log("[finish-step] finishReason:", part.finishReason);
      console.log("[finish-step] isContinued:", part.isContinued);
    } else if (part.type === "finish") {
      console.log("[finish] finishReason:", part.finishReason);
    } else {
      console.log(`[${part.type}]`);
    }
  }
}

test().catch(e => console.error("ERR:", e));
