"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";

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

export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();

  const [eventsOpen, setEventsOpen] = useState(
    pathname === "/Events" ||
    pathname === "/CreateEvent" ||
    pathname === "/ReportsByEvent" ||
    pathname === "/Cashier/CashierEvent"
  );

  const [reportsOpen, setReportsOpen] = useState(
    pathname === "/ReportsByEvent" || pathname === "/Cashier/CashierEvent"
  );

  const [teamOpen, setTeamOpen] = useState(
    pathname === "/Users" || pathname === "/Role"
  );

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
              Nazul Garrido
            </p>
            <p className="text-[14px] leading-4 text-[#003a8c]">
              Organizador de
              <br />
              Eventos
            </p>
          </div>
        </div>

        <nav className="flex-1 px-4">
          <Link
            href="/DashBoard"
            className="mb-5 flex items-center gap-3 px-1 text-[15px] font-bold text-[#302a45] transition hover:text-[#6b35f5]"
          >
            <span className="text-[#6b35f5]">
              <MenuIcon />
            </span>
            Dashboard
          </Link>

          <div className="mb-5">
            <button
              type="button"
              onClick={() => setEventsOpen((value) => !value)}
              className="flex w-full cursor-pointer items-center justify-between px-1 text-[15px] font-bold text-[#302a45] transition hover:text-[#6b35f5]"
            >
              <span className="flex items-center gap-3">
                <span className="text-[#6b35f5]">
                  <MenuIcon />
                </span>
                Eventos
              </span>

              <span className="text-[#6b35f5]">
                <Chevron open={eventsOpen} />
              </span>
            </button>

            {eventsOpen ? (
              <div className="mt-5 space-y-5 pl-[35px]">
                <Link
                  href="/CreateEvent"
                  className="block text-[15px] font-normal text-[#1f2337] transition hover:text-[#6b35f5]"
                >
                  Crear Evento
                </Link>

                <Link
                  href="/Events"
                  className="block text-[15px] font-normal text-[#1f2337] transition hover:text-[#6b35f5]"
                >
                  Mis Eventos
                </Link>

                <button
                  type="button"
                  onClick={() => setReportsOpen((value) => !value)}
                  className="flex w-full cursor-pointer items-center justify-between text-[15px] font-bold text-[#302a45] transition hover:text-[#6b35f5]"
                >
                  <span>Reportes</span>

                  <span className="text-[#6b35f5]">
                    <Chevron open={reportsOpen} />
                  </span>
                </button>

                {reportsOpen ? (
                  <div className="space-y-5 pl-0">
                    <Link
                      href="/ReportsByEvent"
                      className="block text-[15px] font-normal text-[#1f2337] transition hover:text-[#6b35f5]"
                    >
                      Órdenes
                    </Link>

                    <Link
                      href="/Cashier/CashierEvent"
                      className="block text-[15px] font-normal text-[#1f2337] transition hover:text-[#6b35f5]"
                    >
                      Caja
                    </Link>
                  </div>
                ) : null}
              </div>
            ) : null}
          </div>

          <div className="mb-5">
            <button
              type="button"
              onClick={() => setTeamOpen((value) => !value)}
              className="flex w-full cursor-pointer items-center justify-between px-1 text-[15px] font-bold text-[#302a45] transition hover:text-[#6b35f5]"
            >
              <span className="flex items-center gap-3">
                <span className="text-[#6b35f5]">
                  <MenuIcon />
                </span>
                Administrar Equipo
              </span>

              <span className="text-[#6b35f5]">
                <Chevron open={teamOpen} />
              </span>
            </button>

            {teamOpen ? (
              <div className="mt-5 space-y-5 pl-[35px]">
                <Link
                  href="/Users"
                  className="block text-[15px] font-normal text-[#1f2337] transition hover:text-[#6b35f5]"
                >
                  Usuarios
                </Link>

                <Link
                  href="/Role"
                  className="block text-[15px] font-normal text-[#1f2337] transition hover:text-[#6b35f5]"
                >
                  Roles
                </Link>
              </div>
            ) : null}
          </div>
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