import Link from "next/link";
import { AttemptStatus, ExamStatus } from "@/graphql/generated";
import type { StudentExamAttempt, StudentExamData } from "./student-exam-room-types";
import { formatClock, formatMonthDay } from "./student-home-time";

type StudentExamRoomSummaryProps = {
  answeredCount: number;
  canStart: boolean;
  currentAttempt: StudentExamAttempt | null;
  errorMessage: string | null;
  exam: StudentExamData;
  examStart: string | null;
  feedbackMessage: string | null;
  isCompleted: boolean;
  isInProgress: boolean;
  isSaving: boolean;
  isStarting: boolean;
  isSubmitting: boolean;
  onStartAttempt: () => void;
  onSubmitAttempt: () => void;
  remainingLabel: string;
  totalPoints: number;
};

export function StudentExamRoomSummary({
  answeredCount,
  canStart,
  currentAttempt,
  errorMessage,
  exam,
  examStart,
  feedbackMessage,
  isCompleted,
  isInProgress,
  isSaving,
  isStarting,
  isSubmitting,
  onStartAttempt,
  onSubmitAttempt,
  remainingLabel,
  totalPoints,
}: StudentExamRoomSummaryProps) {
  return (
    <>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="space-y-2">
          <Link className="inline-flex text-[14px] font-medium text-[#2466D0]" href="/student">
            Student home руу буцах
          </Link>
          <h1 className="text-[28px] font-semibold leading-9 text-[#0F1216]">{exam.title}</h1>
          <p className="text-[15px] leading-6 text-[#52555B]">
            {exam.class.subject || exam.class.name} • {exam.class.teacher.fullName}
          </p>
        </div>
        <span className={`inline-flex rounded-full px-3 py-1 text-[12px] font-semibold ${exam.status === ExamStatus.Published ? "bg-[#ECFDF3] text-[#027A48]" : "bg-[#F2F4F7] text-[#344054]"}`}>
          {exam.status === ExamStatus.Published ? "Идэвхтэй" : "Хаагдсан"}
        </span>
      </div>

      <section className="grid gap-4 lg:grid-cols-[1.5fr_1fr]">
        <div className="rounded-[20px] border border-[#DCE6FF] bg-[linear-gradient(135deg,#6F90FF_0%,#2466D0_100%)] px-6 py-6 text-white shadow-[0_14px_28px_rgba(36,102,208,0.2)]">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div className="space-y-3">
              <p className="text-[13px] font-semibold uppercase tracking-[0.08em] text-white/80">Exam Room</p>
              <p className="max-w-[640px] text-[15px] leading-6 text-white/92">
                {exam.description?.trim() || "Teacher энэ шалгалтыг ангидаа шууд нээсэн байна. Доорх асуултуудад хариулаад илгээнэ."}
              </p>
            </div>
            <div className="rounded-[16px] bg-white/12 px-4 py-3 text-right backdrop-blur-sm">
              <p className="text-[12px] font-medium text-white/72">Үлдсэн хугацаа</p>
              <p className="mt-1 text-[22px] font-semibold leading-7">{remainingLabel}</p>
            </div>
          </div>

          <div className="mt-5 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
            <InfoPill label="Хугацаа" value={`${exam.durationMinutes} минут`} />
            <InfoPill label="Асуулт" value={`${exam.questions.length}`} />
            <InfoPill label="Нийт оноо" value={`${totalPoints}`} />
            <InfoPill label="Эхэлсэн цаг" value={`${formatMonthDay(examStart)} ${formatClock(examStart)}`} />
          </div>
        </div>

        <div className="rounded-[20px] border border-[#E7ECF6] bg-white p-6 shadow-[0_4px_8px_-2px_rgba(0,0,0,0.06)]">
          <h2 className="text-[18px] font-semibold text-[#0F1216]">Төлөв</h2>
          <div className="mt-4 space-y-3 text-[14px] leading-6 text-[#475467]">
            <StatusRow label="Шалгалтын төлөв" value={exam.status === ExamStatus.Published ? "Явагдаж байна" : "Хаагдсан"} />
            <StatusRow label="Attempt" value={getAttemptStatusLabel(currentAttempt)} />
            <StatusRow label="Хадгалсан хариулт" value={`${answeredCount}/${exam.questions.length}`} />
            {currentAttempt?.submittedAt ? <StatusRow label="Илгээсэн цаг" value={`${formatMonthDay(currentAttempt.submittedAt)} ${formatClock(currentAttempt.submittedAt)}`} /> : null}
            {currentAttempt?.status === AttemptStatus.Graded ? <StatusRow label="Оноо" value={`${currentAttempt.totalScore} оноо`} /> : null}
          </div>

          {canStart ? <ActionButton busy={isStarting} label="Шалгалт эхлүүлэх" onClick={onStartAttempt} tone="primary" /> : null}
          {isInProgress ? <ActionButton busy={isSubmitting || isSaving} label="Шалгалт илгээх" onClick={onSubmitAttempt} tone="success" /> : null}
          {isCompleted ? (
            <div className="mt-6 rounded-[12px] bg-[#F8FAFF] px-4 py-3 text-[14px] leading-6 text-[#475467]">
              {currentAttempt?.status === AttemptStatus.Graded ? `Шалгалт шалгагдсан байна. Таны авсан оноо: ${currentAttempt.totalScore}.` : "Шалгалт амжилттай илгээгдсэн. Багш шалгаж дуусмагц дүн харагдана."}
            </div>
          ) : null}
          {feedbackMessage ? <p className="mt-4 text-[14px] font-medium text-[#027A48]">{feedbackMessage}</p> : null}
          {errorMessage ? <p className="mt-4 text-[14px] font-medium text-[#B42318]">{errorMessage}</p> : null}
        </div>
      </section>
    </>
  );
}

function getAttemptStatusLabel(attempt: StudentExamAttempt | null) {
  if (!attempt) return "Эхлээгүй";
  if (attempt.status === AttemptStatus.InProgress) return "Эхэлсэн";
  if (attempt.status === AttemptStatus.Submitted) return "Илгээсэн";
  return "Шалгасан";
}

function ActionButton({ busy, label, onClick, tone }: { busy: boolean; label: string; onClick: () => void; tone: "primary" | "success"; }) {
  return (
    <button
      className={`mt-6 inline-flex h-11 w-full items-center justify-center rounded-[12px] text-[14px] font-semibold text-white disabled:opacity-70 ${tone === "primary" ? "bg-[#2466D0]" : "bg-[#31AA40]"}`}
      disabled={busy}
      onClick={onClick}
      type="button"
    >
      {busy ? `${label === "Шалгалт эхлүүлэх" ? "Эхлүүлж" : "Илгээж"} байна...` : label}
    </button>
  );
}

function InfoPill({ label, value }: { label: string; value: string }) {
  return <div className="rounded-[14px] bg-white/12 px-4 py-3 backdrop-blur-sm"><p className="text-[12px] text-white/72">{label}</p><p className="mt-1 text-[15px] font-semibold text-white">{value}</p></div>;
}

function StatusRow({ label, value }: { label: string; value: string }) {
  return <div className="flex items-center justify-between gap-4"><span>{label}</span><span className="text-right font-medium text-[#101828]">{value}</span></div>;
}
