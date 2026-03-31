/* eslint-disable max-lines */
"use client";

import { useEffect, useMemo, useState } from "react";
import {
  ExamMode,
  ExamGenerationMode,
  useAddQuestionToExamMutation,
  useAssignExamToClassMutation,
  useCreateExamMutation,
  useCreateExamOptionsQuery,
  useEditExamDraftQuery,
  useUpdateExamDraftMutation,
} from "@/graphql/generated";
import { useLiveQuestionBankEvents } from "@/lib/use-live-question-bank-events";
import type { Difficulty } from "@/graphql/generated";
import {
  parseDurationMinutes,
  validateCreateExamForm,
  toScheduledForIso,
  toSelectedQuestionsPayload,
} from "../create-exam-validation";
import {
  createEmptyGenerationRule,
  createPracticeDifficultyRules,
  EMPTY_ERRORS,
  hasValidationErrors,
  INITIAL_FORM_VALUES,
  toErrorMessage,
} from "./create-exam-flow-helpers";
import {
  getQuestionBankOptions,
  getQuestionOptions,
  getRuleSourceOptions,
} from "./create-exam-option-data";
import {
  toDraftFormValues,
  toDraftInitialBankId,
  toDraftSelectedQuestionPoints,
} from "./create-exam-edit-helpers";
import {
  type CreateExamFieldErrors,
  type CreateExamFormValues,
  type CreateExamGenerationRule,
  type CreateExamSubmitState,
  type SelectedQuestionPoints,
} from "../create-exam-types";

export const useCreateExamFlow = (
  initialClassId = "",
  assignmentClassId = "",
  initialBankId = "",
  examId = "",
) => {
  const isEditMode = Boolean(examId);
  const optionsQuery = useCreateExamOptionsQuery({
    fetchPolicy: "cache-and-network",
    notifyOnNetworkStatusChange: true,
    ssr: false,
  });
  const draftQuery = useEditExamDraftQuery({
    variables: { id: examId },
    fetchPolicy: "cache-and-network",
    ssr: false,
    skip: !isEditMode,
  });
  useLiveQuestionBankEvents({
    teacherId: optionsQuery.data?.me?.id ?? null,
    includePublic: true,
    enabled: Boolean(optionsQuery.data?.me),
    onEvent: () => {
      void optionsQuery.refetch();
    },
  });
  const [runCreateExam, createExamState] = useCreateExamMutation();
  const [runUpdateExamDraft, updateExamDraftState] = useUpdateExamDraftMutation();
  const [runAddQuestionToExam] = useAddQuestionToExamMutation();
  const [runAssignExamToClass, assignExamState] = useAssignExamToClassMutation();
  const [formValues, setFormValues] = useState(INITIAL_FORM_VALUES);
  const [selectedQuestionPoints, setSelectedQuestionPoints] = useState<SelectedQuestionPoints>({});
  const [errors, setErrors] = useState<CreateExamFieldErrors>(EMPTY_ERRORS);
  const [submitState, setSubmitState] = useState<CreateExamSubmitState>({ status: "idle" });
  const [isAddingQuestions, setIsAddingQuestions] = useState(false);
  const [hasHydratedDraft, setHasHydratedDraft] = useState(false);

  const draftExam = draftQuery.data?.exam ?? null;
  const resolvedBankId = useMemo(
    () => (draftExam ? toDraftInitialBankId(draftExam, initialBankId) : initialBankId),
    [draftExam, initialBankId],
  );

  const classOptions = useMemo(
    () =>
      (optionsQuery.data?.classes ?? []).map((classroom) => ({
        id: classroom.id,
        name: classroom.name,
      })),
    [optionsQuery.data?.classes],
  );
  const questionBankOptions = useMemo(
    () => getQuestionBankOptions(optionsQuery.data, resolvedBankId),
    [optionsQuery.data, resolvedBankId],
  );
  const questionOptions = useMemo(
    () => getQuestionOptions(optionsQuery.data, resolvedBankId),
    [optionsQuery.data, resolvedBankId],
  );
  const ruleSourceOptions = useMemo(
    () =>
      getRuleSourceOptions(
        optionsQuery.data?.questionBanks ?? [],
        getQuestionOptions(optionsQuery.data, ""),
        resolvedBankId,
        formValues.mode,
      ),
    [formValues.mode, optionsQuery.data, resolvedBankId],
  );

  useEffect(() => {
    if (hasHydratedDraft || !draftExam || !optionsQuery.data) {
      return;
    }

    setFormValues(toDraftFormValues(draftExam, ruleSourceOptions));
    setSelectedQuestionPoints(toDraftSelectedQuestionPoints(draftExam));
    setErrors(EMPTY_ERRORS);
    setSubmitState({ status: "idle" });
    setHasHydratedDraft(true);
  }, [draftExam, hasHydratedDraft, optionsQuery.data, ruleSourceOptions]);

  useEffect(() => {
    if (isEditMode || formValues.classId || !classOptions.length) {
      return;
    }

    const nextClassId =
      classOptions.find((item) => item.id === initialClassId)?.id ?? classOptions[0].id;
    setFormValues((previous) => ({ ...previous, classId: nextClassId }));
  }, [classOptions, formValues.classId, initialClassId, isEditMode]);

  const getDefaultRuleSourceId = () =>
    ruleSourceOptions.find((option) => resolvedBankId && option.bankIds.includes(resolvedBankId))
      ?.id ??
    ruleSourceOptions[0]?.id ??
    "";

  const setFieldValue = <K extends keyof CreateExamFormValues>(
    field: K,
    value: CreateExamFormValues[K],
  ) => {
    setFormValues((previous) => {
      const nextValues = { ...previous, [field]: value };

      if (field === "generationMode") {
        const nextMode = value as CreateExamFormValues["generationMode"];
        if (nextMode === ExamGenerationMode.RuleBased && previous.generationRules.length === 0) {
          nextValues.generationRules = [createEmptyGenerationRule(getDefaultRuleSourceId())];
        }
      }

      return nextValues;
    });
    setErrors((previous) => ({ ...previous, [field]: undefined }));
    setSubmitState({ status: "idle" });
  };

  const addGenerationRule = () => {
    setFormValues((previous) => ({
      ...previous,
      generationRules: [
        ...previous.generationRules,
        createEmptyGenerationRule(getDefaultRuleSourceId()),
      ],
    }));
    setErrors((previous) => ({ ...previous, generationRules: undefined }));
    setSubmitState({ status: "idle" });
  };

  const replaceWithPracticeDifficultyRules = (sourceId: string) => {
    setFormValues((previous) => ({
      ...previous,
      generationRules: createPracticeDifficultyRules(sourceId),
    }));
    setErrors((previous) => ({ ...previous, generationRules: undefined }));
    setSubmitState({ status: "idle" });
  };

  const removeGenerationRule = (ruleId: string) => {
    setFormValues((previous) => ({
      ...previous,
      generationRules: previous.generationRules.filter((rule) => rule.id !== ruleId),
    }));
    setErrors((previous) => ({ ...previous, generationRules: undefined }));
    setSubmitState({ status: "idle" });
  };

  const updateGenerationRule = <K extends keyof CreateExamGenerationRule>(
    ruleId: string,
    field: K,
    value: CreateExamGenerationRule[K],
  ) => {
    setFormValues((previous) => ({
      ...previous,
      generationRules: previous.generationRules.map((rule) =>
        rule.id === ruleId ? { ...rule, [field]: value } : rule,
      ),
    }));
    setErrors((previous) => ({ ...previous, generationRules: undefined }));
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

  const replaceSelectedQuestions = (questionIds: string[]) => {
    const nextPoints: SelectedQuestionPoints = {};
    for (const questionId of questionIds) {
      nextPoints[questionId] = selectedQuestionPoints[questionId] ?? "1";
    }
    setSelectedQuestionPoints(nextPoints);
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
      setErrors((previous) => ({ ...previous, durationMinutes: "Хугацааны утга буруу байна." }));
      return null;
    }

    const scheduledFor = toScheduledForIso(formValues.scheduledFor);
    if (formValues.scheduledFor.trim().length && !scheduledFor) {
      setErrors((previous) => ({ ...previous, scheduledFor: "Товлох огноо буруу байна." }));
      return null;
    }

    const selectedQuestions = toSelectedQuestionsPayload(selectedQuestionPoints);
    const selectedQuestionDetails = selectedQuestions
      .map((item) => questionOptions.find((question) => question.id === item.questionId))
      .filter((question) => Boolean(question));

    if (formValues.mode === ExamMode.Practice) {
      const unsupportedQuestion =
        formValues.generationMode === ExamGenerationMode.Manual
          ? selectedQuestionDetails.find(
              (question) =>
                question?.type === "ESSAY" || question?.type === "IMAGE_UPLOAD",
            )
          : null;

      if (unsupportedQuestion) {
        setSubmitState({
          status: "error",
          message:
            "Practice mode-д гараар сонгох үед задгай даалгавар болон зураг оруулах асуулт дэмжигдэхгүй. Автоматаар үнэлэгддэг асуултууд сонгоно уу.",
        });
        return null;
      }
    }

    const generationRules =
      formValues.generationMode === ExamGenerationMode.RuleBased
        ? formValues.generationRules.map((rule) => ({
            sourceId: rule.sourceId,
            difficulty: rule.difficulty === "ALL" ? null : (rule.difficulty as Difficulty),
            count: Number.parseInt(rule.count.trim(), 10),
            points: Number.parseInt(rule.points.trim(), 10),
          }))
        : null;
    const resolvedGenerationRules =
      formValues.generationMode === ExamGenerationMode.RuleBased
        ? generationRules
            ?.map((rule) => {
              const source = ruleSourceOptions.find((option) => option.id === rule.sourceId);
              if (!source) {
                return null;
              }
              return {
                label: source.label,
                bankIds: source.bankIds,
                difficulty: rule.difficulty,
                count: rule.count,
                points: rule.points,
              };
            })
            .filter(
              (
                rule,
              ): rule is {
                label: string;
                bankIds: string[];
                difficulty: Difficulty | null;
                count: number;
                points: number;
              } => Boolean(rule),
            ) ?? []
        : null;
    const passingThreshold = Number.parseInt(formValues.passingThreshold.trim(), 10);

    setErrors(EMPTY_ERRORS);
    setSubmitState({ status: "idle" });

    try {
      if (isEditMode) {
        const updateResult = await runUpdateExamDraft({
          variables: {
            examId,
            classId: formValues.classId,
            title: formValues.title.trim(),
            description: formValues.description.trim() || null,
            mode: formValues.mode,
            durationMinutes,
            scheduledFor,
            shuffleQuestions: formValues.shuffleQuestions,
            shuffleAnswers: formValues.shuffleAnswers,
            generationMode: formValues.generationMode,
            rules: resolvedGenerationRules,
            passingCriteriaType: formValues.passingCriteriaType,
            passingThreshold,
            questionItems:
              formValues.generationMode === ExamGenerationMode.Manual ? selectedQuestions : [],
          },
        });
        const updatedExam = updateResult.data?.updateExamDraft;
        if (!updatedExam) {
          throw new Error("Шалгалтын шинэчлэгдсэн мэдээлэл ирсэнгүй.");
        }
        setSubmitState({
          status: "success",
          action: "updated",
          examId: updatedExam.id,
          title: updatedExam.title,
          questionCount:
            formValues.generationMode === ExamGenerationMode.RuleBased
              ? resolvedGenerationRules?.reduce((sum, rule) => sum + rule.count, 0) ?? 0
              : selectedQuestions.length,
        });
        await Promise.all([optionsQuery.refetch(), draftQuery.refetch()]);
        return updatedExam.id;
      }

      const createResult = await runCreateExam({
        variables: {
          classId: formValues.classId,
          title: formValues.title.trim(),
          description: formValues.description.trim() || null,
          mode: formValues.mode,
          durationMinutes,
          scheduledFor,
          shuffleQuestions: formValues.shuffleQuestions,
          shuffleAnswers: formValues.shuffleAnswers,
          generationMode: formValues.generationMode,
          rules: resolvedGenerationRules,
          passingCriteriaType: formValues.passingCriteriaType,
          passingThreshold,
        },
      });
      const createdExam = createResult.data?.createExam;
      if (!createdExam) {
        throw new Error("Шалгалт үүсгэгдсэн мэдээлэл ирсэнгүй.");
      }

      setIsAddingQuestions(true);
      if (formValues.generationMode === ExamGenerationMode.Manual) {
        for (const selectedQuestion of selectedQuestions) {
          await runAddQuestionToExam({
            variables: {
              examId: createdExam.id,
              questionId: selectedQuestion.questionId,
              points: selectedQuestion.points,
            },
          });
        }
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
        action: "created",
        examId: createdExam.id,
        title: createdExam.title,
        questionCount:
          formValues.generationMode === ExamGenerationMode.RuleBased
            ? resolvedGenerationRules?.reduce((sum, rule) => sum + rule.count, 0) ?? 0
            : selectedQuestions.length,
      });
      setFormValues((previous) => ({
        ...INITIAL_FORM_VALUES,
        classId: previous.classId,
        mode: previous.mode,
        shuffleQuestions: previous.shuffleQuestions,
        shuffleAnswers: previous.shuffleAnswers,
        generationMode: previous.generationMode,
        generationRules:
          previous.generationMode === ExamGenerationMode.RuleBased
            ? [createEmptyGenerationRule(getDefaultRuleSourceId())]
            : [],
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
    ruleSourceOptions,
    questionOptions,
    resolvedBankId,
    formValues,
    selectedQuestionPoints,
    errors,
    submitState,
    isEditMode,
    isOptionsLoading: optionsQuery.loading || (isEditMode && draftQuery.loading && !hasHydratedDraft),
    optionsError: optionsQuery.error ?? draftQuery.error,
    isSubmitting:
      createExamState.loading ||
      updateExamDraftState.loading ||
      assignExamState.loading ||
      isAddingQuestions,
    isClassSelectionLocked: Boolean(initialClassId),
    setFieldValue,
    toggleQuestion,
    addQuestion,
    replaceSelectedQuestions,
    setQuestionPoints,
    addGenerationRule,
    removeGenerationRule,
    updateGenerationRule,
    replaceWithPracticeDifficultyRules,
    submitForm,
    refetchOptions: async () => Promise.all([optionsQuery.refetch(), isEditMode ? draftQuery.refetch() : Promise.resolve()]),
  };
};
