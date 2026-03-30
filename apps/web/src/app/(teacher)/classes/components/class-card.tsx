import Link from "next/link";
import CastForEducationIcon from "../../components/icons/CastForEducationIcon";
import { ClassManagementIcon } from "../../components/icons";

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
    <article className="flex h-[182px] w-[352px] flex-col items-center gap-3 rounded-[16px] border border-[#F1F2F3] bg-white p-[10px] pb-4 shadow-[0px_4px_8px_-2px_rgba(0,0,0,0.1),0px_2px_4px_-2px_rgba(0,0,0,0.06)]">
      <div className="flex w-full flex-col items-start gap-2 rounded-[16px] rounded-b-[4px] bg-[#6F90FF] px-[14px] py-[18px]">
        <h2 className="text-[18px] font-bold leading-5 text-white">{name}</h2>
        <div className="flex items-center gap-1.5 text-[14px] leading-4 text-[#F5F5F5]">
          <CastForEducationIcon className="h-4 w-4" />
          <span>{meta}</span>
        </div>
        <div className="flex items-center gap-1.5 text-[14px] leading-4 text-[#F5F5F5]">
          <ClassManagementIcon className="h-4 w-4" />
          <span>{studentCountLabel}</span>
        </div>
      </div>
      <Link
        href={href}
        className="inline-flex h-9 w-full items-center justify-center rounded-[8px] border border-[#52555B] bg-white text-[12px] font-semibold leading-5 text-[#52555B]"
      >
        Ангийг харах
      </Link>
      <span className="sr-only">{upcomingLabel}</span>
      <span className="sr-only">{completedLabel}</span>
    </article>
  );
}
