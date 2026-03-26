import Link from "next/link";
import { ArrowRightIcon } from "./icons-actions";

type DashboardHeroProps = {
  teacherName: string;
};

function DashboardHeroIllustration() {
  return (
    <svg className="h-[220px] w-[220px] drop-shadow-[0_20px_40px_rgba(12,56,173,0.28)]" viewBox="0 0 260 260">
      <defs>
        <linearGradient id="hero-owl" x1="40" x2="220" y1="20" y2="230">
          <stop offset="0" stopColor="#B7D4FF" />
          <stop offset="1" stopColor="#5D96FF" />
        </linearGradient>
      </defs>
      <circle cx="128" cy="108" r="74" fill="#8AB7FF" opacity="0.16" />
      <path d="M83 204c0-44 16-96 45-129 29 33 49 85 49 129H83Z" fill="url(#hero-owl)" />
      <path d="M89 96c9-27 26-42 39-42 13 0 31 15 40 42-9-8-18-11-40-11-22 0-31 3-39 11Z" fill="#6DA0FF" />
      <circle cx="107" cy="111" r="28" fill="#F4FAFF" />
      <circle cx="149" cy="111" r="28" fill="#F4FAFF" />
      <circle cx="111" cy="112" r="12" fill="#16356F" />
      <circle cx="145" cy="112" r="12" fill="#16356F" />
      <circle cx="115" cy="108" r="4" fill="#FFFFFF" />
      <circle cx="149" cy="108" r="4" fill="#FFFFFF" />
      <path d="m128 120 10 10-10 12-10-12 10-10Z" fill="#3167D8" />
      <path d="M104 147c8 10 15 15 24 15 9 0 16-5 28-15" fill="none" stroke="#4D83EE" strokeLinecap="round" strokeWidth="8" />
      <path d="M102 167c7 34 17 51 26 51 8 0 17-17 24-51" fill="#DDEBFF" opacity="0.9" />
      <path d="M98 198c-4 14-14 22-28 26" fill="none" stroke="#4178E8" strokeLinecap="round" strokeWidth="8" />
      <path d="M156 198c4 14 14 22 28 26" fill="none" stroke="#4178E8" strokeLinecap="round" strokeWidth="8" />
    </svg>
  );
}

export function DashboardHero({ teacherName }: DashboardHeroProps) {
  return (
    <section className="relative overflow-hidden rounded-[32px] border border-[#8EB0FF] bg-[linear-gradient(135deg,#6E91FF_0%,#2967E4_100%)] px-8 py-8 text-white shadow-[0_24px_48px_rgba(38,99,227,0.24)] sm:px-10 sm:py-10 lg:flex lg:min-h-[296px] lg:items-center lg:justify-between lg:px-12">
      <div className="relative z-10 max-w-[488px]">
        <p className="text-[13px] font-semibold uppercase tracking-[0.24em] text-white/72">
          Сайн байна уу, {teacherName}
        </p>
        <h1 className="mt-4 text-[34px] font-bold leading-[1.15] sm:text-[40px]">
          Шалгалтыг илүү ухаалаг удирд
        </h1>
        <p className="mt-4 max-w-[420px] text-[18px] leading-8 text-white/82">
          Манай платформоор шалгалт үүсгэх, удирдах, дүн шинжилгээ хийхийг хялбар болгоорой
        </p>
        <Link
          className="mt-8 inline-flex h-12 items-center gap-2 rounded-2xl bg-white px-5 text-[15px] font-semibold text-[#1648B5] shadow-[0_14px_32px_rgba(12,31,86,0.16)] transition hover:-translate-y-0.5 hover:bg-[#F5F8FF] focus:outline-none focus:ring-4 focus:ring-white/30"
          href="/my-exams"
        >
          Дэлгэрэнгүй
          <ArrowRightIcon className="h-4 w-4" />
        </Link>
      </div>

      <div className="relative z-10 mt-8 flex justify-center lg:mt-0 lg:w-[320px]">
        <DashboardHeroIllustration />
      </div>

      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(255,255,255,0.26),transparent_34%),radial-gradient(circle_at_85%_20%,rgba(197,219,255,0.34),transparent_20%)]" />
    </section>
  );
}
