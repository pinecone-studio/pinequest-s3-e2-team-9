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
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {classes.map((item) => (
          <ClassCard key={item.id} {...item} />
        ))}
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-[16px] border border-[#E4E4E7] bg-white shadow-[0px_10px_30px_rgba(15,23,42,0.06)]">
      <div className="overflow-x-auto">
        <table className="min-w-full table-fixed border-collapse">
          <thead className="bg-[rgba(244,244,245,0.8)] text-left font-semibold text-[#231D17]">
            <tr className="h-[52px]">
              <th className="w-[240px] px-4 py-4 text-[12.8px] leading-[20px]">Ангийн нэр</th>
              <th className="w-[170px] px-4 py-4 text-[12.7px] leading-[20px]">Хичээл</th>
              <th className="w-[132px] px-4 py-4 text-[12.7px] leading-[20px]">Сурагчид</th>
              <th className="w-[172px] px-4 py-4 text-[12.7px] leading-[20px]">Удахгүй</th>
              <th className="w-[172px] px-4 py-4 text-[12.7px] leading-[20px]">Дууссан</th>
              <th className="w-[150px] px-4 py-4 pr-[26px] text-right text-[13.1px] leading-[20px]">Үйлдэл</th>
            </tr>
          </thead>
          <tbody>
            {classes.map((item) => (
              <tr key={item.id} className="border-t border-[#E4E4E7] text-[#231D17]">
                <td className="px-4 py-4">
                  <div className="text-[15px] font-semibold leading-[24px]">{item.name}</div>
                  <div className="mt-1 text-[12px] leading-[18px] text-[#71717B]">
                    {item.meta}
                  </div>
                </td>
                <td className="px-4 py-4 text-[13px] leading-[20px]">{item.subject}</td>
                <td className="px-4 py-4 text-[13px] leading-[20px]">{item.studentCountLabel}</td>
                <td className="px-4 py-4 text-[13px] leading-[20px]">{item.upcomingLabel}</td>
                <td className="px-4 py-4 text-[13px] leading-[20px]">{item.completedLabel}</td>
                <td className="px-4 py-4 pr-[26px] text-right">
                  <Link
                    href={item.href}
                    className="inline-flex h-9 items-center justify-center gap-[6px] rounded-[10px] border border-[#D8DCE6] px-4 text-[12px] font-semibold leading-[20px] text-[#231D17] transition hover:border-[#CFC5FF] hover:bg-[#F8F6FF]"
                  >
                    <ViewIcon className="h-[14px] w-[14px] translate-y-[1px] text-[#0F1216]" />
                    <span>Дэлгэрэнгүй</span>
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
