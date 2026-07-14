"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { dedupeByDescription, subtreeContainsPath, useStoredUserMenu } from "@/lib/userMenu";
import type { UserMenu } from "@/types/acura";

function MenuIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
      <path
        d="M4 5H20V19H4V5Z"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinejoin="round"
      />
      <path
        d="M7 16L10.5 12.5L13 15L17 10"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M7 8H9"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
      />
    </svg>
  );
}

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

function LogoutIcon() {
  return (
    <svg width="19" height="19" viewBox="0 0 24 24" fill="none">
      <path
        d="M12 3V12"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
      />
      <path
        d="M6.3 6.8A8 8 0 1 0 17.7 6.8"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
      />
    </svg>
  );
}

// La vista "/ReportsByEvent" se renderiza como su propio sub-grupo colapsable
// con una única entrada de texto fijo "Órdenes" — espejo exacto de
// MainLayout.razor (el resto de las vistas hijas se listan planas, sin este
// segundo nivel).
function ReportsSubGroup({ view, pathname }: { view: UserMenu; pathname: string | null }) {
  const [open, setOpen] = useState(() => subtreeContainsPath(view, pathname));

  return (
    <div>
      <button
        type="button"
        onClick={() => setOpen((value) => !value)}
        className="flex w-full cursor-pointer items-center justify-between text-[15px] font-bold text-[#302a45] transition hover:text-[#6b35f5]"
      >
        <span>{view.description}</span>

        <span className="text-[#6b35f5]">
          <Chevron open={open} />
        </span>
      </button>

      {open ? (
        <div className="mt-5 space-y-5 pl-0">
          <Link
            href={view.url}
            className="block text-[15px] font-normal text-[#1f2337] transition hover:text-[#6b35f5]"
          >
            Órdenes
          </Link>
        </div>
      ) : null}
    </div>
  );
}

// Grupo de nivel superior con hijos — espejo de "menusUnicos" en
// MainLayout.razor: los hijos también se dedupean por Description
// (DistinctBy(c => c.Description) en el original).
function NavGroup({ item, pathname }: { item: UserMenu; pathname: string | null }) {
  const [open, setOpen] = useState(() => subtreeContainsPath(item, pathname));
  const children = dedupeByDescription(item.childMenu ?? []);

  return (
    <div className="mb-5">
      <button
        type="button"
        onClick={() => setOpen((value) => !value)}
        className="flex w-full cursor-pointer items-center justify-between px-1 text-[15px] font-bold text-[#302a45] transition hover:text-[#6b35f5]"
      >
        <span className="flex items-center gap-3">
          <span className="text-[#6b35f5]">
            <MenuIcon />
          </span>
          {item.description}
        </span>

        <span className="text-[#6b35f5]">
          <Chevron open={open} />
        </span>
      </button>

      {open ? (
        <div className="mt-5 space-y-5 pl-[35px]">
          {children.map((subItem) =>
            subItem.url === "/ReportsByEvent" ? (
              <ReportsSubGroup key={subItem.idView} view={subItem} pathname={pathname} />
            ) : (
              <Link
                key={subItem.idView}
                href={subItem.url}
                className="block text-[15px] font-normal text-[#1f2337] transition hover:text-[#6b35f5]"
              >
                {subItem.description}
              </Link>
            )
          )}
        </div>
      ) : null}
    </div>
  );
}

export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const userMenu = useStoredUserMenu();
  const menuItems = dedupeByDescription(userMenu);

  const name = typeof window !== "undefined" ? localStorage.getItem("Name") : null;
  const nameRol = typeof window !== "undefined" ? localStorage.getItem("NameRol") : null;

  function logout() {
    localStorage.clear();
    router.push("/");
  }

  return (
    <div className="flex min-h-screen bg-[#f4f6fb]">
      <aside className="sticky top-0 flex h-screen w-[250px] flex-col overflow-hidden bg-white text-[#27243a] shadow-[8px_0_28px_rgba(15,23,42,0.08)]">
        <div className="flex h-[86px] items-center bg-[#10d46e] px-4">
          <img
            src="/img/eventize.png"
            alt="Eventize"
            className="w-[178px] object-contain"
          />
        </div>

        <div className="flex items-center gap-3 px-5 pb-7 pt-6">
          <div className="flex h-[48px] w-[48px] shrink-0 items-center justify-center overflow-hidden rounded-full bg-white">
            <img
              src="/img/icon.png"
              alt="Organizer"
              className="h-full w-full object-contain"
            />
          </div>

          <div className="min-w-0">
            <p className="truncate text-[15px] font-extrabold leading-5 text-black">
              {name ?? "Organizador"}
            </p>
            <p className="text-[14px] leading-4 text-[#003a8c]">
              {nameRol ?? "Organizador de Eventos"}
            </p>
          </div>
        </div>

        <nav className="flex-1 px-4">
          {menuItems.map((item) =>
            (item.childMenu?.length ?? 0) > 0 ? (
              <NavGroup key={item.idView} item={item} pathname={pathname} />
            ) : (
              <Link
                key={item.idView}
                href={item.url}
                className="mb-5 flex items-center gap-3 px-1 text-[15px] font-bold text-[#302a45] transition hover:text-[#6b35f5]"
              >
                <span className="text-[#6b35f5]">
                  <MenuIcon />
                </span>
                {item.description}
              </Link>
            )
          )}
        </nav>

        <button
          type="button"
          onClick={logout}
          className="mt-auto flex h-[58px] w-full cursor-pointer items-center justify-between bg-[#4a4a4a] px-4 text-[15px] font-bold text-white transition hover:bg-[#3f3f3f]"
        >
          <span className="flex items-center gap-3">
            <LogoutIcon />
            Cerrar sesión
          </span>

          <span className="text-3xl font-light leading-none">›</span>
        </button>
      </aside>

      <main className="flex-1 p-7">{children}</main>
    </div>
  );
}
