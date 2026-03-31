type ClassesStatusBadgeProps = {
  label: string;
  tone: "success" | "warning" | "muted" | "danger";
};

const toneClasses = {
  success: "border-[#31AA4033] bg-[#31AA401A] text-[#0F7A4F]",
  warning: "border-[#EAB53233] bg-[#EAB5321A] text-[#946200]",
  muted: "border-[#DFE1E5] bg-[#F2F4F7] text-[#52555B]",
  danger: "border-[#F0443833] bg-[#F0443814] text-[#B42318]",
};

export function ClassesStatusBadge({
  label,
  tone,
}: ClassesStatusBadgeProps) {
  return (
    <span
      className={`inline-flex rounded-md border px-3 py-1 text-[12px] font-medium ${toneClasses[tone]}`}
    >
      {label}
    </span>
  );
}
