import { SaveIcon } from "./create-exam-icons";

type CreateExamHeaderProps = {
  isSubmitting: boolean;
  disabled: boolean;
};

export function CreateExamHeader({
  isSubmitting,
  disabled,
}: CreateExamHeaderProps) {
  return (
    <header className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
      <div className="space-y-2">
        <h1 className="text-[32px] font-semibold leading-tight text-[#101828]">
          Шалгалт үүсгэх
        </h1>
        <p className="max-w-[620px] text-[15px] leading-6 text-[#667085]">
          Анги, асуулт, тохиргоогоо сонгож шалгалтаа хадгална.
        </p>
      </div>

      <button
        className="inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-[#163D99] px-5 text-[14px] font-semibold text-white shadow-[0px_10px_20px_rgba(22,61,153,0.18)] disabled:cursor-not-allowed disabled:opacity-60"
        type="submit"
        disabled={disabled}
      >
        <SaveIcon className="h-4 w-4" />
        {isSubmitting ? "Үүсгэж байна..." : "Шалгалт үүсгэх"}
      </button>
    </header>
  );
}
