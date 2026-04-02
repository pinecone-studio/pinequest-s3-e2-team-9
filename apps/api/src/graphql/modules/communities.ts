import { all, first, invariant, run, type D1DatabaseLike } from "../../lib/d1";
import type { RequestContext } from "../../auth";
import { buildVisibleQuestionBankObject } from "./questions";
import {
  type AddCommunityCommentArgs,
  makeId,
  now,
  parseJsonArray,
  toJsonArray,
  type ByIdArgs,
  type CommunityCommentEntityType,
  type CommunityRatingRow,
  type CommunityExamPreviewArgs,
  type CommunityCommentRow,
  type CommunityUsageEntityType,
  type CommunityUsageEventType,
  type CommunityMemberRole,
  type CommunityMemberRow,
  type CommunityRow,
  type CommunitySharedBankRow,
  type CommunitySharedExamRow,
  type CommunityUsageEventRow,
  type CommunityVisibility,
  type CopyCommunitySharedBankToMyBankArgs,
  type CreateCommunityArgs,
  type JoinCommunityArgs,
  type QuestionBankRow,
  type QuestionRow,
  type RateCommunityItemArgs,
  type Role,
  type ShareExamToCommunityArgs,
  type ShareQuestionBankToCommunityArgs,
  type UserRow,
} from "../types";

const communitySelectFields = `id,
      name,
      description,
      subject,
      grade,
      visibility,
      owner_id,
      created_at`;

const communityMemberSelectFields = `id,
      community_id,
      user_id,
      role,
      joined_at`;

const communitySharedBankSelectFields = `id,
      community_id,
      bank_id,
      shared_by_id,
      status,
      created_at`;

const communitySharedExamSelectFields = `id,
      community_id,
      exam_id,
      shared_by_id,
      created_at`;

const questionSelectFields = `id,
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

const createPlaceholders = (count: number) =>
  Array.from({ length: count }, () => "?").join(", ");

type CommunityTrendingBankRow = {
  shared_bank_id: string;
  community_id: string;
  community_name: string;
  bank_id: string;
  copy_count: number | null;
};

type CommunityTrendingExamRow = {
  exam_id: string;
  title: string;
  subject: string;
  grade: number;
  attempt_count: number | null;
  average_score_percent: number | null;
  created_by_id: string;
  community_id: string | null;
  community_name: string | null;
};

type CommunityQuestionInsightRow = {
  question_id: string;
  prompt: string;
  subject: string;
  grade: number;
  topic: string;
  bank_title: string;
  community_id: string;
  community_name: string;
  attempt_count: number | null;
  miss_rate: number | null;
};

type CommunityActivityRow = {
  day: string;
  value: number | null;
};

type CommunitySharedExamListRow = {
  shared_exam_id: string;
  community_id: string;
  exam_id: string;
  title: string;
  description: string | null;
  subject: string;
  grade: number;
  class_name: string;
  status: string;
  duration_minutes: number;
  shared_by_id: string;
  created_at: string;
  question_count: number | null;
  attempt_count: number | null;
  average_score_percent: number | null;
};

type CommunityExamPreviewMetaRow = {
  exam_id: string;
  created_by_id: string;
  title: string;
  description: string | null;
  status: string;
  duration_minutes: number;
  passing_criteria_type: string;
  passing_threshold: number;
  created_at: string;
  class_name: string;
  subject: string;
  grade: number;
  student_count: number | null;
  question_count: number | null;
  total_points: number | null;
  community_id: string | null;
  community_name: string | null;
  shared_by_id: string | null;
  shared_at: string | null;
};

type CommunityExamPreviewQuestionRow = {
  question_id: string;
  display_order: number;
  points: number;
  title: string;
  prompt: string;
  type: string;
  options_json: string;
  correct_answer: string | null;
  topic: string;
  tags_json: string;
};

type CommunityExamPreviewAttemptRow = {
  attempt_id: string;
  total_score: number;
};

type CommunityExamPreviewAnswerRow = {
  attempt_id: string;
  question_id: string;
  value: string;
  auto_score: number | null;
  manual_score: number | null;
};

type CommunityContributorRow = {
  user_id: string;
  role: CommunityMemberRole;
  shared_bank_count: number | null;
  shared_exam_count: number | null;
  comment_count: number | null;
};

type CommunityModuleDependencies = {
  db: D1DatabaseLike;
  requireActor: (context: RequestContext, roles: Role[]) => Promise<UserRow>;
  findQuestionBank: (db: D1DatabaseLike, id: string) => Promise<QuestionBankRow>;
  findUser: (db: D1DatabaseLike, id: string) => Promise<UserRow>;
  toQuestionBank: (db: D1DatabaseLike, bank: QuestionBankRow) => unknown;
  toUser: (user: UserRow) => unknown;
};

const listCommunityMembers = async (
  db: D1DatabaseLike,
  communityId: string,
): Promise<CommunityMemberRow[]> =>
  all<CommunityMemberRow>(
    db,
    `SELECT
      ${communityMemberSelectFields}
     FROM community_members
     WHERE community_id = ?
     ORDER BY joined_at ASC`,
    [communityId],
  );

const listCommunitySharedBanks = async (
  db: D1DatabaseLike,
  communityId: string,
): Promise<CommunitySharedBankRow[]> =>
  all<CommunitySharedBankRow>(
    db,
    `SELECT
      ${communitySharedBankSelectFields}
     FROM community_shared_banks
     WHERE community_id = ? AND status != 'ARCHIVED'
     ORDER BY CASE status WHEN 'FEATURED' THEN 0 ELSE 1 END, created_at DESC`,
    [communityId],
  );

const listCommunityComments = async (
  db: D1DatabaseLike,
  communityId: string,
  entityType: CommunityCommentEntityType,
  entityId: string,
): Promise<CommunityCommentRow[]> =>
  all<CommunityCommentRow>(
    db,
    `SELECT
      id,
      community_id,
      author_user_id,
      entity_type,
      entity_id,
      body,
      created_at
     FROM community_comments
     WHERE community_id = ?
       AND entity_type = ?
       AND entity_id = ?
     ORDER BY created_at DESC`,
    [communityId, entityType, entityId],
  );

const getCommunityRatingSummary = async (
  db: D1DatabaseLike,
  communityId: string,
  entityType: CommunityCommentEntityType,
  entityId: string,
  viewerId: string | null,
) => {
  const aggregate = await first<{ rating_count: number | null; average_rating: number | null }>(
    db,
    `SELECT
      COUNT(*) AS rating_count,
      AVG(value) AS average_rating
     FROM community_ratings
     WHERE community_id = ?
       AND entity_type = ?
       AND entity_id = ?`,
    [communityId, entityType, entityId],
  );

  const viewerRating = viewerId
    ? (
        await first<{ value: number | null }>(
          db,
          `SELECT value
           FROM community_ratings
           WHERE community_id = ?
             AND entity_type = ?
             AND entity_id = ?
             AND user_id = ?`,
          [communityId, entityType, entityId, viewerId],
        )
      )?.value ?? null
    : null;

  return {
    ratingCount: aggregate?.rating_count ?? 0,
    averageRating:
      aggregate?.average_rating == null
        ? 0
        : Number.parseFloat(Number(aggregate.average_rating).toFixed(1)),
    viewerRating,
  };
};

const findCommunityMember = async (
  db: D1DatabaseLike,
  communityId: string,
  userId: string,
): Promise<CommunityMemberRow | null> =>
  first<CommunityMemberRow>(
    db,
    `SELECT
      ${communityMemberSelectFields}
     FROM community_members
     WHERE community_id = ? AND user_id = ?`,
    [communityId, userId],
  );

const countCommunityMembers = async (db: D1DatabaseLike, communityId: string) =>
  (
    await first<{ count: number | null }>(
      db,
      "SELECT COUNT(*) AS count FROM community_members WHERE community_id = ?",
      [communityId],
    )
  )?.count ?? 0;

const countCommunitySharedBanks = async (db: D1DatabaseLike, communityId: string) =>
  (
    await first<{ count: number | null }>(
      db,
      "SELECT COUNT(*) AS count FROM community_shared_banks WHERE community_id = ? AND status != 'ARCHIVED'",
      [communityId],
    )
  )?.count ?? 0;

const countCommunitySharedExams = async (db: D1DatabaseLike, communityId: string) =>
  (
    await first<{ count: number | null }>(
      db,
      "SELECT COUNT(*) AS count FROM community_shared_exams WHERE community_id = ?",
      [communityId],
    )
  )?.count ?? 0;

const listCommunityTopContributors = async (
  db: D1DatabaseLike,
  communityId: string,
): Promise<CommunityContributorRow[]> =>
  all<CommunityContributorRow>(
    db,
    `SELECT
      cm.user_id,
      cm.role,
      COALESCE(bank_counts.shared_bank_count, 0) AS shared_bank_count,
      COALESCE(exam_counts.shared_exam_count, 0) AS shared_exam_count,
      COALESCE(comment_counts.comment_count, 0) AS comment_count
     FROM community_members cm
     LEFT JOIN (
       SELECT shared_by_id AS user_id, COUNT(*) AS shared_bank_count
       FROM community_shared_banks
       WHERE community_id = ?
         AND status != 'ARCHIVED'
       GROUP BY shared_by_id
     ) bank_counts ON bank_counts.user_id = cm.user_id
     LEFT JOIN (
       SELECT shared_by_id AS user_id, COUNT(*) AS shared_exam_count
       FROM community_shared_exams
       WHERE community_id = ?
       GROUP BY shared_by_id
     ) exam_counts ON exam_counts.user_id = cm.user_id
     LEFT JOIN (
       SELECT author_user_id AS user_id, COUNT(*) AS comment_count
       FROM community_comments
       WHERE community_id = ?
       GROUP BY author_user_id
     ) comment_counts ON comment_counts.user_id = cm.user_id
     WHERE cm.community_id = ?
     ORDER BY
       (COALESCE(exam_counts.shared_exam_count, 0) * 5 +
        COALESCE(bank_counts.shared_bank_count, 0) * 3 +
        COALESCE(comment_counts.comment_count, 0)) DESC,
       cm.joined_at ASC
     LIMIT 6`,
    [communityId, communityId, communityId, communityId],
  );

const listCommunitySharedExams = async (
  db: D1DatabaseLike,
  communityId: string,
): Promise<CommunitySharedExamListRow[]> =>
  all<CommunitySharedExamListRow>(
    db,
    `SELECT
      cse.id AS shared_exam_id,
      cse.community_id,
      cse.exam_id,
      e.title,
      e.description,
      cl.subject,
      cl.grade,
      cl.name AS class_name,
      e.status,
      e.duration_minutes,
      cse.shared_by_id,
      cse.created_at,
      COALESCE(question_totals.question_count, 0) AS question_count,
      COALESCE(attempt_totals.attempt_count, 0) AS attempt_count,
      COALESCE(attempt_totals.average_score_percent, 0) AS average_score_percent
     FROM community_shared_exams cse
     JOIN exams e ON e.id = cse.exam_id
     JOIN classes cl ON cl.id = e.class_id
     LEFT JOIN (
       SELECT exam_id, COUNT(*) AS question_count, SUM(points) AS total_points
       FROM exam_questions
       GROUP BY exam_id
     ) question_totals ON question_totals.exam_id = e.id
     LEFT JOIN (
       SELECT
         a.exam_id,
         COUNT(*) AS attempt_count,
         CAST(
           ROUND(
             AVG(
               CASE
                 WHEN point_totals.total_points > 0
                   THEN (a.total_score * 100.0) / point_totals.total_points
                 ELSE NULL
               END
             )
           ) AS INTEGER
         ) AS average_score_percent
       FROM attempts a
       JOIN (
         SELECT exam_id, SUM(points) AS total_points
         FROM exam_questions
         GROUP BY exam_id
       ) point_totals ON point_totals.exam_id = a.exam_id
       WHERE a.status != 'IN_PROGRESS'
       GROUP BY a.exam_id
     ) attempt_totals ON attempt_totals.exam_id = e.id
     WHERE cse.community_id = ?
     ORDER BY attempt_count DESC, average_score_percent DESC, cse.created_at DESC`,
    [communityId],
  );

const countCommunitySharedBankCopies = async (
  db: D1DatabaseLike,
  sharedBankId: string,
) =>
  (
    await first<{ count: number | null }>(
      db,
      `SELECT COUNT(*) AS count
       FROM community_usage_events
       WHERE entity_type = 'SHARED_BANK'
         AND entity_id = ?
         AND event_type = 'COPY_BANK'`,
      [sharedBankId],
    )
  )?.count ?? 0;

const recordCommunityUsageEvent = async (
  db: D1DatabaseLike,
  {
    communityId,
    actorUserId,
    eventType,
    entityType,
    entityId,
    metadata,
    createdAt,
  }: {
    communityId: string;
    actorUserId: string | null;
    eventType: CommunityUsageEventType;
    entityType: CommunityUsageEntityType;
    entityId: string;
    metadata?: Record<string, unknown>;
    createdAt?: string;
  },
) =>
  run(
    db,
    `INSERT INTO community_usage_events (
      id,
      community_id,
      actor_user_id,
      event_type,
      entity_type,
      entity_id,
      metadata_json,
      created_at
    )
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      makeId("community_usage"),
      communityId,
      actorUserId,
      eventType,
      entityType,
      entityId,
      JSON.stringify(metadata ?? {}),
      createdAt ?? now(),
    ],
  );

const findCommunityById = async (
  db: D1DatabaseLike,
  id: string,
): Promise<CommunityRow> => {
  const community = await first<CommunityRow>(
    db,
    `SELECT
      ${communitySelectFields}
     FROM communities
     WHERE id = ?`,
    [id],
  );
  invariant(community, `Community ${id} not found`);
  return community;
};

const findAccessibleCommunity = async (
  db: D1DatabaseLike,
  communityId: string,
  actor: UserRow,
): Promise<CommunityRow | null> => {
  if (actor.role === "ADMIN") {
    return first<CommunityRow>(
      db,
      `SELECT
        ${communitySelectFields}
       FROM communities
       WHERE id = ?`,
      [communityId],
    );
  }

  return first<CommunityRow>(
    db,
    `SELECT DISTINCT
      c.${communitySelectFields.replaceAll(",\n      ", ",\n      c.")}
     FROM communities c
     LEFT JOIN community_members cm
       ON cm.community_id = c.id AND cm.user_id = ?
     WHERE c.id = ?
       AND (
         c.visibility = 'PUBLIC'
         OR c.owner_id = ?
         OR cm.user_id IS NOT NULL
       )`,
    [actor.id, communityId, actor.id],
  );
};

const listCommunitiesForActor = async (
  db: D1DatabaseLike,
  actor: UserRow,
): Promise<CommunityRow[]> => {
  if (actor.role === "ADMIN") {
    return all<CommunityRow>(
      db,
      `SELECT
        ${communitySelectFields}
       FROM communities
       ORDER BY created_at DESC`,
    );
  }

  return all<CommunityRow>(
    db,
    `SELECT DISTINCT
      c.${communitySelectFields.replaceAll(",\n      ", ",\n      c.")}
     FROM communities c
     LEFT JOIN community_members cm
       ON cm.community_id = c.id AND cm.user_id = ?
     WHERE c.visibility = 'PUBLIC'
       OR c.owner_id = ?
       OR cm.user_id IS NOT NULL
     ORDER BY c.created_at DESC`,
    [actor.id, actor.id],
  );
};

export const createCommunityQueriesAndMutations = ({
  db,
  requireActor,
  findQuestionBank,
  findUser,
  toQuestionBank,
  toUser,
}: CommunityModuleDependencies) => {
  const getAccessibleCommunityIds = async (actor: UserRow) =>
    (await listCommunitiesForActor(db, actor)).map((community) => community.id);

  const toPercent = (earned: number, possible: number) =>
    possible > 0 ? Math.round((earned / possible) * 100) : 0;

  const truncateText = (value: string, max = 72) =>
    value.length > max ? `${value.slice(0, max - 3).trimEnd()}...` : value;

  const hasPassed = (
    totalScore: number,
    totalPoints: number,
    passingCriteriaType: string,
    passingThreshold: number,
  ) =>
    passingCriteriaType === "POINTS"
      ? totalScore >= passingThreshold
      : toPercent(totalScore, totalPoints) >= passingThreshold;

  const getCommunityExamPreview = async (
    actor: UserRow,
    examId: string,
    requestedCommunityId?: string | null,
  ) => {
    const examMeta = await first<CommunityExamPreviewMetaRow>(
      db,
      `SELECT
        e.id AS exam_id,
        e.created_by_id,
        e.title,
        e.description,
        e.status,
        e.duration_minutes,
        e.passing_criteria_type,
        e.passing_threshold,
        e.created_at,
        cl.name AS class_name,
        cl.subject,
        cl.grade,
        COUNT(cs.student_id) AS student_count,
        COALESCE(question_totals.question_count, 0) AS question_count,
        COALESCE(question_totals.total_points, 0) AS total_points,
        NULL AS community_id,
        NULL AS community_name,
        NULL AS shared_by_id,
        NULL AS shared_at
       FROM exams e
       JOIN classes cl ON cl.id = e.class_id
       LEFT JOIN class_students cs ON cs.class_id = cl.id
       LEFT JOIN (
         SELECT exam_id, COUNT(*) AS question_count, SUM(points) AS total_points
         FROM exam_questions
         GROUP BY exam_id
       ) question_totals ON question_totals.exam_id = e.id
       WHERE e.id = ?
       GROUP BY
         e.id,
         e.created_by_id,
         e.title,
         e.description,
         e.status,
         e.duration_minutes,
         e.passing_criteria_type,
         e.passing_threshold,
         e.created_at,
         cl.name,
         cl.subject,
         cl.grade,
         question_totals.question_count,
         question_totals.total_points`,
      [examId],
    );
    invariant(examMeta, "Community preview шалгалт олдсонгүй.");
    invariant(
      examMeta.status !== "DRAFT" && (examMeta.question_count ?? 0) > 0,
      "Ноорог эсвэл асуултгүй шалгалтыг community preview-д харуулахгүй.",
    );

    const accessibleCommunities = requestedCommunityId
      ? [await findAccessibleCommunity(db, requestedCommunityId, actor)].filter(
          (community): community is CommunityRow => community !== null,
        )
      : await listCommunitiesForActor(db, actor);
    invariant(
      accessibleCommunities.length > 0,
      "Энэ community preview-г үзэх эрхтэй community олдсонгүй.",
    );

    const accessibleIds = accessibleCommunities.map((community) => community.id);
    const placeholders = createPlaceholders(accessibleIds.length);

    const explicitContext = await first<{
      community_id: string;
      community_name: string;
      shared_by_id: string;
      shared_at: string;
    }>(
      db,
      `SELECT
        c.id AS community_id,
        c.name AS community_name,
        cse.shared_by_id,
        cse.created_at AS shared_at
       FROM community_shared_exams cse
       JOIN communities c ON c.id = cse.community_id
       WHERE cse.exam_id = ?
         AND c.id IN (${placeholders})
       ORDER BY cse.created_at DESC
       LIMIT 1`,
      [examId, ...accessibleIds],
    );

    const implicitContext =
      explicitContext ??
      (await first<{
        community_id: string;
        community_name: string;
      }>(
        db,
        `SELECT
          c.id AS community_id,
          c.name AS community_name
         FROM communities c
         JOIN community_members cm
           ON cm.community_id = c.id
          AND cm.user_id = (
            SELECT created_by_id
            FROM exams
            WHERE id = ?
          )
         WHERE c.id IN (${placeholders})
           AND c.subject = ?
           AND (c.grade = 0 OR c.grade = ?)
         ORDER BY c.created_at ASC
         LIMIT 1`,
        [examId, ...accessibleIds, examMeta.subject, examMeta.grade],
      ));

    const requestedCommunityContext = requestedCommunityId
      ? accessibleCommunities.find((community) => community.id === requestedCommunityId) ?? null
      : null;
    const canPreviewAsOwner =
      requestedCommunityContext !== null &&
      (actor.role === "ADMIN" || examMeta.created_by_id === actor.id);

    invariant(
      explicitContext || implicitContext || canPreviewAsOwner,
      "Энэ шалгалтын community preview-г үзэх эрх алга.",
    );

    const questions = await all<CommunityExamPreviewQuestionRow>(
      db,
      `SELECT
        q.id AS question_id,
        eq.display_order,
        eq.points,
        q.title,
        q.prompt,
        q.type,
        q.options_json,
        q.correct_answer,
        qb.topic,
        q.tags_json
       FROM exam_questions eq
       JOIN questions q ON q.id = eq.question_id
       JOIN question_banks qb ON qb.id = q.bank_id
       WHERE eq.exam_id = ?
       ORDER BY eq.display_order ASC`,
      [examId],
    );

    const submittedAttempts = await all<CommunityExamPreviewAttemptRow>(
      db,
      `SELECT
        id AS attempt_id,
        total_score
       FROM attempts
       WHERE exam_id = ?
         AND status != 'IN_PROGRESS'
       ORDER BY submitted_at ASC, started_at ASC`,
      [examId],
    );

    const answerRows = submittedAttempts.length
      ? await all<CommunityExamPreviewAnswerRow>(
          db,
          `SELECT
            attempt_id,
            question_id,
            value,
            auto_score,
            manual_score
           FROM answers
           WHERE attempt_id IN (${createPlaceholders(submittedAttempts.length)})`,
          submittedAttempts.map((attempt) => attempt.attempt_id),
        )
      : [];

    const totalPoints = examMeta.total_points ?? 0;
    const studentCount = examMeta.student_count ?? 0;
    const submittedCount = submittedAttempts.length;
    const attemptPercents = submittedAttempts.map((attempt) =>
      toPercent(attempt.total_score, totalPoints),
    );
    const averagePercent = submittedCount
      ? Math.round(
          attemptPercents.reduce((sum, percent) => sum + percent, 0) / submittedCount,
        )
      : 0;
    const highestPercent = attemptPercents.length ? Math.max(...attemptPercents) : 0;
    const lowestPercent = attemptPercents.length ? Math.min(...attemptPercents) : 0;
    const passRate = submittedCount
      ? Math.round(
          (submittedAttempts.filter((attempt) =>
            hasPassed(
              attempt.total_score,
              totalPoints,
              examMeta.passing_criteria_type,
              examMeta.passing_threshold,
            ),
          ).length /
            submittedCount) *
            100,
        )
      : 0;
    const completionRate = studentCount
      ? Math.round((submittedCount / studentCount) * 100)
      : 0;

    const answerMap = new Map(
      answerRows.map((row) => [`${row.attempt_id}:${row.question_id}`, row]),
    );

    const scoreRanges = [
      { label: "0-20%", min: 0, max: 20 },
      { label: "21-40%", min: 21, max: 40 },
      { label: "41-60%", min: 41, max: 60 },
      { label: "61-80%", min: 61, max: 80 },
      { label: "81-100%", min: 81, max: 100 },
    ];

    const scoreDistribution = scoreRanges.map((range) => {
      const count = attemptPercents.filter(
        (percent) => percent >= range.min && percent <= range.max,
      ).length;
      return {
        label: range.label,
        value: submittedCount ? Math.round((count / submittedCount) * 100) : 0,
        meta: `${count} оролдлого`,
      };
    });

    const topicMap = new Map<
      string,
      { earned: number; possible: number; questionCount: number }
    >();

    const questionPerformance = questions
      .map((question) => {
        const wrongOptionCounts = new Map<string, number>();
        let earned = 0;
        let incorrectCount = 0;

        for (const attempt of submittedAttempts) {
          const answer = answerMap.get(`${attempt.attempt_id}:${question.question_id}`);
          const score = (answer?.auto_score ?? 0) + (answer?.manual_score ?? 0);
          earned += score;
          if (score < question.points) {
            incorrectCount += 1;
          }
          if (
            answer?.value &&
            answer.value !== question.correct_answer &&
            (question.type === "MCQ" || question.type === "TRUE_FALSE")
          ) {
            wrongOptionCounts.set(
              answer.value,
              (wrongOptionCounts.get(answer.value) ?? 0) + 1,
            );
          }
        }

        const mostChosenWrong = [...wrongOptionCounts.entries()].sort(
          (left, right) => right[1] - left[1],
        )[0];
        const possible = question.points * submittedCount;
        const accuracy = toPercent(earned, possible);

        const topicEntry = topicMap.get(question.topic) ?? {
          earned: 0,
          possible: 0,
          questionCount: 0,
        };
        topicEntry.earned += earned;
        topicEntry.possible += possible;
        topicEntry.questionCount += 1;
        topicMap.set(question.topic, topicEntry);

        return {
          label: `${question.display_order}. ${truncateText(question.prompt || question.title)}`,
          value: accuracy,
          meta: `${incorrectCount} оролдлого алдсан`,
          note: mostChosenWrong
            ? `Хамгийн их андуурсан: ${mostChosenWrong[0]} (${mostChosenWrong[1]})`
            : undefined,
        };
      })
      .sort((left, right) => left.value - right.value);

    const topicPerformance = [...topicMap.entries()]
      .map(([topic, stats]) => ({
        label: topic,
        value: toPercent(stats.earned, stats.possible),
        meta: `${stats.questionCount} асуулт`,
      }))
      .sort((left, right) => left.value - right.value);

    const weakestTopic = topicPerformance[0];
    const hardestQuestion = questionPerformance[0];
    const insights = [];

    if (weakestTopic) {
      insights.push({
        title: "Анхаарах сэдэв",
        description: `${weakestTopic.label} сэдвийн гүйцэтгэл ${weakestTopic.value}% байна.`,
        tone: weakestTopic.value < 50 ? "warning" : "neutral",
      });
    }

    if (hardestQuestion) {
      insights.push({
        title: "Их алдсан асуулт",
        description: `${hardestQuestion.label} дээрх амжилт ${hardestQuestion.value}% байна.`,
        tone: hardestQuestion.value < 40 ? "warning" : "neutral",
      });
    }

    insights.push({
      title:
        passRate >= 70
          ? "Ерөнхий дүн сайн байна"
          : "Ерөнхий гүйцэтгэл анхаарах түвшинд байна",
      description:
        submittedCount === 0
          ? "Одоогоор community-д харуулах илгээсэн оролдлого алга."
          : `Тэнцсэн хувь ${passRate}%, дундаж амжилт ${averagePercent}%, хамрагдалт ${completionRate}% байна.`,
      tone: passRate >= 70 ? "success" : "warning",
    });

    const overallConclusion =
      submittedCount === 0
        ? "Одоогоор илгээсэн оролдлого байхгүй тул нэгтгэсэн анализ хараахан бүрдээгүй."
        : weakestTopic && hardestQuestion
          ? `${submittedCount} оролдлогын үндсэн дээр дундаж амжилт ${averagePercent}% байна. Хамгийн сул сэдэв нь ${weakestTopic.label}, харин хамгийн их алдаа гарсан асуулт нь ${hardestQuestion.label} байлаа.`
          : `${submittedCount} оролдлогын үндсэн дээр дундаж амжилт ${averagePercent}% байна.`;

    return {
      examId: examMeta.exam_id,
      communityId:
        explicitContext?.community_id ??
        implicitContext?.community_id ??
        requestedCommunityContext?.id ??
        null,
      communityName:
        explicitContext?.community_name ??
        implicitContext?.community_name ??
        requestedCommunityContext?.name ??
        null,
      title: examMeta.title,
      description: examMeta.description,
      subject: examMeta.subject,
      grade: examMeta.grade,
      className: examMeta.class_name,
      status: examMeta.status,
      durationMinutes: examMeta.duration_minutes,
      questionCount: examMeta.question_count ?? 0,
      totalPoints,
      passingCriteriaType: examMeta.passing_criteria_type,
      passingThreshold: examMeta.passing_threshold,
      createdAt: examMeta.created_at,
      sharedAt: explicitContext?.shared_at ?? null,
      sharedBy: explicitContext?.shared_by_id
        ? async () => toUser(await findUser(db, explicitContext.shared_by_id))
        : null,
      questions: questions.map((question) => ({
        id: question.question_id,
        order: question.display_order,
        prompt: question.prompt || question.title,
        type: question.type,
        options: parseJsonArray(question.options_json),
        correctAnswer: question.correct_answer,
        points: question.points,
        topic: question.topic,
        tags: parseJsonArray(question.tags_json),
      })),
      summary: {
        studentCount,
        submittedCount,
        averagePercent,
        passRate,
        highestPercent,
        lowestPercent,
        completionRate,
      },
      scoreDistribution,
      topicPerformance,
      questionPerformance: questionPerformance.slice(0, 6),
      insights,
      overallConclusion,
    };
  };

  const getCommunityHome = async (actor: UserRow) => {
    const communityIds = await getAccessibleCommunityIds(actor);
    if (communityIds.length === 0) {
      return {
        stats: {
          totalCommunities: 0,
          totalSharedBanks: 0,
          totalCopies: 0,
          activeTeachers: 0,
        },
        weeklyActivity: [],
        trendingBanks: [],
        topExams: [],
        mostMissedQuestions: [],
      };
    }

    const placeholders = createPlaceholders(communityIds.length);
    const totalSharedBanks =
      (
        await first<{ count: number | null }>(
          db,
          `SELECT COUNT(*) AS count
           FROM community_shared_banks
           WHERE community_id IN (${placeholders})
             AND status != 'ARCHIVED'`,
          communityIds,
        )
      )?.count ?? 0;

    const totalCopies =
      (
        await first<{ count: number | null }>(
          db,
          `SELECT COUNT(*) AS count
           FROM community_usage_events
           WHERE community_id IN (${placeholders})
             AND event_type = 'COPY_BANK'`,
          communityIds,
        )
      )?.count ?? 0;

    const activeTeachers =
      (
        await first<{ count: number | null }>(
          db,
          `SELECT COUNT(DISTINCT user_id) AS count
           FROM community_members
           WHERE community_id IN (${placeholders})`,
          communityIds,
        )
      )?.count ?? 0;

    const trendingBanks = await all<CommunityTrendingBankRow>(
      db,
      `SELECT
        csb.id AS shared_bank_id,
        c.id AS community_id,
        c.name AS community_name,
        qb.id AS bank_id,
        COUNT(cue.id) AS copy_count
       FROM community_shared_banks csb
       JOIN communities c ON c.id = csb.community_id
       JOIN question_banks qb ON qb.id = csb.bank_id
       LEFT JOIN community_usage_events cue
         ON cue.entity_type = 'SHARED_BANK'
        AND cue.entity_id = csb.id
        AND cue.event_type = 'COPY_BANK'
       WHERE csb.community_id IN (${placeholders})
         AND csb.status != 'ARCHIVED'
       GROUP BY csb.id, c.id, c.name, qb.id
       ORDER BY copy_count DESC, csb.created_at DESC
       LIMIT 6`,
      communityIds,
    );

    const topExams = await all<CommunityTrendingExamRow>(
      db,
      `SELECT
        e.id AS exam_id,
        e.title,
        cl.subject,
        cl.grade,
        COUNT(a.id) AS attempt_count,
        CAST(
          ROUND(
            AVG(
              CASE
                WHEN score_totals.total_points > 0
                  THEN (a.total_score * 100.0) / score_totals.total_points
                ELSE NULL
              END
            )
          ) AS INTEGER
        ) AS average_score_percent,
        e.created_by_id,
        (
          SELECT c.id
          FROM communities c
          JOIN community_members cm
            ON cm.community_id = c.id
           AND cm.user_id = e.created_by_id
          WHERE c.id IN (${placeholders})
            AND c.subject = cl.subject
            AND (c.grade = 0 OR c.grade = cl.grade)
          ORDER BY c.created_at ASC
          LIMIT 1
        ) AS community_id,
        (
          SELECT c.name
          FROM communities c
          JOIN community_members cm
            ON cm.community_id = c.id
           AND cm.user_id = e.created_by_id
          WHERE c.id IN (${placeholders})
            AND c.subject = cl.subject
            AND (c.grade = 0 OR c.grade = cl.grade)
          ORDER BY c.created_at ASC
          LIMIT 1
        ) AS community_name
       FROM exams e
       JOIN classes cl ON cl.id = e.class_id
       JOIN attempts a ON a.exam_id = e.id
       LEFT JOIN (
         SELECT exam_id, SUM(points) AS total_points
         FROM exam_questions
         GROUP BY exam_id
       ) score_totals ON score_totals.exam_id = e.id
       WHERE e.status != 'DRAFT'
         AND EXISTS (
           SELECT 1
           FROM community_members cm
           JOIN communities c ON c.id = cm.community_id
           WHERE c.id IN (${placeholders})
             AND cm.user_id = e.created_by_id
             AND c.subject = cl.subject
             AND (c.grade = 0 OR c.grade = cl.grade)
         )
       GROUP BY e.id, e.title, cl.subject, cl.grade, e.created_by_id
       ORDER BY attempt_count DESC, average_score_percent DESC, e.created_at DESC
       LIMIT 5`,
      [...communityIds, ...communityIds, ...communityIds],
    );

    const mostMissedQuestions = await all<CommunityQuestionInsightRow>(
      db,
      `SELECT
        q.id AS question_id,
        q.prompt,
        qb.subject,
        qb.grade,
        qb.topic,
        qb.title AS bank_title,
        c.id AS community_id,
        c.name AS community_name,
        COUNT(ans.id) AS attempt_count,
        CAST(
          ROUND(
            SUM(
              CASE
                WHEN COALESCE(ans.manual_score, ans.auto_score, 0) > 0 THEN 0
                ELSE 1
              END
            ) * 100.0 / COUNT(ans.id)
          ) AS INTEGER
        ) AS miss_rate
       FROM community_shared_banks csb
       JOIN communities c ON c.id = csb.community_id
       JOIN question_banks qb ON qb.id = csb.bank_id
       JOIN questions q ON q.bank_id = qb.id
       JOIN answers ans ON ans.question_id = q.id
       JOIN attempts a ON a.id = ans.attempt_id
       JOIN exam_questions eq
         ON eq.exam_id = a.exam_id
        AND eq.question_id = q.id
       WHERE csb.community_id IN (${placeholders})
         AND csb.status != 'ARCHIVED'
       GROUP BY q.id, q.prompt, qb.subject, qb.grade, qb.topic, qb.title, c.id, c.name
       HAVING COUNT(ans.id) >= 3
       ORDER BY miss_rate DESC, attempt_count DESC, q.created_at DESC
       LIMIT 5`,
      communityIds,
    );

    const weeklyRows = await all<CommunityActivityRow>(
      db,
      `SELECT
        substr(created_at, 1, 10) AS day,
        COUNT(*) AS value
       FROM community_usage_events
       WHERE community_id IN (${placeholders})
         AND created_at >= datetime('now', '-6 days')
       GROUP BY substr(created_at, 1, 10)
       ORDER BY day ASC`,
      communityIds,
    );

    const activityMap = new Map(
      weeklyRows.map((row) => [row.day, row.value ?? 0]),
    );
    const weeklyActivity = Array.from({ length: 7 }, (_, index) => {
      const current = new Date();
      current.setUTCDate(current.getUTCDate() - (6 - index));
      const dayKey = current.toISOString().slice(0, 10);
      const label = `${current.getUTCMonth() + 1}/${current.getUTCDate()}`;
      return {
        label,
        value: activityMap.get(dayKey) ?? 0,
      };
    });

    return {
      stats: {
        totalCommunities: communityIds.length,
        totalSharedBanks,
        totalCopies,
        activeTeachers,
      },
      weeklyActivity,
      trendingBanks: await Promise.all(
        trendingBanks.map(async (row) => ({
          sharedBankId: row.shared_bank_id,
          copyCount: row.copy_count ?? 0,
          communityId: row.community_id,
          communityName: row.community_name,
          bank: async () =>
            buildVisibleQuestionBankObject({
              actor,
              bank: await findQuestionBank(db, row.bank_id),
              communityAccessible: true,
              db,
              findUser,
              toUser,
            }),
        })),
      ),
      topExams: await Promise.all(
        topExams.map(async (row) => ({
          examId: row.exam_id,
          title: row.title,
          subject: row.subject,
          grade: row.grade,
          attemptCount: row.attempt_count ?? 0,
          averageScorePercent: row.average_score_percent ?? 0,
          createdBy: async () => toUser(await findUser(db, row.created_by_id)),
          communityId: row.community_id,
          communityName: row.community_name,
        })),
      ),
      mostMissedQuestions: mostMissedQuestions.map((row) => ({
        questionId: row.question_id,
        prompt: row.prompt,
        subject: row.subject,
        grade: row.grade,
        topic: row.topic,
        bankTitle: row.bank_title,
        communityId: row.community_id,
        communityName: row.community_name,
        attemptCount: row.attempt_count ?? 0,
        missRate: row.miss_rate ?? 0,
      })),
    };
  };

  const toCommunityMember = (row: CommunityMemberRow) => ({
    id: row.id,
    role: row.role,
    joinedAt: row.joined_at,
    user: async () => toUser(await findUser(db, row.user_id)),
  });

const toCommunitySharedBank = (
  row: CommunitySharedBankRow,
  viewer: UserRow | null,
) => ({
  id: row.id,
  status: row.status,
  copyCount: async () => countCommunitySharedBankCopies(db, row.id),
  ratingCount: async () =>
      (await getCommunityRatingSummary(db, row.community_id, "SHARED_BANK", row.id, viewer?.id ?? null))
        .ratingCount,
  averageRating: async () =>
      (await getCommunityRatingSummary(db, row.community_id, "SHARED_BANK", row.id, viewer?.id ?? null))
        .averageRating,
  viewerRating: async () =>
      (await getCommunityRatingSummary(db, row.community_id, "SHARED_BANK", row.id, viewer?.id ?? null))
        .viewerRating,
  createdAt: row.created_at,
  sharedBy: async () => toUser(await findUser(db, row.shared_by_id)),
  bank: async () =>
      buildVisibleQuestionBankObject({
        actor:
          viewer ??
          ({
            id: "__community-viewer__",
            full_name: "Community Viewer",
            email: "",
            role: "TEACHER",
            created_at: row.created_at,
          } satisfies UserRow),
        bank: await findQuestionBank(db, row.bank_id),
        communityAccessible: true,
        db,
        findUser,
        toUser,
      }),
    comments: async () =>
      (await listCommunityComments(db, row.community_id, "SHARED_BANK", row.id)).map(
        toCommunityComment,
      ),
  });

  const toCommunitySharedExam = (
    row: CommunitySharedExamListRow,
    viewerId: string | null,
  ) => ({
    id: row.shared_exam_id,
    examId: row.exam_id,
    title: row.title,
    description: row.description,
    subject: row.subject,
    grade: row.grade,
    className: row.class_name,
    status: row.status,
    durationMinutes: row.duration_minutes,
    questionCount: row.question_count ?? 0,
    attemptCount: row.attempt_count ?? 0,
    averageScorePercent: row.average_score_percent ?? 0,
    ratingCount: async () =>
      (
        await getCommunityRatingSummary(
          db,
          row.community_id,
          "SHARED_EXAM",
          row.shared_exam_id,
          viewerId,
        )
      ).ratingCount,
    averageRating: async () =>
      (
        await getCommunityRatingSummary(
          db,
          row.community_id,
          "SHARED_EXAM",
          row.shared_exam_id,
          viewerId,
        )
      ).averageRating,
    viewerRating: async () =>
      (
        await getCommunityRatingSummary(
          db,
          row.community_id,
          "SHARED_EXAM",
          row.shared_exam_id,
          viewerId,
        )
      ).viewerRating,
    createdAt: row.created_at,
    sharedBy: async () => toUser(await findUser(db, row.shared_by_id)),
    comments: async () =>
      (await listCommunityComments(db, row.community_id, "SHARED_EXAM", row.shared_exam_id)).map(
        toCommunityComment,
      ),
  });

  const toCommunityComment = (row: CommunityCommentRow) => ({
    id: row.id,
    entityType: row.entity_type,
    entityId: row.entity_id,
    body: row.body,
    createdAt: row.created_at,
    author: async () => toUser(await findUser(db, row.author_user_id)),
  });

  const toCommunityContributor = (row: CommunityContributorRow) => ({
    user: async () => toUser(await findUser(db, row.user_id)),
    role: row.role,
    sharedBankCount: row.shared_bank_count ?? 0,
    sharedExamCount: row.shared_exam_count ?? 0,
    commentCount: row.comment_count ?? 0,
    score:
      (row.shared_exam_count ?? 0) * 5 +
      (row.shared_bank_count ?? 0) * 3 +
      (row.comment_count ?? 0),
  });

  const toCommunity = async (row: CommunityRow, viewerId: string | null) => {
    const viewerRole = viewerId
      ? (await findCommunityMember(db, row.id, viewerId))?.role ?? null
      : null;
    const viewer = viewerId ? await findUser(db, viewerId) : null;

    return {
      id: row.id,
      name: row.name,
      description: row.description,
      subject: row.subject,
      grade: row.grade,
      visibility: row.visibility,
      viewerRole,
      memberCount: async () => countCommunityMembers(db, row.id),
      sharedBankCount: async () => countCommunitySharedBanks(db, row.id),
      sharedExamCount: async () => countCommunitySharedExams(db, row.id),
      owner: async () => toUser(await findUser(db, row.owner_id)),
      members: async () => (await listCommunityMembers(db, row.id)).map(toCommunityMember),
      sharedBanks: async () =>
        (await listCommunitySharedBanks(db, row.id)).map((item) =>
          toCommunitySharedBank(item, viewer),
        ),
      sharedExams: async () =>
        (await listCommunitySharedExams(db, row.id)).map((item) =>
          toCommunitySharedExam(item, viewerId),
        ),
      topContributors: async () =>
        (await listCommunityTopContributors(db, row.id)).map(toCommunityContributor),
      createdAt: row.created_at,
    };
  };

  return {
    communityHome: async (_args: unknown, context: RequestContext) => {
      const actor = await requireActor(context, ["ADMIN", "TEACHER"]);
      return getCommunityHome(actor);
    },
    communities: async (_args: unknown, context: RequestContext) => {
      const actor = await requireActor(context, ["ADMIN", "TEACHER"]);
      const rows = await listCommunitiesForActor(db, actor);
      return Promise.all(rows.map((row) => toCommunity(row, actor.id)));
    },
    community: async ({ id }: ByIdArgs, context: RequestContext) => {
      const actor = await requireActor(context, ["ADMIN", "TEACHER"]);
      const row = await findAccessibleCommunity(db, id, actor);
      return row ? toCommunity(row, actor.id) : null;
    },
    communityExamPreview: async (
      { examId, communityId }: CommunityExamPreviewArgs,
      context: RequestContext,
    ) => {
      const actor = await requireActor(context, ["ADMIN", "TEACHER"]);
      return getCommunityExamPreview(actor, examId, communityId ?? null);
    },
    createCommunity: async (
      { name, description, subject, grade, visibility }: CreateCommunityArgs,
      context: RequestContext,
    ) => {
      const actor = await requireActor(context, ["ADMIN", "TEACHER"]);
      const communityId = makeId("community");
      const joinedAt = now();
      const trimmedName = name.trim();
      invariant(trimmedName.length >= 3, "Community нэр хамгийн багадаа 3 тэмдэгт байна.");

      await run(
        db,
        `INSERT INTO communities (
          id,
          name,
          description,
          subject,
          grade,
          visibility,
          owner_id,
          created_at
        )
        VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          communityId,
          trimmedName,
          description?.trim() || null,
          subject?.trim() || "Ерөнхий",
          grade ?? 0,
          visibility ?? "PUBLIC",
          actor.id,
          joinedAt,
        ],
      );

      await run(
        db,
        `INSERT INTO community_members (
          id,
          community_id,
          user_id,
          role,
          joined_at
        )
        VALUES (?, ?, ?, ?, ?)`,
        [makeId("community_member"), communityId, actor.id, "OWNER", joinedAt],
      );

      await recordCommunityUsageEvent(db, {
        communityId,
        actorUserId: actor.id,
        eventType: "CREATE_COMMUNITY",
        entityType: "COMMUNITY",
        entityId: communityId,
        metadata: {
          subject: subject?.trim() || "Ерөнхий",
          grade: grade ?? 0,
        },
        createdAt: joinedAt,
      });

      return toCommunity(await findCommunityById(db, communityId), actor.id);
    },
    joinCommunity: async (
      { communityId }: JoinCommunityArgs,
      context: RequestContext,
    ) => {
      const actor = await requireActor(context, ["ADMIN", "TEACHER"]);
      const community = await findCommunityById(db, communityId);
      const existingMember = await findCommunityMember(db, communityId, actor.id);
      if (!existingMember) {
        const joinedAt = now();
        invariant(
          actor.role === "ADMIN" || community.visibility === "PUBLIC" || community.owner_id === actor.id,
          "Private community-д нэгдэх боломжгүй.",
        );
        await run(
          db,
          `INSERT INTO community_members (
            id,
            community_id,
            user_id,
            role,
            joined_at
          )
          VALUES (?, ?, ?, ?, ?)`,
          [makeId("community_member"), communityId, actor.id, "MEMBER", joinedAt],
        );
        await recordCommunityUsageEvent(db, {
          communityId,
          actorUserId: actor.id,
          eventType: "JOIN_COMMUNITY",
          entityType: "COMMUNITY",
          entityId: communityId,
          createdAt: joinedAt,
        });
      }

      return toCommunity(community, actor.id);
    },
    shareQuestionBankToCommunity: async (
      { communityId, bankId }: ShareQuestionBankToCommunityArgs,
      context: RequestContext,
    ) => {
      const actor = await requireActor(context, ["ADMIN", "TEACHER"]);
      const community = await findCommunityById(db, communityId);
      const membership = await findCommunityMember(db, communityId, actor.id);
      invariant(
        actor.role === "ADMIN" || membership !== null || community.owner_id === actor.id,
        "Community-д bank share хийхийн тулд эхлээд нэгдэнэ үү.",
      );

      const bank = await findQuestionBank(db, bankId);
      if (actor.role === "TEACHER") {
        invariant(
          bank.owner_id === actor.id,
          "Та зөвхөн өөрийн My Bank-ийг community руу share хийж болно.",
        );
      }

      const existing = await first<CommunitySharedBankRow>(
        db,
        `SELECT
          ${communitySharedBankSelectFields}
         FROM community_shared_banks
         WHERE community_id = ? AND bank_id = ?`,
        [communityId, bankId],
      );

      if (existing) {
        if (existing.status === "ARCHIVED") {
          const revivedAt = now();
          await run(
            db,
            `UPDATE community_shared_banks
             SET status = 'ACTIVE', shared_by_id = ?, created_at = ?
             WHERE id = ?`,
            [actor.id, revivedAt, existing.id],
          );
          await recordCommunityUsageEvent(db, {
            communityId,
            actorUserId: actor.id,
            eventType: "SHARE_BANK",
            entityType: "SHARED_BANK",
            entityId: existing.id,
            metadata: { bankId },
            createdAt: revivedAt,
          });
          const revived = await first<CommunitySharedBankRow>(
            db,
            `SELECT
              ${communitySharedBankSelectFields}
             FROM community_shared_banks
             WHERE id = ?`,
            [existing.id],
          );
          invariant(revived, "Shared bank not found after update.");
          return toCommunitySharedBank(revived, actor);
        }
        return toCommunitySharedBank(existing, actor);
      }

      const sharedBankId = makeId("community_shared_bank");
      const sharedAt = now();
      await run(
        db,
        `INSERT INTO community_shared_banks (
          id,
          community_id,
          bank_id,
          shared_by_id,
          status,
          created_at
        )
        VALUES (?, ?, ?, ?, ?, ?)`,
        [sharedBankId, communityId, bankId, actor.id, "ACTIVE", sharedAt],
      );
      await recordCommunityUsageEvent(db, {
        communityId,
        actorUserId: actor.id,
        eventType: "SHARE_BANK",
        entityType: "SHARED_BANK",
        entityId: sharedBankId,
        metadata: { bankId },
        createdAt: sharedAt,
      });

      const sharedBank = await first<CommunitySharedBankRow>(
        db,
        `SELECT
          ${communitySharedBankSelectFields}
         FROM community_shared_banks
         WHERE id = ?`,
        [sharedBankId],
      );
      invariant(sharedBank, "Shared bank was not created.");
      return toCommunitySharedBank(sharedBank, actor);
    },
    shareExamToCommunity: async (
      { communityId, examId }: ShareExamToCommunityArgs,
      context: RequestContext,
    ) => {
      const actor = await requireActor(context, ["ADMIN", "TEACHER"]);
      const community = await findCommunityById(db, communityId);
      const membership = await findCommunityMember(db, communityId, actor.id);
      invariant(
        actor.role === "ADMIN" || membership !== null || community.owner_id === actor.id,
        "Community-д шалгалт share хийхийн тулд эхлээд нэгдэнэ үү.",
      );

      const exam = await first<{
        id: string;
        created_by_id: string;
        status: string;
        class_id: string;
      }>(
        db,
        `SELECT id, created_by_id, status, class_id
         FROM exams
         WHERE id = ?`,
        [examId],
      );
      invariant(exam, "Шалгалт олдсонгүй.");
      invariant(exam.status !== "DRAFT", "Ноорог шалгалтыг community руу share хийхгүй.");
      if (actor.role === "TEACHER") {
        invariant(
          exam.created_by_id === actor.id,
          "Та зөвхөн өөрийн шалгалтыг community руу share хийж болно.",
        );
      }

      const questionCount =
        (
          await first<{ count: number | null }>(
            db,
            "SELECT COUNT(*) AS count FROM exam_questions WHERE exam_id = ?",
            [examId],
          )
        )?.count ?? 0;
      invariant(questionCount > 0, "Асуултгүй шалгалтыг community руу share хийхгүй.");

      const existing = await first<CommunitySharedExamRow>(
        db,
        `SELECT
          ${communitySharedExamSelectFields}
         FROM community_shared_exams
         WHERE community_id = ? AND exam_id = ?`,
        [communityId, examId],
      );
      if (existing) {
        const existingRow = await first<CommunitySharedExamListRow>(
          db,
          `SELECT
            cse.id AS shared_exam_id,
            cse.community_id,
            cse.exam_id,
            e.title,
            e.description,
            cl.subject,
            cl.grade,
            cl.name AS class_name,
            e.status,
            e.duration_minutes,
            cse.shared_by_id,
            cse.created_at,
            COALESCE(question_totals.question_count, 0) AS question_count,
            COALESCE(attempt_totals.attempt_count, 0) AS attempt_count,
            COALESCE(attempt_totals.average_score_percent, 0) AS average_score_percent
           FROM community_shared_exams cse
           JOIN exams e ON e.id = cse.exam_id
           JOIN classes cl ON cl.id = e.class_id
           LEFT JOIN (
             SELECT exam_id, COUNT(*) AS question_count
             FROM exam_questions
             GROUP BY exam_id
           ) question_totals ON question_totals.exam_id = e.id
           LEFT JOIN (
             SELECT
               a.exam_id,
               COUNT(*) AS attempt_count,
               CAST(
                 ROUND(
                   AVG(
                     CASE
                       WHEN point_totals.total_points > 0
                         THEN (a.total_score * 100.0) / point_totals.total_points
                       ELSE NULL
                     END
                   )
                 ) AS INTEGER
               ) AS average_score_percent
             FROM attempts a
             JOIN (
               SELECT exam_id, SUM(points) AS total_points
               FROM exam_questions
               GROUP BY exam_id
             ) point_totals ON point_totals.exam_id = a.exam_id
             WHERE a.status != 'IN_PROGRESS'
             GROUP BY a.exam_id
           ) attempt_totals ON attempt_totals.exam_id = e.id
           WHERE cse.id = ?`,
          [existing.id],
        );
        invariant(existingRow, "Shared exam not found.");
        return toCommunitySharedExam(existingRow, actor.id);
      }

      const sharedExamId = makeId("community_shared_exam");
      const sharedAt = now();
      await run(
        db,
        `INSERT INTO community_shared_exams (
          id,
          community_id,
          exam_id,
          shared_by_id,
          created_at
        )
        VALUES (?, ?, ?, ?, ?)`,
        [sharedExamId, communityId, examId, actor.id, sharedAt],
      );

      const sharedExam = (
        await listCommunitySharedExams(db, communityId)
      ).find((row) => row.shared_exam_id === sharedExamId);
      invariant(sharedExam, "Shared exam was not created.");
      return toCommunitySharedExam(sharedExam, actor.id);
    },
    addCommunityComment: async (
      { communityId, entityType, entityId, body }: AddCommunityCommentArgs,
      context: RequestContext,
    ) => {
      const actor = await requireActor(context, ["ADMIN", "TEACHER"]);
      const community = await findCommunityById(db, communityId);
      const membership = await findCommunityMember(db, communityId, actor.id);
      invariant(
        actor.role === "ADMIN" || membership !== null || community.owner_id === actor.id,
        "Comment хийхийн тулд эхлээд энэ community-д нэгдэнэ үү.",
      );

      const trimmedBody = body.trim();
      invariant(trimmedBody.length >= 2, "Comment хамгийн багадаа 2 тэмдэгт байна.");

      if (entityType === "SHARED_BANK") {
        const sharedBank = await first<CommunitySharedBankRow>(
          db,
          `SELECT
            ${communitySharedBankSelectFields}
           FROM community_shared_banks
           WHERE id = ? AND community_id = ? AND status != 'ARCHIVED'`,
          [entityId, communityId],
        );
        invariant(sharedBank, "Comment үлдээх shared bank олдсонгүй.");
      } else {
        const sharedExam = await first<CommunitySharedExamRow>(
          db,
          `SELECT
            ${communitySharedExamSelectFields}
           FROM community_shared_exams
           WHERE id = ? AND community_id = ?`,
          [entityId, communityId],
        );
        invariant(sharedExam, "Comment үлдээх shared exam олдсонгүй.");
      }

      const commentId = makeId("community_comment");
      const createdAt = now();
      await run(
        db,
        `INSERT INTO community_comments (
          id,
          community_id,
          author_user_id,
          entity_type,
          entity_id,
          body,
          created_at
        )
        VALUES (?, ?, ?, ?, ?, ?, ?)`,
        [commentId, communityId, actor.id, entityType, entityId, trimmedBody, createdAt],
      );

      const comment = await first<CommunityCommentRow>(
        db,
        `SELECT
          id,
          community_id,
          author_user_id,
          entity_type,
          entity_id,
          body,
          created_at
         FROM community_comments
         WHERE id = ?`,
        [commentId],
      );
      invariant(comment, "Comment хадгалж чадсангүй.");
      return toCommunityComment(comment);
    },
    rateCommunityItem: async (
      { communityId, entityType, entityId, value }: RateCommunityItemArgs,
      context: RequestContext,
    ) => {
      const actor = await requireActor(context, ["ADMIN", "TEACHER"]);
      const community = await findCommunityById(db, communityId);
      const membership = await findCommunityMember(db, communityId, actor.id);
      invariant(
        actor.role === "ADMIN" || membership !== null || community.owner_id === actor.id,
        "Үнэлгээ өгөхийн тулд эхлээд энэ community-д нэгдэнэ үү.",
      );
      invariant(value >= 1 && value <= 5, "Үнэлгээ 1-5 хооронд байна.");

      if (entityType === "SHARED_BANK") {
        const sharedBank = await first<CommunitySharedBankRow>(
          db,
          `SELECT
            ${communitySharedBankSelectFields}
           FROM community_shared_banks
           WHERE id = ? AND community_id = ? AND status != 'ARCHIVED'`,
          [entityId, communityId],
        );
        invariant(sharedBank, "Үнэлгээ өгөх сан олдсонгүй.");
      } else {
        const sharedExam = await first<CommunitySharedExamRow>(
          db,
          `SELECT
            ${communitySharedExamSelectFields}
           FROM community_shared_exams
           WHERE id = ? AND community_id = ?`,
          [entityId, communityId],
        );
        invariant(sharedExam, "Үнэлгээ өгөх шалгалт олдсонгүй.");
      }

      const existing = await first<CommunityRatingRow>(
        db,
        `SELECT
          id,
          community_id,
          entity_type,
          entity_id,
          user_id,
          value,
          created_at,
          updated_at
         FROM community_ratings
         WHERE community_id = ?
           AND entity_type = ?
           AND entity_id = ?
           AND user_id = ?`,
        [communityId, entityType, entityId, actor.id],
      );

      const timestamp = now();
      if (existing) {
        await run(
          db,
          `UPDATE community_ratings
           SET value = ?, updated_at = ?
           WHERE id = ?`,
          [value, timestamp, existing.id],
        );
      } else {
        await run(
          db,
          `INSERT INTO community_ratings (
            id,
            community_id,
            entity_type,
            entity_id,
            user_id,
            value,
            created_at,
            updated_at
          )
          VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
          [
            makeId("community_rating"),
            communityId,
            entityType,
            entityId,
            actor.id,
            value,
            timestamp,
            timestamp,
          ],
        );
      }

      return true;
    },
    copyCommunitySharedBankToMyBank: async (
      { sharedBankId }: CopyCommunitySharedBankToMyBankArgs,
      context: RequestContext,
    ) => {
      const actor = await requireActor(context, ["ADMIN", "TEACHER"]);
      const sharedBank = await first<CommunitySharedBankRow>(
        db,
        `SELECT
          ${communitySharedBankSelectFields}
         FROM community_shared_banks
         WHERE id = ? AND status != 'ARCHIVED'`,
        [sharedBankId],
      );
      invariant(sharedBank, "Shared bank not found.");

      const community = await findCommunityById(db, sharedBank.community_id);
      const membership = await findCommunityMember(db, community.id, actor.id);
      invariant(
        actor.role === "ADMIN" || community.visibility === "PUBLIC" || membership !== null || community.owner_id === actor.id,
        "Энэ community-ийн shared bank-ийг ашиглах эрх алга.",
      );

      const sourceBank = await findQuestionBank(db, sharedBank.bank_id);
      const copiedBankId = makeId("bank");
      const copiedAt = now();
      const nextTitle = `${sourceBank.title} (Community Copy)`;

      await run(
        db,
        `INSERT INTO question_banks (
          id,
          title,
          description,
          grade,
          subject,
          topic,
          visibility,
          owner_id,
          created_at
        )
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          copiedBankId,
          nextTitle,
          sourceBank.description,
          sourceBank.grade,
          sourceBank.subject,
          sourceBank.topic,
          "PRIVATE",
          actor.id,
          copiedAt,
        ],
      );

      const questions = await all<QuestionRow>(
        db,
        `SELECT
          ${questionSelectFields}
         FROM questions
         WHERE bank_id = ?
         ORDER BY created_at ASC`,
        [sourceBank.id],
      );

      for (const question of questions) {
        const nextTags = [
          ...parseJsonArray(question.tags_json),
          `copied_from_bank:${sourceBank.id}`,
          `copied_from_shared_bank:${sharedBank.id}`,
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
          VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
          [
            makeId("question"),
            copiedBankId,
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
            copiedAt,
          ],
        );
      }

      await recordCommunityUsageEvent(db, {
        communityId: community.id,
        actorUserId: actor.id,
        eventType: "COPY_BANK",
        entityType: "SHARED_BANK",
        entityId: sharedBank.id,
        metadata: {
          sourceBankId: sourceBank.id,
          copiedBankId,
        },
        createdAt: copiedAt,
      });

      return toQuestionBank(db, await findQuestionBank(db, copiedBankId));
    },
  };
};
