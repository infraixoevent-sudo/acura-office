"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useStoredUserMenu } from "@/lib/userMenu";
import type { UserMenu } from "@/types/acura";

function Chevron({ open }: { open: boolean }) {
  return (
    <svg
      width="15"
      height="15"
      viewBox="0 0 24 24"
      fill="none"
      className={`transition-transform duration-200 ${open ? "rotate-180" : ""}`}
    >
      <path
        d="M6 9L12 15L18 9"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

// Grupo con hijos — espejo de AdminLayout.razor: a diferencia de MainLayout,
// el original no dedupea (`lista_menu` se recorre tal cual, sin
// GroupBy/DistinctBy) y el bloque de hijos nace expandido
// (`class="collapse show"`, no atado a la ruta activa).
function NavGroup({ item, pathname }: { item: UserMenu; pathname: string | null }) {
  const [open, setOpen] = useState(true);
  const children = item.childMenu ?? [];

  return (
    <div className="mb-5">
      <button
        type="button"
        onClick={() => setOpen((value) => !value)}
        className="flex w-full cursor-pointer items-center justify-between px-1 text-[15px] font-bold text-[#302a45] transition hover:text-[#6b35f5]"
      >
        {item.description}

        <span className="text-[#6b35f5]">
          <Chevron open={open} />
        </span>
      </button>

      {open ? (
        <div className="mt-5 space-y-5 pl-[35px]">
          {children.map((subItem) => (
            <Link
              key={subItem.idView}
              href={subItem.url}
              className={`block text-[15px] font-normal transition hover:text-[#6b35f5] ${
                pathname === subItem.url ? "text-[#6b35f5]" : "text-[#1f2337]"
              }`}
            >
              {subItem.description}
            </Link>
          ))}
        </div>
      ) : null}
    </div>
  );
}

export function AdminShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const userMenu = useStoredUserMenu();

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
          {userMenu.map((item) =>
            item.isMain && (item.childMenu?.length ?? 0) === 0 ? (
              <Link
                key={item.idView}
                href={item.url}
                className={`mb-5 block px-1 text-[15px] font-bold transition hover:text-[#6b35f5] ${
                  pathname === item.url ? "text-[#6b35f5]" : "text-[#302a45]"
                }`}
              >
                {item.description}
              </Link>
            ) : (
              <NavGroup key={item.idView} item={item} pathname={pathname} />
            )
          )}
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
