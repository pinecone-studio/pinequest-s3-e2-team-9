import type { PropsWithChildren } from "react";
import { Sidebar } from "./sidebar";
import { TopBar } from "./top-bar";

type AppShellProps = PropsWithChildren<{
  contentClassName?: string;
}>;

export function AppShell({ children, contentClassName }: AppShellProps) {
  const contentPadding = contentClassName
    ? `px-6 py-6 ${contentClassName}`
    : "px-6 py-6";
  return (
    <main className="min-h-screen bg-[#F6F9FC]">
      <div className="flex min-h-screen flex-col overflow-hidden lg:h-screen lg:flex-row">
        <Sidebar />
        <section className="flex-1 overflow-y-auto">
          <div className="flex min-h-screen flex-col">
            <TopBar />
            <div className="flex-1 bg-[#F6F9FC] bg-[radial-gradient(#E2E8F0_1px,transparent_0)] [background-size:18px_18px]">
              <div className={`mx-auto w-full max-w-[1184px] ${contentPadding}`}>
                {children}
              </div>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}
