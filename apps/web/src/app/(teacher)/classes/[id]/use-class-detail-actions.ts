"use client";

import { useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import { useDeleteExamMutation, usePublishExamMutation } from "@/graphql/generated";

type ClassExamRow = {
  id: string;
  title: string;
  durationMinutes: number;
};

type StudentInsight = {
  lastActiveAt?: string | null;
};

export function useClassDetailActions(
  exams: ClassExamRow[],
  studentInsights: StudentInsight[],
  refetch: () => Promise<unknown>,
) {
  const searchParams = useSearchParams();
  const [isAssignDialogOpen, setIsAssignDialogOpen] = useState(false);
  const [assignedExamId, setAssignedExamId] = useState<string | null>(null);
  const [startExamId, setStartExamId] = useState<string | null>(null);
  const [deleteExamId, setDeleteExamId] = useState<string | null>(null);
  const [activeStudentCount, setActiveStudentCount] = useState(0);
  const [startExamError, setStartExamError] = useState<string | null>(null);
  const [runPublishExam, publishExamState] = usePublishExamMutation();
  const [runDeleteExam, deleteExamState] = useDeleteExamMutation();
  const highlightedExamId = useMemo(
    () => assignedExamId ?? searchParams.get("assignedExamId"),
    [assignedExamId, searchParams],
  );
  const selectedStartExam = useMemo(
    () => exams.find((exam) => exam.id === startExamId) ?? null,
    [exams, startExamId],
  );

  const handleAssigned = async (examId: string) => {
    setAssignedExamId(examId);
    await refetch();
  };

  const handleStartExam = async () => {
    if (!selectedStartExam) {
      return;
    }
    try {
      await runPublishExam({ variables: { examId: selectedStartExam.id } });
      setStartExamError(null);
      setStartExamId(null);
      await refetch();
    } catch (publishError) {
      console.error("Failed to publish exam", publishError);
      setStartExamError("Шалгалт эхлүүлэх үед алдаа гарлаа.");
    }
  };

  const handleDeleteExam = async (examId: string) => {
    const accepted = window.confirm("Энэ эхлээгүй шалгалтыг устгах уу?");
    if (!accepted) {
      return;
    }

    try {
      setDeleteExamId(examId);
      await runDeleteExam({ variables: { examId } });
      await refetch();
    } catch (deleteError) {
      console.error("Failed to delete exam", deleteError);
      window.alert("Шалгалт устгах үед алдаа гарлаа.");
    } finally {
      setDeleteExamId(null);
    }
  };

  return {
    highlightedExamId,
    isAssignDialogOpen,
    openAssignDialog: () => setIsAssignDialogOpen(true),
    closeAssignDialog: () => setIsAssignDialogOpen(false),
    handleAssigned,
    selectedStartExam,
    startExamError,
    activeStudentCount,
    startingExamId: publishExamState.loading ? startExamId : null,
    deletingExamId: deleteExamState.loading ? deleteExamId : null,
    isStarting: publishExamState.loading,
    isDeleting: deleteExamState.loading,
    openStartDialog: (examId: string) => {
      const nextActiveStudentCount = studentInsights.filter((entry) => {
        if (!entry.lastActiveAt) {
          return false;
        }
        const timestamp = new Date(entry.lastActiveAt).getTime();
        return !Number.isNaN(timestamp) && Date.now() - timestamp <= 5 * 60 * 1000;
      }).length;
      setActiveStudentCount(nextActiveStudentCount);
      setStartExamError(null);
      setStartExamId(examId);
    },
    closeStartDialog: () => {
      setStartExamError(null);
      setStartExamId(null);
    },
    handleStartExam,
    handleDeleteExam,
  };
}
