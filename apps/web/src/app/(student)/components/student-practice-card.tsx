import Link from "next/link";
import type { StudentPracticeExamCard } from "./student-portal-types";

type StudentPracticeCardProps = {
  exam: StudentPracticeExamCard;
};

const levelTone = {
  easy: "from-[#D1FAE5] to-[#ECFDF3] text-[#047857]",
  hard: "from-[#FECACA] to-[#FFF1F2] text-[#BE123C]",
  medium: "from-[#DBEAFE] to-[#EEF4FF] text-[#1D4ED8]",
};

export function StudentPracticeCard({ exam }: StudentPracticeCardProps) {
  return (
    <article className="overflow-hidden rounded-[26px] border border-[#E4E7EC] bg-white shadow-[0_18px_44px_rgba(15,23,42,0.08)]">
      <div className={`bg-gradient-to-br p-5 ${levelTone[exam.level]}`}>
        <div className="flex items-start justify-between gap-3">
          <span className="rounded-full bg-white/80 px-3 py-1 text-[12px] font-semibold">{exam.levelLabel}</span>
          <span className="text-[13px] font-semibold">{exam.xpLabel}</span>
        </div>
        <h3 className="mt-5 text-[22px] font-semibold tracking-[-0.03em]">{exam.title}</h3>
        <p className="mt-2 text-[14px]">{exam.subject}</p>
      </div>

      <div className="space-y-4 p-5">
        <div className="flex flex-wrap gap-2 text-[13px] text-[#475467]">
          <span className="rounded-full bg-[#F2F4F7] px-3 py-1">{exam.questionCountLabel}</span>
          <span className="rounded-full bg-[#F2F4F7] px-3 py-1">{exam.durationLabel}</span>
          <span className="rounded-full bg-[#F2F4F7] px-3 py-1">{exam.attemptLabel}</span>
        </div>
        <p className="text-[14px] leading-6 text-[#667085]">{exam.progressLabel}</p>
        <div className="flex gap-3">
          <Link
            className="inline-flex h-11 flex-1 items-center justify-center rounded-[16px] bg-[#101828] text-[14px] font-semibold text-white transition hover:bg-[#1F2937]"
            href={exam.href}
          >
            {exam.ctaLabel}
          </Link>
          {exam.hasResult && exam.resultHref ? (
            <Link
              className="inline-flex h-11 items-center justify-center rounded-[16px] border border-[#D0D5DD] bg-white px-5 text-[14px] font-semibold text-[#344054] transition hover:bg-[#F9FAFB]"
              href={exam.resultHref}
            >
              Үр дүн
            </Link>
          ) : null}
        </div>
      </div>
    </article>
  );
}
