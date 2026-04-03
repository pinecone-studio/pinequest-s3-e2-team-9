"use client";

import type { ExamStatus } from "@/graphql/generated";

export type QuestionBankRelatedExamRow = {
  id: string;
  title: string;
  className: string;
  questionCount: number;
  reusedQuestionCount: number;
  status: ExamStatus;
  isTemplate: boolean;
  createdAt: string;
};

type QuestionBankRelatedExamsProps = {
  rows: QuestionBankRelatedExamRow[];
};

const STATUS_LABELS: Record<ExamStatus, string> = {
  DRAFT: "Ноорог",
  PUBLISHED: "Идэвхтэй",
  CLOSED: "Хаагдсан",
};

const STATUS_TONES: Record<ExamStatus, string> = {
  DRAFT: "bg-[#F3E8FF] text-[#6434F8]",
  PUBLISHED: "bg-[#ECFDF3] text-[#027A48]",
  CLOSED: "bg-[#F2F4F7] text-[#344054]",
};

const formatDate = (value: string) => {
  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return new Intl.DateTimeFormat("mn-MN", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(date);
};

export function QuestionBankRelatedExams({
  rows,
}: QuestionBankRelatedExamsProps) {
  if (!rows.length) {
    return (
      <div className="rounded-xl border border-dashed border-[#D0D5DD] bg-white p-8 text-center">
        <h2 className="text-[18px] font-semibold text-[#101828]">
          Энэ сангаас ашигласан шалгалт алга байна
        </h2>
        <p className="mt-2 text-[14px] text-[#667085]">
          Энэ bank-ийн асуултуудыг ашиглан анхны шалгалтаа үүсгэж болно.
        </p>
      </div>
    );
  }

  return (
    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
      {rows.map((row) => (
        <article
          key={row.id}
          className="rounded-xl border border-[#DFE1E5] bg-white p-5 shadow-[0px_1px_3px_rgba(0,0,0,0.1),0px_1px_2px_-1px_rgba(0,0,0,0.1)]"
        >
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="text-[16px] font-medium text-[#0F1216]">{row.title}</p>
              <p className="mt-1 text-[13px] text-[#667085]">{row.className}</p>
            </div>
            <span
              className={`rounded-md px-2.5 py-1 text-[12px] font-medium ${STATUS_TONES[row.status]}`}
            >
              {STATUS_LABELS[row.status]}
            </span>
          </div>
          <div className="mt-4 flex flex-wrap gap-2 text-[12px]">
            <span className="rounded-md bg-[#F2F4F7] px-2.5 py-1 font-medium text-[#344054]">
              {row.isTemplate ? "Template" : "Assigned"}
            </span>
            <span className="rounded-md bg-[#F3E8FF] px-2.5 py-1 font-medium text-[#6434F8]">
              {row.reusedQuestionCount} асуулт ашигласан
            </span>
            <span className="rounded-md bg-[#FFF4ED] px-2.5 py-1 font-medium text-[#B54708]">
              Нийт {row.questionCount} асуулт
            </span>
          </div>
          <p className="mt-4 text-[13px] text-[#667085]">
            Үүсгэсэн огноо: {formatDate(row.createdAt)}
          </p>
        </article>
      ))}
    </div>
  );
}
