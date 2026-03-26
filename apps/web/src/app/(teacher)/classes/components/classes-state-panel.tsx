type ClassesStatePanelProps = {
  title: string;
  description: string;
  actionLabel?: string;
  tone?: "neutral" | "error";
  onAction?: () => void;
};

export function ClassesStatePanel({
  title,
  description,
  actionLabel,
  tone = "neutral",
  onAction,
}: ClassesStatePanelProps) {
  const tones =
    tone === "error"
      ? "border-[#FECACA] bg-[#FEF2F2] text-[#991B1B]"
      : "border-[#DFE1E5] bg-white text-[#52555B]";

  return (
    <section className={`rounded-xl border p-6 ${tones}`}>
      <h2 className="text-[16px] font-semibold text-[#0F1216]">{title}</h2>
      <p className="mt-2 text-[14px]">{description}</p>
      {actionLabel && onAction ? (
        <button
          type="button"
          onClick={onAction}
          className="mt-4 rounded-md border border-[#D0D5DD] bg-white px-3 py-2 text-[13px] font-medium text-[#344054]"
        >
          {actionLabel}
        </button>
      ) : null}
    </section>
  );
}
