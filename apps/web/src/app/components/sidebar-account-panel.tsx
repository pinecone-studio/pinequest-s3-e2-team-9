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
      <div className="rounded-[24px] border border-[#D5E3F4] bg-white/80 p-4 shadow-[0_18px_40px_rgba(15,23,42,0.08)]">
        <div className="h-4 w-24 animate-pulse rounded-full bg-[#E5EDF8]" />
        <div className="mt-4 flex items-center gap-3">
          <div className="h-11 w-11 animate-pulse rounded-2xl bg-[#E5EDF8]" />
          <div className="flex-1 space-y-2">
            <div className="h-4 w-28 animate-pulse rounded-full bg-[#E5EDF8]" />
            <div className="h-3 w-full animate-pulse rounded-full bg-[#E5EDF8]" />
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
    <div className="rounded-[24px] border border-[#D5E3F4] bg-[linear-gradient(180deg,#FFFFFF_0%,#F7FAFF_100%)] p-4 shadow-[0_18px_40px_rgba(15,23,42,0.08)]">
      <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-[#0B5FFF]">
        Teacher Profile
      </p>

      <div className="mt-4 flex items-center gap-3">
        <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[linear-gradient(135deg,#0B5FFF_0%,#69A4FF_100%)] text-[14px] font-semibold text-white shadow-[0_10px_22px_rgba(11,95,255,0.28)]">
          {initials}
        </div>

        <div className="min-w-0 flex-1">
          <p className="truncate text-[14px] font-semibold text-[#101828]">
            {displayName}
          </p>
          <p className="truncate text-[12px] text-[#667085]">{primaryEmail}</p>
        </div>
      </div>

      <div className="mt-4 rounded-[20px] border border-[#E6EEF8] bg-[#F8FBFF] px-3 py-3 text-[12px] leading-5 text-[#526581]">
        Имэйл OTP-ээр хамгаалагдсан session идэвхтэй байна.
      </div>

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
