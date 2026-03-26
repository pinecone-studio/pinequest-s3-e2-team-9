import type { IconProps } from "./icons-base";

export function EducationIcon({ className }: IconProps) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.7"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="m3 8.5 9-4 9 4-9 4-9-4Z" />
      <path d="M7 10.3v4.2c0 1.4 2.2 2.5 5 2.5s5-1.1 5-2.5v-4.2" />
      <path d="M21 9.2v5.3" />
    </svg>
  );
}

export function ShieldInfoIcon({ className }: IconProps) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.7"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M12 3 5.5 5.8v5.7c0 4.1 2.6 7.8 6.5 9.5 3.9-1.7 6.5-5.4 6.5-9.5V5.8L12 3Z" />
      <path d="M12 8.2v4.2" />
      <circle cx="12" cy="15.7" r="0.7" fill="currentColor" stroke="none" />
    </svg>
  );
}
