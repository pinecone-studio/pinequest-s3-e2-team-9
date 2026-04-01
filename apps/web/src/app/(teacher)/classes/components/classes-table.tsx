import Link from "next/link";
import type { ComponentType } from "react";
import { ViewIcon } from "../../components/icons-more";

type ClassRow = {
  id: string;
  name: string;
  meta: string;
  studentCountLabel: string;
  completedLabel: string;
  href: string;
};

const getLeadingNumber = (value: string) => value.match(/\d+/)?.[0] ?? "-";

type ClassesTableProps = {
  classes: ClassRow[];
  view?: "grid" | "list";
  searchValue?: string;
  actions?: Array<{
    label: string;
    icon?: ComponentType<{ className?: string }>;
    href?: string;
    onClick?: () => void;
  }>;
  emptyState?: {
    title?: string;
    description?: string;
  };
};

export function ClassesTable({ classes }: ClassesTableProps) {
  return (
    <div className="h-[180.4px] w-[1120px] overflow-hidden rounded-[8px] border border-[#E4E4E7] bg-white [font-family:var(--font-inter)]">
      <table className="w-[1120px] table-fixed border-collapse">
        <thead className="bg-[rgba(244,244,245,0.5)] text-left font-semibold text-[#231D17]">
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
          {classes.map((item) => {
            const [subject] = item.meta.split(" · ");
            return (
              <tr key={item.id} className="h-[65px] border-t border-[#E4E4E7] text-[#231D17]">
                <td className="w-[214px] px-4 py-5 text-[15px] font-semibold leading-[24px]">{item.name}</td>
                <td className="w-[160px] px-4 py-5 text-[13px] leading-[20px]">{subject}</td>
                <td className="w-[126px] px-4 py-5 pl-[18px] text-[12.4px] leading-[20px]">
                  {getLeadingNumber(item.studentCountLabel)}
                </td>
                <td className="w-[100px] px-4 py-5 pr-0 text-[13.2px] font-semibold leading-[20px] text-[#1447E6]">-</td>
                <td className="w-[100px] px-4 py-5 pl-[18px] text-[14px] leading-[20px]">
                  {getLeadingNumber(item.completedLabel)}
                </td>
                <td className="w-[276px] px-4 py-5 pl-[18px] text-[10.9px] leading-[16px] text-[#71717B]">
                  Сүүлд авсан шалгалт: мэдээлэл алга
                </td>
                <td className="w-[142px] px-4 py-4 pr-[26px] text-right">
                  <Link
                    href={item.href}
                    className="inline-flex h-8 w-[142px] items-center justify-center gap-[4px] rounded-[8.4px] text-[12px] font-semibold leading-[20px] text-[#231D17] hover:bg-[#F8F6FF]"
                  >
                    <ViewIcon className="h-[14px] w-[14px] translate-y-[1.5px] text-[#0F1216]" />
                    <span className="w-[76px] text-center">Дэлгэрэнгүй</span>
                  </Link>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
