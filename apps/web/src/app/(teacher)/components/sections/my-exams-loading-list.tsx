const skeletonRows = Array.from({ length: 6 }, (_, index) => index);

export function MyExamsLoadingList() {
  return skeletonRows.map((row) => (
    <div
      key={row}
      className="h-[215px] w-[268px] max-w-full animate-pulse rounded-[6px] border border-[#E4E4E4] bg-white p-3 shadow-[0px_3.22px_4.83px_rgba(0,0,0,0.09)]"
    >
      <div className="h-24 rounded-[4px] bg-[#F7F1E8] p-4">
        <div className="flex items-center gap-3">
          <div className="h-[88px] w-[88px] rounded-[4px] bg-[#F2D48A]" />
          <div className="flex-1 space-y-3">
            <div className="ml-auto h-5 w-28 rounded-full bg-white/80" />
            <div className="h-6 w-24 rounded bg-white/80" />
          </div>
        </div>
      </div>
      <div className="mt-4 space-y-3">
        <div className="h-4 w-[88%] rounded bg-[#ECE7F8]" />
        <div className="flex gap-3">
          <div className="h-3 w-14 rounded bg-[#ECE7F8]" />
          <div className="h-3 w-16 rounded bg-[#ECE7F8]" />
        </div>
      </div>
      <div className="mt-5 flex gap-3">
        <div className="h-8 w-24 rounded-[4px] bg-[#E4D8FF]" />
        <div className="h-8 w-28 rounded-[4px] bg-[#F8E9E3]" />
      </div>
    </div>
  ));
}
