import type { RoleView } from "@/types/acura";

// Grupos padre→hijos de vistas seleccionables al armar un rol — espejo exacto
// de isScreen() en Role.razor/EditRole.razor del Blazor original. Los IDs son
// fijos en el sistema legacy (el catálogo real solo tiene las vistas 1,2,3,4,
// 7,8,11,12 — ver el seed de Users_Views en scriptSqlServerAcura.utf8.sql):
// activar/desactivar una vista "padre" activa/desactiva sus hijas con ella.
const VIEW_GROUPS: Record<number, number[]> = {
  1: [1],
  2: [2, 3, 4],
  7: [7, 8],
  11: [11, 12],
};

// Las vistas hijas (Main !== 0) nunca se togglean directamente — solo vía su padre.
export function isChildRoleView(view: RoleView): boolean {
  return view.main !== null && view.main !== undefined && view.main !== 0;
}

export function toggleRoleView(selected: number[], idView: number): number[] {
  const group = VIEW_GROUPS[idView];
  if (!group) return selected;

  const isSelected = selected.includes(idView);
  return isSelected
    ? selected.filter((v) => !group.includes(v))
    : [...new Set([...selected, ...group])];
}

const ROLE_NAME_PATTERN = /^[a-zA-Z0-9\s]{1,100}$/;

// Espejo de AgregarRol()/EditRol() del Blazor: primero valida campos
// faltantes (nombre y/o vistas, en un solo mensaje combinado); solo si
// ambos están presentes se valida el formato del nombre por separado.
export function getMissingRoleFields(name: string, selectedViews: number[]): string[] {
  const missing: string[] = [];

  if (!name.trim()) missing.push("Escribe un Nombre de rol");
  if (selectedViews.length === 0) missing.push("Selecciona permisos");

  return missing;
}

export function isValidRoleName(name: string): boolean {
  return ROLE_NAME_PATTERN.test(name);
}
