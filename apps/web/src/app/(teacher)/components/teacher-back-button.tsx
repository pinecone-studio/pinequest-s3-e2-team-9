"use client";

import { useRouter } from "next/navigation";
import { ArrowLeftIcon } from "./icons";

type TeacherBackButtonProps = {
  href?: string;
  fallbackHref?: string;
  label?: string;
};

export function TeacherBackButton({
  href,
  fallbackHref = "/",
  label = "Буцах",
}: TeacherBackButtonProps) {
  const router = useRouter();

  const handleClick = () => {
    if (typeof window !== "undefined" && window.history.length > 1) {
      router.back();
      return;
    }

    router.push(href ?? fallbackHref);
  };

  return (
    <button
      type="button"
      onClick={handleClick}
      className="inline-flex h-9 items-center gap-2 rounded-md border border-[#DFE1E5] bg-white px-3 text-[14px] font-medium text-[#344054] shadow-[0px_1px_2px_rgba(0,0,0,0.05)] transition hover:border-[#BFC5D0]"
    >
      <ArrowLeftIcon className="h-4 w-4" />
      {label}
    </button>
  );
}
