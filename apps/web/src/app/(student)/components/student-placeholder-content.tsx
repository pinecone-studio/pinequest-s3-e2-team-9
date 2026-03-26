type StudentPlaceholderContentProps = {
  badge: string;
  description: string;
  title: string;
};

export function StudentPlaceholderContent({
  badge,
  description,
  title,
}: StudentPlaceholderContentProps) {
  return (
    <div className="mx-auto flex w-full max-w-5xl">
      <section className="w-full rounded-[28px] border border-[#E7ECF6] bg-white p-7 shadow-[0_18px_48px_rgba(15,18,22,0.05)] sm:p-9">
        <span className="inline-flex rounded-full border border-[#D7E3FF] bg-[#F7FAFF] px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.12em] text-[#5D79E8]">
          {badge}
        </span>
        <h1 className="mt-5 text-[28px] font-semibold tracking-[-0.03em] text-[#0F1216] sm:text-[34px]">
          {title}
        </h1>
        <p className="mt-3 max-w-2xl text-[15px] leading-7 text-[#58606B]">
          {description}
        </p>
      </section>
    </div>
  );
}
