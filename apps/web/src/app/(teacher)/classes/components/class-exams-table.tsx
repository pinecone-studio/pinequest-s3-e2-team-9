import { ExamStatus } from "@/graphql/generated";
import { ClassesProgressBar } from "./classes-progress-bar";
import { ClassesStatusBadge } from "./classes-status-badge";

type ExamRow = {
  id: string;
  title: string;
  meta: string;
  rawStatus: ExamStatus;
  durationMinutes: number;
  status: string;
  submitted: string;
  progressPercent: number;
  averageScore: string;
  statusTone: "success" | "warning" | "muted";
};

type ClassExamsTableProps = {
  rows: ExamRow[];
  highlightedExamId?: string | null;
  startingExamId?: string | null;
  onStartExam?: (row: ExamRow) => void;
};

export function ClassExamsTable({
  rows,
  highlightedExamId = null,
  startingExamId = null,
  onStartExam,
}: ClassExamsTableProps) {
  return (
    <div className="overflow-x-auto">
      <table className="min-w-full text-left text-[14px]">
        <thead className="border-b border-[#E4E7EC] text-[#0F1216]">
          <tr>
            <th className="py-3 pr-4 font-medium">Шалгалт</th>
            <th className="px-4 py-3 font-medium">Төлөв</th>
            <th className="px-4 py-3 font-medium">Илгээсэн</th>
            <th className="px-4 py-3 font-medium">Дундаж оноо</th>
            <th className="px-4 py-3 text-right font-medium">Үйлдэл</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => (
            <tr
              key={row.id}
              className={`border-b border-[#E4E7EC] last:border-b-0 ${
                row.id === highlightedExamId ? "bg-[#EEF4FF]" : ""
              }`}
            >
              <td className="py-4 pr-4">
                <p className="font-medium text-[#0F1216]">{row.title}</p>
                <p className="text-[12px] text-[#52555B]">{row.meta}</p>
              </td>
              <td className="px-4 py-4">
                <ClassesStatusBadge label={row.status} tone={row.statusTone} />
              </td>
              <td className="px-4 py-4 text-[#52555B]">
                <div className="inline-flex items-center gap-3">
                  <ClassesProgressBar value={row.progressPercent} />
                  <span>{row.submitted}</span>
                </div>
              </td>
              <td className="px-4 py-4 font-medium text-[#0F1216]">
                {row.averageScore}
              </td>
              <td className="px-4 py-4 text-right">
                {row.rawStatus === ExamStatus.Draft ? (
                  <button
                    type="button"
                    className="cursor-pointer rounded-md bg-[#00267F] px-3 py-2 text-[13px] font-medium text-white disabled:cursor-not-allowed disabled:opacity-60"
                    disabled={startingExamId === row.id}
                    onClick={() => onStartExam?.(row)}
                  >
                    {startingExamId === row.id ? "Эхлүүлж байна..." : "Эхлүүлэх"}
                  </button>
                ) : (
                  <span className="text-[13px] text-[#98A2B3]">-</span>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
