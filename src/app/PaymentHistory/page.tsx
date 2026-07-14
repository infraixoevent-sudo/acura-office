"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { AppShell } from "@/components/AppShell";
import { Pagination } from "@/components/Pagination";
import { postLegacy } from "@/lib/apiClient";
import { useSessionGuard } from "@/lib/useSessionGuard";
import type {
  EventTransferItem,
  GetEventsByOrganizerR,
  GetTransferByEventR,
  OrganizerEventListItem,
  RGetEventsByOrganizer,
  RGetTransferByEvent,
} from "@/types/acura";

const SELECT_EVENT_PLACEHOLDER: OrganizerEventListItem = { idEvent: 0, name: "Selecciona un evento" };

function formatDate(value?: string | null) {
  if (!value) return "";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  return date.toLocaleDateString("es-ES", { day: "2-digit", month: "short", year: "numeric" });
}

function formatMoney(value: number) {
  return new Intl.NumberFormat("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(value || 0);
}

export default function Page() {
  const router = useRouter();
  const { session, error: sessionError } = useSessionGuard();

  const [events, setEvents] = useState<OrganizerEventListItem[]>([SELECT_EVENT_PLACEHOLDER]);
  const [selectedEventId, setSelectedEventId] = useState(0);
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [startDateError, setStartDateError] = useState("");
  const [endDateError, setEndDateError] = useState("");
  const [selectEventError, setSelectEventError] = useState("");

  const [payments, setPayments] = useState<EventTransferItem[]>([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const [firstRender, setFirstRender] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (session) loadEvents();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [session]);

  async function loadEvents() {
    if (!session) return;

    try {
      const response = await postLegacy<GetEventsByOrganizerR, RGetEventsByOrganizer>(
        "GetEventsByOrganizer",
        { idOrganizer: session.idOrganizer },
        session.token
      );

      setEvents([SELECT_EVENT_PLACEHOLDER, ...(response.code ? response.events ?? [] : [])]);
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
    }
  }

  async function search(targetPage: number) {
    if (!session) return;

    setStartDateError("");
    setEndDateError("");
    setSelectEventError("");

    if (!selectedEventId) {
      setSelectEventError("Selecciona un evento");
      return;
    }

    // Espejo de FilterSearch (PaymentHistory.razor): ambas fechas o ninguna;
    // una sola fecha presente produce un mensaje por campo sin buscar.
    if (startDate && endDate) {
      if (endDate < startDate) {
        setStartDateError("La fecha final debe ser mayor a la fecha de inicio");
        return;
      }
    } else if (startDate || endDate) {
      if (!startDate) setStartDateError("Selecciona la fecha de inicio");
      if (!endDate) setEndDateError("Selecciona la fecha final");
      return;
    }

    setError("");

    try {
      const request: RGetTransferByEvent = {
        idEvent: selectedEventId,
        startDate: startDate ? new Date(`${startDate}T00:00:00`).toISOString() : undefined,
        endDate: endDate ? new Date(`${endDate}T23:59:59.999`).toISOString() : undefined,
        page: targetPage,
      };

      const response = await postLegacy<GetTransferByEventR, RGetTransferByEvent>(
        "GetTransferByEvent",
        request,
        session.token
      );

      setPayments(response.code ? response.eventTransfers ?? [] : []);
      setTotalPages(response.totalPages ?? 0);
      setPage(targetPage + 1);
      setFirstRender(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
      setPayments([]);
      setTotalPages(0);
    }
  }

  function clearFilters() {
    setStartDate("");
    setEndDate("");
    setStartDateError("");
    setEndDateError("");
  }

  function goToPage(targetPage: number) {
    search(targetPage - 1);
  }

  function goToDetails(idTransfer: number) {
    router.push(`/PaymentHistory/PaymentDetails?idTransfer=${idTransfer}`);
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
        <h1 className="mb-6 text-[28px] font-extrabold text-black">Historial de Pagos</h1>

        {error ? (
          <div className="mb-6 rounded-lg bg-red-50 px-4 py-3 text-sm font-medium text-red-700">{error}</div>
        ) : null}

        <div>
          <label htmlFor="eventDropdown" className="mb-1 block text-sm font-semibold text-slate-700">
            Selecciona un Evento
          </label>
          <select
            id="eventDropdown"
            value={selectedEventId}
            onChange={(event) => setSelectedEventId(Number(event.target.value))}
            className="h-[58px] w-full max-w-md rounded-lg border border-slate-300 bg-white px-4 text-sm text-slate-900"
          >
            {events.map((item) => (
              <option key={item.idEvent} value={item.idEvent}>
                {item.name}
              </option>
            ))}
          </select>
          {selectEventError ? <p className="mt-1 text-sm text-red-600">{selectEventError}</p> : null}
        </div>

        <hr className="my-4 border-slate-200" />

        <div className="flex flex-col gap-4 lg:flex-row lg:items-end">
          <div className="flex-1">
            <label htmlFor="startDate" className="mb-1 block text-sm font-semibold text-slate-700">
              Fecha Inicio
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

          <div className="flex-1">
            <label htmlFor="endDate" className="mb-1 block text-sm font-semibold text-slate-700">
              Fecha Fin
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

          <div className="flex gap-2">
            <button
              type="button"
              onClick={clearFilters}
              className="h-[58px] rounded-lg border border-[#636366] px-6 text-sm font-semibold text-[#636366]"
            >
              Limpiar
            </button>
            <button
              type="button"
              onClick={() => search(0)}
              className="h-[58px] rounded-lg bg-[#562BD2] px-6 text-sm font-semibold text-white"
            >
              Filtrar
            </button>
          </div>
        </div>

        <div className="mt-6 overflow-x-auto">
          <table className="w-full min-w-[900px] border-collapse bg-white">
            <thead>
              <tr className="bg-[#d9dee3]">
                <th className="px-4 py-4 text-left text-sm font-extrabold text-black">Fecha de pago</th>
                <th className="px-4 py-4 text-left text-sm font-extrabold text-black">Monto</th>
                <th className="px-4 py-4 text-left text-sm font-extrabold text-black">No. de operación bancaria</th>
                <th className="px-4 py-4 text-left text-sm font-extrabold text-black">No. de boletos vendidos</th>
                <th className="px-4 py-4 text-left text-sm font-extrabold text-black">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {firstRender ? (
                <tr>
                  <td colSpan={5} className="px-4 py-6 text-center text-sm text-slate-500">
                    Selecciona un evento para ver su historial de pagos.
                  </td>
                </tr>
              ) : payments.length > 0 ? (
                payments.map((payment) => (
                  <tr key={payment.idTransfer} className="border-b border-[#d9dee3]">
                    <td className="px-4 py-5 text-sm text-slate-700">{formatDate(payment.transferDate)}</td>
                    <td className="px-4 py-5 text-sm text-slate-700">${formatMoney(payment.amount)}</td>
                    <td className="px-4 py-5 text-sm text-slate-700">{payment.bankTransactionNumber}</td>
                    <td className="px-4 py-5 text-sm text-slate-700">{payment.ticketsSold}</td>
                    <td className="px-4 py-5 text-center">
                      <button
                        type="button"
                        title="Ver solicitud"
                        onClick={() => goToDetails(payment.idTransfer)}
                        className="inline-flex cursor-pointer items-center justify-center rounded-lg p-1 hover:bg-slate-100"
                      >
                        <img src="/img/eye-admin.svg" width={20} height={20} alt="Ver solicitud" />
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={5} className="px-4 py-6 text-center text-sm text-slate-500">
                    No existe información disponible.
                  </td>
                </tr>
              )}
            </tbody>
          </table>

          <Pagination page={page} totalPages={totalPages} onPageChange={goToPage} />
        </div>
      </div>
    </AppShell>
  );
}
