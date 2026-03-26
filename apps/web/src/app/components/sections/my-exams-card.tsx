import Image from "next/image";
import type { ExamCard } from "./my-exams-data";
import { ChartIcon } from "../icons";

export function MyExamCard({ exam }: { exam: ExamCard }) {
  return (
    <article className="flex h-full min-h-[228px] flex-col rounded-2xl border border-[#F1F2F3] bg-white p-2.5 shadow-[0px_4px_8px_-2px_rgba(0,0,0,0.1),0px_2px_4px_-2px_rgba(0,0,0,0.06)]">
      <div className="rounded-2xl bg-[#6F90FF] px-4 py-4 text-white">
        <h3 className="text-[18px] font-semibold leading-5">{exam.title}</h3>
        <div className="mt-2 flex items-center gap-2 text-[14px] text-white/90">
          <Image
            src="/icons/people_alt.svg"
            alt=""
            aria-hidden="true"
            width={16}
            height={16}
            className="h-4 w-4 brightness-0 invert"
          />
          <span>{exam.classLabel}</span>
        </div>
        <div className="mt-3 flex flex-wrap gap-2">
          {exam.tags.map((tag) => (
            <span
              key={`${exam.id}-${tag}`}
              className="rounded-full bg-white px-3 py-1 text-[12px] font-medium text-[#0F1216]"
            >
              {tag}
            </span>
          ))}
        </div>
      </div>

      <div className="flex flex-1 flex-col gap-3 px-2 pb-2 pt-3">
        <div className="flex items-center justify-between text-[12px] text-[#52555B]">
          <span>Тэнцсэн хувь</span>
          <span className="font-semibold text-[#0F1216]">
            {exam.passRate}%
          </span>
        </div>
        <div className="h-1.5 w-full rounded-full bg-[#F1F2F3]">
          <div
            className="h-1.5 rounded-full bg-[#6F90FF]"
            style={{ width: `${exam.passRate}%` }}
          />
        </div>
        <div className="flex items-center justify-between text-[12px] text-[#52555B]">
          <div className="flex items-center gap-3 text-[#0F1216]">
            <span className="flex items-center gap-1">
              <Image
                src="/icons/check_circle_outline.svg"
                alt=""
                aria-hidden="true"
                width={12}
                height={12}
                className="h-3 w-3"
              />
              {exam.passed}
            </span>
            <span className="flex items-center gap-1">
              <Image
                src="/icons/cancel.svg"
                alt=""
                aria-hidden="true"
                width={12}
                height={12}
                className="h-3 w-3"
              />
              {exam.failed}
            </span>
          </div>
          <span className="flex items-center gap-1">
            <ChartIcon className="h-3 w-3 text-[#52555B]" />
            Дундаж: {exam.average}%
          </span>
        </div>
      </div>
    </article>
  );
}
