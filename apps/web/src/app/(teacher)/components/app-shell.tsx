import type { PropsWithChildren } from "react";
import { Sidebar } from "./sidebar";
import {
  TEACHER_CONTENT_INNER_CLASS,
  TEACHER_CONTENT_OUTER_CLASS,
} from "./teacher-ui";

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
              TEACHER_CONTENT_OUTER_CLASS,
              contentClassName ?? "lg:px-[32px] lg:py-[32px]",
            ].join(" ")}
          >
            <div className={TEACHER_CONTENT_INNER_CLASS}>{children}</div>
          </div>
        </section>
      </div>
    </main>
  );
}
