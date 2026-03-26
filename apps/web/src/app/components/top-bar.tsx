"use client";

import { useUser } from "@clerk/nextjs";
import { SearchIcon } from "./icons";

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

export function TopBar() {
  const { isLoaded, user } = useUser();

  const primaryEmail =
    user?.primaryEmailAddress?.emailAddress ??
    user?.emailAddresses[0]?.emailAddress ??
    "teacher@pinequest.mn";

  const displayName = getDisplayName({
    firstName: user?.firstName,
    lastName: user?.lastName,
    primaryEmail,
  });

  const initials = getInitials({
    displayName,
    firstName: user?.firstName,
    lastName: user?.lastName,
  });

  return (
    <header className="border-b border-[#E4E7EC] bg-[#F6F9FC]/70 backdrop-blur">
      <div className="mx-auto flex h-[72px] w-full max-w-[1184px] items-center gap-6 px-6">
        <label className="flex flex-1 items-center gap-3 rounded-xl bg-white/70 px-4 py-2 text-[14px] text-[#52555B] shadow-[0px_1px_2px_rgba(0,0,0,0.05)]">
          <SearchIcon className="h-4 w-4" />
          <input
            type="text"
            placeholder="Шалгалт, Анги, Сурагч хайх"
            className="w-full bg-transparent text-[14px] text-[#0F1216] outline-none placeholder:text-[#52555B]"
          />
        </label>
        <div className="flex items-center gap-3">
          <button
            className="flex h-10 w-10 items-center justify-center rounded-xl bg-white shadow-[0px_1px_2px_rgba(0,0,0,0.05)]"
            type="button"
            aria-label="Мэдэгдэл"
          >
            <img
              src="/icons/notifications_none.svg"
              alt=""
              aria-hidden="true"
              className="h-6 w-6"
            />
          </button>
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#E5E7EB] text-[12px] font-semibold text-[#0F1216]">
            {isLoaded ? initials : "T"}
          </div>
        </div>
      </div>
    </header>
  );
}
