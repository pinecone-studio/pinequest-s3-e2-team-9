import { CheckCircleIcon } from "./create-exam-icons";
import { ExamMode } from "@/graphql/generated";

type CreateExamSettingsCardProps = {
  mode: ExamMode;
  disabled: boolean;
  onModeChange: (value: ExamMode) => void;
};

const MODE_OPTIONS: { value: ExamMode; title: string; description: string }[] = [
  {
    value: ExamMode.Scheduled,
    title: "Товлосон шалгалт",
    description: "Сурагчид тодорхой хугацаанд орно.",
  },
  {
    value: ExamMode.OpenWindow,
    title: "Нээлттэй цонх",
    description: "Өгөгдсөн хугацааны интервалд хүссэн үедээ орно.",
  },
];

export function CreateExamSettingsCard({
  mode,
  disabled,
  onModeChange,
}: CreateExamSettingsCardProps) {
  return (
    <div className="rounded-xl border border-[#DFE1E5] bg-white p-4 shadow-sm">
      <div className="flex items-center gap-2 text-[14px] font-medium text-[#0F1216]">
        <CheckCircleIcon className="h-4 w-4 text-[#52555B]" />
        Шалгалтын горим
      </div>
      <div className="mt-3 grid gap-3 md:grid-cols-2">
        {MODE_OPTIONS.map((option) => {
          const isSelected = option.value === mode;

          return (
            <label
              key={option.value}
              className="flex cursor-pointer items-start gap-3 rounded-lg border border-[#DFE1E5] px-3 py-3"
            >
              <input
                type="radio"
                className="mt-1"
                name="exam-mode"
                value={option.value}
                checked={isSelected}
                onChange={() => onModeChange(option.value)}
                disabled={disabled}
              />
              <span>
                <span className="block text-[14px] font-medium text-[#0F1216]">{option.title}</span>
                <span className="block text-[12px] text-[#52555B]">{option.description}</span>
              </span>
            </label>
          );
        })}
      </div>
    </div>
  );
}
