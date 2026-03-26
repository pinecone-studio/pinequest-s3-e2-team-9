"use client";

import Image from "next/image";
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
  return fullName || primaryEmail.split("@")[0] || "Student";
};

const getSecondaryLabel = (publicMetadata: Record<string, unknown>) => {
  const className = publicMetadata.className;
  if (typeof className === "string" && className.trim().length > 0) {
    return className;
  }

  const gradeLabel = publicMetadata.gradeLabel;
  if (typeof gradeLabel === "string" && gradeLabel.trim().length > 0) {
    return gradeLabel;
  }

  return "Сурагчийн бүртгэл";
};

export function StudentSidebarProfile() {
  const { isLoaded, user } = useUser();

  if (!isLoaded || !user) {
    return (
      <div className="flex w-full items-center gap-3 rounded-[12px] px-3 py-2">
        <div className="h-9 w-9 animate-pulse rounded-full bg-[#E6EBF5]" />
        <div className="flex-1 space-y-1.5">
          <div className="h-4 w-24 animate-pulse rounded-full bg-[#E6EBF5]" />
          <div className="h-3 w-16 animate-pulse rounded-full bg-[#E6EBF5]" />
        </div>
      </div>
    );
  }

  const primaryEmail =
    user.primaryEmailAddress?.emailAddress ??
    user.emailAddresses[0]?.emailAddress ??
    "student@pinequest.mn";

  const displayName = getDisplayName({
    firstName: user.firstName,
    lastName: user.lastName,
    primaryEmail,
  });

  const secondaryLabel = getSecondaryLabel(
    (user.publicMetadata as Record<string, unknown>) ?? {},
  );

  return (
    <div className="space-y-3 rounded-[16px] px-3 py-2 transition hover:bg-white/70">
      <div className="flex items-center gap-3">
        <Image
          alt={displayName}
          className="h-9 w-9 rounded-full object-cover"
          height={36}
          src="/avatar.png"
          width={36}
        />

        <div className="min-w-0 flex-1">
          <p className="truncate text-[14px] font-medium leading-5 text-[#0F1216]">
            {displayName}
          </p>
          <p className="truncate text-[12px] leading-4 text-black/50">{secondaryLabel}</p>
        </div>
      </div>

      <AuthSignOutButton className="inline-flex h-10 w-full items-center justify-center rounded-[12px] border border-[#DFE1E5] bg-white px-4 text-[14px] font-semibold text-[#0F1216] shadow-[0_1px_2px_rgba(0,0,0,0.05)] transition hover:bg-[#F8FAFF]" />
    </div>
  );
}
