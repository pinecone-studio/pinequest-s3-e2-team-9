import { all, first, type D1DatabaseLike } from "../lib/d1";
import { requireActor, type RequestContext } from "../auth";
import { getClassSelectFields, insertClassRow } from "./class-schema";
import { createAttemptMutations } from "./modules/attempts";
import { closeExpiredExams, createExamQueriesAndMutations, findExamById } from "./modules/exams";
import { createDashboardOverviewQuery } from "./modules/dashboard";
import { createImportQueriesAndMutations } from "./modules/imports";
import {
  publishLiveExamEvent,
  publishQuestionBankEvent,
  type LiveExamEventsEnv,
} from "../live-exam-events";
import {
  createQuestionQueriesAndMutations,
  findQuestionBankById,
  findQuestionById,
} from "./modules/questions";
import { findClass, findUser } from "./root-lookups";
import { createEntityMappers } from "./root-mappers";
import { makeId, now, type AttemptRow, type ByIdArgs, type ClassRow, type CreateClassArgs, type HelloArgs, type UserRow } from "./types";

type CreateRootValueArgs = {
  db: D1DatabaseLike;
  env: LiveExamEventsEnv;
};

export const createRootValue = ({ db, env }: CreateRootValueArgs) => {
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
    me: async (_args: unknown, context: RequestContext) => {
      const actor = await requireActor(context, ["ADMIN", "TEACHER", "STUDENT"]);
      return toUser(actor);
    },
    users: async (_args: unknown, context: RequestContext) => {
      await requireActor(context, ["ADMIN"]);
      return (
        await all<UserRow>(
          db,
          "SELECT id, full_name, email, role, created_at FROM users ORDER BY created_at ASC",
        )
      ).map(toUser);
    },
    classes: async (_args: unknown, context: RequestContext) => {
      await closeExpiredExams(db);
      const actor = await requireActor(context, ["ADMIN", "TEACHER", "STUDENT"]);
      const classSelectFields = await getClassSelectFields(db, "c.");
      const rows =
        actor.role === "ADMIN"
          ? await all<ClassRow>(
              db,
              `SELECT ${classSelectFields}
               FROM classes c
               ORDER BY c.created_at DESC`,
            )
          : actor.role === "TEACHER"
            ? await all<ClassRow>(
                db,
                `SELECT ${classSelectFields}
                 FROM classes c
                 WHERE c.teacher_id = ?
                 ORDER BY c.created_at DESC`,
                [actor.id],
              )
            : await all<ClassRow>(
                db,
                `SELECT DISTINCT ${classSelectFields}
                 FROM classes c
                 JOIN class_students cs ON cs.class_id = c.id
                 WHERE cs.student_id = ?
                 ORDER BY c.created_at DESC`,
                [actor.id],
              );
      return rows.map(toClass);
    },
    class: async ({ id }: ByIdArgs, context: RequestContext) => {
      await closeExpiredExams(db);
      const actor = await requireActor(context, ["ADMIN", "TEACHER", "STUDENT"]);
      const classSelectFields = await getClassSelectFields(db, "c.");
      const classroom =
        actor.role === "ADMIN"
          ? await first<ClassRow>(
              db,
              `SELECT ${classSelectFields} FROM classes c WHERE c.id = ?`,
              [id],
            )
          : actor.role === "TEACHER"
            ? await first<ClassRow>(
                db,
                `SELECT ${classSelectFields}
                 FROM classes c
                 WHERE c.id = ? AND c.teacher_id = ?`,
                [id, actor.id],
              )
            : await first<ClassRow>(
                db,
                `SELECT ${classSelectFields}
                 FROM classes c
                 JOIN class_students cs ON cs.class_id = c.id
                 WHERE c.id = ? AND cs.student_id = ?`,
                [id, actor.id],
              );
      return classroom ? toClass(classroom) : null;
    },
    attempts: async (_args: unknown, context: RequestContext) => {
      const actor = await requireActor(context, ["ADMIN", "TEACHER", "STUDENT"]);
      const rows =
        actor.role === "ADMIN"
          ? await all<AttemptRow>(
              db,
              `SELECT id, exam_id, student_id, status, auto_score, manual_score, total_score, generation_seed, started_at, submitted_at
               FROM attempts
               ORDER BY started_at DESC`,
            )
          : actor.role === "TEACHER"
            ? await all<AttemptRow>(
                db,
                `SELECT
                  a.id,
                  a.exam_id,
                  a.student_id,
                  a.status,
                  a.auto_score,
                  a.manual_score,
                  a.total_score,
                  a.generation_seed,
                  a.started_at,
                  a.submitted_at
                 FROM attempts a
                 JOIN exams e ON e.id = a.exam_id
                 JOIN classes c ON c.id = e.class_id
                 WHERE c.teacher_id = ?
                 ORDER BY a.started_at DESC`,
                [actor.id],
              )
            : await all<AttemptRow>(
                db,
                `SELECT id, exam_id, student_id, status, auto_score, manual_score, total_score, generation_seed, started_at, submitted_at
                 FROM attempts
                 WHERE student_id = ?
                 ORDER BY started_at DESC`,
                [actor.id],
              );
      return rows.map(toAttempt);
    },
    attempt: async ({ id }: ByIdArgs, context: RequestContext) => {
      const actor = await requireActor(context, ["ADMIN", "TEACHER", "STUDENT"]);
      const attempt =
        actor.role === "ADMIN"
          ? await first<AttemptRow>(
              db,
              `SELECT id, exam_id, student_id, status, auto_score, manual_score, total_score, generation_seed, started_at, submitted_at
               FROM attempts WHERE id = ?`,
              [id],
            )
          : actor.role === "TEACHER"
            ? await first<AttemptRow>(
                db,
                `SELECT
                  a.id,
                  a.exam_id,
                  a.student_id,
                  a.status,
                  a.auto_score,
                  a.manual_score,
                  a.total_score,
                  a.generation_seed,
                  a.started_at,
                  a.submitted_at
                 FROM attempts a
                 JOIN exams e ON e.id = a.exam_id
                 JOIN classes c ON c.id = e.class_id
                 WHERE a.id = ? AND c.teacher_id = ?`,
                [id, actor.id],
              )
            : await first<AttemptRow>(
                db,
                `SELECT id, exam_id, student_id, status, auto_score, manual_score, total_score, generation_seed, started_at, submitted_at
                 FROM attempts
                 WHERE id = ? AND student_id = ?`,
                [id, actor.id],
              );
      return attempt ? toAttempt(attempt) : null;
    },
    ...createDashboardOverviewQuery({ db, requireActor }),
    createClass: async (
      { name, description }: CreateClassArgs,
      context: RequestContext,
    ) => {
      const actor = await requireActor(context, ["ADMIN", "TEACHER"]);
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
    ...createAttemptMutations({
      db,
      requireActor,
      findExam: findExamById,
      findUser,
      findQuestion: findQuestionById,
      publishLiveEvent: async (event) => publishLiveExamEvent(env, event),
      toAttempt: (_, attempt) => toAttempt(attempt),
    }),
    ...createExamQueriesAndMutations({
      db,
      requireActor,
      findClass,
      findQuestion: findQuestionById,
      publishLiveEvent: async (event) => publishLiveExamEvent(env, event),
      toExam: (_, exam) => toExam(exam),
    }),
    ...createQuestionQueriesAndMutations({
      db,
      requireActor,
      publishQuestionBankEvent: async (event) => publishQuestionBankEvent(env, event),
      toQuestionBank: (_, bank) => toQuestionBank(bank),
      toQuestion: (_, question) => toQuestion(question),
    }),
    ...createImportQueriesAndMutations({
      db,
      requireActor,
      findClass,
      findExam: findExamById,
      findQuestionBank: findQuestionBankById,
      findUser,
      toExam: (_, exam) => toExam(exam),
      toQuestionBank: (_, bank) => toQuestionBank(bank),
      toUser,
    }),
  };
};
