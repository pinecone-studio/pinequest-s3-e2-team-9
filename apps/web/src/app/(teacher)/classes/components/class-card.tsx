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
    <article className="flex min-h-[214px] w-full flex-col gap-4 rounded-[18px] border border-[#E7E8EC] bg-white p-3 shadow-[0px_10px_30px_rgba(15,23,42,0.08)] transition hover:-translate-y-0.5 hover:shadow-[0px_14px_36px_rgba(15,23,42,0.12)]">
      <div className="flex w-full flex-col items-start gap-2 rounded-[16px] bg-[linear-gradient(135deg,#5B7CFA_0%,#86A5FF_100%)] px-4 py-5">
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
      <div className="grid grid-cols-2 gap-3">
        <div className="rounded-[14px] bg-[#F4F7FF] px-4 py-3">
          <p className="text-[12px] font-medium text-[#5E6470]">Удахгүй</p>
          <p className="mt-1 text-[15px] font-semibold text-[#101828]">{upcomingLabel}</p>
        </div>
        <div className="rounded-[14px] bg-[#F7F6FF] px-4 py-3">
          <p className="text-[12px] font-medium text-[#5E6470]">Дууссан</p>
          <p className="mt-1 text-[15px] font-semibold text-[#101828]">{completedLabel}</p>
        </div>
      </div>
      <Link
        href={href}
        className="mt-auto inline-flex h-10 w-full items-center justify-center rounded-[12px] border border-[#D8DCE6] bg-white text-[13px] font-semibold leading-5 text-[#252B37] transition hover:border-[#CFC5FF] hover:bg-[#F8F6FF]"
      >
        Ангийг харах
      </Link>
    </article>
  );
}
