import { execFileSync } from "node:child_process";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { unlinkSync, writeFileSync } from "node:fs";
import { buildMockQuestionContent } from "./mock-question-content";

type Difficulty = "EASY" | "MEDIUM" | "HARD";
type QuestionType = "MCQ" | "TRUE_FALSE" | "SHORT_ANSWER";

type CommunitySeedQuestionRow = {
  id: string;
  bank_id: string;
  type: QuestionType;
  difficulty: Difficulty;
  subject: string;
  topic: string;
  grade: number;
};

const SCRIPT_DIR = process.cwd();
const envIndex = process.argv.indexOf("--env");
const targetEnv =
  envIndex >= 0 && process.argv[envIndex + 1] ? process.argv[envIndex + 1] : "production";

const sqlEscape = (value: string) => value.replaceAll("'", "''");
const sqlString = (value: string) => `'${sqlEscape(value)}'`;

const runWranglerJson = (args: string[]) => {
  const stdout = execFileSync(
    "npx",
    ["wrangler", ...args, "--remote", "--env", targetEnv, "--json"],
    {
      cwd: SCRIPT_DIR,
      encoding: "utf8",
      maxBuffer: 20 * 1024 * 1024,
    },
  );

  return JSON.parse(stdout) as Array<{ results: CommunitySeedQuestionRow[] }>;
};

const extractIndex = (id: string) => {
  const match = id.match(/-q(\d+)$/);
  return Number.parseInt(match?.[1] ?? "1", 10) || 1;
};

const buildSql = (rows: CommunitySeedQuestionRow[]) => {
  const lines: string[] = [];

  for (const row of rows) {
    const content = buildMockQuestionContent({
      subject: row.subject,
      topic: row.topic,
      grade: row.grade,
      difficulty: row.difficulty,
      index: extractIndex(row.id),
      type: row.type,
    });

    lines.push(
      `UPDATE questions
       SET title = ${sqlString(content.title)},
           prompt = ${sqlString(content.prompt)},
           options_json = ${sqlString(content.optionsJson)},
           correct_answer = ${sqlString(content.correctAnswer)}
       WHERE id = ${sqlString(row.id)};`,
    );
  }

  return `${lines.join("\n")}\n`;
};

const main = () => {
  const result = runWranglerJson([
    "d1",
    "execute",
    "DB",
    "--command",
    "SELECT q.id, q.bank_id, q.type, q.difficulty, qb.subject, qb.topic, qb.grade FROM questions q JOIN question_banks qb ON qb.id = q.bank_id WHERE qb.id LIKE 'community-bank-%' ORDER BY q.id",
  ]);

  const rows = result[0]?.results ?? [];
  if (rows.length === 0) {
    console.log("No community seed questions found.");
    return;
  }

  const sqlPath = join(tmpdir(), `pinequest-refresh-community-seed-${Date.now()}.sql`);
  writeFileSync(sqlPath, buildSql(rows), "utf8");

  try {
    execFileSync(
      "npx",
      [
        "wrangler",
        "d1",
        "execute",
        "DB",
        "--remote",
        "--env",
        targetEnv,
        "--yes",
        "--file",
        sqlPath,
      ],
      {
        cwd: SCRIPT_DIR,
        stdio: "inherit",
        maxBuffer: 20 * 1024 * 1024,
      },
    );
  } finally {
    unlinkSync(sqlPath);
  }

  console.log(`Refreshed ${rows.length} community seed questions in ${targetEnv}.`);
};

main();
