import { all, first, invariant, run, type D1DatabaseLike } from "../../lib/d1";
import type { RequestContext } from "../../auth";
import type { QuestionBankMutationEvent } from "../../live-exam-events";
import {
  type ForkQuestionToMyBankArgs,
  type CreateExamDraftVariantsArgs,
  type CreateQuestionVariantsArgs,
  type DeleteQuestionArgs,
  type GroupQuestionsAsVariantsArgs,
  makeId,
  now,
  parseJsonArray,
  toJsonArray,
  type ByIdArgs,
  type CreateQuestionArgs,
  type CreateQuestionBankArgs,
  type QuestionAccessRequestRow,
  type QuestionBankRow,
  type QuestionBanksArgs,
  type QuestionRepositoryFilter,
  type QuestionRepositoryKind,
  type QuestionShareScope,
  type QuestionRow,
  type QuestionsArgs,
  type RequestQuestionAccessArgs,
  type ReviewQuestionAccessRequestArgs,
  type Role,
  type UpdateQuestionArgs,
  type UserRow,
} from "../types";

const fullQuestionSelectFields = `id,
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
  created_at`;

const legacyQuestionSelectFields = `id,
  bank_id,
  type,
  title,
  prompt,
  options_json,
  correct_answer,
  difficulty,
  tags_json,
  created_by_id,
  created_at`;

const isMissingQuestionSharingColumnError = (error: unknown) =>
  error instanceof Error &&
  /no such column: (?:[a-z_]+\.)?(canonical_question_id|forked_from_question_id|share_scope|requires_access_request)/i.test(
    error.message,
  );

const toCompatQuestionRow = (
  row: Omit<QuestionRow, "canonical_question_id" | "forked_from_question_id" | "share_scope" | "requires_access_request"> &
    Partial<
      Pick<
        QuestionRow,
        "canonical_question_id" | "forked_from_question_id" | "share_scope" | "requires_access_request"
      >
    >,
): QuestionRow => ({
  ...row,
  canonical_question_id: row.canonical_question_id ?? row.id,
  forked_from_question_id: row.forked_from_question_id ?? null,
  share_scope: row.share_scope ?? "PRIVATE",
  requires_access_request: row.requires_access_request ?? 0,
});

const allQuestionsCompat = async (
  db: D1DatabaseLike,
  fullSql: string,
  legacySql: string,
  params: unknown[],
) => {
  try {
    return await all<QuestionRow>(db, fullSql, params);
  } catch (error) {
    if (!isMissingQuestionSharingColumnError(error)) {
      throw error;
    }

    const legacyRows = await all<
      Omit<
        QuestionRow,
        "canonical_question_id" | "forked_from_question_id" | "share_scope" | "requires_access_request"
      >
    >(db, legacySql, params);

    return legacyRows.map((row) => toCompatQuestionRow(row));
  }
};

const firstQuestionCompat = async (
  db: D1DatabaseLike,
  fullSql: string,
  legacySql: string,
  params: unknown[],
) => {
  try {
    return await first<QuestionRow>(db, fullSql, params);
  } catch (error) {
    if (!isMissingQuestionSharingColumnError(error)) {
      throw error;
    }

    const legacyRow = await first<
      Omit<
        QuestionRow,
        "canonical_question_id" | "forked_from_question_id" | "share_scope" | "requires_access_request"
      >
    >(db, legacySql, params);

    return legacyRow ? toCompatQuestionRow(legacyRow) : null;
  }
};

export const findQuestionBankById = async (
  db: D1DatabaseLike,
  id: string,
): Promise<QuestionBankRow> => {
  const bank = await first<QuestionBankRow>(
    db,
    "SELECT id, title, description, grade, subject, topic, visibility, owner_id, created_at FROM question_banks WHERE id = ?",
    [id],
  );
  invariant(bank, `Question bank ${id} not found`);
  return bank;
};

const findUnifiedQuestionBankByScope = async (
  db: D1DatabaseLike,
  {
    grade,
    subject,
    topic,
  }: {
    grade: number;
    subject: string;
    topic: string;
  },
): Promise<QuestionBankRow | null> =>
  first<QuestionBankRow>(
    db,
    `SELECT id, title, description, grade, subject, topic, visibility, owner_id, created_at
     FROM question_banks
     WHERE visibility = 'PUBLIC'
       AND grade = ?
       AND subject = ?
       AND topic = ?
     ORDER BY created_at ASC
     LIMIT 1`,
    [grade, subject, topic],
  );

const findPrivateQuestionBankByScope = async (
  db: D1DatabaseLike,
  {
    ownerId,
    grade,
    subject,
    topic,
  }: {
    ownerId: string;
    grade: number;
    subject: string;
    topic: string;
  },
): Promise<QuestionBankRow | null> =>
  first<QuestionBankRow>(
    db,
    `SELECT id, title, description, grade, subject, topic, visibility, owner_id, created_at
     FROM question_banks
     WHERE visibility = 'PRIVATE'
       AND owner_id = ?
       AND grade = ?
       AND subject = ?
       AND topic = ?
     ORDER BY created_at ASC
     LIMIT 1`,
    [ownerId, grade, subject, topic],
  );

const ensureRepositoryQuestionBank = async ({
  actor,
  db,
  repositoryKind,
  bankId,
  grade,
  subject,
  topic,
}: {
  actor: UserRow;
  db: D1DatabaseLike;
  repositoryKind?: QuestionRepositoryKind;
  bankId?: string;
  grade?: number;
  subject?: string;
  topic?: string;
}): Promise<QuestionBankRow> => {
  if (bankId) {
    return findQuestionBankById(db, bankId);
  }

  const normalizedGrade = grade ?? 10;
  const normalizedSubject = subject?.trim() || "Ерөнхий";
  const normalizedTopic = topic?.trim() || "Ерөнхий";
  const nextRepositoryKind = repositoryKind ?? "MINE";

  if (nextRepositoryKind === "UNIFIED") {
    const existingUnifiedBank = await findUnifiedQuestionBankByScope(db, {
      grade: normalizedGrade,
      subject: normalizedSubject,
      topic: normalizedTopic,
    });
    if (existingUnifiedBank) {
      return existingUnifiedBank;
    }

    const id = makeId("bank");
    const createdAt = now();
    await run(
      db,
      `INSERT INTO question_banks (id, title, description, grade, subject, topic, visibility, owner_id, created_at)
       VALUES (?, ?, ?, ?, ?, ?, 'PUBLIC', ?, ?)`,
      [
        id,
        `${normalizedGrade}-р анги · ${normalizedSubject} · ${normalizedTopic}`,
        "Нэгдсэн санд автоматаар нэгтгэсэн сан.",
        normalizedGrade,
        normalizedSubject,
        normalizedTopic,
        actor.id,
        createdAt,
      ],
    );

    return findQuestionBankById(db, id);
  }

  const existingPrivateBank = await findPrivateQuestionBankByScope(db, {
    ownerId: actor.id,
    grade: normalizedGrade,
    subject: normalizedSubject,
    topic: normalizedTopic,
  });
  if (existingPrivateBank) {
    return existingPrivateBank;
  }

  const id = makeId("bank");
  const createdAt = now();
  await run(
    db,
    `INSERT INTO question_banks (id, title, description, grade, subject, topic, visibility, owner_id, created_at)
     VALUES (?, ?, ?, ?, ?, ?, 'PRIVATE', ?, ?)`,
    [
      id,
      `${normalizedGrade}-р анги · ${normalizedSubject} · ${normalizedTopic}`,
      "Миний санд автоматаар үүссэн сан.",
      normalizedGrade,
      normalizedSubject,
      normalizedTopic,
      actor.id,
      createdAt,
    ],
  );

  return findQuestionBankById(db, id);
};

export const findQuestionById = async (
  db: D1DatabaseLike,
  id: string,
): Promise<QuestionRow> => {
  const question = await firstQuestionCompat(
    db,
    `SELECT ${fullQuestionSelectFields}
     FROM questions
     WHERE id = ?`,
    `SELECT ${legacyQuestionSelectFields}
     FROM questions
     WHERE id = ?`,
    [id],
  );
  invariant(question, `Question ${id} not found`);
  return question;
};

const normalizeQuestionOptions = (
  type: QuestionRow["type"],
  options?: string[],
) =>
  type === "TRUE_FALSE" ? ["True", "False"] : type === "MCQ" ? options ?? [] : [];

const VARIANT_LABELS = ["A", "B", "C", "D"];
const VARIANT_GROUP_TAG = "variant_group:";
const VARIANT_LABEL_TAG = "variant_label:";
const VARIANT_COUNT_TAG = "variant_count:";
const DRAFT_VARIANT_TAG = "variant_draft:true";

const D1_SAFE_IN_CHUNK = 20;

const chunkArray = <T,>(items: T[], chunkSize: number) => {
  const chunks: T[][] = [];
  for (let index = 0; index < items.length; index += chunkSize) {
    chunks.push(items.slice(index, index + chunkSize));
  }
  return chunks;
};

const createPlaceholders = (count: number) =>
  Array.from({ length: count }, () => "?").join(", ");

const stripVariantTags = (tags: string[]) =>
  tags.filter(
    (tag) =>
      !tag.startsWith(VARIANT_GROUP_TAG) &&
      !tag.startsWith(VARIANT_LABEL_TAG) &&
      !tag.startsWith(VARIANT_COUNT_TAG),
  );

const isSystemQuestionTag = (tag: string) =>
  tag.startsWith(VARIANT_GROUP_TAG) ||
  tag.startsWith(VARIANT_LABEL_TAG) ||
  tag.startsWith(VARIANT_COUNT_TAG) ||
  tag === DRAFT_VARIANT_TAG ||
  tag.startsWith("forked_from_question:") ||
  tag.startsWith("forked_from_bank:");

const toVariantTags = (tags: string[], groupId: string, label: string, totalVariants: number) => [
  ...stripVariantTags(tags),
  `${VARIANT_GROUP_TAG}${groupId}`,
  `${VARIANT_LABEL_TAG}${label}`,
  `${VARIANT_COUNT_TAG}${totalVariants}`,
];

const toDraftVariantTags = (
  tags: string[],
  groupId: string,
  label: string,
  totalVariants: number,
) => [...toVariantTags(tags, groupId, label, totalVariants), DRAFT_VARIANT_TAG];

const toVariantTitle = (value: string, label: string) =>
  `${value.replace(/\s+\([A-D]\)$/u, "").trim()} (${label})`;

const transformNumericText = (value: string, offsetSeed: number) =>
  value.replace(/-?\d+(\.\d+)?/g, (match, _decimal, index) => {
    const parsed = Number(match);
    if (!Number.isFinite(parsed)) {
      return match;
    }
    const offset = offsetSeed + (typeof index === "number" ? index % 3 : 0);
    const nextValue = parsed + offset;
    return Number.isInteger(parsed) ? String(nextValue) : nextValue.toFixed(1);
  });

const buildVariantDraft = (
  question: QuestionRow,
  label: string,
  offsetSeed: number,
): {
  title: string;
  prompt: string;
  options: string[];
  correctAnswer: string | null;
} => {
  const originalOptions = parseJsonArray(question.options_json);
  const titleBase = question.title.trim() || question.prompt.trim();
  const nextPrompt = transformNumericText(question.prompt, offsetSeed);
  const nextOptions = originalOptions.map((option, optionIndex) =>
    transformNumericText(option, offsetSeed + optionIndex + 1),
  );
  const correctIndex = originalOptions.findIndex(
    (option) => option === (question.correct_answer ?? ""),
  );

  return {
    title: toVariantTitle(titleBase, label),
    prompt:
      nextPrompt && nextPrompt !== question.prompt
        ? nextPrompt
        : `${question.prompt} (${label})`,
    options: normalizeQuestionOptions(question.type, nextOptions),
    correctAnswer:
      correctIndex >= 0 && nextOptions[correctIndex]
        ? nextOptions[correctIndex]
        : question.correct_answer,
  };
};

const normalizeVariantSelection = (
  questions: QuestionRow[],
): Array<{
  question: QuestionRow;
  tags: string[];
}> => {
  invariant(
    questions.length === 2 || questions.length === 4,
    "Хувилбарын бүлэгт 2 эсвэл 4 асуулт сонгоно.",
  );

  const [firstQuestion] = questions;
  invariant(Boolean(firstQuestion), "Дор хаяж нэг асуулт сонгоно.");

  const uniqueQuestionIds = new Set(questions.map((question) => question.id));
  invariant(
    uniqueQuestionIds.size === questions.length,
    "Нэг асуултыг давхар сонгох боломжгүй.",
  );

  return questions.map((question) => {
    invariant(
      question.bank_id === firstQuestion.bank_id,
      "Хувилбарын бүлгийн асуултууд нэг сангаас байна.",
    );
    invariant(
      question.type === firstQuestion.type,
      "Хувилбарын бүлгийн бүх асуулт ижил төрөлтэй байна.",
    );

    return {
      question,
      tags: parseJsonArray(question.tags_json),
    };
  });
};

const questionBankSelectFields =
  "id, title, description, grade, subject, topic, visibility, owner_id, created_at";

const questionAccessRequestSelectFields = `id,
  question_id,
  requester_user_id,
  owner_user_id,
  status,
  created_at,
  reviewed_at`;

const isMissingQuestionAccessRequestsTableError = (error: unknown) =>
  error instanceof Error &&
  /no such table:\s*question_access_requests/i.test(error.message);

const findQuestionAccessRequestById = async (
  db: D1DatabaseLike,
  id: string,
): Promise<QuestionAccessRequestRow> => {
  const request = await first<QuestionAccessRequestRow>(
    db,
    `SELECT ${questionAccessRequestSelectFields}
     FROM question_access_requests
     WHERE id = ?`,
    [id],
  );
  invariant(request, `Question access request ${id} not found`);
  return request;
};

const actorHasApprovedQuestionAccess = async (
  db: D1DatabaseLike,
  questionId: string,
  actorId: string,
) => {
  try {
    const row = await first<{ id: string }>(
      db,
      `SELECT id
       FROM question_access_requests
       WHERE question_id = ?
         AND requester_user_id = ?
         AND status = 'APPROVED'
       ORDER BY reviewed_at DESC, created_at DESC
       LIMIT 1`,
      [questionId, actorId],
    );
  return Boolean(row);
  } catch (error) {
    if (isMissingQuestionAccessRequestsTableError(error)) {
      return false;
    }
    throw error;
  }
};

const actorHasCommunityBankAccess = async (
  db: D1DatabaseLike,
  bankId: string,
  actorId: string,
) => {
  const row = await first<{ id: string }>(
    db,
    `SELECT c.id
     FROM community_shared_banks csb
     JOIN communities c ON c.id = csb.community_id
     LEFT JOIN community_members cm
       ON cm.community_id = c.id AND cm.user_id = ?
     WHERE csb.bank_id = ?
       AND csb.status != 'ARCHIVED'
       AND (c.visibility = 'PUBLIC' OR c.owner_id = ? OR cm.id IS NOT NULL)
     LIMIT 1`,
    [actorId, bankId, actorId],
  );
  return Boolean(row);
};

type AccessibleQuestionBankRow = QuestionBankRow & {
  community_access: number | null;
};

type AccessibleQuestionBank = {
  bank: QuestionBankRow;
  communityAccessible: boolean;
};

type QuestionRepositorySubtopicNode = {
  name: string;
  questionCount: number;
  bankIds: string[];
};

type QuestionRepositoryTopicNode = {
  topic: string;
  bankCount: number;
  questionCount: number;
  subtopics: QuestionRepositorySubtopicNode[];
};

type QuestionRepositoryGradeNode = {
  grade: number;
  topics: QuestionRepositoryTopicNode[];
};

type QuestionRepositorySubjectNode = {
  subject: string;
  grades: QuestionRepositoryGradeNode[];
};

const getRepositoryKindForBank = ({
  bank,
  communityAccessible,
}: {
  bank: QuestionBankRow;
  communityAccessible: boolean;
}): QuestionRepositoryKind => {
  return bank.visibility === "PUBLIC" || communityAccessible ? "UNIFIED" : "MINE";
};

const resolveQuestionShareScopeForBank = ({
  bank,
  repositoryKind,
  shareScope,
  currentShareScope,
}: {
  bank: QuestionBankRow;
  repositoryKind?: QuestionRepositoryKind;
  shareScope?: QuestionShareScope;
  currentShareScope?: QuestionShareScope;
}): QuestionShareScope => {
  if (bank.visibility === "PUBLIC") {
    return "PUBLIC";
  }

  if (repositoryKind === "UNIFIED") {
    return "PUBLIC";
  }

  if (repositoryKind === "MINE") {
    return "PRIVATE";
  }

  return shareScope ?? currentShareScope ?? "PRIVATE";
};

const matchesRepositoryFilter = (
  repository: QuestionRepositoryFilter | undefined,
  repositoryKind: QuestionRepositoryKind,
) => !repository || repository === "ALL" || repository === repositoryKind;

const deriveQuestionSubtopics = ({
  bank,
  question,
}: {
  bank: QuestionBankRow;
  question: QuestionRow;
}) => {
  const tags = parseJsonArray(question.tags_json)
    .map((tag) => tag.trim())
    .filter(Boolean)
    .filter((tag) => !isSystemQuestionTag(tag))
    .filter((tag) => tag !== bank.subject)
    .filter((tag) => tag !== bank.topic)
    .filter((tag) => !tag.includes("анги"));

  return tags.length > 0 ? [...new Set(tags)] : [bank.topic];
};

type VisibleQuestionGraphDependencies = {
  actor: UserRow;
  bank: QuestionBankRow;
  communityAccessible: boolean;
  db: D1DatabaseLike;
  findUser: (db: D1DatabaseLike, id: string) => Promise<UserRow>;
  toUser: (user: UserRow) => unknown;
};

type VisibleQuestionBankNode = {
  id: string;
  title: string;
  description: string | null;
  repositoryKind: QuestionRepositoryKind;
  grade: number;
  subject: string;
  topic: string;
  topics: () => Promise<string[]>;
  visibility: QuestionBankRow["visibility"];
  createdAt: string;
  questionCount: () => Promise<number>;
  owner: () => Promise<unknown>;
  questions: () => Promise<VisibleQuestionNode[]>;
};

type VisibleQuestionNode = {
  id: string;
  repositoryKind: QuestionRepositoryKind;
  type: QuestionRow["type"];
  canonicalQuestionId: string | null;
  forkedFromQuestionId: string | null;
  title: string;
  prompt: string;
  options: string[];
  correctAnswer: string | null;
  difficulty: QuestionRow["difficulty"];
  shareScope: QuestionRow["share_scope"];
  requiresAccessRequest: boolean;
  tags: string[];
  createdAt: string;
  bank: () => Promise<VisibleQuestionBankNode>;
  createdBy: () => Promise<unknown>;
};

const getAccessibleQuestionBanksForTeacher = async (
  db: D1DatabaseLike,
  actorId: string,
): Promise<AccessibleQuestionBank[]> => {
  const rows = await all<AccessibleQuestionBankRow>(
    db,
    `SELECT
      qb.id,
      qb.title,
      qb.description,
      qb.grade,
      qb.subject,
      qb.topic,
      qb.visibility,
      qb.owner_id,
      qb.created_at,
      MAX(
        CASE
          WHEN c.visibility = 'PUBLIC' OR c.owner_id = ? OR cm.id IS NOT NULL
          THEN 1
          ELSE 0
        END
      ) AS community_access
     FROM question_banks qb
     LEFT JOIN community_shared_banks csb
       ON csb.bank_id = qb.id AND csb.status != 'ARCHIVED'
     LEFT JOIN communities c
       ON c.id = csb.community_id
     LEFT JOIN community_members cm
       ON cm.community_id = c.id AND cm.user_id = ?
     WHERE qb.visibility = 'PUBLIC'
        OR qb.owner_id = ?
        OR c.visibility = 'PUBLIC'
        OR c.owner_id = ?
        OR cm.id IS NOT NULL
     GROUP BY
      qb.id,
      qb.title,
      qb.description,
      qb.grade,
      qb.subject,
      qb.topic,
      qb.visibility,
      qb.owner_id,
      qb.created_at
     ORDER BY qb.created_at DESC`,
    [actorId, actorId, actorId, actorId],
  );

  return rows.map(({ community_access, ...bank }) => ({
    bank,
    communityAccessible: (community_access ?? 0) === 1,
  }));
};

const findAccessibleQuestionBankForTeacher = async (
  db: D1DatabaseLike,
  bankId: string,
  actorId: string,
): Promise<AccessibleQuestionBank | null> => {
  const row = await first<AccessibleQuestionBankRow>(
    db,
    `SELECT
      qb.id,
      qb.title,
      qb.description,
      qb.grade,
      qb.subject,
      qb.topic,
      qb.visibility,
      qb.owner_id,
      qb.created_at,
      MAX(
        CASE
          WHEN c.visibility = 'PUBLIC' OR c.owner_id = ? OR cm.id IS NOT NULL
          THEN 1
          ELSE 0
        END
      ) AS community_access
     FROM question_banks qb
     LEFT JOIN community_shared_banks csb
       ON csb.bank_id = qb.id AND csb.status != 'ARCHIVED'
     LEFT JOIN communities c
       ON c.id = csb.community_id
     LEFT JOIN community_members cm
       ON cm.community_id = c.id AND cm.user_id = ?
     WHERE qb.id = ?
       AND (
         qb.visibility = 'PUBLIC'
         OR qb.owner_id = ?
         OR c.visibility = 'PUBLIC'
         OR c.owner_id = ?
         OR cm.id IS NOT NULL
       )
     GROUP BY
      qb.id,
      qb.title,
      qb.description,
      qb.grade,
      qb.subject,
      qb.topic,
      qb.visibility,
      qb.owner_id,
      qb.created_at`,
    [actorId, actorId, bankId, actorId, actorId],
  );

  if (!row) {
    return null;
  }

  const { community_access, ...bank } = row;
  return {
    bank,
    communityAccessible: (community_access ?? 0) === 1,
  };
};

const listQuestionsByBankIdsCompat = async (
  db: D1DatabaseLike,
  bankIds: string[],
) => {
  const rows: QuestionRow[] = [];
  for (const bankIdChunk of chunkArray(bankIds, D1_SAFE_IN_CHUNK)) {
    rows.push(
      ...(await allQuestionsCompat(
        db,
        `SELECT ${fullQuestionSelectFields}
         FROM questions
         WHERE bank_id IN (${createPlaceholders(bankIdChunk.length)})`,
        `SELECT ${legacyQuestionSelectFields}
         FROM questions
         WHERE bank_id IN (${createPlaceholders(bankIdChunk.length)})`,
        bankIdChunk,
      )),
    );
  }

  return rows.sort(
    (left, right) =>
      new Date(right.created_at).getTime() - new Date(left.created_at).getTime(),
  );
};

const canActorDiscoverQuestion = ({
  actor,
  bank,
  communityAccessible,
  question,
}: {
  actor: UserRow;
  bank: QuestionBankRow;
  communityAccessible: boolean;
  question: QuestionRow;
}) => {
  if (actor.role === "ADMIN") {
    return true;
  }

  if (bank.owner_id === actor.id || question.created_by_id === actor.id) {
    return true;
  }

  if (question.requires_access_request === 1) {
    return true;
  }

  if (question.share_scope === "PUBLIC" || bank.visibility === "PUBLIC") {
    return true;
  }

  if (question.share_scope === "COMMUNITY" && communityAccessible) {
    return true;
  }

  return false;
};

const listDiscoverableQuestionsForBank = async ({
  actor,
  bank,
  communityAccessible,
  db,
}: Pick<VisibleQuestionGraphDependencies, "actor" | "bank" | "communityAccessible" | "db">) => {
  const rows = await allQuestionsCompat(
    db,
    `SELECT ${fullQuestionSelectFields}
     FROM questions
     WHERE bank_id = ?
     ORDER BY created_at DESC`,
    `SELECT ${legacyQuestionSelectFields}
     FROM questions
     WHERE bank_id = ?
     ORDER BY created_at DESC`,
    [bank.id],
  );

  if (actor.role === "ADMIN") {
    return rows;
  }

  return rows.filter((question) =>
    canActorDiscoverQuestion({
      actor,
      bank,
      communityAccessible,
      question,
    }),
  );
};

const buildQuestionRepositoryTree = async ({
  actor,
  accessibleBanks,
  db,
}: {
  actor: UserRow;
  accessibleBanks: AccessibleQuestionBank[];
  db: D1DatabaseLike;
}): Promise<QuestionRepositorySubjectNode[]> => {
  if (accessibleBanks.length === 0) {
    return [];
  }

  const bankMetaById = new Map(
    accessibleBanks.map((item) => [item.bank.id, item] as const),
  );

  const rows = await listQuestionsByBankIdsCompat(
    db,
    accessibleBanks.map((item) => item.bank.id),
  );

  const subjectMap = new Map<
    string,
    Map<
      number,
      Map<
        string,
        {
          bankIds: Set<string>;
          questionIds: Set<string>;
          subtopics: Map<string, { questionIds: Set<string>; bankIds: Set<string> }>;
        }
      >
    >
  >();

  for (const row of rows) {
    const bankMeta = bankMetaById.get(row.bank_id);
    if (!bankMeta) {
      continue;
    }

    if (
      !canActorDiscoverQuestion({
        actor,
        bank: bankMeta.bank,
        communityAccessible: bankMeta.communityAccessible,
        question: row,
      })
    ) {
      continue;
    }

    const subjectEntry =
      subjectMap.get(bankMeta.bank.subject) ??
      new Map<
        number,
        Map<
          string,
          {
            bankIds: Set<string>;
            questionIds: Set<string>;
            subtopics: Map<string, { questionIds: Set<string>; bankIds: Set<string> }>;
          }
        >
      >();
    subjectMap.set(bankMeta.bank.subject, subjectEntry);

    const gradeEntry =
      subjectEntry.get(bankMeta.bank.grade) ??
      new Map<
        string,
        {
          bankIds: Set<string>;
          questionIds: Set<string>;
          subtopics: Map<string, { questionIds: Set<string>; bankIds: Set<string> }>;
        }
      >();
    subjectEntry.set(bankMeta.bank.grade, gradeEntry);

    const topicName = bankMeta.bank.topic || "Ерөнхий";
    const topicEntry =
      gradeEntry.get(topicName) ?? {
        bankIds: new Set<string>(),
        questionIds: new Set<string>(),
        subtopics: new Map<string, { questionIds: Set<string>; bankIds: Set<string> }>(),
      };
    gradeEntry.set(topicName, topicEntry);

    topicEntry.bankIds.add(bankMeta.bank.id);
    topicEntry.questionIds.add(row.id);

    for (const subtopic of deriveQuestionSubtopics({
      bank: bankMeta.bank,
      question: row,
    })) {
      const subtopicEntry =
        topicEntry.subtopics.get(subtopic) ?? {
          questionIds: new Set<string>(),
          bankIds: new Set<string>(),
        };
      subtopicEntry.questionIds.add(row.id);
      subtopicEntry.bankIds.add(bankMeta.bank.id);
      topicEntry.subtopics.set(subtopic, subtopicEntry);
    }
  }

  return [...subjectMap.entries()]
    .sort(([left], [right]) => left.localeCompare(right, "mn"))
    .map(([subject, gradeMap]) => ({
      subject,
      grades: [...gradeMap.entries()]
        .sort(([left], [right]) => left - right)
        .map(([grade, topicMap]) => ({
          grade,
          topics: [...topicMap.entries()]
            .sort(([left], [right]) => left.localeCompare(right, "mn"))
            .map(([topic, topicEntry]) => ({
              topic,
              bankCount: topicEntry.bankIds.size,
              questionCount: topicEntry.questionIds.size,
              subtopics: [...topicEntry.subtopics.entries()]
                .sort(([left], [right]) => left.localeCompare(right, "mn"))
                .map(([name, subtopicEntry]) => ({
                  name,
                  questionCount: subtopicEntry.questionIds.size,
                  bankIds: [...subtopicEntry.bankIds].sort((left, right) =>
                    left.localeCompare(right, "en"),
                  ),
                })),
            })),
        })),
    }));
};

const buildVisibleQuestionBankObject = ({
  actor,
  bank,
  communityAccessible,
  db,
  findUser,
  toUser,
}: VisibleQuestionGraphDependencies): VisibleQuestionBankNode => {
  let bankObject = null as unknown as VisibleQuestionBankNode;
  let discoverableQuestionsPromise: Promise<QuestionRow[]> | null = null;
  let bankTopicsPromise: Promise<string[]> | null = null;
  const repositoryKind = getRepositoryKindForBank({
    bank,
    communityAccessible,
  });

  const loadDiscoverableQuestions = () => {
    discoverableQuestionsPromise ??= listDiscoverableQuestionsForBank({
      actor,
      bank,
      communityAccessible,
      db,
    });
    return discoverableQuestionsPromise;
  };

  const loadBankTopics = () => {
    bankTopicsPromise ??=
      bank.topic !== "Ерөнхий"
        ? Promise.resolve([bank.topic])
        : loadDiscoverableQuestions().then((rows) => [
            ...new Set(
              rows
                .flatMap((row) => parseJsonArray(row.tags_json))
                .filter((tag) => tag && tag !== bank.subject && !tag.includes("анги")),
            ),
          ]);
    return bankTopicsPromise;
  };

  const toVisibleQuestion = (question: QuestionRow): VisibleQuestionNode => ({
    id: question.id,
    repositoryKind,
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
    bank: async () => bankObject,
    createdBy: async () => toUser(await findUser(db, question.created_by_id)),
  });

  bankObject = {
    id: bank.id,
    title: bank.title,
    description: bank.description,
    repositoryKind,
    grade: bank.grade,
    subject: bank.subject,
    topic: bank.topic,
    topics: async () => loadBankTopics(),
    visibility: bank.visibility,
    createdAt: bank.created_at,
    questionCount: async () => (await loadDiscoverableQuestions()).length,
    owner: async () => toUser(await findUser(db, bank.owner_id)),
    questions: async () => (await loadDiscoverableQuestions()).map(toVisibleQuestion),
  };

  return bankObject;
};

export { buildVisibleQuestionBankObject };

const actorCanUseQuestion = async ({
  actor,
  bank,
  db,
  question,
}: {
  actor: UserRow;
  bank: QuestionBankRow;
  db: D1DatabaseLike;
  question: QuestionRow;
}) => {
  if (actor.role === "ADMIN") {
    return true;
  }

  if (bank.owner_id === actor.id || question.created_by_id === actor.id) {
    return true;
  }

  if (question.requires_access_request === 1) {
    return actorHasApprovedQuestionAccess(db, question.id, actor.id);
  }

  if (question.share_scope === "PUBLIC" || bank.visibility === "PUBLIC") {
    return true;
  }

  if (question.share_scope === "COMMUNITY") {
    if (await actorHasCommunityBankAccess(db, bank.id, actor.id)) {
      return true;
    }
  }

  return actorHasApprovedQuestionAccess(db, question.id, actor.id);
};

export const canActorUseQuestion = actorCanUseQuestion;

type QuestionModuleDependencies = {
  db: D1DatabaseLike;
  requireActor: (context: RequestContext, roles: Role[]) => Promise<UserRow>;
  publishQuestionBankEvent?: (event: QuestionBankMutationEvent) => Promise<void>;
  toQuestionBank: (db: D1DatabaseLike, bank: QuestionBankRow) => unknown;
  toQuestion: (db: D1DatabaseLike, question: QuestionRow) => unknown;
  findUser: (db: D1DatabaseLike, id: string) => Promise<UserRow>;
  toUser: (user: UserRow) => unknown;
};

export const createQuestionQueriesAndMutations = ({
  db,
  requireActor,
  publishQuestionBankEvent,
  toQuestionBank,
  toQuestion,
  findUser,
  toUser,
}: QuestionModuleDependencies) => ({
  questionBanks: async ({ repository }: QuestionBanksArgs, context: RequestContext) => {
    const actor = await requireActor(context, ["ADMIN", "TEACHER"]);
    const rows =
      actor.role === "ADMIN"
        ? await all<QuestionBankRow>(
            db,
            `SELECT ${questionBankSelectFields}
             FROM question_banks
             ORDER BY created_at DESC`,
          )
        : [];

    if (actor.role === "ADMIN") {
      return rows
        .map((row) => ({
          bank: row,
          communityAccessible: false,
        }))
        .filter(({ bank, communityAccessible }) =>
          matchesRepositoryFilter(
            repository,
            getRepositoryKindForBank({
              bank,
              communityAccessible,
            }),
          ),
        )
        .map(({ bank, communityAccessible }) =>
          buildVisibleQuestionBankObject({
            actor,
            bank,
            communityAccessible,
            db,
            findUser,
            toUser,
          }),
        );
    }

    const accessibleBanks = await getAccessibleQuestionBanksForTeacher(db, actor.id);
    return accessibleBanks
      .filter(({ bank, communityAccessible }) =>
        matchesRepositoryFilter(
          repository,
          getRepositoryKindForBank({
            bank,
            communityAccessible,
          }),
        ),
      )
      .map(({ bank, communityAccessible }) =>
        buildVisibleQuestionBankObject({
          actor,
          bank,
          communityAccessible,
          db,
          findUser,
          toUser,
        }),
      );
  },
  questionBank: async ({ id }: ByIdArgs, context: RequestContext) => {
    const actor = await requireActor(context, ["ADMIN", "TEACHER"]);
    if (actor.role === "ADMIN") {
      const bank = await first<QuestionBankRow>(
        db,
        `SELECT ${questionBankSelectFields}
         FROM question_banks
         WHERE id = ?`,
        [id],
      );
      return bank
        ? buildVisibleQuestionBankObject({
            actor,
            bank,
            communityAccessible: false,
            db,
            findUser,
            toUser,
          })
        : null;
    }

    const accessibleBank = await findAccessibleQuestionBankForTeacher(db, id, actor.id);
    return accessibleBank
      ? buildVisibleQuestionBankObject({
          actor,
          bank: accessibleBank.bank,
          communityAccessible: accessibleBank.communityAccessible,
          db,
          findUser,
          toUser,
        })
      : null;
  },
  questionRepositoryTree: async (
    { repository }: QuestionBanksArgs,
    context: RequestContext,
  ) => {
    const actor = await requireActor(context, ["ADMIN", "TEACHER"]);
    const accessibleBanks =
      actor.role === "ADMIN"
        ? (
            await all<QuestionBankRow>(
              db,
              `SELECT ${questionBankSelectFields}
               FROM question_banks
               ORDER BY created_at DESC`,
            )
          ).map((bank) => ({
            bank,
            communityAccessible: false,
          }))
        : await getAccessibleQuestionBanksForTeacher(db, actor.id);

    const filteredAccessibleBanks = accessibleBanks.filter(({ bank, communityAccessible }) =>
      matchesRepositoryFilter(
        repository,
        getRepositoryKindForBank({
          bank,
          communityAccessible,
        }),
      ),
    );

    return buildQuestionRepositoryTree({
      actor,
      accessibleBanks: filteredAccessibleBanks,
      db,
    });
  },
  questions: async ({ bankId, repository }: QuestionsArgs, context: RequestContext) => {
    const actor = await requireActor(context, ["ADMIN", "TEACHER"]);
    if (actor.role === "ADMIN") {
      const rows = bankId
        ? await allQuestionsCompat(
            db,
            `SELECT ${fullQuestionSelectFields}
             FROM questions
             WHERE bank_id = ?
             ORDER BY created_at DESC`,
            `SELECT ${legacyQuestionSelectFields}
             FROM questions
             WHERE bank_id = ?
             ORDER BY created_at DESC`,
            [bankId],
          )
        : await allQuestionsCompat(
            db,
            `SELECT ${fullQuestionSelectFields}
             FROM questions
             ORDER BY created_at DESC`,
            `SELECT ${legacyQuestionSelectFields}
             FROM questions
             ORDER BY created_at DESC`,
            [],
          );
      return rows
        .map((row) => ({
          row,
          repositoryKind: "UNIFIED" as QuestionRepositoryKind,
        }))
        .filter(({ repositoryKind }) => matchesRepositoryFilter(repository, repositoryKind))
        .map(({ row }) => toQuestion(db, row));
    }

    const accessibleBanks = bankId
      ? await Promise.resolve().then(async () => {
          const accessibleBank = await findAccessibleQuestionBankForTeacher(
            db,
            bankId,
            actor.id,
          );
          return accessibleBank ? [accessibleBank] : [];
        })
      : await getAccessibleQuestionBanksForTeacher(db, actor.id);

    if (!accessibleBanks.length) {
      return [];
    }

    const filteredAccessibleBanks = accessibleBanks.filter(({ bank, communityAccessible }) =>
      matchesRepositoryFilter(
        repository,
        getRepositoryKindForBank({
          bank,
          communityAccessible,
        }),
      ),
    );

    if (!filteredAccessibleBanks.length) {
      return [];
    }

    const bankMetaById = new Map(
      filteredAccessibleBanks.map((item) => [item.bank.id, item] as const),
    );

    const rows = (await listQuestionsByBankIdsCompat(
      db,
      filteredAccessibleBanks.map((item) => item.bank.id),
    )).filter((row) => {
      const bankMeta = bankMetaById.get(row.bank_id);
      if (!bankMeta) {
        return false;
      }

      return canActorDiscoverQuestion({
        actor,
        bank: bankMeta.bank,
        communityAccessible: bankMeta.communityAccessible,
        question: row,
      });
    });

    const bankObjectById = new Map(
      filteredAccessibleBanks.map((item) => [
        item.bank.id,
        buildVisibleQuestionBankObject({
          actor,
          bank: item.bank,
          communityAccessible: item.communityAccessible,
          db,
          findUser,
          toUser,
        }),
      ]),
    );

    return rows.flatMap((row) => {
      const bankMeta = bankMetaById.get(row.bank_id);
      const bankObject = bankObjectById.get(row.bank_id);
      if (!bankMeta || !bankObject) {
        return [];
      }

      return [
        {
          id: row.id,
          repositoryKind: getRepositoryKindForBank({
            bank: bankMeta.bank,
            communityAccessible: bankMeta.communityAccessible,
          }),
          type: row.type,
          canonicalQuestionId: row.canonical_question_id,
          forkedFromQuestionId: row.forked_from_question_id,
          title: row.title,
          prompt: row.prompt,
          options: parseJsonArray(row.options_json),
          correctAnswer: row.correct_answer,
          difficulty: row.difficulty,
          shareScope: row.share_scope,
          requiresAccessRequest: row.requires_access_request === 1,
          tags: parseJsonArray(row.tags_json),
          createdAt: row.created_at,
          bank: async () => bankObject,
          createdBy: async () => toUser(await findUser(db, row.created_by_id)),
        },
      ];
    });
  },
  questionAccessRequests: async (_args: unknown, context: RequestContext) => {
    const actor = await requireActor(context, ["ADMIN", "TEACHER"]);
    let rows: QuestionAccessRequestRow[] = [];
    try {
      rows =
        actor.role === "ADMIN"
          ? await all<QuestionAccessRequestRow>(
              db,
              `SELECT ${questionAccessRequestSelectFields}
               FROM question_access_requests
               ORDER BY created_at DESC`,
            )
          : await all<QuestionAccessRequestRow>(
              db,
              `SELECT ${questionAccessRequestSelectFields}
               FROM question_access_requests
               WHERE requester_user_id = ? OR owner_user_id = ?
               ORDER BY created_at DESC`,
              [actor.id, actor.id],
            );
    } catch (error) {
      if (!isMissingQuestionAccessRequestsTableError(error)) {
        throw error;
      }
      rows = [];
    }

    return Promise.all(
      rows.map(async (row) => ({
        id: row.id,
        question: async () => toQuestion(db, await findQuestionById(db, row.question_id)),
        requester: async () => toUser(await findUser(db, row.requester_user_id)),
        owner: async () => toUser(await findUser(db, row.owner_user_id)),
        status: row.status,
        createdAt: row.created_at,
        reviewedAt: row.reviewed_at,
      })),
    );
  },
  createQuestionBank: async (
    { title, description, grade, subject, topic, visibility, repositoryKind }: CreateQuestionBankArgs,
    context: RequestContext,
  ) => {
    const actor = await requireActor(context, ["ADMIN", "TEACHER"]);
    const normalizedGrade = grade ?? 10;
    const normalizedSubject = subject?.trim() || "Ерөнхий";
    const normalizedTopic = topic?.trim() || "Ерөнхий";

    if (repositoryKind === "UNIFIED") {
      const existingUnifiedBank = await findUnifiedQuestionBankByScope(db, {
        grade: normalizedGrade,
        subject: normalizedSubject,
        topic: normalizedTopic,
      });

      if (existingUnifiedBank) {
        return toQuestionBank(db, existingUnifiedBank);
      }
    }

    const id = makeId("bank");
    const createdAt = now();
    const isUnified = repositoryKind === "UNIFIED";

    await run(
      db,
      `INSERT INTO question_banks (id, title, description, grade, subject, topic, visibility, owner_id, created_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        id,
        isUnified
          ? `${normalizedGrade}-р анги · ${normalizedSubject} · ${normalizedTopic}`
          : title,
        isUnified ? "Нэгдсэн санд автоматаар нэгтгэсэн сан." : (description ?? null),
        normalizedGrade,
        normalizedSubject,
        normalizedTopic,
        isUnified ? "PUBLIC" : (visibility ?? "PRIVATE"),
        actor.id,
        createdAt,
      ],
    );

    const createdBank = await findQuestionBankById(db, id);
    await publishQuestionBankEvent?.({
      type: "question_bank_updated",
      bankId: createdBank.id,
      change: "CREATED",
      emittedAt: now(),
      ownerId: createdBank.owner_id,
      questionId: null,
      visibility: createdBank.visibility,
    });

    return toQuestionBank(db, createdBank);
  },
  createQuestion: async (
    {
      bankId,
      grade,
      subject,
      topic,
      type,
      title,
      prompt,
      options,
      correctAnswer,
      difficulty,
      repositoryKind,
      shareScope,
      requiresAccessRequest,
      tags,
    }: CreateQuestionArgs,
    context: RequestContext,
  ) => {
    const actor = await requireActor(context, ["ADMIN", "TEACHER"]);
    const bank = await ensureRepositoryQuestionBank({
      actor,
      db,
      repositoryKind,
      bankId,
      grade,
      subject,
      topic,
    });
    if (actor.role === "TEACHER") {
      invariant(
        bank.owner_id === actor.id ||
          (repositoryKind === "UNIFIED" && bank.visibility === "PUBLIC"),
        "You can only create questions in your own or unified question banks.",
      );
    }
    const id = makeId("question");
    const createdAt = now();
    const normalizedOptions = normalizeQuestionOptions(type, options);

    await run(
      db,
      `INSERT INTO questions (
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
      )
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        id,
        bankId,
        id,
        null,
        type,
        title,
        prompt,
        toJsonArray(normalizedOptions),
        correctAnswer ?? null,
        difficulty ?? "MEDIUM",
        resolveQuestionShareScopeForBank({
          bank,
          repositoryKind,
          shareScope,
        }),
        requiresAccessRequest ? 1 : 0,
        toJsonArray(tags),
        actor.id,
        createdAt,
      ],
    );

    const createdQuestion = await findQuestionById(db, id);
    await publishQuestionBankEvent?.({
      type: "question_bank_updated",
      bankId: bank.id,
      change: "CREATED",
      emittedAt: now(),
      ownerId: bank.owner_id,
      questionId: createdQuestion.id,
      visibility: bank.visibility,
    });

    return toQuestion(db, createdQuestion);
  },
  createQuestionVariants: async (
    { sourceQuestionId, totalVariants }: CreateQuestionVariantsArgs,
    context: RequestContext,
  ) => {
    const actor = await requireActor(context, ["ADMIN", "TEACHER"]);
    invariant(
      Number.isInteger(totalVariants) && totalVariants >= 2 && totalVariants <= 4,
      "Variant тоо 2-4 хооронд байна.",
    );

    const question = await findQuestionById(db, sourceQuestionId);
    const bank = await findQuestionBankById(db, question.bank_id);
    if (actor.role === "TEACHER") {
      invariant(
        bank.owner_id === actor.id,
        "You can only generate variants from your own question banks.",
      );
    }

    invariant(
      question.type !== "ESSAY" && question.type !== "IMAGE_UPLOAD",
      "Энэ төрлийн асуултад draft variant автоматаар үүсгэх боломжгүй.",
    );

    const existingTags = parseJsonArray(question.tags_json);
    const groupId =
      existingTags.find((tag) => tag.startsWith(VARIANT_GROUP_TAG))?.replace(VARIANT_GROUP_TAG, "") ??
      makeId("variant_group");

    await run(
      db,
      `UPDATE questions
       SET title = ?, prompt = ?, tags_json = ?
       WHERE id = ?`,
      [
        toVariantTitle(question.title.trim() || question.prompt.trim(), "A"),
        question.prompt,
        toJsonArray(toVariantTags(existingTags, groupId, "A", totalVariants)),
        sourceQuestionId,
      ],
    );

    const createdIds = [sourceQuestionId];

    for (let index = 1; index < totalVariants; index += 1) {
      const label = VARIANT_LABELS[index] ?? `V${index + 1}`;
      const nextId = makeId("question");
      const draft = buildVariantDraft(question, label, index * 2);
      await run(
        db,
        `INSERT INTO questions (
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
        )
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          nextId,
          question.bank_id,
          question.canonical_question_id ?? question.id,
          question.id,
          question.type,
          draft.title,
          draft.prompt,
          toJsonArray(draft.options),
          draft.correctAnswer ?? null,
          question.difficulty,
          question.share_scope,
          question.requires_access_request,
          toJsonArray(toVariantTags(existingTags, groupId, label, totalVariants)),
          actor.id,
          now(),
        ],
      );
      createdIds.push(nextId);
    }

    await publishQuestionBankEvent?.({
      type: "question_bank_updated",
      bankId: bank.id,
      change: "VARIANTS_CREATED",
      emittedAt: now(),
      ownerId: bank.owner_id,
      questionId: sourceQuestionId,
      visibility: bank.visibility,
    });

    return Promise.all(createdIds.map(async (id) => toQuestion(db, await findQuestionById(db, id))));
  },
  createExamDraftVariants: async (
    { sourceQuestionId, totalVariants }: CreateExamDraftVariantsArgs,
    context: RequestContext,
  ) => {
    const actor = await requireActor(context, ["ADMIN", "TEACHER"]);
    invariant(
      Number.isInteger(totalVariants) && totalVariants >= 2 && totalVariants <= 4,
      "Variant тоо 2-4 хооронд байна.",
    );

    const question = await findQuestionById(db, sourceQuestionId);
    const bank = await findQuestionBankById(db, question.bank_id);
    if (actor.role === "TEACHER") {
      invariant(
        await actorCanUseQuestion({ actor, bank, db, question }),
        "Энэ асуултаас draft variant үүсгэх эрх алга.",
      );
    }

    invariant(
      question.type !== "ESSAY" && question.type !== "IMAGE_UPLOAD",
      "Энэ төрлийн асуултад draft variant автоматаар үүсгэх боломжгүй.",
    );

    const existingTags = parseJsonArray(question.tags_json);
    const groupId = makeId("variant_group");
    const createdIds: string[] = [];

    for (let index = 0; index < totalVariants; index += 1) {
      const label = VARIANT_LABELS[index] ?? `V${index + 1}`;
      const nextId = makeId("question");
      const draft =
        index === 0
          ? {
              title: toVariantTitle(question.title.trim() || question.prompt.trim(), label),
              prompt: question.prompt,
              options: parseJsonArray(question.options_json),
              correctAnswer: question.correct_answer,
            }
          : buildVariantDraft(question, label, index * 2);

      await run(
        db,
        `INSERT INTO questions (
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
        )
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          nextId,
          question.bank_id,
          question.canonical_question_id ?? question.id,
          question.id,
          question.type,
          draft.title,
          draft.prompt,
          toJsonArray(normalizeQuestionOptions(question.type, draft.options)),
          draft.correctAnswer ?? null,
          question.difficulty,
          question.share_scope,
          question.requires_access_request,
          toJsonArray(toDraftVariantTags(existingTags, groupId, label, totalVariants)),
          actor.id,
          now(),
        ],
      );
      createdIds.push(nextId);
    }

    return Promise.all(
      createdIds.map(async (id) => toQuestion(db, await findQuestionById(db, id))),
    );
  },
  groupQuestionsAsVariants: async (
    { questionIds }: GroupQuestionsAsVariantsArgs,
    context: RequestContext,
  ) => {
    const actor = await requireActor(context, ["ADMIN", "TEACHER"]);
    const selectedQuestions = await Promise.all(
      questionIds.map(async (id) => findQuestionById(db, id)),
    );
    const normalizedQuestions = normalizeVariantSelection(selectedQuestions);
    const bank = await findQuestionBankById(db, normalizedQuestions[0].question.bank_id);

    if (actor.role === "TEACHER") {
      for (const { question } of normalizedQuestions) {
        const questionBank = await findQuestionBankById(db, question.bank_id);
        invariant(
          await actorCanUseQuestion({ actor, bank: questionBank, db, question }),
          "Эдгээр асуултыг хувилбарын бүлэг болгох эрх алга.",
        );
      }
    }

    const groupId = makeId("variant_group");
    const totalVariants = normalizedQuestions.length;

    for (const [index, item] of normalizedQuestions.entries()) {
      const label = VARIANT_LABELS[index] ?? `V${index + 1}`;
      await run(
        db,
        `UPDATE questions
         SET tags_json = ?
         WHERE id = ?`,
        [
          toJsonArray(toVariantTags(item.tags, groupId, label, totalVariants)),
          item.question.id,
        ],
      );
    }

    return Promise.all(
      normalizedQuestions.map(async ({ question }) =>
        toQuestion(db, await findQuestionById(db, question.id)),
      ),
    );
  },
  updateQuestion: async (
    {
      id,
      type,
      title,
      prompt,
      options,
      correctAnswer,
      difficulty,
      repositoryKind,
      shareScope,
      requiresAccessRequest,
      tags,
    }: UpdateQuestionArgs,
    context: RequestContext,
  ) => {
    const question = await findQuestionById(db, id);
    const actor = await requireActor(context, ["ADMIN", "TEACHER"]);
    const bank = await findQuestionBankById(db, question.bank_id);
    if (actor.role === "TEACHER") {
      invariant(bank.owner_id === actor.id, "You can only update questions in your own question banks.");
    }

    await run(
      db,
      `UPDATE questions
       SET type = ?, title = ?, prompt = ?, options_json = ?, correct_answer = ?, difficulty = ?, share_scope = ?, requires_access_request = ?, tags_json = ?
       WHERE id = ?`,
      [
        type,
        title,
        prompt,
        toJsonArray(normalizeQuestionOptions(type, options)),
        correctAnswer ?? null,
        difficulty ?? question.difficulty,
        resolveQuestionShareScopeForBank({
          bank,
          repositoryKind,
          shareScope,
          currentShareScope: question.share_scope,
        }),
        typeof requiresAccessRequest === "boolean"
          ? (requiresAccessRequest ? 1 : 0)
          : question.requires_access_request,
        toJsonArray(tags),
        id,
      ],
    );

    const updatedQuestion = await findQuestionById(db, id);
    await publishQuestionBankEvent?.({
      type: "question_bank_updated",
      bankId: bank.id,
      change: "UPDATED",
      emittedAt: now(),
      ownerId: bank.owner_id,
      questionId: updatedQuestion.id,
      visibility: bank.visibility,
    });

    return toQuestion(db, updatedQuestion);
  },
  deleteQuestion: async ({ id }: DeleteQuestionArgs, context: RequestContext) => {
    const question = await findQuestionById(db, id);
    const actor = await requireActor(context, ["ADMIN", "TEACHER"]);
    const bank = await findQuestionBankById(db, question.bank_id);
    if (actor.role === "TEACHER") {
      invariant(bank.owner_id === actor.id, "You can only delete questions in your own question banks.");
    }
    await run(db, "DELETE FROM questions WHERE id = ?", [id]);
    await publishQuestionBankEvent?.({
      type: "question_bank_updated",
      bankId: bank.id,
      change: "DELETED",
      emittedAt: now(),
      ownerId: bank.owner_id,
      questionId: id,
      visibility: bank.visibility,
    });
    return true;
  },
  requestQuestionAccess: async (
    { questionId }: RequestQuestionAccessArgs,
    context: RequestContext,
  ) => {
    const actor = await requireActor(context, ["ADMIN", "TEACHER"]);
    const question = await findQuestionById(db, questionId);
    const bank = await findQuestionBankById(db, question.bank_id);

    invariant(actor.role !== "ADMIN", "Админд хүсэлт илгээх шаардлагагүй.");
    invariant(bank.owner_id !== actor.id, "Өөрийн асуулт дээр хүсэлт илгээхгүй.");
    invariant(
      question.requires_access_request === 1 ||
        (question.share_scope !== "PUBLIC" && bank.visibility !== "PUBLIC"),
      "Нээлттэй асуултыг хүсэлтгүй ашиглаж болно.",
    );

    let existingPending: QuestionAccessRequestRow | null = null;
    try {
      existingPending = await first<QuestionAccessRequestRow>(
        db,
        `SELECT ${questionAccessRequestSelectFields}
         FROM question_access_requests
         WHERE question_id = ?
           AND requester_user_id = ?
           AND status = 'PENDING'
         LIMIT 1`,
        [questionId, actor.id],
      );
    } catch (error) {
      if (isMissingQuestionAccessRequestsTableError(error)) {
        invariant(false, "Асуултын хүсэлтийн feature хараахан идэвхжээгүй байна.");
      }
      throw error;
    }

    if (existingPending) {
      return {
        id: existingPending.id,
        question: async () => toQuestion(db, question),
        requester: async () => toUser(actor),
        owner: async () => toUser(await findUser(db, bank.owner_id)),
        status: existingPending.status,
        createdAt: existingPending.created_at,
        reviewedAt: existingPending.reviewed_at,
      };
    }

    const createdAt = now();
    const id = makeId("question_access_request");
    try {
      await run(
        db,
        `INSERT INTO question_access_requests (
          id,
          question_id,
          requester_user_id,
          owner_user_id,
          status,
          created_at,
          reviewed_at
        )
        VALUES (?, ?, ?, ?, 'PENDING', ?, NULL)`,
        [id, questionId, actor.id, bank.owner_id, createdAt],
      );
    } catch (error) {
      if (isMissingQuestionAccessRequestsTableError(error)) {
        invariant(false, "Асуултын хүсэлтийн feature хараахан идэвхжээгүй байна.");
      }
      throw error;
    }

    return {
      id,
      question: async () => toQuestion(db, question),
      requester: async () => toUser(actor),
      owner: async () => toUser(await findUser(db, bank.owner_id)),
      status: "PENDING",
      createdAt,
      reviewedAt: null,
    };
  },
  reviewQuestionAccessRequest: async (
    { requestId, approve }: ReviewQuestionAccessRequestArgs,
    context: RequestContext,
  ) => {
    const actor = await requireActor(context, ["ADMIN", "TEACHER"]);
    let request: QuestionAccessRequestRow;
    try {
      request = await findQuestionAccessRequestById(db, requestId);
    } catch (error) {
      if (isMissingQuestionAccessRequestsTableError(error)) {
        invariant(false, "Асуултын хүсэлтийн feature хараахан идэвхжээгүй байна.");
      }
      throw error;
    }
    invariant(
      actor.role === "ADMIN" || request.owner_user_id === actor.id,
      "Зөвхөн асуултын эзэмшигч хүсэлтийг шийднэ.",
    );
    invariant(request.status === "PENDING", "Зөвхөн pending хүсэлтийг шийднэ.");

    const reviewedAt = now();
    const nextStatus = approve ? "APPROVED" : "REJECTED";
    try {
      await run(
        db,
        `UPDATE question_access_requests
         SET status = ?, reviewed_at = ?
         WHERE id = ?`,
        [nextStatus, reviewedAt, requestId],
      );
    } catch (error) {
      if (isMissingQuestionAccessRequestsTableError(error)) {
        invariant(false, "Асуултын хүсэлтийн feature хараахан идэвхжээгүй байна.");
      }
      throw error;
    }

    const nextRequest = await findQuestionAccessRequestById(db, requestId);
    return {
      id: nextRequest.id,
      question: async () =>
        toQuestion(db, await findQuestionById(db, nextRequest.question_id)),
      requester: async () => toUser(await findUser(db, nextRequest.requester_user_id)),
      owner: async () => toUser(await findUser(db, nextRequest.owner_user_id)),
      status: nextRequest.status,
      createdAt: nextRequest.created_at,
      reviewedAt: nextRequest.reviewed_at,
    };
  },
  forkQuestionToMyBank: async (
    { questionId, targetBankId }: ForkQuestionToMyBankArgs,
    context: RequestContext,
  ) => {
    const actor = await requireActor(context, ["ADMIN", "TEACHER"]);
    const question = await findQuestionById(db, questionId);
    const sourceBank = await findQuestionBankById(db, question.bank_id);
    const targetBank = await findQuestionBankById(db, targetBankId);

    if (actor.role === "TEACHER") {
      invariant(targetBank.owner_id === actor.id, "Зөвхөн өөрийн сан руу хувилбарлана.");
      invariant(
        await actorCanUseQuestion({ actor, bank: sourceBank, db, question }),
        "Энэ асуултыг хувилбарлаж ашиглах эрх алга.",
      );
    }

    const id = makeId("question");
    const createdAt = now();
    const nextTags = [
      ...parseJsonArray(question.tags_json),
      `forked_from_question:${question.id}`,
      `forked_from_bank:${sourceBank.id}`,
    ];

    await run(
      db,
      `INSERT INTO questions (
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
      )
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        id,
        targetBankId,
        question.canonical_question_id ?? question.id,
        question.id,
        question.type,
        question.title,
        question.prompt,
        question.options_json,
        question.correct_answer,
        question.difficulty,
        "PRIVATE",
        0,
        toJsonArray([...new Set(nextTags)]),
        actor.id,
        createdAt,
      ],
    );

    return toQuestion(db, await findQuestionById(db, id));
  },
});
