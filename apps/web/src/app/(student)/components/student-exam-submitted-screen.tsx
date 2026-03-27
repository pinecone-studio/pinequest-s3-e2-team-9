import Link from "next/link";
import type { StudentExamAttempt, StudentExamData } from "./student-exam-room-types";
import { formatClock, formatMonthDay } from "./student-home-time";

type StudentExamSubmittedScreenProps = {
  answeredCount: number;
  currentAttempt: StudentExamAttempt;
  exam: StudentExamData;
};

export function StudentExamSubmittedScreen({
  answeredCount,
  currentAttempt,
  exam,
}: StudentExamSubmittedScreenProps) {
  const submittedAt = currentAttempt.submittedAt ?? currentAttempt.startedAt;
  const details = [
    { label: "Төлөв", value: "Илгээгдсэн" },
    {
      label: "Илгээсэн огноо, цаг",
      value: `${formatMonthDay(submittedAt)} ${formatClock(submittedAt)}`,
    },
    { label: "Нийт асуултын тоо", value: String(exam.questions.length) },
    { label: "Хариулсан асуултын тоо", value: String(answeredCount) },
  ];

  return (
    <div className="grid gap-6 lg:grid-cols-[minmax(0,1.6fr)_360px]">
      <section className="overflow-hidden rounded-[28px] border border-[#DCE6FF] bg-[radial-gradient(circle_at_top_left,#EEF4FF_0%,#F8FAFF_45%,#FFFFFF_100%)] p-7 shadow-[0_24px_60px_rgba(36,102,208,0.12)] sm:p-8">
        <span className="inline-flex rounded-full bg-[#ECFDF3] px-3 py-1 text-[12px] font-semibold uppercase tracking-[0.1em] text-[#027A48]">
          Амжилттай илгээгдлээ
        </span>
        <h1 className="mt-4 text-[32px] font-semibold tracking-[-0.03em] text-[#101828]">
          {exam.title}
        </h1>
        <p className="mt-4 max-w-[760px] text-[16px] leading-7 text-[#475467]">
          Таны шалгалт хүлээн авлаа. Үр дүнг багш шалгасны дараа харах боломжтой.
        </p>

        <div className="mt-8 grid gap-4 sm:grid-cols-2">
          {details.map((detail) => (
            <div
              key={detail.label}
              className="rounded-[20px] border border-[#E4E7EC] bg-white px-5 py-4 shadow-[0_12px_30px_rgba(15,23,42,0.06)]"
            >
              <p className="text-[13px] text-[#667085]">{detail.label}</p>
              <p className="mt-2 text-[18px] font-semibold text-[#101828]">{detail.value}</p>
            </div>
          ))}
        </div>
      </section>

      <aside className="rounded-[28px] border border-[#E7ECF6] bg-white p-6 shadow-[0_20px_45px_rgba(16,24,40,0.08)]">
        <p className="text-[13px] font-semibold uppercase tracking-[0.08em] text-[#2466D0]">
          Дараагийн алхам
        </p>
        <h2 className="mt-3 text-[24px] font-semibold tracking-[-0.03em] text-[#101828]">
          Багшийн шалгалтыг хүлээнэ үү
        </h2>
        <p className="mt-3 text-[15px] leading-7 text-[#475467]">
          Энэ хуудсанд оноо, зөв буруу хариулт, review detail харагдахгүй. Дараагийн
          update-уудыг Миний шалгалтууд хэсгээс шалгаж болно.
        </p>
        <Link
          className="mt-6 inline-flex h-12 w-full items-center justify-center rounded-[16px] bg-[#2466D0] text-[15px] font-semibold text-white shadow-[0_16px_36px_rgba(36,102,208,0.28)] transition hover:bg-[#1E56B2]"
          href="/student/my-exams"
        >
          Миний шалгалтууд руу буцах
        </Link>
      </aside>
    </div>
  );
}
