import Link from "next/link";
import { ViewIcon } from "../../components/icons-more";
import type { ClassListItemView } from "../classes-view-model";
import { ClassCard } from "./class-card";

type ClassesTableProps = {
  classes: ClassListItemView[];
  view?: "grid" | "list";
};

export function ClassesTable({ classes, view = "grid" }: ClassesTableProps) {
  if (view === "grid") {
    return (
      <div className="flex w-[1120px] flex-row flex-wrap content-start items-start gap-4">
        {classes.map((item) => (
          <ClassCard key={item.id} {...item} />
        ))}
      </div>
    );
  }

  return (
    <div className="h-[180.4px] w-[1120px] max-w-full flex-none self-stretch overflow-hidden rounded-[8px] border border-[#E4E4E7] bg-white [font-family:var(--font-inter)]">
      <div className="h-full overflow-hidden">
        <table className="w-[1120px] table-fixed border-collapse">
          <thead className="bg-[rgba(244,244,245,0.5)] text-left font-semibold text-[#000000]">
            <tr className="h-[52px]">
              <th className="w-[216px] px-4 py-4 text-[12.8px] leading-[20px]">Ангийн нэр</th>
              <th className="w-[160px] px-4 py-4 text-[12.7px] leading-[20px]">Хичээл</th>
              <th className="w-[126px] px-4 py-4 text-[12.7px] leading-[20px]">Сурагчид</th>
              <th className="w-[100px] px-4 py-4 pr-0 text-[13px] leading-[20px]">Дундаж дүн</th>
              <th className="w-[100px] px-4 py-4 text-[12.6px] leading-[20px]">Шалгалтууд</th>
              <th className="w-[274px] px-4 py-4 text-[12.7px] leading-[20px]">Сүүлд хийсэн үйлдэл</th>
              <th className="w-[142px] px-4 py-4 pr-[26px] text-right text-[13.1px] leading-[20px]">Үйлдэл</th>
            </tr>
          </thead>
          <tbody>
            {classes.map((item) => (
              <tr key={item.id} className="h-[65px] border-t border-[#E4E4E7] text-[#000000]">
                <td className="w-[214px] px-4 py-5 text-[15px] font-semibold leading-[24px]">
                  {item.name}
                </td>
                <td className="w-[160px] px-4 py-5 text-[13px] leading-[20px]">
                  {item.subject}
                </td>
                <td className="w-[126px] px-4 py-5 pl-[18px] text-[12.4px] leading-[20px]">
                  {item.studentCountValue}
                </td>
                <td className="w-[100px] px-4 py-5 pr-0 text-[13.2px] font-semibold leading-[20px] text-[#6434F8]">
                  {item.averageScoreValue}
                </td>
                <td className="w-[100px] px-4 py-5 pl-[18px] text-[14px] leading-[20px]">
                  {item.assignedExamCountValue}
                </td>
                <td className="w-[276px] px-4 py-5 pl-[18px] text-[10.9px] leading-[16px] text-[#71717B]">
                  {item.lastExamLabel}
                </td>
                <td className="w-[142px] px-4 py-4 pr-[34px] text-right">
                  <Link
                    href={item.href}
                    className="inline-flex h-8 w-[118px] items-center justify-center gap-[4px] rounded-[8.4px] px-[12px] text-[12px] font-semibold leading-[20px] text-[#000000] transition hover:bg-[#F8F6FF]"
                  >
                    <ViewIcon className="h-[14px] w-[14px] translate-y-[1px] text-[#000000]" />
                    <span className="text-center">Дэлгэрэнгүй</span>
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
