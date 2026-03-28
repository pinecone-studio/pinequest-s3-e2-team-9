/* eslint-disable max-lines */
"use client";

import { useMemo, useState } from "react";
import { getCurriculumTopicGroupName, getCurriculumTopicGroups } from "../components/question-bank-curriculum";
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
  ESSAY: "Задгай хариулт",
};

const DIFFICULTY_LABELS: Record<string, string> = {
  EASY: "Хялбар",
  MEDIUM: "Дунд",
  HARD: "Хүнд",
};

type CreateExamQuestionLibraryProps = {
  questionBankOptions: CreateExamQuestionBankOption[];
  questionOptions: CreateExamQuestionOption[];
  disabled: boolean;
  checkedQuestionIds: string[];
  initialBankId?: string;
  onToggleChecked: (questionId: string) => void;
  onAddSelected: () => void;
};

const formatQuestionText = (question: CreateExamQuestionOption) => {
  const source = question.prompt.trim() || question.title.trim();
  return source.length > 110 ? `${source.slice(0, 107)}...` : source;
};

const getQuestionTypeLabel = (type: string) => QUESTION_TYPE_LABELS[type] ?? type;

const getDifficultyLabel = (difficulty: string) =>
  DIFFICULTY_LABELS[difficulty] ?? difficulty;

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
  questionBankOptions,
  questionOptions,
  disabled,
  checkedQuestionIds,
  initialBankId = "",
  onToggleChecked,
  onAddSelected,
}: CreateExamQuestionLibraryProps) {
  const [searchTerm, setSearchTerm] = useState("");
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
      questionOptions.filter((question) =>
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
    [difficulty, grade, questionOptions, searchTerm, subject, topic, type],
  );

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
            <option value="ESSAY">Задгай хариулт</option>
          </select>
        </div>
      </div>

      <div className="mt-4 flex-1 space-y-3 overflow-y-auto">
        {filteredQuestions.map((question) => {
          const checked = checkedQuestionIds.includes(question.id);
          return (
            <button
              key={question.id}
              type="button"
              onClick={() => onToggleChecked(question.id)}
              className={[
                "w-full rounded-xl border px-4 py-4 text-left transition",
                checked
                  ? "border-[#B8CFFF] bg-[#EEF4FF]"
                  : "border-[#DFE1E5] bg-white",
              ].join(" ")}
            >
              <div className="flex items-start gap-4">
                <div className={["mt-1 h-7 w-7 rounded-md border", checked ? "border-[#5B7CFF] bg-[#5B7CFF]" : "border-[#D0D5DD] bg-white"].join(" ")} />
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
                  </div>
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
