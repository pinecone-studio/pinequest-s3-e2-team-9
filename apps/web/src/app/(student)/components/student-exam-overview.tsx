import Link from "next/link";
import { ExamMode, ExamStatus } from "@/graphql/generated";
import type { StudentExamData } from "./student-exam-room-types";

type StudentExamOverviewProps = {
  canStart: boolean;
  errorMessage: string | null;
  exam: StudentExamData;
  isStarting: boolean;
  onStartAttempt: () => void;
  totalPoints: number;
};

export function StudentExamOverview({
  canStart,
  errorMessage,
  exam,
  isStarting,
  onStartAttempt,
  totalPoints,
}: StudentExamOverviewProps) {
  const infoCards = [
    { label: "Нийт асуулт", value: String(exam.questions.length) },
    { label: "Нийт хугацаа", value: `${exam.durationMinutes} минут` },
    { label: "Төлөв", value: exam.status === ExamStatus.Published ? "Идэвхтэй" : "Хаагдсан" },
    ...(totalPoints > 0 ? [{ label: "Нийт оноо", value: `${totalPoints} оноо` }] : []),
  ];
  const isPractice = exam.mode === ExamMode.Practice;

  return (
    <div className="grid gap-6 lg:grid-cols-[minmax(0,1.7fr)_360px]">
      <section className="overflow-hidden rounded-[28px] border border-[#D7E3FF] bg-[radial-gradient(circle_at_top_left,#EAF1FF_0%,#F8FAFF_42%,#FFFFFF_100%)] p-7 shadow-[0_24px_60px_rgba(36,102,208,0.12)] sm:p-8">
        <Link className="inline-flex text-[14px] font-medium text-[#2466D0]" href="/student">
          Student home руу буцах
        </Link>
        <div className="mt-5 flex flex-wrap items-start justify-between gap-4">
          <div className="max-w-[720px]">
            <span className="inline-flex rounded-full bg-white px-3 py-1 text-[12px] font-semibold uppercase tracking-[0.12em] text-[#2466D0] shadow-[0_4px_16px_rgba(36,102,208,0.08)]">
              {isPractice ? "Self test" : "Шалгалтын тойм"}
            </span>
            <h1 className="mt-4 text-[32px] font-semibold tracking-[-0.03em] text-[#0F172A]">
              {exam.title}
            </h1>
            <p className="mt-3 text-[15px] leading-7 text-[#475467]">
              {exam.description?.trim() || (isPractice
                ? "Энэ practice test-ийг хүссэн үедээ олон дахин ажиллаж, дуусмагц шууд feedback авч болно."
                : "Энэ шалгалтыг эхлүүлэхээс өмнө ерөнхий мэдээллийг нягталж, бэлэн болмогц орж ажиллана.")}
            </p>
            <p className="mt-4 text-[14px] leading-6 text-[#667085]">
              {exam.class.subject || exam.class.name} • {exam.class.teacher.fullName}
            </p>
          </div>
          <div className="rounded-[20px] bg-[#2466D0] px-5 py-4 text-white shadow-[0_14px_30px_rgba(36,102,208,0.24)]">
            <p className="text-[12px] font-semibold uppercase tracking-[0.1em] text-white/72">
              {isPractice ? "Шууд feedback" : "Асуултууд түгжигдсэн"}
            </p>
            <p className="mt-2 max-w-[220px] text-[14px] leading-6 text-white/92">
              {isPractice
                ? "Дуусмагц оноо, зөв хариу, сул сэдвийн зөвлөмж гарч ирнэ."
                : "Эхлүүлэх товч дарсны дараа асуултууд харагдаж, хугацаатай бол хугацаа шууд явж эхэлнэ."}
            </p>
          </div>
        </div>

        <div className="mt-8 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {infoCards.map((card) => (
            <div
              key={card.label}
              className="rounded-[20px] border border-white/80 bg-white/90 px-5 py-4 shadow-[0_12px_30px_rgba(15,23,42,0.06)]"
            >
              <p className="text-[13px] text-[#667085]">{card.label}</p>
              <p className="mt-2 text-[20px] font-semibold text-[#101828]">{card.value}</p>
            </div>
          ))}
        </div>
      </section>

      <aside className="rounded-[28px] border border-[#E4E7EC] bg-white p-6 shadow-[0_20px_45px_rgba(16,24,40,0.08)]">
        <p className="text-[13px] font-semibold uppercase tracking-[0.08em] text-[#2466D0]">
          Эхлэхэд бэлэн
        </p>
        <h2 className="mt-3 text-[24px] font-semibold tracking-[-0.03em] text-[#101828]">
          Шалгалтаа эхлүүлэхэд бэлэн үү?
        </h2>
        <p className="mt-3 text-[15px] leading-7 text-[#475467]">
          {isPractice
            ? "Хариулт бүр автоматаар хадгалагдана. Энэ self-test-ийг олон удаа өгч, бүрт нь шинэ feedback авч болно."
            : "Хариулт бүр автоматаар хадгалагдана. Шалгалт эхэлсний дараа тойм дэлгэц асуултын дэлгэц рүү шилжинэ."}
        </p>
        <div className="mt-6 rounded-[20px] bg-[#F8FAFF] px-4 py-4 text-[14px] leading-6 text-[#475467]">
          Хадгалах товч байхгүй. Хэрэглэгчийн бүх өөрчлөлт автоматаар хадгалагдах тул refresh эсвэл crash болсон ч алдагдах эрсдэл багасна.
        </div>
        <button
          className="mt-6 inline-flex h-12 w-full items-center justify-center rounded-[16px] bg-[#2466D0] text-[15px] font-semibold text-white shadow-[0_16px_36px_rgba(36,102,208,0.32)] transition hover:bg-[#1E56B2] disabled:cursor-not-allowed disabled:bg-[#98A2B3] disabled:shadow-none"
          disabled={!canStart || isStarting}
          onClick={onStartAttempt}
          type="button"
        >
          {isStarting
            ? (isPractice ? "Practice test-ийг эхлүүлж байна..." : "Шалгалтыг эхлүүлж байна...")
            : (isPractice ? "Practice test эхлүүлэх" : "Шалгалт эхлүүлэх")}
        </button>
        {!canStart ? (
          <p className="mt-3 text-[13px] leading-6 text-[#667085]">
            {isPractice
              ? "Энэ practice test-ийг одоогоор эхлүүлэх боломжгүй байна."
              : "Энэ шалгалтыг одоогоор эхлүүлэх боломжгүй байна."}
          </p>
        ) : null}
        {errorMessage ? <p className="mt-4 text-[14px] font-medium text-[#B42318]">{errorMessage}</p> : null}
      </aside>
    </div>
  );
}
