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
    <div className="acura-shell">
      <aside className="acura-sidebar">
        <img src="/img/eventize.png" alt="Eventize" />
        {navItems.map(([label, href]) => (
          <Link key={href} href={href} style={{ background: pathname === href ? "#1d2939" : undefined, color: pathname === href ? "white" : undefined }}>
            {label}
          </Link>
        ))}
        <button className="acura-button secondary" style={{ width: "100%", marginTop: 16 }} onClick={logout}>Cerrar sesión</button>
      </aside>
      <main className="acura-main">{children}</main>
    </div>
  );
}
