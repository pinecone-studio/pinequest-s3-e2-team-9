import type { ReactNode } from "react";
import { ExamMode } from "@/graphql/generated";
import {
  type CreateExamFieldErrors,
  type CreateExamFormValues,
} from "./create-exam-types";

type CreateExamDetailsCardProps = {
  values: CreateExamFormValues;
  errors: CreateExamFieldErrors;
  disabled: boolean;
  onFieldChange: <K extends keyof CreateExamFormValues>(
    field: K,
    value: CreateExamFormValues[K],
  ) => void;
};

type FieldProps = {
  htmlFor: string;
  label?: string;
  error?: string;
  children: ReactNode;
};

function Field({ htmlFor, label, error, children }: FieldProps) {
  return (
    <label className="grid gap-1.5" htmlFor={htmlFor}>
      {label ? (
        <span className="text-[14px] font-medium leading-5 text-[#52555B]">{label}</span>
      ) : null}
      {children}
      {error ? <span className="text-[12px] text-[#B42318]">{error}</span> : null}
    </label>
  );
}

const BASE_INPUT_CLASS =
  "box-border border border-[#DFE1E5] bg-white shadow-[0px_1px_2px_rgba(0,0,0,0.05)] outline-none placeholder:text-[#52555B] disabled:bg-[#F8F9FB]";

export function CreateExamDetailsCard({
  values,
  errors,
  disabled,
  onFieldChange,
}: CreateExamDetailsCardProps) {
  return (
    <section className="relative isolate flex flex-col gap-4 self-stretch rounded-[12px] border border-[#DFE1E5] bg-white px-4 py-5 shadow-[0px_1px_3px_rgba(0,0,0,0.1),0px_1px_2px_-1px_rgba(0,0,0,0.1)]">
      <Field htmlFor="exam-mode">
        <div className="grid gap-2">
          <span className="text-[14px] font-medium leading-5 text-[#52555B]">
            Үнэлгээний төрөл
          </span>
          <div className="grid gap-3 md:grid-cols-2">
            <button
              id="exam-mode"
              type="button"
              className={`rounded-[10px] border px-4 py-4 text-left transition ${
                values.mode === ExamMode.Scheduled
                  ? "border-[#2466D0] bg-[#EEF4FF]"
                  : "border-[#DFE1E5] bg-white"
              }`}
              disabled={disabled}
              onClick={() => onFieldChange("mode", ExamMode.Scheduled)}
            >
              <p className="text-[14px] font-semibold text-[#0F1216]">Ангийн шалгалт</p>
              <p className="mt-1 text-[12px] leading-5 text-[#52555B]">
                Нэг удаагийн formal шалгалт. Дууссаны дараа багш review хийж болно.
              </p>
            </button>
            <button
              type="button"
              className={`rounded-[10px] border px-4 py-4 text-left transition ${
                values.mode === ExamMode.Practice
                  ? "border-[#16A34A] bg-[#F0FDF4]"
                  : "border-[#DFE1E5] bg-white"
              }`}
              disabled={disabled}
              onClick={() => onFieldChange("mode", ExamMode.Practice)}
            >
              <p className="text-[14px] font-semibold text-[#0F1216]">Practice / Free test</p>
              <p className="mt-1 text-[12px] leading-5 text-[#52555B]">
                Олон дахин ажиллаж болно. Дуусмагц шууд дүн, feedback харуулна.
              </p>
            </button>
          </div>
        </div>
      </Field>

      <Field htmlFor="exam-title" error={errors.title}>
        <input
          id="exam-title"
          className={`${BASE_INPUT_CLASS} h-11 rounded-[6px] px-[11.8px] text-[14px] font-medium leading-[18px] text-[#0F1216]`}
          placeholder="Жишээ: Физикийн улирлын шалгалт"
          value={values.title}
          onChange={(event) => onFieldChange("title", event.target.value)}
          disabled={disabled}
        />
      </Field>

      <div className="flex flex-wrap items-center gap-2">
        <span className="text-[14px] font-medium leading-5 text-[#52555B]">
          Хугацаа
        </span>
        <Field htmlFor="exam-duration" error={errors.durationMinutes}>
          <input
            id="exam-duration"
            className={`${BASE_INPUT_CLASS} h-9 w-20 rounded-[6px] px-[11.8px] text-[14px] leading-[18px] text-[#0F1216]`}
            value={values.durationMinutes}
            onChange={(event) => onFieldChange("durationMinutes", event.target.value)}
            disabled={disabled}
            inputMode="numeric"
          />
        </Field>
        <span className="text-[14px] leading-5 text-[#52555B]">мин</span>
      </div>

      <Field htmlFor="exam-description">
        <textarea
          id="exam-description"
          className={`${BASE_INPUT_CLASS} min-h-16 rounded-[6px] px-[12.8px] py-[8.8px] text-[14px] leading-5 text-[#0F1216]`}
          placeholder="Шалгалтын заавар оруулна уу..."
          value={values.description}
          onChange={(event) => onFieldChange("description", event.target.value)}
          disabled={disabled}
        />
      </Field>
    </section>
  );
}
