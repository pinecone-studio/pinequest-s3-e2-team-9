const skeletonRows = Array.from({ length: 6 }, (_, index) => index);

export function MyExamsLoadingList() {
  return skeletonRows.map((row) => (
    <div
      key={row}
      className="h-[216px] w-[352px] max-w-full animate-pulse rounded-[16px] border border-[#F1F2F3] bg-white px-[10px] pb-[16px] pt-[10px] shadow-[0px_4px_8px_-2px_rgba(0,0,0,0.1),0px_2px_4px_-2px_rgba(0,0,0,0.06)]"
    >
      <div className="h-[142px] rounded-t-[16px] rounded-b-[4px] bg-[#E9EDF3] px-[14px] py-[18px]">
        <div className="space-y-3">
          <div className="h-5 w-3/4 rounded bg-white/70" />
          <div className="h-4 w-1/2 rounded bg-white/70" />
          <div className="h-4 w-1/3 rounded bg-white/70" />
        </div>
        <div className="mt-7 flex gap-2">
          <div className="h-6 w-16 rounded-full bg-white/80" />
          <div className="h-6 w-16 rounded-full bg-white/80" />
          <div className="h-6 w-16 rounded-full bg-white/80" />
        </div>
      </div>
      <div className="mt-3 grid gap-3 sm:grid-cols-2">
        <div className="h-9 rounded-[8px] bg-[#E9EDF3]" />
        <div className="h-9 rounded-[8px] bg-[#E9EDF3]" />
      </div>
    </div>
  ));
}
