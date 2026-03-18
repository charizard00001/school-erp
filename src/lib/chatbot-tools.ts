import { tool } from "ai";
import { z } from "zod";
import { executePython } from "./python-sandbox";

export const chatbotTools = {
  run_python_code: tool({
    description: "Execute Python code to query the school database. Use query(sql) to run SQL and print() to output results. Helper functions: query(sql, params) returns list of dicts, query_one(sql) returns one dict, print_json(data) and print_table(rows) for formatting. The connection is read-only. Double-quote table/column names with uppercase: e.g. \"Student\", \"classId\".",
    inputSchema: z.object({
      code: z.string().describe("Python code to execute"),
    }),
    execute: async ({ code }) => {
      console.log("[python-sandbox] executing code:\n" + code.slice(0, 300));
      const result = await executePython(code);

      if (result.error) {
        console.log("[python-sandbox] error:", result.error);
        return {
          success: false,
          error: result.error,
          output: result.output || undefined,
        };
      }

      console.log("[python-sandbox] output:", result.output.slice(0, 200));
      return {
        success: true,
        output: result.output,
      };
    },
  }),
};
