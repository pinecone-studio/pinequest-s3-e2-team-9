import type { IconProps } from "./icons-base";
export function ExamFlowIcon({ className }: IconProps) {
  return (
    <svg
      className={className}
      xmlns="http://www.w3.org/2000/svg"
      width={44}
      height={28}
      fill="none"
    >
      <path
        fill="#6F90FF"
        d="M34.17 24.825A3.165 3.165 0 0 1 31.012 28H12.986a3.165 3.165 0 0 1-3.156-3.175v-8.29l11.246 4.802c.59.253 1.258.253 1.848 0l11.245-4.801v8.29ZM21.074.19a2.354 2.354 0 0 1 1.85 0l19.633 8.383c1.923.82 1.923 3.562 0 4.383l-8.389 3.58c0-4.918-3.963-8.906-8.853-8.906h-6.633c-4.89 0-8.853 3.988-8.853 8.907l-8.388-3.581c-1.923-.821-1.923-3.562 0-4.383L21.076.189Z"
      />
      <path
        fill="#6F90FF"
        d="M18.775 18A2.775 2.775 0 0 1 16 15.225v-2.492A2.733 2.733 0 0 1 18.733 10h1.849a.885.885 0 1 1 0 1.769h-1.875a.67.67 0 0 0 0 1.34h1.756a.879.879 0 1 1 0 1.759h-1.745a.682.682 0 1 0 0 1.363h1.947a.884.884 0 1 1 0 1.769h-1.89ZM23.625 18a1.018 1.018 0 0 1-1.018-1.018v-4.285A2.697 2.697 0 0 1 25.303 10h1.813a.884.884 0 1 1 0 1.769h-2.833a.36.36 0 1 1 .36-.36v2.101a.299.299 0 1 1-.298-.299h2.59a.879.879 0 1 1 0 1.758h-2.59a.299.299 0 1 1 .298-.299v2.312c0 .562-.456 1.018-1.018 1.018Z"
      />
    </svg>
  );
}
export function LibraryIcon({ className }: IconProps) {
  return (
    <svg
      className={className}
      xmlns="http://www.w3.org/2000/svg"
      width={20}
      height={20}
      fill="none"
    >
      <path
        stroke="#192230"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={1.667}
        d="m13.333 5 3.334 11.667M10 5v11.667M6.667 6.667v10M3.333 3.333v13.333"
      />
    </svg>
  );
}

export function DownPressIcon({ className }: IconProps) {
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
        d="m4 6 4 4 4-4"
        opacity={0.5}
      />
    </svg>
  );
}
