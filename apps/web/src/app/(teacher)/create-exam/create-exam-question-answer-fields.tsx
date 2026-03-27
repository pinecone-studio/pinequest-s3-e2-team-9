import { QuestionType } from "@/graphql/generated";
import { CreateExamAnswerOptionRow } from "./create-exam-answer-option-row";

type CreateExamQuestionAnswerFieldsProps = {
  questionType: QuestionType;
  options: string[];
  correctIndex: number;
  truthValue: string;
  numericAnswer: string;
  tolerance: string;
  referenceAnswer: string;
  disabled?: boolean;
  onPick: (index: number) => void;
  onUpdate: (index: number, value: string) => void;
  onRemove: (index: number) => void;
  onAdd: () => void;
  onTruthChange: (value: string) => void;
  onNumericAnswerChange: (value: string) => void;
  onToleranceChange: (value: string) => void;
  onReferenceAnswerChange: (value: string) => void;
};

const INPUT_CLASS =
  "h-8 rounded-[6px] border border-[#DFE1E5] bg-white px-[11.8px] text-[14px] leading-[18px] text-[#101828] shadow-[0px_1px_2px_rgba(0,0,0,0.05)] outline-none placeholder:text-[#52555B]";

export function CreateExamQuestionAnswerFields(props: CreateExamQuestionAnswerFieldsProps) {
  if (props.questionType === QuestionType.TrueFalse) {
    return (
      <div className="space-y-3 border-t border-[#DFE1E5] pt-4">
        <p className="text-[12px] font-medium leading-4 text-[#52555B]">Options (select correct answer)</p>
        <div className="flex gap-3">
          {["True", "False"].map((option) => (
            <label key={option} className="flex items-center gap-2 text-[12px] text-[#52555B]">
              <input
                type="radio"
                checked={props.truthValue === option}
                onChange={() => props.onTruthChange(option)}
                disabled={props.disabled}
                className="h-4 w-4 border border-[#DFE1E5] text-[#192230] shadow-[0px_1px_2px_rgba(0,0,0,0.05)]"
              />
              {option}
            </label>
          ))}
        </div>
      </div>
    );
  }

  if (props.questionType === QuestionType.ShortAnswer) {
    return (
      <div className="space-y-3 border-t border-[#DFE1E5] pt-4">
        <p className="text-[12px] font-medium leading-4 text-[#52555B]">Correct answer</p>
        <div className="grid gap-3 md:grid-cols-[minmax(0,1fr)_180px]">
          <input
            value={props.numericAnswer}
            onChange={(event) => props.onNumericAnswerChange(event.target.value)}
            disabled={props.disabled}
            placeholder="Enter correct answer"
            className={INPUT_CLASS}
          />
          <input
            value={props.tolerance}
            onChange={(event) => props.onToleranceChange(event.target.value)}
            disabled={props.disabled}
            placeholder="Tolerance"
            className={INPUT_CLASS}
          />
        </div>
      </div>
    );
  }

  if (props.questionType === QuestionType.Essay) {
    return (
      <div className="space-y-3 border-t border-[#DFE1E5] pt-4">
        <p className="text-[12px] font-medium leading-4 text-[#52555B]">Reference answer</p>
        <textarea
          value={props.referenceAnswer}
          onChange={(event) => props.onReferenceAnswerChange(event.target.value)}
          disabled={props.disabled}
          placeholder="Add a reference answer..."
          className="min-h-[96px] rounded-[6px] border border-[#DFE1E5] bg-white px-[11.8px] py-[8.8px] text-[14px] leading-5 text-[#101828] shadow-[0px_1px_2px_rgba(0,0,0,0.05)] outline-none placeholder:text-[#52555B]"
        />
      </div>
    );
  }

  return (
    <div className="space-y-2 border-t border-[#DFE1E5] pt-4">
      <p className="text-[12px] font-medium leading-4 text-[#52555B]">Options (select correct answer)</p>
      <div className="space-y-2">
        {props.options.map((option, index) => (
          <CreateExamAnswerOptionRow
            key={`${index}-${option}`}
            index={index}
            value={option}
            checked={props.correctIndex === index}
            disabled={props.disabled}
            onPick={() => props.onPick(index)}
            onChange={(value) => props.onUpdate(index, value)}
            onRemove={() => props.onRemove(index)}
          />
        ))}
      </div>
      <button
        type="button"
        className="inline-flex h-8 items-center justify-center gap-[10px] rounded-[6px] px-[10px] text-[12px] font-medium leading-4 text-[#52555B] disabled:opacity-50"
        onClick={props.onAdd}
        disabled={props.disabled}
      >
        <svg className="h-4 w-4" viewBox="0 0 16 16" fill="none">
          <path d="M8 3.333v9.334M3.333 8h9.334" stroke="currentColor" strokeWidth="1.333" strokeLinecap="round" />
        </svg>
        Add Option
      </button>
    </div>
  );
}
