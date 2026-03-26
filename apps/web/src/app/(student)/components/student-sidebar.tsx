"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import type { SVGProps } from "react";
import { StudentSidebarProfile } from "./student-sidebar-profile";
import { studentNavItems } from "./student-nav-data";

const SvgComponent: React.FC<SVGProps<SVGSVGElement>> = (props) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width={44}
    height={28}
    fill="none"
    {...props}
  >
    <path
      fill="#6F90FF"
      d="M34.17 24.825A3.165 3.165 0 0 1 31.012 28H12.986a3.165 3.165 0 0 1-3.156-3.175v-8.29l11.246 4.802c.59.253 1.258.253 1.848 0l11.245-4.801v8.29ZM21.074.19a2.354 2.354 0 0 1 1.85 0l19.633 8.383c1.923.82 1.923 3.562 0 4.383l-8.389 3.58c0-4.918-3.963-8.906-8.853-8.906h-6.633c-4.89 0-8.853 3.988-8.853 8.907l-8.388-3.581c-1.923-.821-1.923-3.562 0-4.383L21.076.189Z"
    />
    <path
      fill="#6F90FF"
      d="M18.775 18A2.775 2.775 0 0 1 16 15.225v-2.492A2.733 2.733 0 0 1 18.733 10h1.849a.885.885 0 1 1 0 1.769h-1.875a.67.67 0 0 0 0 1.34h1.756a.879.879 0 1 1 0 1.759h-1.745a.682.682 0 1 0 0 1.363h1.947a.884.884 0 1 1 0 1.769h-1.89ZM23.625 18a1.018 1.018 0 0 1-1.018-1.018v-4.285A2.697 2.697 0 0 1 25.303 10h1.813a.884.884 0 1 1 0 1.769h-2.833a.36.36 0 1 1 .36-.36v2.101a.299.299 0 1 1-.298-.299h2.59a.879.879 0 1 1 0 1.758h-2.59a.299.299 0 1 1 .298-.299v2.312c0 .562-.456 1.018-1.018 1.018Z"
    />
  </svg>
);

function ExamFlowMark() {
  return (
    <SvgComponent aria-hidden="true" className="h-7 w-11" />
  );
}

export function StudentSidebar() {
  const pathname = usePathname();

  return (
    <aside className="flex w-full flex-col border-b border-[#E9EDF5] bg-[#F8FAFF] [background-image:radial-gradient(circle_at_1px_1px,#DCE6FF_1px,transparent_0)] [background-size:12px_12px] lg:sticky lg:top-0 lg:h-screen lg:w-[256px] lg:min-w-[256px] lg:flex-shrink-0 lg:border-b-0 lg:border-r">
      <div className="flex h-16 items-center justify-center px-5 pt-5">
        <Link
          className="flex h-14 flex-col items-center justify-center"
          href="/student"
        >
          <ExamFlowMark />
          <span className="text-[18px] font-semibold leading-7 text-[#0F1216]">
            ExamFlow
          </span>
        </Link>
      </div>

      <nav className="flex flex-1 flex-col gap-1 px-4 pb-4 pt-7 lg:min-h-0">
        {studentNavItems.map((item) => {
          const Icon = item.icon;
          const isActive = item.exact
            ? pathname === item.href
            : pathname === item.href || pathname.startsWith(`${item.href}/`);

          return (
            <Link
              key={item.label}
              href={item.href}
              className={`flex h-11 items-center gap-3 rounded-[12px] px-4 transition ${
                isActive
                  ? "bg-[#6F90FF] text-[#F6F9FC] shadow-[0_12px_24px_rgba(111,144,255,0.24)]"
                  : "text-[#6B6E72] hover:bg-white/80"
              }`}
            >
              <Icon className="h-[18px] w-[18px]" />
              <span className="text-[14px] font-medium leading-5">{item.label}</span>
            </Link>
          );
        })}
      </nav>

      <div className="mt-auto p-4">
        <div className="border-t border-[#E9EDF5] bg-[#F8FAFF] pt-4">
          <StudentSidebarProfile />
        </div>
      </div>
    </aside>
  );
}
