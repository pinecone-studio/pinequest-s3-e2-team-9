import { QuestionType } from "@/graphql/generated";
import type { StudentExamQuestion } from "./student-exam-room-types";

const QUESTION_TYPE_LABELS: Record<QuestionType, string> = {
  [QuestionType.Mcq]: "Олон сонголт",
  [QuestionType.TrueFalse]: "Үнэн / Худал",
  [QuestionType.ShortAnswer]: "Богино хариулт",
  [QuestionType.Essay]: "Задгай хариулт",
  [QuestionType.ImageUpload]: "Зураг оруулах",
};

type StudentExamQuestionCardProps = {
  activeQuestionId: string | null;
  draftValue: string;
  isInProgress: boolean;
  onChange: (value: string) => void;
  onSave: () => void;
  question: StudentExamQuestion;
  questionIndex: number;
  savedValue?: string;
};

export function StudentExamQuestionCard({
  activeQuestionId,
  draftValue,
  isInProgress,
  onChange,
  onSave,
  question,
  questionIndex,
  savedValue,
}: StudentExamQuestionCardProps) {
  const isImageUpload = question.question.type === QuestionType.ImageUpload;
  const isEssay = question.question.type === QuestionType.Essay;
  const isShortAnswer = question.question.type === QuestionType.ShortAnswer;

  return (
    <article className="rounded-[20px] border border-[#E7ECF6] bg-white p-6 shadow-[0_4px_8px_-2px_rgba(0,0,0,0.06)]">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="space-y-2">
          <p className="text-[13px] font-semibold uppercase tracking-[0.06em] text-[#2466D0]">Асуулт {questionIndex + 1}</p>
          <h3 className="text-[18px] font-semibold text-[#0F1216]">{question.question.title || question.question.prompt}</h3>
          <p className="text-[15px] leading-6 text-[#475467]">{question.question.prompt}</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Badge>{QUESTION_TYPE_LABELS[question.question.type]}</Badge>
          <Badge>{question.points} оноо</Badge>
        </div>
      </div>

      <div className="mt-5">
        {question.question.type === QuestionType.Mcq || question.question.type === QuestionType.TrueFalse ? (
          <div className="grid gap-3">
            {question.question.options.map((option) => (
              <label key={option} className="flex cursor-pointer items-start gap-3 rounded-[14px] border border-[#E4E7EC] px-4 py-3 transition hover:border-[#B2CCFF]">
                <input checked={draftValue === option} className="mt-1" disabled={!isInProgress} name={question.question.id} onChange={(event) => onChange(event.target.value)} type="radio" value={option} />
                <span className="text-[14px] leading-6 text-[#344054]">{option}</span>
              </label>
            ))}
          </div>
        ) : null}

        {isShortAnswer ? <input className="h-12 w-full rounded-[14px] border border-[#D0D5DD] px-4 text-[14px] outline-none focus:border-[#2466D0]" disabled={!isInProgress} onChange={(event) => onChange(event.target.value)} placeholder="Хариултаа оруулна уу" type="text" value={draftValue} /> : null}
        {isEssay ? <textarea className="min-h-[140px] w-full rounded-[14px] border border-[#D0D5DD] px-4 py-3 text-[14px] outline-none focus:border-[#2466D0]" disabled={!isInProgress} onChange={(event) => onChange(event.target.value)} placeholder="Дэлгэрэнгүй хариултаа энд бичнэ үү" value={draftValue} /> : null}
        {isImageUpload ? <div className="rounded-[14px] border border-dashed border-[#D0D5DD] bg-[#F8FAFF] px-4 py-5 text-[14px] leading-6 text-[#667085]">Зураг upload төрлийн асуултын UI энэ MVP-д хараахан холбогдоогүй. Хэрэв ийм асуулт байвал дараагийн алхмаар file upload route холбоно.</div> : null}
      </div>

      {isInProgress && !isImageUpload ? (
        <div className="mt-5 flex flex-wrap items-center justify-between gap-3">
          <span className="text-[13px] text-[#667085]">{savedValue ? "Сүүлд хадгалсан хариулт байна." : "Хариултаа хадгалахаа мартуузай."}</span>
          <button className="inline-flex h-10 items-center justify-center rounded-[12px] border border-[#2466D0] px-4 text-[14px] font-semibold text-[#2466D0] disabled:opacity-70" disabled={activeQuestionId === question.question.id} onClick={onSave} type="button">
            {activeQuestionId === question.question.id ? "Хадгалж байна..." : "Энэ хариултыг хадгалах"}
          </button>
        </div>
      ) : null}
    </article>
  );
}

function Badge({ children }: { children: React.ReactNode }) {
  return <span className="inline-flex items-center rounded-full bg-[#EEF4FF] px-3 py-1 text-[12px] font-semibold text-[#3538CD]">{children}</span>;
}
