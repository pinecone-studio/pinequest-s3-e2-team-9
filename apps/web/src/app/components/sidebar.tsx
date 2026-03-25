import { navItems } from "./dashboard-data";

export function Sidebar() {
  return (
    <aside className="w-full border-b border-[#E4E7EC] bg-[#F6F9FC] lg:w-[224px] lg:border-b-0 lg:border-r">
      <div className="flex h-14 items-center gap-2 border-b border-[#E4E7EC] px-4">
        <div className="flex h-6 w-6 items-center justify-center rounded-full bg-[conic-gradient(from_120deg,#5B7CFF,#7DD3FC,#5B7CFF)] text-[10px] font-semibold text-white">
          S+
        </div>
        <span className="text-[16px] font-semibold text-[#0F1216]">
          Шалгалт+
        </span>
      </div>
      <nav className="flex-1 space-y-1 px-3 py-3 text-[14px]">
        {navItems.map((item) => {
          const Icon = item.icon;
          return (
            <button
              key={item.label}
              className={`flex w-full items-center gap-3 rounded-lg px-3 py-2 text-left transition ${
                item.active
                  ? "bg-[#00267F] text-white shadow-sm"
                  : "text-[#0F1216B3] hover:bg-white"
              }`}
            >
              <Icon
                className={`h-4 w-4 ${
                  item.active ? "text-white" : "text-[#0F1216B3]"
                }`}
              />
              <span className="font-medium">{item.label}</span>
            </button>
          );
        })}
      </nav>
    </aside>
  );
}
