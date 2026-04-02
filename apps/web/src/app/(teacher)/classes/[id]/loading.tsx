import { AppShell } from "../../components/app-shell";

export default function ClassDetailLoading() {
  return (
    <AppShell>
      <section className="scrollbar-hidden relative flex min-h-[1032px] w-[1184px] flex-none flex-col items-start bg-[#FAFAFA]">
        <div className="h-[58px] w-full border-b border-[#EAECF0] bg-white" />

        <div className="flex min-h-[948px] w-[1184px] flex-col items-start gap-9 px-8 pt-[26px]">
          <div className="flex h-9 w-[1120px] items-center gap-4">
            <div className="h-9 w-9 animate-pulse rounded-[10px] bg-[#E7E4F7]" />
            <div className="flex items-center gap-6">
              <div className="h-9 w-32 animate-pulse rounded bg-[#E7E4F7]" />
              <div className="h-[22px] w-20 animate-pulse rounded-[8.4px] bg-[#F1EEFB]" />
              <div className="h-4 w-16 animate-pulse rounded bg-[#F1EEFB]" />
            </div>
          </div>

          <div className="flex w-[1109px] items-start gap-9">
            <div className="flex h-[338px] w-[440px] flex-none flex-col gap-10 rounded-2xl bg-white p-7 shadow-[0px_4px_8px_-2px_rgba(0,0,0,0.1),0px_2px_4px_-2px_rgba(0,0,0,0.06)]">
              <div className="h-[42px] w-56 animate-pulse rounded bg-[#E7E4F7]" />
              <div className="space-y-4">
                <div className="h-4 w-20 animate-pulse rounded bg-[#F1EEFB]" />
                <div className="flex h-[190px] items-end gap-4">
                  <div className="h-full w-10 animate-pulse rounded bg-[#F8F6FF]" />
                  <div className="flex flex-1 items-end justify-center gap-[34px]">
                    {Array.from({ length: 5 }).map((_, index) => (
                      <div
                        key={index}
                        className="w-[27px] animate-pulse rounded-[6px] bg-[#E4D8FF]"
                        style={{ height: `${80 + ((index % 3) + 1) * 20}px` }}
                      />
                    ))}
                  </div>
                </div>
              </div>
            </div>

            <div className="grid h-[338px] w-[633px] flex-1 grid-cols-2 gap-[18px]">
              {Array.from({ length: 4 }).map((_, index) => (
                <div
                  key={index}
                  className="flex h-[160px] animate-pulse flex-col justify-between rounded-xl bg-white p-5 shadow-[0px_4px_8px_-2px_rgba(0,0,0,0.1),0px_2px_4px_-2px_rgba(0,0,0,0.06)]"
                >
                  <div className="space-y-2">
                    <div className="h-4 w-28 rounded bg-[#F1EEFB]" />
                    <div className="h-12 w-20 rounded bg-[#E7E4F7]" />
                  </div>
                  <div className="ml-auto h-[61px] w-[61px] rounded bg-[#E4D8FF]" />
                </div>
              ))}
            </div>
          </div>

          <section className="flex w-[1120px] flex-col items-start gap-4">
            <div className="flex h-9 w-full items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="h-9 w-[354px] animate-pulse rounded-[12px] bg-white shadow-[0px_1px_2px_rgba(0,0,0,0.05)]" />
                <div className="h-9 w-[226px] animate-pulse rounded-[9999px] bg-white shadow-[0px_4px_8px_-2px_rgba(0,0,0,0.1),0px_2px_4px_-2px_rgba(0,0,0,0.06)]" />
              </div>

              <div className="h-9 w-[109px] animate-pulse rounded-[4px] bg-white shadow-[0px_1px_2px_rgba(0,0,0,0.05)]" />
            </div>

            <div className="h-[267px] w-[1120px] overflow-hidden rounded-[6px] border border-[#D5D7DB] bg-white">
              <div className="animate-pulse">
                <div className="flex h-[53px] w-full bg-[#F7F7F7]">
                  {Array.from({ length: 5 }).map((_, index) => (
                    <div
                      key={index}
                      className={`flex items-center px-6 ${
                        index === 0 ? "flex-1" : "w-[200px] justify-center"
                      }`}
                    >
                      <div className="h-4 w-20 rounded bg-[#E7E4F7]" />
                    </div>
                  ))}
                </div>

                {Array.from({ length: 4 }).map((_, rowIndex) => (
                  <div
                    key={rowIndex}
                    className="flex h-[53px] w-full border-t border-[#EAECF0] bg-white"
                  >
                    <div className="flex flex-1 items-center px-6">
                      <div className="h-4 w-32 rounded bg-[#F1EEFB]" />
                    </div>
                    <div className="flex w-[200px] items-center justify-center px-2">
                      <div className="h-4 w-12 rounded bg-[#E4D8FF]" />
                    </div>
                    <div className="flex w-[200px] items-center justify-center px-2">
                      <div className="h-4 w-8 rounded bg-[#F1EEFB]" />
                    </div>
                    <div className="flex w-[200px] items-center justify-center px-2">
                      <div className="h-4 w-10 rounded bg-[#E4D8FF]" />
                    </div>
                    <div className="flex w-[60px] items-center px-2">
                      <div className="h-8 w-8 rounded bg-[#F1EEFB]" />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </section>
        </div>
      </section>
    </AppShell>
  );
}
