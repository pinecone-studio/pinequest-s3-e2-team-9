import {
  type CreateExamClassOption,
  type CreateExamFieldErrors,
  type CreateExamFormValues,
} from "./create-exam-types";

type CreateExamDetailsCardProps = {
  values: CreateExamFormValues;
  classOptions: CreateExamClassOption[];
  errors: CreateExamFieldErrors;
  disabled: boolean;
  onFieldChange: <K extends keyof CreateExamFormValues>(
    field: K,
    value: CreateExamFormValues[K],
  ) => void;
};

export function CreateExamDetailsCard({
  values,
  classOptions,
  errors,
  disabled,
  onFieldChange,
}: CreateExamDetailsCardProps) {
  return (
    <div className="rounded-xl border border-[#DFE1E5] bg-white p-6 shadow-sm">
      <div className="grid gap-4">
        <div className="grid gap-1.5">
          <label className="text-[13px] font-medium text-[#0F1216]" htmlFor="exam-class">
            Анги
          </label>
          <select
            id="exam-class"
            className="rounded-md border border-[#DFE1E5] bg-white px-3 py-2 text-[14px] text-[#0F1216] shadow-sm"
            value={values.classId}
            onChange={(event) => onFieldChange("classId", event.target.value)}
            disabled={disabled}
          >
            {!classOptions.length ? <option value="">Анги олдсонгүй</option> : null}
            {classOptions.map((classroom) => (
              <option key={classroom.id} value={classroom.id}>
                {classroom.name}
              </option>
            ))}
          </select>
          {errors.classId ? <p className="text-[12px] text-[#B42318]">{errors.classId}</p> : null}
        </div>

        <div className="grid gap-1.5">
          <label className="text-[13px] font-medium text-[#0F1216]" htmlFor="exam-title">
            Шалгалтын нэр
          </label>
          <input
            id="exam-title"
            className="rounded-md border border-[#DFE1E5] bg-white px-3 py-2 text-[14px] text-[#0F1216] shadow-sm placeholder:text-[#52555B]"
            placeholder="Жишээ: Физикийн улирлын шалгалт"
            value={values.title}
            onChange={(event) => onFieldChange("title", event.target.value)}
            disabled={disabled}
          />
          {errors.title ? <p className="text-[12px] text-[#B42318]">{errors.title}</p> : null}
        </div>

        <div className="grid gap-1.5">
          <label className="text-[13px] font-medium text-[#0F1216]" htmlFor="exam-duration">
            Хугацаа (минут)
          </label>
          <input
            id="exam-duration"
            className="w-36 rounded-md border border-[#DFE1E5] bg-white px-3 py-2 text-[14px] text-[#0F1216] shadow-sm"
            value={values.durationMinutes}
            onChange={(event) => onFieldChange("durationMinutes", event.target.value)}
            disabled={disabled}
            inputMode="numeric"
          />
          {errors.durationMinutes ? (
            <p className="text-[12px] text-[#B42318]">{errors.durationMinutes}</p>
          ) : null}
        </div>

        <div className="grid gap-1.5">
          <label className="text-[13px] font-medium text-[#0F1216]" htmlFor="exam-description">
            Сурагчдад өгөх заавар (заавал биш)
          </label>
          <textarea
            id="exam-description"
            className="min-h-[72px] rounded-md border border-[#DFE1E5] bg-white px-3 py-2 text-[14px] text-[#0F1216] shadow-sm placeholder:text-[#52555B]"
            placeholder="Шалгалтын заавар оруулна уу..."
            value={values.description}
            onChange={(event) => onFieldChange("description", event.target.value)}
            disabled={disabled}
          />
        </div>
      </div>
    </div>
  );
}
