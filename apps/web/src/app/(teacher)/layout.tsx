import type { PropsWithChildren } from "react";
import { RoleGuard } from "@/components/role-guard";
import { TeacherShellFrame } from "./components/teacher-shell-frame";

export default function TeacherLayout({ children }: PropsWithChildren) {
  return (
    <RoleGuard allowedRoles={["TEACHER"]}>
      <TeacherShellFrame>{children}</TeacherShellFrame>
    </RoleGuard>
  );
}
