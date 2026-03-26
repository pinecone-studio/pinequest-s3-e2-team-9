import type { MyExamStudentRow } from "./my-exams-types";

export function ExamResultsStudents({
  rows,
}: {
  rows: MyExamStudentRow[];
}) {
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-[1.6fr_1fr_0.9fr_1fr] items-center gap-4 px-2 text-[14px] font-medium text-[#0F1216]">
        <span>Сурагч</span>
        <span>Оноо</span>
        <span>Төлөв</span>
        <span>Илгээсэн</span>
      </div>

      <div className="max-h-[400px] overflow-y-auto">
        <div className="space-y-1">
          {rows.map((row) => (
            <div
              key={row.id}
              className="grid grid-cols-[1.6fr_1fr_0.9fr_1fr] items-center gap-4 border-t border-[#E4E7EC] px-2 py-3 text-[14px]"
            >
              <div>
                <div className="font-medium text-[#0F1216]">{row.name}</div>
                <div className="text-[12px] text-[#52555B]">
                  {row.subject}
                </div>
              </div>
              <div className="flex items-center gap-2 text-[#0F1216]">
                <span className="font-medium">{row.score}</span>
                <span className="text-[#52555B]">/ {row.total}</span>
                <span className="rounded-md border border-[#31AA4033] bg-[#31AA401A] px-2 py-0.5 text-[12px] font-medium text-[#31AA40]">
                  {row.percent}%
                </span>
              </div>
              <span className={`rounded-md border px-2 py-0.5 text-[12px] font-medium ${row.statusTone}`}>
                {row.statusLabel}
              </span>
              <span className="text-[#52555B]">{row.submitted}</span>
            </div>
          ))}
          {!rows.length ? (
            <div className="border-t border-[#E4E7EC] px-2 py-6 text-[14px] text-[#52555B]">
              Одоогоор оролцогчийн мэдээлэл алга.
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
}
