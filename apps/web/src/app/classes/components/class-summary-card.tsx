type ClassSummaryCardProps = {
  label: string;
  value: string;
};

export function ClassSummaryCard({ label, value }: ClassSummaryCardProps) {
  return (
    <article className="rounded-xl border border-[#DFE1E5] bg-white p-6 shadow-[0px_1px_3px_rgba(0,0,0,0.1),0px_1px_2px_-1px_rgba(0,0,0,0.1)]">
      <div className="text-[24px] font-semibold leading-8 text-[#0F1216]">
        {value}
      </div>
      <p className="mt-1 text-[12px] text-[#52555B]">{label}</p>
    </article>
  );
}
