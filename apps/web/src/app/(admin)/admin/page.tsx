import Link from "next/link";
import { AuthSignOutButton } from "@/components/auth-sign-out-button";
import { RoleGuard } from "@/components/role-guard";

export default function AdminPage() {
  return (
    <RoleGuard allowedRoles={["ADMIN"]}>
      <main className="min-h-screen bg-[#F7F9FC] px-6 py-10 sm:px-10 lg:px-16">
        <section className="mx-auto max-w-4xl rounded-[32px] border border-[#D6E0EB] bg-white p-8 shadow-[0_20px_60px_rgba(16,24,40,0.08)]">
          <span className="inline-flex rounded-full bg-[#EAF2FF] px-3 py-1 text-[12px] font-semibold uppercase tracking-[0.14em] text-[#175CD3]">
            Admin Section
          </span>
          <h1 className="mt-5 text-[32px] font-semibold tracking-[-0.03em] text-[#101828]">
            Admin хэсгийн folder structure бэлэн боллоо
          </h1>
          <p className="mt-3 max-w-2xl text-[16px] leading-7 text-[#475467]">
            Энэ route нь одоогоор суурь төлөвт байна. Дараагийн admin page,
            component, data layer-уудыг энэ хэсэгт төвлөрүүлж хөгжүүлэхэд бэлэн.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link
              href="/"
              className="inline-flex items-center rounded-2xl bg-[#175CD3] px-5 py-3 text-[14px] font-medium text-white"
            >
              Teacher dashboard руу очих
            </Link>
            <Link
              href="/student"
              className="inline-flex items-center rounded-2xl border border-[#D0D5DD] px-5 py-3 text-[14px] font-medium text-[#344054]"
            >
              Student хэсгийг харах
            </Link>
            <AuthSignOutButton />
          </div>
        </section>
      </main>
    </RoleGuard>
  );
}
