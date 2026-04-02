/* eslint-disable max-lines */
"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import {
  useForkQuestionToMyBankMutation,
  useMyExamsQueryQuery,
  useQuestionBankDetailQueryQuery,
  useRequestQuestionAccessMutation,
  useReviewQuestionAccessRequestMutation,
} from "@/graphql/generated";
import { useLiveQuestionBankEvents } from "@/lib/use-live-question-bank-events";
import { PlusIcon } from "../icons";
import { TeacherBackButton } from "../teacher-back-button";
import { QuestionAccessRequestsPanel } from "./question-access-requests-panel";
import { QuestionBankDetailTable } from "./question-bank-detail-table";
import { QuestionBankDetailFilters } from "./question-bank-detail-filters";
import {
  getDifficultyOptions,
  getFilteredQuestionRows,
  getQuestionBankRows,
  getQuestionUsageStats,
  getRelatedExamRows,
  getTopicOptions,
  getTypeOptions,
} from "./question-bank-detail-helpers";
import {
  QuestionBankRelatedExams,
} from "./question-bank-related-exams";

type QuestionBankDetailSectionProps = {
  bankId: string;
  onAddQuestion: () => void;
  onSubjectChange: (subject: string) => void;
};

type DetailTab = "questions" | "related-exams";

export function QuestionBankDetailSection({
  bankId,
  onAddQuestion,
  onSubjectChange,
}: QuestionBankDetailSectionProps) {
  const [search, setSearch] = useState("");
  const [topic, setTopic] = useState("Бүх сэдэв");
  const [difficulty, setDifficulty] = useState("Бүх түвшин");
  const [type, setType] = useState("Бүх төрөл");
  const [activeTab, setActiveTab] = useState<DetailTab>("questions");
  const [requestingQuestionId, setRequestingQuestionId] = useState<string | null>(null);
  const [forkingQuestionId, setForkingQuestionId] = useState<string | null>(null);
  const [reviewingRequestId, setReviewingRequestId] = useState<string | null>(null);
  const { data, loading, error, refetch: refetchDetail } = useQuestionBankDetailQueryQuery({
    variables: { id: bankId },
    fetchPolicy: "cache-and-network",
  });
  const examsQuery = useMyExamsQueryQuery({
    fetchPolicy: "cache-and-network",
  });
  const [requestQuestionAccess] = useRequestQuestionAccessMutation();
  const [reviewQuestionAccessRequest] = useReviewQuestionAccessRequestMutation();
  const [forkQuestionToMyBank] = useForkQuestionToMyBankMutation();
  const bank = data?.questionBank ?? null;
  const viewerId = data?.me?.id ?? null;
  const isOwnedBank = Boolean(bank && viewerId && bank.owner.id === viewerId);

  useLiveQuestionBankEvents({
    teacherId: isOwnedBank ? viewerId : null,
    includePublic: Boolean(bank?.visibility === "PUBLIC" && !isOwnedBank),
    enabled: Boolean(viewerId && bank),
    onEvent: (event) => {
      if (event.bankId !== bankId) {
        return;
      }

      void refetchDetail();
    },
  });
  const questionUsageStats = useMemo(
    () => getQuestionUsageStats(bank?.questions, examsQuery.data?.exams),
    [bank?.questions, examsQuery.data?.exams],
  );
  const relatedExams = useMemo(
    () => getRelatedExamRows(bank?.questions, examsQuery.data?.exams),
    [bank?.questions, examsQuery.data?.exams],
  );
  const rowState = useMemo(() => {
    try {
      return {
        rows: getQuestionBankRows(bank?.questions, questionUsageStats),
        mappingError: null as string | null,
      };
    } catch (mappingError) {
      console.error("Failed to build question bank detail rows", mappingError);
      return {
        rows: [],
        mappingError: "Асуултын мөрүүдийг боловсруулах үед алдаа гарлаа.",
      };
    }
  }, [bank, questionUsageStats]);
  const rows = rowState.rows;
  const errorMessage =
    rowState.mappingError ??
    (error ? "Асуултын сангийн дэлгэрэнгүйг уншихад алдаа гарлаа." : null);

  useEffect(() => {
    try {
      onSubjectChange(bank?.subject ?? "Хичээл");
    } catch (subjectError) {
      console.error("Failed to sync question bank subject", subjectError);
    }
  }, [bank?.subject, onSubjectChange]);

  const isEditable = isOwnedBank;

  const filteredRows = useMemo(() => {
    try {
      return getFilteredQuestionRows({ rows, search, topic, difficulty, type });
    } catch (filterError) {
      console.error("Failed to filter question bank rows", filterError);
      return rows;
    }
  }, [difficulty, rows, search, topic, type]);

  const topicOptions = getTopicOptions(rows);
  const typeOptions = getTypeOptions(rows);
  const difficultyOptions = getDifficultyOptions(rows);
  const title = bank?.title ?? "Асуултын сан";
  const subject = bank?.subject ?? "Хичээл";
  const count = bank?.questionCount ?? 0;
  const viewerRequestStatusByQuestionId = useMemo(() => {
    const next: Record<string, "PENDING" | "APPROVED" | "REJECTED" | undefined> = {};
    for (const request of data?.questionAccessRequests ?? []) {
      if (request.requester.id !== viewerId || request.question.bank.id !== bankId) {
        continue;
      }

      if (!next[request.question.id]) {
        next[request.question.id] = request.status;
      }
    }
    return next;
  }, [bankId, data?.questionAccessRequests, viewerId]);
  const ownedBankOptions = useMemo(
    () =>
      (data?.questionBanks ?? [])
        .filter((item) => item.owner.id === viewerId)
        .map((item) => ({
          id: item.id,
          label: `${item.grade}-р анги · ${item.subject} · ${item.topic || item.title}`,
        })),
    [data?.questionBanks, viewerId],
  );
  const accessRequestRows = useMemo(() => {
    const relevantRequests = (data?.questionAccessRequests ?? []).filter(
      (request) => request.question.bank.id === bankId,
    );

    return {
      incoming: relevantRequests
        .filter((request) => request.owner.id === viewerId)
        .map((request) => ({
          id: request.id,
          questionId: request.question.id,
          questionTitle: request.question.prompt.trim() || request.question.title.trim(),
          requesterName: request.requester.fullName,
          ownerName: request.owner.fullName,
          status: request.status,
          createdAt: request.createdAt,
          reviewedAt: request.reviewedAt,
        })),
      outgoing: relevantRequests
        .filter((request) => request.requester.id === viewerId)
        .map((request) => ({
          id: request.id,
          questionId: request.question.id,
          questionTitle: request.question.prompt.trim() || request.question.title.trim(),
          requesterName: request.requester.fullName,
          ownerName: request.owner.fullName,
          status: request.status,
          createdAt: request.createdAt,
          reviewedAt: request.reviewedAt,
        })),
    };
  }, [bankId, data?.questionAccessRequests, viewerId]);

  const handleRequestAccess = async (questionId: string) => {
    try {
      setRequestingQuestionId(questionId);
      await requestQuestionAccess({
        variables: { questionId },
      });
      await refetchDetail();
      window.alert("Асуултыг ашиглах хүсэлт амжилттай илгээгдлээ.");
    } catch (requestError) {
      console.error("Failed to request question access", requestError);
      window.alert("Хүсэлт илгээх үед алдаа гарлаа.");
    } finally {
      setRequestingQuestionId(null);
    }
  };

  const handleReviewRequest = async (requestId: string, approve: boolean) => {
    try {
      setReviewingRequestId(requestId);
      await reviewQuestionAccessRequest({
        variables: { requestId, approve },
      });
      await refetchDetail();
    } catch (reviewError) {
      console.error("Failed to review question access request", reviewError);
      window.alert("Хүсэлтийг шийдэх үед алдаа гарлаа.");
    } finally {
      setReviewingRequestId(null);
    }
  };

  const handleForkQuestion = async (questionId: string, targetBankId: string) => {
    try {
      setForkingQuestionId(questionId);
      const result = await forkQuestionToMyBank({
        variables: { questionId, targetBankId },
      });
      const createdTitle = result.data?.forkQuestionToMyBank.bank.title;
      window.alert(
        createdTitle
          ? `Асуултыг "${createdTitle}" санд хувилбарлаж нэмлээ.`
          : "Асуултыг таны санд хувилбарлаж нэмлээ.",
      );
      await refetchDetail();
    } catch (forkError) {
      console.error("Failed to fork question to my bank", forkError);
      window.alert("Асуултыг хувилбарлах үед алдаа гарлаа.");
    } finally {
      setForkingQuestionId(null);
    }
  };
  return (
    <section className="mx-auto w-full max-w-[1120px] space-y-8">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div className="flex items-start gap-4">
          <div className="mt-0.5">
            <TeacherBackButton fallbackHref="/question-bank" />
          </div>
          <div>
            <h1 className="text-[24px] font-semibold text-[#0F1216]">
              {loading ? (
                <span className="block h-8 w-64 animate-pulse rounded bg-[#E9EDF3]" />
              ) : (
                title
              )}
            </h1>
            <p className="mt-1 text-[14px] text-[#52555B]">
              {loading ? (
                <span className="block h-5 w-40 animate-pulse rounded bg-[#E9EDF3]" />
              ) : (
                `${subject} · ${count} асуулт · ${relatedExams.length} холбоотой шалгалт`
              )}
            </p>
          </div>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          {bank ? (
            <Link
              href={`/create-exam?bankId=${bank.id}`}
              className="inline-flex h-9 items-center gap-2 rounded-md border border-[#00267F] bg-white px-4 text-[14px] font-medium text-[#00267F]"
            >
              Энэ сэдвээс шалгалт үүсгэх
            </Link>
          ) : null}
          <button
            type="button"
            onClick={onAddQuestion}
            disabled={!isEditable}
            className="inline-flex h-9 cursor-pointer items-center gap-2 rounded-md bg-[#00267F] px-4 text-[14px] font-medium text-white disabled:cursor-not-allowed disabled:bg-[#98A2B3]"
          >
            <PlusIcon className="h-4 w-4" />
            {isEditable ? "Асуулт нэмэх" : "Read only сан"}
          </button>
        </div>
      </div>

      {!loading && bank ? (
        <div className="flex flex-wrap items-center gap-2 text-[13px] text-[#52555B]">
          <span className="rounded-md bg-[#F2F4F7] px-2.5 py-1 font-medium text-[#344054]">
            {`${bank.grade}-р анги`}
          </span>
          <span className="rounded-md bg-[#F2F4F7] px-2.5 py-1 font-medium text-[#344054]">
            {bank.visibility === "PUBLIC" ? "Нэгдсэн сан" : "Миний сан"}
          </span>
          <span>
            {isEditable
              ? "Энэ сан дээр асуулт нэмэх, засах боломжтой."
              : `${bank.owner.fullName}-ийн хуваалцсан сан. Асуултыг зөвхөн харах боломжтой.`}
          </span>
        </div>
      ) : null}

      <QuestionAccessRequestsPanel
        incoming={accessRequestRows.incoming}
        outgoing={accessRequestRows.outgoing}
        reviewingRequestId={reviewingRequestId}
        onApprove={(requestId) => handleReviewRequest(requestId, true)}
        onReject={(requestId) => handleReviewRequest(requestId, false)}
      />

      <div className="flex flex-wrap gap-3">
        <button
          type="button"
          onClick={() => setActiveTab("questions")}
          className={`inline-flex h-9 items-center rounded-full border px-4 text-[14px] font-medium transition ${
            activeTab === "questions"
              ? "border-[#00267F] bg-[#00267F] text-white"
              : "border-[#DFE1E5] bg-white text-[#344054] hover:border-[#BFC5D0]"
          }`}
        >
          Асуултууд
        </button>
        <button
          type="button"
          onClick={() => setActiveTab("related-exams")}
          className={`inline-flex h-9 items-center rounded-full border px-4 text-[14px] font-medium transition ${
            activeTab === "related-exams"
              ? "border-[#00267F] bg-[#00267F] text-white"
              : "border-[#DFE1E5] bg-white text-[#344054] hover:border-[#BFC5D0]"
          }`}
        >
          Холбоотой шалгалтууд
        </button>
      </div>

      {activeTab === "questions" ? (
        <>
          <QuestionBankDetailFilters
            search={search}
            subject={subject}
            topic={topic}
            difficulty={difficulty}
            type={type}
            topicOptions={topicOptions}
            difficultyOptions={difficultyOptions}
            typeOptions={typeOptions}
            onSearchChange={setSearch}
            onTopicChange={setTopic}
            onDifficultyChange={setDifficulty}
            onTypeChange={setType}
          />

          <QuestionBankDetailTable
            bankId={bankId}
            subject={bank?.subject ?? "Хичээл"}
            editable={isEditable}
            loading={loading}
            errorMessage={errorMessage}
            rows={filteredRows}
            ownedBankOptions={ownedBankOptions}
            requestStatusByQuestionId={viewerRequestStatusByQuestionId}
            requestingQuestionId={requestingQuestionId}
            forkingQuestionId={forkingQuestionId}
            onRequestAccess={handleRequestAccess}
            onForkQuestion={handleForkQuestion}
          />
        </>
      ) : (
        <QuestionBankRelatedExams rows={relatedExams} />
      )}
    </section>
  );
}
