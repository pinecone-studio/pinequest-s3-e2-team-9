"use client";

import { useMutation, useQuery } from "@apollo/client/react";
import { useEffect, useMemo, useState } from "react";
import {
  AddQuestionToExamDocument,
  CreateExamDocument,
  CreateExamOptionsDocument,
  ExamMode,
} from "@/graphql/generated";
import { parseDurationMinutes, toSelectedQuestionsPayload, validateCreateExamForm } from "../create-exam-validation";
import { type CreateExamFieldErrors, type CreateExamFormValues, type CreateExamSubmitState, type SelectedQuestionPoints } from "../create-exam-types";

const INITIAL_FORM_VALUES: CreateExamFormValues = {
  classId: "",
  title: "",
  description: "",
  durationMinutes: "60",
  mode: ExamMode.Scheduled,
};
const EMPTY_ERRORS: CreateExamFieldErrors = { pointsByQuestionId: {} };

const hasValidationErrors = (errors: CreateExamFieldErrors): boolean =>
  Boolean(errors.classId || errors.title || errors.durationMinutes || errors.selectedQuestions || Object.keys(errors.pointsByQuestionId).length);
const toErrorMessage = (error: unknown): string =>
  error instanceof Error ? error.message : "Шалгалт үүсгэх үед алдаа гарлаа. Дахин оролдоно уу.";

export const useCreateExamFlow = () => {
  const optionsQuery = useQuery(CreateExamOptionsDocument, {
    fetchPolicy: "cache-and-network",
    notifyOnNetworkStatusChange: true,
    ssr: false,
  });
  const [runCreateExam, createExamState] = useMutation(CreateExamDocument);
  const [runAddQuestionToExam] = useMutation(AddQuestionToExamDocument);
  const [formValues, setFormValues] = useState(INITIAL_FORM_VALUES);
  const [selectedQuestionPoints, setSelectedQuestionPoints] = useState<SelectedQuestionPoints>({});
  const [errors, setErrors] = useState<CreateExamFieldErrors>(EMPTY_ERRORS);
  const [submitState, setSubmitState] = useState<CreateExamSubmitState>({ status: "idle" });
  const [isAddingQuestions, setIsAddingQuestions] = useState(false);

  const classOptions = useMemo(
    () => (optionsQuery.data?.classes ?? []).map((classroom) => ({ id: classroom.id, name: classroom.name })),
    [optionsQuery.data?.classes],
  );
  const questionOptions = useMemo(
    () =>
      (optionsQuery.data?.questions ?? []).map((question) => ({
        id: question.id,
        title: question.title,
        type: question.type,
        difficulty: question.difficulty,
        bankTitle: question.bank.title,
      })),
    [optionsQuery.data?.questions],
  );

  useEffect(() => {
    if (formValues.classId || !classOptions.length) {
      return;
    }
    setFormValues((previous) => ({ ...previous, classId: classOptions[0].id }));
  }, [classOptions, formValues.classId]);

  const setFieldValue = <K extends keyof CreateExamFormValues>(field: K, value: CreateExamFormValues[K]) => {
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

  const setQuestionPoints = (questionId: string, value: string) => {
    setSelectedQuestionPoints((previous) => ({ ...previous, [questionId]: value }));
    setErrors((previous) => {
      const nextPointErrors = { ...previous.pointsByQuestionId };
      delete nextPointErrors[questionId];
      return { ...previous, pointsByQuestionId: nextPointErrors };
    });
    setSubmitState({ status: "idle" });
  };

  const submitForm = async (): Promise<void> => {
    const nextErrors = validateCreateExamForm(formValues, selectedQuestionPoints);
    if (hasValidationErrors(nextErrors)) {
      setErrors(nextErrors);
      setSubmitState({ status: "idle" });
      return;
    }

    const durationMinutes = parseDurationMinutes(formValues.durationMinutes);
    if (!durationMinutes) {
      setErrors((previous) => ({ ...previous, durationMinutes: "Хугацааны утга буруу байна." }));
      return;
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
        },
      });
      const createdExam = createResult.data?.createExam;
      if (!createdExam) {
        throw new Error("Шалгалт үүсгэгдсэн мэдээлэл ирсэнгүй.");
      }

      setIsAddingQuestions(true);
      for (const selectedQuestion of selectedQuestions) {
        await runAddQuestionToExam({
          variables: { examId: createdExam.id, questionId: selectedQuestion.questionId, points: selectedQuestion.points },
        });
      }

      setSubmitState({ status: "success", examId: createdExam.id, title: createdExam.title, questionCount: selectedQuestions.length });
      setFormValues((previous) => ({ ...INITIAL_FORM_VALUES, classId: previous.classId, mode: previous.mode }));
      setSelectedQuestionPoints({});
      await optionsQuery.refetch();
    } catch (error) {
      setSubmitState({ status: "error", message: toErrorMessage(error) });
    } finally {
      setIsAddingQuestions(false);
    }
  };

  return {
    classOptions,
    questionOptions,
    formValues,
    selectedQuestionPoints,
    errors,
    submitState,
    isOptionsLoading: optionsQuery.loading,
    optionsError: optionsQuery.error,
    isSubmitting: createExamState.loading || isAddingQuestions,
    setFieldValue,
    toggleQuestion,
    setQuestionPoints,
    submitForm,
  };
};
