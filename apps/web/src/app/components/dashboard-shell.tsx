import type { ReactNode } from "react";
import { DashboardContent } from "./dashboard-content";
import { Sidebar } from "./sidebar";

type DashboardShellProps = {
  banner?: ReactNode;
};

export function DashboardShell({ banner }: DashboardShellProps) {
  return (
    <main className="min-h-screen bg-[#FAFAFA]">
      <div className="flex min-h-screen flex-col overflow-hidden lg:h-screen lg:flex-row">
        <Sidebar />
        <section className="flex-1 overflow-y-auto">
          <div className="w-full px-5 py-8 sm:px-8 sm:py-10 lg:px-[60px] lg:py-[54px]">
            {banner ? <div className="mb-6">{banner}</div> : null}
            <DashboardContent />
          </div>
        </section>
      </div>
    </main>
  );
}
