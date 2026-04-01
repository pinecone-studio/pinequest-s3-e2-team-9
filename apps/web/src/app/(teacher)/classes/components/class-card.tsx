import Link from "next/link";
import { CalendarMiniIcon, PeopleAltIcon } from "../../components/icons-extra";
import { SchoolHatIcon, ViewMoreEyeIcon } from "../../components/icons-ic";

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
  upcomingLabel: _upcomingLabel,
  completedLabel,
}: ClassCardProps) {
  const [subject = "", grade = ""] = meta.split(" · ");
  const completedCount = completedLabel.split(" ")[0] ?? completedLabel;
  const averageLabel = "72% Дундаж дүн";

  return (
    <article className="flex h-[233.6px] w-[268px] flex-col gap-[10px] rounded-[6px] border border-[#E4E4E4] bg-white p-[20px_16px] shadow-[0px_3.22191px_4.83286px_rgba(0,0,0,0.09)]">
      <div className="flex flex-1 flex-col gap-[16px]">
        <div className="flex h-[21.6px] items-start justify-between">
          <span className="inline-flex h-[21.6px] items-center justify-center rounded-[8.4px] border border-[#E4E4E7] px-[7.8px] text-[11.1px] font-semibold leading-4 text-[#231D17]">
            {subject}
          </span>
          <span className="text-[11.3px] leading-4 text-[#71717B]">{grade}</span>
        </div>

        <div className="flex flex-col gap-[24px]">
          <h2 className="text-[18px] font-bold leading-[22px] text-[#211C37]">
            {name}
          </h2>
          <div className="relative h-[36px] text-[10px] leading-[13px] text-[#1C1D1D]">
            <div className="absolute left-0 top-0 flex items-center gap-1">
              <PeopleAltIcon className="h-[12px] w-[12px]" />
              <span>{studentCountLabel}</span>
            </div>
            <div className="absolute right-0 top-0 flex items-center gap-1">
              <SchoolHatIcon className="h-[12px] w-[12px] text-[#1C1D1D]" />
              <span>{averageLabel}</span>
            </div>
            <div className="absolute left-0 top-[24px] flex items-center gap-1">
              <CalendarMiniIcon className="h-[12px] w-[12px]" />
              <span>{completedCount} Нийт авсан шалгалт</span>
            </div>
          </div>
        </div>

        <div className="h-px w-full bg-[#E4E4E4]" />
        <p className="text-[10px] leading-[12px] text-[#71717B]">
          Сүүлд авсан шалгалт: 12 өдрийн өмнө
        </p>
      </div>

      <Link
        href={href}
        className="inline-flex h-[24px] w-full items-center justify-center gap-[4px] rounded-[4px] bg-[#6434F8] px-[12px] py-[6px] text-[10px] font-semibold leading-[12px] text-white"
      >
        <ViewMoreEyeIcon className="h-[12px] w-[12px] text-white" />
        Дэлгэрэнгүй харах
      </Link>
    </article>
  );
}
