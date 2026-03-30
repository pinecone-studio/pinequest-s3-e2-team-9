"use client";

import { useUser } from "@clerk/nextjs";
import { AuthSignOutButton } from "@/components/auth-sign-out-button";

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
        <div className="flex h-[52px] items-center gap-3 rounded-[12px] bg-white/70 px-3 py-2 shadow-[0px_4px_8px_-2px_rgba(0,0,0,0.06)]">
          <div className="h-9 w-9 animate-pulse rounded-full bg-[#E5EDF8]" />
          <div className="flex-1 space-y-2">
            <div className="h-3 w-24 animate-pulse rounded-full bg-[#E5EDF8]" />
            <div className="h-3 w-20 animate-pulse rounded-full bg-[#E5EDF8]" />
          </div>
        </div>
        <div className="h-10 animate-pulse rounded-[12px] bg-white/70 shadow-[0px_4px_8px_-2px_rgba(0,0,0,0.06)]" />
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
      <div className="flex h-[52px] w-full items-center gap-3 rounded-[12px] bg-white px-3 py-2 text-left shadow-[0px_4px_8px_-2px_rgba(0,0,0,0.06)]">
        <div className="flex h-9 w-9 items-center justify-center rounded-full bg-[linear-gradient(135deg,#7B97FF_0%,#4F6DFF_100%)] text-[12px] font-semibold text-white">
          {initials}
        </div>
        <div className="min-w-0">
          <p className="truncate text-[14px] font-medium leading-5 text-[#0F1216]">
            {displayName}
          </p>
          <p className="truncate text-[12px] leading-4 text-[#0F1216]/50">
            {secondaryLabel}
          </p>
        </div>
        <span className="sr-only">{primaryEmail}</span>
      </div>
      <AuthSignOutButton className="inline-flex h-10 w-full items-center justify-center rounded-[12px] border border-[#D7E3F8] bg-white px-4 text-[14px] font-semibold text-[#0F1216] shadow-[0px_4px_8px_-2px_rgba(0,0,0,0.06)] transition hover:bg-[#EEF4FF]" />
    </div>
  );
}
