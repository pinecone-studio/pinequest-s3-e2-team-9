import type { Difficulty, QuestionType } from "@/graphql/generated";
import { difficultyOptions, questionTypeOptions } from "../components/sections/question-bank-dialog-config";
import { ChevronDownIcon, UploadIcon } from "./create-exam-icons";
import type { CreateExamQuestionBankOption } from "./create-exam-types";

type CreateExamQuestionComposerMetaProps = {
  bankOptions: CreateExamQuestionBankOption[];
  bankId: string;
  difficulty: Difficulty;
  disabled: boolean;
  loading: boolean;
  points: string;
  questionType: QuestionType;
  onBankIdChange: (value: string) => void;
  onDifficultyChange: (value: Difficulty) => void;
  onPointsChange: (value: string) => void;
  onQuestionTypeChange: (value: QuestionType) => void;
};

const SELECT_CLASS_NAME =
  "h-9 appearance-none rounded-[6px] border border-[#DFE1E5] bg-white px-[11.8px] pr-9 text-[14px] leading-5 shadow-[0px_1px_2px_rgba(0,0,0,0.05)] outline-none";

export function CreateExamQuestionComposerMeta({
  bankOptions,
  bankId,
  difficulty,
  disabled,
  loading,
  points,
  questionType,
  onBankIdChange,
  onDifficultyChange,
  onPointsChange,
  onQuestionTypeChange,
}: CreateExamQuestionComposerMetaProps) {
  const bankValue = bankId || "";

  return (
    <div className="space-y-6">
      <div className="space-y-3">
        <p className="text-[12px] font-medium uppercase tracking-[0.3px] leading-4 text-[#52555B]">
          Media (optional)
        </p>
        <div className="grid gap-4 md:grid-cols-2">
          {["Upload Image", "Upload Video"].map((label) => (
            <button
              key={label}
              type="button"
              className="flex h-[75.2px] flex-col items-center justify-center gap-1 rounded-[8px] border border-dashed border-[#DFE1E5] bg-white px-[16.6px] py-[16.6px] text-[12px] leading-4 text-[#52555B]"
            >
              <UploadIcon className="h-5 w-5" />
              {label}
            </button>
          ))}
        </div>
      </div>

      <div className="flex items-center justify-between rounded-[8px] border border-[rgba(111,144,255,0.3)] bg-[rgba(111,144,255,0.05)] px-[11.8px] py-[11.8px]">
        <p className="text-[14px] font-medium leading-5 text-[#0F1216]">
          Points for this question
        </p>
        <div className="flex items-center gap-2">
          <input
            value={points}
            onChange={(event) => onPointsChange(event.target.value)}
            disabled={disabled || loading}
            inputMode="numeric"
            className="h-10 w-24 rounded-[6px] border border-[#DFE1E5] bg-white px-[11.8px] text-center text-[14px] font-semibold leading-[18px] text-[#0F1216] shadow-[0px_1px_2px_rgba(0,0,0,0.05)] outline-none"
          />
          <span className="text-[14px] leading-5 text-[#52555B]">pts</span>
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-4 xl:h-9 xl:gap-[101px]">
        <label className="relative block w-[141.6px]">
          <select
            value={questionType}
            onChange={(event) => onQuestionTypeChange(event.target.value as QuestionType)}
            className={`${SELECT_CLASS_NAME} w-[141.6px] text-[#0F1216]`}
            disabled={disabled || loading}
          >
            {questionTypeOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label === "Сонгох" ? "Multiple Choice" : option.label}
              </option>
            ))}
          </select>
          <ChevronDownIcon className="pointer-events-none absolute right-[11.8px] top-1/2 h-4 w-4 -translate-y-1/2 text-[#52555B] opacity-50" />
        </label>

        <label className="relative block w-[90.6px]">
          <select
            value={bankValue}
            onChange={(event) => onBankIdChange(event.target.value)}
            className={`${SELECT_CLASS_NAME} w-[90.6px] text-[#52555B]`}
            disabled={disabled || loading}
          >
            <option value="" disabled>
              Subject
            </option>
            {bankOptions.map((option) => (
              <option key={option.id} value={option.id}>
                {option.subject}
              </option>
            ))}
          </select>
          <ChevronDownIcon className="pointer-events-none absolute right-[11.8px] top-1/2 h-4 w-4 -translate-y-1/2 text-[#52555B] opacity-50" />
        </label>

        <label className="relative block w-[93.6px]">
          <select
            value={difficulty}
            onChange={(event) => onDifficultyChange(event.target.value as Difficulty)}
            className={`${SELECT_CLASS_NAME} w-[93.6px] text-[#0F1216]`}
            disabled={disabled || loading}
          >
            {difficultyOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label.replace(" түвшин", "")}
              </option>
            ))}
          </select>
          <ChevronDownIcon className="pointer-events-none absolute right-[11.8px] top-1/2 h-4 w-4 -translate-y-1/2 text-[#52555B] opacity-50" />
        </label>
      </div>
    </div>
  );
}
