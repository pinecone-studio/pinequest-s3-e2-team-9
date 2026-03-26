import {
  AlertIcon,
  ArchiveIcon,
  CalendarIcon,
  WarningIcon,
} from "../icons";
import type { AttentionCardView } from "../dashboard/dashboard-types";

type AttentionSectionProps = {
  cards: AttentionCardView[];
};

const toneMap: Record<
  AttentionCardView["tone"],
  { wrapper: string; icon: string }
> = {
  warning: {
    wrapper: "bg-[#EAB5321A]",
    icon: "text-[#EAB532]",
  },
  neutral: {
    wrapper: "bg-[#F0F2F5]",
    icon: "text-[#52555B]",
  },
  danger: {
    wrapper: "bg-[#D409241A]",
    icon: "text-[#D40924]",
  },
  success: {
    wrapper: "bg-[#12B76A1A]",
    icon: "text-[#12B76A]",
  },
};

const iconMap = {
  alert: AlertIcon,
  calendar: CalendarIcon,
  archive: ArchiveIcon,
  activity: WarningIcon,
} satisfies Record<AttentionCardView["icon"], typeof AlertIcon>;

export function AttentionSection({ cards }: AttentionSectionProps) {
  return (
    <section className="mt-10 space-y-3">
      <h2 className="text-[14px] font-medium text-[#52555B]">
        Анхаарах шаардлагатай
      </h2>
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {cards.map((card) => {
          const Icon = iconMap[card.icon];
          const tone = toneMap[card.tone];
          return (
            <div
              key={card.label}
              className="rounded-xl border border-[#DFE1E5] bg-white p-4 shadow-sm"
            >
              <div className="flex items-start gap-3">
                <div
                  className={`flex h-8 w-8 items-center justify-center rounded-lg ${tone.wrapper}`}
                >
                  <Icon className={`h-4 w-4 ${tone.icon}`} />
                </div>
                <div className="space-y-1">
                  <p className="text-[24px] font-semibold text-[#0F1216]">
                    {card.value.toLocaleString("mn-MN")}
                  </p>
                  <p className="text-[12px] text-[#52555B]">{card.label}</p>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
