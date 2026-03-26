import {
  CheckCircleIcon,
  ClockIcon,
  DetailsIcon,
  EyeIcon,
  StopIcon,
  UsersIcon,
} from "../icons";
import type { ActiveExamView } from "../dashboard/dashboard-types";

type ActiveExamSectionProps = {
  exam: ActiveExamView | null;
  isClosing: boolean;
  onCloseExam: (examId: string) => Promise<boolean>;
};

export function ActiveExamSection({
  exam,
  isClosing,
  onCloseExam,
}: ActiveExamSectionProps) {
  if (!exam) {
    return (
      <section className="mt-6 space-y-3">
        <div className="flex items-center gap-2 text-[14px] font-medium text-[#344054]">
          <span className="h-2 w-2 rounded-full bg-[#98A2B3]" />
          Яг одоо явагдаж буй шалгалт
        </div>
        <div className="rounded-xl border border-[#E4E7EC] bg-white p-8 text-[14px] text-[#667085] shadow-card">
          Идэвхтэй (published) шалгалт одоогоор байхгүй байна.
        </div>
      </section>
    );
  }

  return (
    <section className="mt-6 space-y-3">
      <div className="flex items-center gap-2 text-[14px] font-medium text-[#344054]">
        <span className="h-2 w-2 rounded-full bg-[#12B76A]" />
        Яг одоо явагдаж буй шалгалт
      </div>
      <div className="rounded-xl border border-[#E4E7EC] bg-white p-8 shadow-card">
        <div className="flex flex-wrap items-start justify-between gap-6">
          <div className="flex-1 space-y-2">
            <div className="flex items-center gap-2">
              <CheckCircleIcon className="h-4 w-4 text-[#31AA40]" />
              <h3 className="text-[18px] font-semibold text-[#101828]">
                {exam.title}
              </h3>
            </div>
            <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-[14px] text-[#667085]">
              <span className="flex items-center gap-2">
                <UsersIcon className="h-4 w-4 text-[#52555B]" />
                {exam.className}
              </span>
              <span className="flex items-center gap-2">
                <ClockIcon className="h-4 w-4 text-[#52555B]" />
                {exam.durationLabel}
              </span>
            </div>
          </div>
          <span className="rounded-md border border-[#00267F33] bg-[#E8EDFF1A] px-3 py-1 text-[12px] font-medium text-[#00267F]">
            {exam.statusLabel}
          </span>
        </div>

        <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-3">
          <div className="rounded-lg bg-[#FAFAFA99] px-4 py-3 text-center">
            <div className="flex items-center justify-center gap-2 text-[20px] font-semibold text-[#101828]">
              <span className="h-2 w-2 rounded-full bg-[#12B76A]" />
              {exam.inProgressCount}
              <span className="text-[14px] font-normal text-[#52555B]">
                / {exam.totalStudents}
              </span>
            </div>
            <p className="mt-1 text-[12px] text-[#667085]">
              Идэвхтэй сурагчид
            </p>
          </div>
          <div className="rounded-lg bg-[#FAFAFA99] px-4 py-3 text-center">
            <div className="text-[20px] font-semibold text-[#101828]">
              {exam.submittedCount}
            </div>
            <p className="mt-1 text-[12px] text-[#667085]">Илгээсэн</p>
          </div>
          <div className="rounded-lg bg-[#FAFAFA99] px-4 py-3 text-center">
            <div className="text-[20px] font-semibold text-[#D92D20]">
              {exam.pendingReviewCount}
            </div>
            <p className="mt-1 text-[12px] text-[#667085]">Шалгах шаардлагатай</p>
          </div>
        </div>

        <div className="mt-5 space-y-2">
          <div className="flex items-center justify-between text-[12px] text-[#344054]">
            <span>Шалгалтын явц</span>
            <span className="font-medium text-[#667085]">{exam.progressPercent}%</span>
          </div>
          <div className="h-2 rounded-full bg-[#19223033]">
            <div
              className="h-full rounded-full bg-[#00267F]"
              style={{ width: `${exam.progressPercent}%` }}
            />
          </div>
        </div>

        <p className="mt-3 text-[12px] text-[#667085]">
          Үүсгэсэн огноо: {exam.createdAtLabel}
        </p>

        <div className="mt-5 flex flex-wrap gap-3">
          <button
            className={[
              "flex min-w-[200px] flex-1 items-center justify-center gap-2",
              "rounded-md border border-[#D0D5DD] bg-white px-3 py-2",
              "text-[14px] font-medium text-[#344054] shadow-sm",
            ].join(" ")}
          >
            <EyeIcon className="h-4 w-4 text-[#0F1216]" />
            Шалгалтыг хянах
          </button>
          <button
            className={[
              "flex min-w-[200px] flex-1 items-center justify-center gap-2",
              "rounded-md border border-[#DFE1E5] bg-[#FAFAFA] px-3 py-2",
              "text-[14px] font-medium text-[#0F1216] shadow-sm",
            ].join(" ")}
          >
            <DetailsIcon className="h-4 w-4 text-[#0F1216]" />
            Дэлгэрэнгүй харах
          </button>
          <button
            className="flex min-w-[160px] items-center justify-center gap-2 rounded-md bg-[#D92D20] px-3 py-2 text-[14px] font-medium text-white disabled:cursor-not-allowed disabled:opacity-70"
            disabled={isClosing}
            onClick={() => {
              void onCloseExam(exam.id);
            }}
          >
            <StopIcon className="h-4 w-4 text-white" />
            {isClosing ? "Хааж байна..." : "Шалгалтыг дуусгах"}
          </button>
        </div>
      </div>
    </section>
  );
}
