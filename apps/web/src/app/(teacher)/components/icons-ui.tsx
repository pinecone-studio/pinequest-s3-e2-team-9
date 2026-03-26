import type { IconProps } from "./icons-base";

export function ChevronDownIcon({ className }: IconProps) {
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
      <path d="m6 9 6 6 6-6" />
    </svg>
  );
}

export function DotsIcon({ className }: IconProps) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
      <circle cx="5" cy="12" r="1.7" />
      <circle cx="12" cy="12" r="1.7" />
      <circle cx="19" cy="12" r="1.7" />
    </svg>
  );
}
export function BellIcon({ className }: IconProps) {
  return (
    <svg
      className={className}
      xmlns="http://www.w3.org/2000/svg"
      width={16}
      height={20}
      fill="none"
    >
      <path
        fill="#52555B"
        d="m14.877 14.79-1.29-1.29v-5c0-3.07-1.64-5.64-4.5-6.32V1.5c0-.83-.67-1.5-1.5-1.5s-1.5.67-1.5 1.5v.68c-2.87.68-4.5 3.24-4.5 6.32v5l-1.29 1.29c-.63.63-.19 1.71.7 1.71h13.17c.9 0 1.34-1.08.71-1.71Zm-3.29-.29h-8v-6c0-2.48 1.51-4.5 4-4.5s4 2.02 4 4.5v6Zm-4 5c1.1 0 2-.9 2-2h-4a2 2 0 0 0 2 2Z"
      />
    </svg>
  );
}

export function FileIcon({ className }: IconProps) {
  return (
    <svg
      className={className}
      xmlns="http://www.w3.org/2000/svg"
      width={14}
      height={17}
      fill="none"
    >
      <path
        stroke="#0F1216"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={1.667}
        d="M10.833.833A1.667 1.667 0 0 1 12.5 2.5V15a.833.833 0 0 1-1.247.723l-3.76-2.148a1.666 1.666 0 0 0-1.653 0l-3.76 2.149A.833.833 0 0 1 .833 15V2.5A1.667 1.667 0 0 1 2.5.833h8.333Z"
      />
    </svg>
  );
}

export function PencilIcon({ className }: IconProps) {
  return (
    <svg
      className={className}
      xmlns="http://www.w3.org/2000/svg"
      width={20}
      height={20}
      fill="none"
    >
      <path
        stroke="#0F1216"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={1.667}
        d="M17.645 5.677a2.35 2.35 0 1 0-3.322-3.323L3.202 13.48c-.194.192-.337.43-.417.691l-1.1 3.627a.417.417 0 0 0 .518.518l3.628-1.1c.26-.08.498-.221.692-.414L17.645 5.677ZM12.5 4.167 15.833 7.5"
      />
    </svg>
  );
}

export function CalendarIcon({ className }: IconProps) {
  return (
    <svg
      className={className}
      xmlns="http://www.w3.org/2000/svg"
      width={20}
      height={20}
      fill="none"
    >
      <path
        stroke="#0F1216"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={1.667}
        d="M6.667 1.667V5M13.333 1.667V5M15.833 3.333H4.167C3.247 3.333 2.5 4.08 2.5 5v11.667c0 .92.746 1.666 1.667 1.666h11.666c.92 0 1.667-.746 1.667-1.666V5c0-.92-.746-1.667-1.667-1.667ZM2.5 8.334h15"
      />
    </svg>
  );
}

export function CheckExamIcon({ className }: IconProps) {
  return (
    <svg
      className={className}
      xmlns="http://www.w3.org/2000/svg"
      width={16}
      height={16}
      fill="none"
    >
      <g
        stroke="#0F1216"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={1.333}
        clipPath="url(#a)"
      >
        <path d="M14.534 6.667a6.668 6.668 0 1 1-3.2-4.444" />
        <path d="m6 7.333 2 2 6.667-6.667" />
      </g>
      <defs>
        <clipPath id="a">
          <path fill="#fff" d="M0 0h16v16H0z" />
        </clipPath>
      </defs>
    </svg>
  );
}
export function ClassManagementIcon({ className }: IconProps) {
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
        d="M10.667 14v-1.333A2.667 2.667 0 0 0 8 10H4a2.667 2.667 0 0 0-2.667 2.667V14M10.667 2.085a2.666 2.666 0 0 1 0 5.163M14.667 14v-1.334a2.666 2.666 0 0 0-2-2.58M6 7.333A2.667 2.667 0 1 0 6 2a2.667 2.667 0 0 0 0 5.333Z"
      />
    </svg>
  );
}
export function QuestionBoxIcon({ className }: IconProps) {
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
