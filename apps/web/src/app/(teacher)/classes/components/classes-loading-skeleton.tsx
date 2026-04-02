const gridSkeletonRows = Array.from({ length: 6 }, (_, index) => index);
const listSkeletonRows = Array.from({ length: 2 }, (_, index) => index);

type ClassesLoadingSkeletonProps = {
  view: "grid" | "list";
};

export function ClassesLoadingSkeleton({ view }: ClassesLoadingSkeletonProps) {
  if (view === "list") {
    return (
      <div className="h-[180.4px] w-[1120px] max-w-full flex-none self-stretch overflow-hidden rounded-[8px] border border-[#E4E4E7] bg-white [font-family:var(--font-inter)]">
        <div className="h-full overflow-hidden animate-pulse">
          <table className="w-[1120px] table-fixed border-collapse">
            <thead className="bg-[rgba(244,244,245,0.5)]">
              <tr className="h-[52px]">
                <th className="w-[216px] px-4 py-4"><div className="h-4 w-20 rounded bg-[#E7E4F7]" /></th>
                <th className="w-[160px] px-4 py-4"><div className="h-4 w-12 rounded bg-[#E7E4F7]" /></th>
                <th className="w-[126px] px-4 py-4"><div className="h-4 w-14 rounded bg-[#E7E4F7]" /></th>
                <th className="w-[100px] px-4 py-4 pr-0"><div className="h-4 w-16 rounded bg-[#E7E4F7]" /></th>
                <th className="w-[100px] px-4 py-4"><div className="h-4 w-16 rounded bg-[#E7E4F7]" /></th>
                <th className="w-[274px] px-4 py-4"><div className="h-4 w-24 rounded bg-[#E7E4F7]" /></th>
                <th className="w-[142px] px-4 py-4 pr-[26px]"><div className="ml-auto h-4 w-12 rounded bg-[#E7E4F7]" /></th>
              </tr>
            </thead>
            <tbody>
              {listSkeletonRows.map((row) => (
                <tr key={row} className="h-[65px] border-t border-[#E4E4E7]">
                  <td className="w-[214px] px-4 py-5"><div className="h-5 w-20 rounded bg-[#F1EEFB]" /></td>
                  <td className="w-[160px] px-4 py-5"><div className="h-4 w-16 rounded bg-[#F1EEFB]" /></td>
                  <td className="w-[126px] px-4 py-5 pl-[18px]"><div className="h-4 w-6 rounded bg-[#F1EEFB]" /></td>
                  <td className="w-[100px] px-4 py-5 pr-0"><div className="h-4 w-10 rounded bg-[#E4D8FF]" /></td>
                  <td className="w-[100px] px-4 py-5 pl-[18px]"><div className="h-4 w-4 rounded bg-[#F1EEFB]" /></td>
                  <td className="w-[276px] px-4 py-5 pl-[18px]"><div className="h-4 w-40 rounded bg-[#F1EEFB]" /></td>
                  <td className="w-[142px] px-4 py-4 pr-[34px]"><div className="ml-auto h-8 w-[118px] rounded-[8.4px] bg-[#F1EEFB]" /></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    );
  }

  return (
    <div className="flex w-[1120px] flex-row flex-wrap content-start items-start gap-4">
      {gridSkeletonRows.map((row) => (
        <div
          key={row}
          className="box-border flex h-[233.6px] w-[268px] flex-none flex-col items-start gap-[10px] rounded-[6px] border border-[#E4E4E4] bg-white px-4 py-5 shadow-[0px_3.22191px_4.83286px_rgba(0,0,0,0.09)]"
        >
          <div className="flex h-[193.6px] w-[236px] flex-col items-start gap-4 self-stretch animate-pulse">
            <div className="flex h-[21.6px] w-[236px] items-start justify-between self-stretch">
              <div className="h-[21.6px] w-20 rounded-[8.4px] border border-[#E4E4E7] bg-[#F8F6FF]" />
              <div className="h-4 w-14 rounded bg-[#F1EEFB]" />
            </div>
            <div className="flex h-[77px] w-[236px] flex-col items-start gap-6 self-stretch">
              <div className="h-6 w-24 rounded bg-[#E7E4F7]" />
              <div className="space-y-3">
                <div className="h-3 w-[200px] rounded bg-[#F1EEFB]" />
                <div className="h-3 w-[108px] rounded bg-[#F1EEFB]" />
              </div>
            </div>
            <div className="h-0 w-[236px] border-t border-[#E4E4E4]" />
            <div className="h-3 w-40 rounded bg-[#F1EEFB]" />
            <div className="mt-auto h-6 w-[236px] rounded-[4px] bg-[#E4D8FF]" />
          </div>
        </div>
      ))}
    </div>
  );
}
