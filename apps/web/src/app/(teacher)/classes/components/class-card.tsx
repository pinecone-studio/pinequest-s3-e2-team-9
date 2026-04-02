import Link from "next/link";
import {
  CalendarIcon,
  PeopleIcon,
  SchoolIcon,
} from "../../components/icons-more";
import { EyeIconn } from "../../components/icons-addition";

type ClassCardProps = {
  href: string;
  name: string;
  subject: string;
  grade: number;
  studentCountLabel: string;
  assignedExamCountLabel: string;
  averageScoreLabel: string;
  lastExamLabel: string;
};

export function ClassCard({
  href,
  name,
  subject,
  grade,
  studentCountLabel,
  assignedExamCountLabel,
  averageScoreLabel,
  lastExamLabel,
}: ClassCardProps) {
  const normalizedStudentCountLabel = studentCountLabel.replace("сурагч", "Сурагч");

  return (
    <article className="box-border flex h-[233.6px] w-[268px] flex-none flex-col items-start gap-[10px] rounded-[6px] border border-[#E4E4E4] bg-white px-[16px] py-[20px] shadow-[0px_3.22191px_4.83286px_rgba(0,0,0,0.09)]">
      <div className="flex h-[193.6px] w-[236px] flex-col items-start gap-[16px] self-stretch">
        <div className="flex h-[21.6px] w-[236px] items-start justify-between self-stretch">
          <span className="inline-flex h-[21.6px] items-center justify-center rounded-[8.4px] border border-[#E4E4E7] px-[7.8px] py-[1.8px] text-center text-[11.1px] font-semibold leading-[16px] text-[#231D17]">
            {subject}
          </span>
          <span className="text-[11.3px] font-normal leading-[16px] text-[#71717B]">
            {grade}-р анги
          </span>
        </div>

        <div className="flex h-[77px] w-[236px] flex-col items-start gap-[24px] self-stretch">
          <h2 className="w-[236px] text-[18px] font-bold leading-[22px] text-[#211C37]">
            {name}
          </h2>
          <div className="relative h-[36px] w-[236px]">
            <div className="absolute left-0 top-0 flex h-[12px] items-center gap-1 text-[10px] font-normal leading-[13px] text-[#1C1D1D]">
              <PeopleIcon className="h-3 w-3 shrink-0" />
              <span>{normalizedStudentCountLabel}</span>
            </div>
            <div className="absolute left-[122px] top-0 flex h-[12px] items-center gap-1 text-[10px] font-normal leading-[13px] text-[#1C1D1D]">
              <SchoolIcon className="h-3 w-3 shrink-0" />
              <span>{averageScoreLabel}</span>
            </div>
            <div className="absolute left-0 top-[24px] flex h-[12px] items-center gap-1 text-[10px] font-normal leading-[13px] text-[#1C1D1D]">
              <CalendarIcon className="h-3 w-3 shrink-0" />
              <span>{assignedExamCountLabel}</span>
            </div>
          </div>
        </div>

        <div className="h-0 w-[236px] border-t border-[#E4E4E4]" />

        <p className="text-[10px] font-normal leading-[12px] text-[#71717B]">
          {lastExamLabel}
        </p>

        <Link
          href={href}
          className="mt-auto inline-flex h-6 w-[236px] items-center justify-center gap-1 self-stretch rounded-[4px] bg-[#6434F8] px-3 py-[6px] text-[10px] font-semibold leading-[12px] text-white transition hover:bg-[#5A2EF0]"
        >
          <span className="flex h-3 w-3 items-center justify-center">
            <EyeIconn className="block h-3 w-3 shrink-0 translate-y-[1px] text-white" />
          </span>
          <span className="flex h-3 items-center">Дэлгэрэнгүй харах</span>
        </Link>
      </div>
    </article>
  );
}
