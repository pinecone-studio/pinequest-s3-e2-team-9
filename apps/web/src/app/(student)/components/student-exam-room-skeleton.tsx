export function StudentExamRoomSkeleton() {
  return (
    <div className="mx-auto flex w-full max-w-[1120px] flex-col gap-6 animate-pulse">
      <div className="grid gap-6 lg:grid-cols-[minmax(0,1.7fr)_360px]">
        <div className="rounded-[28px] border border-[#E7ECF6] bg-white/90 p-8">
          <div className="h-4 w-28 rounded-full bg-[#E7ECF6]" />
          <div className="mt-6 h-10 w-3/5 rounded-[14px] bg-[#E7ECF6]" />
          <div className="mt-4 h-4 w-full rounded-full bg-[#F2F4F7]" />
          <div className="mt-3 h-4 w-4/5 rounded-full bg-[#F2F4F7]" />
          <div className="mt-8 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            {Array.from({ length: 4 }).map((_, index) => (
              <div key={index} className="h-[104px] rounded-[20px] bg-[#F8FAFF]" />
            ))}
          </div>
        </div>
        <div className="rounded-[28px] border border-[#E7ECF6] bg-white p-6">
          <div className="h-4 w-24 rounded-full bg-[#E7ECF6]" />
          <div className="mt-4 h-8 w-4/5 rounded-[12px] bg-[#E7ECF6]" />
          <div className="mt-3 h-4 w-full rounded-full bg-[#F2F4F7]" />
          <div className="mt-2 h-4 w-5/6 rounded-full bg-[#F2F4F7]" />
          <div className="mt-8 h-12 rounded-[16px] bg-[#DCE6FF]" />
        </div>
      </div>
      <div className="grid gap-4 xl:grid-cols-2">
        {Array.from({ length: 2 }).map((_, index) => (
          <div key={index} className="h-[280px] rounded-[24px] border border-[#E7ECF6] bg-white/90" />
        ))}
      </div>
    </div>
  );
}
