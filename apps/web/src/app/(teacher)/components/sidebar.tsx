"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { navItems } from "./dashboard-data";
import { SidebarAccountPanel } from "./sidebar-account-panel";

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="flex w-full flex-col border-b border-[#E4E7EC] bg-[#F8FAFF] [background-image:radial-gradient(circle_at_1px_1px,#D8E4FF_1px,transparent_0)] [background-size:20px_20px] lg:min-h-screen lg:w-[256px] lg:min-w-[256px] lg:border-b-0 lg:border-r">
      <div className="flex h-full flex-col px-4 pb-4 pt-7">
        <div className="px-2 pb-8">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-[12px] bg-[linear-gradient(135deg,#7B97FF_0%,#5B7CFF_100%)] text-[12px] font-bold text-white shadow-[0_10px_24px_rgba(91,124,255,0.22)]">
              EF
            </div>
            <span className="text-[18px] font-semibold leading-7 tracking-[-0.02em] text-[#101828]">
              ExamFlow
            </span>
          </div>
        </div>

        <nav className="flex flex-1 flex-col gap-1.5 text-[14px]">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = item.href
              ? pathname === item.href || (item.href !== "/" && pathname.startsWith(`${item.href}/`))
              : false;
            const itemClassName = `flex h-11 w-full items-center gap-3 rounded-xl px-4 py-3 text-left text-[14px] font-medium leading-5 transition ${
              isActive
                ? "bg-[#6F90FF] text-white"
                : "text-[#6B6E72] hover:bg-white/80 hover:text-[#101828]"
            }`;

            if (!item.href || item.disabled) {
              return (
                <div
                  key={item.label}
                  aria-disabled="true"
                  className={itemClassName}
                >
                  <Icon className="h-[18px] w-[18px] shrink-0" />
                  <span>{item.label}</span>
                </div>
              );
            }

            return (
              <Link
                key={item.label}
                href={item.href}
                className={itemClassName}
              >
                <Icon className="h-[18px] w-[18px] shrink-0" />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>

        <div className="pt-6">
          <SidebarAccountPanel />
        </div>
      </div>
    </aside>
  );
}
