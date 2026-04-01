import Link from "next/link";
import type { DashboardRecentResultItem } from "./dashboard/dashboard-types";
import { AutoAwesomeIcon, GroupsIcon, WarningIcon } from "./icons-addition";
import { ArrowRightIcon as LinkArrowIcon } from "./icons-more";

type PendingReviewsWidgetProps = {
  className?: string;
  pendingReviewCount: number;
  reviewItems: DashboardRecentResultItem[];
  searchActive: boolean;
};

export function PendingReviewsWidget({ className = "", pendingReviewCount, reviewItems, searchActive }: PendingReviewsWidgetProps) {
  return (
    <section className={`${className} relative flex h-[364px] w-[662px] flex-col gap-[16px] py-[24px]`}>
      <div className="flex h-[42px] items-center justify-between px-[24px]">
        <h2 className="text-[20px] font-medium leading-[42px] tracking-[0px] text-[#242424] font-[var(--font-inter)] whitespace-nowrap">
          Үнэлгээ хүлээгдэж байгаа шалгалтууд
        </h2>
        <div className="flex h-[31px] w-[39px] items-center justify-center rounded-full bg-[#FFF7E8] text-[16px] font-medium leading-[19px] text-[#6434F8]">
          {pendingReviewCount}
        </div>
      </div>

      <div className="relative flex h-[225px] flex-col gap-[8px] px-[8px]">
        <div className="h-[225px] space-y-[8px] overflow-y-scroll">
          {reviewItems.length ? (
            reviewItems.map((item, index) => (
              <Link
                key={item.id}
                className={`flex h-[66px] w-[646px] items-center gap-[12px] rounded-[16px] p-[16px] ${
                  index === 2 ? "bg-[#FFF7E8]" : "bg-white"
                }`}
                href={item.href}
              >
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <p className="truncate text-[14px] font-medium text-[#131313] font-[var(--font-inter)]">{item.title}</p>
                    {index === 2 ? <WarningIcon className="h-4 w-4" /> : null}
                  </div>
                  <p className="mt-[2px] text-[12px] text-[#454545] font-[var(--font-inter)]">{item.averageScoreLabel}</p>
                </div>
                <div className="flex w-[249px] items-center justify-end gap-[11.13px]">
                  <div className="flex h-[20px] items-center gap-[6px] rounded-full bg-[#FFF7E8] px-[8px] text-[10px] font-medium leading-[12px] text-[#6434F8]">
                    <AutoAwesomeIcon className="h-[12px] w-[12px]" />
                    {item.progressPercent}% автомат
                  </div>
                  <div className="flex h-[24px] items-center gap-[6px] whitespace-nowrap rounded-[2px] bg-[#6434F8] px-[10px] text-[10px] font-semibold leading-[12px] text-white">
                    <GroupsIcon className="h-[12px] w-[12px] translate-y-[2px]" />
                    {item.passCount + item.failCount} гүйцэтгэл үнэлэх
                  </div>
                </div>
              </Link>
            ))
          ) : (
            <p className="rounded-[20px] bg-[#FAF8FF] px-4 py-8 text-center text-[14px] text-[#8B879A]">
              {searchActive ? "Хайлтад тохирох шалгалт олдсонгүй." : "Үнэлгээ хүлээж буй шалгалтын жагсаалт одоогоор байхгүй байна."}
            </p>
          )}
        </div>
        <div className="pointer-events-none absolute bottom-0 left-0 right-0 h-[33px] bg-[linear-gradient(180deg,rgba(255,255,255,0)_0%,#FFFFFF_100%)]" />
      </div>

      <div className="flex h-[17px] items-end px-[24px]">
        <Link className="inline-flex h-[17px] items-center gap-[4px] text-[14px] font-normal leading-[17px] tracking-[-0.3px] text-[#6434F8] font-[var(--font-inter)]" href="/evaluation">
          Дэлгэрэнгүй харах
          <LinkArrowIcon className="h-[6px] w-[10px]" />
        </Link>
      </div>
    </section>
  );
}
