import { streamText } from "ai";
import { createGroq } from "@ai-sdk/groq";
import { chatbotTools } from "@/lib/chatbot-tools";

const groq = createGroq({
  apiKey: process.env.GROQ_API_KEY,
});

export async function POST(req: Request) {
  const { messages } = await req.json();

  const result = streamText({
    model: groq("llama-3.3-70b-versatile"),
    system: `You are a helpful School ERP assistant. You help school administrators and teachers manage their school.

You can:
- Search for students by name or roll number
- Get attendance summaries for classes within date ranges
- Get class performance analytics for exams
- Generate report cards for students
- Get overall school statistics

When presenting data, format it clearly with tables or lists. When generating report cards, present the data in a well-formatted summary.

Today's date is ${new Date().toISOString().split("T")[0]}.

If the user asks for something you cannot do, let them know what you CAN help with.`,
    messages,
    tools: chatbotTools,
  });

  return result.toTextStreamResponse();
}
