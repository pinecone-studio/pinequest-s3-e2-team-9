"use client";

import { useClerk, useUser } from "@clerk/nextjs";

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
  const clerk = useClerk();
  const { isLoaded, user } = useUser();

  if (!isLoaded || !user) {
    return (
      <div className="rounded-[24px] bg-white/72 p-4 shadow-[0_14px_36px_rgba(15,23,42,0.06)] backdrop-blur">
        <div className="flex items-center gap-3">
          <div className="h-12 w-12 animate-pulse rounded-full bg-[#E5EDF8]" />
          <div className="flex-1 space-y-2">
            <div className="h-4 w-28 animate-pulse rounded-full bg-[#E5EDF8]" />
            <div className="h-3 w-32 animate-pulse rounded-full bg-[#E5EDF8]" />
          </div>
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
    <div className="rounded-[24px] bg-white/78 p-4 shadow-[0_14px_36px_rgba(15,23,42,0.08)] backdrop-blur">
      <div className="flex items-center gap-3">
        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-[linear-gradient(135deg,#7B97FF_0%,#4F6DFF_100%)] text-[14px] font-semibold text-white shadow-[0_10px_22px_rgba(79,109,255,0.28)]">
          {initials}
        </div>

        <div className="min-w-0 flex-1">
          <p className="truncate text-[15px] font-semibold text-[#101828]">{displayName}</p>
          <p className="truncate text-[13px] text-[#667085]">Багшийн бүртгэл</p>
        </div>
      </div>

      <p className="mt-2 truncate pl-[60px] text-[13px] text-[#98A2B3]">{primaryEmail}</p>

      <div className="mt-4 grid gap-2">
        <button
          className="flex items-center justify-center rounded-2xl border border-[#D5E3F4] bg-white px-4 py-3 text-[13px] font-medium text-[#344054] transition hover:bg-[#F8FBFF]"
          type="button"
        >
          Бүртгэл идэвхтэй
        </button>
        <button
          className="flex items-center justify-center rounded-2xl bg-[#0F172A] px-4 py-3 text-[13px] font-semibold text-white shadow-[0_14px_32px_rgba(15,23,42,0.20)] transition hover:bg-[#1D2939]"
          onClick={() => {
            void clerk.signOut({ redirectUrl: "/sign-in" });
          }}
          type="button"
        >
          Гарах
        </button>
      </div>
    </div>
  );
}
