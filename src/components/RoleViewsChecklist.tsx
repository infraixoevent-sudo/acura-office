import type { RoleView } from "@/types/acura";
import { isChildRoleView } from "@/lib/roleViews";

export function RoleViewsChecklist({
  views,
  loading,
  selected,
  onToggle,
}: {
  views: RoleView[];
  loading: boolean;
  selected: number[];
  onToggle: (idView: number) => void;
}) {
  if (loading) {
    return <p className="text-sm text-slate-400">Cargando vistas...</p>;
  }

  if (views.length === 0) {
    return <p className="text-sm text-slate-400">No hay vistas disponibles</p>;
  }

  return (
    <ul className="flex flex-col gap-2">
      {views.map((view) => {
        const isChild = isChildRoleView(view);
        return (
          <li key={view.idView}>
            <label
              className={`flex items-center gap-3 ${isChild ? "cursor-not-allowed opacity-40" : "cursor-pointer"}`}
            >
              <input
                type="checkbox"
                checked={selected.includes(view.idView)}
                onChange={() => !isChild && onToggle(view.idView)}
                disabled={isChild}
                className="h-4 w-4 rounded border-slate-300 accent-[#6b35f5] disabled:cursor-not-allowed"
              />
              <span className="text-sm text-slate-700">{view.name}</span>
            </label>
          </li>
        );
      })}
    </ul>
  );
}
