"use client";

import { CloseIcon, PlusIcon } from "../icons";

type McqProps = {
  options: string[];
  correctIndex: number;
  onPick: (index: number) => void;
  onUpdate: (index: number, value: string) => void;
  onRemove: (index: number) => void;
  onAdd: () => void;
};

export function QuestionBankMcqFields({
  options,
  correctIndex,
  onPick,
  onUpdate,
  onRemove,
  onAdd,
}: McqProps) {
  return (
    <div className="border-t border-[#DFE1E5] pt-4">
      <p className="mb-2 text-[12px] font-medium text-[#52555B]">
        Хариултууд (зөвийг сонгоно)
      </p>
      <div className="space-y-2">
        {options.map((option, index) => (
          <div key={`${index}-${option}`} className="flex items-center gap-2">
            <input
              type="radio"
              checked={correctIndex === index}
              onChange={() => onPick(index)}
              className="h-4 w-4 border-[#DFE1E5] text-[#192230]"
            />
            <span className="w-5 text-[12px] text-[#52555B]">
              {String.fromCharCode(65 + index)}.
            </span>
            <input
              value={option}
              onChange={(event) => onUpdate(index, event.target.value)}
              className="h-8 flex-1 rounded-md border border-[#DFE1E5] bg-white px-3 text-[14px] text-[#0F1216] shadow-[0px_1px_2px_rgba(0,0,0,0.05)]"
            />
            <button
              type="button"
              className="rounded-md p-2 text-[#52555B] hover:bg-white"
              onClick={() => onRemove(index)}
            >
              <CloseIcon className="h-4 w-4" />
            </button>
          </div>
        ))}
      </div>
      <button
        type="button"
        className="mt-3 inline-flex items-center gap-2 rounded-md px-2 py-1 text-[12px] font-medium text-[#52555B]"
        onClick={onAdd}
      >
        <PlusIcon className="h-4 w-4" />
        Сонголт нэмэх
      </button>
    </div>
  );
}

type TrueFalseProps = {
  value: string;
  onChange: (value: string) => void;
};

export function QuestionBankTrueFalseFields({
  value,
  onChange,
}: TrueFalseProps) {
  return (
    <div className="border-t border-[#DFE1E5] pt-4">
      <p className="mb-2 text-[12px] font-medium text-[#52555B]">
        Зөв хариулт
      </p>
      <div className="flex items-center gap-6 text-[14px] font-medium text-[#0F1216]">
        <label className="flex items-center gap-2">
          <input
            type="radio"
            checked={value === "Үнэн"}
            onChange={() => onChange("Үнэн")}
            className="h-4 w-4 border-[#DFE1E5] text-[#192230]"
          />
          Үнэн
        </label>
        <label className="flex items-center gap-2">
          <input
            type="radio"
            checked={value === "Худал"}
            onChange={() => onChange("Худал")}
            className="h-4 w-4 border-[#DFE1E5] text-[#192230]"
          />
          Худал
        </label>
      </div>
    </div>
  );
}

type NumericProps = {
  answer: string;
  tolerance: string;
  onAnswerChange: (value: string) => void;
  onToleranceChange: (value: string) => void;
};

export function QuestionBankNumericFields({
  answer,
  tolerance,
  onAnswerChange,
  onToleranceChange,
}: NumericProps) {
  return (
    <div className="border-t border-[#DFE1E5] pt-4">
      <p className="mb-2 text-[12px] font-medium text-[#52555B]">Зөв хариу</p>
      <div className="flex flex-col gap-2 sm:flex-row">
        <input
          value={answer}
          onChange={(event) => onAnswerChange(event.target.value)}
          placeholder="Ж: 1/2 ; 0.5 ; 50%"
          className="h-9 flex-1 rounded-md border border-[#DFE1E5] bg-white px-3 text-[14px] text-[#0F1216] shadow-[0px_1px_2px_rgba(0,0,0,0.05)] placeholder:text-[#52555B]"
        />
        <input
          value={tolerance}
          onChange={(event) => onToleranceChange(event.target.value)}
          placeholder="Хүлцэл"
          className="h-9 w-full rounded-md border border-[#DFE1E5] bg-white px-3 text-[14px] text-[#0F1216] shadow-[0px_1px_2px_rgba(0,0,0,0.05)] placeholder:text-[#52555B] sm:w-32"
        />
      </div>
      <p className="mt-2 text-[11px] text-[#52555B]">
        Олон зөв хариу байвал `;` эсвэл шинэ мөрөөр салгаж оруулж болно. Хариунд
        зөвшөөрөгдөх алдааны хязгаарыг хүлцлээр өгнө.
      </p>
    </div>
  );
}

type LongAnswerProps = {
  value: string;
  onChange: (value: string) => void;
};

export function QuestionBankLongAnswerFields({
  value,
  onChange,
}: LongAnswerProps) {
  return (
    <div className="border-t border-[#DFE1E5] pt-4">
      <p className="mb-2 text-[12px] font-medium text-[#52555B]">
        Жишиг хариулт (заавал биш)
      </p>
      <textarea
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder="Шалгахдаа жишиг болгох хариултыг оруулна уу..."
        className="h-16 w-full rounded-md border border-[#DFE1E5] bg-white px-3 py-2 text-[14px] text-[#0F1216] shadow-[0px_1px_2px_rgba(0,0,0,0.05)] placeholder:text-[#52555B]"
      />
      <p className="mt-2 text-[11px] text-[#52555B]">
        Үүнийг багш гараар шалгана
      </p>
    </div>
  );
}
