"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";

const navItems = [
  ["Inicio", "/DashBoard"],
  ["Eventos", "/Events"],
  ["Crear evento", "/CreateEvent"],
  ["Boletos", "/Tickets"],
  ["Crear boleto", "/CreateTicket"],
  ["Usuarios", "/Users"],
  ["Roles", "/Role"],
  ["Caja", "/Cashier/CashierEvent"],
  ["Swagger", "/swagger"],
];

export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();

  function logout() {
    localStorage.clear();
    router.push("/");
  }

  return (
    <div className="flex min-h-screen bg-[#f4f6fb]">
      <aside className="sticky top-0 h-screen w-[250px] overflow-y-auto bg-slate-900 px-5 py-6 text-white">
        <img src="/img/eventize.png" alt="Eventize" className="mb-8 max-w-[150px]" />

        <nav className="space-y-1">
          {navItems.map(([label, href]) => {
            const active = pathname === href;

            return (
              <Link
                key={href}
                href={href}
                className={`block rounded-xl px-3 py-2 text-sm transition ${active
                  ? "bg-slate-700 text-white"
                  : "text-slate-300 hover:bg-slate-800 hover:text-white"
                  }`}
              >
                {label}
              </Link>
            );
          })}
        </nav>

        <button
          type="button"
          onClick={logout}
          className="mt-6 w-full rounded-full border border-slate-600 bg-white px-4 py-2 text-sm font-bold text-slate-900 transition hover:bg-slate-100"
        >
          Cerrar sesión
        </button>
      </aside>

      <main className="flex-1 p-7">{children}</main>
    </div>
  );
}