import type { PropsWithChildren } from "react";
import { Sidebar } from "./sidebar";

type AppShellProps = PropsWithChildren<{
  contentClassName?: string;
}>;

export function AppShell({ children, contentClassName }: AppShellProps) {
  return (
    <main className="min-h-screen bg-[#FAFAFA]">
      <div className="flex min-h-screen flex-col overflow-hidden lg:h-screen lg:flex-row">
        <Sidebar />
        <section className="flex-1 overflow-y-auto">
          <div
            className={[
              "w-full px-5 py-8 sm:px-8 sm:py-10",
              contentClassName ?? "lg:px-[32px] lg:py-[32px]",
            ].join(" ")}
          >
            {children}
          </div>
        </section>
      </div>
    </main>
  );
}
