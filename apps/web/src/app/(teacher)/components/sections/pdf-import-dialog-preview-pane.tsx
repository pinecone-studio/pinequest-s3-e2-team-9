import Image from "next/image";
import { formatFileSize } from "./pdf-import-dialog-utils";

export function PdfImportDialogPreviewPane({
  fileName,
  fileSize,
  previewUrl,
  isImage,
}: {
  fileName: string;
  fileSize: number;
  previewUrl: string | null;
  isImage: boolean;
}) {
  return (
    <div className="border-b border-[#EAECF0] bg-white xl:border-b-0 xl:border-r">
      <div className="flex items-center justify-between border-b border-[#F2F4F7] px-6 py-4">
        <div>
          <p className="text-[12px] font-medium uppercase tracking-[0.08em] text-[#6B7280]">
            {isImage ? "Image preview" : "PDF preview"}
          </p>
          <h3 className="mt-1 text-[16px] font-semibold text-[#0F1216]">{fileName}</h3>
        </div>
        <span className="rounded-full bg-[#F2F4F7] px-3 py-1 text-[12px] font-medium text-[#344054]">
          {formatFileSize(fileSize)}
        </span>
      </div>
      <div className="h-[320px] bg-[#EEF4FF] p-4 xl:h-full">
        {previewUrl ? (
          isImage ? (
            <div className="relative h-full w-full overflow-hidden rounded-[18px] border border-[#D0D5DD] bg-white">
              <Image
                alt={fileName}
                src={previewUrl}
                fill
                unoptimized
                className="object-contain"
              />
            </div>
          ) : (
            <iframe
              title="PDF preview"
              src={previewUrl}
              className="h-full w-full rounded-[18px] border border-[#D0D5DD] bg-white"
            />
          )
        ) : (
          <div className="flex h-full items-center justify-center rounded-[18px] border border-dashed border-[#D0D5DD] bg-white text-[14px] text-[#52555B]">
            Preview ачаалж байна...
          </div>
        )}
      </div>
    </div>
  );
}
