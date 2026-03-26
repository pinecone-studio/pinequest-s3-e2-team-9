"use client";

import { useClerk } from "@clerk/nextjs";
import type { ReactNode } from "react";
import { useState } from "react";

type AuthSignOutButtonProps = {
  children?: ReactNode;
  className?: string;
};

const DEFAULT_CLASS_NAME =
  "inline-flex items-center justify-center rounded-2xl bg-[#0F172A] px-5 py-3 text-[14px] font-semibold text-white shadow-[0_14px_32px_rgba(15,23,42,0.20)] transition hover:bg-[#1D2939] disabled:cursor-not-allowed disabled:opacity-70";

export function AuthSignOutButton({
  children = "Гарах",
  className,
}: AuthSignOutButtonProps) {
  const clerk = useClerk();
  const [isSubmitting, setIsSubmitting] = useState(false);

  return (
    <button
      className={className ?? DEFAULT_CLASS_NAME}
      disabled={isSubmitting}
      onClick={() => {
        if (isSubmitting) {
          return;
        }

        setIsSubmitting(true);
        void clerk.signOut({ redirectUrl: "/sign-in" }).catch(() => {
          setIsSubmitting(false);
        });
      }}
      type="button"
    >
      {isSubmitting ? "Гарч байна..." : children}
    </button>
  );
}
