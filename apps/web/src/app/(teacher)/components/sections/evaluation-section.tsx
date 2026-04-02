"use client";

import { useEffect, useMemo, useState } from "react";
import { useQuery } from "@apollo/client/react";
import {
  ExamStatus,
  MyExamsSectionQueryDocument,
  type MyExamsSectionQueryQuery,
} from "@/graphql/generated";
import { DashboardTopBar } from "../dashboard-top-bar";
import { ClipboardIcon, ClockIcon, SearchIcon } from "../icons";
import { BlackPrintIcon } from "../icons-addition";
import { buildMyExamListViews } from "./my-exams-view-model";
import { useMyExamDetail } from "./use-my-exam-detail";
import type { MyExamListView } from "./my-exams-types";

const isLibraryExam = (exam: MyExamsSectionQueryQuery["exams"][number]) =>
  exam.isTemplate || (!exam.sourceExamId && exam.status === ExamStatus.Draft);

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

export function EvaluationSection() {
  const [topSearch, setTopSearch] = useState("");
  const [examSearch, setExamSearch] = useState("");
  const [studentSearch, setStudentSearch] = useState("");
  const [selectedExamId, setSelectedExamId] = useState<string | null>(null);
  const { data, loading, error, refetch } = useQuery<MyExamsSectionQueryQuery>(
    MyExamsSectionQueryDocument,
    {
      fetchPolicy: "network-only",
      nextFetchPolicy: "cache-first",
      notifyOnNetworkStatusChange: true,
    },
  );

  const exams = useMemo(() => {
    const actorId = data?.me?.id ?? null;
    const ownExams = actorId
      ? (data?.exams ?? []).filter((exam) => exam.createdBy.id === actorId)
      : [];
    return buildMyExamListViews(
      ownExams
        .filter((exam) => !isLibraryExam(exam))
        .map((exam) =>
          exam.status === ExamStatus.Draft
            ? { ...exam, status: ExamStatus.Draft }
            : exam,
        ),
    );
  }, [data?.exams, data?.me?.id]);

  const filteredExams = useMemo(() => {
    const keyword = examSearch.trim().toLowerCase();
    if (!keyword) return exams;
    return exams.filter((exam) =>
      [exam.title, exam.subject, exam.subjectName, exam.className]
        .filter(Boolean)
        .some((text) => text.toLowerCase().includes(keyword)),
    );
  }, [examSearch, exams]);

  useEffect(() => {
    if (!selectedExamId && filteredExams.length) {
      setSelectedExamId(filteredExams[0].id);
      return;
    }

    if (
      selectedExamId &&
      filteredExams.length &&
      !filteredExams.some((exam) => exam.id === selectedExamId)
    ) {
      setSelectedExamId(filteredExams[0].id);
    }
  }, [filteredExams, selectedExamId]);

  const selectedExam = useMemo<MyExamListView | null>(
    () => filteredExams.find((exam) => exam.id === selectedExamId) ?? null,
    [filteredExams, selectedExamId],
  );

  const { detailExam } = useMyExamDetail(selectedExam, Boolean(selectedExam));

  const students = useMemo(() => {
    const list = detailExam?.students ?? [];
    const keyword = studentSearch.trim().toLowerCase();
    if (!keyword) return list;
    return list.filter((student) =>
      student.name.toLowerCase().includes(keyword),
    );
  }, [detailExam?.students, studentSearch]);

  const stats = useMemo(() => {
    const total = detailExam?.students.length ?? 0;
    const reviewed = detailExam?.students.filter((row) => row.statusLabel === "Шалгасан").length ?? 0;
    const pending = detailExam?.students.filter((row) => row.statusLabel === "Илгээсэн").length ?? 0;
    const average = detailExam?.students.length
      ? Math.round(
          detailExam.students.reduce((sum, row) => sum + row.percent, 0) /
            detailExam.students.length,
        )
      : 0;
    return { total, reviewed, pending, average };
  }, [detailExam?.students]);

  return (
    <section className="relative mx-auto flex h-[900px] w-[1184px] flex-col overflow-y-auto bg-[#FAFAFA]">
      <h1 className="sr-only">Үнэлгээ</h1>
      <DashboardTopBar value={topSearch} onChange={setTopSearch} />
      <div className="flex flex-col gap-[20px] px-[32px] pb-0 pt-[22px]">
        <div className="flex items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            <label className="flex h-[40px] items-center gap-2 rounded-[12px] border border-[#E5E7EB] bg-white px-3 text-[13px] text-[#0F1216] shadow-[0px_4px_8px_-2px_rgba(0,0,0,0.06),0px_2px_4px_-2px_rgba(0,0,0,0.04)]">
              <SearchIcon className="h-4 w-4 text-[#6B7280]" />
              <input
                className="w-[150px] bg-transparent text-[13px] outline-none placeholder:text-[#9CA3AF]"
                placeholder="Шалгалт хайх"
                value={examSearch}
                onChange={(event) => setExamSearch(event.target.value)}
              />
            </label>
            <label className="flex h-[40px] items-center gap-2 rounded-[12px] border border-[#E5E7EB] bg-white px-3 text-[13px] text-[#0F1216] shadow-[0px_4px_8px_-2px_rgba(0,0,0,0.06),0px_2px_4px_-2px_rgba(0,0,0,0.04)]">
              <SearchIcon className="h-4 w-4 text-[#6B7280]" />
              <input
                className="w-[230px] bg-transparent text-[13px] outline-none placeholder:text-[#9CA3AF]"
                placeholder="Сурагч хайх"
                value={studentSearch}
                onChange={(event) => setStudentSearch(event.target.value)}
              />
            </label>
          </div>
          <button className="flex h-[36px] w-[133px] items-center justify-center gap-[8px] rounded-[4px] border border-[#D5D7DB] bg-[#F8F8F8] px-[12px] py-[8px] text-[14px] font-medium leading-[20px] text-[#000000] shadow-[0px_1px_2px_rgba(0,0,0,0.05)]">
            <BlackPrintIcon className="h-[20px] w-[20px]" />
            Татаж авах
          </button>
        </div>
        {error ? (
          <p className="text-[14px] text-[#B42318]">
            Шалгалтын мэдээлэл уншихад алдаа гарлаа.
          </p>
        ) : null}
        <div className="flex gap-6">
          <aside className="flex w-[280px] flex-col gap-4">
            {loading && !filteredExams.length ? (
              <div className="rounded-[12px] border border-[#E5E7EB] bg-white p-4 text-[13px] text-[#6B7280]">
                Ачаалж байна...
              </div>
            ) : null}
            {filteredExams.map((exam) => {
              const totalStudents =
                exam.footer.type === "summary"
                  ? exam.footer.students
                  : exam.footer.students;
              const submitted =
                exam.footer.type === "summary"
                  ? exam.footer.submitted
                  : exam.footer.submitted;
              const percent = totalStudents
                ? Math.round((submitted / totalStudents) * 100)
                : 0;

              return (
                <button
                  key={exam.id}
                  type="button"
                  onClick={() => {
                    setSelectedExamId(exam.id);
                    void refetch();
                  }}
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
          <div className="flex-1">
            <div className="mb-3 flex items-center justify-between text-[13px] text-[#6B7280]">
              <div className="flex items-center gap-4">
                <span>
                  Нийт: <strong className="text-[#0F1216]">{stats.total}</strong>
                </span>
                <span>
                  Үнэлэгдсэн: <strong className="text-[#31AA40]">{stats.reviewed}</strong>
                </span>
                <span>
                  Хүлээгдэж буй: <strong className="text-[#B54708]">{stats.pending}</strong>
                </span>
              </div>
              <span>
                Дундаж оноо: <strong className="text-[#0F1216]">{stats.average}%</strong>
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
                    row.statusLabel === "Шалгасан"
                      ? `${row.percent}/100%`
                      : "-";
                  return (
                    <div
                      key={row.id}
                      className="grid grid-cols-[1.4fr_1fr_0.7fr_0.7fr_0.9fr_0.7fr] items-center gap-3 border-b border-[#EEF2F7] px-4 py-3 text-[13px] text-[#0F1216]"
                    >
                      <span className="font-medium text-[#101828]">
                        {row.name}
                      </span>
                      <span className="text-[#667085]">{row.submitted}</span>
                      <span>{selectedExam?.durationLabel ?? "-"}</span>
                      <span className={scoreText === "-" ? "text-[#667085]" : "text-[#6434F8]"}>
                        {scoreText}
                      </span>
                      <span className={`inline-flex items-center gap-2 text-[12px] ${tone.text}`}>
                        <span
                          className={`flex h-4 w-4 items-center justify-center rounded-full border ${tone.ring}`}
                        >
                          <span className={`h-1.5 w-1.5 rounded-full ${tone.dot}`} />
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
        </div>
      </div>
    </section>
  );
}
