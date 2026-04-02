"use client";

import { useMemo, useState } from "react";
import { useQuery } from "@apollo/client/react";
import {
  ExamStatus,
  MyExamsSectionQueryDocument,
  type MyExamsSectionQueryQuery,
} from "@/graphql/generated";
import { DashboardTopBar } from "../dashboard-top-bar";
import { buildMyExamListViews } from "./my-exams-view-model";
import { useMyExamDetail } from "./use-my-exam-detail";
import type { MyExamListView } from "./my-exams-types";
import { EvaluationToolbar } from "./evaluation-toolbar";
import { EvaluationExamList } from "./evaluation-exam-list";
import { EvaluationStudentTable } from "./evaluation-student-table";

const isLibraryExam = (exam: MyExamsSectionQueryQuery["exams"][number]) =>
  exam.isTemplate || (!exam.sourceExamId && exam.status === ExamStatus.Draft);

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
    return buildMyExamListViews(ownExams.filter((exam) => !isLibraryExam(exam)));
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

  const resolvedSelectedExamId = useMemo(() => {
    if (selectedExamId && filteredExams.some((exam) => exam.id === selectedExamId)) {
      return selectedExamId;
    }
    return filteredExams[0]?.id ?? null;
  }, [filteredExams, selectedExamId]);

  const selectedExam = useMemo<MyExamListView | null>(
    () => filteredExams.find((exam) => exam.id === resolvedSelectedExamId) ?? null,
    [filteredExams, resolvedSelectedExamId],
  );

  const { detailExam } = useMyExamDetail(selectedExam, Boolean(selectedExam));

  const students = useMemo(() => {
    const list = detailExam?.students ?? [];
    const keyword = studentSearch.trim().toLowerCase();
    if (!keyword) return list;
    return list.filter((student) =>
      student.name.toLowerCase().includes(keyword),
    );
  }, [detailExam, studentSearch]);

  const stats = useMemo(() => {
    const list = detailExam?.students ?? [];
    const reviewed = list.filter((row) => row.statusLabel === "Шалгасан").length;
    const pending = list.filter((row) => row.statusLabel === "Илгээсэн").length;
    const average = list.length
      ? Math.round(list.reduce((sum, row) => sum + row.percent, 0) / list.length)
      : 0;
    return { total: list.length, reviewed, pending, average };
  }, [detailExam]);

  return (
    <section className="relative mx-auto flex h-[900px] w-[1184px] flex-col overflow-y-auto bg-[#FAFAFA]">
      <h1 className="sr-only">Үнэлгээ</h1>
      <DashboardTopBar value={topSearch} onChange={setTopSearch} />
      <div className="flex flex-col gap-[20px] px-[32px] pb-0 pt-[22px]">
        <EvaluationToolbar
          examSearch={examSearch}
          studentSearch={studentSearch}
          onExamSearch={setExamSearch}
          onStudentSearch={setStudentSearch}
        />
        {error ? (
          <p className="text-[14px] text-[#B42318]">
            Шалгалтын мэдээлэл уншихад алдаа гарлаа.
          </p>
        ) : null}
        <div className="flex gap-6">
          <EvaluationExamList
            exams={filteredExams}
            loading={loading}
            selectedExamId={resolvedSelectedExamId}
            onSelect={(examId) => {
              setSelectedExamId(examId);
              void refetch();
            }}
          />
          <EvaluationStudentTable
            students={students}
            stats={stats}
            durationLabel={selectedExam?.durationLabel ?? null}
          />
        </div>
      </div>
    </section>
  );
}
