"use client";

import { useEffect, useState } from "react";
import type { UserMenu } from "@/types/acura";

// Lee el árbol de menú persistido por setSessionValues tras el LogIn —
// espejo del "Menu" que el Blazor original guarda en localStorage
// (Pages/Index.razor) y que MainLayout.razor/AdminLayout.razor leen en
// OnInitializedAsync para armar el nav por rol.
export function readStoredUserMenu(): UserMenu[] {
  if (typeof window === "undefined") return [];

  try {
    const raw = localStorage.getItem("userMenu");
    if (!raw) return [];

    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? (parsed as UserMenu[]) : [];
  } catch {
    return [];
  }
}

// El menú no cambia durante la sesión, se lee una sola vez al montar el
// shell (mismo momento que Blazor lo lee en OnInitializedAsync).
export function useStoredUserMenu(): UserMenu[] {
  const [menu, setMenu] = useState<UserMenu[]>([]);

  useEffect(() => {
    setMenu(readStoredUserMenu());
  }, []);

  return menu;
}

// Espejo de "menusUnicos" en MainLayout.razor (GroupBy(Description).First()):
// colapsa entradas de nivel superior repetidas — un usuario puede heredar la
// misma vista desde más de un rol. AdminLayout.razor NO hace este dedupe.
export function dedupeByDescription(items: UserMenu[]): UserMenu[] {
  const seen = new Set<string>();
  return items.filter((item) => {
    if (seen.has(item.description)) return false;
    seen.add(item.description);
    return true;
  });
}

// Recorre el árbol y responde si `pathname` cuelga de este item — usado para
// abrir un grupo por default cuando la ruta activa vive dentro de él.
export function subtreeContainsPath(item: UserMenu, pathname: string | null): boolean {
  if (!pathname) return false;
  if (item.url === pathname) return true;
  return (item.childMenu ?? []).some((child) => subtreeContainsPath(child, pathname));
}
