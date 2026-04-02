import { SaveIcon } from "./create-exam-icons";

type CreateExamHeaderProps = {
  isSubmitting: boolean;
  disabled: boolean;
  isEditMode: boolean;
  isPublishing?: boolean;
  onPublish?: () => void;
  showPublishAction?: boolean;
};

export function CreateExamHeader({
  isSubmitting,
  disabled,
  isEditMode,
  isPublishing = false,
  onPublish,
  showPublishAction = false,
}: CreateExamHeaderProps) {
  return (
    <header className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
      <div className="space-y-2">
        <h1 className="text-[32px] font-semibold leading-tight text-[#101828]">
          {isEditMode ? "Шалгалт засах" : "Шалгалт үүсгэх"}
        </h1>
        <p className="max-w-[620px] text-[15px] leading-6 text-[#667085]">
          {isEditMode
            ? "Одоогийн draft шалгалтын анги, асуулт, тохиргоог шинэчилж хадгална."
            : "Анги, асуулт, тохиргоогоо сонгож шалгалтаа хадгална."}
        </p>
      </div>

      <div className="flex flex-wrap items-center gap-3">
        {showPublishAction ? (
          <button
            className="inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-[#16A34A] px-5 text-[14px] font-semibold text-white shadow-[0px_10px_20px_rgba(22,163,74,0.18)] disabled:cursor-not-allowed disabled:opacity-60"
            type="button"
            disabled={disabled || isPublishing}
            onClick={onPublish}
          >
            <SaveIcon className="h-4 w-4" />
            {isPublishing ? "Нийтэлж байна..." : "Шинэчлээд нийтлэх"}
          </button>
        ) : null}
        <button
          className="inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-[#163D99] px-5 text-[14px] font-semibold text-white shadow-[0px_10px_20px_rgba(22,61,153,0.18)] disabled:cursor-not-allowed disabled:opacity-60"
          type="submit"
          disabled={disabled}
        >
          <SaveIcon className="h-4 w-4" />
          {isSubmitting
            ? isEditMode
              ? "Шинэчилж байна..."
              : "Үүсгэж байна..."
            : isEditMode
              ? "Шалгалт шинэчлэх"
              : "Шалгалт үүсгэх"}
        </button>
      </div>
    </header>
  );
}
