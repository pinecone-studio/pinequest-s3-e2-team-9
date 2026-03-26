import Link from "next/link";
import { CalendarIcon, CheckCircleIcon } from "../../components/icons";

type ClassCardProps = {
  href: string;
  name: string;
  meta: string;
  studentCountLabel: string;
  upcomingLabel: string;
  completedLabel: string;
};

export function ClassCard({
  href,
  name,
  meta,
  studentCountLabel,
  upcomingLabel,
  completedLabel,
}: ClassCardProps) {
  return (
    <article className="rounded-xl border border-[#DFE1E5] bg-white p-5 shadow-[0px_1px_3px_rgba(0,0,0,0.1),0px_1px_2px_-1px_rgba(0,0,0,0.1)]">
      <div className="flex items-start justify-between gap-4">
        <div className="space-y-1">
          <h2 className="text-[16px] font-medium text-[#0F1216]">{name}</h2>
          <p className="text-[14px] text-[#52555B]">{meta}</p>
        </div>
        <span className="rounded-md bg-[#F2F4F7] px-2 py-1 text-[12px] font-medium text-[#344054]">
          {studentCountLabel}
        </span>
      </div>
      <div className="mt-4 flex flex-wrap gap-x-4 gap-y-2 text-[14px] text-[#52555B]">
        <span className="inline-flex items-center gap-2">
          <CalendarIcon className="h-4 w-4" />
          {upcomingLabel}
        </span>
        <span className="inline-flex items-center gap-2">
          <CheckCircleIcon className="h-4 w-4" />
          {completedLabel}
        </span>
      </div>
      <Link
        href={href}
        className="mt-4 inline-flex h-8 w-full items-center justify-center rounded-md border border-[#DFE1E5] bg-[#FAFAFA] px-3 text-[14px] font-medium text-[#0F1216] shadow-[0px_1px_2px_rgba(0,0,0,0.05)]"
      >
        Ангийг харах
      </Link>
    </article>
  );
}
