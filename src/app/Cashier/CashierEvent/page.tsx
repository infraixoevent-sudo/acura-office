"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Swal from "sweetalert2";
import { AppShell } from "@/components/AppShell";
import { Pagination } from "@/components/Pagination";
import { postLegacy } from "@/lib/apiClient";
import { useSessionGuard } from "@/lib/useSessionGuard";
import type {
  CashierEventItem,
  GetCashierEventsR,
  GetTicketByFolioR,
  RGetCashierEvents,
  RGetTicketByFolio,
} from "@/types/acura";

// Espejo de _states en CashierEvent.razor: catálogo hardcodeado en el Blazor
// (sin llamada a ningún endpoint de catálogo), igual que en /Events. El
// dropdown de _status del Blazor original nunca se manda en el request real
// (Search() calcula `status` pero no lo agrega a RCashierEvent) — no se
// replica, es una variable muerta en el original.
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

const MONTHS_ES = [
  "ene", "feb", "mar", "abr", "may", "jun",
  "jul", "ago", "sep", "oct", "nov", "dic",
];

const MONTHS_FULL_ES = [
  "enero", "febrero", "marzo", "abril", "mayo", "junio",
  "julio", "agosto", "septiembre", "octubre", "noviembre", "diciembre",
];

// Espejo de TableCashierEvent.razor: solo 3 estatus tienen badge (1/4/6), el
// resto no renderiza nada.
const STATUS_BADGE: Record<number, { label: string; className: string }> = {
  1: { label: "Venta", className: "bg-green-100 text-green-700" },
  4: { label: "Cancelado", className: "bg-red-100 text-red-700" },
  6: { label: "Boleto agotado", className: "bg-amber-100 text-amber-700" },
};

function parseEventDate(iso: string) {
  const date = new Date(iso);
  return {
    monthAbbr: MONTHS_ES[date.getUTCMonth()] ?? "",
    day: String(date.getUTCDate()).padStart(2, "0"),
    full: `${date.getUTCDate()} de ${MONTHS_FULL_ES[date.getUTCMonth()] ?? ""}, ${date.getUTCFullYear()} a las ${String(
      date.getUTCHours()
    ).padStart(2, "0")}:${String(date.getUTCMinutes()).padStart(2, "0")} hrs.`,
  };
}

export default function Page() {
  const router = useRouter();
  const { session, error: sessionError } = useSessionGuard();

  const [cashierEvents, setCashierEvents] = useState<CashierEventItem[] | null>(null);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const [nameFilter, setNameFilter] = useState("");
  const [dateFilter, setDateFilter] = useState("");
  const [stateFilter, setStateFilter] = useState(0);

  const [showFolioModal, setShowFolioModal] = useState(false);
  const [folioValue, setFolioValue] = useState("");
  const [folioError, setFolioError] = useState("");
  const [folioLoading, setFolioLoading] = useState(false);

  useEffect(() => {
    if (session) loadEvents(1);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [session]);

  async function loadEvents(targetPage: number) {
    if (!session) return;

    setLoading(true);
    setError("");

    try {
      const body: RGetCashierEvents = {
        idOrganizer: session.idOrganizer,
        page: targetPage - 1,
      };
      if (nameFilter) body.name = nameFilter;
      if (dateFilter) body.date = dateFilter;
      if (stateFilter) body.idState = stateFilter;

      const response = await postLegacy<GetCashierEventsR, RGetCashierEvents>(
        "GetCashierEvents",
        body,
        session.token
      );

      setCashierEvents(response.code ? response.cashierEvents ?? [] : []);
      setTotalPages(response.code ? response.totalDePaginas ?? 0 : 0);
      setPage(targetPage);
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
      setCashierEvents([]);
      setTotalPages(0);
    } finally {
      setLoading(false);
    }
  }

  function openFolioModal() {
    setFolioValue("");
    setFolioError("");
    setShowFolioModal(true);
  }

  // Espejo de NoFolio() en CashierEvent.razor: valida el folio contra
  // GetTicketByFolio; en éxito guarda DataFolio/folio en localStorage y navega
  // a TicketingFolio (cascarón futuro, mismo patrón que "Ir a Comisiones");
  // en fallo de negocio muestra el mensaje real inline; solo el error técnico
  // usa SweetAlert (igual que el original).
  async function submitFolio() {
    if (!session) return;

    if (!folioValue) {
      setFolioError("Agrega el número de folio");
      return;
    }

    setFolioLoading(true);
    setFolioError("");

    try {
      const response = await postLegacy<GetTicketByFolioR, RGetTicketByFolio>(
        "GetTicketByFolio",
        { folio: Number(folioValue) },
        session.token
      );

      if (response.code) {
        localStorage.setItem("DataFolio", JSON.stringify(response));
        localStorage.setItem("folio", folioValue);
        setShowFolioModal(false);
        router.push("/Cashier/TicketingFolio");
      } else {
        setFolioError(response.message ?? "El Folio ingresado es invalido.");
      }
    } catch {
      await Swal.fire({
        text: "Algo salió mal. Por favor, intenta de nuevo más tarde",
        confirmButtonText: "Aceptar",
      });
    } finally {
      setFolioLoading(false);
    }
  }

  function goToEventDetails(idEvent: number) {
    localStorage.setItem("IdEvent", String(idEvent));
    router.push("/Cashier/CashierEventDetails");
  }

  function goToSellTicket(idEvent: number) {
    localStorage.setItem("IdEvent", String(idEvent));
    localStorage.setItem("EventRef", "1");
    router.push("/Cashier/Ticketing");
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

  const hasEvents = !!cashierEvents?.length;

  return (
    <AppShell>
      <div className="pb-10">
        <div className="mb-6 flex items-center justify-between">
          <h1 className="text-[28px] font-extrabold text-black">Mis Eventos</h1>
          <button
            type="button"
            onClick={openFolioModal}
            className="rounded-lg bg-[#6b35f5] px-4 py-2 text-sm font-semibold text-white"
          >
            # Ingresar folio
          </button>
        </div>

        <form
          onSubmit={(event) => {
            event.preventDefault();
            loadEvents(1);
          }}
          className="mb-6 grid grid-cols-1 gap-3 sm:grid-cols-4"
        >
          <input
            type="text"
            placeholder="Buscar evento"
            value={nameFilter}
            onChange={(event) => setNameFilter(event.target.value)}
            className="rounded-lg border border-slate-300 px-3 py-2 text-sm"
          />
          <input
            type="date"
            value={dateFilter}
            onChange={(event) => setDateFilter(event.target.value)}
            className="rounded-lg border border-slate-300 px-3 py-2 text-sm"
          />
          <select
            value={stateFilter}
            onChange={(event) => setStateFilter(Number(event.target.value))}
            className="rounded-lg border border-slate-300 px-3 py-2 text-sm"
          >
            {STATES.map((state) => (
              <option key={state.idState} value={state.idState}>
                {state.name}
              </option>
            ))}
          </select>
          <button
            type="submit"
            className="rounded-lg bg-black px-4 py-2 text-sm font-semibold text-white"
          >
            Buscar
          </button>
        </form>

        {error ? (
          <div className="mb-6 rounded-lg bg-red-50 px-4 py-3 text-sm font-medium text-red-700">{error}</div>
        ) : null}

        {loading ? (
          <div className="mb-6 rounded-lg bg-blue-50 px-4 py-3 text-sm font-medium text-blue-700">Cargando...</div>
        ) : null}

        {!loading && cashierEvents !== null && !hasEvents ? (
          <div className="mt-4 flex flex-col items-center pt-4 text-center">
            <img src="/img/notresults.png" alt="" aria-hidden="true" />
            <p className="mt-4 text-lg font-bold text-black">Sin resultados para tu búsqueda.</p>
          </div>
        ) : null}

        {hasEvents ? (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[900px] border-collapse bg-white">
              <thead>
                <tr className="bg-[#d9dee3]">
                  <th className="px-4 py-4 text-left text-sm font-extrabold text-black"></th>
                  <th className="px-4 py-4 text-left text-sm font-extrabold text-black">Evento</th>
                  <th className="px-4 py-4 text-left text-sm font-extrabold text-black">Vendidos</th>
                  <th className="px-4 py-4 text-left text-sm font-extrabold text-black">Estatus de boletos</th>
                  <th className="px-4 py-4 text-left text-sm font-extrabold text-black">Acciones</th>
                </tr>
              </thead>

              <tbody>
                {(cashierEvents ?? []).map((event) => {
                  const { monthAbbr, day, full } = parseEventDate(event.eventDateTime);
                  const badge = STATUS_BADGE[event.idEventStatus];

                  return (
                    <tr key={event.idEvent} className="border-b border-[#d9dee3]">
                      <td className="px-4 py-5 text-center text-sm font-semibold text-black">
                        <div className="uppercase">{monthAbbr}</div>
                        <div className="text-lg">{day}</div>
                      </td>
                      <td className="px-4 py-5 text-sm text-black">
                        <p className="mb-1 font-semibold">{event.eventName}</p>
                        <p className="mb-1 text-slate-500">{full}</p>
                        <p className="text-slate-500">{event.eventAddress}</p>
                      </td>
                      <td className="px-4 py-5 text-sm text-slate-700">
                        {event.soldTickets} / {event.availableTickets}
                      </td>
                      <td className="px-4 py-5">
                        {badge ? (
                          <span className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${badge.className}`}>
                            {badge.label}
                          </span>
                        ) : null}
                      </td>
                      <td className="px-4 py-5">
                        <div className="flex gap-2">
                          <button
                            type="button"
                            title="Detalles de Evento"
                            onClick={() => goToEventDetails(event.idEvent)}
                            className="inline-flex cursor-pointer items-center justify-center rounded-full border border-black bg-white p-2 text-black hover:bg-slate-50"
                          >
                            <img src="/img/eye.svg" width={16} height={16} alt="" aria-hidden="true" />
                          </button>
                          <button
                            type="button"
                            title="Vender boleto"
                            onClick={() => goToSellTicket(event.idEvent)}
                            className="inline-flex cursor-pointer items-center justify-center rounded-full border border-black bg-white p-2 text-black hover:bg-slate-50"
                          >
                            <img src="/img/sell.png" width={16} height={16} alt="" aria-hidden="true" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>

            <Pagination page={page} totalPages={totalPages} onPageChange={loadEvents} />
          </div>
        ) : null}
      </div>

      {showFolioModal ? (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-6"
          onClick={() => setShowFolioModal(false)}
        >
          <div
            className="w-full max-w-sm rounded-lg bg-white p-6"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="mb-4 flex items-center justify-between">
              <h5 className="text-base font-bold text-black">Ingresar folio de compra</h5>
              <button
                type="button"
                onClick={() => setShowFolioModal(false)}
                className="cursor-pointer border-none bg-white text-black"
              >
                ✕
              </button>
            </div>

            <p className="mb-4 text-sm text-slate-600">
              Ingresa el folio y automáticamente se cargarán los detalles de la compra del cliente.
            </p>

            <input
              type="text"
              placeholder="Escribe el número de folio"
              value={folioValue}
              maxLength={6}
              onChange={(event) => setFolioValue(event.target.value.replace(/[^0-9]/g, ""))}
              className="mb-2 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
            />

            {folioError ? <div className="mb-4 text-sm text-red-600">{folioError}</div> : null}

            <button
              type="button"
              onClick={submitFolio}
              disabled={folioLoading}
              className="mt-2 w-full rounded-lg bg-[#6b35f5] px-4 py-2 text-sm font-semibold text-white disabled:opacity-60"
            >
              {folioLoading ? "Consultando..." : "Continuar"}
            </button>
          </div>
        </div>
      ) : null}
    </AppShell>
  );
}
