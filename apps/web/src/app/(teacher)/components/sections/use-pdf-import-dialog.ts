"use client";

import { useEffect, useMemo, useState } from "react";
import { useAuth } from "@clerk/nextjs";
import { useMutation } from "@apollo/client/react";
import {
  ApproveExamImportJobMutationDocument,
  ClassesListDocument,
  CreateExamImportJobMutationDocument,
  QuestionBanksQueryDocument,
  useClassesListQuery,
  type ApproveExamImportJobMutationMutation,
  type ApproveExamImportJobMutationMutationVariables,
  type CreateExamImportJobMutationMutation,
  type CreateExamImportJobMutationMutationVariables,
} from "@/graphql/generated";
import {
  createPdfImportDraft,
  getPdfImportErrorMessage,
} from "./pdf-import-dialog-actions";
import {
  buildExamEditHref,
  buildReviewSummary,
  mergeReviewQuestionWithNext,
  moveReviewQuestion,
  splitReviewQuestion,
  toApprovedQuestionInput,
} from "./pdf-import-review-helpers";
import { buildImportJobView, type ImportJobView, type ImportQuestionView } from "./pdf-import-dialog-utils";

export function usePdfImportDialog(selectedFile: File | null, open: boolean) {
  const { getToken } = useAuth();
  const [jobView, setJobView] = useState<ImportJobView | null>(null);
  const [reviewQuestions, setReviewQuestions] = useState<ImportQuestionView[]>([]);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [infoMessage, setInfoMessage] = useState<string | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [isExtractingText, setIsExtractingText] = useState(false);
  const [selectedClassId, setSelectedClassId] = useState("");
  const classesQuery = useClassesListQuery({ fetchPolicy: "cache-and-network", ssr: false, skip: !open });
  const [createImportJob, { loading: isCreating }] = useMutation<
    CreateExamImportJobMutationMutation,
    CreateExamImportJobMutationMutationVariables
  >(CreateExamImportJobMutationDocument);
  const [approveImportJob, { loading: isApproving }] = useMutation<
    ApproveExamImportJobMutationMutation,
    ApproveExamImportJobMutationMutationVariables
  >(ApproveExamImportJobMutationDocument);

  useEffect(() => {
    if (!selectedFile) {
      setPreviewUrl(null);
      setJobView(null);
      setReviewQuestions([]);
      setErrorMessage(null);
      setInfoMessage(null);
      setSelectedClassId("");
      return;
    }

    const nextPreviewUrl = URL.createObjectURL(selectedFile);
    setPreviewUrl(nextPreviewUrl);
    setJobView(null);
    setReviewQuestions([]);
    setErrorMessage(null);
    setInfoMessage(null);

    return () => {
      URL.revokeObjectURL(nextPreviewUrl);
    };
  }, [selectedFile]);

  useEffect(() => {
    setReviewQuestions(jobView?.questions ?? []);
  }, [jobView]);

  useEffect(() => {
    if (selectedClassId || !classesQuery.data?.classes?.length) return;
    setSelectedClassId(classesQuery.data.classes[0]?.id ?? "");
  }, [classesQuery.data?.classes, selectedClassId]);

  const reviewSummary = useMemo(() => buildReviewSummary(jobView, reviewQuestions), [jobView, reviewQuestions]);

  const classOptions = classesQuery.data?.classes.map((classroom) => ({ id: classroom.id, name: classroom.name })) ?? [];

  const handleImport = async () => {
    if (!selectedFile) return;
    try {
      setErrorMessage(null);
      setInfoMessage(null);
      setIsExtractingText(true);
      const result = await createPdfImportDraft({
        selectedFile,
        getToken,
        createImportJob: (options) =>
          createImportJob({
            variables: options.variables,
          }),
      });
      setInfoMessage(result.infoMessage);
      setJobView(buildImportJobView(result.job));
    } catch (error) {
      console.error("Failed to create import job", error);
      setErrorMessage(getPdfImportErrorMessage(error));
    } finally {
      setIsExtractingText(false);
    }
  };

  const handleApprove = async () => {
    if (!jobView) return;
    try {
      setErrorMessage(null);
      if (reviewQuestions.length === 0) {
        throw new Error("Дор хаяж нэг асуултыг үлдээгээд хадгална уу.");
      }
      const result = await approveImportJob({
        variables: {
          id: jobView.id,
          classId: selectedClassId,
          questions: reviewQuestions.map(toApprovedQuestionInput),
        },
        refetchQueries: [{ query: QuestionBanksQueryDocument }, { query: ClassesListDocument }],
        awaitRefetchQueries: true,
      });
      const nextJob = result.data?.approveExamImportJob;
      if (!nextJob) {
        throw new Error("Import approval мэдээлэл ирсэнгүй.");
      }
      setJobView(buildImportJobView(nextJob));
    } catch (error) {
      console.error("Failed to approve import job", error);
      setErrorMessage(getPdfImportErrorMessage(error));
    }
  };

  const updateQuestion = (questionId: string, nextQuestion: ImportQuestionView) => {
    setReviewQuestions((currentQuestions) => currentQuestions.map((question) => (question.id === questionId ? nextQuestion : question)));
  };

  const rejectQuestion = (questionId: string) => setReviewQuestions((currentQuestions) => currentQuestions.filter((question) => question.id !== questionId).map((question, index) => ({ ...question, order: index + 1 })));
  const splitQuestion = (questionId: string) => setReviewQuestions((currentQuestions) => splitReviewQuestion(currentQuestions, questionId, jobView));
  const mergeQuestionWithNext = (questionId: string) => setReviewQuestions((currentQuestions) => mergeReviewQuestionWithNext(currentQuestions, questionId));
  const moveQuestion = (questionId: string, direction: "up" | "down") => setReviewQuestions((currentQuestions) => moveReviewQuestion(currentQuestions, questionId, direction));

  const examEditHref = buildExamEditHref(jobView, selectedClassId);

  return {
    classOptions,
    errorMessage,
    examEditHref,
    infoMessage,
    isApproving,
    isCreating: isCreating || isExtractingText,
    jobView,
    previewUrl,
    rejectQuestion,
    reviewQuestions,
    reviewSummary,
    selectedClassId,
    setSelectedClassId,
    handleApprove,
    handleImport,
    mergeQuestionWithNext,
    moveQuestion,
    splitQuestion,
    updateQuestion,
  };
}
