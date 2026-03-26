"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { navItems } from "./dashboard-data";
import { SidebarAccountPanel } from "./sidebar-account-panel";

export function Sidebar() {
  const pathname = usePathname();
  return (
    <aside className="flex w-full flex-col border-b border-[#E4E7EC] bg-[#F8FAFF] [background-image:radial-gradient(circle_at_1px_1px,#D8E4FF_1px,transparent_0)] [background-size:20px_20px] lg:w-[300px] lg:border-b-0 lg:border-r">
      <div className="px-7 pb-6 pt-10">
        <div className="flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-[16px] bg-[linear-gradient(135deg,#7B97FF_0%,#4F6DFF_100%)] text-[16px] font-bold text-white shadow-[0_14px_30px_rgba(91,124,255,0.28)]">
            EF
          </div>
          <span className="text-[24px] font-bold tracking-[-0.03em] text-[#101828]">
            ExamFlow
          </span>
        </div>
      </div>

      <nav className="flex-1 space-y-2 px-6 text-[14px]">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive =
            pathname === item.href ||
            (item.href !== "/" && pathname.startsWith(`${item.href}/`));
          return (
            <Link
              key={item.label}
              href={item.href}
              className={`flex min-h-[60px] w-full items-center gap-4 rounded-[20px] px-5 text-left transition ${
                isActive
                  ? "bg-[linear-gradient(135deg,#7895FF_0%,#5B7CFF_100%)] text-white shadow-[0_16px_32px_rgba(91,124,255,0.24)]"
                  : "text-[#667085] hover:bg-white/80 hover:text-[#101828]"
              }`}
            >
              <Icon
                className={`h-5 w-5 ${
                  isActive ? "text-white" : "text-[#667085]"
                }`}
              />
              <span className="text-[16px] font-medium">{item.label}</span>
            </Link>
          );
        })}
      </nav>

      <div className="px-6 pb-8 pt-6">
        <SidebarAccountPanel />
      </div>
    </aside>
  );
}
