"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { navItems } from "./dashboard-data";
import { SidebarAccountPanel } from "./sidebar-account-panel";

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="w-full bg-[#FAFAFA] lg:h-[900px] lg:w-[256px] lg:min-w-[256px]">
      <div className="flex h-full flex-col pb-0 pt-[20px]">
        <div className="flex h-[64px] items-center justify-center px-5">
          <div className="flex h-[56px] w-[89px] flex-col items-center justify-center">
            <div className="relative flex h-7 w-11 items-center justify-center">
              <div className="absolute h-7 w-7 rotate-45 rounded-[8px] bg-[linear-gradient(135deg,#8A63FF_0%,#6434F8_100%)]" />
              <span className="relative text-[11px] font-bold text-white">EF</span>
            </div>
            <span className="mt-1 text-[18px] font-semibold leading-[28px] text-[#0F1216] font-[var(--font-geist)]">
              ExamFlow
            </span>
          </div>
        </div>

        <nav className="flex h-[732px] flex-1 flex-col gap-1 px-4 pb-4 pt-[28px] text-[14px]">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = item.href
              ? pathname === item.href || (item.href !== "/" && pathname.startsWith(`${item.href}/`))
              : false;
            const itemClassName = `flex h-[44px] w-full items-center gap-3 rounded-[12px] px-4 py-3 text-left text-[14px] font-medium leading-5 font-[var(--font-geist)] transition ${
              isActive
                ? "bg-[#6434F8] text-[#F6F9FC]"
                : "text-[#6B6E72] hover:bg-white hover:text-[#17151F]"
            }`;
            const iconClassName = "h-[18px] w-[18px] shrink-0 text-current";

            if (!item.href || item.disabled) {
              return (
                <div
                  key={item.label}
                  aria-disabled="true"
                  className={itemClassName}
                >
                  <Icon className={iconClassName} />
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
                <Icon className={iconClassName} />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>

        <div className="mt-auto">
          <SidebarAccountPanel />
        </div>
      </div>
    </aside>
  );
}
