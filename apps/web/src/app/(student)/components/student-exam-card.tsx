import Link from "next/link";
import type { ReactNode } from "react";
import { PersonIcon, EducationIcon, PendingIcon, ResultIcon } from "./student-home-icons";

export type ExamCardData = {
  duration: string;
  endLabel: string;
  id: string;
  points: string;
  progress: number;
  questionCount: string;
  searchText: string;
  startedLabel: string;
  subject: string;
  teacher: string;
  title: string;
};

export type CompletedExamCardData = {
  id: string;
  scoreLabel: string;
  scoreTone: string;
  searchText: string;
  statusLabel: string;
  statusTone: string;
  subject: string;
  title: string;
};

export function SectionTitle({
  badge,
  badgeTone,
  icon,
  title,
}: {
  badge?: string;
  badgeTone?: string;
  icon: ReactNode;
  title: string;
}) {
  return (
    <div className="flex w-full items-center gap-2">
      {icon}
      <h2 className="text-[18px] font-semibold leading-7 text-[#0F1216]">{title}</h2>
      {badge ? (
        <span
          className={`inline-flex h-[22px] items-center justify-center rounded-[6px] px-2 text-[12px] font-medium ${badgeTone}`}
        >
          {badge}
        </span>
      ) : null}
    </div>
  );
}

function ExamMetaRow({ icon, value }: { icon: ReactNode; value: string }) {
  return (
    <div className="flex items-center gap-1.5 text-white/92">
      {icon}
      <span className="text-[14px] font-medium leading-4">{value}</span>
    </div>
  );
}

function ExamPill({ value }: { value: string }) {
  return (
    <span className="inline-flex h-6 items-center justify-center rounded-[16px] bg-white px-2 text-[12px] font-medium leading-4 text-[#0F1216]">
      {value}
    </span>
  );
}

export function ExamCard({
  card,
  tone,
}: {
  card: ExamCardData;
  tone: "live" | "available";
}) {
  const cardTone =
    tone === "live"
      ? "bg-[#31AA40] shadow-[inset_0_-1px_0_rgba(255,255,255,0.08)]"
      : "bg-[#6F90FF]";
  const progressTone = tone === "live" ? "bg-[#31AA40]" : "bg-[#6F90FF]";
  const buttonTone = tone === "live" ? "bg-[#31AA40] text-[#F6F9FC]" : "bg-[#6F90FF] text-[#F6F9FC]";
  const buttonLabel = tone === "live" ? "Шалгалтаа үргэлжлүүлэх" : "Шалгалтруу орох";

  return (
    <article className="flex flex-col rounded-[16px] border border-[#F1F2F3] bg-white p-[10px] shadow-[0_4px_8px_-2px_rgba(0,0,0,0.1),0_2px_4px_-2px_rgba(0,0,0,0.06)]">
      <div className={`rounded-[16px_16px_4px_4px] px-[14px] py-[18px] text-white ${cardTone}`}>
        <h3 className="text-[18px] font-bold leading-5">{card.title}</h3>
        <div className="mt-3 space-y-2">
          <ExamMetaRow
            icon={<PersonIcon className="h-4 w-4 text-white" />}
            value={card.teacher}
          />
          <ExamMetaRow
            icon={<EducationIcon className="h-4 w-4 text-white" />}
            value={card.subject}
          />
          <div className="flex flex-wrap gap-2 pt-1">
            <ExamPill value={card.questionCount} />
            <ExamPill value={card.duration} />
            <ExamPill value={card.points} />
          </div>
        </div>
      </div>

      <div className="space-y-[6px] px-2 pt-3">
        <div className="flex items-center justify-between gap-4">
          <span className="text-[12px] font-medium leading-4 text-[#52555B]">
            {card.startedLabel}
          </span>
          <div className="flex flex-col items-end">
            <span className="text-[10px] font-semibold uppercase leading-[14px] text-[#0F1216]">
              Үлдсэн хугацаа
            </span>
            <span className="text-[12px] font-semibold leading-4 text-[#0F1216]">
              {card.endLabel}
            </span>
          </div>
        </div>

        <div className="h-[6px] w-full rounded-full bg-[#F1F2F3]">
          <div
            className={`h-[6px] rounded-full ${progressTone}`}
            style={{ width: `${Math.max(8, Math.min(100, card.progress * 100))}%` }}
          />
        </div>
      </div>

      <Link
        className={`mt-3 inline-flex h-9 w-full items-center justify-center rounded-[8px] text-[14px] font-bold leading-5 ${buttonTone}`}
        href={`/student/exams/${card.id}`}
      >
        {buttonLabel}
      </Link>
    </article>
  );
}

export function CompletedExamCard({ card }: { card: CompletedExamCardData }) {
  return (
    <article className="relative max-w-[373px] overflow-hidden rounded-[12px] border border-[rgba(254,154,0,0.3)] bg-white shadow-[0_1px_3px_rgba(0,0,0,0.1),0_1px_2px_-1px_rgba(0,0,0,0.1)]">
      <div className="p-5">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h3 className="text-[16px] font-semibold leading-6 text-[#0F1216]">
              {card.title}
            </h3>
            <p className="text-[14px] leading-5 text-[#52555B]">{card.subject}</p>
          </div>

          <span className={`inline-flex items-center gap-1 rounded-[6px] border px-2 py-[2px] text-[12px] font-medium leading-4 ${card.statusTone}`}>
            <PendingIcon className="h-3 w-3" />
            {card.statusLabel}
          </span>
        </div>

        <div className="mt-5 flex items-center justify-between">
          <span className="text-[14px] leading-5 text-[#52555B]">Score</span>
          <span className={`text-[14px] font-bold leading-5 ${card.scoreTone}`}>{card.scoreLabel}</span>
        </div>

        <button
          className="mt-4 inline-flex h-9 w-full items-center justify-center gap-2 rounded-[6px] border border-[#DFE1E5] bg-[#FAFAFA] text-[14px] font-medium leading-5 text-[#0F1216] shadow-[0_1px_2px_rgba(0,0,0,0.05)]"
          type="button"
        >
          <ResultIcon className="h-4 w-4 text-[#0F1216]" />
          View Result
        </button>
      </div>
    </article>
  );
}
