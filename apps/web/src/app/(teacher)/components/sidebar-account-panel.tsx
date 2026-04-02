"use client";

import { useUser } from "@clerk/nextjs";
import { AuthSignOutButton } from "@/components/auth-sign-out-button";
import { ArrowLeftIcon } from "./icons";

const getDisplayName = ({
  firstName,
  lastName,
  primaryEmail,
}: {
  firstName: string | null | undefined;
  lastName: string | null | undefined;
  primaryEmail: string;
}) => {
  const fullName = [firstName, lastName].filter(Boolean).join(" ");
  return fullName || primaryEmail.split("@")[0] || "Teacher";
};

const getInitials = ({
  displayName,
  firstName,
  lastName,
}: {
  displayName: string;
  firstName: string | null | undefined;
  lastName: string | null | undefined;
}) => {
  const parts = [firstName, lastName].filter(Boolean);

  if (parts.length > 0) {
    return parts
      .map((part) => part?.[0] ?? "")
      .join("")
      .slice(0, 2)
      .toUpperCase();
  }

  return displayName.slice(0, 2).toUpperCase();
};

const getSecondaryLabel = (publicMetadata: Record<string, unknown>) => {
  const subject =
    publicMetadata.subject ??
    publicMetadata.subjectName ??
    publicMetadata.teacherSubject ??
    publicMetadata.department;

  if (typeof subject === "string") {
    const trimmed = subject.trim();
    if (trimmed.length > 0) {
      return trimmed.includes("багш") ? trimmed : `${trimmed} багш`;
    }
  }

  return "Багш";
};

export function SidebarAccountPanel() {
  const { isLoaded, user } = useUser();

  if (!isLoaded || !user) {
    return (
      <div className="space-y-3">
        <div className="flex min-h-[68px] items-center gap-3 rounded-[16px] border border-[#E8E8EE] bg-white px-3 py-3 shadow-[0_8px_20px_rgba(15,18,22,0.04)]">
          <div className="h-10 w-10 animate-pulse rounded-full bg-[#EEE9FF]" />
          <div className="flex-1 space-y-2">
            <div className="h-3 w-24 animate-pulse rounded-full bg-[#EEE9FF]" />
            <div className="h-3 w-20 animate-pulse rounded-full bg-[#EEE9FF]" />
          </div>
        </div>
        <div className="h-10 animate-pulse rounded-[12px] bg-[#EEE9FF]" />
      </div>
    );
  }

  const primaryEmail =
    user.primaryEmailAddress?.emailAddress ??
    user.emailAddresses[0]?.emailAddress ??
    "teacher@pinequest.mn";

  const displayName = getDisplayName({
    firstName: user.firstName,
    lastName: user.lastName,
    primaryEmail,
  });

  const initials = getInitials({
    displayName,
    firstName: user.firstName,
    lastName: user.lastName,
  });

  const secondaryLabel = getSecondaryLabel(
    (user.publicMetadata as Record<string, unknown>) ?? {},
  );

  return (
    <div className="space-y-3">
      <div className="flex min-h-[68px] items-center gap-3 rounded-[16px] border border-[#E8E8EE] bg-white px-3 py-3 shadow-[0_8px_20px_rgba(15,18,22,0.04)]">
        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[linear-gradient(135deg,#8A63FF_0%,#6434F8_100%)] text-[13px] font-semibold text-white">
          {initials}
        </div>
        <div className="min-w-0 flex-1">
          <p className="truncate text-[14px] font-medium leading-5 text-[#0F1216] font-[var(--font-geist)]">
            {displayName}
          </p>
          <p className="truncate text-[12px] leading-4 text-[rgba(15,18,22,0.5)] font-[var(--font-geist)]">
            {secondaryLabel}
          </p>
        </div>
        <span className="sr-only">{primaryEmail}</span>
      </div>
      <AuthSignOutButton className="inline-flex h-10 w-full items-center justify-center gap-2 rounded-[12px] border border-[#DFE1E5] bg-white px-4 text-[14px] font-semibold text-[#0F1216] shadow-[0_1px_2px_rgba(0,0,0,0.05)] transition hover:bg-[#F6F7FB]">
        <ArrowLeftIcon className="h-4 w-4" />
        <span>Гарах</span>
      </AuthSignOutButton>
    </div>
  );
}
