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
    <div className="flex flex-wrap items-start justify-between gap-4">
      <div>
        <h1 className="text-[24px] font-semibold text-[#0F1216]">Шалгалт үүсгэх</h1>
        <p className="mt-1 text-[14px] text-[#52555B]">
          Анги, асуулт, тохиргоогоо сонгоод шалгалтаа хадгална.
        </p>
      </div>

      <button
        className="inline-flex items-center gap-2 rounded-md bg-[#00267F] px-3 py-2 text-[14px] font-medium text-white/90 shadow-sm disabled:cursor-not-allowed disabled:opacity-60"
        type="submit"
        disabled={disabled}
      >
        <SaveIcon className="h-4 w-4" />
        {isSubmitting ? "Үүсгэж байна..." : "Шалгалт үүсгэх"}
      </button>
    </div>
  );
}
