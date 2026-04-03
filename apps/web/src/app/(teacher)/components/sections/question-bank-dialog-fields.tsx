/* eslint-disable @next/next/no-img-element, max-lines */
"use client";

import { useAuth } from "@clerk/nextjs";
import { useEffect, useState, type ReactNode } from "react";
import { QuestionRepositoryKind } from "@/graphql/generated";
import {
  uploadImageAnswer,
  useProtectedImageSource,
} from "@/lib/image-answer";
import { ChevronDownIcon } from "../icons";

export function QuestionBankDialogSelect({
  value,
  disabled,
  children,
  onChange,
}: {
  value?: string;
  disabled?: boolean;
  children: ReactNode;
  onChange?: (value: string) => void;
}) {
  return (
    <label className="relative block">
      <select
        value={value}
        disabled={disabled}
        onChange={(event) => onChange?.(event.target.value)}
        className="h-9 w-full appearance-none rounded-md border border-[#DFE1E5] bg-white px-3 pr-9 text-[14px] text-[#0F1216] shadow-[0px_1px_2px_rgba(0,0,0,0.05)] disabled:text-[#52555B]"
      >
        {children}
      </select>
      <ChevronDownIcon className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#52555B]" />
    </label>
  );
}

export function QuestionBankDialogMedia({
  disabled,
  value,
  onChange,
}: {
  disabled?: boolean;
  value: string;
  onChange: (value: string) => void;
}) {
  const { getToken } = useAuth();
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [localPreviewUrl, setLocalPreviewUrl] = useState<string | null>(null);
  const normalizedValue = value.trim();
  const {
    error: imageSourceError,
    isLoading: isImageLoading,
    src: protectedImageSrc,
  } = useProtectedImageSource(normalizedValue);
  const previewSrc = localPreviewUrl ?? protectedImageSrc;
  const hasImage = Boolean(previewSrc);

  useEffect(() => {
    return () => {
      if (localPreviewUrl) {
        URL.revokeObjectURL(localPreviewUrl);
      }
    };
  }, [localPreviewUrl]);

  useEffect(() => {
    if (!normalizedValue.startsWith("r2:")) {
      setLocalPreviewUrl((current) => {
        if (current) {
          URL.revokeObjectURL(current);
        }
        return null;
      });
    }
  }, [normalizedValue]);

  const handleImagePick = async (file: File | null) => {
    if (!file) {
      return;
    }

    const objectUrl = URL.createObjectURL(file);
    setLocalPreviewUrl((current) => {
      if (current) {
        URL.revokeObjectURL(current);
      }
      return objectUrl;
    });
    setUploadError(null);
    setIsUploading(true);

    try {
      const storedValue = await uploadImageAnswer(file, getToken);
      onChange(storedValue);
    } catch (error) {
      console.error("Failed to upload prompt image", error);
      setUploadError(
        error instanceof Error
          ? error.message
          : "Зураг оруулах үед алдаа гарлаа.",
      );
    } finally {
      setIsUploading(false);
    }
  };

  const clearImage = () => {
    setLocalPreviewUrl((current) => {
      if (current) {
        URL.revokeObjectURL(current);
      }
      return null;
    });
    setUploadError(null);
    onChange("");
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between gap-3">
        <span className="text-[12px] font-medium text-[#52555B]">
          Медиа (заавал биш)
        </span>
        {normalizedValue ? (
          <button
            type="button"
            className="text-[12px] font-medium text-[#B42318]"
            disabled={disabled || isUploading}
            onClick={clearImage}
          >
            Зургийг арилгах
          </button>
        ) : null}
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        <label className="flex cursor-pointer flex-col items-center justify-center gap-2 rounded-lg border border-dashed border-[#DFE1E5] bg-white px-4 py-5 text-center text-[12px] text-[#52555B] transition hover:border-[#BFC6D4]">
          <span className="font-medium text-[#0F1216]">Зураг оруулах</span>
          <span>PNG, JPG, WEBP зэрэг зураг оруулж болно</span>
          <input
            accept="image/*"
            className="hidden"
            disabled={disabled || isUploading}
            onChange={(event) => void handleImagePick(event.target.files?.[0] ?? null)}
            type="file"
          />
        </label>
        <div className="rounded-lg border border-dashed border-[#DFE1E5] bg-white px-4 py-5 text-[12px] text-[#98A2B3]">
          <p className="font-medium text-[#52555B]">Видео оруулах</p>
          <p className="mt-1">Энэ хэсгийг дараагийн шатанд нэмнэ.</p>
        </div>
      </div>

      <label className="block space-y-2">
        <span className="text-[12px] font-medium text-[#52555B]">
          Эсвэл зургийн холбоос
        </span>
        <input
          className="h-10 w-full rounded-md border border-[#DFE1E5] bg-white px-3 text-[14px] text-[#0F1216] shadow-[0px_1px_2px_rgba(0,0,0,0.05)] outline-none placeholder:text-[#98A2B3]"
          disabled={disabled || isUploading}
          onChange={(event) => {
            setLocalPreviewUrl((current) => {
              if (current) {
                URL.revokeObjectURL(current);
              }
              return null;
            });
            setUploadError(null);
            onChange(event.target.value);
          }}
          placeholder="https://... эсвэл upload хийсэн зургийн хаяг"
          type="text"
          value={normalizedValue.startsWith("r2:") ? "" : value}
        />
      </label>

      {normalizedValue.startsWith("r2:") ? (
        <p className="text-[12px] text-[#667085]">
          Зураг R2 дээр хадгалагдсан.
        </p>
      ) : null}

      {hasImage ? (
        <div className="overflow-hidden rounded-lg border border-[#DFE1E5] bg-white p-2">
          <img
            alt="Асуултад хавсаргасан зураг"
            className="max-h-[320px] w-full rounded object-contain"
            src={previewSrc ?? ""}
          />
        </div>
      ) : null}

      {isUploading ? (
        <p className="text-[12px] font-medium text-[#2466D0]">
          Зургийг R2 руу оруулж байна...
        </p>
      ) : null}
      {isImageLoading && !localPreviewUrl ? (
        <p className="text-[12px] text-[#667085]">
          Хадгалагдсан зургийг ачаалж байна...
        </p>
      ) : null}
      {uploadError ? (
        <p className="text-[12px] font-medium text-[#B42318]">
          {uploadError}
        </p>
      ) : null}
      {imageSourceError && !uploadError ? (
        <p className="text-[12px] font-medium text-[#B42318]">
          {imageSourceError}
        </p>
      ) : null}
    </div>
  );
}

export function QuestionBankDialogRepositorySection({
  repositoryKind,
  requiresAccessRequest,
  disabled,
  onRequiresAccessRequestChange,
}: {
  repositoryKind: QuestionRepositoryKind;
  requiresAccessRequest: boolean;
  disabled?: boolean;
  onRequiresAccessRequestChange: (value: boolean) => void;
}) {
  const isUnified = repositoryKind === QuestionRepositoryKind.Unified;

  return (
    <div className="grid gap-3 rounded-lg border border-[#EAECF0] bg-white p-4 sm:grid-cols-[minmax(0,1fr)_auto] sm:items-end">
      <label className="space-y-2">
        <span className="text-[12px] font-medium text-[#52555B]">Хадгалах газар</span>
        <div className="h-9 rounded-md border border-[#DFE1E5] bg-[#F8FAFC] px-3 text-[14px] leading-9 text-[#0F1216] shadow-[0px_1px_2px_rgba(0,0,0,0.05)]">
          {isUnified ? "Нэгдсэн сан" : "Миний сан"}
        </div>
      </label>
      <label className="flex items-center gap-3 rounded-md border border-[#E4E7EC] px-3 py-2.5 text-[13px] text-[#344054]">
        <input
          type="checkbox"
          checked={requiresAccessRequest}
          onChange={(event) => onRequiresAccessRequestChange(event.target.checked)}
          disabled={disabled || isUnified}
          className="h-4 w-4 rounded border-[#D0D5DD] text-[#6434F8] focus:ring-[#6434F8]"
        />
        <span>
          {isUnified
            ? "Нэгдсэн сангийн асуултыг шууд ашиглана"
            : "Хүсэлтээр ашиглуулна"}
        </span>
      </label>
    </div>
  );
}
