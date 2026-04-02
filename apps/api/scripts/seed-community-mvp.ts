import { execFileSync } from "node:child_process";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { unlinkSync, writeFileSync } from "node:fs";
import { buildMockQuestionContent } from "./mock-question-content";

type SubjectConfig = {
  code: string;
  name: string;
  communityId: string;
  communityName: string;
  communityDescription: string;
  topics: string[];
};

const SCRIPT_DIR = process.cwd();
const envIndex = process.argv.indexOf("--env");
const targetEnv =
  envIndex >= 0 && process.argv[envIndex + 1] ? process.argv[envIndex + 1] : "production";

const schools = [
  { code: "shine-irgedui", name: "Шинэ Ирээдүй" },
  { code: "oyu-undraa", name: "Оюуны Ундраа" },
  { code: "temuulel", name: "Тэмүүлэл" },
  { code: "erdem-urgoo", name: "Эрдмийн Өргөө" },
  { code: "orchlon", name: "Орчлон" },
];

const subjects: SubjectConfig[] = [
  {
    code: "math",
    name: "Математик",
    communityId: "community-network-math",
    communityName: "Математикийн багш нарын нэгдсэн community",
    communityDescription:
      "6-12-р ангийн математикийн асуулт, practice bank, түвшин тогтоох тестүүдийг сургууль дамнан share хийдэг network.",
    topics: ["Алгебр", "Функц", "Геометр", "Тэгшитгэл", "Тригонометр", "Магадлал"],
  },
  {
    code: "physics",
    name: "Физик",
    communityId: "community-network-physics",
    communityName: "Физикийн багш нарын нэгдсэн community",
    communityDescription:
      "Физикийн concept-based асуулт, оношлох тест, ахисан түвшний сангуудыг нэгтгэсэн хамтын орчин.",
    topics: ["Механик", "Динамик", "Энерги", "Цахилгаан", "Дулаан", "Долгион"],
  },
  {
    code: "mn",
    name: "Монгол хэл",
    communityId: "community-network-mn",
    communityName: "Монгол хэлний багш нарын нэгдсэн community",
    communityDescription:
      "Монгол хэл, найруулга, уншлага, яруу найргийн сэдвүүдээр хамтран агуулга бүрдүүлдэг нэгдсэн сан.",
    topics: ["Үг зүй", "Найруулга", "Уншлага", "Яруу найраг", "Өгүүлбэр зүй", "Цэг таслал"],
  },
];

const sqlEscape = (value: string) => value.replaceAll("'", "''");
const sqlString = (value: string) => `'${sqlEscape(value)}'`;
const sqlNullable = (value: string | null) => (value === null ? "NULL" : sqlString(value));

const buildQuestion = ({
  bankId,
  teacherId,
  subject,
  topic,
  grade,
  schoolName,
  ordinal,
  createdAt,
}: {
  bankId: string;
  teacherId: string;
  subject: string;
  topic: string;
  grade: number;
  schoolName: string;
  ordinal: number;
  createdAt: string;
}) => {
  const id = `${bankId}-q${ordinal}`;
  const tags = JSON.stringify([subject, topic, `${grade}-р анги`, schoolName, "community-mvp"]);
  const type = ordinal === 2 ? "TRUE_FALSE" : ordinal === 4 ? "SHORT_ANSWER" : "MCQ";
  const difficulty = ordinal === 1 ? "EASY" : ordinal === 3 ? "MEDIUM" : "HARD";
  const content = buildMockQuestionContent({
    subject,
    topic,
    grade,
    difficulty,
    index: ordinal,
    type,
  });

  return `INSERT OR IGNORE INTO questions (id, bank_id, type, title, prompt, options_json, correct_answer, difficulty, tags_json, created_by_id, created_at) VALUES (${sqlString(
    id,
  )}, ${sqlString(bankId)}, ${sqlString(type)}, ${sqlString(
    content.title,
  )}, ${sqlString(
    content.prompt,
  )}, ${sqlString(content.optionsJson)}, ${sqlString(content.correctAnswer)}, ${sqlString(
    difficulty,
  )}, ${sqlString(tags)}, ${sqlString(teacherId)}, ${sqlString(createdAt)});`;
};

const buildSql = () => {
  const statements: string[] = [];
  let timeCursor = Date.parse("2026-03-20T00:00:00.000Z");

  const nextTimestamp = () => {
    const value = new Date(timeCursor).toISOString();
    timeCursor += 60_000;
    return value;
  };

  schools.forEach((school) => {
    subjects.forEach((subject) => {
      const teacherId = `user_teacher_${school.code}_${subject.code}`;
      const teacherCreatedAt = nextTimestamp();
      statements.push(
        `INSERT OR IGNORE INTO users (id, full_name, email, role, created_at) VALUES (${sqlString(
          teacherId,
        )}, ${sqlString(
          `${school.name} · ${subject.name} багш`,
        )}, ${sqlString(
          `community-${school.code}-${subject.code}+clerk_test@test.com`,
        )}, 'TEACHER', ${sqlString(teacherCreatedAt)});`,
      );
    });
  });

  for (const subject of subjects) {
    const ownerTeacherId = `user_teacher_${schools[0]?.code}_${subject.code}`;
    const communityCreatedAt = nextTimestamp();
    statements.push(
      `INSERT OR IGNORE INTO communities (id, name, description, subject, grade, visibility, owner_id, created_at) VALUES (${sqlString(
        subject.communityId,
      )}, ${sqlString(subject.communityName)}, ${sqlString(
        subject.communityDescription,
      )}, ${sqlString(subject.name)}, 0, 'PUBLIC', ${sqlString(
        ownerTeacherId,
      )}, ${sqlString(communityCreatedAt)});`,
    );
    statements.push(
      `INSERT OR IGNORE INTO community_usage_events (id, community_id, actor_user_id, event_type, entity_type, entity_id, metadata_json, created_at) VALUES (${sqlString(
        `community-usage-create-${subject.code}`,
      )}, ${sqlString(subject.communityId)}, ${sqlString(
        ownerTeacherId,
      )}, 'CREATE_COMMUNITY', 'COMMUNITY', ${sqlString(
        subject.communityId,
      )}, '{"source":"seed"}', ${sqlString(communityCreatedAt)});`,
    );
  }

  let studentOffset = 1;

  schools.forEach((school, schoolIndex) => {
    subjects.forEach((subject, subjectIndex) => {
      const teacherId = `user_teacher_${school.code}_${subject.code}`;
      const membershipCreatedAt = nextTimestamp();
      const memberRole = schoolIndex === 0 ? "OWNER" : "MEMBER";
      statements.push(
        `INSERT OR IGNORE INTO community_members (id, community_id, user_id, role, joined_at) VALUES (${sqlString(
          `community-member-${school.code}-${subject.code}`,
        )}, ${sqlString(subject.communityId)}, ${sqlString(teacherId)}, ${sqlString(
          memberRole,
        )}, ${sqlString(membershipCreatedAt)});`,
      );
      if (schoolIndex !== 0) {
        statements.push(
          `INSERT OR IGNORE INTO community_usage_events (id, community_id, actor_user_id, event_type, entity_type, entity_id, metadata_json, created_at) VALUES (${sqlString(
            `community-usage-join-${school.code}-${subject.code}`,
          )}, ${sqlString(subject.communityId)}, ${sqlString(
            teacherId,
          )}, 'JOIN_COMMUNITY', 'COMMUNITY', ${sqlString(
            subject.communityId,
          )}, '{"source":"seed"}', ${sqlString(membershipCreatedAt)});`,
        );
      }

      for (let grade = 6; grade <= 12; grade += 1) {
        const topic =
          subject.topics[(grade + schoolIndex + subjectIndex) % subject.topics.length] ??
          subject.topics[0]!;
        const bankId = `community-bank-${school.code}-${subject.code}-${grade}`;
        const bankCreatedAt = nextTimestamp();
        statements.push(
          `INSERT OR IGNORE INTO question_banks (id, title, description, grade, subject, topic, visibility, owner_id, created_at) VALUES (${sqlString(
            bankId,
          )}, ${sqlString(
            `${school.name} · ${grade}-р анги · ${subject.name}`,
          )}, ${sqlString(
            `${school.name}-ийн ${grade}-р ангийн ${subject.name}ийн ${topic} сэдвийн community mock bank.`,
          )}, ${grade}, ${sqlString(subject.name)}, ${sqlString(
            topic,
          )}, 'PUBLIC', ${sqlString(teacherId)}, ${sqlString(bankCreatedAt)});`,
        );

        for (let ordinal = 1; ordinal <= 5; ordinal += 1) {
          statements.push(
            buildQuestion({
              bankId,
              teacherId,
              subject: subject.name,
              topic,
              grade,
              schoolName: school.name,
              ordinal,
              createdAt: nextTimestamp(),
            }),
          );
        }

        if (grade >= 10) {
          const sharedBankId = `community-shared-${school.code}-${subject.code}-${grade}`;
          const sharedAt = nextTimestamp();
          statements.push(
            `INSERT OR IGNORE INTO community_shared_banks (id, community_id, bank_id, shared_by_id, status, created_at) VALUES (${sqlString(
              sharedBankId,
            )}, ${sqlString(subject.communityId)}, ${sqlString(
              bankId,
            )}, ${sqlString(teacherId)}, 'ACTIVE', ${sqlString(sharedAt)});`,
          );
          statements.push(
            `INSERT OR IGNORE INTO community_usage_events (id, community_id, actor_user_id, event_type, entity_type, entity_id, metadata_json, created_at) VALUES (${sqlString(
              `community-usage-share-${school.code}-${subject.code}-${grade}`,
            )}, ${sqlString(subject.communityId)}, ${sqlString(
              teacherId,
            )}, 'SHARE_BANK', 'SHARED_BANK', ${sqlString(
              sharedBankId,
            )}, ${sqlString(JSON.stringify({ bankId }))}, ${sqlString(sharedAt)});`,
          );

          const copyEvents = 2 + ((grade + schoolIndex) % 3);
          for (let copyIndex = 0; copyIndex < copyEvents; copyIndex += 1) {
            const actorSchool = schools[(schoolIndex + copyIndex + 1) % schools.length]!;
            const copyActorId = `user_teacher_${actorSchool.code}_${subject.code}`;
            statements.push(
              `INSERT OR IGNORE INTO community_usage_events (id, community_id, actor_user_id, event_type, entity_type, entity_id, metadata_json, created_at) VALUES (${sqlString(
                `community-usage-copy-${school.code}-${subject.code}-${grade}-${copyIndex}`,
              )}, ${sqlString(subject.communityId)}, ${sqlString(
                copyActorId,
              )}, 'COPY_BANK', 'SHARED_BANK', ${sqlString(sharedBankId)}, ${sqlString(
                JSON.stringify({ sourceBankId: bankId }),
              )}, ${sqlString(nextTimestamp())});`,
            );
          }

          const classId = `community-class-${school.code}-${subject.code}-${grade}`;
          const classCreatedAt = nextTimestamp();
          statements.push(
            `INSERT OR IGNORE INTO classes (id, name, description, subject, grade, teacher_id, created_at) VALUES (${sqlString(
              classId,
            )}, ${sqlString(
              `${school.name} · ${subject.name} · ${grade}-р анги`,
            )}, ${sqlString(
              `${school.name}-ийн community analytics mock class`,
            )}, ${sqlString(subject.name)}, ${grade}, ${sqlString(
              teacherId,
            )}, ${sqlString(classCreatedAt)});`,
          );

          const examId = `community-exam-${school.code}-${subject.code}-${grade}`;
          const examCreatedAt = nextTimestamp();
          const status = grade === 10 ? "CLOSED" : "PUBLISHED";
          statements.push(
            `INSERT OR IGNORE INTO exams (id, class_id, is_template, source_exam_id, title, description, mode, status, duration_minutes, started_at, ends_at, created_by_id, scheduled_for, shuffle_questions, shuffle_answers, generation_mode, rules_json, passing_criteria_type, passing_threshold, created_at) VALUES (${sqlString(
              examId,
            )}, ${sqlString(classId)}, 0, NULL, ${sqlString(
              `${school.name} · ${subject.name} · ${grade}-р ангийн түвшин тогтоох сорил`,
            )}, ${sqlString(
              `${subject.name}ийн community analytics-д зориулсан mock шалгалт`,
            )}, 'SCHEDULED', ${sqlString(status)}, 45, ${sqlString(
              examCreatedAt,
            )}, ${sqlString(
              new Date(Date.parse(examCreatedAt) + 45 * 60 * 1000).toISOString(),
            )}, ${sqlString(teacherId)}, ${sqlString(
              examCreatedAt,
            )}, 0, 0, 'MANUAL', '[]', 'PERCENTAGE', 40, ${sqlString(examCreatedAt)});`,
          );

          [1, 3, 4, 5].forEach((questionOrdinal, index) => {
            statements.push(
              `INSERT OR IGNORE INTO exam_questions (id, exam_id, question_id, points, display_order) VALUES (${sqlString(
                `${examId}-eq-${index + 1}`,
              )}, ${sqlString(examId)}, ${sqlString(
                `${bankId}-q${questionOrdinal}`,
              )}, 25, ${index + 1});`,
            );
          });

          const attemptCount = 4 + ((grade + schoolIndex + subjectIndex) % 5);
          for (let attemptIndex = 0; attemptIndex < attemptCount; attemptIndex += 1) {
            const studentId = `user_student_${String(
              ((studentOffset + attemptIndex - 1) % 104) + 1,
            ).padStart(3, "0")}`;
            const attemptId = `${examId}-attempt-${attemptIndex + 1}`;
            const startedAt = nextTimestamp();
            const submittedAt = new Date(
              Date.parse(startedAt) + 18 * 60 * 1000,
            ).toISOString();
            const answerScores = [
              attemptIndex % 5 === 0 ? 0 : 25,
              attemptIndex % 2 === 0 ? 25 : 0,
              attemptIndex % 3 === 0 ? 25 : 0,
              attemptIndex % 4 === 0 ? 25 : 0,
            ];
            const totalScore = answerScores.reduce((sum, score) => sum + score, 0);
            statements.push(
              `INSERT OR IGNORE INTO attempts (id, exam_id, student_id, status, auto_score, manual_score, total_score, generation_seed, started_at, submitted_at) VALUES (${sqlString(
                attemptId,
              )}, ${sqlString(examId)}, ${sqlString(
                studentId,
              )}, 'SUBMITTED', ${totalScore}, 0, ${totalScore}, NULL, ${sqlString(
                startedAt,
              )}, ${sqlString(submittedAt)});`,
            );

            [1, 3, 4, 5].forEach((questionOrdinal, answerIndex) => {
              const answerId = `${attemptId}-answer-${answerIndex + 1}`;
              const questionId = `${bankId}-q${questionOrdinal}`;
              const score = answerScores[answerIndex] ?? 0;
              const value =
                questionOrdinal === 4
                  ? score > 0
                    ? `${topic}-${grade}`
                    : "алдаатай"
                  : score > 0
                    ? questionOrdinal === 5
                      ? `${subject.name}-${topic}-${grade}-5-C`
                      : `${subject.name}-${topic}-${grade}-${questionOrdinal}-B`
                    : "Буруу";

              statements.push(
                `INSERT OR IGNORE INTO answers (id, attempt_id, question_id, value, auto_score, manual_score, feedback, created_at) VALUES (${sqlString(
                  answerId,
                )}, ${sqlString(attemptId)}, ${sqlString(
                  questionId,
                )}, ${sqlString(value)}, ${score}, NULL, ${sqlNullable(
                  score > 0 ? null : "Дахин давтаарай.",
                )}, ${sqlString(submittedAt)});`,
              );
            });
          }

          studentOffset += attemptCount;
        }
      }
    });
  });

  return `${statements.join("\n")}\n`;
};

const main = () => {
  const sql = buildSql();
  const sqlPath = join(tmpdir(), `pinequest-community-mvp-${Date.now()}.sql`);
  writeFileSync(sqlPath, sql, "utf8");

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

  console.log(`Community MVP mock data seeded for env: ${targetEnv}`);
};

main();
