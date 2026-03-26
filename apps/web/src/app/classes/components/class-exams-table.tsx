import { ClassesProgressBar } from "./classes-progress-bar";
import { ClassesStatusBadge } from "./classes-status-badge";

type ExamRow = {
  id: string;
  title: string;
  meta: string;
  status: string;
  submitted: string;
  progressPercent: number;
  averageScore: string;
  statusTone: "success" | "warning" | "muted";
};

type ClassExamsTableProps = {
  rows: ExamRow[];
};

export function ClassExamsTable({ rows }: ClassExamsTableProps) {
  return (
    <div className="overflow-x-auto">
      <table className="min-w-full text-left text-[14px]">
        <thead className="border-b border-[#E4E7EC] text-[#0F1216]">
          <tr>
            <th className="py-3 pr-4 font-medium">Шалгалт</th>
            <th className="px-4 py-3 font-medium">Төлөв</th>
            <th className="px-4 py-3 font-medium">Илгээсэн</th>
            <th className="px-4 py-3 font-medium">Дундаж оноо</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => (
            <tr key={row.id} className="border-b border-[#E4E7EC] last:border-b-0">
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
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
