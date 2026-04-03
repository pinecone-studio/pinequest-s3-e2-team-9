/*eslint-disable max-lines*/
"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import {
  CommunityCommentEntityType,
  CommunityVisibility,
  useAddCommunityCommentActionMutation,
  useCommunityDetailQuery,
  useCommunityOverviewQuery,
  useMyExamsSectionQueryQuery,
  useCopyCommunitySharedBankToMyBankActionMutation,
  useJoinCommunityActionMutation,
  useRateCommunityItemActionMutation,
  useShareExamToCommunityActionMutation,
  useShareQuestionBankToCommunityActionMutation,
} from "@/graphql/generated";
import { TEACHER_COMMON_TEXT } from "../teacher-ui";
import { CommunityBankPreviewDialog } from "./community-bank-preview-dialog";
import { CommunityExamPreviewDialog } from "./community-exam-preview-dialog";

const formatGradeLabel = (grade: number) =>
  grade > 0 ? `${grade}-р анги` : "Бүх анги";

const formatVisibilityLabel = (visibility: CommunityVisibility) =>
  visibility === CommunityVisibility.Public ? "Нээлттэй" : "Хаалттай";

const formatSharedBankStatusLabel = (status: string) => {
  if (status === "ACTIVE") return "Идэвхтэй";
  if (status === "FEATURED") return "Онцолсон";
  if (status === "ARCHIVED") return "Архивласан";
  return status;
};

const formatExamStatusLabel = (status: string) => {
  if (status === "DRAFT") return "Ноорог";
  if (status === "PUBLISHED") return "Нээлттэй";
  if (status === "CLOSED") return "Хаагдсан";
  return status;
};

const truncate = (value: string, maxLength = 84) =>
  value.length > maxLength ? `${value.slice(0, maxLength).trim()}...` : value;

const extractSchoolName = (value: string) => {
  const [prefix] = value.split("·");
  return prefix?.trim() ?? value.trim();
};

const getSubjectTheme = (subject: string) => {
  const normalized = subject.trim().toLowerCase();

  if (normalized.includes("мат")) {
    return {
      surface: "from-[#EEF4FF] to-[#F8FBFF]",
      border: "border-[#C7D7FE]",
      badge: "bg-[#EEF4FF] text-[#1D4ED8]",
      glow: "shadow-[0px_10px_24px_-18px_rgba(29,78,216,0.45)]",
    };
  }

  if (normalized.includes("физ")) {
    return {
      surface: "from-[#ECFDF3] to-[#F6FFF9]",
      border: "border-[#B7E5C2]",
      badge: "bg-[#ECFDF3] text-[#067647]",
      glow: "shadow-[0px_10px_24px_-18px_rgba(6,118,71,0.45)]",
    };
  }

  if (normalized.includes("монгол")) {
    return {
      surface: "from-[#FFF4ED] to-[#FFF9F5]",
      border: "border-[#F7C9A8]",
      badge: "bg-[#FFF4ED] text-[#C2410C]",
      glow: "shadow-[0px_10px_24px_-18px_rgba(194,65,12,0.35)]",
    };
  }

  return {
    surface: "from-[#F5F3FF] to-[#FBFAFF]",
    border: "border-[#D9D6FE]",
    badge: "bg-[#F5F3FF] text-[#6D28D9]",
    glow: "shadow-[0px_10px_24px_-18px_rgba(109,40,217,0.35)]",
  };
};

function CommunityInfoCard({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div className="rounded-2xl border border-white/70 bg-gradient-to-br from-white to-[#F8FAFC] px-4 py-3 shadow-[0px_10px_24px_-20px_rgba(15,23,42,0.4)]">
      <p className="text-[11px] uppercase tracking-[0.08em] text-[#667085]">{label}</p>
      <p className="mt-1 text-[14px] font-semibold text-[#0F1216]">{value}</p>
    </div>
  );
}

function CommunityStatCard({
  label,
  value,
  hint,
}: {
  label: string;
  value: string;
  hint: string;
}) {
  return (
    <div className="rounded-3xl border border-[#D9D6FE] bg-gradient-to-br from-[#FCFBFF] via-white to-[#F4F0FF] px-4 py-4 shadow-[0px_18px_34px_-28px_rgba(109,40,217,0.45)]">
      <p className="text-[11px] uppercase tracking-[0.08em] text-[#7A5AF8]">{label}</p>
      <p className="mt-2 text-[20px] font-semibold text-[#0F1216]">{value}</p>
      <p className="mt-1 text-[12px] text-[#667085]">{hint}</p>
    </div>
  );
}

function CommunityLineChart({
  points,
}: {
  points: Array<{
    label: string;
    value: number;
  }>;
}) {
  const maxValue = Math.max(...points.map((point) => point.value), 1);

  return (
    <div className="flex items-end gap-3">
      {points.map((point) => (
        <div key={point.label} className="flex min-w-0 flex-1 flex-col items-center gap-2">
          <div className="flex h-28 w-full items-end rounded-2xl bg-[#F8FAFC] px-2 py-2">
            <div
              className="w-full rounded-xl bg-gradient-to-t from-[#7C3AED] to-[#A78BFA]"
              style={{
                height: `${Math.max(12, (point.value / maxValue) * 100)}%`,
              }}
            />
          </div>
          <p className="text-[11px] text-[#667085]">{point.label}</p>
        </div>
      ))}
    </div>
  );
}

function CommunityPickerCard({
  selected,
  name,
  subject,
  grade,
  description,
  visibility,
  memberCount,
  sharedBankCount,
  onClick,
  action,
}: {
  selected: boolean;
  name: string;
  subject: string;
  grade: number;
  description: string | null | undefined;
  visibility: CommunityVisibility;
  memberCount: number;
  sharedBankCount: number;
  onClick: () => void;
  action?: React.ReactNode;
}) {
  const theme = getSubjectTheme(subject);

  return (
    <div
      role="button"
      tabIndex={0}
      className={[
        "w-full cursor-pointer rounded-3xl border px-3.5 py-3 text-left transition duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#111827]/20",
        `bg-gradient-to-br ${theme.surface}`,
        selected
          ? `border-[#0F172A] ring-2 ring-[#111827]/10 ${theme.glow}`
          : `${theme.border} shadow-[0px_10px_24px_-22px_rgba(15,23,42,0.35)] hover:-translate-y-0.5`,
      ].join(" ")}
      onClick={onClick}
      onKeyDown={(event) => {
        if (event.key === "Enter" || event.key === " ") {
          event.preventDefault();
          onClick();
        }
      }}
    >
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-[14px] font-semibold text-[#0F1216]">{name}</p>
          <p className="mt-1 text-[12px] text-[#52555B]">
            {formatGradeLabel(grade)} · {subject}
          </p>
        </div>
        <span className={`rounded-full px-2.5 py-1 text-[12px] ${theme.badge}`}>
          {formatVisibilityLabel(visibility)}
        </span>
      </div>
      <p className="mt-2 text-[12px] leading-5 text-[#667085]">
        {description || "Тайлбаргүй community"}
      </p>
      <div className="mt-2 flex items-center justify-between gap-3 text-[11px] text-[#667085]">
        <span>{memberCount} гишүүн</span>
        <span>{sharedBankCount} хуваалцсан сан</span>
      </div>
      {action ? <div className="mt-2">{action}</div> : null}
    </div>
  );
}

function CommunitySectionCard({
  title,
  description,
  action,
  children,
}: {
  title: string;
  description?: string;
  action?: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <section className="rounded-[28px] border border-[#E7E8EC] bg-gradient-to-br from-white via-white to-[#FBFCFF] p-6 shadow-[0px_18px_40px_-32px_rgba(15,23,42,0.32)]">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h3 className="text-[18px] font-semibold text-[#0F1216]">{title}</h3>
          {description ? (
            <p className="mt-1 text-[13px] text-[#667085]">{description}</p>
          ) : null}
        </div>
        {action}
      </div>
      <div className="mt-4">{children}</div>
    </section>
  );
}

function CommunityCommentThread({
  title,
  comments,
  draft,
  emptyText,
  onDraftChange,
  onSubmit,
  submitting,
}: {
  title: string;
  comments: Array<{
    id: string;
    body: string;
    createdAt: string;
    author: { fullName: string };
  }>;
  draft: string;
  emptyText: string;
  onDraftChange: (value: string) => void;
  onSubmit: () => void;
  submitting: boolean;
}) {
  return (
    <div className="mt-3 rounded-2xl border border-[#EAECF0] bg-[#F8FAFC] px-3 py-3">
      <div className="flex items-center justify-between gap-3">
        <p className="text-[12px] font-medium text-[#667085]">Хэлэлцүүлэг</p>
        <p className="text-right text-[11px] text-[#98A2B3]">{truncate(title, 42)}</p>
      </div>
      <div className="mt-3 space-y-2">
        {comments.length ? (
          comments.slice(0, 3).map((comment) => (
            <div
              key={comment.id}
              className="rounded-xl border border-[#E4E7EC] bg-white px-3 py-2"
            >
              <div className="flex items-center justify-between gap-3">
                <p className="text-[12px] font-medium text-[#344054]">
                  {comment.author.fullName}
                </p>
                <p className="text-[11px] text-[#98A2B3]">
                  {new Date(comment.createdAt).toLocaleDateString("mn-MN")}
                </p>
              </div>
              <p className="mt-1 text-[12px] leading-5 text-[#475467]">{comment.body}</p>
            </div>
          ))
        ) : (
          <div className="rounded-xl border border-dashed border-[#D0D5DD] px-3 py-4 text-[12px] text-[#98A2B3]">
            {emptyText}
          </div>
        )}
      </div>
      <textarea
        className="mt-3 min-h-[76px] w-full rounded-xl border border-[#D0D5DD] bg-white px-3 py-2 text-[13px] outline-none"
        placeholder="Санал, туршлагаа үлдээгээрэй..."
        value={draft}
        onChange={(event) => onDraftChange(event.target.value)}
      />
      <button
        type="button"
        className="mt-2 w-full rounded-xl border border-[#D0D5DD] bg-white px-4 py-2 text-[13px] font-medium text-[#0F172A] disabled:opacity-60"
        onClick={onSubmit}
        disabled={submitting || draft.trim().length < 2}
      >
        {submitting ? "Сэтгэгдэл үлдээж байна..." : "Сэтгэгдэл үлдээх"}
      </button>
    </div>
  );
}

function CommunityRatingRow({
  averageRating,
  ratingCount,
  viewerRating,
  onRate,
  disabled,
}: {
  averageRating: number;
  ratingCount: number;
  viewerRating?: number | null;
  onRate: (value: number) => void;
  disabled: boolean;
}) {
  return (
    <div className="mt-3 rounded-2xl border border-[#EAECF0] bg-[#F8FAFC] px-3 py-3">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="text-[12px] font-medium text-[#667085]">Үнэлгээ</p>
          <p className="mt-1 text-[12px] text-[#475467]">
            Дундаж {averageRating.toFixed(1)} / 5 · {ratingCount} үнэлгээ
          </p>
        </div>
        <div className="flex items-center gap-1">
          {[1, 2, 3, 4, 5].map((value) => {
            const active = (viewerRating ?? 0) >= value;
            return (
              <button
                key={value}
                type="button"
                className={[
                  "text-[18px] transition",
                  active ? "text-[#F59E0B]" : "text-[#D0D5DD]",
                  disabled ? "cursor-not-allowed opacity-60" : "hover:scale-110",
                ].join(" ")}
                onClick={() => onRate(value)}
                disabled={disabled}
                aria-label={`${value} оноогоор үнэлэх`}
              >
                ★
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}

export function CommunitySection() {
  const [selectedCommunityId, setSelectedCommunityId] = useState<string | null>(null);
  const [selectedSubjectFilter, setSelectedSubjectFilter] = useState<string>("ALL");
  const [feedbackMessage, setFeedbackMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [previewBankId, setPreviewBankId] = useState<string | null>(null);
  const [previewExam, setPreviewExam] = useState<{
    examId: string;
    communityId?: string | null;
  } | null>(null);
  const [commentDrafts, setCommentDrafts] = useState<Record<string, string>>({});

  const overviewQuery = useCommunityOverviewQuery({
    fetchPolicy: "cache-and-network",
    notifyOnNetworkStatusChange: true,
  });
  const [joinCommunity, joinCommunityState] = useJoinCommunityActionMutation();
  const [shareQuestionBank, shareQuestionBankState] =
    useShareQuestionBankToCommunityActionMutation();
  const [shareExam, shareExamState] = useShareExamToCommunityActionMutation();
  const [addCommunityComment, addCommunityCommentState] =
    useAddCommunityCommentActionMutation();
  const [rateCommunityItem, rateCommunityItemState] =
    useRateCommunityItemActionMutation();
  const [copySharedBank, copySharedBankState] =
    useCopyCommunitySharedBankToMyBankActionMutation();
  const myExamsQuery = useMyExamsSectionQueryQuery({
    fetchPolicy: "cache-and-network",
  });

  const communities = useMemo(
    () => overviewQuery.data?.communities ?? [],
    [overviewQuery.data?.communities],
  );
  const viewerId = overviewQuery.data?.me?.id ?? null;
  const viewerName = overviewQuery.data?.me?.fullName ?? "";
  const communityHome = overviewQuery.data?.communityHome ?? null;
  const effectiveSelectedCommunityId =
    selectedCommunityId && communities.some((community) => community.id === selectedCommunityId)
      ? selectedCommunityId
      : null;

  const detailQuery = useCommunityDetailQuery({
    variables: { id: effectiveSelectedCommunityId ?? "" },
    skip: !effectiveSelectedCommunityId,
    fetchPolicy: "cache-and-network",
  });

  const selectedCommunity = detailQuery.data?.community ?? null;

  const myBanks = useMemo(
    () =>
      (overviewQuery.data?.questionBanks ?? []).filter(
        (bank) => bank.owner.id === viewerId,
      ),
    [overviewQuery.data?.questionBanks, viewerId],
  );
  const teacherSubjects = useMemo(() => {
    const subjects = new Set<string>();

    (overviewQuery.data?.me?.classes ?? []).forEach((classroom) => {
      if (classroom.subject && classroom.subject !== "Ерөнхий") {
        subjects.add(classroom.subject);
      }
    });

    myBanks.forEach((bank) => {
      if (bank.subject && bank.subject !== "Ерөнхий") {
        subjects.add(bank.subject);
      }
    });

    return [...subjects].sort((first, second) => first.localeCompare(second, "mn"));
  }, [myBanks, overviewQuery.data?.me?.classes]);
  const availableSubjects = useMemo(() => {
    const subjects = new Set<string>();

    communities.forEach((community) => {
      if (community.subject && community.subject !== "Ерөнхий") {
        subjects.add(community.subject);
      }
    });

    return [...subjects].sort((first, second) => {
      const firstPreferred = teacherSubjects.includes(first) ? 0 : 1;
      const secondPreferred = teacherSubjects.includes(second) ? 0 : 1;
      if (firstPreferred !== secondPreferred) {
        return firstPreferred - secondPreferred;
      }

      return first.localeCompare(second, "mn");
    });
  }, [communities, teacherSubjects]);
  const effectiveSelectedSubjectFilter = useMemo(() => {
    if (selectedSubjectFilter !== "ALL" && availableSubjects.includes(selectedSubjectFilter)) {
      return selectedSubjectFilter;
    }

    if (teacherSubjects.length === 1) {
      return teacherSubjects[0];
    }

    return "ALL";
  }, [availableSubjects, selectedSubjectFilter, teacherSubjects]);
  const filteredCommunities = useMemo(() => {
    if (effectiveSelectedSubjectFilter === "ALL") {
      return communities;
    }

    return communities.filter(
      (community) => community.subject === effectiveSelectedSubjectFilter,
    );
  }, [communities, effectiveSelectedSubjectFilter]);

  const sharedBankIds = useMemo(
    () => new Set(selectedCommunity?.sharedBanks.map((item) => item.bank.id) ?? []),
    [selectedCommunity?.sharedBanks],
  );
  const sharedExamIds = useMemo(
    () => new Set(selectedCommunity?.sharedExams.map((item) => item.examId) ?? []),
    [selectedCommunity?.sharedExams],
  );

  const shareableBanks = useMemo(
    () => myBanks.filter((bank) => !sharedBankIds.has(bank.id)),
    [myBanks, sharedBankIds],
  );
  const myShareableExams = useMemo(() => {
    const actorId = myExamsQuery.data?.me?.id ?? null;
    if (!actorId) {
      return [];
    }

    return (myExamsQuery.data?.exams ?? [])
      .filter(
        (exam) =>
          exam.createdBy.id === actorId &&
          exam.status !== "DRAFT" &&
          !sharedExamIds.has(exam.id),
      )
      .sort((first, second) => {
        const firstMatches = first.class.subject === selectedCommunity?.subject ? 1 : 0;
        const secondMatches = second.class.subject === selectedCommunity?.subject ? 1 : 0;
        if (firstMatches !== secondMatches) {
          return secondMatches - firstMatches;
        }

        const attemptDifference = second.attempts.length - first.attempts.length;
        if (attemptDifference !== 0) {
          return attemptDifference;
        }

        return new Date(second.createdAt).getTime() - new Date(first.createdAt).getTime();
      })
      .slice(0, 6);
  }, [
    myExamsQuery.data?.exams,
    myExamsQuery.data?.me?.id,
    selectedCommunity?.subject,
    sharedExamIds,
  ]);
  const selectedCommunitySchools = useMemo(() => {
    if (!selectedCommunity) {
      return [];
    }

    const schoolNames = new Set<string>();

    selectedCommunity.members.forEach((member) => {
      schoolNames.add(extractSchoolName(member.user.fullName));
    });

    selectedCommunity.sharedBanks.forEach((sharedBank) => {
      schoolNames.add(extractSchoolName(sharedBank.sharedBy.fullName));
      schoolNames.add(extractSchoolName(sharedBank.bank.owner.fullName));
      schoolNames.add(extractSchoolName(sharedBank.bank.title));
    });

    return [...schoolNames].filter(Boolean).sort((first, second) =>
      first.localeCompare(second, "mn"),
    );
  }, [selectedCommunity]);
  const memberRoleGroups = useMemo(() => {
    if (!selectedCommunity) {
      return [];
    }

    const groups = [
      {
        key: "OWNER",
        title: "Эзэмшигч",
        members: selectedCommunity.members.filter((member) => member.role === "OWNER"),
      },
      {
        key: "MODERATOR",
        title: "Модератор",
        members: selectedCommunity.members.filter((member) => member.role === "MODERATOR"),
      },
      {
        key: "MEMBER",
        title: "Гишүүд",
        members: selectedCommunity.members.filter((member) => member.role === "MEMBER"),
      },
    ];

    return groups.filter((group) => group.members.length > 0);
  }, [selectedCommunity]);
  const selectedCommunityTopExams = useMemo(
    () => selectedCommunity?.sharedExams ?? [],
    [selectedCommunity?.sharedExams],
  );
  const selectedCommunityMissedQuestions = useMemo(
    () =>
      (communityHome?.mostMissedQuestions ?? []).filter(
        (question) => question.communityId === selectedCommunity?.id,
      ),
    [communityHome?.mostMissedQuestions, selectedCommunity?.id],
  );
  const selectedCommunityTrendingBanks = useMemo(
    () =>
      (communityHome?.trendingBanks ?? []).filter(
        (item) => item.communityId === selectedCommunity?.id,
      ),
    [communityHome?.trendingBanks, selectedCommunity?.id],
  );
  const selectedCommunityAttemptTotal = useMemo(
    () => selectedCommunityTopExams.reduce((total, exam) => total + exam.attemptCount, 0),
    [selectedCommunityTopExams],
  );
  const selectedCommunityAverageMissRate = useMemo(() => {
    if (!selectedCommunityMissedQuestions.length) {
      return 0;
    }

    return Math.round(
      selectedCommunityMissedQuestions.reduce(
        (total, question) => total + question.missRate,
        0,
      ) / selectedCommunityMissedQuestions.length,
    );
  }, [selectedCommunityMissedQuestions]);
  const refreshAll = async () => {
    await overviewQuery.refetch();
    if (effectiveSelectedCommunityId) {
      await detailQuery.refetch({ id: effectiveSelectedCommunityId });
    }
  };

  const handleJoinCommunity = async (communityId: string) => {
    try {
      setErrorMessage(null);
      setFeedbackMessage(null);
      await joinCommunity({ variables: { communityId } });
      setSelectedCommunityId(communityId);
      setFeedbackMessage("Community-д амжилттай нэгдлээ.");
      await refreshAll();
    } catch (error) {
      console.error("Failed to join community", error);
      setErrorMessage("Community-д нэгдэх үед алдаа гарлаа.");
    }
  };

  const handleShareBank = async (bankId: string) => {
    if (!selectedCommunityId) {
      return;
    }

    try {
      setErrorMessage(null);
      setFeedbackMessage(null);
      await shareQuestionBank({
        variables: {
          communityId: selectedCommunityId,
          bankId,
        },
      });
      setFeedbackMessage("Асуултын санг community руу амжилттай хуваалцлаа.");
      await refreshAll();
    } catch (error) {
      console.error("Failed to share bank", error);
      setErrorMessage("Question bank share хийх үед алдаа гарлаа.");
    }
  };

  const handleCopySharedBank = async (sharedBankId: string) => {
    try {
      setErrorMessage(null);
      setFeedbackMessage(null);
      await copySharedBank({ variables: { sharedBankId } });
      setFeedbackMessage("Хуваалцсан сангаас таны санд хувилбар гаргалаа.");
      await refreshAll();
    } catch (error) {
      console.error("Failed to copy shared bank", error);
      setErrorMessage("Сангаас хувилбар гаргах үед алдаа гарлаа.");
    }
  };

  const handleShareExam = async (examId: string) => {
    if (!selectedCommunityId) {
      return;
    }

    try {
      setErrorMessage(null);
      setFeedbackMessage(null);
      await shareExam({
        variables: {
          communityId: selectedCommunityId,
          examId,
        },
      });
      setFeedbackMessage("Шалгалтыг материал + anonymized анализтай нь share хийлээ.");
      await refreshAll();
    } catch (error) {
      console.error("Failed to share exam", error);
      setErrorMessage("Шалгалт share хийх үед алдаа гарлаа.");
    }
  };

  const handleAddComment = async (
    entityType: CommunityCommentEntityType,
    entityId: string,
  ) => {
    if (!selectedCommunityId) {
      return;
    }

    const draftKey = `${entityType}:${entityId}`;
    const body = commentDrafts[draftKey]?.trim() ?? "";
    if (body.length < 2) {
      return;
    }

    try {
      setErrorMessage(null);
      setFeedbackMessage(null);
      await addCommunityComment({
        variables: {
          communityId: selectedCommunityId,
          entityType,
          entityId,
          body,
        },
      });
      setCommentDrafts((current) => ({
        ...current,
        [draftKey]: "",
      }));
      setFeedbackMessage("Сэтгэгдэл амжилттай үлдээлээ.");
      await refreshAll();
    } catch (error) {
      console.error("Failed to add community comment", error);
      setErrorMessage("Сэтгэгдэл үлдээх үед алдаа гарлаа.");
    }
  };

  const handleRateItem = async (
    entityType: CommunityCommentEntityType,
    entityId: string,
    value: number,
  ) => {
    if (!selectedCommunityId) {
      return;
    }

    try {
      setErrorMessage(null);
      setFeedbackMessage(null);
      await rateCommunityItem({
        variables: {
          communityId: selectedCommunityId,
          entityType,
          entityId,
          value,
        },
      });
      setFeedbackMessage("Үнэлгээ амжилттай хадгалагдлаа.");
      await refreshAll();
    } catch (error) {
      console.error("Failed to rate community item", error);
      setErrorMessage("Үнэлгээ өгөх үед алдаа гарлаа.");
    }
  };

  const maxMissedRate = Math.max(
    ...(communityHome?.mostMissedQuestions.map((item) => item.missRate) ?? [0]),
    1,
  );
  const maxAttemptCount = Math.max(
    ...(communityHome?.topExams.map((item) => item.attemptCount) ?? [0]),
    1,
  );
  const isDetailView = effectiveSelectedCommunityId !== null;

  return (
    <section className="mx-auto w-full max-w-[1120px] space-y-6">
      <div className="rounded-[32px] border border-[#E9E4FF] bg-[radial-gradient(circle_at_top_left,_rgba(167,139,250,0.22),_transparent_38%),linear-gradient(135deg,#FFFFFF_0%,#FAF7FF_55%,#F7FBFF_100%)] px-6 py-6 shadow-[0px_24px_50px_-40px_rgba(109,40,217,0.45)]">
        <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[#7A5AF8]">
          Багш нарын сүлжээ
        </p>
        <h1 className="mt-2 text-[28px] font-semibold text-[#0F1216]">
          {TEACHER_COMMON_TEXT.community}
        </h1>
        <p className="mt-1 text-[14px] text-[#52555B]">
          Багш нарын хамтын сан, хуваалцсан асуултын сангууд, хамгийн их ашиглагдаж
          буй асуултууд болон community анализыг нэг дороос удирдана.
        </p>
      </div>

      {feedbackMessage ? (
        <div className="rounded-2xl border border-[#CDEAD7] bg-gradient-to-r from-[#F3FBF6] to-[#FCFFFD] px-5 py-4 text-[14px] text-[#0F7A4F]">
          {feedbackMessage}
        </div>
      ) : null}
      {errorMessage ? (
        <div className="rounded-2xl border border-[#F1D6D5] bg-gradient-to-r from-[#FFF5F4] to-[#FFFDFC] px-5 py-4 text-[14px] text-[#B42318]">
          {errorMessage}
        </div>
      ) : null}

      {!isDetailView ? (
        <div className="space-y-6">
          <div>
            <CommunitySectionCard
              title="Community-үүд"
              description="Хичээлээр нь ангилаад group-оо сонгоно. Дарахад дэлгэрэнгүй хэсэг рүү орно."
              action={
                overviewQuery.loading ? (
                  <span className="text-[12px] text-[#667085]">Шинэчилж байна...</span>
                ) : null
              }
            >
              {communities.length ? (
                <div className="space-y-4">
                  <div className="flex flex-wrap items-center gap-2">
                    <button
                      type="button"
                      className={[
                        "rounded-full border px-3 py-1.5 text-[12px] font-medium transition",
                        effectiveSelectedSubjectFilter === "ALL"
                          ? "border-[#0F172A] bg-[#0F172A] text-white"
                          : "border-[#D0D5DD] bg-white text-[#344054]",
                      ].join(" ")}
                      onClick={() => setSelectedSubjectFilter("ALL")}
                    >
                      Бүгд
                    </button>
                    {availableSubjects.map((subjectOption) => (
                      <button
                        key={subjectOption}
                        type="button"
                        className={[
                          "rounded-full border px-3 py-1.5 text-[12px] font-medium transition",
                          effectiveSelectedSubjectFilter === subjectOption
                            ? "border-[#7C3AED] bg-[#F5F3FF] text-[#5B21B6]"
                            : teacherSubjects.includes(subjectOption)
                              ? "border-[#C7D7FE] bg-[#EEF4FF] text-[#1D4ED8]"
                              : "border-[#D0D5DD] bg-white text-[#344054]",
                        ].join(" ")}
                        onClick={() => setSelectedSubjectFilter(subjectOption)}
                      >
                        {subjectOption}
                      </button>
                    ))}
                  </div>

                  {teacherSubjects.length ? (
                    <div className="rounded-2xl border border-[#E4E7EC] bg-gradient-to-r from-[#F8FAFC] to-white px-4 py-3 text-[12px] text-[#667085]">
                      <span className="font-medium text-[#344054]">
                        {viewerName || "Таны профайл"}
                      </span>
                      {" · "}Танд хамаарах хичээлүүд: {teacherSubjects.join(", ")}
                    </div>
                  ) : null}

                  {filteredCommunities.length ? (
                    <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
                      {filteredCommunities.map((community) => (
                        <CommunityPickerCard
                          key={community.id}
                          selected={effectiveSelectedCommunityId === community.id}
                          name={community.name}
                          subject={community.subject}
                          grade={community.grade}
                          description={community.description}
                          visibility={community.visibility}
                          memberCount={community.memberCount}
                          sharedBankCount={community.sharedBankCount}
                          onClick={() => setSelectedCommunityId(community.id)}
                          action={
                            !community.viewerRole ? (
                              <button
                                type="button"
                                className="rounded-lg border border-[#D0D5DD] px-3 py-2 text-[12px] font-medium text-[#0F172A]"
                                onClick={(event) => {
                                  event.stopPropagation();
                                  void handleJoinCommunity(community.id);
                                }}
                                disabled={joinCommunityState.loading}
                              >
                                {joinCommunityState.loading &&
                                effectiveSelectedCommunityId === community.id
                                  ? "Нэгдэж байна..."
                                  : "Нэгдэх"}
                              </button>
                            ) : null
                          }
                        />
                      ))}
                    </div>
                  ) : (
                    <div className="rounded-2xl border border-dashed border-[#D0D5DD] px-4 py-8 text-center text-[14px] text-[#667085]">
                      Энэ хичээл дээр харагдах community одоогоор алга.
                    </div>
                  )}
                </div>
              ) : (
                <div className="rounded-2xl border border-dashed border-[#D0D5DD] px-4 py-8 text-center text-[14px] text-[#667085]">
                  Одоогоор community алга.
                </div>
              )}
            </CommunitySectionCard>
          </div>

          {communityHome ? (
            <div className="grid gap-6 xl:grid-cols-3">
              <CommunitySectionCard
                title="Хамгийн их ашиглагдсан шалгалтууд"
                description="Бүх community-үүдийн хэмжээнд хамгийн олон оролдлого авсан тестүүд."
              >
                {communityHome.topExams.length ? (
                  <div className="space-y-3">
                    {communityHome.topExams.slice(0, 5).map((exam) => (
                      <article
                        key={exam.examId}
                        className="rounded-3xl border border-[#E6EAF0] bg-gradient-to-br from-white to-[#F8FBFF] px-4 py-4 shadow-[0px_14px_30px_-30px_rgba(15,23,42,0.38)]"
                      >
                        <button
                          type="button"
                          className="text-left text-[15px] font-semibold text-[#0F1216] underline-offset-4 hover:underline"
                          onClick={() =>
                            setPreviewExam({
                              examId: exam.examId,
                              communityId: exam.communityId ?? null,
                            })
                          }
                        >
                          {exam.title}
                        </button>
                        <p className="mt-1 text-[12px] text-[#667085]">
                          {exam.communityName || "Нэгдэл"} · {exam.attemptCount} оролдлого
                        </p>
                        <p className="mt-2 text-[12px] text-[#52555B]">
                          {formatGradeLabel(exam.grade)} · {exam.subject}
                        </p>
                      </article>
                    ))}
                  </div>
                ) : (
                  <div className="rounded-2xl border border-dashed border-[#D0D5DD] px-4 py-8 text-center text-[14px] text-[#667085]">
                    Шалгалтын нэгдсэн analytics одоогоор алга.
                  </div>
                )}
              </CommunitySectionCard>

              <CommunitySectionCard
                title="Хамгийн их ашиглагдсан сангууд"
                description="Хамгийн олон удаа хуулж, ашигласан сангууд."
              >
                {communityHome.trendingBanks.length ? (
                  <div className="space-y-3">
                    {communityHome.trendingBanks.slice(0, 5).map((item) => (
                      <article
                        key={item.sharedBankId}
                        className="rounded-3xl border border-[#E7E3FF] bg-gradient-to-br from-white to-[#FAF7FF] px-4 py-4 shadow-[0px_14px_30px_-30px_rgba(109,40,217,0.38)]"
                      >
                        <button
                          type="button"
                          className="text-left text-[15px] font-semibold text-[#0F1216] underline-offset-4 hover:underline"
                          onClick={() => setPreviewBankId(item.bank.id)}
                        >
                          {item.bank.title}
                        </button>
                        <p className="mt-1 text-[12px] text-[#667085]">
                          {item.communityName} · {item.copyCount} хуулалт
                        </p>
                        <p className="mt-2 text-[12px] text-[#52555B]">
                          {formatGradeLabel(item.bank.grade)} · {item.bank.subject}
                        </p>
                      </article>
                    ))}
                  </div>
                ) : (
                  <div className="rounded-2xl border border-dashed border-[#D0D5DD] px-4 py-8 text-center text-[14px] text-[#667085]">
                    Асуултын сангийн нэгдсэн анализ одоогоор алга.
                  </div>
                )}
              </CommunitySectionCard>

              <CommunitySectionCard
                title="Хамгийн их алдсан асуултууд"
                description="Хүүхдүүд хамгийн их алдсан асуултуудын нэгдсэн зураг."
              >
                {communityHome.mostMissedQuestions.length ? (
                  <div className="space-y-3">
                    {communityHome.mostMissedQuestions.slice(0, 5).map((question) => (
                      <article
                        key={question.questionId}
                        className="rounded-3xl border border-[#F4D6D6] bg-gradient-to-br from-white to-[#FFF6F6] px-4 py-4 shadow-[0px_14px_30px_-30px_rgba(196,18,72,0.28)]"
                      >
                        <p className="text-[14px] font-medium text-[#0F1216]">
                          {truncate(question.prompt, 88)}
                        </p>
                        <p className="mt-1 text-[12px] text-[#667085]">
                          {question.communityName} · {question.missRate}% алдалтын хувь
                        </p>
                        <p className="mt-2 text-[12px] text-[#52555B]">
                          {question.bankTitle} · {question.attemptCount} оролдлого
                        </p>
                      </article>
                    ))}
                  </div>
                ) : (
                  <div className="rounded-2xl border border-dashed border-[#D0D5DD] px-4 py-8 text-center text-[14px] text-[#667085]">
                    Асуултын нэгдсэн analytics одоогоор алга.
                  </div>
                )}
              </CommunitySectionCard>
            </div>
          ) : null}
        </div>
      ) : null}

      {overviewQuery.error ? (
        <div className="rounded-2xl border border-[#F1D6D5] bg-white px-6 py-8 text-[14px] text-[#B42318]">
          Community мэдээлэл ачаалахад алдаа гарлаа.
        </div>
      ) : null}

      {selectedCommunity ? (
        <div className="space-y-6">
          <div className="flex items-center justify-between gap-4">
            <button
              type="button"
              className="inline-flex items-center rounded-full border border-[#D0D5DD] bg-white px-4 py-2 text-[13px] font-medium text-[#344054] shadow-[0px_12px_24px_-24px_rgba(15,23,42,0.4)]"
              onClick={() => setSelectedCommunityId(null)}
            >
              Буцах
            </button>
            <p className="text-[12px] text-[#667085]">
              Community-ийн дэлгэрэнгүй
            </p>
          </div>

          <div className="rounded-2xl border border-[#DFE1E5] bg-white p-6 shadow-[0px_4px_8px_-2px_rgba(0,0,0,0.08)]">
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div className="max-w-[720px]">
                <h2 className="text-[22px] font-semibold text-[#0F1216]">
                  {selectedCommunity.name}
                </h2>
                <p className="mt-2 text-[14px] leading-6 text-[#52555B]">
                  {selectedCommunity.description || "Тайлбар оруулаагүй байна."}
                </p>
                <div className="mt-4 flex flex-wrap gap-2">
                  {selectedCommunitySchools.length ? (
                    selectedCommunitySchools.map((school) => (
                      <span
                        key={school}
                        className="rounded-full border border-[#D0D5DD] bg-white px-3 py-1 text-[12px] font-medium text-[#344054]"
                      >
                        {school}
                      </span>
                    ))
                  ) : (
                    <span className="rounded-full border border-dashed border-[#D0D5DD] px-3 py-1 text-[12px] text-[#667085]">
                      Сургуулийн мэдээлэл хараахан бүрдээгүй
                    </span>
                  )}
                </div>
              </div>
              <div className="grid min-w-[280px] gap-3 sm:grid-cols-2">
                <CommunityInfoCard
                  label="Хамрах хүрээ"
                  value={`${formatGradeLabel(selectedCommunity.grade)} · ${selectedCommunity.subject}`}
                />
                <CommunityInfoCard
                  label="Гишүүд"
                  value={`${selectedCommunity.memberCount} гишүүн`}
                />
                <CommunityInfoCard
                  label="Сургуулиуд"
                  value={`${selectedCommunitySchools.length} сургууль`}
                />
                <CommunityInfoCard
                  label="Хуваалцсан сан"
                  value={`${selectedCommunity.sharedBankCount} сан`}
                />
              </div>
            </div>
          </div>

          <div className="grid gap-6 xl:grid-cols-[minmax(0,1.2fr)_360px]">
            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
              <CommunityStatCard
                label="Хуваалцсан сан"
                value={`${selectedCommunity.sharedBankCount}`}
                hint="Энэ community-д хуваалцсан сан"
              />
              <CommunityStatCard
                label="Шалгалтууд"
                value={`${selectedCommunity.sharedExamCount}`}
                hint="Community руу share хийгдсэн тест"
              />
              <CommunityStatCard
                label="Нийт оролдлого"
                value={`${selectedCommunityAttemptTotal}`}
                hint="Бүртгэгдсэн оролдлого"
              />
              <CommunityStatCard
                label="Дундаж алдааны хувь"
                value={`${selectedCommunityAverageMissRate}%`}
                hint="Их алдсан асуултуудын дундаж"
              />
            </div>

            <CommunitySectionCard
              title="Сүүлийн 7 хоногийн анализ"
              description="Community доторх share, хуулалт, хэрэглээний идэвх."
            >
              {communityHome?.weeklyActivity?.length ? (
                <CommunityLineChart points={communityHome.weeklyActivity} />
              ) : (
                <div className="rounded-2xl border border-dashed border-[#D0D5DD] px-4 py-8 text-center text-[14px] text-[#667085]">
                  Идэвхийн мэдээлэл одоогоор алга.
                </div>
              )}
            </CommunitySectionCard>
          </div>

          <CommunitySectionCard
            title="Хамгийн идэвхтэй багш нар"
            description="Энэ community-г хамгийн их тэжээж буй багш нар."
          >
            {selectedCommunity.topContributors.length ? (
              <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
                {selectedCommunity.topContributors.map((contributor) => (
                  <article
                    key={contributor.user.id}
                    className="rounded-2xl border border-[#EAECF0] bg-[#FCFCFD] px-4 py-4"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <p className="text-[14px] font-semibold text-[#0F1216]">
                          {contributor.user.fullName}
                        </p>
                        <p className="mt-1 text-[12px] text-[#667085]">
                          {extractSchoolName(contributor.user.fullName)} · {contributor.role}
                        </p>
                      </div>
                      <span className="rounded-full bg-[#F5F3FF] px-2.5 py-1 text-[12px] font-semibold text-[#6D28D9]">
                        {contributor.score} оноо
                      </span>
                    </div>
                    <div className="mt-3 grid grid-cols-3 gap-2 text-center">
                      <div className="rounded-xl bg-white px-2 py-2">
                        <p className="text-[14px] font-semibold text-[#0F1216]">
                          {contributor.sharedExamCount}
                        </p>
                        <p className="text-[11px] text-[#98A2B3]">Шалгалт</p>
                      </div>
                      <div className="rounded-xl bg-white px-2 py-2">
                        <p className="text-[14px] font-semibold text-[#0F1216]">
                          {contributor.sharedBankCount}
                        </p>
                        <p className="text-[11px] text-[#98A2B3]">Сан</p>
                      </div>
                      <div className="rounded-xl bg-white px-2 py-2">
                        <p className="text-[14px] font-semibold text-[#0F1216]">
                          {contributor.commentCount}
                        </p>
                        <p className="text-[11px] text-[#98A2B3]">Сэтгэгдэл</p>
                      </div>
                    </div>
                  </article>
                ))}
              </div>
            ) : (
              <div className="rounded-2xl border border-dashed border-[#D0D5DD] px-4 py-8 text-center text-[14px] text-[#667085]">
                Энэ community дээр contributor analytics хараахан бүрдээгүй байна.
              </div>
            )}
          </CommunitySectionCard>

          <div className="grid gap-6 xl:grid-cols-[minmax(0,1.75fr)_360px]">
            <div className="space-y-6">
              <CommunitySectionCard
                title="Тренд сангууд"
                description="Энэ community дотор хамгийн их хуулж, ашигласан сангууд."
              >
                {selectedCommunityTrendingBanks.length ? (
                  <div className="grid gap-3 md:grid-cols-2">
                    {selectedCommunityTrendingBanks.map((item) => (
                      <article
                        key={item.sharedBankId}
                        className="rounded-2xl border border-[#EAECF0] px-4 py-4"
                      >
                        <button
                          type="button"
                          className="text-left text-[15px] font-semibold text-[#0F1216] underline-offset-4 hover:underline"
                          onClick={() => setPreviewBankId(item.bank.id)}
                        >
                          {item.bank.title}
                        </button>
                        <p className="mt-1 text-[13px] text-[#667085]">
                          {formatGradeLabel(item.bank.grade)} · {item.bank.subject}
                        </p>
                        <div className="mt-3 flex items-center justify-between text-[12px] text-[#667085]">
                          <span>{item.bank.questionCount} асуулт</span>
                          <span>{item.copyCount} хуулалт</span>
                        </div>
                      </article>
                    ))}
                  </div>
                ) : (
                  <div className="rounded-2xl border border-dashed border-[#D0D5DD] px-4 py-8 text-center text-[14px] text-[#667085]">
                    Энэ community дээр тренд bank одоогоор бүрдээгүй байна.
                  </div>
                )}
              </CommunitySectionCard>

              <CommunitySectionCard
                title="Хуваалцсан шалгалтууд"
                description="Энэ community-т хамаарах, analytics-тай хамт үзэж болох шалгалтууд."
              >
                {selectedCommunityTopExams.length ? (
                  <div className="space-y-4">
                    {selectedCommunityTopExams.map((exam) => (
                      <article
                        key={exam.id}
                        className="space-y-2 rounded-2xl border border-[#EAECF0] p-4"
                      >
                        <div className="flex items-start justify-between gap-4">
                          <div>
                            <button
                              type="button"
                              className="text-left text-[15px] font-semibold text-[#0F1216] underline-offset-4 hover:underline"
                              onClick={() =>
                                setPreviewExam({
                                  examId: exam.examId,
                                  communityId: selectedCommunity.id,
                                })
                              }
                            >
                              {exam.title}
                            </button>
                            <p className="mt-1 text-[13px] text-[#667085]">
                              {formatGradeLabel(exam.grade)} · {exam.sharedBy.fullName}
                            </p>
                          </div>
                          <div className="text-right text-[12px] text-[#667085]">
                            <p>{exam.attemptCount} оролдлого</p>
                            <p className="mt-1">Дундаж {exam.averageScorePercent}%</p>
                          </div>
                        </div>
                        <div className="h-2 overflow-hidden rounded-full bg-[#F2F4F7]">
                          <div
                            className="h-full rounded-full bg-[#12B76A]"
                            style={{
                              width: `${Math.max(
                                12,
                                (exam.attemptCount / Math.max(maxAttemptCount, 1)) * 100,
                              )}%`,
                            }}
                          />
                        </div>
                        <CommunityRatingRow
                          averageRating={exam.averageRating}
                          ratingCount={exam.ratingCount}
                          viewerRating={exam.viewerRating}
                          onRate={(value) =>
                            void handleRateItem(
                              CommunityCommentEntityType.SharedExam,
                              exam.id,
                              value,
                            )
                          }
                          disabled={rateCommunityItemState.loading}
                        />
                        <CommunityCommentThread
                          title={exam.title}
                          comments={exam.comments}
                          draft={
                            commentDrafts[
                              `${CommunityCommentEntityType.SharedExam}:${exam.id}`
                            ] ?? ""
                          }
                          emptyText="Энэ шалгалтын доорх хэлэлцүүлэг хараахан эхлээгүй байна."
                          onDraftChange={(value) =>
                            setCommentDrafts((current) => ({
                              ...current,
                              [`${CommunityCommentEntityType.SharedExam}:${exam.id}`]:
                                value,
                            }))
                          }
                          onSubmit={() =>
                            void handleAddComment(
                              CommunityCommentEntityType.SharedExam,
                              exam.id,
                            )
                          }
                          submitting={addCommunityCommentState.loading}
                        />
                      </article>
                    ))}
                  </div>
                ) : (
                  <div className="rounded-2xl border border-dashed border-[#D0D5DD] px-4 py-8 text-center text-[14px] text-[#667085]">
                    Энэ community дээр харагдах шалгалтын анализ одоогоор алга.
                  </div>
                )}
              </CommunitySectionCard>

              <CommunitySectionCard
                title="Нэгдсэн санд орж буй сангууд"
                description="Эндхээс сангаа шууд шалгалтад ашиглах эсвэл өөрийнхөөрөө засах бол хувилбар гаргаж авна."
              >
                {selectedCommunity.sharedBanks.length ? (
                  <div className="space-y-3">
                    {selectedCommunity.sharedBanks.map((sharedBank) => (
                      <article
                        key={sharedBank.id}
                        className="rounded-2xl border border-[#EAECF0] px-4 py-4"
                      >
                        <div className="flex flex-wrap items-start justify-between gap-4">
                          <div>
                            <div className="flex flex-wrap items-center gap-2">
                              <button
                                type="button"
                                className="text-left text-[15px] font-semibold text-[#0F1216] underline-offset-4 hover:underline"
                                onClick={() => setPreviewBankId(sharedBank.bank.id)}
                              >
                                {sharedBank.bank.title}
                              </button>
                              <span className="rounded-full bg-[#F2F4F7] px-2.5 py-1 text-[12px] text-[#344054]">
                                {formatSharedBankStatusLabel(sharedBank.status)}
                              </span>
                              <span className="rounded-full bg-[#EEF2FF] px-2.5 py-1 text-[12px] text-[#4F46E5]">
                                {sharedBank.copyCount} ашиглалт
                              </span>
                            </div>
                            <p className="mt-1 text-[13px] text-[#667085]">
                              {formatGradeLabel(sharedBank.bank.grade)} · {sharedBank.bank.subject} ·{" "}
                              {sharedBank.bank.questionCount} асуулт
                            </p>
                            <p className="mt-2 text-[13px] leading-5 text-[#52555B]">
                              {sharedBank.bank.description || "Тайлбаргүй сан"}
                            </p>
                            <p className="mt-2 text-[12px] text-[#667085]">
                              Хуваалцсан: {sharedBank.sharedBy.fullName} · Эзэмшигч:{" "}
                              {sharedBank.bank.owner.fullName}
                            </p>
                          </div>
                          <div className="flex min-w-[220px] flex-col gap-2">
                            <Link
                              href={`/create-exam?bankId=${sharedBank.bank.id}`}
                              className="rounded-xl bg-[#0F172A] px-4 py-2 text-center text-[13px] font-medium text-white"
                            >
                              Шууд ашиглах
                            </Link>
                            <button
                              type="button"
                              className="rounded-xl border border-[#D0D5DD] px-4 py-2 text-[13px] font-medium text-[#0F172A] disabled:opacity-60"
                              onClick={() => void handleCopySharedBank(sharedBank.id)}
                              disabled={copySharedBankState.loading}
                            >
                              {copySharedBankState.loading
                                ? "Хувилбар гаргаж байна..."
                                : "Миний санд хувилбар гаргах"}
                            </button>
                          </div>
                        </div>
                        <CommunityRatingRow
                          averageRating={sharedBank.averageRating}
                          ratingCount={sharedBank.ratingCount}
                          viewerRating={sharedBank.viewerRating}
                          onRate={(value) =>
                            void handleRateItem(
                              CommunityCommentEntityType.SharedBank,
                              sharedBank.id,
                              value,
                            )
                          }
                          disabled={rateCommunityItemState.loading}
                        />
                        <CommunityCommentThread
                          title={sharedBank.bank.title}
                          comments={sharedBank.comments}
                          draft={
                            commentDrafts[
                              `${CommunityCommentEntityType.SharedBank}:${sharedBank.id}`
                            ] ?? ""
                          }
                          emptyText="Энэ сангийн доорх хэлэлцүүлэг хараахан эхлээгүй байна."
                          onDraftChange={(value) =>
                            setCommentDrafts((current) => ({
                              ...current,
                              [`${CommunityCommentEntityType.SharedBank}:${sharedBank.id}`]:
                                value,
                            }))
                          }
                          onSubmit={() =>
                            void handleAddComment(
                              CommunityCommentEntityType.SharedBank,
                              sharedBank.id,
                            )
                          }
                          submitting={addCommunityCommentState.loading}
                        />
                      </article>
                    ))}
                  </div>
                ) : (
                  <div className="rounded-2xl border border-dashed border-[#D0D5DD] px-4 py-8 text-center text-[14px] text-[#667085]">
                    Энэ community-д одоогоор хуваалцсан асуултын сан алга.
                  </div>
                )}
              </CommunitySectionCard>

              <CommunitySectionCard
                title="Гишүүд ба сургуулиуд"
                description="Энэ community-д оролцож буй багш нар болон харьяалах сургуулиуд."
              >
                <div className="rounded-2xl border border-[#EAECF0] bg-[#F8FAFC] px-4 py-4">
                  <p className="text-[12px] font-medium text-[#667085]">Нэгдсэн сургуулиуд</p>
                  <div className="mt-3 flex flex-wrap gap-2">
                    {selectedCommunitySchools.map((school) => (
                      <span
                        key={school}
                        className="rounded-full bg-white px-3 py-1 text-[12px] font-medium text-[#344054]"
                      >
                        {school}
                      </span>
                    ))}
                  </div>
                </div>
                <div className="mt-4 space-y-4">
                  {memberRoleGroups.map((group) => (
                    <div key={group.key} className="space-y-3">
                      <div className="flex items-center justify-between">
                        <p className="text-[13px] font-semibold text-[#344054]">
                          {group.title}
                        </p>
                        <span className="rounded-full bg-[#F2F4F7] px-2.5 py-1 text-[11px] text-[#667085]">
                          {group.members.length}
                        </span>
                      </div>
                      <div className="grid gap-3 sm:grid-cols-2">
                        {group.members.map((member) => (
                          <div
                            key={member.id}
                            className="rounded-2xl border border-[#EAECF0] px-4 py-3"
                          >
                            <p className="text-[14px] font-semibold text-[#0F1216]">
                              {member.user.fullName}
                            </p>
                            <p className="mt-1 text-[12px] text-[#667085]">
                              {extractSchoolName(member.user.fullName)} · {group.title}
                            </p>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </CommunitySectionCard>

            </div>

            <div className="space-y-6">
              <CommunitySectionCard
                title="Асуултын сан хуваалцах"
                description="Энэ community-ийн хичээлтэй холбоотой сангаа хуваалцана."
              >
                {!selectedCommunity.viewerRole ? (
                  <div className="rounded-2xl border border-dashed border-[#D0D5DD] px-4 py-6 text-[14px] text-[#667085]">
                    Хуваалцахын тулд эхлээд энэ community-д нэгдэнэ үү.
                  </div>
                ) : shareableBanks.length ? (
                  <div className="space-y-3">
                    {shareableBanks.slice(0, 5).map((bank) => (
                      <div
                        key={bank.id}
                        className="rounded-2xl border border-[#EAECF0] px-4 py-4"
                      >
                        <button
                          type="button"
                          className="text-left text-[15px] font-semibold text-[#0F1216] underline-offset-4 hover:underline"
                          onClick={() => setPreviewBankId(bank.id)}
                        >
                          {bank.title}
                        </button>
                        <p className="mt-1 text-[13px] text-[#667085]">
                          {formatGradeLabel(bank.grade)} · {bank.subject}
                        </p>
                        <button
                          type="button"
                          className="mt-3 w-full rounded-xl bg-[#0F172A] px-4 py-2 text-[13px] font-medium text-white disabled:opacity-60"
                          onClick={() => void handleShareBank(bank.id)}
                          disabled={shareQuestionBankState.loading}
                        >
                          {shareQuestionBankState.loading
                            ? "Хуваалцаж байна..."
                            : "Асуултын сан хуваалцах"}
                        </button>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="rounded-2xl border border-dashed border-[#D0D5DD] px-4 py-6 text-[14px] text-[#667085]">
                    Энэ хичээлтэй тохирох, хараахан хуваалцаагүй таны сан одоогоор алга.
                  </div>
                )}
              </CommunitySectionCard>

              <CommunitySectionCard
                title="Шалгалт хуваалцах"
                description="Өөрийн байгаа шалгалтуудаас сонгож community руу материал + нууцалсан анализтай нь хуваалцана. Хамгийн их оролдлоготой шалгалтууд эхэнд харагдана."
              >
                {!selectedCommunity.viewerRole ? (
                  <div className="rounded-2xl border border-dashed border-[#D0D5DD] px-4 py-6 text-[14px] text-[#667085]">
                    Шалгалт хуваалцахын тулд эхлээд энэ community-д нэгдэнэ үү.
                  </div>
                ) : myShareableExams.length ? (
                  <div className="space-y-3">
                    <div className="rounded-2xl border border-[#E4E7EC] bg-[#F8FAFC] px-4 py-3 text-[13px] text-[#667085]">
                      Доорх жагсаалт нь таны өмнө үүсгэсэн, одоогоор энэ community-д share хийгдээгүй шалгалтуудаас бүрдэнэ.
                    </div>
                    {myShareableExams.map((exam) => (
                      <div
                        key={exam.id}
                        className="rounded-2xl border border-[#EAECF0] px-4 py-4"
                      >
                        <button
                          type="button"
                          className="text-left text-[15px] font-semibold text-[#0F1216] underline-offset-4 hover:underline"
                          onClick={() =>
                            setPreviewExam({
                              examId: exam.id,
                              communityId: selectedCommunity.id,
                            })
                          }
                        >
                          {exam.title}
                        </button>
                        <p className="mt-1 text-[13px] text-[#667085]">
                          {exam.class.name} · {exam.questions.length} асуулт · {exam.attempts.length} оролдлого
                        </p>
                        <div className="mt-2 flex flex-wrap gap-2">
                          <span
                            className={`rounded-full px-2.5 py-1 text-[11px] font-medium ${
                              exam.class.subject === selectedCommunity?.subject
                                ? "bg-[#ECFDF3] text-[#067647]"
                                : "bg-[#F2F4F7] text-[#667085]"
                            }`}
                          >
                            {exam.class.subject === selectedCommunity?.subject
                              ? "Community-тэй таарч байна"
                              : `${exam.class.subject || "Ерөнхий"} хичээлийн шалгалт`}
                          </span>
                          <span className="rounded-full bg-[#EEF2FF] px-2.5 py-1 text-[11px] font-medium text-[#4F46E5]">
                            {formatExamStatusLabel(exam.status)}
                          </span>
                          {exam.attempts.length ? (
                            <span className="rounded-full bg-[#FFF7E6] px-2.5 py-1 text-[11px] font-medium text-[#B54708]">
                              {exam.attempts.length} хүүхэд өгсөн
                            </span>
                          ) : null}
                        </div>
                        <button
                          type="button"
                          className="mt-3 w-full rounded-xl bg-[#7C3AED] px-4 py-2 text-[13px] font-medium text-white disabled:opacity-60"
                          onClick={() => void handleShareExam(exam.id)}
                          disabled={shareExamState.loading}
                        >
                          {shareExamState.loading
                            ? "Хуваалцаж байна..."
                            : "Материал + анализтай нь хуваалцах"}
                        </button>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="rounded-2xl border border-dashed border-[#D0D5DD] px-4 py-6 text-[14px] text-[#667085]">
                    Энэ community-ийн хичээлтэй тохирох шалгалт одоогоор алга.
                  </div>
                )}
              </CommunitySectionCard>

              <CommunitySectionCard
                title="Их алдсан асуултууд"
                description="Энэ community-ийн хүрээнд хамгийн олон алдаа гарсан асуултууд."
              >
                {selectedCommunityMissedQuestions.length ? (
                  <div className="space-y-4">
                    {selectedCommunityMissedQuestions.map((question) => (
                      <article key={question.questionId} className="space-y-2">
                        <div className="flex items-start justify-between gap-4">
                          <div>
                            <p className="text-[14px] font-medium text-[#0F1216]">
                              {truncate(question.prompt, 92)}
                            </p>
                            <p className="mt-1 text-[12px] text-[#667085]">
                              {question.bankTitle} · {question.attemptCount} оролдлого
                            </p>
                          </div>
                          <span className="rounded-full bg-[#FFF1F3] px-2.5 py-1 text-[12px] font-semibold text-[#C01048]">
                            {question.missRate}%
                          </span>
                        </div>
                        <div className="h-2 overflow-hidden rounded-full bg-[#F2F4F7]">
                          <div
                            className="h-full rounded-full bg-[#F97066]"
                            style={{
                              width: `${Math.max(
                                12,
                                (question.missRate / Math.max(maxMissedRate, 1)) * 100,
                              )}%`,
                            }}
                          />
                        </div>
                      </article>
                    ))}
                  </div>
                ) : (
                  <div className="rounded-2xl border border-dashed border-[#D0D5DD] px-4 py-8 text-center text-[14px] text-[#667085]">
                    Энэ community дээр асуултын analytics хараахан бүрдээгүй байна.
                  </div>
                )}
              </CommunitySectionCard>
            </div>
          </div>
        </div>
      ) : effectiveSelectedCommunityId && detailQuery.loading ? (
        <div className="rounded-2xl border border-[#DFE1E5] bg-white px-6 py-12 text-center text-[14px] text-[#667085] shadow-[0px_4px_8px_-2px_rgba(0,0,0,0.08)]">
          Community-ийн дэлгэрэнгүй мэдээллийг ачаалж байна...
        </div>
      ) : (
        <div className="rounded-2xl border border-dashed border-[#D0D5DD] bg-white px-6 py-12 text-center text-[14px] text-[#667085] shadow-[0px_4px_8px_-2px_rgba(0,0,0,0.08)]">
          Дээрх community card-уудын аль нэг дээр дараад доторх гишүүд, bank, exam,
          share хэсгүүдээ үзээрэй.
        </div>
      )}

      <CommunityBankPreviewDialog
        bankId={previewBankId}
        open={Boolean(previewBankId)}
        onClose={() => setPreviewBankId(null)}
      />
      <CommunityExamPreviewDialog
        key={previewExam?.examId ?? "community-exam-preview-closed"}
        examId={previewExam?.examId ?? null}
        communityId={previewExam?.communityId ?? null}
        open={Boolean(previewExam?.examId)}
        onClose={() => setPreviewExam(null)}
      />
    </section>
  );
}
