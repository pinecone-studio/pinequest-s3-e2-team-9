import { attentionCards } from "../dashboard-data";

export function AttentionSection() {
  return (
    <section className="mt-10 space-y-3">
      <h2 className="text-[14px] font-medium text-[#52555B]">
        Анхаарах шаардлагатай
      </h2>
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {attentionCards.map((card) => {
          const Icon = card.icon;
          return (
            <div
              key={card.label}
              className="rounded-xl border border-[#DFE1E5] bg-white p-4 shadow-sm"
            >
              <div className="flex items-start gap-3">
                <div
                  className={`flex h-8 w-8 items-center justify-center rounded-lg ${card.tone}`}
                >
                  <Icon className="h-4 w-4" />
                </div>
                <div className="space-y-1">
                  <p className="text-[24px] font-semibold text-[#0F1216]">
                    {card.value}
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
