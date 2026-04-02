import type { MyExamStudentRow } from "./my-exams-types";

type EvaluationStats = {
  total: number;
  reviewed: number;
  pending: number;
  average: number;
};

type EvaluationStudentTableProps = {
  students: MyExamStudentRow[];
  stats: EvaluationStats;
  durationLabel: string | null;
};

type StatusTone = {
  label: string;
  ring: string;
  text: string;
  dot: string;
};

const getStatusTone = (label: string): StatusTone => {
  if (label === "Шалгасан") {
    return {
      label: "Үнэлэгдсэн",
      ring: "border-[#31AA4033]",
      text: "text-[#31AA40]",
      dot: "bg-[#31AA40]",
    };
  }

  if (label === "Илгээсэн") {
    return {
      label: "Хүлээгдэж буй",
      ring: "border-[#F59E0B33]",
      text: "text-[#B54708]",
      dot: "bg-[#F59E0B]",
    };
  }

  return {
    label: "Ирсэнгүй",
    ring: "border-[#F0443833]",
    text: "text-[#F04438]",
    dot: "bg-[#F04438]",
  };
};

export function EvaluationStudentTable({
  students,
  stats,
  durationLabel,
}: EvaluationStudentTableProps) {
  return (
    <div className="flex-1">
      <div className="mb-3 flex items-center justify-between text-[13px] text-[#6B7280]">
        <div className="flex items-center gap-4">
          <span>
            Нийт: <strong className="text-[#0F1216]">{stats.total}</strong>
          </span>
          <span>
            Үнэлэгдсэн:{" "}
            <strong className="text-[#31AA40]">{stats.reviewed}</strong>
          </span>
          <span>
            Хүлээгдэж буй:{" "}
            <strong className="text-[#B54708]">{stats.pending}</strong>
          </span>
        </div>
        <span>
          Дундаж оноо:{" "}
          <strong className="text-[#0F1216]">{stats.average}%</strong>
        </span>
      </div>
      <div className="overflow-hidden rounded-[12px] border border-[#E5E7EB] bg-white shadow-[0px_4px_8px_-2px_rgba(0,0,0,0.06),0px_2px_4px_-2px_rgba(0,0,0,0.04)]">
        <div className="grid grid-cols-[1.4fr_1fr_0.7fr_0.7fr_0.9fr_0.7fr] gap-3 border-b border-[#E5E7EB] bg-[#F9FAFB] px-4 py-3 text-[12px] font-medium text-[#475467]">
          <span>Сурагчийн нэр</span>
          <span>Илгэсэн</span>
          <span>Хугацаа</span>
          <span>Оноо</span>
          <span>Төлөв</span>
          <span></span>
        </div>
        <div className="max-h-[620px] overflow-y-auto">
          {students.map((row) => {
            const tone = getStatusTone(row.statusLabel);
            const scoreText =
              row.statusLabel === "Шалгасан" ? `${row.percent}/100%` : "-";

            return (
              <div
                key={row.id}
                className="grid grid-cols-[1.4fr_1fr_0.7fr_0.7fr_0.9fr_0.7fr] items-center gap-3 border-b border-[#EEF2F7] px-4 py-3 text-[13px] text-[#0F1216]"
              >
                <span className="font-medium text-[#101828]">
                  {row.name}
                </span>
                <span className="text-[#667085]">{row.submitted}</span>
                <span>{durationLabel ?? "-"}</span>
                <span
                  className={
                    scoreText === "-" ? "text-[#667085]" : "text-[#6434F8]"
                  }
                >
                  {scoreText}
                </span>
                <span
                  className={`inline-flex items-center gap-2 text-[12px] ${tone.text}`}
                >
                  <span
                    className={`flex h-4 w-4 items-center justify-center rounded-full border ${tone.ring}`}
                  >
                    <span
                      className={`h-1.5 w-1.5 rounded-full ${tone.dot}`}
                    />
                  </span>
                  {tone.label}
                </span>
                <button
                  className={`inline-flex h-[28px] items-center justify-center gap-1 rounded-[8px] border px-3 text-[12px] font-medium ${
                    row.statusLabel === "Илгээсэн"
                      ? "border-[#E5E7EB] bg-white text-[#344054]"
                      : "border-[#E5E7EB] bg-[#F2F4F7] text-[#98A2B3]"
                  }`}
                  disabled={row.statusLabel !== "Илгээсэн"}
                >
                  Үнэлэх
                </button>
              </div>
            );
          })}
          {!students.length ? (
            <div className="px-4 py-6 text-[13px] text-[#667085]">
              Сурагчдын мэдээлэл олдсонгүй.
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
}
