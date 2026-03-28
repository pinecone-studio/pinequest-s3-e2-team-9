/* eslint-disable max-lines */
"use client";

import { useEffect, useMemo, useState } from "react";
import {
  useAddQuestionToExamMutation,
  useAssignExamToClassMutation,
  useCreateExamMutation,
  useCreateExamOptionsQuery,
} from "@/graphql/generated";
import {
  parseDurationMinutes,
  toScheduledForIso,
  toSelectedQuestionsPayload,
  validateCreateExamForm,
} from "../create-exam-validation";
import {
  EMPTY_ERRORS,
  hasValidationErrors,
  INITIAL_FORM_VALUES,
  toErrorMessage,
} from "./create-exam-flow-helpers";
import {
  getQuestionBankOptions,
  getQuestionOptions,
} from "./create-exam-option-data";
import {
  type CreateExamFieldErrors,
  type CreateExamFormValues,
  type CreateExamSubmitState,
  type SelectedQuestionPoints,
} from "../create-exam-types";
export const useCreateExamFlow = (
  initialClassId = "",
  assignmentClassId = "",
  initialBankId = "",
) => {
  const optionsQuery = useCreateExamOptionsQuery({
    fetchPolicy: "cache-and-network",
    notifyOnNetworkStatusChange: true,
    ssr: false,
  });
  const [runCreateExam, createExamState] = useCreateExamMutation();
  const [runAddQuestionToExam] = useAddQuestionToExamMutation();
  const [runAssignExamToClass, assignExamState] = useAssignExamToClassMutation();
  const [formValues, setFormValues] = useState(INITIAL_FORM_VALUES);
  const [selectedQuestionPoints, setSelectedQuestionPoints] = useState<SelectedQuestionPoints>({});
  const [errors, setErrors] = useState<CreateExamFieldErrors>(EMPTY_ERRORS);
  const [submitState, setSubmitState] = useState<CreateExamSubmitState>({ status: "idle" });
  const [isAddingQuestions, setIsAddingQuestions] = useState(false);
  const classOptions = useMemo(
    () =>
      (optionsQuery.data?.classes ?? []).map((classroom) => ({
        id: classroom.id,
        name: classroom.name,
      })),
    [optionsQuery.data?.classes],
  );
  const questionBankOptions = useMemo(
    () => getQuestionBankOptions(optionsQuery.data, initialBankId),
    [initialBankId, optionsQuery.data],
  );
  const questionOptions = useMemo(
    () => getQuestionOptions(optionsQuery.data, initialBankId),
    [initialBankId, optionsQuery.data],
  );
  useEffect(() => {
    if (formValues.classId || !classOptions.length) {
      return;
    }
    const nextClassId =
      classOptions.find((item) => item.id === initialClassId)?.id ??
      classOptions[0].id;
    setFormValues((previous) => ({ ...previous, classId: nextClassId }));
  }, [classOptions, formValues.classId, initialClassId]);

  const setFieldValue = <K extends keyof CreateExamFormValues>(
    field: K,
    value: CreateExamFormValues[K],
  ) => {
    setFormValues((previous) => ({ ...previous, [field]: value }));
    setErrors((previous) => ({ ...previous, [field]: undefined }));
    setSubmitState({ status: "idle" });
  };
  const toggleQuestion = (questionId: string) => {
    setSelectedQuestionPoints((previous) => {
      if (previous[questionId]) {
        const { [questionId]: _, ...rest } = previous;
        return rest;
      }
      return { ...previous, [questionId]: "1" };
    });
    setErrors((previous) => {
      const nextPointErrors = { ...previous.pointsByQuestionId };
      delete nextPointErrors[questionId];
      return { ...previous, selectedQuestions: undefined, pointsByQuestionId: nextPointErrors };
    });
    setSubmitState({ status: "idle" });
  };
  const addQuestion = (questionId: string) => {
    setSelectedQuestionPoints((previous) =>
      previous[questionId] ? previous : { ...previous, [questionId]: "1" },
    );
    setErrors((previous) => ({ ...previous, selectedQuestions: undefined }));
    setSubmitState({ status: "idle" });
  };
  const setQuestionPoints = (questionId: string, value: string) => {
    setSelectedQuestionPoints((previous) => ({ ...previous, [questionId]: value }));
    setErrors((previous) => {
      const nextPointErrors = { ...previous.pointsByQuestionId };
      delete nextPointErrors[questionId];
      return { ...previous, pointsByQuestionId: nextPointErrors };
    });
    setSubmitState({ status: "idle" });
  };
  const submitForm = async (): Promise<string | null> => {
    const nextErrors = validateCreateExamForm(formValues, selectedQuestionPoints);
    if (hasValidationErrors(nextErrors)) {
      setErrors(nextErrors);
      setSubmitState({ status: "idle" });
      return null;
    }

    const durationMinutes = parseDurationMinutes(formValues.durationMinutes);
    if (!durationMinutes) {
      setErrors((previous) => ({
        ...previous,
        durationMinutes: "Хугацааны утга буруу байна.",
      }));
      return null;
    }
    const scheduledFor = toScheduledForIso(formValues.scheduledFor);
    if (formValues.scheduledFor.trim().length && !scheduledFor) {
      setErrors((previous) => ({
        ...previous,
        scheduledFor: "Товлох огноо буруу байна.",
      }));
      return null;
    }
    const selectedQuestions = toSelectedQuestionsPayload(selectedQuestionPoints);
    setErrors(EMPTY_ERRORS);
    setSubmitState({ status: "idle" });
    try {
      const createResult = await runCreateExam({
        variables: {
          classId: formValues.classId,
          title: formValues.title.trim(),
          description: formValues.description.trim() || null,
          mode: formValues.mode,
          durationMinutes,
          scheduledFor,
        },
      });
      const createdExam = createResult.data?.createExam;
      if (!createdExam) {
        throw new Error("Шалгалт үүсгэгдсэн мэдээлэл ирсэнгүй.");
      }
      setIsAddingQuestions(true);
      for (const selectedQuestion of selectedQuestions) {
        await runAddQuestionToExam({
          variables: {
            examId: createdExam.id,
            questionId: selectedQuestion.questionId,
            points: selectedQuestion.points,
          },
        });
      }
      const resolvedAssignedExamId =
        assignmentClassId.trim().length > 0
          ? (
              await runAssignExamToClass({
                variables: { examId: createdExam.id, classId: assignmentClassId },
              })
            ).data?.assignExamToClass?.id ?? null
          : null;
      if (assignmentClassId.trim().length > 0 && !resolvedAssignedExamId) {
        throw new Error("Шалгалтыг ангид холбоход алдаа гарлаа.");
      }
      setSubmitState({
        status: "success",
        examId: createdExam.id,
        title: createdExam.title,
        questionCount: selectedQuestions.length,
      });
      setFormValues((previous) => ({
        ...INITIAL_FORM_VALUES,
        classId: previous.classId,
        mode: previous.mode,
      }));
      setSelectedQuestionPoints({});
      await optionsQuery.refetch();
      return resolvedAssignedExamId ?? createdExam.id;
    } catch (error) {
      setSubmitState({ status: "error", message: toErrorMessage(error) });
      return null;
    } finally {
      setIsAddingQuestions(false);
    }
  };
  return {
    classOptions,
    questionBankOptions,
    questionOptions,
    formValues,
    selectedQuestionPoints,
    errors,
    submitState,
    isOptionsLoading: optionsQuery.loading,
    optionsError: optionsQuery.error,
    isSubmitting:
      createExamState.loading || assignExamState.loading || isAddingQuestions,
    isClassSelectionLocked: Boolean(initialClassId),
    setFieldValue,
    toggleQuestion,
    addQuestion,
    setQuestionPoints,
    submitForm,
    refetchOptions: optionsQuery.refetch,
  };
};
