/* eslint-disable max-lines */
import type { JSX } from "react";
import type { IconProps } from "./icons-base";

export function EyeIcon({ className }: IconProps) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.6"
    >
      <path d="M2 12s4-6 10-6 10 6 10 6-4 6-10 6-10-6-10-6z" />
      <circle cx="12" cy="12" r="2.5" />
    </svg>
  );
}

export function DetailsIcon({ className }: IconProps) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.6"
    >
      <path d="M8 6h12M8 12h12M8 18h12" />
      <circle cx="5" cy="6" r="1" />
      <circle cx="5" cy="12" r="1" />
      <circle cx="5" cy="18" r="1" />
    </svg>
  );
}

export function StopIcon({ className }: IconProps) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.6"
    >
      <rect x="6" y="6" width="12" height="12" rx="2" />
    </svg>
  );
}

export function PlusIcon({ className }: IconProps) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.6"
    >
      <path d="M12 5v14M5 12h14" />
    </svg>
  );
}

export function CheckIcon({ className }: IconProps) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.6"
    >
      <path d="m5 13 4 4L19 7" />
    </svg>
  );
}

export function CloseIcon({ className }: IconProps) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.6"
    >
      <path d="M6 6l12 12M18 6l-12 12" />
    </svg>
  );
}

export function ArrowRightIcon({ className }: IconProps) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.6"
    >
      <path d="M5 12h14" />
      <path d="m13 6 6 6-6 6" />
    </svg>
  );
}

export function AlertIcon({ className }: IconProps) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.6"
    >
      <path d="M12 8v5" />
      <circle cx="12" cy="17" r="1" />
      <circle cx="12" cy="12" r="9" />
    </svg>
  );
}

export function WarningIcon({ className }: IconProps) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.6"
    >
      <path d="M12 4 2.5 20h19L12 4z" />
      <path d="M12 9v5" />
      <circle cx="12" cy="17" r="1" />
    </svg>
  );
}

export function UploadIcon({ className }: IconProps) {
  return (
    <svg
      className={className}
      xmlns="http://www.w3.org/2000/svg"
      width={20}
      height={20}
      fill="none"
    >
      <path
        stroke="#52555B"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={1.667}
        d="M10 2.5v10M14.167 6.667 10 2.5 5.833 6.667M17.5 12.5v3.333a1.666 1.666 0 0 1-1.667 1.667H4.167A1.667 1.667 0 0 1 2.5 15.833V12.5"
      />
    </svg>
  );
}
export function ТохиргооIcon({ className }: IconProps) {
  return (
    <svg
      className={className}
      xmlns="http://www.w3.org/2000/svg"
      width={16}
      height={16}
      fill="none"
    >
      <path
        stroke="#52555B"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={1.333}
        d="M9.333 11.333h-6M12.667 4.667h-6M11.333 13.333a2 2 0 1 0 0-4 2 2 0 0 0 0 4ZM4.667 6.667a2 2 0 1 0 0-4 2 2 0 0 0 0 4Z"
      />
    </svg>
  );
}
export function BookIcon({ className }: IconProps): JSX.Element {
  return (
    <svg
      className={className}
      xmlns="http://www.w3.org/2000/svg"
      width={16}
      height={16}
      fill="none"
    >
      <path
        stroke="#0F1216"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={1.333}
        d="m10.667 4 2.666 9.333M8 4v9.333M5.333 5.333v8M2.667 2.667v10.666"
      />
    </svg>
  );
}

export function SparkleIcon({ className }: IconProps): JSX.Element {
  return (
    <svg
      className={className}
      xmlns="http://www.w3.org/2000/svg"
      width={16}
      height={16}
      viewBox="0 0 16 16"
      fill="none"
    >
      <path
        d="M8 1.5 9.5 6.5 14.5 8 9.5 9.5 8 14.5 6.5 9.5 1.5 8 6.5 6.5 8 1.5Z"
        stroke="currentColor"
        strokeWidth={1.333}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
