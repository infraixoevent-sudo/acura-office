"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { AppShell } from "@/components/AppShell";
import { Pagination } from "@/components/Pagination";
import { postLegacy } from "@/lib/apiClient";
import { useSessionGuard } from "@/lib/useSessionGuard";
import type { DashboardEventItem, GetDashboardEventsR, RGetDashboardEvents } from "@/types/acura";

// Espejo del switch de color en DashBoard.razor (index 1..5 sobre las
// primeras 4 tarjetas — boardsEventsGraphics = boardsEvents.Take(4)).
const CARD_COLORS = ["#4B52FF", "#562BD2", "#00CC66", "#00CC66"];

const MONTHS_ES = [
  "enero", "febrero", "marzo", "abril", "mayo", "junio",
  "julio", "agosto", "septiembre", "octubre", "noviembre", "diciembre",
];

function formatMoney(value: number) {
  return new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(value || 0);
}

// eventDateStart llega "yyyy/MM/dd HH:mm:ss" (wire final, ver ACURA-EVENTS
// PR #22) — espejo de dateParsed.ToString("dd/MMMM/yyyy", es-ES) en el Blazor,
// con text-transform:capitalize en la celda (aquí clase `capitalize`).
function formatEventDate(value: string) {
  const datePart = value.split(" ")[0];
  const [year, month, day] = datePart.split("/");
  const monthName = MONTHS_ES[Number(month) - 1] ?? month;
  return `${day}/${monthName}/${year}`;
}

function EventPercentageCard({ event, color }: { event: DashboardEventItem; color: string }) {
  const percentage = Math.max(0, Math.min(event.eventPercentage, 100));
  const radius = 72;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (percentage / 100) * circumference;

  return (
    <article className="flex h-[260px] w-[240px] flex-col items-center rounded-lg bg-white px-6 py-6 shadow-[0_18px_35px_rgba(15,23,42,0.12)]">
      <h3 className="mb-5 max-w-[200px] text-center text-base font-extrabold leading-6 text-black">
        {event.eventName}
      </h3>

      <div className="relative h-[160px] w-[160px]">
        <svg className="h-full w-full -rotate-90" viewBox="0 0 180 180">
          <circle cx="90" cy="90" r={radius} fill="none" stroke="#e5e7eb" strokeWidth="20" />
          <circle
            cx="90"
            cy="90"
            r={radius}
            fill="none"
            stroke={color}
            strokeWidth="20"
            strokeLinecap="butt"
            strokeDasharray={circumference}
            strokeDashoffset={offset}
          />
        </svg>

        <div className="absolute inset-0 flex items-center justify-center text-xl font-medium text-black">
          {percentage}%
        </div>
      </div>
    </article>
  );
}

export default function Page() {
  const router = useRouter();
  const { session, error: sessionError } = useSessionGuard();

  const [dashboardEvents, setDashboardEvents] = useState<DashboardEventItem[] | null>(null);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (session) loadDashboard(1);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [session]);

  async function loadDashboard(targetPage: number) {
    if (!session) return;

    setLoading(true);
    setError("");

    try {
      const response = await postLegacy<GetDashboardEventsR, RGetDashboardEvents>(
        "GetDashboardEvents",
        { idOrganizer: session.idOrganizer, page: targetPage - 1 },
        session.token
      );

      setDashboardEvents(response.code ? response.dashboardEvents ?? [] : []);
      setTotalPages(response.code ? response.totalDePaginas ?? 0 : 0);
      setPage(targetPage);
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
      setDashboardEvents([]);
      setTotalPages(0);
    } finally {
      setLoading(false);
    }
  }

  // Espejo de TableDashBoard.razor::ShowDashboard — "IdEventDashboard" es su
  // propia clave de localStorage, distinta de "IdEvent" (MyEventsDetails/
  // EditEvent/CancelEvent). /Event/Dashboard es una ruta futura (cascarón aún
  // no construido), mismo patrón que "Ir a Comisiones" en List-of-organizers.
  function viewEventDashboard(idEvent: number) {
    localStorage.setItem("IdEventDashboard", String(idEvent));
    router.push("/Event/Dashboard");
  }

  if (sessionError) {
    return (
      <AppShell>
        <div className="rounded-xl bg-red-50 p-4 text-sm text-red-700">{sessionError}</div>
      </AppShell>
    );
  }

  if (!session) {
    return (
      <AppShell>
        <p className="py-10 text-center text-sm text-slate-400">Cargando...</p>
      </AppShell>
    );
  }

  const hasEvents = !!dashboardEvents?.length;
  const graphicEvents = (dashboardEvents ?? []).slice(0, 4);

  return (
    <AppShell>
      <div className="pb-10">
        <h1 className="mb-4 text-[28px] font-extrabold text-black">Resumen</h1>

        {error ? (
          <div className="mb-6 rounded-lg bg-red-50 px-4 py-3 text-sm font-medium text-red-700">{error}</div>
        ) : null}

        {loading ? (
          <div className="mb-6 rounded-lg bg-blue-50 px-4 py-3 text-sm font-medium text-blue-700">Cargando...</div>
        ) : null}

        {!loading && dashboardEvents !== null && !hasEvents ? (
          <div className="mt-4 flex flex-col items-center pt-4 text-center">
            <img src="/img/EmptyInbox.png" alt="" aria-hidden="true" />
            <p className="mt-4 text-lg font-bold text-black">No tienes eventos activos.</p>
            <p className="mt-2 max-w-md text-sm text-slate-600">
              Aquí se mostrará el progreso de tus eventos activos.
            </p>
            <button
              type="button"
              onClick={() => router.push("/CreateEvent")}
              className="mt-6 rounded-lg bg-[#6b35f5] px-6 py-3 text-sm font-semibold text-white"
            >
              Crear un evento
            </button>
          </div>
        ) : null}

        {hasEvents ? (
          <>
            <h2 className="mb-4 text-base font-bold text-black">Porcentaje de ventas</h2>

            <div className="mb-8 flex flex-wrap gap-4">
              {graphicEvents.map((event, index) => (
                <EventPercentageCard key={event.idEvent} event={event} color={CARD_COLORS[index] ?? "#4B52FF"} />
              ))}
            </div>

            <div className="overflow-x-auto">
              <table className="w-full min-w-[900px] border-collapse bg-white">
                <thead>
                  <tr className="bg-[#d9dee3]">
                    <th className="px-4 py-4 text-left text-sm font-extrabold text-black">Nombre del evento</th>
                    <th className="px-4 py-4 text-left text-sm font-extrabold text-black">Ventas totales</th>
                    <th className="px-4 py-4 text-left text-sm font-extrabold text-black">Boletos vendidos</th>
                    <th className="px-4 py-4 text-left text-sm font-extrabold text-black">Fecha del evento</th>
                    <th className="px-4 py-4 text-left text-sm font-extrabold text-black">Acciones</th>
                  </tr>
                </thead>

                <tbody>
                  {(dashboardEvents ?? []).map((event) => (
                    <tr key={event.idEvent} className="border-b border-[#d9dee3]">
                      <td className="px-4 py-5 text-sm font-semibold text-black">{event.eventName}</td>
                      <td className="px-4 py-5 text-sm text-slate-700">{formatMoney(event.eventProfits)}</td>
                      <td className="px-4 py-5 text-sm text-slate-700">
                        {event.soldTickets}/{event.totalTickets}
                      </td>
                      <td className="px-4 py-5 text-sm capitalize text-slate-700">
                        {formatEventDate(event.eventDateStart)}
                      </td>
                      <td className="px-4 py-5">
                        <button
                          type="button"
                          onClick={() => viewEventDashboard(event.idEvent)}
                          className="inline-flex cursor-pointer items-center gap-2 rounded-lg border border-black bg-white px-3 py-2 text-sm font-semibold text-black hover:bg-slate-50"
                        >
                          <img src="/img/EyeDashboard.png" width={16} height={16} alt="" aria-hidden="true" />
                          Ver Dashboard
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>

              <Pagination page={page} totalPages={totalPages} onPageChange={loadDashboard} />
            </div>
          </>
        ) : null}
      </div>
    </AppShell>
  );
}
