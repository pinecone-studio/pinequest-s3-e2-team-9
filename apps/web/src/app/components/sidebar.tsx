"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { navItems } from "./dashboard-data";
import { SidebarAccountPanel } from "./sidebar-account-panel";

export function Sidebar() {
  const pathname = usePathname();
  return (
    <aside className="flex w-full flex-col border-b border-[#E4E7EC] bg-[#F6F9FC] lg:w-64 lg:border-b-0 lg:border-r">
      <div className="flex h-16 items-center gap-3 px-5">
        <div className="flex h-7 w-7 items-center justify-center rounded-full bg-[#6F90FF] text-[10px] font-semibold text-white">
          EF
        </div>
        <span className="text-[16px] font-semibold text-[#0F1216]">
          ExamFlow
        </span>
      </div>
      <nav className="flex-1 space-y-1 px-4 pb-4 pt-7 text-[14px]">
        {navItems.map((item) => {
          const isActive =
            pathname === item.href ||
            (item.href !== "/" && pathname.startsWith(`${item.href}/`));
          return (
            <Link
              key={item.label}
              href={item.href}
              className={`flex w-full items-center gap-3 rounded-xl px-4 py-2 text-left font-medium transition ${
                isActive
                  ? "bg-[#6F90FF] text-white shadow-[0px_1px_2px_rgba(0,0,0,0.05)]"
                  : "text-[#6B6E72] hover:bg-white/70"
              }`}
            >
              <img
                alt=""
                aria-hidden="true"
                src={item.iconSrc}
                className={`h-[18px] w-[18px] ${
                  isActive
                    ? "brightness-0 invert"
                    : "opacity-80 filter grayscale"
                }`}
              />
              <span className="font-medium">{item.label}</span>
            </Link>
          );
        })}
      </nav>
      <div className="px-4 pb-4">
        <SidebarAccountPanel />
      </div>
    </aside>
  );
}
