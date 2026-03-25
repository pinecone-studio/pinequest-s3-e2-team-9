/* eslint-disable max-lines */
import { SparkleIcon, UploadIcon } from "./icons-actions";
import { ТохиргооIcon } from "./icons-actions";
import { BookIcon } from "./icons-actions";
export function CreateExam() {
  return (
    <div className="w-full max-w-[760px]">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-[18px] font-semibold text-[#0F1216]">
            Шалгалт үүсгэх
          </h1>
          <p className="text-[12px] text-[#667085]">
            Асуултыг нэмэн шалгалтаа үүсгэнэ үү.
          </p>
        </div>
        <button className="rounded-md border border-[#E4E7EC] bg-white px-3 py-1.5 text-[12px] font-medium text-[#344054] shadow-sm">
          Хадгалах
        </button>
      </div>

      <div className="mt-6 space-y-4">
        <div className="rounded-xl border bg-white p-4 shadow-sm border-[#DFE1E5] hover:border-[#00267F]">
          <div className="space-y-3">
            <div>
              <label className="text-[12px] font-medium text-[#0F1216]">
                Шалгалтын нэр
              </label>
              <input
                className="mt-1 w-full rounded-md border border-[#E4E7EC] bg-white px-3 py-2 text-[13px] text-[#0F1216] placeholder:text-[#98A2B3]"
                placeholder="Шалгалтын нэр..."
              />
            </div>
            <div className="flex flex-wrap items-center gap-3">
              <div className="flex items-center gap-2">
                <label className="text-[12px] font-medium text-[#0F1216]">
                  Хугацаа
                </label>
                <input
                  className="w-[80px] h-[36px] rounded-md border border-[#E4E7EC] bg-white px-2 py-2 text-[13px] text-[#0F1216]"
                  placeholder="60"
                />
              </div>
              <span className="text-[12px] text-[#667085]">минут</span>
            </div>
            <div>
              <input
                className="h-[64px] w-[638.4px] flex items-start rounded-md border border-[#E4E7EC] bg-white text-[13px] text-[#0F1216] placeholder:text-[#98A2B3]"
                placeholder="Сургалтад өгөх заавар (заавал биш)..."
              />
            </div>
          </div>
        </div>

        <div className="rounded-xl border border-[#E4E7EC] bg-white p-4 shadow-sm">
          <div className="flex items-center gap-2 ">
            <span className="text-[13px] font-medium flex-row flex gap-2 text-[#0F1216]">
              <ТохиргооIcon />
              Шалгалтын тохиргоо
            </span>
          </div>
          <div className="mt-3 grid gap-3 sm:grid-cols-2">
            {[
              {
                title: "Асуулт холих",
                desc: "Асуултын дарааллыг санамсаргүй болгоно",
              },
              {
                title: "Хариултыг холих",
                desc: "Сонголтын дарааллыг санамсаргүй болгоно",
              },
            ].map((item) => (
              <div
                key={item.title}
                className="h-[81.6px] flex items-center justify-between gap-3 rounded-lg border border-[#DFE1E5] bg-white px-3 py-3"
              >
                <div className="flex items-center gap-3">
                  <input
                    type="checkbox"
                    className="h-4 w-4 rounded border border-[#DFE1E5]"
                  />
                  <div>
                    <p className="text-[16px] font-medium text-[#0F1216]">
                      {item.title}
                    </p>
                    <p className="text-[13px] text-[#667085]">{item.desc}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
        <div className="gap-4">
          <p className="text-[13px] font-medium text-[#52555B]">
            Асуултууд (0)
          </p>
          <div className="rounded-xl border border-[#DFE1E5] hover:border-[#00267F] bg-white p-4 shadow-sm">
            <div className="mt-3 rounded-lg border-[#DFE1E5] hover:border-[#00267F]border  bg-white p-4  ">
              <div>
                <label className="text-[12px] font-medium text-[#475467]">
                  Асуулт
                </label>
                <input
                  className="mt-1 w-full rounded-md border border-[#E4E7EC] bg-white px-3 py-3 text-[13px] text-[#0F1216] placeholder:text-[#98A2B3]"
                  placeholder="Асуултаа оруулна уу..."
                />
              </div>

              <div className="mt-4">
                <p className="text-[12px] font-medium text-[#475467]">
                  Медиа (Заавал Биш)
                </p>
                <div className="mt-2 grid gap-2 sm:grid-cols-2">
                  <button className="flex h-[64px] flex-col items-center justify-center gap-1 rounded-md border border-dashed border-[#E4E7EC] text-[12px] text-[#667085]">
                    <UploadIcon className="h-[18px] w-[18px]" />
                    Зураг оруулах
                  </button>
                  <button className="flex h-[64px] flex-col items-center justify-center gap-1 rounded-md border border-dashed border-[#E4E7EC] text-[12px] text-[#667085]">
                    <UploadIcon className="h-[18px] w-[18px]" />
                    Видео оруулах
                  </button>
                </div>
              </div>

              <div className="mt-4 flex flex-wrap gap-3 justify-between">
                {[
                  { label: "Сонгох (олон сонголттой)", width: "w-[210px]" },
                  { label: "Хичээл", width: "w-[120px]" },
                  { label: "Дунд түвшин", width: "w-[140px]" },
                ].map((item) => (
                  <button
                    key={item.label}
                    className={`flex items-center justify-between gap-2 rounded-md border border-[#E4E7EC] bg-white px-3 py-2 text-[12px] text-[#344054] ${item.width}`}
                  >
                    {item.label}
                    <svg
                      className="h-3 w-3 text-[#98A2B3]"
                      viewBox="0 0 12 12"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="1.4"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <path d="m2.5 4.5 3.5 3 3.5-3" />
                    </svg>
                  </button>
                ))}
              </div>

              <div className="mt-4 border-t border-[#F0F2F5] pt-4">
                <p className="text-[12px] font-medium text-[#667085]">
                  Хариултууд (зөвийг сонгоно)
                </p>
                <div className="mt-2 space-y-2">
                  {["Сонголт A", "Сонголт B", "Сонголт C", "Сонголт D"].map(
                    (option, index) => (
                      <div key={option} className="flex items-center gap-2">
                        <input
                          type="radio"
                          name="correct-answer"
                          className="h-4 w-4"
                          defaultChecked={index === 0}
                        />
                        <span className="w-4 text-[12px] text-[#667085]">
                          {String.fromCharCode(65 + index)}.
                        </span>
                        <input
                          className="flex-1 rounded-md border border-[#E4E7EC] bg-white px-3 py-2 text-[12px] text-[#0F1216] placeholder:text-[#98A2B3]"
                          placeholder={option}
                        />
                        <button className="text-[14px] text-[#98A2B3]">
                          ×
                        </button>
                      </div>
                    ),
                  )}
                </div>
                <button className="mt-3 flex items-center gap-2 text-[12px] font-medium text-[#667085]">
                  <span className="text-[16px] leading-none">+</span>
                  Сонголт нэмэх
                </button>
              </div>

              <div className="mt-4 border-t border-[#F0F2F5] pt-4">
                <label className="flex items-center gap-2 text-[12px] text-[#344054]">
                  <input type="checkbox" className="h-3.5 w-3.5" />
                  Энэ асуултыг асуултын санд хадгалах
                </label>
              </div>

              <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
                <button className="flex h-8 items-center gap-[14px] rounded-md border border-[#DFE1E5] bg-[#FAFAFA] px-[10px] text-[12px] text-[#344054]">
                  <BookIcon className="h-4 w-4 text-[#667085]" />
                  Сангаас нэмэх
                </button>
                <div className="flex items-center gap-2">
                  <button className="rounded-md border border-transparent bg-white px-3 py-2 text-[12px] text-[#344054]">
                    Цуцлах
                  </button>
                  <button className="flex items-center gap-2 rounded-md bg-[#6B7FB8] px-3 py-2 text-[12px] font-medium text-white">
                    <SparkleIcon className="  text-white" />
                    Асуулт нэмэх
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
