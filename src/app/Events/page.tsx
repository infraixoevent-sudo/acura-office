"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { AppShell } from "@/components/AppShell";
import { Pagination } from "@/components/Pagination";
import { ShareEventModal } from "@/components/ShareEventModal";
import { postLegacy } from "@/lib/apiClient";
import { useSessionGuard } from "@/lib/useSessionGuard";
import type { EventsOrganizerList, EventsR, REvents } from "@/types/acura";

// Espejo de _states en Events.razor: catálogo hardcodeado en el Blazor (sin
// llamada a ningún endpoint de catálogo) — a diferencia de Consult-events, esta
// página nunca llama GetEventStatus/GetEventCategory.
const STATES = [
  { idState: 0, name: "Ninguno" },
  { idState: 1, name: "Aguascalientes" },
  { idState: 2, name: "Baja California" },
  { idState: 3, name: "Baja California Sur" },
  { idState: 4, name: "Campeche" },
  { idState: 5, name: "Chiapas" },
  { idState: 6, name: "Chihuahua" },
  { idState: 7, name: "Ciudad de México" },
  { idState: 8, name: "Coahuila" },
  { idState: 9, name: "Colima" },
  { idState: 10, name: "Durango" },
  { idState: 11, name: "Guanajuato" },
  { idState: 12, name: "Guerrero" },
  { idState: 13, name: "Hidalgo" },
  { idState: 14, name: "Jalisco" },
  { idState: 15, name: "México" },
  { idState: 16, name: "Michoacán" },
  { idState: 17, name: "Morelos" },
  { idState: 18, name: "Nayarit" },
  { idState: 19, name: "Nuevo León" },
  { idState: 20, name: "Oaxaca" },
  { idState: 21, name: "Puebla" },
  { idState: 22, name: "Querétaro" },
  { idState: 23, name: "Quintana Roo" },
  { idState: 24, name: "San Luis Potosí" },
  { idState: 25, name: "Sinaloa" },
  { idState: 26, name: "Sonora" },
  { idState: 27, name: "Tabasco" },
  { idState: 28, name: "Tamaulipas" },
  { idState: 29, name: "Tlaxcala" },
  { idState: 30, name: "Veracruz" },
  { idState: 31, name: "Yucatán" },
  { idState: 32, name: "Zacatecas" },
];

// Espejo de _status en Events.razor (4 opciones fijas, sin "Inactivo" —
// comentado en el original).
const STATUSES = [
  { idStatus: 0, name: "Ninguno" },
  { idStatus: 1, name: "Activo" },
  { idStatus: 2, name: "Programado" },
  { idStatus: 3, name: "Finalizado" },
  { idStatus: 4, name: "Cancelado" },
];

// Espejo del switch de estatus en TableEvents.razor (incluye 7 = "En proceso",
// que no aparece como filtro pero sí como valor posible de un evento real).
const STATUS_LABEL: Record<number, string> = {
  1: "Activo",
  2: "Programado",
  3: "Finalizado",
  4: "Cancelado",
  7: "En proceso",
};

// Espejo de las clases box-color-* del Blazor (mismo mapeo usado en
// Admin/Consult-events/page.tsx).
function statusBadgeClass(idStatus: number) {
  switch (idStatus) {
    case 1:
      return "bg-[#25B80014] text-[#0B8400]";
    case 4:
      return "bg-[#FF3B3014] text-[#FF3B30]";
    case 7:
      return "bg-[#bca5ff] text-[#614e99]";
    case 2:
      return "bg-[#007AFF14] text-[#007AFF]";
    default:
      return "bg-[#12121214] text-slate-700";
  }
}

// Solo Activo (1) y En proceso (7) permiten editar/cancelar — espejo exacto
// del `@if (Status != 1 && Status != 7)` en TableEvents.razor.
function canEditOrCancel(idStatus: number) {
  return idStatus === 1 || idStatus === 7;
}

const MONTHS_ES = [
  "Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio",
  "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre",
];

function formatEventDate(value?: string | null) {
  if (!value) return "";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  const day = String(date.getUTCDate()).padStart(2, "0");
  const month = MONTHS_ES[date.getUTCMonth()];
  const year = date.getUTCFullYear();
  const hours = String(date.getUTCHours()).padStart(2, "0");
  const minutes = String(date.getUTCMinutes()).padStart(2, "0");
  return `${day} de ${month}, ${year} a las ${hours}:${minutes} hrs.`;
}

// Espejo de GetMainDomain()/dinamicDomain en Events.razor: el link/QR de
// "Compartir evento" apunta al landing público (acura-landing), un app
// separado fuera de este ecosistema — no a este mismo dominio del office.
function getLandingBaseUrl() {
  if (typeof window === "undefined") return "";
  const host = window.location.hostname;
  const parts = host.split(".");
  const mainDomain = parts.length >= 2 ? parts.slice(-2).join(".") : host;

  if (mainDomain === "vantis.team") return "https://acura-landing.vantis.team/";
  if (mainDomain === "ixoevent.com") return "https://ixoevent.com/";
  if (mainDomain === "localhost") return `https://${host}:7167/`;
  return "";
}

export default function Page() {
  const router = useRouter();
  const { session, error: sessionError } = useSessionGuard();

  const [name, setName] = useState("");
  const [idStatus, setIdStatus] = useState(0);
  const [date, setDate] = useState("");
  const [idState, setIdState] = useState(0);

  const [events, setEvents] = useState<EventsOrganizerList[]>([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const [searched, setSearched] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const [shareEvent, setShareEvent] = useState<{ idEvent: number; name: string } | null>(null);

  useEffect(() => {
    if (session) fetchEvents(1, {});
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [session]);

  async function fetchEvents(
    targetPage: number,
    filters: { name?: string; idStatus?: number; date?: string; idState?: number }
  ) {
    if (!session) return;

    setLoading(true);
    setError("");

    try {
      const response = await postLegacy<EventsR, REvents>(
        "GetAdminEvents",
        {
          idOrganizer: session.idOrganizer,
          idStatus: filters.idStatus || undefined,
          name: filters.name || undefined,
          date: filters.date || undefined,
          idState: filters.idState || undefined,
          page: targetPage - 1,
        },
        session.token
      );

      setEvents(response.code ? response.adminEvents ?? [] : []);
      setTotalPages(response.code ? response.totalDePaginas ?? 0 : 0);
      setPage(targetPage);
      setSearched(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
      setEvents([]);
      setTotalPages(0);
    } finally {
      setLoading(false);
    }
  }

  function search() {
    fetchEvents(1, { name, idStatus, date, idState });
  }

  function goToPage(targetPage: number) {
    fetchEvents(targetPage, { name, idStatus, date, idState });
  }

  function goToEvent(route: string, idEvent: number) {
    localStorage.setItem("IdEvent", String(idEvent));
    router.push(route);
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

  return (
    <AppShell>
      <div className="pb-10">
        <div className="mb-6 flex items-center justify-between">
          <h1 className="text-[28px] font-extrabold text-black">Mis Eventos</h1>
          <Link
            href="/CreateEvent"
            className="rounded-lg bg-[#6b35f5] px-5 py-3 text-sm font-semibold text-white"
          >
            + Crear Evento
          </Link>
        </div>

        {error ? (
          <div className="mb-6 rounded-lg bg-red-50 px-4 py-3 text-sm font-medium text-red-700">{error}</div>
        ) : null}

        <div className="flex flex-col gap-4 lg:flex-row lg:flex-wrap">
          <div className="flex-1 lg:min-w-[220px]">
            <label htmlFor="name" className="mb-1 block text-sm font-semibold text-slate-700">
              Buscar evento
            </label>
            <input
              id="name"
              type="text"
              placeholder="Ingrese el nombre del evento"
              value={name}
              onChange={(event) => setName(event.target.value)}
              className="h-[58px] w-full rounded-lg border border-slate-300 bg-white px-4 text-sm text-slate-900"
            />
          </div>

          <div className="flex-1 lg:min-w-[200px]">
            <label htmlFor="statusSelect" className="mb-1 block text-sm font-semibold text-slate-700">
              Estatus del evento
            </label>
            <select
              id="statusSelect"
              value={idStatus}
              onChange={(event) => setIdStatus(Number(event.target.value))}
              className="h-[58px] w-full rounded-lg border border-slate-300 bg-white px-4 text-sm text-slate-900"
            >
              {STATUSES.map((item) => (
                <option key={item.idStatus} value={item.idStatus}>
                  {item.name}
                </option>
              ))}
            </select>
          </div>

          <div className="flex-1 lg:min-w-[200px]">
            <label htmlFor="dateFilter" className="mb-1 block text-sm font-semibold text-slate-700">
              Fecha
            </label>
            <input
              id="dateFilter"
              type="date"
              value={date}
              onChange={(event) => setDate(event.target.value)}
              className="h-[58px] w-full rounded-lg border border-slate-300 bg-white px-4 text-sm text-slate-900"
            />
          </div>

          <div className="flex-1 lg:min-w-[200px]">
            <label htmlFor="stateSelect" className="mb-1 block text-sm font-semibold text-slate-700">
              Estados
            </label>
            <select
              id="stateSelect"
              value={idState}
              onChange={(event) => setIdState(Number(event.target.value))}
              className="h-[58px] w-full rounded-lg border border-slate-300 bg-white px-4 text-sm text-slate-900"
            >
              {STATES.map((item) => (
                <option key={item.idState} value={item.idState}>
                  {item.name}
                </option>
              ))}
            </select>
          </div>

          <div className="flex items-end">
            <button
              type="button"
              onClick={search}
              disabled={loading}
              title="Buscar"
              className="flex h-[58px] w-[58px] cursor-pointer items-center justify-center rounded-lg bg-[#6b35f5] disabled:cursor-not-allowed disabled:opacity-60"
            >
              <img src="/img/search.svg" width={22} height={22} alt="Buscar" />
            </button>
          </div>
        </div>

        {loading ? (
          <div className="mt-6 rounded-lg bg-blue-50 px-4 py-3 text-sm font-medium text-blue-700">Cargando...</div>
        ) : null}

        {searched && !loading && events.length === 0 ? (
          <div className="mt-10 text-center">
            <img src="/img/notresults.jpg" alt="" aria-hidden="true" className="mx-auto" />
            <h4 className="mt-3 text-lg font-bold text-black">Sin resultados</h4>
            <h5 className="mt-2 text-sm text-slate-600">Intente nuevamente</h5>
          </div>
        ) : null}

        {events.length > 0 ? (
          <div className="mt-6 overflow-x-auto">
            <table className="w-full min-w-[900px] border-collapse bg-white">
              <thead>
                <tr className="bg-[#d9dee3]">
                  <th className="px-4 py-4 text-left text-sm font-extrabold text-black">Evento</th>
                  <th className="px-4 py-4 text-center text-sm font-extrabold text-black">Vendidos</th>
                  <th className="px-4 py-4 text-center text-sm font-extrabold text-black">Estatus</th>
                  <th className="px-4 py-4 text-center text-sm font-extrabold text-black">Acciones</th>
                </tr>
              </thead>

              <tbody>
                {events.map((item) => {
                  const editable = canEditOrCancel(item.idStatus);
                  return (
                    <tr key={item.idEvent} className="border-b border-[#d9dee3]">
                      <td className="px-4 py-5 text-sm text-slate-700">
                        <p className="font-semibold text-black">{item.name}</p>
                        <p className="text-slate-500">{formatEventDate(item.dateAndTime)}</p>
                        <p className="text-slate-500">{item.address}</p>
                      </td>
                      <td className="px-4 py-5 text-center text-sm text-slate-700">
                        {item.soldTickets} / {item.availableTickets}
                      </td>
                      <td className="px-4 py-5 text-center text-sm">
                        <span
                          className={`inline-flex items-center justify-center rounded px-2 py-1 ${statusBadgeClass(item.idStatus)}`}
                        >
                          {STATUS_LABEL[item.idStatus] ?? item.idStatus}
                        </span>
                      </td>
                      <td className="px-4 py-5 text-center">
                        <div className="flex items-center justify-center gap-1">
                          <button
                            type="button"
                            title="Editar Evento"
                            disabled={!editable}
                            onClick={() => goToEvent("/EditEvent", item.idEvent)}
                            className="rounded-lg p-1 hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-30"
                          >
                            <img src="/img/pencil.svg" width={18} height={18} alt="Editar Evento" />
                          </button>
                          <button
                            type="button"
                            title="Detalles de Evento"
                            onClick={() => goToEvent("/MyEventsDetails", item.idEvent)}
                            className="rounded-lg p-1 hover:bg-slate-100"
                          >
                            <img src="/img/eye.svg" width={18} height={18} alt="Detalles de Evento" />
                          </button>
                          <button
                            type="button"
                            title="Cancelar Evento"
                            disabled={!editable}
                            onClick={() => goToEvent("/CancelEvent", item.idEvent)}
                            className="rounded-lg p-1 hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-30"
                          >
                            <img src="/img/CancelEvent.png" width={18} height={18} alt="Cancelar Evento" />
                          </button>
                          {item.idStatus === 1 ? (
                            <button
                              type="button"
                              title="Compartir Evento"
                              onClick={() => setShareEvent({ idEvent: item.idEvent, name: item.name ?? "" })}
                              className="rounded-lg p-1 hover:bg-slate-100"
                            >
                              <img src="/img/iconShare.svg" width={18} height={18} alt="Compartir Evento" />
                            </button>
                          ) : null}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>

            <Pagination page={page} totalPages={totalPages} onPageChange={goToPage} />
          </div>
        ) : null}
      </div>

      <ShareEventModal
        show={shareEvent !== null}
        idEvent={shareEvent?.idEvent ?? 0}
        nameEvent={shareEvent?.name ?? ""}
        baseUrl={getLandingBaseUrl()}
        onClose={() => setShareEvent(null)}
      />
    </AppShell>
  );
}
