import { all, first, type D1DatabaseLike } from "../lib/d1";
import { getClassSelectFields } from "./class-schema";
import { createClassAnalytics } from "./modules/classes";
import { closeExpiredExams } from "./modules/exams";
import type {
  AnswerRow,
  AttemptRow,
  ClassRow,
  ExamGenerationRule,
  ExamQuestionRow,
  ExamRow,
  QuestionBankRow,
  QuestionRow,
  UserRow,
} from "./types";
import { parseJsonArray } from "./types";

type MapperDependencies = {
  db: D1DatabaseLike;
  findClass: (db: D1DatabaseLike, id: string) => Promise<ClassRow>;
  findExam: (db: D1DatabaseLike, id: string) => Promise<ExamRow>;
  findQuestion: (db: D1DatabaseLike, id: string) => Promise<QuestionRow>;
  findQuestionBank: (db: D1DatabaseLike, id: string) => Promise<QuestionBankRow>;
  findUser: (db: D1DatabaseLike, id: string) => Promise<UserRow>;
};

const createPlaceholders = (count: number) =>
  Array.from({ length: count }, () => "?").join(", ");

const D1_SAFE_IN_CHUNK = 50;

const chunkArray = <T,>(items: T[], chunkSize: number) => {
  const chunks: T[][] = [];
  for (let index = 0; index < items.length; index += chunkSize) {
    chunks.push(items.slice(index, index + chunkSize));
  }
  return chunks;
};

const scheduleMicrotask = (work: () => Promise<void>) => {
  void Promise.resolve().then(work);
};

const createRequiredBatchLoader = <Key extends string, Value>(
  loadMany: (keys: Key[]) => Promise<Map<Key, Value>>,
  buildMissingError: (key: Key) => Error,
) => {
  const cache = new Map<Key, Promise<Value>>();
  let pendingKeys = new Set<Key>();
  let pendingResolvers = new Map<
    Key,
    Array<{
      resolve: (value: Value) => void;
      reject: (error: unknown) => void;
    }>
  >();
  let isScheduled = false;

  const flush = async () => {
    isScheduled = false;
    const keys = [...pendingKeys];
    pendingKeys = new Set<Key>();
    const resolvers = pendingResolvers;
    pendingResolvers = new Map();

    try {
      const rowsByKey = await loadMany(keys);
      for (const key of keys) {
        const listeners = resolvers.get(key) ?? [];
        const value = rowsByKey.get(key);

        if (value === undefined) {
          const error = buildMissingError(key);
          cache.delete(key);
          listeners.forEach(({ reject }) => reject(error));
          continue;
        }

        listeners.forEach(({ resolve }) => resolve(value));
      }
    } catch (error) {
      for (const key of keys) {
        cache.delete(key);
      }
      for (const listeners of resolvers.values()) {
        listeners.forEach(({ reject }) => reject(error));
      }
    }
  };

  return {
    load: (key: Key) => {
      const cached = cache.get(key);
      if (cached) {
        return cached;
      }

      const promise = new Promise<Value>((resolve, reject) => {
        const listeners = pendingResolvers.get(key);
        if (listeners) {
          listeners.push({ resolve, reject });
        } else {
          pendingResolvers.set(key, [{ resolve, reject }]);
        }
        pendingKeys.add(key);
        if (!isScheduled) {
          isScheduled = true;
          scheduleMicrotask(flush);
        }
      });

      cache.set(key, promise);
      return promise;
    },
  };
};

const createGroupedBatchLoader = <Key extends string, Value>(
  loadMany: (keys: Key[]) => Promise<Map<Key, Value[]>>,
) => {
  const cache = new Map<Key, Promise<Value[]>>();
  let pendingKeys = new Set<Key>();
  let pendingResolvers = new Map<
    Key,
    Array<{
      resolve: (value: Value[]) => void;
      reject: (error: unknown) => void;
    }>
  >();
  let isScheduled = false;

  const flush = async () => {
    isScheduled = false;
    const keys = [...pendingKeys];
    pendingKeys = new Set<Key>();
    const resolvers = pendingResolvers;
    pendingResolvers = new Map();

    try {
      const rowsByKey = await loadMany(keys);
      for (const key of keys) {
        const listeners = resolvers.get(key) ?? [];
        const rows = rowsByKey.get(key) ?? [];
        listeners.forEach(({ resolve }) => resolve(rows));
      }
    } catch (error) {
      for (const key of keys) {
        cache.delete(key);
      }
      for (const listeners of resolvers.values()) {
        listeners.forEach(({ reject }) => reject(error));
      }
    }
  };

  return {
    load: (key: Key) => {
      const cached = cache.get(key);
      if (cached) {
        return cached;
      }

      const promise = new Promise<Value[]>((resolve, reject) => {
        const listeners = pendingResolvers.get(key);
        if (listeners) {
          listeners.push({ resolve, reject });
        } else {
          pendingResolvers.set(key, [{ resolve, reject }]);
        }
        pendingKeys.add(key);
        if (!isScheduled) {
          isScheduled = true;
          scheduleMicrotask(flush);
        }
      });

      cache.set(key, promise);
      return promise;
    },
  };
};

export const createEntityMappers = ({
  db, findClass, findExam, findQuestion, findQuestionBank, findUser,
}: MapperDependencies) => {
  const loadUsersById = createRequiredBatchLoader<string, UserRow>(
    async (ids) => {
      if (ids.length === 0) {
        return new Map();
      }

      const rows = await all<UserRow>(
        db,
        `SELECT id, full_name, email, role, created_at
         FROM users
         WHERE id IN (${createPlaceholders(ids.length)})`,
        ids,
      );
      return new Map(rows.map((row) => [row.id, row]));
    },
    (id) => new Error(`User ${id} not found`),
  );

  const loadClassesById = createRequiredBatchLoader<string, ClassRow>(
    async (ids) => {
      if (ids.length === 0) {
        return new Map();
      }

      const classSelectFields = await getClassSelectFields(db);
      const rows = await all<ClassRow>(
        db,
        `SELECT ${classSelectFields}
         FROM classes
         WHERE id IN (${createPlaceholders(ids.length)})`,
        ids,
      );
      return new Map(rows.map((row) => [row.id, row]));
    },
    (id) => new Error(`Class ${id} not found`),
  );

  const loadExamsById = createRequiredBatchLoader<string, ExamRow>(
    async (ids) => {
      if (ids.length === 0) {
        return new Map();
      }

      const rows = await all<ExamRow>(
        db,
        `SELECT id, class_id, is_template, source_exam_id, title, description, mode, status, duration_minutes, started_at, ends_at, created_by_id, scheduled_for, shuffle_questions, shuffle_answers, generation_mode, rules_json, passing_criteria_type, passing_threshold, created_at
         FROM exams
         WHERE id IN (${createPlaceholders(ids.length)})`,
        ids,
      );
      return new Map(rows.map((row) => [row.id, row]));
    },
    (id) => new Error(`Exam ${id} not found`),
  );

  const loadQuestionBanksById = createRequiredBatchLoader<string, QuestionBankRow>(
    async (ids) => {
      if (ids.length === 0) {
        return new Map();
      }

      const rows: QuestionBankRow[] = [];
      for (const idChunk of chunkArray(ids, D1_SAFE_IN_CHUNK)) {
        rows.push(
          ...(await all<QuestionBankRow>(
            db,
            `SELECT id, title, description, grade, subject, topic, visibility, owner_id, created_at
             FROM question_banks
             WHERE id IN (${createPlaceholders(idChunk.length)})`,
            idChunk,
          )),
        );
      }
      return new Map(rows.map((row) => [row.id, row]));
    },
    (id) => new Error(`Question bank ${id} not found`),
  );

  const loadQuestionsById = createRequiredBatchLoader<string, QuestionRow>(
    async (ids) => {
      if (ids.length === 0) {
        return new Map();
      }

      const rows = await all<QuestionRow>(
        db,
        `SELECT
          id,
          bank_id,
          canonical_question_id,
          forked_from_question_id,
          type,
          title,
          prompt,
          options_json,
          correct_answer,
          difficulty,
          share_scope,
          requires_access_request,
          tags_json,
          created_by_id,
          created_at
         FROM questions
         WHERE id IN (${createPlaceholders(ids.length)})`,
        ids,
      );
      return new Map(rows.map((row) => [row.id, row]));
    },
    (id) => new Error(`Question ${id} not found`),
  );

  const loadQuestionsByBankId = createGroupedBatchLoader<string, QuestionRow>(
    async (bankIds) => {
      if (bankIds.length === 0) {
        return new Map();
      }

      const rows = await all<QuestionRow>(
        db,
        `SELECT
          id,
          bank_id,
          canonical_question_id,
          forked_from_question_id,
          type,
          title,
          prompt,
          options_json,
          correct_answer,
          difficulty,
          share_scope,
          requires_access_request,
          tags_json,
          created_by_id,
          created_at
         FROM questions
         WHERE bank_id IN (${createPlaceholders(bankIds.length)})
         ORDER BY created_at DESC`,
        bankIds,
      );

      const rowsByBankId = new Map<string, QuestionRow[]>();
      for (const row of rows) {
        const items = rowsByBankId.get(row.bank_id);
        if (items) {
          items.push(row);
        } else {
          rowsByBankId.set(row.bank_id, [row]);
        }
      }

      return rowsByBankId;
    },
  );

  const loadQuestionCountsByBankId = createGroupedBatchLoader<string, { count: number }>(
    async (bankIds) => {
      if (bankIds.length === 0) {
        return new Map();
      }

      const rows = await all<{ bank_id: string; count: number | null }>(
        db,
        `SELECT bank_id, COUNT(*) AS count
         FROM questions
         WHERE bank_id IN (${createPlaceholders(bankIds.length)})
         GROUP BY bank_id`,
        bankIds,
      );

      const rowsByBankId = new Map<string, Array<{ count: number }>>();
      for (const row of rows) {
        rowsByBankId.set(row.bank_id, [{ count: row.count ?? 0 }]);
      }

      return rowsByBankId;
    },
  );

  const loadExamQuestionsByExamId = createGroupedBatchLoader<string, ExamQuestionRow>(
    async (examIds) => {
      if (examIds.length === 0) {
        return new Map();
      }

      const rows = await all<ExamQuestionRow>(
        db,
        `SELECT id, exam_id, question_id, points, display_order
         FROM exam_questions
         WHERE exam_id IN (${createPlaceholders(examIds.length)})
         ORDER BY exam_id ASC, display_order ASC`,
        examIds,
      );

      const rowsByExamId = new Map<string, ExamQuestionRow[]>();
      for (const row of rows) {
        const items = rowsByExamId.get(row.exam_id);
        if (items) {
          items.push(row);
        } else {
          rowsByExamId.set(row.exam_id, [row]);
        }
      }

      return rowsByExamId;
    },
  );

  const loadAttemptsByExamId = createGroupedBatchLoader<string, AttemptRow>(
    async (examIds) => {
      if (examIds.length === 0) {
        return new Map();
      }

      const rows = await all<AttemptRow>(
        db,
        `SELECT id, exam_id, student_id, status, auto_score, manual_score, total_score, generation_seed, started_at, submitted_at
         FROM attempts
         WHERE exam_id IN (${createPlaceholders(examIds.length)})
         ORDER BY exam_id ASC, started_at DESC`,
        examIds,
      );

      const rowsByExamId = new Map<string, AttemptRow[]>();
      for (const row of rows) {
        const items = rowsByExamId.get(row.exam_id);
        if (items) {
          items.push(row);
        } else {
          rowsByExamId.set(row.exam_id, [row]);
        }
      }

      return rowsByExamId;
    },
  );

  const loadAnswersByAttemptId = createGroupedBatchLoader<string, AnswerRow>(
    async (attemptIds) => {
      if (attemptIds.length === 0) {
        return new Map();
      }

      const rows = await all<AnswerRow>(
        db,
        `SELECT id, attempt_id, question_id, value, auto_score, manual_score, feedback, created_at
         FROM answers
         WHERE attempt_id IN (${createPlaceholders(attemptIds.length)})
         ORDER BY attempt_id ASC, created_at ASC`,
        attemptIds,
      );

      const rowsByAttemptId = new Map<string, AnswerRow[]>();
      for (const row of rows) {
        const items = rowsByAttemptId.get(row.attempt_id);
        if (items) {
          items.push(row);
        } else {
          rowsByAttemptId.set(row.attempt_id, [row]);
        }
      }

      return rowsByAttemptId;
    },
  );

  const parseExamRules = (value: string): ExamGenerationRule[] => {
    try {
      const parsed = JSON.parse(value) as unknown;
      if (!Array.isArray(parsed)) {
        return [];
      }
      const normalizedRules = parsed
        .map((entry): ExamGenerationRule | null => {
          if (!entry || typeof entry !== "object") {
            return null;
          }
          const candidate = entry as {
            label?: unknown;
            bankIds?: unknown;
            difficulty?: unknown;
            count?: unknown;
            points?: unknown;
          };
          if (
            typeof candidate.label !== "string" ||
            !Array.isArray(candidate.bankIds) ||
            !candidate.bankIds.every((item) => typeof item === "string") ||
            typeof candidate.count !== "number" ||
            typeof candidate.points !== "number"
          ) {
            return null;
          }
          return {
            label: candidate.label,
            bankIds: candidate.bankIds,
            difficulty:
              candidate.difficulty === "EASY" ||
              candidate.difficulty === "MEDIUM" ||
              candidate.difficulty === "HARD"
                ? candidate.difficulty
                : null,
            count: candidate.count,
            points: candidate.points,
          };
        });
      return normalizedRules.filter(
        (rule): rule is ExamGenerationRule => rule !== null,
      );
    } catch {
      return [];
    }
  };

  const deriveBankTopics = async (bank: QuestionBankRow): Promise<string[]> => {
    if (bank.topic !== "Ерөнхий") {
      return [bank.topic];
    }

    const rows = await loadQuestionsByBankId.load(bank.id);

    return [...new Set(
      rows
        .flatMap((row) => parseJsonArray(row.tags_json))
        .filter((tag) => tag && tag !== bank.subject && !tag.includes("анги")),
    )];
  };

  const toUser = (user: UserRow) => ({
    id: user.id,
    fullName: user.full_name,
    email: user.email,
    role: user.role,
    createdAt: user.created_at,
    classes: async () => {
      const classSelectFields = await getClassSelectFields(db, "c.");
      return (
        await all<ClassRow>(
          db,
          `SELECT DISTINCT ${classSelectFields}
           FROM classes c
           LEFT JOIN class_students cs ON cs.class_id = c.id
           WHERE c.teacher_id = ? OR cs.student_id = ?
           ORDER BY c.created_at DESC`,
          [user.id, user.id],
        )
      ).map(toClass);
    },
  });

  const toClass = (classroom: ClassRow) => ({
    id: classroom.id,
    name: classroom.name,
    description: classroom.description,
    createdAt: classroom.created_at,
    teacher: async () => toUser(await loadUsersById.load(classroom.teacher_id)),
    students: async () =>
      (
        await all<UserRow>(
          db,
          `SELECT u.id, u.full_name, u.email, u.role, u.created_at
           FROM class_students cs JOIN users u ON u.id = cs.student_id
           WHERE cs.class_id = ? ORDER BY u.created_at ASC`,
          [classroom.id],
        )
      ).map(toUser),
    exams: async () =>
      (
        await closeExpiredExams(db),
        await all<ExamRow>(
          db,
          `SELECT id, class_id, is_template, source_exam_id, title, description, mode, status, duration_minutes, started_at, ends_at, created_by_id, scheduled_for, shuffle_questions, shuffle_answers, generation_mode, rules_json, passing_criteria_type, passing_threshold, created_at
           FROM exams
           WHERE class_id = ? AND COALESCE(is_template, 0) = 0
           ORDER BY created_at DESC`,
          [classroom.id],
        )
      ).map(toExam),
    ...createClassAnalytics({ db, classroom, findExam, findUser, toExam: (_, exam) => toExam(exam), toUser: (_, user) => toUser(user) }),
  });

  const toQuestionBank = (bank: QuestionBankRow) => ({
    id: bank.id,
    title: bank.title,
    description: bank.description,
    grade: bank.grade,
    subject: bank.subject,
    topic: bank.topic,
    topics: async () => deriveBankTopics(bank),
    visibility: bank.visibility,
    createdAt: bank.created_at,
    questionCount: async () =>
      (await loadQuestionCountsByBankId.load(bank.id))[0]?.count ?? 0,
    owner: async () => toUser(await loadUsersById.load(bank.owner_id)),
    questions: async () => (await loadQuestionsByBankId.load(bank.id)).map(toQuestion),
  });

  const toQuestion = (question: QuestionRow) => ({
    id: question.id,
    type: question.type,
    canonicalQuestionId: question.canonical_question_id,
    forkedFromQuestionId: question.forked_from_question_id,
    title: question.title,
    prompt: question.prompt,
    options: parseJsonArray(question.options_json),
    correctAnswer: question.correct_answer,
    difficulty: question.difficulty,
    shareScope: question.share_scope,
    requiresAccessRequest: question.requires_access_request === 1,
    tags: parseJsonArray(question.tags_json),
    createdAt: question.created_at,
    bank: async () => toQuestionBank(await loadQuestionBanksById.load(question.bank_id)),
    createdBy: async () => toUser(await loadUsersById.load(question.created_by_id)),
  });

  const toExamQuestion = (examQuestion: ExamQuestionRow) => ({
    id: examQuestion.id,
    points: examQuestion.points,
    order: examQuestion.display_order,
    question: async () => toQuestion(await loadQuestionsById.load(examQuestion.question_id)),
  });

  const toAnswer = (answer: AnswerRow) => ({
    id: answer.id,
    value: answer.value,
    autoScore: answer.auto_score,
    manualScore: answer.manual_score,
    feedback: answer.feedback,
    createdAt: answer.created_at,
    question: async () => toQuestion(await loadQuestionsById.load(answer.question_id)),
  });

  const toAttempt = (attempt: AttemptRow) => ({
    id: attempt.id,
    status: attempt.status,
    autoScore: attempt.auto_score,
    manualScore: attempt.manual_score,
    totalScore: attempt.total_score,
    generationSeed: attempt.generation_seed,
    startedAt: attempt.started_at,
    submittedAt: attempt.submitted_at,
    exam: async () => toExam(await loadExamsById.load(attempt.exam_id)),
    student: async () => toUser(await loadUsersById.load(attempt.student_id)),
    answers: async () => (await loadAnswersByAttemptId.load(attempt.id)).map(toAnswer),
  });

  const toExam = (exam: ExamRow) => ({
    id: exam.id,
    isTemplate: Boolean(exam.is_template),
    sourceExamId: exam.source_exam_id,
    title: exam.title,
    description: exam.description,
    mode: exam.mode,
    status: exam.status,
    durationMinutes: exam.duration_minutes,
    startedAt: exam.started_at,
    endsAt: exam.ends_at,
    scheduledFor: exam.scheduled_for,
    shuffleQuestions: Boolean(exam.shuffle_questions),
    shuffleAnswers: Boolean(exam.shuffle_answers),
    generationMode: exam.generation_mode,
    generationRules: parseExamRules(exam.rules_json),
    passingCriteriaType: exam.passing_criteria_type,
    passingThreshold: exam.passing_threshold,
    createdAt: exam.created_at,
    class: async () => toClass(await loadClassesById.load(exam.class_id)),
    questions: async () => (await loadExamQuestionsByExamId.load(exam.id)).map(toExamQuestion),
    createdBy: async () => toUser(await loadUsersById.load(exam.created_by_id)),
    attempts: async () => (await loadAttemptsByExamId.load(exam.id)).map(toAttempt),
  });

  return { toAnswer, toAttempt, toClass, toExam, toExamQuestion, toQuestion, toQuestionBank, toUser };
};
