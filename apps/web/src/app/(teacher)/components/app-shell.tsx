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
    <main className="min-h-screen bg-[#F6F9FC] [background-image:radial-gradient(circle_at_1px_1px,#D8E4FF_1px,transparent_0)] [background-size:20px_20px]">
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
