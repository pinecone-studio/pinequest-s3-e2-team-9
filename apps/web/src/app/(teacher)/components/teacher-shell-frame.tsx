"use client";

import type { PropsWithChildren } from "react";
import { usePathname } from "next/navigation";
import { AppShell } from "./app-shell";

const isQuestionBankRoute = (pathname: string) =>
  pathname === "/question-bank" || pathname.startsWith("/question-bank/");

const isClassesListRoute = (pathname: string) => pathname === "/classes";

const isMyExamsRoute = (pathname: string) => pathname === "/my-exams";

const isCreateExamRoute = (pathname: string) => pathname === "/create-exam";

export function TeacherShellFrame({ children }: PropsWithChildren) {
  const pathname = usePathname();

  if (isMyExamsRoute(pathname) || isClassesListRoute(pathname)) {
    return (
      <AppShell contentClassName="!px-0 !py-0 sm:!px-0 sm:!py-0 lg:!px-0 lg:!py-0">
        {children}
      </AppShell>
    );
  }

  if (isQuestionBankRoute(pathname)) {
    return <AppShell contentClassName="lg:px-[60px] lg:py-[54px]">{children}</AppShell>;
  }

  if (isCreateExamRoute(pathname)) {
    return (
      <AppShell contentClassName="px-6 pb-10 pt-6 sm:px-7 lg:px-8 lg:pb-12 lg:pt-8">
        {children}
      </AppShell>
    );
  }

  if (pathname === "/") {
    return (
      <AppShell
        contentClassName="px-0 py-0"
        contentInnerClassName="w-[1184px]"
        contentOuterClassName="w-full"
      >
        {children}
      </AppShell>
    );
  }

  return <AppShell>{children}</AppShell>;
}
