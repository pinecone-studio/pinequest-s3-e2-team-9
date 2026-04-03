/* eslint-disable max-lines */
"use client";

import Link from "next/link";
import { MenuIcon, ChevronDownIcon, PlusIcon, SearchIcon } from "../icons-more";
import {
  formatRepositoryKindLabel,
  formatGradeLabel,
  type QuestionBankItem,
} from "../question-bank-utils";

const SELECT_STYLE =
  "h-9 w-full cursor-pointer appearance-none rounded-md border border-[#DFE1E5] bg-white px-3 pr-9 text-[14px] text-[#0F1216] shadow-[0px_1px_2px_rgba(0,0,0,0.05)] disabled:bg-[#F8FAFC] disabled:text-[#98A2B3]";

export const QuestionBankTabButton = ({
  active,
  label,
  onClick,
}: {
  active: boolean;
  label: string;
  onClick: () => void;
}) => (
  <button
    type="button"
    onClick={onClick}
    className={`inline-flex h-9 items-center rounded-full border px-4 text-[14px] font-medium transition ${
      active
        ? "border-[#6434F8] bg-[#6434F8] text-white"
        : "border-[#DFE1E5] bg-white text-[#344054] hover:border-[#BFC5D0]"
    }`}
  >
    {label}
  </button>
);

export const QuestionBankFilterSelect = ({
  options,
  value,
  placeholder,
  disabled,
  onChange,
}: {
  options: string[];
  value: string;
  placeholder: string;
  disabled?: boolean;
  onChange: (value: string) => void;
}) => (
  <label className="relative block min-w-[150px]">
    <select
      value={value}
      disabled={disabled}
      onChange={(event) => onChange(event.target.value)}
      className={SELECT_STYLE}
    >
      <option value="">{placeholder}</option>
      {options.map((option) => (
        <option key={option} value={option}>
          {option}
        </option>
      ))}
    </select>
    <ChevronDownIcon className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#52555B]" />
  </label>
);

export function QuestionBankTopicGrid({
  topics,
  grade,
  subject,
  onSelectTopic,
}: {
  topics: Array<{
    name: string;
    bankCount: number;
    questionCount: number;
    subtopics: string[];
  }>;
  grade: string;
  subject: string;
  onSelectTopic: (topic: string) => void;
}) {
  return (
    <div className="space-y-3">
      <div>
        <h2 className="text-[18px] font-semibold text-[#101828]">
          {`${grade}-р анги ${subject}`}
        </h2>
        <p className="mt-1 text-[14px] text-[#667085]">
          Энэ category доторх дэд сэдвүүдээс сонгоод тухайн сэдвийн сангууд руу орно.
        </p>
      </div>
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {topics.map((topic) => (
          <button
            key={topic.name}
            type="button"
            onClick={() => onSelectTopic(topic.name)}
            className="rounded-xl border border-[#DFE1E5] bg-white p-5 text-left shadow-[0px_1px_3px_rgba(0,0,0,0.1),0px_1px_2px_-1px_rgba(0,0,0,0.1)] transition hover:-translate-y-0.5 hover:shadow-[0px_8px_24px_rgba(15,18,22,0.08)]"
          >
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[#FFF4ED] text-[#B54708]">
              <MenuIcon className="h-5 w-5" />
            </div>
            <h3 className="mt-4 text-[16px] font-medium text-[#0F1216]">{topic.name}</h3>
            <p className="mt-1 text-[14px] text-[#667085]">
              {topic.bankCount > 1
                ? `${topic.bankCount} сан, ${topic.questionCount} асуулт`
                : `${topic.questionCount} асуулт`}
            </p>
            {topic.subtopics.length ? (
              <div className="mt-3 flex flex-wrap gap-2">
                {topic.subtopics.map((subtopic) => (
                  <span
                    key={`${topic.name}-${subtopic}`}
                    className="rounded-full bg-[#F2F4F7] px-2.5 py-1 text-[12px] font-medium text-[#344054]"
                  >
                    {subtopic}
                  </span>
                ))}
              </div>
            ) : null}
            <p className="mt-3 text-[13px] font-medium text-[#6434F8]">
              Энэ дэд сэдвийг нээх
            </p>
          </button>
        ))}
      </div>
    </div>
  );
}

export function QuestionBankBrowseGrid({
  title,
  description,
  items,
  onSelect,
}: {
  title: string;
  description: string;
  items: Array<{ key: string; label: string; subtitle: string }>;
  onSelect: (key: string) => void;
}) {
  return (
    <div className="space-y-3">
      <div>
        <h2 className="text-[18px] font-semibold text-[#101828]">{title}</h2>
        <p className="mt-1 text-[14px] text-[#667085]">{description}</p>
      </div>
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {items.map((item) => (
          <button
            key={item.key}
            type="button"
            onClick={() => onSelect(item.key)}
            className="rounded-xl border border-[#DFE1E5] bg-white p-5 text-left shadow-[0px_1px_3px_rgba(0,0,0,0.1),0px_1px_2px_-1px_rgba(0,0,0,0.1)] transition hover:-translate-y-0.5 hover:shadow-[0px_8px_24px_rgba(15,18,22,0.08)]"
          >
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[#F3E8FF] text-[#6434F8]">
              <MenuIcon className="h-5 w-5" />
            </div>
            <h3 className="mt-4 text-[16px] font-medium text-[#0F1216]">{item.label}</h3>
            <p className="mt-1 text-[14px] text-[#667085]">{item.subtitle}</p>
            <p className="mt-3 text-[13px] font-medium text-[#6434F8]">Нээх</p>
          </button>
        ))}
      </div>
    </div>
  );
}

export function QuestionBankFilterPanel({
  gradeOptions,
  grade,
  subjectOptions,
  subject,
  topicOptions,
  topic,
  search,
  selectedPathLabel,
  onGradeChange,
  onSubjectChange,
  onTopicChange,
  onSearchChange,
}: {
  gradeOptions: string[];
  grade: string;
  subjectOptions: string[];
  subject: string;
  topicOptions: string[];
  topic: string;
  search: string;
  selectedPathLabel: string;
  onGradeChange: (value: string) => void;
  onSubjectChange: (value: string) => void;
  onTopicChange: (value: string) => void;
  onSearchChange: (value: string) => void;
}) {
  return (
    <div className="rounded-xl border border-[#DFE1E5] bg-white p-5 shadow-[0px_1px_3px_rgba(0,0,0,0.1),0px_1px_2px_-1px_rgba(0,0,0,0.1)]">
      <div className="mb-4 flex flex-wrap items-center gap-2 text-[13px] text-[#667085]">
        <span className="rounded-full bg-[#F3E8FF] px-3 py-1 font-medium text-[#6434F8]">
          1. Анги сонгоно
        </span>
        <span className="rounded-full bg-[#F3E8FF] px-3 py-1 font-medium text-[#6434F8]">
          2. Хичээл сонгоно
        </span>
        <span className="rounded-full bg-[#F3E8FF] px-3 py-1 font-medium text-[#6434F8]">
          3. Дэд сэдэв сонгоно
        </span>
      </div>
      <div className="flex flex-col gap-3 lg:flex-row">
        <QuestionBankFilterSelect
          options={gradeOptions.map((value) => `${value}-р анги`)}
          value={grade ? `${grade}-р анги` : ""}
          placeholder="Анги сонгох"
          onChange={onGradeChange}
        />
        <QuestionBankFilterSelect
          options={subjectOptions}
          value={subject}
          placeholder="Хичээл сонгох"
          disabled={!grade}
          onChange={onSubjectChange}
        />
        <QuestionBankFilterSelect
          options={topicOptions}
          value={topic}
          placeholder="Дэд сэдэв сонгох"
          disabled={!grade || !subject}
          onChange={onTopicChange}
        />
        <label className="relative block flex-1">
          <span className="sr-only">Асуултын сан хайх</span>
          <SearchIcon className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#52555B]" />
          <input
            type="text"
            value={search}
            onChange={(event) => onSearchChange(event.target.value)}
            placeholder="Сангийн нэрээр хайх..."
            className="h-9 w-full rounded-md border border-[#DFE1E5] bg-white px-9 text-[14px] text-[#0F1216] shadow-[0px_1px_2px_rgba(0,0,0,0.05)] placeholder:text-[#52555B]"
          />
        </label>
      </div>
      <p className="mt-4 text-[13px] text-[#667085]">
        Одоогийн сонголт:{" "}
        <span className="font-medium text-[#344054]">{selectedPathLabel}</span>
      </p>
    </div>
  );
}

export function QuestionBankEmptyState({
  grade,
  subject,
  topic,
  selectedPathLabel,
  onCreate,
}: {
  grade: string;
  subject: string;
  topic: string;
  selectedPathLabel: string;
  onCreate: () => void;
}) {
  return (
    <div className="rounded-xl border border-dashed border-[#D0D5DD] bg-white p-8 text-center">
      <h2 className="text-[18px] font-semibold text-[#101828]">
        Энэ сонголт дээр асуултын сан алга байна
      </h2>
      <p className="mt-2 text-[14px] text-[#667085]">
        {grade && subject && topic
          ? `${selectedPathLabel} дээр шинэ bank үүсгээд асуултаа нэмж эхэлж болно.`
          : "Асуултын сангаа нарийсгахын тулд анги, хичээл, дэд сэдвээ сонгоно уу."}
      </p>
      {grade && subject && topic ? (
        <button
          type="button"
          onClick={onCreate}
          className="mt-4 inline-flex items-center gap-2 rounded-md bg-[#6434F8] px-4 py-2 text-[14px] font-medium text-white"
        >
          <PlusIcon className="h-4 w-4" />
          Энэ сэдэвт сан үүсгэх
        </button>
      ) : null}
    </div>
  );
}

export function QuestionBankGrid({
  items,
  loading,
  skeletons,
  categoryLabel = "",
  showCategoryContext = false,
  onSelectItem,
}: {
  items: QuestionBankItem[];
  loading: boolean;
  skeletons: number[];
  categoryLabel?: string;
  showCategoryContext?: boolean;
  onSelectItem?: (item: QuestionBankItem) => void;
}) {
  return (
    <div className="space-y-4">
      {showCategoryContext && categoryLabel ? (
        <div>
          <h2 className="text-[18px] font-semibold text-[#101828]">{categoryLabel}</h2>
          <p className="mt-1 text-[14px] text-[#667085]">
            Энэ category доторх сангууд дэд сэдвээрээ харагдаж байна.
          </p>
        </div>
      ) : null}
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {loading
          ? skeletons.map((item) => (
              <div
                key={item}
                className="rounded-xl border border-[#DFE1E5] bg-white p-5 shadow-[0px_1px_3px_rgba(0,0,0,0.1),0px_1px_2px_-1px_rgba(0,0,0,0.1)]"
              >
                <div className="animate-pulse">
                  <div className="flex items-start justify-between">
                    <div className="h-10 w-10 rounded-lg bg-[#E9EDF3]" />
                    <div className="h-7 w-24 rounded-md bg-[#E9EDF3]" />
                  </div>
                  <div className="mt-4 h-5 w-2/3 rounded bg-[#E9EDF3]" />
                  <div className="mt-2 h-4 w-full rounded bg-[#E9EDF3]" />
                  <div className="mt-2 h-4 w-5/6 rounded bg-[#E9EDF3]" />
                  <div className="mt-4 h-4 w-1/2 rounded bg-[#E9EDF3]" />
                  <div className="mt-4 flex items-center justify-between">
                    <div className="h-4 w-20 rounded bg-[#E9EDF3]" />
                    <div className="h-4 w-24 rounded bg-[#E9EDF3]" />
                  </div>
                </div>
              </div>
            ))
          : null}
        {items.map((item) => {
          const content = (
            <>
              <div className="flex items-start justify-between gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[#1922301A] text-[#192230]">
                  <MenuIcon className="h-5 w-5" />
                </div>
                <span
                  className={`rounded-md px-2.5 py-1 text-[12px] font-medium ${
                    item.repositoryKind === "UNIFIED"
                      ? "bg-[#ECFDF3] text-[#027A48]"
                      : "bg-[#F3E8FF] text-[#6434F8]"
                  }`}
                >
                  {formatRepositoryKindLabel(item.repositoryKind)}
                </span>
              </div>
              <h3 className="mt-4 text-[16px] font-medium text-[#0F1216]">
                {showCategoryContext ? item.displayTitle : item.title}
              </h3>
              <p className="mt-1 text-[14px] text-[#52555B]">{item.description}</p>
              <div className="mt-3 flex flex-wrap gap-2">
                {showCategoryContext ? (
                  (item.subtopics?.length ? item.subtopics : [item.displayTitle]).map((subtopic) => (
                    <span
                      key={`${item.id}-${subtopic}`}
                      className="rounded-md bg-[#FFF4ED] px-2.5 py-1 text-[12px] font-medium text-[#B54708]"
                    >
                      {subtopic}
                    </span>
                  ))
                ) : (
                  <>
                    <span className="rounded-md bg-[#F2F4F7] px-2.5 py-1 text-[12px] font-medium text-[#344054]">
                      {formatGradeLabel(item.grade)}
                    </span>
                    <span className="rounded-md bg-[#F2F4F7] px-2.5 py-1 text-[12px] font-medium text-[#344054]">
                      {item.subject}
                    </span>
                    <span className="rounded-md bg-[#FFF4ED] px-2.5 py-1 text-[12px] font-medium text-[#B54708]">
                      {item.topic !== "Ерөнхий" ? item.topic : item.topics[0] ?? "Ерөнхий сэдэв"}
                    </span>
                  </>
                )}
              </div>
              <p className="mt-3 text-[13px] text-[#667085]">
                {item.repositoryKind === "UNIFIED"
                  ? `Нэгдсэн сан · ${item.ownerName}`
                  : "Зөвхөн танд харагдана"}
              </p>
              <div className="mt-4 flex items-center justify-between text-[14px] text-[#52555B]">
                <span>{item.questions}</span>
                <span>{item.date}</span>
              </div>
            </>
          );

          const className =
            "relative block cursor-pointer rounded-xl border border-[#DFE1E5] bg-white p-5 text-left shadow-[0px_1px_3px_rgba(0,0,0,0.1),0px_1px_2px_-1px_rgba(0,0,0,0.1)] transition hover:-translate-y-0.5 hover:shadow-[0px_8px_24px_rgba(15,18,22,0.08)]";

          if (onSelectItem) {
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => onSelectItem(item)}
                className={className}
              >
                {content}
              </button>
            );
          }

          return (
            <Link
              key={item.id}
              href={`/question-bank/${item.id}`}
              className={className}
            >
              {content}
            </Link>
          );
        })}
      </div>
    </div>
  );
}
