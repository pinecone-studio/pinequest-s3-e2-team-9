"use client";

import { buildExamAnalytics } from "./exam-results-analytics";
import type { MyExamView } from "./my-exams-types";

const getToneClassName = (tone: "neutral" | "success" | "warning") =>
  tone === "success"
    ? "border-[#ABEFC6] bg-[#ECFDF3]"
    : tone === "warning"
      ? "border-[#FEDF89] bg-[#FFFAEB]"
      : "border-[#DFE1E5] bg-white";

const StatCard = ({ label, value }: { label: string; value: string | number }) => (
  <div className="rounded-xl border border-[#DFE1E5] bg-white px-4 py-3">
    <div className="text-[24px] font-semibold text-[#101828]">{value}</div>
    <div className="text-[12px] text-[#667085]">{label}</div>
  </div>
);

const BarList = ({
  title,
  items,
  barColor,
}: {
  title: string;
  items: Array<{ label: string; value: number; meta: string; note?: string }>;
  barColor: string;
}) => (
  <section className="rounded-xl border border-[#DFE1E5] bg-white p-5">
    <h3 className="text-[16px] font-semibold text-[#101828]">{title}</h3>
    <div className="mt-4 space-y-3">
      {items.map((item) => (
        <div key={`${title}-${item.label}`} className="space-y-1.5">
          <div className="flex items-center justify-between gap-3 text-[13px]">
            <span className="font-medium text-[#101828]">{item.label}</span>
            <span className="text-[#667085]">{item.meta}</span>
          </div>
          <div className="flex items-center gap-3">
            <div className="h-2 flex-1 rounded-full bg-[#EAECF0]">
              <div
                className={`h-2 rounded-full ${barColor}`}
                style={{ width: `${Math.max(item.value, 2)}%` }}
              />
            </div>
            <span className="w-12 text-right text-[13px] font-semibold text-[#101828]">
              {item.value}%
            </span>
          </div>
          {item.note ? (
            <p className="text-[12px] text-[#667085]">{item.note}</p>
          ) : null}
        </div>
      ))}
    </div>
  </section>
);

const StudentList = ({
  title,
  students,
}: {
  title: string;
  students: Array<{ name: string; percent: number; scoreLabel: string }>;
}) => (
  <section className="rounded-xl border border-[#DFE1E5] bg-white p-5">
    <h3 className="text-[16px] font-semibold text-[#101828]">{title}</h3>
    <div className="mt-4 space-y-3">
      {students.map((student, index) => (
        <div
          key={`${title}-${student.name}-${index}`}
          className="flex items-center justify-between rounded-lg bg-[#F8FAFC] px-3 py-2"
        >
          <div>
            <p className="font-medium text-[#101828]">{student.name}</p>
            <p className="text-[12px] text-[#667085]">{student.scoreLabel}</p>
          </div>
          <span className="text-[14px] font-semibold text-[#175CD3]">
            {student.percent}%
          </span>
        </div>
      ))}
    </div>
  </section>
);

export function ExamResultsAnalyticsView({ exam }: { exam: MyExamView }) {
  const analytics = buildExamAnalytics(exam);

  return (
    <div className="space-y-5">
      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
        <StatCard label="Нийт сурагч" value={analytics.summary.studentCount} />
        <StatCard label="Илгээсэн" value={analytics.summary.submittedCount} />
        <StatCard label="Дундаж амжилт" value={`${analytics.summary.averagePercent}%`} />
        <StatCard label="Тэнцсэн хувь" value={`${analytics.summary.passRate}%`} />
        <StatCard label="Хамгийн өндөр" value={`${analytics.summary.highestPercent}%`} />
        <StatCard label="Хамгийн бага" value={`${analytics.summary.lowestPercent}%`} />
      </div>

      <section className="grid gap-3 lg:grid-cols-3">
        {analytics.insights.map((insight) => (
          <div
            key={insight.title}
            className={`rounded-xl border p-4 ${getToneClassName(insight.tone)}`}
          >
            <h3 className="text-[15px] font-semibold text-[#101828]">{insight.title}</h3>
            <p className="mt-2 text-[14px] leading-6 text-[#475467]">
              {insight.description}
            </p>
          </div>
        ))}
      </section>

      <div className="grid gap-5 xl:grid-cols-2">
        <BarList
          title="Онооны тархалт"
          items={analytics.scoreDistribution}
          barColor="bg-[#175CD3]"
        />
        <BarList
          title="Сэдвийн гүйцэтгэл"
          items={analytics.topicPerformance}
          barColor="bg-[#12B76A]"
        />
      </div>

      <div className="grid gap-5 xl:grid-cols-2">
        <BarList
          title="Хамгийн их алдсан асуултууд"
          items={analytics.questionPerformance}
          barColor="bg-[#F97066]"
        />
        <div className="grid gap-5 sm:grid-cols-2">
          <StudentList title="Шилдэг гүйцэтгэл" students={analytics.topStudents} />
          <StudentList title="Дэмжлэг хэрэгтэй сурагчид" students={analytics.supportStudents} />
        </div>
      </div>

      <section className="rounded-xl border border-[#B2DDFF] bg-[#F0F9FF] p-5">
        <h3 className="text-[16px] font-semibold text-[#101828]">Нэгтгэсэн дүгнэлт</h3>
        <p className="mt-3 text-[14px] leading-7 text-[#344054]">
          {analytics.overallConclusion}
        </p>
      </section>
    </div>
  );
}
