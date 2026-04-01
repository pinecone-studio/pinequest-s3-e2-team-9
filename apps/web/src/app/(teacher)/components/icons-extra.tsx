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

export function GlobeIcon({ className }: IconProps) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.6"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <circle cx="12" cy="12" r="8.5" />
      <path d="M12 3.5c2.4 2.3 3.8 5.3 3.8 8.5S14.4 18.2 12 20.5c-2.4-2.3-3.8-5.3-3.8-8.5S9.6 5.8 12 3.5Z" />
      <path d="M4 12h16" />
    </svg>
  );
}
export function PeopleAltIcon({ className }: IconProps) {
  return (
    <svg
      className={className}
      xmlns="http://www.w3.org/2000/svg"
      width={11}
      height={8}
      fill="none"
    >
      <path
        fill="#1C1D1D"
        d="M7.835 4.565C8.52 5.03 9 5.66 9 6.5V8h2V6.5c0-1.09-1.785-1.735-3.165-1.935ZM7 4a2 2 0 1 0 0-4c-.235 0-.455.05-.665.12a2.99 2.99 0 0 1 0 3.76c.21.07.43.12.665.12ZM4 4A2 2 0 1 0 4.001.001 2 2 0 0 0 4 4Zm0-3c.55 0 1 .45 1 1s-.45 1-1 1-1-.45-1-1 .45-1 1-1ZM4 4.5c-1.335 0-4 .67-4 2V8h8V6.5c0-1.33-2.665-2-4-2ZM7 7H1v-.495C1.1 6.145 2.65 5.5 4 5.5s2.9.645 3 1V7Z"
      />
    </svg>
  );
}
export function CalendarIcon({ className }: IconProps) {
  return (
    <svg
      className={className}
      xmlns="http://www.w3.org/2000/svg"
      width={10}
      height={11}
      fill="none"
    >
      <path
        fill="#000"
        d="M9 1h-.5V0h-1v1h-5V0h-1v1H1c-.55 0-1 .45-1 1v8c0 .55.45 1 1 1h8c.55 0 1-.45 1-1V2c0-.55-.45-1-1-1Zm0 9H1V4.5h8V10Zm0-6.5H1V2h8v1.5Z"
      />
    </svg>
  );
}
