import { TEACHER_COMMON_TEXT } from "./teacher-ui";

type DashboardRetryProps = {
  onRetry: () => void;
};

export function DashboardSkeleton() {
  return (
    <section className="mx-auto max-w-[1184px] animate-pulse space-y-5">
      <div className="h-[58px] rounded-[28px] bg-white/80 shadow-[0_12px_32px_rgba(34,63,122,0.08)]" />
      <div className="h-[296px] rounded-[32px] bg-[linear-gradient(135deg,#D7E4FF_0%,#BFD3FF_100%)]" />
      <div className="grid gap-5 lg:grid-cols-3">
        {Array.from({ length: 3 }).map((_, index) => (
          <div key={index} className="h-[248px] rounded-[28px] bg-white/85 shadow-[0_14px_36px_rgba(15,23,42,0.06)]" />
        ))}
      </div>
      <div className="grid gap-5 lg:grid-cols-3">
        {Array.from({ length: 3 }).map((_, index) => (
          <div key={index} className="h-[320px] rounded-[28px] bg-white/85 shadow-[0_14px_36px_rgba(15,23,42,0.06)]" />
        ))}
      </div>
    </section>
  );
}

export function DashboardErrorState({ onRetry }: DashboardRetryProps) {
  return (
    <section className="mx-auto max-w-[1184px] rounded-[32px] border border-[#FECACA] bg-[#FEF2F2] px-6 py-8 text-center shadow-[0_14px_36px_rgba(127,29,29,0.06)]">
      <h2 className="text-[22px] font-semibold text-[#991B1B]">Хяналтын самбарыг ачаалж чадсангүй</h2>
      <p className="mx-auto mt-3 max-w-[520px] text-[15px] leading-7 text-[#B42318]">
        {TEACHER_COMMON_TEXT.genericError}
      </p>
      <button
        className="mt-6 rounded-2xl bg-white px-5 py-3 text-[15px] font-semibold text-[#344054] shadow-sm transition hover:bg-[#FFF7F7] focus:outline-none focus:ring-4 focus:ring-[#FECACA]"
        onClick={onRetry}
        type="button"
      >
        {TEACHER_COMMON_TEXT.retry}
      </button>
    </section>
  );
}

export function DashboardEmptyState() {
  return (
    <section className="mx-auto max-w-[1184px] rounded-[32px] border border-[#E6ECF8] bg-white px-6 py-10 text-center shadow-[0_14px_36px_rgba(15,23,42,0.06)]">
      <h2 className="text-[24px] font-semibold text-[#101828]">Хяналтын самбарт харуулах өгөгдөл алга</h2>
      <p className="mx-auto mt-3 max-w-[560px] text-[15px] leading-7 text-[#667085]">
        Анги, шалгалтын өгөгдөл орж ирмэгц энэ хэсэг бодит тайлан, товлолт, үр дүнгээр автоматаар дүүрнэ.
      </p>
    </section>
  );
}
