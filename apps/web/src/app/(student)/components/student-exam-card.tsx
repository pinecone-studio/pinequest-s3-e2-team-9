/* eslint-disable max-lines */
import Link from "next/link";
import type { ReactNode } from "react";
import {
  BookOutlineIcon,
  CheckCircleOutlineIcon,
  EducationIcon,
  PendingIcon,
  PersonIcon,
  ResultIcon,
} from "./student-home-icons";

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
      <h2 className="font-[var(--font-geist)] text-[18px] font-semibold leading-7 text-[#0F1216]">
        {title}
      </h2>
      {badge ? (
        <span
          className={`inline-flex h-[22px] min-w-[26px] items-center justify-center rounded-[12px] px-2 font-[var(--font-geist)] text-[12px] font-medium ${badgeTone}`}
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
      <span className="font-[var(--font-geist)] text-[14px] font-medium leading-4">{value}</span>
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
  tone: _tone,
}: {
  card: ExamCardData;
  tone: "live" | "available";
}) {
  const cardTone = "bg-[#6F90FF]";
  const progressTone = "bg-[#6F90FF]";
  const buttonTone = "bg-[rgba(111,144,255,0.8)] text-[#F6F9FC]";
  const buttonLabel = "Шалгалтруу орох";

  return (
    <article className="flex h-[272px] w-full flex-col items-center gap-3 rounded-[16px] border border-[#F1F2F3] bg-white p-[10px] shadow-[0_4px_8px_-2px_rgba(0,0,0,0.1),0_2px_4px_-2px_rgba(0,0,0,0.06)]">
      <div className={`h-[142px] w-full rounded-[16px_16px_4px_4px] px-[14px] py-[18px] text-white ${cardTone}`}>
        <h3 className="font-[var(--font-manrope)] text-[18px] font-bold leading-5">
          {card.title}
        </h3>
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

      <div className="w-full space-y-[6px] px-2">
        <div className="flex items-center justify-between gap-4">
          <span className="font-[var(--font-manrope)] text-[12px] font-medium leading-4 text-[#52555B]">
            {card.startedLabel}
          </span>
          <div className="flex flex-col items-end">
            <span className="font-[var(--font-manrope)] text-[10px] font-semibold leading-[14px] text-[#0F1216]">
              үлдсэн хугацаа
            </span>
            <span className="font-[var(--font-manrope)] text-[12px] font-semibold leading-4 text-[#0F1216]">
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
        className={`inline-flex h-9 w-full items-center justify-center rounded-[8px] font-[var(--font-manrope)] text-[14px] font-bold leading-5 ${buttonTone}`}
        href={`/student/exams/${card.id}`}
      >
        {buttonLabel}
      </Link>
    </article>
  );
}

export function CompletedExamCard({ card }: { card: CompletedExamCardData }) {
  return (
    <article className="relative w-full overflow-hidden rounded-[12px] border border-[#DFE1E5] bg-white shadow-[0_1px_3px_rgba(0,0,0,0.1),0_1px_2px_-1px_rgba(0,0,0,0.1)]">
      <div className="p-5">
        <div className="space-y-3">
          <div className="flex items-start justify-between gap-4">
            <div>
              <h3 className="font-[var(--font-geist)] text-[16px] font-semibold leading-6 text-[#0F1216]">
                {card.title}
              </h3>
              <p className="font-[var(--font-geist)] text-[14px] leading-5 text-[#474747]">
                {card.subject}
              </p>
            </div>

            <span className={`inline-flex items-center gap-1 rounded-[6px] border px-2 py-[2px] font-[var(--font-geist)] text-[12px] font-medium leading-4 ${card.statusTone}`}>
              <PendingIcon className="h-3 w-3" />
              {card.statusLabel}
            </span>
          </div>

          <div className="flex items-center justify-between">
            <span className="font-[var(--font-geist)] text-[14px] leading-5 text-[#474747]">
              Үнэлгээ
            </span>
            <span className={`font-[var(--font-geist)] text-[14px] font-medium leading-5 ${card.scoreTone}`}>
              {card.scoreLabel}
            </span>
          </div>

          <Link
            className="inline-flex h-9 w-full items-center justify-center gap-2 rounded-[6px] border border-[#DFE1E5] bg-[#FAFAFA] font-[var(--font-geist)] text-[14px] font-medium leading-5 text-[#0F1216] shadow-[0_1px_2px_rgba(0,0,0,0.05)]"
            href={`/student/exams/${card.id}`}
          >
            <ResultIcon className="h-[18px] w-[18px] text-[#0F1216]" />
            Үнэлгээ
          </Link>
        </div>
      </div>
    </article>
  );
}

export function AvailableSectionIcon({ className }: { className?: string }) {
  return <BookOutlineIcon className={className} />;
}

export function CompletedSectionIcon({ className }: { className?: string }) {
  return <CheckCircleOutlineIcon className={className} />;
}
