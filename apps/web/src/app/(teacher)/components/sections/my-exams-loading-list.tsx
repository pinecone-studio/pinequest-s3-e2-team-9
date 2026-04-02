const skeletonRows = Array.from({ length: 6 }, (_, index) => index);

export function MyExamsLoadingList() {
  return skeletonRows.map((row) => (
    <div
      key={row}
      className="h-[215px] w-[268px] max-w-full animate-pulse rounded-[6px] border border-[#E4E4E4] bg-white p-3 shadow-[0px_3.22px_4.83px_rgba(0,0,0,0.09)]"
    >
      <div className="flex h-full w-full flex-col gap-4">
        <div className="relative h-24 rounded-[4px] bg-[linear-gradient(135deg,#F6EEFF_0%,#EEE6FF_48%,#E1D4FF_100%)]">
          <div className="absolute right-[6px] top-[5px] h-5 w-[126px] rounded-[8.4px] bg-white/70" />
          <div className="absolute left-6 top-6 h-16 w-[92px] rounded-[18px] bg-white/70" />
        </div>
        <div className="space-y-[10px]">
          <div className="h-4 w-[88%] rounded bg-[#ECE7F8]" />
          <div className="flex gap-[14px]">
            <div className="h-3 w-[53px] rounded bg-[#ECE7F8]" />
            <div className="h-3 w-[73px] rounded bg-[#ECE7F8]" />
          </div>
        </div>
        <div className="mt-auto flex gap-3">
          <div className="h-6 w-[70px] rounded-[4px] bg-[#E4D8FF]" />
          <div className="h-6 w-[93px] rounded-[4px] bg-[#F8E9E3]" />
        </div>
      </div>
    </div>
  ));
}
