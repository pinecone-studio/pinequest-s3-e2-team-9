import type { PropsWithChildren } from "react";
import { StudentSidebar } from "./student-sidebar";

type StudentShellProps = PropsWithChildren<{
  contentClassName?: string;
}>;

export function StudentShell({
  children,
  contentClassName,
}: StudentShellProps) {
  return (
    <main className="min-h-screen bg-[#F8FAFF]">
      <div className="flex min-h-screen flex-col lg:flex-row">
        <StudentSidebar />
        <section className="flex-1">
          <div
            className={[
              "min-h-full px-5 py-6 sm:px-8 sm:py-8 lg:px-10 lg:py-10",
              contentClassName ?? "",
            ].join(" ")}
          >
            {children}
          </div>
        </section>
      </div>
    </main>
  );
}
