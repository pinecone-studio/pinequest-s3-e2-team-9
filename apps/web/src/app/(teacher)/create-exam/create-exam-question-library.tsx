/* eslint-disable max-lines */
"use client";

import { useMemo, useState } from "react";
import { getCurriculumTopicGroupName, getCurriculumTopicGroups } from "../components/question-bank-curriculum";
import {
  ExamMode,
  Difficulty as GraphqlDifficulty,
  QuestionType as GraphqlQuestionType,
  useCreateQuestionMutationMutation,
} from "@/graphql/generated";
import type {
  CreateExamQuestionBankOption,
  CreateExamQuestionOption,
} from "./create-exam-types";
import {
  EMPTY_BANK_SELECTION,
  getBankGradeOptions,
  getBankSelectionFromId,
  getBankSubjectOptions,
  matchesQuestionBankSelection,
} from "./create-exam-bank-selection";

const QUESTION_TYPE_LABELS: Record<string, string> = {
  MCQ: "Олон сонголт",
  TRUE_FALSE: "Үнэн/Худал",
  SHORT_ANSWER: "Тоо бодолт",
  ESSAY: "Задгай даалгавар",
};

const DIFFICULTY_LABELS: Record<string, string> = {
  EASY: "Хялбар",
  MEDIUM: "Дунд",
  HARD: "Хүнд",
};

type CreateExamQuestionLibraryProps = {
  viewerId: string;
  questionBankOptions: CreateExamQuestionBankOption[];
  questionOptions: CreateExamQuestionOption[];
  mode: ExamMode;
  disabled: boolean;
  checkedQuestionIds: string[];
  variantCount: 1 | 2 | 4;
  initialBankId?: string;
  onQuestionsRefresh: () => Promise<unknown>;
  onToggleChecked: (questionId: string) => void;
  onReplaceChecked: (questionIds: string[]) => void;
  onAddSelected: () => void;
};

const formatQuestionText = (question: CreateExamQuestionOption) => {
  const source = question.prompt.trim() || question.title.trim();
  return source.length > 110 ? `${source.slice(0, 107)}...` : source;
};

const getQuestionTypeLabel = (type: string) => QUESTION_TYPE_LABELS[type] ?? type;

const getDifficultyLabel = (difficulty: string) =>
  DIFFICULTY_LABELS[difficulty] ?? difficulty;

type DraftEditState = {
  key: string;
  label: string;
  prompt: string;
  options: string[];
  correctAnswer: string | null;
};

type DraftGenerationResult = {
  drafts: DraftEditState[];
  templateLabel: string | null;
  autoFilled: boolean;
};

const VARIANT_GROUP_TAG = "variant_group:";
const VARIANT_LABEL_TAG = "variant_label:";
const VARIANT_COUNT_TAG = "variant_count:";
const DRAFT_VARIANT_TAG = "variant_draft:true";

const stripVariantTags = (tags: string[]) =>
  tags.filter(
    (tag) =>
      !tag.startsWith(VARIANT_GROUP_TAG) &&
      !tag.startsWith(VARIANT_LABEL_TAG) &&
      !tag.startsWith(VARIANT_COUNT_TAG) &&
      tag !== DRAFT_VARIANT_TAG,
  );

const createClientVariantGroupId = () =>
  `client_variant_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 8)}`;

const createManualDrafts = (
  question: CreateExamQuestionOption,
  variantCount: 2 | 4,
): DraftEditState[] => {
  const labels = variantCount === 2 ? ["A", "B"] : ["A", "B", "C", "D"];

  return labels.map((label, index) => ({
    key: `${question.id}-${label}`,
    label,
    prompt: index === 0 ? question.prompt : "",
    options:
      question.type === "MCQ"
        ? (index === 0 ? question.options : question.options.map(() => ""))
        : question.type === "TRUE_FALSE"
          ? ["True", "False"]
          : [],
    correctAnswer:
      index === 0
        ? (question.correctAnswer ?? null)
        : question.type === "TRUE_FALSE"
          ? "True"
          : null,
  }));
};

const extractNumericAnswer = (value: string | null | undefined) => {
  const parsed = Number((value ?? "").trim());
  return Number.isFinite(parsed) ? parsed : null;
};

const buildNumericOptions = (correctValue: number, size: number, seed: number) => {
  const offsets = [0, 1, -1, 2, -2, 3, -3, 4, -4];
  const values: number[] = [];

  for (const offset of offsets) {
    const candidate = correctValue + offset + (offset === 0 ? 0 : seed % 2);
    if (!values.includes(candidate)) {
      values.push(candidate);
    }
    if (values.length >= Math.max(size, 4)) {
      break;
    }
  }

  const options = values.slice(0, Math.max(size, 4));
  const correctAnswer = String(correctValue);

  if (!options.includes(correctValue)) {
    options[0] = correctValue;
  }

  return {
    options: options.map(String),
    correctAnswer,
  };
};

const replaceFirstMatch = (source: string, pattern: RegExp, replacement: string) => {
  const match = source.match(pattern);
  if (!match || typeof match.index !== "number") {
    return source;
  }

  return `${source.slice(0, match.index)}${replacement}${source.slice(match.index + match[0].length)}`;
};

const buildLinearEquationPrompt = (equation: string, originalPrompt: string) => {
  if (originalPrompt.includes("=") && /x/i.test(originalPrompt)) {
    return replaceFirstMatch(originalPrompt, /-?\d*x\s*(?:[+-]\s*\d+)?\s*=\s*-?\d+/i, equation);
  }

  if (originalPrompt.includes("x хэд")) {
    return `${equation} үед x хэд вэ?`;
  }

  if (originalPrompt.includes("ол")) {
    return `${equation} тэгшитгэлийг бод.`;
  }

  return `${equation} үед x-ийг ол.`;
};

const tryBuildLinearEquationDrafts = (
  question: CreateExamQuestionOption,
  variantCount: 2 | 4,
): DraftGenerationResult | null => {
  if (!["MCQ", "SHORT_ANSWER"].includes(question.type)) {
    return null;
  }

  const sourceText = `${question.prompt} ${question.title}`;
  const equationMatch = sourceText.match(/([+-]?\d*)x\s*([+-]\s*\d+)?\s*=\s*([+-]?\d+)/i);
  if (!equationMatch) {
    return null;
  }

  const coefficientToken = equationMatch[1]?.replace(/\s+/g, "") ?? "";
  const coefficient =
    coefficientToken === "" || coefficientToken === "+"
      ? 1
      : coefficientToken === "-"
        ? -1
        : Number(coefficientToken);
  const constantTerm = Number((equationMatch[2] ?? "").replace(/\s+/g, "") || "0");

  if (!Number.isFinite(coefficient) || coefficient === 0 || !Number.isFinite(constantTerm)) {
    return null;
  }

  const sourceAnswer =
    extractNumericAnswer(question.correctAnswer) ??
    (() => {
      const rhs = Number(equationMatch[3]);
      const derived = (rhs - constantTerm) / coefficient;
      return Number.isInteger(derived) ? derived : null;
    })();

  if (sourceAnswer === null) {
    return null;
  }

  const labels = variantCount === 2 ? ["A", "B"] : ["A", "B", "C", "D"];
  const drafts = createManualDrafts(question, variantCount);

  for (let index = 1; index < labels.length; index += 1) {
    const nextCoefficient = coefficient + index;
    const nextAnswer = sourceAnswer + index;
    const nextRhs = nextCoefficient * nextAnswer + constantTerm;
    const constantDisplay =
      constantTerm === 0 ? "" : constantTerm > 0 ? ` + ${constantTerm}` : ` - ${Math.abs(constantTerm)}`;
    const equation = `${nextCoefficient}x${constantDisplay} = ${nextRhs}`;
    const prompt = buildLinearEquationPrompt(equation, question.prompt);
    const nextDraft = drafts[index];
    if (!nextDraft) {
      continue;
    }

    if (question.type === "MCQ") {
      const mcq = buildNumericOptions(nextAnswer, question.options.length || 4, index);
      drafts[index] = {
        ...nextDraft,
        prompt,
        options: mcq.options,
        correctAnswer: mcq.correctAnswer,
      };
    } else {
      drafts[index] = {
        ...nextDraft,
        prompt,
        correctAnswer: String(nextAnswer),
      };
    }
  }

  return {
    drafts,
    templateLabel: "Шугаман тэгшитгэл",
    autoFilled: true,
  };
};

const buildBinomialExpansion = (
  left: string,
  operator: "+" | "-",
  right: string,
  power: 2 | 3,
) => {
  if (power === 2) {
    return operator === "+"
      ? `${left}^2 + 2${left}${right} + ${right}^2`
      : `${left}^2 - 2${left}${right} + ${right}^2`;
  }

  return operator === "+"
    ? `${left}^3 + 3${left}^2${right} + 3${left}${right}^2 + ${right}^3`
    : `${left}^3 - 3${left}^2${right} + 3${left}${right}^2 - ${right}^3`;
};

const tryBuildBinomialIdentityDrafts = (
  question: CreateExamQuestionOption,
  variantCount: 2 | 4,
): DraftGenerationResult | null => {
  if (!["MCQ", "SHORT_ANSWER"].includes(question.type)) {
    return null;
  }

  const sourceText = `${question.prompt} ${question.title}`;
  const identityMatch = sourceText.match(/\(\s*([a-z])\s*([+-])\s*([a-z])\s*\)\s*\^\s*([23])/i);
  if (!identityMatch) {
    return null;
  }

  const left = identityMatch[1];
  const right = identityMatch[3];
  const power = Number(identityMatch[4]) as 2 | 3;
  const originalFormula = identityMatch[0].replace(/\s+/g, "");
  const family = [
    `(${left}+${right})^2`,
    `(${left}-${right})^2`,
    `(${left}+${right})^3`,
    `(${left}-${right})^3`,
  ];
  const orderedFormulas = [
    originalFormula,
    ...family.filter((entry) => entry !== originalFormula),
  ].slice(0, variantCount);
  const drafts = createManualDrafts(question, variantCount);

  for (let index = 1; index < orderedFormulas.length; index += 1) {
    const formula = orderedFormulas[index] ?? originalFormula;
    const formulaMatch = formula.match(/\(([a-z])([+-])([a-z])\)\^([23])/i);
    if (!formulaMatch) {
      continue;
    }

    const operator = formulaMatch[2] as "+" | "-";
    const nextPower = Number(formulaMatch[4]) as 2 | 3;
    const correctExpansion = buildBinomialExpansion(left, operator, right, nextPower);
    const prompt = question.prompt.includes(originalFormula)
      ? replaceFirstMatch(question.prompt, /\(\s*[a-z]\s*[+-]\s*[a-z]\s*\)\s*\^\s*[23]/i, formula)
      : `${formula} томьёог дэлгэ.`;
    const nextDraft = drafts[index];
    if (!nextDraft) {
      continue;
    }

    if (question.type === "MCQ") {
      const distractors = [
        `${left}^2 + ${right}^2`,
        buildBinomialExpansion(left, operator === "+" ? "-" : "+", right, nextPower),
        nextPower === 2
          ? `${left}^2 ${operator === "+" ? "+" : "-"} ${right}^2`
          : `${left}^3 + ${right}^3`,
      ];
      const options = [correctExpansion, ...distractors]
        .filter((value, optionIndex, values) => values.indexOf(value) === optionIndex)
        .slice(0, Math.max(question.options.length, 4));
      drafts[index] = {
        ...nextDraft,
        prompt,
        options,
        correctAnswer: correctExpansion,
      };
    } else {
      drafts[index] = {
        ...nextDraft,
        prompt,
        correctAnswer: correctExpansion,
      };
    }
  }

  return {
    drafts,
    templateLabel: power === 2 || power === 3 ? "Товчилсон үржвэр" : null,
    autoFilled: true,
  };
};

const createInitialDrafts = (
  question: CreateExamQuestionOption,
  variantCount: 2 | 4,
): DraftGenerationResult => {
  const binomialDrafts = tryBuildBinomialIdentityDrafts(question, variantCount);
  if (binomialDrafts) {
    return binomialDrafts;
  }

  const linearDrafts = tryBuildLinearEquationDrafts(question, variantCount);
  if (linearDrafts) {
    return linearDrafts;
  }

  return {
    drafts: createManualDrafts(question, variantCount),
    templateLabel: null,
    autoFilled: false,
  };
};

const toGraphqlQuestionType = (type: string): GraphqlQuestionType => {
  switch (type) {
    case "MCQ":
      return GraphqlQuestionType.Mcq;
    case "TRUE_FALSE":
      return GraphqlQuestionType.TrueFalse;
    case "SHORT_ANSWER":
      return GraphqlQuestionType.ShortAnswer;
    case "ESSAY":
      return GraphqlQuestionType.Essay;
    default:
      return GraphqlQuestionType.ImageUpload;
  }
};

const toGraphqlDifficulty = (difficulty: string): GraphqlDifficulty => {
  switch (difficulty) {
    case "EASY":
      return GraphqlDifficulty.Easy;
    case "HARD":
      return GraphqlDifficulty.Hard;
    default:
      return GraphqlDifficulty.Medium;
  }
};

const getGroupedTopicOptions = (
  bankOptions: CreateExamQuestionBankOption[],
  grade: string,
  subject: string,
) => {
  if (!grade || !subject) {
    return [];
  }

  const numericGrade = Number(grade);
  const groupedFromCurriculum = getCurriculumTopicGroups(numericGrade, subject).map(
    (entry) => entry.name,
  );
  const groupedFromBanks = bankOptions
    .filter(
      (item) => String(item.grade) === grade && item.subject === subject,
    )
    .map((item) => getCurriculumTopicGroupName(numericGrade, subject, item.topic));

  return [...new Set([...groupedFromCurriculum, ...groupedFromBanks])];
};

const matchesGroupedTopic = (
  question: CreateExamQuestionOption,
  grade: string,
  subject: string,
  topic: string,
) => {
  if (!topic) {
    return true;
  }

  return (
    getCurriculumTopicGroupName(question.bankGrade, question.bankSubject, question.bankTopic) ===
    topic
  );
};

const matchesFilter = (
  question: CreateExamQuestionOption,
  searchTerm: string,
  grade: string,
  subject: string,
  topic: string,
  difficulty: string,
  type: string,
) => {
  const normalized =
    `${question.prompt} ${question.title} ${question.bankTitle} ${question.bankSubject} ${question.bankTopic}`.toLowerCase();
  return (
    (!searchTerm || normalized.includes(searchTerm)) &&
    matchesQuestionBankSelection(question, { grade, subject, topic: "" }) &&
    matchesGroupedTopic(question, grade, subject, topic) &&
    (!subject || question.bankSubject === subject) &&
    (difficulty === "all" || question.difficulty === difficulty) &&
    (type === "all" || question.type === type)
  );
};

export function CreateExamQuestionLibrary({
  viewerId,
  questionBankOptions,
  questionOptions,
  mode,
  disabled,
  checkedQuestionIds,
  variantCount,
  initialBankId = "",
  onQuestionsRefresh,
  onToggleChecked,
  onReplaceChecked,
  onAddSelected,
}: CreateExamQuestionLibraryProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [draftEdits, setDraftEdits] = useState<DraftEditState[]>([]);
  const [draftTemplateLabel, setDraftTemplateLabel] = useState<string | null>(null);
  const [draftsAutoFilled, setDraftsAutoFilled] = useState(false);
  const [generateError, setGenerateError] = useState<string | null>(null);
  const [createQuestion, { loading: savingDrafts }] =
    useCreateQuestionMutationMutation();
  const initialSelection = initialBankId
    ? getBankSelectionFromId(questionBankOptions, initialBankId)
    : EMPTY_BANK_SELECTION;
  const [grade, setGrade] = useState(initialSelection.grade);
  const [subject, setSubject] = useState(initialSelection.subject);
  const [topic, setTopic] = useState(initialSelection.topic);
  const [difficulty, setDifficulty] = useState("all");
  const [type, setType] = useState("all");

  const gradeOptions = getBankGradeOptions(questionBankOptions);
  const subjectOptions = getBankSubjectOptions(questionBankOptions, grade);
  const topicOptions = getGroupedTopicOptions(questionBankOptions, grade, subject);
  const filteredQuestions = useMemo(
    () =>
      questionOptions.filter(
        (question) =>
          !question.tags.includes("variant_draft:true") &&
          (mode !== ExamMode.Practice ||
            (question.type !== "ESSAY" && question.type !== "IMAGE_UPLOAD")) &&
          matchesFilter(
            question,
            searchTerm.trim().toLowerCase(),
            grade,
            subject,
            topic,
            difficulty,
            type,
          ),
      ),
    [difficulty, grade, mode, questionOptions, searchTerm, subject, topic, type],
  );
  const selectedQuestion = useMemo(
    () => questionOptions.find((question) => question.id === checkedQuestionIds[0]),
    [checkedQuestionIds, questionOptions],
  );
  const selectedQuestionSupportsVariants =
    selectedQuestion?.type === "MCQ" ||
    selectedQuestion?.type === "TRUE_FALSE" ||
    selectedQuestion?.type === "SHORT_ANSWER";
  const canGenerateVariantDrafts =
    variantCount > 1 &&
    checkedQuestionIds.length === 1 &&
    !disabled &&
    Boolean(selectedQuestionSupportsVariants) &&
    draftEdits.length === 0;

  const handleGenerateVariantDrafts = async () => {
    if (!selectedQuestion || variantCount === 1) {
      return;
    }

    try {
      setGenerateError(null);
      const result = createInitialDrafts(selectedQuestion, variantCount);
      setDraftEdits(result.drafts);
      setDraftTemplateLabel(result.templateLabel);
      setDraftsAutoFilled(result.autoFilled);
    } catch (error) {
      console.error("Failed to generate draft variants", error);
      setGenerateError("Draft хувилбар үүсгэх үед алдаа гарлаа.");
    }
  };

  const handleDiscardGeneratedDrafts = () => {
    setDraftEdits([]);
    setDraftTemplateLabel(null);
    setDraftsAutoFilled(false);
    setGenerateError(null);
  };

  const updateDraftEdit = (
    draftKey: string,
    updater: (previous: DraftEditState) => DraftEditState,
  ) => {
    setDraftEdits((current) =>
      current.map((draft) => (draft.key === draftKey ? updater(draft) : draft)),
    );
  };

  const handleUseGeneratedVariants = async () => {
    if (!selectedQuestion) {
      return;
    }

    try {
      const variantGroupId = createClientVariantGroupId();
      const createdIds: string[] = [];
      const baseTags = stripVariantTags(selectedQuestion.tags);

      for (const draft of draftEdits) {
        const created = await createQuestion({
          variables: {
            bankId: selectedQuestion.bankId,
            type: toGraphqlQuestionType(selectedQuestion.type),
            title: `${selectedQuestion.title || selectedQuestion.prompt} (${draft.label})`,
            prompt: draft.prompt.trim(),
            options: draft.options,
            correctAnswer: draft.correctAnswer,
            difficulty: toGraphqlDifficulty(selectedQuestion.difficulty),
            tags: [
              ...baseTags,
              `${VARIANT_GROUP_TAG}${variantGroupId}`,
              `${VARIANT_LABEL_TAG}${draft.label}`,
              `${VARIANT_COUNT_TAG}${draftEdits.length}`,
              DRAFT_VARIANT_TAG,
            ],
          },
        });
        if (created.data?.createQuestion?.id) {
          createdIds.push(created.data.createQuestion.id);
        }
      }

      await onQuestionsRefresh();
      onReplaceChecked(createdIds);
      setDraftEdits([]);
      setDraftTemplateLabel(null);
      setDraftsAutoFilled(false);
    } catch (error) {
      console.error("Failed to save draft variants", error);
      setGenerateError("Draft хувилбар хадгалах үед алдаа гарлаа.");
    }
  };

  const draftsReady = draftEdits.every((draft) => {
    if (!draft.prompt.trim()) {
      return false;
    }
    if (selectedQuestion?.type === "MCQ") {
      return draft.options.every((option) => option.trim()) && Boolean(draft.correctAnswer?.trim());
    }
    if (selectedQuestion?.type === "SHORT_ANSWER") {
      return Boolean(draft.correctAnswer?.trim());
    }
    return true;
  });

  return (
    <div className="flex h-full flex-col">
      <div className="space-y-4">
        <input
          type="search"
          className="w-full rounded-xl border border-[#DFE1E5] px-4 py-3 text-[14px] text-[#0F1216]"
          placeholder="Асуулт хайх..."
          value={searchTerm}
          onChange={(event) => setSearchTerm(event.target.value)}
          disabled={disabled}
        />
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-5">
          <select
            value={grade}
            onChange={(event) => {
              setGrade(event.target.value);
              setSubject("");
              setTopic("");
            }}
            disabled={disabled || Boolean(initialBankId)}
            className="rounded-xl border border-[#DFE1E5] px-4 py-3 text-[14px]"
          >
            <option value="">Бүх анги</option>
            {gradeOptions.map((option) => (
              <option key={option} value={option}>
                {option}-р анги
              </option>
            ))}
          </select>
          <select
            value={subject}
            onChange={(event) => {
              setSubject(event.target.value);
              setTopic("");
            }}
            disabled={disabled || Boolean(initialBankId) || !grade}
            className="rounded-xl border border-[#DFE1E5] px-4 py-3 text-[14px]"
          >
            <option value="">Бүх хичээл</option>
            {subjectOptions.map((option) => <option key={option} value={option}>{option}</option>)}
          </select>
          <select
            value={topic}
            onChange={(event) => setTopic(event.target.value)}
            disabled={disabled || Boolean(initialBankId) || !subject}
            className="rounded-xl border border-[#DFE1E5] px-4 py-3 text-[14px]"
          >
            <option value="">Бүх сэдэв</option>
            {topicOptions.map((option) => <option key={option} value={option}>{option}</option>)}
          </select>
          <select value={difficulty} onChange={(event) => setDifficulty(event.target.value)} className="rounded-xl border border-[#DFE1E5] px-4 py-3 text-[14px]">
            <option value="all">Бүх түвшин</option>
            <option value="EASY">Хялбар</option>
            <option value="MEDIUM">Дунд</option>
            <option value="HARD">Хүнд</option>
          </select>
          <select value={type} onChange={(event) => setType(event.target.value)} className="rounded-xl border border-[#DFE1E5] px-4 py-3 text-[14px]">
            <option value="all">Бүх төрөл</option>
            <option value="MCQ">Олон сонголт</option>
            <option value="TRUE_FALSE">Үнэн/Худал</option>
            <option value="SHORT_ANSWER">Тоо бодолт</option>
            {mode !== ExamMode.Practice ? (
              <>
                <option value="ESSAY">Задгай даалгавар</option>
                <option value="IMAGE_UPLOAD">Зураг оруулах</option>
              </>
            ) : null}
          </select>
        </div>

        {mode === ExamMode.Practice ? (
          <p className="text-[12px] text-[#667085]">
            Practice mode дээр зөвхөн автоматаар үнэлэгдэх асуултууд харагдана.
          </p>
        ) : null}
      </div>

      {variantCount > 1 ? (
        <div className="mt-4 rounded-xl border border-[#DFE1E5] bg-[#F8FAFC] p-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <p className="text-[14px] font-medium text-[#0F1216]">
                Draft хувилбар үүсгэх
              </p>
              <p className="mt-1 text-[12px] text-[#52555B]">
                1 эх асуулт сонгоод {variantCount} хувилбарын draft бэлдэнэ. Танигдсан math
                template байвал system утгатай хувилбаруудыг урьдчилж бөглөнө.
              </p>
            </div>
            <button
              type="button"
              className="rounded-lg bg-[#163D99] px-3 py-2 text-[13px] font-medium text-white disabled:cursor-not-allowed disabled:opacity-60"
              disabled={!canGenerateVariantDrafts || savingDrafts}
              onClick={() => void handleGenerateVariantDrafts()}
            >
              {savingDrafts ? "Түр хүлээнэ үү..." : `${variantCount} хувилбарын draft бэлдэх`}
            </button>
          </div>
          {checkedQuestionIds.length === 1 && !selectedQuestionSupportsVariants ? (
            <p className="mt-3 text-[12px] text-[#B42318]">
              Зөвхөн олон сонголт, үнэн/худал, тоо бодолтын асуултад draft хувилбар үүсгэнэ.
            </p>
          ) : null}
          {draftEdits.length ? (
            <p className="mt-3 text-[12px] text-[#52555B]">
              Эдгээр нь одоогоор зөвхөн create exam доторх local draft байна. Батлах хүртэл санд
              хадгалагдахгүй.
            </p>
          ) : null}
          {draftEdits.length && draftTemplateLabel ? (
            <p className="mt-3 text-[12px] text-[#163D99]">
              Илэрсэн template: <span className="font-medium">{draftTemplateLabel}</span>.{" "}
              {draftsAutoFilled
                ? "B/C/D хувилбаруудыг system урьдчилж бөглөсөн, review хийгээд батална."
                : "Template танигдсан ч гар аргаар нэмж засварлана."}
            </p>
          ) : null}
          {draftEdits.length && !draftTemplateLabel ? (
            <p className="mt-3 text-[12px] text-[#52555B]">
              Энэ асуултад найдвартай template танигдаагүй тул хоосон draft form гаргалаа.
            </p>
          ) : null}
          {generateError ? (
            <p className="mt-3 text-[12px] text-[#B42318]">{generateError}</p>
          ) : null}
          {draftEdits.length ? (
            <div className="mt-4 space-y-3">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <p className="text-[13px] font-medium text-[#0F1216]">Draft review</p>
                  <p className="text-[12px] text-[#52555B]">
                    Батлахын өмнө хувилбаруудаа бөглөж, засаж, дараа нь энэ шалгалтад нэмнэ.
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    className="rounded-lg border border-[#D0D5DD] px-3 py-2 text-[13px] font-medium text-[#344054]"
                    onClick={handleDiscardGeneratedDrafts}
                  >
                    Draft-уудыг болих
                  </button>
                  <button
                    type="button"
                    className="rounded-lg border border-[#163D99] px-3 py-2 text-[13px] font-medium text-[#163D99]"
                    onClick={() => void handleUseGeneratedVariants()}
                    disabled={savingDrafts || !draftsReady}
                  >
                    {savingDrafts ? "Хадгалж байна..." : "Энэ хувилбаруудыг сонгох"}
                  </button>
                </div>
              </div>
              <div className="space-y-3">
                {draftEdits.map((draft) => (
                  <div
                    key={draft.key}
                    className="rounded-xl border border-[#D0D5DD] bg-white p-4"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <p className="text-[13px] font-semibold text-[#163D99]">
                          {`${draft.label} хувилбар`}
                        </p>
                        <textarea
                          value={draft.prompt}
                          onChange={(event) =>
                            updateDraftEdit(draft.key, (previous) => ({
                              ...previous,
                              prompt: event.target.value,
                            }))
                          }
                          className="mt-1 min-h-20 w-full rounded-md border border-[#D0D5DD] px-3 py-2 text-[14px] text-[#0F1216]"
                        />
                      </div>
                      <span className="rounded-full border border-[#B7E0BA] bg-[#ECFDF3] px-2 py-0.5 text-[12px] text-[#16A34A]">
                        {selectedQuestion ? getDifficultyLabel(selectedQuestion.difficulty) : ""}
                      </span>
                    </div>
                    {draft.options.length ? (
                      <div className="mt-3 space-y-1">
                        {draft.options.map((option, index) => (
                          <div
                            key={`${draft.key}-${index}`}
                            className="flex items-center gap-2 rounded-md bg-[#F8FAFC] px-3 py-2"
                          >
                            <input
                              type="radio"
                              name={`correct-${draft.key}`}
                              checked={option === draft.correctAnswer}
                              onChange={() =>
                                updateDraftEdit(draft.key, (previous) => ({
                                  ...previous,
                                  correctAnswer: option,
                                }))
                              }
                            />
                            <input
                              value={option}
                              onChange={(event) =>
                                updateDraftEdit(draft.key, (previous) => {
                                  const nextOptions = [...previous.options];
                                  nextOptions[index] = event.target.value;
                                  const previousCorrect = previous.options[index];
                                  return {
                                    ...previous,
                                    options: nextOptions,
                                    correctAnswer:
                                      previous.correctAnswer === previousCorrect
                                        ? event.target.value
                                        : previous.correctAnswer,
                                  };
                                })
                              }
                              className={[
                                "w-full rounded-md border px-3 py-2 text-[12px]",
                                option === draft.correctAnswer
                                  ? "border-[#16A34A] bg-[#ECFDF3] text-[#166534]"
                                  : "border-[#D0D5DD] bg-white text-[#344054]",
                              ].join(" ")}
                            />
                          </div>
                        ))}
                      </div>
                    ) : selectedQuestion?.type === "SHORT_ANSWER" ? (
                      <div className="mt-3 rounded-md bg-[#ECFDF3] px-3 py-2 text-[12px] text-[#166534]">
                        <p className="mb-2 font-medium">Зөв хариу</p>
                        <input
                          value={draft.correctAnswer ?? ""}
                          onChange={(event) =>
                            updateDraftEdit(draft.key, (previous) => ({
                              ...previous,
                              correctAnswer: event.target.value,
                            }))
                          }
                          className="w-full rounded-md border border-[#16A34A] bg-white px-3 py-2 text-[12px] text-[#166534]"
                        />
                      </div>
                    ) : null}
                  </div>
                ))}
              </div>
            </div>
          ) : null}
        </div>
      ) : null}

      <div className="mt-4 flex-1 space-y-3 overflow-y-auto">
        {filteredQuestions.map((question) => {
          const checked = checkedQuestionIds.includes(question.id);
          const ownsQuestion =
            question.createdById === viewerId || question.bankOwnerId === viewerId;
          const requestStatus = question.accessRequestStatus;
          const requiresApproval = question.requiresAccessRequest && !ownsQuestion;
          const canSelect = !requiresApproval || requestStatus === "APPROVED";
          const accessBadgeLabel =
            requiresApproval && requestStatus === "APPROVED"
              ? "Зөвшөөрөгдсөн"
              : requiresApproval && requestStatus === "PENDING"
                ? "Хүсэлт хүлээгдэж байна"
                : requiresApproval && requestStatus === "REJECTED"
                  ? "Хүсэлт татгалзсан"
                  : requiresApproval
                    ? "Зөвшөөрөл шаардлагатай"
                    : null;
          return (
            <button
              key={question.id}
              type="button"
              onClick={() => {
                if (!canSelect) {
                  return;
                }
                onToggleChecked(question.id);
              }}
              className={[
                "w-full rounded-xl border px-4 py-4 text-left transition",
                checked
                  ? "border-[#B8CFFF] bg-[#EEF4FF]"
                  : requiresApproval && requestStatus !== "APPROVED"
                    ? "border-[#FECACA] bg-[#FEF2F2]"
                  : "border-[#DFE1E5] bg-white",
              ].join(" ")}
            >
              <div className="flex items-start gap-4">
                <div
                  className={[
                    "mt-1 h-7 w-7 rounded-md border",
                    checked
                      ? "border-[#5B7CFF] bg-[#5B7CFF]"
                      : requiresApproval && requestStatus !== "APPROVED"
                        ? "border-[#FCA5A5] bg-white"
                        : "border-[#D0D5DD] bg-white",
                  ].join(" ")}
                />
                <div>
                  <p className="text-[14px] font-medium text-[#0F1216]">{formatQuestionText(question)}</p>
                  <div className="mt-2 flex flex-wrap gap-2 text-[12px]">
                    <span className="rounded-full border border-[#DFE1E5] px-2 py-0.5">
                      {getQuestionTypeLabel(question.type)}
                    </span>
                    <span className="rounded-full bg-[#DCEBFF] px-2 py-0.5 text-[#174EA6]">{question.bankSubject}</span>
                    <span className="rounded-full border border-[#DFE1E5] px-2 py-0.5 text-[#344054]">
                      {getCurriculumTopicGroupName(
                        question.bankGrade,
                        question.bankSubject,
                        question.bankTopic,
                      )}
                    </span>
                    <span className="rounded-full border border-[#B7E0BA] bg-[#ECFDF3] px-2 py-0.5 text-[#16A34A]">
                      {getDifficultyLabel(question.difficulty)}
                    </span>
                    {accessBadgeLabel ? (
                      <span
                        className={[
                          "rounded-full border px-2 py-0.5",
                          requestStatus === "APPROVED"
                            ? "border-[#B7E0BA] bg-[#ECFDF3] text-[#16A34A]"
                            : requestStatus === "PENDING"
                              ? "border-[#D6BBFB] bg-[#F4EBFF] text-[#7A2EAB]"
                              : "border-[#FECACA] bg-[#FEF2F2] text-[#B42318]",
                        ].join(" ")}
                      >
                        {accessBadgeLabel}
                      </span>
                    ) : null}
                  </div>
                  {requiresApproval && requestStatus !== "APPROVED" ? (
                    <div className="mt-2 text-[12px] text-[#B42318]">
                      {requestStatus === "PENDING"
                        ? "Энэ асуултын хүсэлт хүлээгдэж байна. Зөвшөөрөгдмөгц шууд ашиглаж болно."
                        : requestStatus === "REJECTED"
                          ? "Энэ асуултын өмнөх хүсэлт татгалзсан байна. Дахин ашиглах бол асуултын сангийн дэлгэрэнгүйгээс хүсэлтээ шинэчилнэ үү."
                          : "Энэ асуултыг шалгалтад ашиглахын өмнө эзэмшигчийн зөвшөөрөл авна. Асуултын сангийн дэлгэрэнгүй рүү орж хүсэлт илгээнэ үү."}
                    </div>
                  ) : null}
                </div>
              </div>
            </button>
          );
        })}
      </div>

      <div className="pt-4">
        <button
          type="button"
          className="w-full cursor-pointer rounded-xl bg-[#163D99] px-4 py-3 text-[16px] font-medium text-white disabled:cursor-not-allowed disabled:opacity-60"
          onClick={onAddSelected}
          disabled={!checkedQuestionIds.length || disabled}
        >
          {checkedQuestionIds.length
            ? `${checkedQuestionIds.length} асуулт нэмэх`
            : "Асуулт нэмэх"}
        </button>
      </div>
    </div>
  );
}
