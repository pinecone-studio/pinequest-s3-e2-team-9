type CreateExamAnswerOptionRowProps = {
  index: number;
  value: string;
  checked: boolean;
  disabled?: boolean;
  onPick: () => void;
  onChange: (value: string) => void;
  onRemove: () => void;
};

export function CreateExamAnswerOptionRow({
  index,
  value,
  checked,
  disabled = false,
  onPick,
  onChange,
  onRemove,
}: CreateExamAnswerOptionRowProps) {
  return (
    <div className="flex items-center gap-2">
      <input
        type="radio"
        checked={checked}
        onChange={onPick}
        disabled={disabled}
        className="h-4 w-4 border border-[#DFE1E5] text-[#192230] shadow-[0px_1px_2px_rgba(0,0,0,0.05)]"
      />
      <span className="w-5 text-[12px] leading-4 text-[#52555B]">
        {String.fromCharCode(65 + index)}.
      </span>
      <input
        value={value}
        onChange={(event) => onChange(event.target.value)}
        disabled={disabled}
        placeholder={`Option ${String.fromCharCode(65 + index)}`}
        className="h-8 flex-1 rounded-[6px] border border-[#DFE1E5] bg-white px-[11.8px] text-[14px] leading-[18px] text-[#101828] shadow-[0px_1px_2px_rgba(0,0,0,0.05)] outline-none placeholder:text-[#52555B]"
      />
      <button
        type="button"
        className="flex h-8 w-8 items-center justify-center rounded-[6px] text-[#52555B] disabled:opacity-50"
        onClick={onRemove}
        disabled={disabled}
        aria-label={`Remove option ${String.fromCharCode(65 + index)}`}
      >
        <svg className="h-4 w-4" viewBox="0 0 16 16" fill="none">
          <path d="M4 4L12 12M12 4L4 12" stroke="currentColor" strokeWidth="1.333" strokeLinecap="round" />
        </svg>
      </button>
    </div>
  );
}
