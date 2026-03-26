import { all, first, type D1DatabaseLike } from "../lib/d1";
import { getClassSelectFields, insertClassRow } from "./class-schema";
import { createAttemptMutations } from "./modules/attempts";
import { closeExpiredExams, createExamQueriesAndMutations, findExamById } from "./modules/exams";
import { createDashboardOverviewQuery } from "./modules/dashboard";
import {
  createQuestionQueriesAndMutations,
  findQuestionBankById,
  findQuestionById,
} from "./modules/questions";
import { findActor, findClass, findUser, requireActor } from "./root-lookups";
import { createEntityMappers } from "./root-mappers";
import { makeId, now, type AttemptRow, type ByIdArgs, type ClassRow, type CreateClassArgs, type HelloArgs, type UserRow } from "./types";

export const createRootValue = (db: D1DatabaseLike) => {
  const { toAttempt, toClass, toExam, toQuestion, toQuestionBank, toUser } =
    createEntityMappers({
      db,
      findClass,
      findExam: findExamById,
      findQuestion: findQuestionById,
      findQuestionBank: findQuestionBankById,
      findUser,
    });

  return {
    health: () => ({ ok: true, service: "pinequest-api", runtime: "cloudflare-workers-d1" }),
    hello: ({ name }: HelloArgs) => ({ message: `Hello, ${name?.trim() || "world"}!` }),
    me: async () => {
      const actor = await findActor(db);
      return actor ? toUser(actor) : null;
    },
    users: async () =>
      (
        await all<UserRow>(
          db,
          "SELECT id, full_name, email, role, created_at FROM users ORDER BY created_at ASC",
        )
      ).map(toUser),
    classes: async () => {
      await closeExpiredExams(db);
      const classSelectFields = await getClassSelectFields(db);
      return (
        await all<ClassRow>(
          db,
          `SELECT ${classSelectFields}
           FROM classes ORDER BY created_at DESC`,
        )
      ).map(toClass);
    },
    class: async ({ id }: ByIdArgs) => {
      await closeExpiredExams(db);
      const classSelectFields = await getClassSelectFields(db);
      const classroom = await first<ClassRow>(
        db,
        `SELECT ${classSelectFields} FROM classes WHERE id = ?`,
        [id],
      );
      return classroom ? toClass(classroom) : null;
    },
    attempts: async () =>
      (
        await all<AttemptRow>(
          db,
          `SELECT id, exam_id, student_id, status, auto_score, manual_score, total_score, started_at, submitted_at
           FROM attempts ORDER BY started_at DESC`,
        )
      ).map(toAttempt),
    attempt: async ({ id }: ByIdArgs) => {
      const attempt = await first<AttemptRow>(
        db,
        `SELECT id, exam_id, student_id, status, auto_score, manual_score, total_score, started_at, submitted_at
         FROM attempts WHERE id = ?`,
        [id],
      );
      return attempt ? toAttempt(attempt) : null;
    },
    ...createDashboardOverviewQuery(db),
    createClass: async ({ name, description }: CreateClassArgs) => {
      const actor = await requireActor(db, ["ADMIN", "TEACHER"]);
      const id = makeId("class");
      await insertClassRow(db, {
        id,
        name,
        description: description ?? null,
        subject: "Ерөнхий",
        grade: 0,
        teacherId: actor.id,
        createdAt: now(),
      });
      return toClass(await findClass(db, id));
    },
    ...createAttemptMutations({ db, findExam: findExamById, findUser, findQuestion: findQuestionById, toAttempt: (_, attempt) => toAttempt(attempt) }),
    ...createExamQueriesAndMutations({ db, requireActor, findClass, findQuestion: findQuestionById, toExam: (_, exam) => toExam(exam) }),
    ...createQuestionQueriesAndMutations({ db, requireActor, toQuestionBank: (_, bank) => toQuestionBank(bank), toQuestion: (_, question) => toQuestion(question) }),
  };
};
