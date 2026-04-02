import type { PropsWithChildren } from "react";
import { Sidebar } from "./sidebar";
import {
  TEACHER_CONTENT_INNER_CLASS,
  TEACHER_CONTENT_OUTER_CLASS,
} from "./teacher-ui";

type AppShellProps = PropsWithChildren<{
  contentClassName?: string;
  contentInnerClassName?: string;
  contentOuterClassName?: string;
  fixedHeight?: boolean;
}>;

export function AppShell({
  children,
  contentClassName,
  contentInnerClassName,
  contentOuterClassName,
  fixedHeight,
}: AppShellProps) {
  const heightClasses = fixedHeight ? "lg:h-[900px] lg:w-[1440px] lg:mx-auto lg:overflow-hidden" : "min-h-screen";
  const contentOverflowClass = fixedHeight ? "overflow-hidden scrollbar-hidden" : "overflow-y-auto";
  const contentWrapperClass = fixedHeight ? "overflow-hidden scrollbar-hidden" : "";
  return (
    <main className={`bg-[#FAFAFA] ${heightClasses}`.trim()}>
      <div className={`flex flex-col lg:flex-row ${fixedHeight ? "lg:h-[900px] lg:w-[1440px]" : "min-h-screen"}`.trim()}>
        <Sidebar />
        <section className={`flex-1 ${contentOverflowClass} ${fixedHeight ? "lg:h-[900px] lg:w-[1184px]" : ""}`.trim()}>
          <div
            className={[
              contentOuterClassName ?? TEACHER_CONTENT_OUTER_CLASS,
              contentClassName ?? "lg:px-[36px] lg:py-[32px]",
              contentWrapperClass,
            ].join(" ")}
          >
            <div className={[contentInnerClassName ?? TEACHER_CONTENT_INNER_CLASS, contentWrapperClass].join(" ").trim()}>
              {children}
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}
