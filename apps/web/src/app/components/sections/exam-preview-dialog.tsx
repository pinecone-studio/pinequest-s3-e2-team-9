import { ClipboardIcon, ClockIcon, CloseIcon } from "../icons";

type ExamPreviewDialogProps = {
  open: boolean;
  onClose: () => void;
};

const optionRow =
  "flex items-center gap-2 rounded-md border border-[#DFE1E5] bg-white px-3 py-2 text-[14px] text-[#0F1216]";

export function ExamPreviewDialog({ open, onClose }: ExamPreviewDialogProps) {
  if (!open) {
    return null;
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-start justify-center bg-black/40 p-6"
      role="dialog"
      aria-modal="true"
      onClick={onClose}
    >
      <div
        className={[
          "relative h-[1124px] w-[672px] max-w-[90vw]",
          "max-h-[calc(100vh-48px)] overflow-y-auto rounded-lg border",
          "border-[#DFE1E5] bg-[#FAFAFA]",
          "shadow-[0px_10px_15px_-3px_rgba(0,0,0,0.1),0px_4px_6px_-4px_rgba(0,0,0,0.1)]",
        ].join(" ")}
        onClick={(event) => event.stopPropagation()}
      >
        <button
          type="button"
          className="absolute right-6 top-5 text-[#0F1216B3] hover:text-[#0F1216]"
          aria-label="Close dialog"
          onClick={onClose}
        >
          <CloseIcon className="h-4 w-4" />
        </button>

        <div className="space-y-6 p-6">
          <div className="space-y-2">
            <h2 className="text-[18px] font-semibold text-[#0F1216]">
              Урьдчилан харах: Математикийн эцсийн шалгалт
            </h2>
            <p className="text-[14px] text-[#52555B]">
              Сурагчид шалгалтыг ингэж харах болно
            </p>
          </div>

          <div className="space-y-2 rounded-lg border border-[#DFE1E5] bg-[#F0F2F580] p-4 text-[14px] text-[#52555B]">
            <div className="flex flex-wrap items-center gap-4 text-[#0F1216]">
              <span className="flex items-center gap-2 text-[#0F1216]">
                <ClockIcon className="h-4 w-4 text-[#52555B]" />
                120 минут
              </span>
              <span className="flex items-center gap-2 text-[#0F1216]">
                <ClipboardIcon className="h-4 w-4 text-[#52555B]" />
                4 асуулт
              </span>
              <span className="text-[#52555B]">Математик</span>
            </div>
            <p>
              Бүх асуултад хариулна уу. Дунд оноо авахын тулд бодолтоо харуулна
              уу.
            </p>
          </div>

          <div className="space-y-4">
            <article className="rounded-lg border border-[#DFE1E5] bg-white p-4">
              <div className="flex items-start gap-3">
                <span className="flex h-6 w-6 items-center justify-center rounded-full bg-[#F0F2F5] text-[12px] font-medium text-[#0F1216]">
                  1
                </span>
                <div className="flex-1 space-y-3">
                  <p className="text-[14px] text-[#0F1216]">
                    x^2 функцийн уламжлал аль нь вэ?
                  </p>
                  <div className="space-y-2">
                    <div className={optionRow}>
                      <span className="h-4 w-4 rounded-full border border-[#DFE1E5]" />
                      x
                    </div>
                    <div className={optionRow}>
                      <span className="h-4 w-4 rounded-full border border-[#DFE1E5]" />
                      2x
                    </div>
                    <div className={optionRow}>
                      <span className="h-4 w-4 rounded-full border border-[#DFE1E5]" />
                      x^2
                    </div>
                    <div className={optionRow}>
                      <span className="h-4 w-4 rounded-full border border-[#DFE1E5]" />
                      2
                    </div>
                  </div>
                </div>
              </div>
            </article>

            <article className="rounded-lg border border-[#DFE1E5] bg-white p-4">
              <div className="flex items-start gap-3">
                <span className="flex h-6 w-6 items-center justify-center rounded-full bg-[#F0F2F5] text-[12px] font-medium text-[#0F1216]">
                  2
                </span>
                <div className="flex-1 space-y-3">
                  <p className="text-[14px] text-[#0F1216]">
                    sin(x)-ийн интегралыг олно уу.
                  </p>
                  <div className="space-y-2">
                    <div className={optionRow}>
                      <span className="h-4 w-4 rounded-full border border-[#DFE1E5]" />
                      -cos(x) + C
                    </div>
                    <div className={optionRow}>
                      <span className="h-4 w-4 rounded-full border border-[#DFE1E5]" />
                      cos(x) + C
                    </div>
                    <div className={optionRow}>
                      <span className="h-4 w-4 rounded-full border border-[#DFE1E5]" />
                      -sin(x) + C
                    </div>
                    <div className={optionRow}>
                      <span className="h-4 w-4 rounded-full border border-[#DFE1E5]" />
                      sin(x) + C
                    </div>
                  </div>
                </div>
              </div>
            </article>

            <article className="rounded-lg border border-[#DFE1E5] bg-white p-4">
              <div className="flex items-start gap-3">
                <span className="flex h-6 w-6 items-center justify-center rounded-full bg-[#F0F2F5] text-[12px] font-medium text-[#0F1216]">
                  3
                </span>
                <div className="flex-1 space-y-3">
                  <p className="text-[14px] text-[#0F1216]">
                    x-ийг ол: 2x + 5 = 15
                  </p>
                  <div className="rounded-md border border-[#DFE1E5] px-3 py-2 text-[14px] text-[#52555B]">
                    Хариултаа оруулна уу...
                  </div>
                </div>
              </div>
            </article>

            <article className="rounded-lg border border-[#DFE1E5] bg-white p-4">
              <div className="flex items-start gap-3">
                <span className="flex h-6 w-6 items-center justify-center rounded-full bg-[#F0F2F5] text-[12px] font-medium text-[#0F1216]">
                  4
                </span>
                <div className="flex-1 space-y-3">
                  <p className="text-[14px] text-[#0F1216]">
                    Дараах тоонуудын аль нь анхны тоо вэ?
                  </p>
                  <div className="space-y-2">
                    {["2", "4", "7", "9", "11"].map((value) => (
                      <div key={value} className={optionRow}>
                        <span className="h-4 w-4 rounded border border-[#DFE1E5]" />
                        {value}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </article>
          </div>
        </div>
      </div>
    </div>
  );
}
