import { RoleGuard } from "@/components/role-guard";
import { StudentHomeContent } from "../components/student-home-content";
import { StudentShell } from "../components/student-shell";
import { AuthSignOutButton } from "@/components/auth-sign-out-button";
import Link from "next/link";
export default function StudentPage() {
  return (
    <RoleGuard allowedRoles={["STUDENT"]}>
      <StudentShell>
        <StudentHomeContent />
      </StudentShell>
      <main className="min-h-screen bg-[#FCF8F3] px-6 py-10 sm:px-10 lg:px-16">
        <section className="max-w-4xl rounded-[32px] border border-[#E4D8C8] bg-white p-8 shadow-[0_20px_60px_rgba(16,24,40,0.08)]">
          <span className="inline-flex rounded-full bg-[#FFF1E6] px-3 py-1 text-[12px] font-semibold uppercase tracking-[0.14em] text-[#C4320A]">
            Student Section
          </span>
          <h1 className="mt-5 text-[32px] font-semibold tracking-[-0.03em] text-[#101828]">
            Student хэсгийн суурь бүтэц үүслээ
          </h1>
          <p className="mt-3 max-w-2xl text-[16px] leading-7 text-[#475467]">
            Одоогоор student workflow хэрэгжээгүй байгаа ч route болон
            хөгжүүлэлтийн эхлэх цэгийг тусад нь гаргасан. Цаашдын exam list,
            attempt, result page-ууд энэ хэсэгт байрлана.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link
              href="/"
              className="inline-flex items-center rounded-2xl bg-[#C4320A] px-5 py-3 text-[14px] font-medium text-white"
            >
              Teacher dashboard руу очих
            </Link>
            <Link
              href="/admin"
              className="inline-flex items-center rounded-2xl border border-[#D0D5DD] px-5 py-3 text-[14px] font-medium text-[#344054]"
            >
              Admin хэсгийг харах
            </Link>
            <AuthSignOutButton className="inline-flex items-center justify-center rounded-2xl bg-[#0F172A] px-5 py-3 text-[14px] font-semibold text-white shadow-[0_14px_32px_rgba(15,23,42,0.20)] transition hover:bg-[#1D2939] disabled:cursor-not-allowed disabled:opacity-70" />
          </div>
        </section>
      </main>
    </RoleGuard>
  );
}
