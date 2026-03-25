import { mkdirSync, writeFileSync } from "node:fs";
import { resolve } from "node:path";
import { questionBanks } from "../src/seeds/question-bank-data";

const escapeSql = (value: string) => value.replaceAll("'", "''");

const sqlValue = (value: string | null) =>
  value === null ? "NULL" : `'${escapeSql(value)}'`;

const toDifficulty = (value: string) => value.toUpperCase();

const toQuestionType = (value: string) => {
  switch (value) {
    case "MULTIPLE_CHOICE":
      return "MCQ";
    case "SHORT_TEXT":
      return "SHORT_ANSWER";
    case "IMAGE_UPLOAD":
      return "IMAGE_UPLOAD";
    default:
      return value;
  }
};

const toOptionsJson = (type: string, options?: { text: string }[]) => {
  if (type === "TRUE_FALSE") {
    return JSON.stringify(["Үнэн", "Худал"]);
  }

  if (type === "MULTIPLE_CHOICE") {
    return JSON.stringify((options ?? []).map((option) => option.text));
  }

  return JSON.stringify([]);
};

const toTagsJson = (subject: string, topic: string) =>
  JSON.stringify([subject, topic, "10-р анги"]);

const outputPath = resolve(
  process.cwd(),
  "migrations/0004_seed_subject_question_banks.sql",
);

const bankIds = ["bank_001", ...questionBanks.map((bank) => bank.id)];

const lines: string[] = [
  "DELETE FROM answers WHERE attempt_id IN (SELECT id FROM attempts WHERE exam_id = 'exam_001');",
  "DELETE FROM attempts WHERE exam_id = 'exam_001';",
  "DELETE FROM exam_questions WHERE exam_id = 'exam_001';",
  "DELETE FROM exams WHERE id = 'exam_001';",
  `DELETE FROM questions WHERE bank_id IN (${bankIds.map((id) => sqlValue(id)).join(", ")});`,
  `DELETE FROM question_banks WHERE id IN (${bankIds.map((id) => sqlValue(id)).join(", ")});`,
  "",
  "INSERT INTO question_banks (id, title, description, subject, owner_id, created_at)",
  "VALUES",
  questionBanks
    .map((bank, index) => {
      const createdAt = `2026-03-25T00:0${index}:00.000Z`;
      return `  (${sqlValue(bank.id)}, ${sqlValue(bank.title)}, ${sqlValue(
        bank.description,
      )}, ${sqlValue(bank.subject)}, 'user_teacher_001', '${createdAt}')`;
    })
    .join(",\n") + ";",
  "",
  "INSERT INTO questions (",
  "  id,",
  "  bank_id,",
  "  type,",
  "  title,",
  "  prompt,",
  "  options_json,",
  "  correct_answer,",
  "  difficulty,",
  "  tags_json,",
  "  created_by_id,",
  "  created_at",
  ")",
  "VALUES",
];

const questionRows = questionBanks.flatMap((bank, bankIndex) =>
  bank.questions.map((question, questionIndex) => {
    const createdAt = new Date(
      Date.UTC(2026, 2, 25, bankIndex, questionIndex, 0),
    ).toISOString();

    return `  (${sqlValue(question.id)}, ${sqlValue(bank.id)}, ${sqlValue(
      toQuestionType(question.type),
    )}, ${sqlValue(question.topic)}, ${sqlValue(question.prompt)}, ${sqlValue(
      toOptionsJson(question.type, question.options),
    )}, ${sqlValue(question.answer ?? null)}, ${sqlValue(
      toDifficulty(question.difficulty),
    )}, ${sqlValue(
      toTagsJson(bank.subject, question.topic),
    )}, 'user_teacher_001', '${createdAt}')`;
  }),
);

lines.push(questionRows.join(",\n") + ";", "");

const physicsBank = questionBanks.find((bank) => bank.subject === "Физик");

if (!physicsBank) {
  throw new Error("Physics bank not found");
}

lines.push(
  "INSERT INTO exams (id, class_id, title, description, mode, status, duration_minutes, created_by_id, created_at)",
  "VALUES",
  "  ('exam_001', 'class_001', '10-р ангийн физикийн жишиг шалгалт', 'Физикийн банкнаас seed хийсэн demo шалгалт', 'SCHEDULED', 'PUBLISHED', 60, 'user_teacher_001', '2026-03-25T03:00:00.000Z');",
  "",
  "INSERT INTO exam_questions (id, exam_id, question_id, points, display_order)",
  "VALUES",
  physicsBank.questions
    .slice(0, 10)
    .map(
      (question, index) =>
        `  ('exam_question_${String(index + 1).padStart(3, "0")}', 'exam_001', ${sqlValue(
          question.id,
        )}, ${question.points}, ${index + 1})`,
    )
    .join(",\n") + ";",
  "",
);

mkdirSync(resolve(process.cwd(), "migrations"), { recursive: true });
writeFileSync(outputPath, `${lines.join("\n")}\n`, "utf8");

console.log(`Generated ${outputPath}`);
