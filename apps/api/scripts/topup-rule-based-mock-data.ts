import { execFileSync } from "node:child_process";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { writeFileSync, unlinkSync } from "node:fs";

type Difficulty = "EASY" | "MEDIUM" | "HARD";
type QuestionType = "MCQ" | "TRUE_FALSE" | "SHORT_ANSWER";

type BankRow = {
  id: string;
  subject: string;
  topic: string;
  grade: number;
  owner_id: string;
  easy_count: number;
  medium_count: number;
  hard_count: number;
};

const MIN_PER_DIFFICULTY = 5;
const SCRIPT_DIR = join(process.cwd());
const ALLOWED_SUBJECTS = new Set(["Математик", "Физик", "Монгол хэл"]);
const SKIPPED_TOPICS = new Set(["PDF импорт", "Ерөнхий"]);
const envIndex = process.argv.indexOf("--env");
const targetEnv =
  envIndex >= 0 && process.argv[envIndex + 1] ? process.argv[envIndex + 1] : null;

const sqlEscape = (value: string) => value.replaceAll("'", "''");
const sqlString = (value: string) => `'${sqlEscape(value)}'`;

const runWranglerJson = (args: string[]) => {
  const envArgs = targetEnv ? ["--env", targetEnv] : [];
  const stdout = execFileSync("npx", ["wrangler", ...args, ...envArgs, "--json"], {
    cwd: SCRIPT_DIR,
    encoding: "utf8",
    maxBuffer: 10 * 1024 * 1024,
  });

  return JSON.parse(stdout) as Array<{ results: BankRow[] }>;
};

const difficultyLabel = (difficulty: Difficulty) =>
  difficulty === "EASY" ? "Хялбар" : difficulty === "MEDIUM" ? "Дунд" : "Хүнд";

const chooseType = (difficulty: Difficulty, index: number): QuestionType => {
  if (difficulty === "EASY") {
    return index % 2 === 0 ? "MCQ" : "TRUE_FALSE";
  }

  if (difficulty === "MEDIUM") {
    return index % 2 === 0 ? "MCQ" : "SHORT_ANSWER";
  }

  return index % 3 === 0 ? "MCQ" : "SHORT_ANSWER";
};

const buildMcqOptions = (
  subject: string,
  topic: string,
  difficulty: Difficulty,
  index: number,
) => {
  const label = `${subject}-${topic}-${difficulty.toLowerCase()}-${index}`;
  const options = [
    `${label}-A`,
    `${label}-B`,
    `${label}-C`,
    `${label}-D`,
  ];
  return {
    options,
    correctAnswer: options[1] ?? `${label}-B`,
  };
};

const buildQuestionContent = ({
  subject,
  topic,
  difficulty,
  index,
  type,
}: {
  subject: string;
  topic: string;
  difficulty: Difficulty;
  index: number;
  type: QuestionType;
}) => {
  const level = difficultyLabel(difficulty);
  const title = `${topic} ${level} mock ${index}`;

  if (type === "TRUE_FALSE") {
    return {
      title,
      prompt: `[Mock] ${subject} · ${topic} · ${level} ${index}. Энэ өгүүлбэрийн үнэн эсэхийг тодорхойл.`,
      optionsJson: JSON.stringify(["Үнэн", "Худал"]),
      correctAnswer: index % 2 === 0 ? "Үнэн" : "Худал",
    };
  }

  if (type === "SHORT_ANSWER") {
    return {
      title,
      prompt: `[Mock] ${subject} · ${topic} · ${level} ${index}. Богино хариултаа оруул.`,
      optionsJson: JSON.stringify([]),
      correctAnswer: `${topic}-${difficulty.toLowerCase()}-${index}`,
    };
  }

  const mcq = buildMcqOptions(subject, topic, difficulty, index);
  return {
    title,
    prompt: `[Mock] ${subject} · ${topic} · ${level} ${index}. Зөв хариултыг сонго.`,
    optionsJson: JSON.stringify(mcq.options),
    correctAnswer: mcq.correctAnswer,
  };
};

const buildInsertSql = (rows: BankRow[]) => {
  const lines: string[] = [];
  const now = new Date();
  let createdCount = 0;

  for (const row of rows) {
    const byDifficulty: Record<Difficulty, number> = {
      EASY: row.easy_count ?? 0,
      MEDIUM: row.medium_count ?? 0,
      HARD: row.hard_count ?? 0,
    };

    for (const difficulty of ["EASY", "MEDIUM", "HARD"] as const) {
      const deficit = Math.max(0, MIN_PER_DIFFICULTY - byDifficulty[difficulty]);
      for (let offset = 0; offset < deficit; offset += 1) {
        const nextIndex = byDifficulty[difficulty] + offset + 1;
        const type = chooseType(difficulty, nextIndex);
        const id = `${row.id}-mock-${difficulty.toLowerCase()}-${String(nextIndex).padStart(2, "0")}`;
        const content = buildQuestionContent({
          subject: row.subject,
          topic: row.topic,
          difficulty,
          index: nextIndex,
          type,
        });
        const createdAt = new Date(now.getTime() + createdCount * 1000).toISOString();
        const tags = JSON.stringify([
          row.subject,
          row.topic,
          `${row.grade}-р анги`,
          "mock",
          "rule-based-ready",
        ]);

        lines.push(
          `INSERT OR IGNORE INTO questions (id, bank_id, type, title, prompt, options_json, correct_answer, difficulty, tags_json, created_by_id, created_at) VALUES (${sqlString(
            id,
          )}, ${sqlString(row.id)}, ${sqlString(type)}, ${sqlString(
            content.title,
          )}, ${sqlString(content.prompt)}, ${sqlString(content.optionsJson)}, ${sqlString(
            content.correctAnswer,
          )}, ${sqlString(difficulty)}, ${sqlString(tags)}, ${sqlString(
            row.owner_id,
          )}, ${sqlString(createdAt)});`,
        );
        createdCount += 1;
      }
    }
  }

  return { sql: `${lines.join("\n")}\n`, createdCount };
};

const main = () => {
  const result = runWranglerJson([
    "d1",
    "execute",
    "DB",
    "--remote",
    "--command",
    "SELECT qb.id, qb.subject, qb.topic, qb.grade, qb.owner_id, SUM(CASE WHEN q.difficulty='EASY' AND q.type IN ('MCQ','TRUE_FALSE','SHORT_ANSWER') THEN 1 ELSE 0 END) AS easy_count, SUM(CASE WHEN q.difficulty='MEDIUM' AND q.type IN ('MCQ','TRUE_FALSE','SHORT_ANSWER') THEN 1 ELSE 0 END) AS medium_count, SUM(CASE WHEN q.difficulty='HARD' AND q.type IN ('MCQ','TRUE_FALSE','SHORT_ANSWER') THEN 1 ELSE 0 END) AS hard_count FROM question_banks qb LEFT JOIN questions q ON q.bank_id = qb.id GROUP BY qb.id, qb.subject, qb.topic, qb.grade, qb.owner_id ORDER BY qb.subject, qb.topic",
  ]);

  const rows = (result[0]?.results ?? []).filter(
    (row) => ALLOWED_SUBJECTS.has(row.subject) && !SKIPPED_TOPICS.has(row.topic),
  );

  const { createdCount, sql } = buildInsertSql(rows);
  if (!createdCount) {
    console.log("No top-up needed. Every topic already has enough auto-gradable mock questions.");
    return;
  }

  const sqlPath = join(tmpdir(), `pinequest-rule-topup-${Date.now()}.sql`);
  writeFileSync(sqlPath, sql, "utf8");

  try {
    const envArgs = targetEnv ? ["--env", targetEnv] : [];
    execFileSync(
      "npx",
      [
        "wrangler",
        "d1",
        "execute",
        "DB",
        "--remote",
        ...envArgs,
        "--yes",
        "--file",
        sqlPath,
      ],
      {
        cwd: SCRIPT_DIR,
        stdio: "inherit",
        maxBuffer: 10 * 1024 * 1024,
      },
    );
  } finally {
    unlinkSync(sqlPath);
  }

  console.log(
    `Inserted up to ${createdCount} mock questions across topic banks${targetEnv ? ` (${targetEnv})` : ""}.`,
  );
};

main();
