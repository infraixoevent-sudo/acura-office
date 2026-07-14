"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";

// Shell para las rutas /Admin/* — paridad con AdminLayout.razor del Blazor
// (chrome y sesión distintos de MainLayout, que ya usa AppShell). El Blazor
// arma su nav desde "Menu" (catálogo de roles/vistas por usuario); aquí se
// arranca con un nav estático que se amplía en cada ruta nueva del punto 6
// (backend-standards.md, Protocolo R1-R7) — el catálogo dinámico de roles
// es una migración aparte, no bloquea estas páginas.
const NAV_ITEMS: { label: string; href: string }[] = [
  { label: "Organizadores", href: "/Admin/List-of-organizers" },
];

export function AdminShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();

  function logout() {
    localStorage.clear();
    router.push("/");
  }

  const name = typeof window !== "undefined" ? localStorage.getItem("Name") : null;
  const nameRol = typeof window !== "undefined" ? localStorage.getItem("NameRol") : null;

  return (
    <div className="flex min-h-screen bg-[#f4f6fb]">
      <aside className="sticky top-0 flex h-screen w-[250px] flex-col overflow-hidden bg-white text-[#27243a] shadow-[8px_0_28px_rgba(15,23,42,0.08)]">
        <div className="flex h-[86px] items-center bg-[#27243a] px-4">
          <img
            src="/img/eventize.png"
            alt="Eventize"
            className="w-[178px] object-contain"
          />
        </div>

        <div className="px-5 pb-7 pt-6">
          <p className="truncate text-[15px] font-extrabold leading-5 text-black">
            {name ?? "Administración"}
          </p>
          <p className="text-[14px] leading-4 text-[#003a8c]">{nameRol ?? "Panel de staff"}</p>
        </div>

        <nav className="flex-1 px-4">
          {NAV_ITEMS.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={`mb-5 block px-1 text-[15px] font-bold transition hover:text-[#6b35f5] ${
                pathname === item.href ? "text-[#6b35f5]" : "text-[#302a45]"
              }`}
            >
              {item.label}
            </Link>
          ))}
        </nav>

        <button
          type="button"
          onClick={logout}
          className="mt-auto flex h-[58px] w-full cursor-pointer items-center justify-between bg-[#4a4a4a] px-4 text-[15px] font-bold text-white transition hover:bg-[#3f3f3f]"
        >
          Cerrar sesión
          <span className="text-3xl font-light leading-none">›</span>
        </button>
      </aside>

      <main className="flex-1 p-7">{children}</main>
    </div>
  );
}
