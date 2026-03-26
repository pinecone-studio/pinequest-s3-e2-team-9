"use client";

import { useUser } from "@clerk/nextjs";

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

export function SidebarAccountPanel() {
  const { isLoaded, user } = useUser();

  if (!isLoaded || !user) {
    return (
      <div className="flex items-center gap-3 rounded-xl px-3 py-2">
        <div className="h-9 w-9 animate-pulse rounded-full bg-[#E5E7EB]" />
        <div className="flex-1 space-y-2">
          <div className="h-3 w-24 animate-pulse rounded-full bg-[#E5E7EB]" />
          <div className="h-3 w-32 animate-pulse rounded-full bg-[#E5E7EB]" />
        </div>
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

  return (
    <div className="flex items-center gap-3 rounded-xl px-3 py-2 hover:bg-white/70">
      <div className="flex h-9 w-9 items-center justify-center rounded-full bg-[#E5E7EB] text-[12px] font-semibold text-[#0F1216]">
        {initials}
      </div>
      <div className="min-w-0 flex-1">
        <p className="truncate text-[14px] font-medium text-[#0F1216]">
          {displayName}
        </p>
        <p className="truncate text-[12px] text-[#0F121680]">
          Математикийн багш
        </p>
      </div>
    </div>
  );
}
