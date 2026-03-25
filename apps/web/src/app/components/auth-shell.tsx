import type { PropsWithChildren } from "react";

type AuthShellProps = PropsWithChildren<{
  badge: string;
  title: string;
  description: string;
  panelEyebrow: string;
  panelTitle: string;
  panelDescription: string;
}>;

const authHighlights = [
  {
    title: "Dashboard төв",
    description: "Идэвхтэй шалгалт, сануулга, сүүлийн үйлдлүүдээ нэг урсгал дээрээс харна.",
  },
  {
    title: "Асуултын сан",
    description: "Сэдэвчилсэн асуултуудыг хамгаалалттай орчноос удирдаж, шалгалт руу холбоно.",
  },
  {
    title: "Session control",
    description: "Багшийн account, нэвтрэлт, гаралтыг нэг мөр аюулгүй удирдах auth flow.",
  },
];

export function AuthShell({
  badge,
  title,
  description,
  panelEyebrow,
  panelTitle,
  panelDescription,
  children,
}: AuthShellProps) {
  return (
    <main className="relative min-h-screen overflow-hidden bg-[#F2F5FA]">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,_rgba(254,240,138,0.42),_transparent_24%),radial-gradient(circle_at_85%_18%,_rgba(59,130,246,0.20),_transparent_22%),linear-gradient(180deg,#F7FAFF_0%,#EFF4FB_48%,#F6F2EA_100%)]" />
      <div className="absolute inset-y-0 left-0 w-[42%] bg-[linear-gradient(180deg,rgba(11,31,58,0.06),transparent)] blur-3xl" />

      <div className="relative mx-auto flex min-h-screen w-full max-w-7xl flex-col gap-8 px-5 py-6 sm:px-8 lg:flex-row lg:items-stretch lg:px-10 lg:py-8">
        <section className="order-2 flex-1 lg:order-1">
          <div className="flex h-full flex-col justify-between rounded-[36px] border border-[#E5D5BE] bg-[linear-gradient(145deg,rgba(255,247,237,0.96)_0%,rgba(255,255,255,0.90)_38%,rgba(237,245,255,0.94)_100%)] p-7 shadow-[0_30px_90px_rgba(15,23,42,0.10)] sm:p-10">
            <div className="space-y-8">
              <div className="inline-flex items-center gap-3 rounded-full border border-[#D5C5AF] bg-white/80 px-4 py-2 text-[12px] font-semibold uppercase tracking-[0.24em] text-[#0B3B84] shadow-[0_12px_28px_rgba(15,23,42,0.08)] backdrop-blur">
                <span className="h-2.5 w-2.5 rounded-full bg-[#F59E0B]" />
                {badge}
              </div>

              <div className="space-y-5">
                <div className="inline-flex items-center rounded-full bg-[#0F172A] px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.22em] text-white">
                  Teacher Console
                </div>
                <h1 className="max-w-2xl text-4xl font-semibold leading-[0.94] tracking-[-0.06em] text-[#101828] sm:text-6xl">
                  {title}
                </h1>
                <p className="max-w-2xl text-[17px] leading-8 text-[#42526B] sm:text-[18px]">
                  {description}
                </p>
              </div>

              <div className="grid gap-4 lg:grid-cols-3">
                {authHighlights.map((highlight, index) => (
                  <article
                    key={highlight.title}
                    className="rounded-[24px] border border-white/80 bg-white/78 p-5 shadow-[0_20px_45px_rgba(15,23,42,0.08)] backdrop-blur"
                  >
                    <div className="mb-4 inline-flex h-10 w-10 items-center justify-center rounded-2xl bg-[linear-gradient(135deg,#0B5FFF,#69A4FF)] text-[13px] font-semibold text-white shadow-[0_10px_22px_rgba(11,95,255,0.26)]">
                      0{index + 1}
                    </div>
                    <h2 className="text-[18px] font-semibold text-[#101828]">
                      {highlight.title}
                    </h2>
                    <p className="mt-2 text-[14px] leading-6 text-[#526581]">
                      {highlight.description}
                    </p>
                  </article>
                ))}
              </div>
            </div>

            <div className="mt-8 grid gap-4 rounded-[28px] border border-[#C9D8EE] bg-[#0F172A] p-5 text-white shadow-[0_22px_50px_rgba(15,23,42,0.20)] sm:grid-cols-[1.1fr_0.9fr] sm:items-center">
              <div>
                <p className="text-[12px] font-semibold uppercase tracking-[0.24em] text-[#93C5FD]">
                  Protected Workspace
                </p>
                <p className="mt-2 text-[22px] font-semibold tracking-[-0.04em]">
                  Багшийн dashboard зөвхөн нэвтэрсэн үед нээгдэнэ.
                </p>
              </div>
              <div className="grid gap-3 rounded-[22px] border border-white/10 bg-white/5 p-4 text-[14px] text-[#D0D5DD]">
                <div className="flex items-center justify-between">
                  <span>Auth state</span>
                  <span className="font-semibold text-white">Protected session</span>
                </div>
                <div className="flex items-center justify-between">
                  <span>Routing</span>
                  <span className="font-semibold text-white">Local sign-in</span>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="order-1 w-full lg:order-2 lg:max-w-[520px]">
          <div className="relative h-full rounded-[36px] border border-white/80 bg-white/70 p-3 shadow-[0_28px_80px_rgba(15,23,42,0.14)] backdrop-blur">
            <div className="absolute inset-x-10 top-3 h-24 rounded-full bg-[radial-gradient(circle,_rgba(11,95,255,0.22),_transparent_66%)] blur-3xl" />
            <div className="relative rounded-[30px] border border-[#DCE6F2] bg-[linear-gradient(180deg,#FFFFFF_0%,#F8FBFF_100%)] p-6 sm:p-8">
              <div className="mb-8 space-y-3">
                <div className="inline-flex items-center rounded-full border border-[#D6E4F5] bg-[#EFF6FF] px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-[#0B5FFF]">
                  {panelEyebrow}
                </div>
                <div className="space-y-2">
                  <h2 className="text-[30px] font-semibold tracking-[-0.05em] text-[#101828]">
                    {panelTitle}
                  </h2>
                  <p className="max-w-md text-[15px] leading-7 text-[#526581]">
                    {panelDescription}
                  </p>
                </div>
              </div>

              {children}
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}
