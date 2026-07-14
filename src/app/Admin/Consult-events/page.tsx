"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { AdminShell } from "@/components/AdminShell";
import { Pagination } from "@/components/Pagination";
import { getLegacy, postLegacy } from "@/lib/apiClient";
import { useAdminGuard } from "@/lib/useAdminGuard";
import type {
  EventCategoryItem,
  EventCategoryR,
  EventStatusItem,
  GetEventStatusR,
  GetOrganizersEventsFilteredR,
  OrganizerEventItem,
  RGetOrganizersEventsFiltered,
} from "@/types/acura";

// Espejo de _status/_eventCategories en ConsultEvents.razor: la opción
// "Todos" es un valor sintético (id 0) que el request nunca envía.
const ALL_STATUS: EventStatusItem = { idEventStatus: 0, description: "Todos" };
const ALL_CATEGORY: EventCategoryItem = { id: 0, description: "Todos", urlImage: "" };

// Acciones (submenu) solo aparecen para estos 3 estatus — espejo exacto del
// `@if` en ConsultEvents.razor.
const STATUSES_WITH_ACTIONS = new Set(["Activo", "Finalizado", "Cancelado"]);

function formatDate(value?: string | null) {
  if (!value) return "";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  return `${String(date.getUTCDate()).padStart(2, "0")}/${String(date.getUTCMonth() + 1).padStart(2, "0")}/${date.getUTCFullYear()}`;
}

function formatMoney(value: number) {
  return value.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

// Espejo de las clases box-color-* del Blazor original.
function statusBadgeClass(status: string | null) {
  switch (status) {
    case "Activo":
      return "bg-[#25B80014] text-[#0B8400]";
    case "Cancelado":
      return "bg-[#FF3B3014] text-[#FF3B30]";
    case "En proceso":
      return "bg-[#bca5ff] text-[#614e99]";
    case "Programado":
      return "bg-[#007AFF14] text-[#007AFF]";
    default:
      // Finalizado, Pospuesto, Boletos Agotados: mismo gris neutro que el original.
      return "bg-[#12121214] text-slate-700";
  }
}

interface Filters {
  organizerName: string;
  eventName: string;
  idEventStatus: number;
  idEventCategory: number;
  startDate: string;
  endDate: string;
}

const EMPTY_FILTERS: Filters = {
  organizerName: "",
  eventName: "",
  idEventStatus: 0,
  idEventCategory: 0,
  startDate: "",
  endDate: "",
};

export default function Page() {
  const { session } = useAdminGuard();

  const [organizerName, setOrganizerName] = useState("");
  const [eventName, setEventName] = useState("");
  const [idEventStatus, setIdEventStatus] = useState(1);
  const [idEventCategory, setIdEventCategory] = useState(0);
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [startDateError, setStartDateError] = useState("");
  const [endDateError, setEndDateError] = useState("");

  const [statuses, setStatuses] = useState<EventStatusItem[]>([ALL_STATUS]);
  const [categories, setCategories] = useState<EventCategoryItem[]>([ALL_CATEGORY]);

  const [events, setEvents] = useState<OrganizerEventItem[]>([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const [searched, setSearched] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const [openRowId, setOpenRowId] = useState<number | null>(null);

  useEffect(() => {
    if (!session) return;

    fetchEvents(1, { ...EMPTY_FILTERS, idEventStatus: 1 });

    getLegacy<EventCategoryR>("GetEventCategory")
      .then((response) => {
        if (response.code) setCategories([ALL_CATEGORY, ...response.eventCategoriesList]);
      })
      .catch(() => undefined);

    // GetEventCategory/GetEventStatus son públicos en el C# (sin
    // .AddEndpointFilter<Authentication>() en Program.cs) — sin token, igual
    // que EventCategoryService/StatusCategoryService en el Blazor original.
    postLegacy<GetEventStatusR>("GetEventStatus")
      .then((response) => {
        if (response.code) setStatuses([ALL_STATUS, ...response.eventStatuses]);
      })
      .catch(() => undefined);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [session]);

  async function fetchEvents(targetPage: number, filters: Filters) {
    if (!session) return;

    setLoading(true);
    setError("");

    try {
      const request: RGetOrganizersEventsFiltered = {
        organizerName: filters.organizerName || undefined,
        eventName: filters.eventName || undefined,
        idEventStatus: filters.idEventStatus || undefined,
        idEventCategory: filters.idEventCategory || undefined,
        startDate: filters.startDate || undefined,
        endDate: filters.endDate || undefined,
        page: targetPage - 1,
      };

      const response = await postLegacy<GetOrganizersEventsFilteredR, RGetOrganizersEventsFiltered>(
        "GetOrganizersEventsFiltered",
        request,
        session.token
      );

      setEvents(response.code ? response.events ?? [] : []);
      setTotalPages(response.code ? response.totalPages ?? 0 : 0);
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

  function currentFilters(): Filters {
    return { organizerName, eventName, idEventStatus, idEventCategory, startDate, endDate };
  }

  // Espejo de FilterSearch: ambas fechas o ninguna: rango inválido produce un
  // solo mensaje; una sola fecha presente produce un mensaje por campo.
  function search() {
    if (startDate && endDate) {
      if (endDate < startDate) {
        setStartDateError("La fecha final debe ser mayor a la fecha de inicio");
        setEndDateError("");
        return;
      }
      setStartDateError("");
      setEndDateError("");
      fetchEvents(1, currentFilters());
    } else if (!startDate && !endDate) {
      setStartDateError("");
      setEndDateError("");
      fetchEvents(1, currentFilters());
    } else {
      setStartDateError(!startDate ? "Selecciona la fecha de inicio" : "");
      setEndDateError(!endDate ? "Selecciona la fecha final" : "");
    }
  }

  function clearFilters() {
    setOrganizerName("");
    setEventName("");
    setIdEventStatus(0);
    setIdEventCategory(0);
    setStartDate("");
    setEndDate("");
    setStartDateError("");
    setEndDateError("");
    fetchEvents(1, EMPTY_FILTERS);
  }

  function goToPage(targetPage: number) {
    fetchEvents(targetPage, currentFilters());
  }

  function toggleActions(idEvent: number) {
    setOpenRowId((current) => (current === idEvent ? null : idEvent));
    localStorage.setItem("consultEventIdEvent", String(idEvent));
  }

  if (!session) {
    return (
      <AdminShell>
        <p className="py-10 text-center text-sm text-slate-400">Cargando...</p>
      </AdminShell>
    );
  }

  return (
    <AdminShell>
      <div className="pb-10">
        <h1 className="mb-6 text-[28px] font-extrabold text-black">Consulta de eventos</h1>

        {error ? (
          <div className="mb-6 rounded-lg bg-red-50 px-4 py-3 text-sm font-medium text-red-700">{error}</div>
        ) : null}

        <div className="flex flex-col gap-4 lg:flex-row lg:flex-wrap">
          <div className="flex-1 lg:min-w-[220px]">
            <label htmlFor="organizerName" className="mb-1 block text-sm font-semibold text-slate-700">
              Buscar por organizador
            </label>
            <input
              id="organizerName"
              type="text"
              placeholder="Ej.Servicios Pérez"
              value={organizerName}
              onChange={(event) => setOrganizerName(event.target.value)}
              className="h-[58px] w-full rounded-lg border border-slate-300 bg-white px-4 text-sm text-slate-900"
            />
          </div>

          <div className="flex-1 lg:min-w-[220px]">
            <label htmlFor="eventName" className="mb-1 block text-sm font-semibold text-slate-700">
              Buscar por Evento
            </label>
            <input
              id="eventName"
              type="text"
              placeholder="Ej.Taller de resina"
              value={eventName}
              onChange={(event) => setEventName(event.target.value)}
              className="h-[58px] w-full rounded-lg border border-slate-300 bg-white px-4 text-sm text-slate-900"
            />
          </div>

          <div className="flex-1 lg:min-w-[180px]">
            <label htmlFor="statusSelect" className="mb-1 block text-sm font-semibold text-slate-700">
              Estatus
            </label>
            <select
              id="statusSelect"
              value={idEventStatus}
              onChange={(event) => setIdEventStatus(Number(event.target.value))}
              className="h-[58px] w-full rounded-lg border border-slate-300 bg-white px-4 text-sm text-slate-900"
            >
              {statuses.map((item) => (
                <option key={item.idEventStatus} value={item.idEventStatus}>
                  {item.description}
                </option>
              ))}
            </select>
          </div>

          <div className="flex-1 lg:min-w-[180px]">
            <label htmlFor="categorySelect" className="mb-1 block text-sm font-semibold text-slate-700">
              Categoría
            </label>
            <select
              id="categorySelect"
              value={idEventCategory}
              onChange={(event) => setIdEventCategory(Number(event.target.value))}
              className="h-[58px] w-full rounded-lg border border-slate-300 bg-white px-4 text-sm text-slate-900"
            >
              {categories.map((item) => (
                <option key={item.id} value={item.id}>
                  {item.description}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="mt-4 flex flex-col gap-4 lg:flex-row lg:flex-wrap lg:items-start">
          <div className="flex-1 lg:min-w-[200px]">
            <label htmlFor="startDate" className="mb-1 block text-sm font-semibold text-slate-700">
              Fecha inicio
            </label>
            <input
              id="startDate"
              type="date"
              value={startDate}
              onChange={(event) => setStartDate(event.target.value)}
              className="h-[58px] w-full rounded-lg border border-slate-300 bg-white px-4 text-sm text-slate-900"
            />
            {startDateError ? <p className="mt-1 text-sm text-red-600">{startDateError}</p> : null}
          </div>

          <div className="flex-1 lg:min-w-[200px]">
            <label htmlFor="endDate" className="mb-1 block text-sm font-semibold text-slate-700">
              Fecha fin
            </label>
            <input
              id="endDate"
              type="date"
              value={endDate}
              onChange={(event) => setEndDate(event.target.value)}
              className="h-[58px] w-full rounded-lg border border-slate-300 bg-white px-4 text-sm text-slate-900"
            />
            {endDateError ? <p className="mt-1 text-sm text-red-600">{endDateError}</p> : null}
          </div>

          <div className="flex items-start gap-2 pt-6">
            <button
              type="button"
              onClick={clearFilters}
              className="h-[58px] rounded-lg border-2 border-black px-6 text-sm font-semibold text-black"
            >
              Limpiar
            </button>
            <button
              type="button"
              onClick={search}
              disabled={loading}
              className="h-[58px] rounded-lg bg-[#562BD2] px-6 text-sm font-semibold text-white disabled:cursor-not-allowed disabled:opacity-60"
            >
              Filtrar
            </button>
          </div>
        </div>

        {loading ? (
          <div className="mt-6 rounded-lg bg-blue-50 px-4 py-3 text-sm font-medium text-blue-700">Cargando...</div>
        ) : null}

        {searched && !loading && events.length === 0 ? (
          <div className="mt-10 text-center">
            <p className="mt-5 font-bold text-black">No se encontraron eventos.</p>
          </div>
        ) : null}

        {events.length > 0 ? (
          <div className="mt-6 overflow-x-auto">
            <table className="w-full min-w-[1200px] border-collapse bg-white">
              <thead>
                <tr className="bg-[#d9dee3]">
                  <th className="px-4 py-4 text-left text-sm font-extrabold text-black">Nombre del Organizador</th>
                  <th className="px-4 py-4 text-left text-sm font-extrabold text-black">Evento</th>
                  <th className="px-4 py-4 text-left text-sm font-extrabold text-black">Categoría del Evento</th>
                  <th className="px-4 py-4 text-left text-sm font-extrabold text-black">Fecha del Evento</th>
                  <th className="px-4 py-4 text-left text-sm font-extrabold text-black">Estatus</th>
                  <th className="px-4 py-4 text-right text-sm font-extrabold text-black">Monto Transferido</th>
                  <th className="px-4 py-4 text-right text-sm font-extrabold text-black">Monto Pendiente</th>
                  <th className="px-4 py-4 text-right text-sm font-extrabold text-black">Total de ventas</th>
                  <th className="px-4 py-4 text-center text-sm font-extrabold text-black">Boletos vendidos</th>
                  <th className="px-4 py-4 text-center text-sm font-extrabold text-black">Acciones</th>
                </tr>
              </thead>

              <tbody>
                {events.map((item) => (
                  <tr key={item.idEvent} className="border-b border-[#d9dee3]">
                    <td className="px-4 py-5 text-sm text-slate-700">{item.organizerName}</td>
                    <td className="px-4 py-5 text-sm text-slate-700">{item.eventName}</td>
                    <td className="px-4 py-5 text-sm text-slate-700">{item.category}</td>
                    <td className="px-4 py-5 text-sm text-slate-700">{formatDate(item.eventDate)}</td>
                    <td className="px-4 py-5 text-sm">
                      <span className={`inline-flex h-[21px] items-center justify-center rounded px-2 ${statusBadgeClass(item.status)}`}>
                        {item.status}
                      </span>
                    </td>
                    <td className="px-4 py-5 text-right text-sm text-slate-700">${formatMoney(item.totalTransferred)}</td>
                    <td className="px-4 py-5 text-right text-sm text-slate-700">${formatMoney(item.totalPendingToTransfer)}</td>
                    <td className="px-4 py-5 text-right text-sm text-slate-700">${formatMoney(item.totalEarnings)}</td>
                    <td className="px-4 py-5 text-center text-sm text-slate-700">{item.soldTickets}</td>
                    <td className="relative px-4 py-5 text-center">
                      {STATUSES_WITH_ACTIONS.has(item.status ?? "") ? (
                        <>
                          <button
                            type="button"
                            title="Consultar Evento"
                            onClick={() => toggleActions(item.idEvent)}
                            className="inline-flex cursor-pointer items-center justify-center rounded-lg p-1 hover:bg-slate-100"
                          >
                            <img src="/img/iconDetailsTwo.png" width={20} height={20} alt="Consultar Evento" />
                          </button>

                          {openRowId === item.idEvent ? (
                            <div className="absolute right-4 top-14 z-10 w-[220px] rounded-lg bg-white p-2 text-left shadow-[0_2px_8px_rgba(0,0,0,0.3)]">
                              <Link
                                href="/Admin/General-sales-detail"
                                className="block px-2 py-1 text-sm text-[#302a45] hover:text-[#6b35f5]"
                              >
                                Ir a Detalle de Ventas Generales
                              </Link>
                              <Link
                                href="/Admin/PaymentHistory"
                                className="block px-2 py-1 text-sm text-[#302a45] hover:text-[#6b35f5]"
                              >
                                Historial de pagos a organizadores
                              </Link>
                            </div>
                          ) : null}
                        </>
                      ) : null}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            <Pagination page={page} totalPages={totalPages} onPageChange={goToPage} />
          </div>
        ) : null}
      </div>
    </AdminShell>
  );
}
