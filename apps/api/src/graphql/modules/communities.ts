import { all, first, invariant, run, type D1DatabaseLike } from "../../lib/d1";
import type { RequestContext } from "../../auth";
import {
  makeId,
  now,
  parseJsonArray,
  toJsonArray,
  type ByIdArgs,
  type CommunityMemberRole,
  type CommunityMemberRow,
  type CommunityRow,
  type CommunitySharedBankRow,
  type CommunityVisibility,
  type CopyCommunitySharedBankToMyBankArgs,
  type CreateCommunityArgs,
  type JoinCommunityArgs,
  type QuestionBankRow,
  type QuestionRow,
  type Role,
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

const questionSelectFields = `id,
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
  const toCommunityMember = (row: CommunityMemberRow) => ({
    id: row.id,
    role: row.role,
    joinedAt: row.joined_at,
    user: async () => toUser(await findUser(db, row.user_id)),
  });

  const toCommunitySharedBank = (row: CommunitySharedBankRow) => ({
    id: row.id,
    status: row.status,
    createdAt: row.created_at,
    sharedBy: async () => toUser(await findUser(db, row.shared_by_id)),
    bank: async () => toQuestionBank(db, await findQuestionBank(db, row.bank_id)),
  });

  const toCommunity = async (row: CommunityRow, viewerId: string | null) => {
    const viewerRole = viewerId
      ? (await findCommunityMember(db, row.id, viewerId))?.role ?? null
      : null;

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
      owner: async () => toUser(await findUser(db, row.owner_id)),
      members: async () => (await listCommunityMembers(db, row.id)).map(toCommunityMember),
      sharedBanks: async () => (await listCommunitySharedBanks(db, row.id)).map(toCommunitySharedBank),
      createdAt: row.created_at,
    };
  };

  return {
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
          [makeId("community_member"), communityId, actor.id, "MEMBER", now()],
        );
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
          await run(
            db,
            `UPDATE community_shared_banks
             SET status = 'ACTIVE', shared_by_id = ?, created_at = ?
             WHERE id = ?`,
            [actor.id, now(), existing.id],
          );
          const revived = await first<CommunitySharedBankRow>(
            db,
            `SELECT
              ${communitySharedBankSelectFields}
             FROM community_shared_banks
             WHERE id = ?`,
            [existing.id],
          );
          invariant(revived, "Shared bank not found after update.");
          return toCommunitySharedBank(revived);
        }
        return toCommunitySharedBank(existing);
      }

      const sharedBankId = makeId("community_shared_bank");
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
        [sharedBankId, communityId, bankId, actor.id, "ACTIVE", now()],
      );

      const sharedBank = await first<CommunitySharedBankRow>(
        db,
        `SELECT
          ${communitySharedBankSelectFields}
         FROM community_shared_banks
         WHERE id = ?`,
        [sharedBankId],
      );
      invariant(sharedBank, "Shared bank was not created.");
      return toCommunitySharedBank(sharedBank);
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
            type,
            title,
            prompt,
            options_json,
            correct_answer,
            difficulty,
            tags_json,
            created_by_id,
            created_at
          )
          VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
          [
            makeId("question"),
            copiedBankId,
            question.type,
            question.title,
            question.prompt,
            question.options_json,
            question.correct_answer,
            question.difficulty,
            toJsonArray([...new Set(nextTags)]),
            actor.id,
            copiedAt,
          ],
        );
      }

      return toQuestionBank(db, await findQuestionBank(db, copiedBankId));
    },
  };
};
