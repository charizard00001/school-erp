import { execFile } from "child_process";
import { writeFile, unlink } from "fs/promises";
import { join } from "path";
import { tmpdir } from "os";
import { randomUUID } from "crypto";

const TIMEOUT_MS = 30_000;
const MAX_OUTPUT = 50_000; // 50KB

function buildBootstrap(dbUrl: string): string {
  return `import psycopg2
import psycopg2.extras
import json
import sys
from datetime import datetime, date, timedelta
from decimal import Decimal

class _Enc(json.JSONEncoder):
    def default(self, obj):
        if isinstance(obj, (date, datetime)):
            return obj.isoformat()
        if isinstance(obj, Decimal):
            return float(obj)
        return super().default(obj)

conn = psycopg2.connect(${JSON.stringify("placeholder")})
conn.set_session(autocommit=True, readonly=True)
cur = conn.cursor(cursor_factory=psycopg2.extras.RealDictCursor)

def query(sql, params=None):
    """Run SQL, return list of dicts."""
    cur.execute(sql, params)
    return [dict(r) for r in cur.fetchall()] if cur.description else []

def query_one(sql, params=None):
    """Run SQL, return single dict or None."""
    cur.execute(sql, params)
    if cur.description:
        r = cur.fetchone()
        return dict(r) if r else None
    return None

def print_json(data):
    """Pretty-print as JSON."""
    print(json.dumps(data, indent=2, cls=_Enc, ensure_ascii=False))

def print_table(rows, headers=None):
    """Print rows as an ASCII table."""
    if not rows:
        print("(no rows)")
        return
    if headers is None:
        headers = list(rows[0].keys())
    widths = [max(len(str(h)), max((len(str(row.get(h, ""))) for row in rows), default=0)) for h in headers]
    print(" | ".join(str(h).ljust(w) for h, w in zip(headers, widths)))
    print("-+-".join("-" * w for w in widths))
    for row in rows:
        print(" | ".join(str(row.get(h, "")).ljust(w) for h, w in zip(headers, widths)))

# === YOUR CODE ===
`;
}

export interface SandboxResult {
  output: string;
  error?: string;
  exitCode: number;
}

export async function executePython(code: string): Promise<SandboxResult> {
  const dbUrl = process.env.DATABASE_URL;
  if (!dbUrl) {
    return { output: "", error: "DATABASE_URL not configured", exitCode: 1 };
  }

  // Build full script: bootstrap (with real DB URL injected) + user code + cleanup
  const bootstrap = buildBootstrap(dbUrl).replace(
    JSON.stringify("placeholder"),
    JSON.stringify(dbUrl)
  );
  const fullCode = bootstrap + code + "\n\nconn.close()\n";

  const tmpFile = join(tmpdir(), `erp-sandbox-${randomUUID()}.py`);

  try {
    await writeFile(tmpFile, fullCode, "utf-8");

    return await new Promise<SandboxResult>((resolve) => {
      execFile(
        "python",
        [tmpFile],
        { timeout: TIMEOUT_MS, maxBuffer: 2 * 1024 * 1024 },
        (error, stdout, stderr) => {
          let output = (stdout || "").trim();
          if (output.length > MAX_OUTPUT) {
            output = output.slice(0, MAX_OUTPUT) + "\n...(output truncated)";
          }

          if (error && "killed" in error && error.killed) {
            resolve({
              output,
              error: "Execution timed out (30s limit)",
              exitCode: 1,
            });
          } else if (error) {
            // Extract the last few lines of traceback for clarity
            const errLines = (stderr || "").trim().split("\n");
            const relevantErr = errLines.slice(-4).join("\n");
            resolve({
              output,
              error: relevantErr || error.message,
              exitCode: 1,
            });
          } else {
            resolve({ output, exitCode: 0 });
          }
        }
      );
    });
  } catch (e) {
    return { output: "", error: `Sandbox error: ${e}`, exitCode: 1 };
  } finally {
    unlink(tmpFile).catch(() => {});
  }
}
