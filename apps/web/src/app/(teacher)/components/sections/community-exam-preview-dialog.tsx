/* eslint-disable max-lines */
"use client";

import { useMemo, useState } from "react";
import { QuestionType, useCommunityExamPreviewQuery } from "@/graphql/generated";
import { getQuestionPromptImageValue } from "@/lib/question-prompt-image";
import { ExamPreviewQuestionCard } from "./exam-preview-question-card";
import type { MyExamQuestionPreview } from "./my-exams-types";

type CommunityExamPreviewDialogProps = {
  examId: string | null;
  communityId?: string | null;
  open: boolean;
  onClose: () => void;
};

const getPreviewTypeLabel = (type: QuestionType) => {
  if (type === QuestionType.ShortAnswer) return "Тоон";
  if (type === QuestionType.Essay) return "Задгай";
  if (type === QuestionType.ImageUpload) return "Зураг";
  return "Сонгох";
};

const getPreviewAnswerText = (
  type: QuestionType,
  correctAnswer: string | null | undefined,
) => {
  if (!correctAnswer) return null;
  if (type === QuestionType.TrueFalse) {
    return `Зөв хариулт: ${correctAnswer === "True" ? "Үнэн" : "Худал"}`;
  }
  if (type === QuestionType.ShortAnswer) {
    return `Зөв хариулт: ${correctAnswer}`;
  }
  if (type === QuestionType.Essay) {
    return `Жишиг хариулт: ${correctAnswer}`;
  }
  if (type === QuestionType.ImageUpload) {
    return "Зургийн тайлбар шаардлагатай.";
  }
  return null;
};

export function CommunityExamPreviewDialog({
  examId,
  communityId,
  open,
  onClose,
}: CommunityExamPreviewDialogProps) {
  const [activeTab, setActiveTab] = useState<"material" | "results" | "analytics">(
    "material",
  );
  const { data, loading, error } = useCommunityExamPreviewQuery({
    variables: {
      examId: examId ?? "",
      communityId: communityId ?? null,
    },
    skip: !open || !examId,
    fetchPolicy: "network-only",
  });

  const preview = data?.communityExamPreview ?? null;
  const previewQuestions = useMemo<MyExamQuestionPreview[]>(
    () =>
      (preview?.questions ?? []).map((question) => ({
        id: question.id,
        order: question.order,
        prompt: question.prompt,
        promptImageValue: getQuestionPromptImageValue(question.tags),
        topic: question.topic,
        kind:
          question.type === QuestionType.Mcq || question.type === QuestionType.TrueFalse
            ? "options"
            : question.type === QuestionType.ImageUpload
              ? "upload"
              : "text",
        points: question.points,
        typeLabel: getPreviewTypeLabel(question.type),
        options: question.options,
        correctAnswer: question.correctAnswer ?? null,
        answerText: getPreviewAnswerText(question.type, question.correctAnswer),
      })),
    [preview?.questions],
  );

  if (!open || !examId) {
    return null;
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-start justify-center bg-black/40 p-4 sm:p-6"
      role="dialog"
      aria-modal="true"
      onClick={onClose}
    >
      <div
        className="max-h-[calc(100vh-32px)] w-full max-w-[920px] overflow-y-auto rounded-2xl border border-[#D0D5DD] bg-[#FAFAFA] shadow-[0px_20px_24px_-4px_rgba(16,24,40,0.08),0px_8px_8px_-4px_rgba(16,24,40,0.03)]"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="border-b border-[#EAECF0] px-6 py-5">
          <div className="flex items-start justify-between gap-4">
            <div>
              <h3 className="text-[20px] font-semibold text-[#101828]">
                {preview?.title ?? "Шалгалтын preview"}
              </h3>
              <p className="mt-1 text-[14px] text-[#667085]">
                {preview
                  ? `${preview.className} · ${preview.subject} · ${preview.questionCount} асуулт`
                  : "Шалгалтыг ачаалж байна..."}
              </p>
              {preview ? (
                <p className="mt-2 text-[14px] text-[#52555B]">
                  {preview.communityName ? `${preview.communityName} · ` : ""}
                  {preview.durationMinutes} минут · {preview.totalPoints} оноо
                </p>
              ) : null}
            </div>
            <button
              type="button"
              className="rounded-lg px-3 py-2 text-[14px] text-[#344054] hover:bg-white"
              onClick={onClose}
            >
              Хаах
            </button>
          </div>
        </div>

        <div className="space-y-4 px-6 py-5">
          {loading && !preview ? (
            <div className="rounded-2xl border border-[#D0D5DD] bg-white px-4 py-6 text-[14px] text-[#52555B]">
              Шалгалтын дэлгэрэнгүйг ачаалж байна...
            </div>
          ) : null}

          {error && !preview ? (
            <div className="rounded-2xl border border-[#FECACA] bg-[#FEF2F2] px-4 py-6 text-[14px] text-[#B42318]">
              Шалгалтын preview ачаалж чадсангүй.
            </div>
          ) : null}

          {preview ? (
            <>
              <div className="flex w-full items-center rounded-lg bg-[#F0F2F5] p-[3px]">
                <button
                  type="button"
                  onClick={() => setActiveTab("material")}
                  className={`flex-1 rounded-md px-4 py-1.5 text-[14px] font-medium text-[#0F1216] ${
                    activeTab === "material"
                      ? "bg-[#FAFAFA] shadow-[0px_1px_3px_rgba(0,0,0,0.1),0px_1px_2px_-1px_rgba(0,0,0,0.1)]"
                      : ""
                  }`}
                >
                  Материал
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTab("results")}
                  className={`flex-1 rounded-md px-4 py-1.5 text-[14px] font-medium text-[#0F1216] ${
                    activeTab === "results"
                      ? "bg-[#FAFAFA] shadow-[0px_1px_3px_rgba(0,0,0,0.1),0px_1px_2px_-1px_rgba(0,0,0,0.1)]"
                      : ""
                  }`}
                >
                  Үр дүн
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTab("analytics")}
                  className={`flex-1 rounded-md px-4 py-1.5 text-[14px] font-medium text-[#0F1216] ${
                    activeTab === "analytics"
                      ? "bg-[#FAFAFA] shadow-[0px_1px_3px_rgba(0,0,0,0.1),0px_1px_2px_-1px_rgba(0,0,0,0.1)]"
                      : ""
                  }`}
                >
                  Анализ
                </button>
              </div>

              {activeTab === "material" ? (
                <div className="space-y-4">
                  {previewQuestions.map((question, index) => (
                    <ExamPreviewQuestionCard
                      key={question.id}
                      index={index}
                      question={question}
                    />
                  ))}
                </div>
              ) : null}

              {activeTab === "results" ? (
                <div className="space-y-4">
                  <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
                    <ResultStatCard
                      label="Нийт өгсөн"
                      value={`${preview.summary.submittedCount}/${preview.summary.studentCount}`}
                    />
                    <ResultStatCard
                      label="Дундаж амжилт"
                      value={`${preview.summary.averagePercent}%`}
                    />
                    <ResultStatCard
                      label="Тэнцсэн хувь"
                      value={`${preview.summary.passRate}%`}
                    />
                    <ResultStatCard
                      label="Хамрагдалт"
                      value={`${preview.summary.completionRate}%`}
                    />
                  </div>

                  <section className="rounded-xl border border-[#DFE1E5] bg-white p-5">
                    <h4 className="text-[16px] font-semibold text-[#101828]">
                      Ерөнхий үр дүн
                    </h4>
                    <p className="mt-2 text-[14px] leading-6 text-[#475467]">
                      Энэ preview дээр сурагчийн нэр, нэг бүрийн хариулт
                      харагдахгүй. Зөвхөн ерөнхий үр дүн, тархалт, анализийг үзүүлж
                      байна.
                    </p>
                    <div className="mt-4 grid gap-3 sm:grid-cols-3">
                      <ResultStatCard
                        label="Хамгийн өндөр"
                        value={`${preview.summary.highestPercent}%`}
                      />
                      <ResultStatCard
                        label="Хамгийн бага"
                        value={`${preview.summary.lowestPercent}%`}
                      />
                      <ResultStatCard
                        label="Асуултын тоо"
                        value={preview.questionCount}
                      />
                    </div>
                  </section>

                  <AnalyticsBarList
                    title="Онооны тархалт"
                    items={preview.scoreDistribution}
                    barColor="bg-[#175CD3]"
                  />
                </div>
              ) : null}

              {activeTab === "analytics" ? (
                <div className="space-y-4">
                  <section className="grid gap-3 lg:grid-cols-3">
                    {preview.insights.map((insight) => (
                      <div
                        key={insight.title}
                        className={`rounded-xl border p-4 ${getToneClassName(insight.tone)}`}
                      >
                        <h4 className="text-[15px] font-semibold text-[#101828]">
                          {insight.title}
                        </h4>
                        <p className="mt-2 text-[14px] leading-6 text-[#475467]">
                          {insight.description}
                        </p>
                      </div>
                    ))}
                  </section>

                  <div className="grid gap-5 xl:grid-cols-2">
                    <AnalyticsBarList
                      title="Сэдвийн гүйцэтгэл"
                      items={preview.topicPerformance}
                      barColor="bg-[#12B76A]"
                    />
                    <AnalyticsBarList
                      title="Хамгийн их алдсан асуултууд"
                      items={preview.questionPerformance}
                      barColor="bg-[#F97066]"
                    />
                  </div>

                  <section className="rounded-xl border border-[#B2DDFF] bg-[#F0F9FF] p-5">
                    <h4 className="text-[16px] font-semibold text-[#101828]">
                      Нэгтгэсэн дүгнэлт
                    </h4>
                    <p className="mt-3 text-[14px] leading-7 text-[#344054]">
                      {preview.overallConclusion}
                    </p>
                  </section>
                </div>
              ) : null}
            </>
          ) : null}
        </div>
      </div>
    </div>
  );
}

function ResultStatCard({
  label,
  value,
}: {
  label: string;
  value: string | number;
}) {
  return (
    <div className="rounded-xl border border-[#DFE1E5] bg-white px-4 py-3">
      <div className="text-[24px] font-semibold text-[#101828]">{value}</div>
      <div className="text-[12px] text-[#667085]">{label}</div>
    </div>
  );
}

function AnalyticsBarList({
  title,
  items,
  barColor,
}: {
  title: string;
  items: Array<{ label: string; value: number; meta: string; note?: string | null }>;
  barColor: string;
}) {
  return (
    <section className="rounded-xl border border-[#DFE1E5] bg-white p-5">
      <h4 className="text-[16px] font-semibold text-[#101828]">{title}</h4>
      <div className="mt-4 space-y-3">
        {items.map((item) => (
          <div key={`${title}-${item.label}`} className="space-y-1.5">
            <div className="flex items-center justify-between gap-3 text-[13px]">
              <span className="font-medium text-[#101828]">{item.label}</span>
              <span className="text-[#667085]">{item.meta}</span>
            </div>
            <div className="flex items-center gap-3">
              <div className="h-2 flex-1 rounded-full bg-[#EAECF0]">
                <div
                  className={`h-2 rounded-full ${barColor}`}
                  style={{ width: `${Math.max(item.value, 2)}%` }}
                />
              </div>
              <span className="w-12 text-right text-[13px] font-semibold text-[#101828]">
                {item.value}%
              </span>
            </div>
            {item.note ? (
              <p className="text-[12px] text-[#667085]">{item.note}</p>
            ) : null}
          </div>
        ))}
      </div>
    </section>
  );
}

function getToneClassName(tone: string) {
  if (tone === "success") {
    return "border-[#ABEFC6] bg-[#ECFDF3]";
  }
  if (tone === "warning") {
    return "border-[#FEDF89] bg-[#FFFAEB]";
  }
  return "border-[#DFE1E5] bg-white";
}
