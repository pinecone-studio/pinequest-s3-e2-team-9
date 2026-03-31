"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { navItems } from "./dashboard-data";
import { SidebarAccountPanel } from "./sidebar-account-panel";

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="flex w-full flex-col bg-[#F6F9FC] [background-image:radial-gradient(circle_at_1px_1px,#D8E4FF_1px,transparent_0)] [background-size:20px_20px] lg:min-h-screen lg:w-[256px] lg:min-w-[256px]">
      <div className="flex h-full flex-1 flex-col pt-[20px]">
        <div className="flex h-[64px] items-center px-[20px]">
          <div className="flex h-[56px] items-center gap-3">
            <div className="flex h-7 w-[44px] items-center justify-center rounded-md bg-[#6F90FF]/20 text-[12px] font-bold text-[#6F90FF]">
              EF
            </div>
            <span className="text-[18px] font-semibold leading-7 text-[#0F1216]">
              ExamFlow
            </span>
          </div>
        </div>

        <nav className="flex flex-1 flex-col gap-[4px] px-[16px] pb-[16px] pt-[28px] text-[14px]">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = item.href
              ? pathname === item.href || (item.href !== "/" && pathname.startsWith(`${item.href}/`))
              : false;
            const itemClassName = `flex h-[44px] w-[224px] items-center gap-3 rounded-[12px] px-4 py-3 text-left text-[14px] font-medium leading-5 transition ${
              isActive
                ? "bg-[#6F90FF] text-white"
                : "text-[#6B6E72] hover:bg-white/80 hover:text-[#0F1216]"
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

        <div className="mt-auto px-4 pb-4 pt-4">
          <SidebarAccountPanel />
        </div>
      </div>
    </aside>
  );
}
