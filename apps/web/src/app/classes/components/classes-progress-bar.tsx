type ClassesProgressBarProps = {
  value: number;
};

export function ClassesProgressBar({ value }: ClassesProgressBarProps) {
  return (
    <div className="h-2 w-16 overflow-hidden rounded-full bg-[#F0F2F5]">
      <div
        className="h-full rounded-full bg-[#192230]"
        style={{ width: `${Math.max(0, Math.min(100, value))}%` }}
      />
    </div>
  );
}
