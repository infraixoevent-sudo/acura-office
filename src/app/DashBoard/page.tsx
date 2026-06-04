"use client";

import { useEffect, useMemo, useState } from "react";
import { AppShell } from "@/components/AppShell";
import { getStoredToken, postLegacy } from "@/lib/apiClient";

interface DashboardEvent {
  idEvent: number;
  eventName: string;
  soldTickets: number;
  availableTickets: number;
  eventDateStart: string;
  eventDateSale: string;
  eventProfits: number;
  eventPercentage: number;
  totalTickets: number;
}

interface DashboardResponse {
  code: boolean;
  message: string | null;
  dashboardEvents: DashboardEvent[];
  totalDePaginas: number;
  totalDeRegistros: number;
}

function formatMoney(value: number) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(value);
}

function formatDate(value: string) {
  if (!value) return "";

  const [datePart] = value.split(" ");
  const [year, month, day] = datePart.split("/");

  const months: Record<string, string> = {
    "01": "Enero",
    "02": "Febrero",
    "03": "Marzo",
    "04": "Abril",
    "05": "Mayo",
    "06": "Junio",
    "07": "Julio",
    "08": "Agosto",
    "09": "Septiembre",
    "10": "Octubre",
    "11": "Noviembre",
    "12": "Diciembre",
  };

  return `${day}/${months[month]}/${year}`;
}

function EventPercentageCard({ event }: { event: DashboardEvent }) {
  const percentage = Math.max(0, Math.min(event.eventPercentage || 0, 100));
  const radius = 72;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (percentage / 100) * circumference;

  return (
    <article className="flex h-[315px] w-[275px] flex-col items-center rounded-lg bg-white px-6 py-6 shadow-[0_18px_35px_rgba(15,23,42,0.12)]">
      <h3 className="mb-7 max-w-[220px] text-center text-lg font-extrabold leading-5 text-black">
        {event.eventName}
      </h3>

      <div className="relative h-[190px] w-[190px]">
        <svg className="h-full w-full -rotate-90" viewBox="0 0 180 180">
          <circle
            cx="90"
            cy="90"
            r={radius}
            fill="none"
            stroke="#a9a9a9"
            strokeWidth="20"
          />
          <circle
            cx="90"
            cy="90"
            r={radius}
            fill="none"
            stroke="#25d66f"
            strokeWidth="20"
            strokeLinecap="butt"
            strokeDasharray={circumference}
            strokeDashoffset={offset}
          />
        </svg>

        <div className="absolute inset-0 flex items-center justify-center text-2xl font-medium text-black">
          {percentage}%
        </div>
      </div>
    </article>
  );
}

export default function Page() {
  const [events, setEvents] = useState<DashboardEvent[]>([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const idOrganizer = useMemo(() => {
    if (typeof window === "undefined") return 1;

    const storedIdOrganizer = Number(localStorage.getItem("IdOrganizer"));

    return storedIdOrganizer > 0 ? storedIdOrganizer : 1;
  }, []);

  async function loadDashboard(currentPage = page) {
    setLoading(true);
    setError("");

    try {
      const response = await postLegacy<DashboardResponse>(
        "GetDashboardEvents",
        {
          IdOrganizer: idOrganizer,
          Page: currentPage,
        },
        getStoredToken()
      );

      if (!response.code) {
        setError(response.message || "No se pudo cargar el dashboard");
        return;
      }

      setEvents(response.dashboardEvents || []);
      setTotalPages(response.totalDePaginas || 1);
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
    } finally {
      setLoading(false);
    }
  }

  function goToPage(nextPage: number) {
    if (nextPage < 1 || nextPage > totalPages) return;
    setPage(nextPage);
    loadDashboard(nextPage);
  }

  function viewDashboard(idEvent: number) {
    console.log("Ver dashboard evento:", idEvent);
  }

  useEffect(() => {
    loadDashboard(1);
  }, []);

  return (
    <AppShell>
      <section className="bg-white px-2 py-2">
        <h1 className="mb-5 text-[28px] font-extrabold text-black">
          Resumen
        </h1>

        <h2 className="mb-7 text-lg font-bold text-black">
          Porcentaje de ventas
        </h2>

        {error ? (
          <div className="mb-6 rounded-lg bg-red-50 px-4 py-3 text-sm font-medium text-red-700">
            {error}
          </div>
        ) : null}

        {loading ? (
          <div className="mb-6 rounded-lg bg-blue-50 px-4 py-3 text-sm font-medium text-blue-700">
            Cargando dashboard...
          </div>
        ) : null}

        <div className="mb-10 flex flex-wrap gap-9">
          {events.map((event) => (
            <EventPercentageCard key={event.idEvent} event={event} />
          ))}
        </div>

        <div className="overflow-x-auto">
          <table className="w-full min-w-[980px] border-collapse bg-white">
            <thead>
              <tr className="bg-[#d9dee3]">
                <th className="px-4 py-4 text-left text-base font-extrabold text-black">
                  Nombre del evento
                </th>
                <th className="px-4 py-4 text-left text-base font-extrabold text-black">
                  Ventas totales
                </th>
                <th className="px-4 py-4 text-left text-base font-extrabold text-black">
                  Boletos vendidos
                </th>
                <th className="px-4 py-4 text-left text-base font-extrabold text-black">
                  Fecha del evento
                </th>
                <th className="px-4 py-4 text-left text-base font-extrabold text-black">
                  Acciones
                </th>
              </tr>
            </thead>

            <tbody>
              {events.map((event) => (
                <tr key={event.idEvent} className="border-b border-[#d9dee3]">
                  <td className="px-4 py-8 text-sm text-slate-700">
                    {event.eventName}
                  </td>
                  <td className="px-4 py-8 text-sm text-slate-700">
                    {formatMoney(event.eventProfits)}
                  </td>
                  <td className="px-4 py-8 text-sm text-slate-700">
                    {event.soldTickets}/{event.totalTickets}
                  </td>
                  <td className="px-4 py-8 text-sm text-slate-700">
                    {formatDate(event.eventDateStart)}
                  </td>
                  <td className="px-4 py-5">
                    <button
                      type="button"
                      onClick={() => viewDashboard(event.idEvent)}
                      className="inline-flex cursor-pointer items-center gap-2 rounded-lg border border-black bg-white px-4 py-3 text-base font-extrabold text-black transition hover:bg-slate-50"
                    >
                      <span aria-hidden="true">👁</span>
                      Ver Dashboard
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {events.length === 0 && !loading ? (
          <div className="mt-6 rounded-lg bg-blue-50 px-4 py-3 text-sm font-medium text-blue-700">
            Sin eventos todavía.
          </div>
        ) : null}

        <div className="mt-9 flex justify-center">
          <div className="inline-flex overflow-hidden rounded border border-[#d9dee3]">
            <button
              type="button"
              onClick={() => goToPage(page - 1)}
              disabled={page <= 1}
              className="cursor-pointer bg-white px-4 py-2 text-sm font-bold text-black disabled:cursor-not-allowed disabled:opacity-40"
            >
              «
            </button>

            <span className="bg-[#0d8cff] px-5 py-2 text-sm font-bold text-white">
              {page}
            </span>

            <button
              type="button"
              onClick={() => goToPage(page + 1)}
              disabled={page >= totalPages}
              className="cursor-pointer bg-white px-4 py-2 text-sm font-bold text-black disabled:cursor-not-allowed disabled:opacity-40"
            >
              »
            </button>
          </div>
        </div>
      </section>
    </AppShell>
  );
}