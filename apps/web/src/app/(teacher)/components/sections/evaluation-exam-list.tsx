import { ClipboardIcon, ClockIcon } from "../icons";
import type { MyExamListView } from "./my-exams-types";

type EvaluationExamListProps = {
  exams: MyExamListView[];
  selectedExamId: string | null;
  loading: boolean;
  onSelect: (examId: string) => void;
};

export function EvaluationExamList({
  exams,
  selectedExamId,
  loading,
  onSelect,
}: EvaluationExamListProps) {
  return (
    <aside className="flex w-[280px] flex-col gap-4">
      {loading && !exams.length ? (
        <div className="rounded-[12px] border border-[#E5E7EB] bg-white p-4 text-[13px] text-[#6B7280]">
          Ачаалж байна...
        </div>
      ) : null}
      {exams.map((exam) => {
        const totalStudents = exam.footer?.students ?? 0;
        const submitted = exam.footer?.submitted ?? 0;
        const percent = totalStudents
          ? Math.round((submitted / totalStudents) * 100)
          : 0;

        return (
          <button
            key={exam.id}
            type="button"
            onClick={() => onSelect(exam.id)}
            className={`flex w-full flex-col gap-3 rounded-[12px] border bg-white p-4 text-left shadow-[0px_4px_8px_-2px_rgba(0,0,0,0.06),0px_2px_4px_-2px_rgba(0,0,0,0.04)] transition ${
              exam.id === selectedExamId
                ? "border-[#6434F8]"
                : "border-[#E5E7EB]"
            }`}
          >
            <div className="space-y-1">
              <p className="text-[14px] font-semibold text-[#0F1216]">
                {exam.title}
              </p>
              <p className="text-[12px] text-[#6B7280]">
                {exam.className} • {exam.createdDateLabel}
              </p>
            </div>
            <div className="space-y-1">
              <div className="flex items-center justify-between text-[11px] text-[#6B7280]">
                <span>
                  {submitted}/{totalStudents} үнэлэгдсэн
                </span>
                <span className="text-[#0F1216]">{percent}%</span>
              </div>
              <div className="h-[6px] w-full rounded-full bg-[#E5E7EB]">
                <div
                  className="h-full rounded-full bg-[#6434F8]"
                  style={{ width: `${percent}%` }}
                />
              </div>
            </div>
            <div className="flex items-center gap-4 text-[11px] text-[#6B7280]">
              <span className="inline-flex items-center gap-1">
                <ClockIcon className="h-3 w-3 text-[#6B7280]" />
                {exam.durationLabel}
              </span>
              <span className="inline-flex items-center gap-1">
                <ClipboardIcon className="h-3 w-3 text-[#6B7280]" />
                {exam.questionCountLabel}
              </span>
            </div>
          </button>
        );
      })}
    </aside>
  );
}
