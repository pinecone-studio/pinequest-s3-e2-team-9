import { quickActions } from "../dashboard-data";

export function QuickActionsSection() {
  return (
    <section className="mt-8 space-y-3">
      <h2 className="text-[14px] font-medium text-[#52555B]">Түргэн үйлдлүүд</h2>
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {quickActions.map((action) => {
          const Icon = action.icon;
          const isPrimary = action.label === "Шалгалт үүсгэх";
          return (
            <button
              key={action.label}
              className={`flex items-center justify-center gap-2 rounded-md border px-3 py-4 text-[14px] font-medium shadow-sm transition ${action.tone}`}
            >
              <Icon
                className={`h-4 w-4 ${isPrimary ? "text-white" : "text-[#0F1216]"}`}
              />
              {action.label}
            </button>
          );
        })}
      </div>
    </section>
  );
}
