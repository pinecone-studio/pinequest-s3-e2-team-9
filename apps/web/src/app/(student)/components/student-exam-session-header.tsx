import Link from "next/link";
import { AttemptStatus, ExamStatus } from "@/graphql/generated";
import type { StudentExamAttempt, StudentExamData } from "./student-exam-room-types";

type StudentExamSessionHeaderProps = {
  answeredCount: number;
  currentAttempt: StudentExamAttempt;
  errorMessage: string | null;
  exam: StudentExamData;
  isInProgress: boolean;
  isSaving: boolean;
  isSubmitting: boolean;
  onOpenSubmitDialog: () => void;
  remainingLabel: string;
  totalPoints: number;
};

export function StudentExamSessionHeader({
  answeredCount,
  currentAttempt,
  errorMessage,
  exam,
  isInProgress,
  isSaving,
  isSubmitting,
  onOpenSubmitDialog,
  remainingLabel,
  totalPoints,
}: StudentExamSessionHeaderProps) {
  const stats = [
    { label: "Хариулсан", value: `${answeredCount}/${exam.questions.length}` },
    { label: "Нийт хугацаа", value: `${exam.durationMinutes} минут` },
    ...(totalPoints > 0 ? [{ label: "Нийт оноо", value: `${totalPoints} оноо` }] : []),
  ];

  return (
    <div className="grid gap-6 lg:grid-cols-[minmax(0,1.7fr)_360px]">
      <section className="overflow-hidden rounded-[28px] border border-[#DCE6FF] bg-[linear-gradient(135deg,#123B7A_0%,#2466D0_52%,#6F90FF_100%)] p-7 text-white shadow-[0_24px_60px_rgba(36,102,208,0.2)] sm:p-8">
        <Link className="inline-flex text-[14px] font-medium text-white/88" href="/student">
          Student home руу буцах
        </Link>
        <div className="mt-5 flex flex-wrap items-start justify-between gap-4">
          <div className="max-w-[720px]">
            <span className="inline-flex rounded-full bg-white/14 px-3 py-1 text-[12px] font-semibold uppercase tracking-[0.12em] text-white">
              Асуултын хэсэг
            </span>
            <h1 className="mt-4 text-[30px] font-semibold tracking-[-0.03em]">{exam.title}</h1>
            <p className="mt-3 text-[15px] leading-7 text-white/88">
              {exam.class.subject || exam.class.name} • {exam.class.teacher.fullName}
            </p>
          </div>
          <div className="rounded-[22px] bg-white/12 px-5 py-4 text-right backdrop-blur-sm">
            <p className="text-[12px] font-semibold uppercase tracking-[0.08em] text-white/72">Үлдсэн хугацаа</p>
            <p className="mt-2 text-[26px] font-semibold leading-8">{remainingLabel}</p>
          </div>
        </div>

        <div className="mt-8 grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {stats.map((stat) => (
            <div key={stat.label} className="rounded-[20px] bg-white/12 px-5 py-4 backdrop-blur-sm">
              <p className="text-[12px] text-white/72">{stat.label}</p>
              <p className="mt-2 text-[19px] font-semibold text-white">{stat.value}</p>
            </div>
          ))}
        </div>
      </section>

      <aside className="rounded-[28px] border border-[#E7ECF6] bg-white p-6 shadow-[0_20px_45px_rgba(16,24,40,0.08)]">
        <div className="flex items-center justify-between gap-4">
          <h2 className="text-[18px] font-semibold text-[#101828]">Шалгалтын төлөв</h2>
          <span className={`inline-flex rounded-full px-3 py-1 text-[12px] font-semibold ${exam.status === ExamStatus.Published ? "bg-[#ECFDF3] text-[#027A48]" : "bg-[#F2F4F7] text-[#344054]"}`}>
            {exam.status === ExamStatus.Published ? "Идэвхтэй" : "Хаагдсан"}
          </span>
        </div>
        <div className="mt-5 space-y-3 text-[14px] leading-6 text-[#475467]">
          <StatusRow label="Төлөв" value={getAttemptStatusLabel(currentAttempt)} />
          <StatusRow label="Авто хадгалалт" value={isSaving ? "Хадгалж байна..." : "Идэвхтэй"} />
        </div>

        {isInProgress ? (
          <>
            <div className="mt-6 rounded-[18px] bg-[#F8FAFF] px-4 py-4 text-[14px] leading-6 text-[#475467]">
              Хариулт бүр автоматаар хадгалагдана. Асуултуудын доорх статус мөрөөс save төлөвийг харж болно.
            </div>
            <button
              className="mt-6 inline-flex h-12 w-full items-center justify-center rounded-[16px] bg-[#31AA40] text-[15px] font-semibold text-white shadow-[0_16px_36px_rgba(49,170,64,0.28)] transition hover:bg-[#278B34] disabled:cursor-not-allowed disabled:bg-[#98A2B3] disabled:shadow-none"
              disabled={isSubmitting || isSaving}
              onClick={onOpenSubmitDialog}
              type="button"
            >
              {isSubmitting ? "Шалгалтыг илгээж байна..." : "Шалгалт илгээх"}
            </button>
          </>
        ) : null}
        {errorMessage ? <p className="mt-4 text-[14px] font-medium text-[#B42318]">{errorMessage}</p> : null}
      </aside>
    </div>
  );
}

function getAttemptStatusLabel(attempt: StudentExamAttempt) {
  if (attempt.status === AttemptStatus.InProgress) return "Эхэлсэн";
  if (attempt.status === AttemptStatus.Submitted) return "Илгээсэн";
  return "Шалгасан";
}

function StatusRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between gap-4">
      <span>{label}</span>
      <span className="text-right font-medium text-[#101828]">{value}</span>
    </div>
  );
}
