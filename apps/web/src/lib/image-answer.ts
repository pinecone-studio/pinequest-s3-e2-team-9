/* eslint-disable max-lines */
"use client";

import { useAuth } from "@clerk/nextjs";
import { useEffect, useState } from "react";
import { getApiBaseUrl } from "./graphql-endpoint";

export const R2_IMAGE_VALUE_PREFIX = "r2:";

const DIRECT_IMAGE_PATTERN =
  /^data:image\//i;
const REMOTE_IMAGE_PATTERN =
  /^https?:\/\/.+\.(png|jpe?g|gif|webp|bmp|svg)(\?.*)?$/i;

export const isR2ImageValue = (value: string) =>
  value.trim().startsWith(R2_IMAGE_VALUE_PREFIX);

export const isDirectImageSource = (value: string) =>
  DIRECT_IMAGE_PATTERN.test(value.trim()) ||
  REMOTE_IMAGE_PATTERN.test(value.trim());

export const isImageAnswerValue = (value: string) =>
  isR2ImageValue(value) || isDirectImageSource(value);

const encodePathSegments = (value: string) =>
  value
    .split("/")
    .map((segment) => encodeURIComponent(segment))
    .join("/");

export const getR2ImageKey = (value: string) =>
  isR2ImageValue(value) ? value.trim().slice(R2_IMAGE_VALUE_PREFIX.length) : null;

export const getProtectedImageUrl = (key: string) =>
  `${getApiBaseUrl()}/uploads/image/${encodePathSegments(key)}`;

export const uploadImageAnswer = async (
  file: File,
  getToken: () => Promise<string | null>,
): Promise<string> => {
  const token = await getToken();
  if (!token) {
    throw new Error("Нэвтрэлт шаардлагатай байна.");
  }

  const formData = new FormData();
  formData.append("file", file, file.name);

  const response = await fetch(`${getApiBaseUrl()}/uploads/image`, {
    method: "POST",
    headers: {
      authorization: `Bearer ${token}`,
    },
    body: formData,
  });

  const payload = (await response.json().catch(() => null)) as
    | { error?: string; value?: string }
    | null;

  if (!response.ok || typeof payload?.value !== "string") {
    throw new Error(
      typeof payload?.error === "string"
        ? payload.error
        : "Зураг оруулах үед алдаа гарлаа.",
    );
  }

  return payload.value;
};

export const useProtectedImageSource = (value: string) => {
  const normalized = value.trim();
  const { getToken, isLoaded, isSignedIn } = useAuth();
  const [src, setSrc] = useState<string | null>(
    isDirectImageSource(normalized) ? normalized : null,
  );
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    let objectUrl: string | null = null;

    const cleanup = () => {
      if (objectUrl) {
        URL.revokeObjectURL(objectUrl);
        objectUrl = null;
      }
    };

    if (!normalized) {
      setSrc(null);
      setLoading(false);
      setError(null);
      return cleanup;
    }

    if (isDirectImageSource(normalized)) {
      setSrc(normalized);
      setLoading(false);
      setError(null);
      return cleanup;
    }

    const key = getR2ImageKey(normalized);
    if (!key) {
      setSrc(null);
      setLoading(false);
      setError(null);
      return cleanup;
    }

    if (!isLoaded || !isSignedIn) {
      setSrc(null);
      setLoading(false);
      setError("Нэвтрэлт шаардлагатай байна.");
      return cleanup;
    }

    setLoading(true);
    setError(null);
    setSrc(null);

    void (async () => {
      try {
        const token = await getToken();
        if (!token) {
          throw new Error("Нэвтрэлт шаардлагатай байна.");
        }

        const response = await fetch(getProtectedImageUrl(key), {
          headers: {
            authorization: `Bearer ${token}`,
          },
        });

        if (!response.ok) {
          const payload = (await response.json().catch(() => null)) as
            | { error?: string }
            | null;
          throw new Error(
            typeof payload?.error === "string"
              ? payload.error
              : "Зургийг дуудаж чадсангүй.",
          );
        }

        const blob = await response.blob();
        objectUrl = URL.createObjectURL(blob);

        if (!active) {
          cleanup();
          return;
        }

        setSrc(objectUrl);
        setLoading(false);
        setError(null);
      } catch (nextError) {
        cleanup();

        if (!active) {
          return;
        }

        setSrc(null);
        setLoading(false);
        setError(
          nextError instanceof Error
            ? nextError.message
            : "Зургийг харуулж чадсангүй.",
        );
      }
    })();

    return () => {
      active = false;
      cleanup();
    };
  }, [getToken, isLoaded, isSignedIn, normalized]);

  return {
    error,
    isLoading: loading,
    src,
  };
};
