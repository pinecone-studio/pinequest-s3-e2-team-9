"use client";

import { QuestionBankVisibility } from "@/graphql/generated";
import { QuestionBankDialogSelect } from "./question-bank-dialog-fields";

export function QuestionBankCreateDialogForm({
  grade,
  subject,
  topic,
  title,
  description,
  visibility,
  gradeOptions,
  subjectOptions,
  topicOptions,
  onGradeChange,
  onSubjectChange,
  onTopicChange,
  onTitleChange,
  onDescriptionChange,
  onVisibilityChange,
}: {
  grade: string;
  subject: string;
  topic: string;
  title: string;
  description: string;
  visibility: QuestionBankVisibility;
  gradeOptions: string[];
  subjectOptions: string[];
  topicOptions: string[];
  onGradeChange: (value: string) => void;
  onSubjectChange: (value: string) => void;
  onTopicChange: (value: string) => void;
  onTitleChange: (value: string) => void;
  onDescriptionChange: (value: string) => void;
  onVisibilityChange: (value: QuestionBankVisibility) => void;
}) {
  return (
    <>
      <div className="grid gap-3 sm:grid-cols-3">
        <label className="block space-y-2">
          <span className="text-[12px] font-medium text-[#52555B]">Анги</span>
          <QuestionBankDialogSelect value={grade} onChange={onGradeChange}>
            <option value="">Анги сонгох</option>
            {gradeOptions.map((option) => (
              <option key={option} value={option}>
                {option}-р анги
              </option>
            ))}
          </QuestionBankDialogSelect>
        </label>
        <label className="block space-y-2">
          <span className="text-[12px] font-medium text-[#52555B]">Хичээл</span>
          <QuestionBankDialogSelect
            disabled={!grade}
            value={subject}
            onChange={onSubjectChange}
          >
            <option value="">Хичээл сонгох</option>
            {subjectOptions.map((option) => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </QuestionBankDialogSelect>
        </label>
        <label className="block space-y-2">
          <span className="text-[12px] font-medium text-[#52555B]">Дэд сэдэв</span>
          <QuestionBankDialogSelect
            disabled={!grade || !subject}
            value={topic}
            onChange={onTopicChange}
          >
            <option value="">Дэд сэдэв сонгох</option>
            {topicOptions.map((option) => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </QuestionBankDialogSelect>
        </label>
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        <label className="block space-y-2">
          <span className="text-[12px] font-medium text-[#52555B]">Сангийн нэр</span>
          <input
            value={title}
            onChange={(event) => onTitleChange(event.target.value)}
            placeholder="Жишээ: 10-р анги Математик · Алгебр"
            className="h-10 w-full rounded-md border border-[#DFE1E5] bg-white px-3 text-[14px] text-[#0F1216] shadow-[0px_1px_2px_rgba(0,0,0,0.05)] placeholder:text-[#98A2B3]"
          />
        </label>
        <label className="block space-y-2">
          <span className="text-[12px] font-medium text-[#52555B]">Харагдах байдал</span>
          <QuestionBankDialogSelect
            value={visibility}
            onChange={(value) => onVisibilityChange(value as QuestionBankVisibility)}
          >
            <option value={QuestionBankVisibility.Private}>Миний сан</option>
            <option value={QuestionBankVisibility.Public}>Нэгдсэн сан</option>
          </QuestionBankDialogSelect>
        </label>
      </div>

      <label className="block space-y-2">
        <span className="text-[12px] font-medium text-[#52555B]">Тайлбар</span>
        <textarea
          value={description}
          onChange={(event) => onDescriptionChange(event.target.value)}
          placeholder="Энэ сэдвийн санг ямар зорилгоор ашиглах вэ?"
          className="min-h-24 w-full rounded-md border border-[#DFE1E5] bg-white px-3 py-2 text-[14px] text-[#0F1216] shadow-[0px_1px_2px_rgba(0,0,0,0.05)] placeholder:text-[#98A2B3]"
        />
      </label>
    </>
  );
}
