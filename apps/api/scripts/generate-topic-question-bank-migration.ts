import { mkdirSync, writeFileSync } from "node:fs";
import { resolve } from "node:path";
import { questionBanks } from "../src/seeds/question-bank-data";

const escapeSql = (value: string) => value.replaceAll("'", "''");

const sqlValue = (value: string | null) =>
  value === null ? "NULL" : `'${escapeSql(value)}'`;

const outputPath = resolve(
  process.cwd(),
  "migrations/0010_split_question_banks_by_topic.sql",
);

const topicBankRows = questionBanks.flatMap((bank, bankIndex) => {
  const topics = [...new Set(bank.questions.map((question) => question.topic))];

  return topics.map((topic, topicIndex) => {
    const questionIds = bank.questions
      .filter((question) => question.topic === topic)
      .map((question) => question.id);

    return {
      id: `${bank.id}-topic-${String(topicIndex + 1).padStart(2, "0")}`,
      sourceBankId: bank.id,
      title: `${bank.subject} · ${topic}`,
      description: `${bank.title} сангаас ${topic} сэдвийг тусгаарласан ${questionIds.length} асуулттай mock сан.`,
      grade: 10,
      subject: bank.subject,
      topic,
      visibility: "PUBLIC",
      ownerId: "user_teacher_001",
      createdAt: new Date(
        Date.UTC(2026, 2, 27, bankIndex, topicIndex, 0),
      ).toISOString(),
      questionIds,
    };
  });
});

const lines: string[] = [
  "-- Generated from apps/api/src/seeds/question-bank-data.ts",
  "",
  "INSERT INTO question_banks (id, title, description, grade, subject, topic, visibility, owner_id, created_at)",
  "VALUES",
  topicBankRows
    .map(
      (bank) =>
        `  (${sqlValue(bank.id)}, ${sqlValue(bank.title)}, ${sqlValue(bank.description)}, ${bank.grade}, ${sqlValue(bank.subject)}, ${sqlValue(bank.topic)}, ${sqlValue(bank.visibility)}, ${sqlValue(bank.ownerId)}, ${sqlValue(bank.createdAt)})`,
    )
    .join(",\n") + ";",
  "",
];

for (const bank of topicBankRows) {
  lines.push(
    `UPDATE questions SET bank_id = ${sqlValue(bank.id)} WHERE id IN (${bank.questionIds
      .map((id) => sqlValue(id))
      .join(", ")});`,
  );
}

lines.push(
  "",
  `DELETE FROM question_banks WHERE id IN (${questionBanks
    .map((bank) => sqlValue(bank.id))
    .join(", ")});`,
  "",
);

mkdirSync(resolve(process.cwd(), "migrations"), { recursive: true });
writeFileSync(outputPath, `${lines.join("\n")}\n`, "utf8");

console.log(`Generated ${outputPath}`);
