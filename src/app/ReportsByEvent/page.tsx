"use client";

import { useEffect, useMemo, useState } from "react";
import { AppShell } from "@/components/AppShell";
import { Pagination } from "@/components/Pagination";
import { getStoredToken, postLegacy } from "@/lib/apiClient";
import type {
  EventsOrganizerList,
  EventsR,
  GetTicketsReportR,
  REvents,
  RGetTicketsReport,
  TicketsList,
} from "@/types/acura";

const PAGE_SIZE = 10;
const EMAIL_PATTERN = /^[^@\s]+@[^@\s]+\.[^@\s]+$/;
const SELECT_EVENT_PLACEHOLDER: EventsOrganizerList = {
  IdEvent: 0,
  Name: "Selecciona un evento",
  SoldTickets: 0,
  AvailableTickets: 0,
  IdStatus: 0,
};

function formatMoney(value: number) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(value || 0);
}

export default function Page() {
  const [events, setEvents] = useState<EventsOrganizerList[]>([
    SELECT_EVENT_PLACEHOLDER,
  ]);
  const [selectedEventId, setSelectedEventId] = useState(0);
  const [purchaseOrder, setPurchaseOrder] = useState("");
  const [emailOrganizer, setEmailOrganizer] = useState("");
  const [dateStart, setDateStart] = useState("");
  const [dateEnd, setDateEnd] = useState("");

  const [tickets, setTickets] = useState<TicketsList[]>([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const [searched, setSearched] = useState(false);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const [showModal, setShowModal] = useState(false);
  const [pdfUrl, setPdfUrl] = useState("");
  const [idOrderSelected, setIdOrderSelected] = useState(0);

  const idOrganizer = useMemo(() => {
    if (typeof window === "undefined") return 0;
    return Number(localStorage.getItem("IdOrganizer")) || 0;
  }, []);

  const idUser = useMemo(() => {
    if (typeof window === "undefined") return 0;
    return Number(localStorage.getItem("IdUser")) || 0;
  }, []);

  useEffect(() => {
    async function loadEvents() {
      try {
        const response = await postLegacy<EventsR, REvents>(
          "GetAdminEvents",
          { IdOrganizer: idOrganizer, IdStatus: "", Name: "", Date: "" },
          getStoredToken()
        );

        const adminEvents = (response.adminEvents ?? [])
          .slice()
          .sort((a, b) => (a.Name ?? "").localeCompare(b.Name ?? ""));

        setEvents([SELECT_EVENT_PLACEHOLDER, ...adminEvents]);
      } catch (err) {
        setError(err instanceof Error ? err.message : String(err));
      }
    }

    loadEvents();
  }, [idOrganizer]);

  function validate() {
    if (!selectedEventId) {
      return "Debes seleccionar un evento.";
    }

    if (emailOrganizer && !EMAIL_PATTERN.test(emailOrganizer)) {
      return "El correo electrónico ingresado no tiene un formato válido.";
    }

    if ((dateStart && !dateEnd) || (!dateStart && dateEnd)) {
      return "Debes seleccionar ambas fechas (inicio y fin).";
    }

    if (dateStart && dateEnd && new Date(dateStart) > new Date(dateEnd)) {
      return "La fecha de inicio no puede ser mayor a la fecha fin.";
    }

    return "";
  }

  async function fetchReport(targetPage: number) {
    const validationError = validate();
    if (validationError) {
      setError(validationError);
      return;
    }

    setLoading(true);
    setError("");

    const startDate = dateStart
      ? new Date(`${dateStart}T00:00:00`).toISOString()
      : "0001-01-01T00:00:00.000Z";
    const endDate = dateEnd
      ? new Date(`${dateEnd}T23:59:59.999`).toISOString()
      : "9999-12-31T23:59:59.999Z";

    try {
      const response = await postLegacy<GetTicketsReportR, RGetTicketsReport>(
        "GetTicketsReport",
        {
          idUser,
          idEvent: selectedEventId,
          startDate,
          endDate,
          folio: purchaseOrder || undefined,
          email: emailOrganizer || undefined,
          page: targetPage,
          pageSize: PAGE_SIZE,
        },
        getStoredToken()
      );

      setTickets(response.Tickets ?? []);
      setTotalPages(response.TotalPages ?? 0);
      setPage(targetPage);
      setSearched(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
      setTickets([]);
      setTotalPages(0);
    } finally {
      setLoading(false);
    }
  }

  function search() {
    fetchReport(1);
  }

  function goToPage(targetPage: number) {
    if (targetPage < 1 || targetPage > totalPages) return;
    fetchReport(targetPage);
  }

  function clearDates() {
    setEmailOrganizer("");
    setDateStart("");
    setDateEnd("");
    setPurchaseOrder("");
  }

  function openPdf(url?: string | null, idOrder?: number) {
    if (!url) return;
    setPdfUrl(url);
    setIdOrderSelected(idOrder ?? 0);
    setShowModal(true);
  }

  function closeModal() {
    setShowModal(false);
    setPdfUrl("");
  }

  return (
    <AppShell>
      <div className="pb-10">
        <h1 className="mb-6 text-[28px] font-extrabold text-black">
          Reportes
        </h1>

        {error ? (
          <div className="mb-6 rounded-lg bg-red-50 px-4 py-3 text-sm font-medium text-red-700">
            {error}
          </div>
        ) : null}

        <div className="flex flex-col gap-4 lg:flex-row">
          <div className="flex-1">
            <label
              htmlFor="eventDropdown"
              className="mb-1 block text-sm font-semibold text-slate-700"
            >
              Selecciona un evento
            </label>
            <select
              id="eventDropdown"
              value={selectedEventId}
              onChange={(event) => setSelectedEventId(Number(event.target.value))}
              className="h-[58px] w-full rounded-lg border border-slate-300 bg-white px-4 text-sm text-slate-900"
            >
              {events.map((item) => (
                <option key={item.IdEvent} value={item.IdEvent}>
                  {item.Name}
                </option>
              ))}
            </select>
          </div>

          <div className="flex-1">
            <label
              htmlFor="purchaseOrder"
              className="mb-1 block text-sm font-semibold text-slate-700"
            >
              Orden de compra
            </label>
            <input
              id="purchaseOrder"
              type="text"
              placeholder="Orden de compra"
              value={purchaseOrder}
              onChange={(event) => setPurchaseOrder(event.target.value)}
              className="h-[58px] w-full rounded-lg border border-slate-300 bg-white px-4 text-sm text-slate-900"
            />
          </div>

          <div className="flex-1">
            <label
              htmlFor="emailOrganizer"
              className="mb-1 block text-sm font-semibold text-slate-700"
            >
              Correo electrónico
            </label>
            <input
              id="emailOrganizer"
              type="text"
              placeholder="Correo electrónico"
              value={emailOrganizer}
              onChange={(event) => setEmailOrganizer(event.target.value)}
              className="h-[58px] w-full rounded-lg border border-slate-300 bg-white px-4 text-sm text-slate-900"
            />
          </div>
        </div>

        <div className="mt-4 flex flex-col items-start gap-4 lg:flex-row lg:items-end">
          <div className="flex-1">
            <label
              htmlFor="dateStart"
              className="mb-1 block text-sm font-semibold text-slate-700"
            >
              Fecha Inicio de Compra
            </label>
            <input
              id="dateStart"
              type="date"
              value={dateStart}
              onChange={(event) => setDateStart(event.target.value)}
              className="h-[58px] w-full rounded-lg border border-slate-300 bg-white px-4 text-sm text-slate-900"
            />
          </div>

          <div className="flex-1">
            <label
              htmlFor="dateEnd"
              className="mb-1 block text-sm font-semibold text-slate-700"
            >
              Fecha Fin de Compra
            </label>
            <input
              id="dateEnd"
              type="date"
              value={dateEnd}
              onChange={(event) => setDateEnd(event.target.value)}
              className="h-[58px] w-full rounded-lg border border-slate-300 bg-white px-4 text-sm text-slate-900"
            />
          </div>

          <button
            type="button"
            onClick={clearDates}
            title="Limpiar fechas"
            className="flex h-[58px] w-[58px] cursor-pointer items-center justify-center rounded-lg border border-slate-300 bg-white"
          >
            <img src="/img/iconClean.png" width={26} height={26} alt="" aria-hidden="true" />
          </button>

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

        {loading ? (
          <div className="mt-6 rounded-lg bg-blue-50 px-4 py-3 text-sm font-medium text-blue-700">
            Cargando reporte...
          </div>
        ) : null}

        {searched && !loading && tickets.length === 0 ? (
          <div className="mt-10 text-center">
            <img src="/img/notresults.jpg" alt="" aria-hidden="true" className="mx-auto" />
            <h4 className="mt-3 text-lg font-bold text-black">Sin resultados</h4>
            <h5 className="mt-2 text-sm text-slate-600">Intente nuevamente</h5>
          </div>
        ) : null}

        {tickets.length > 0 ? (
          <div className="mt-6 overflow-x-auto">
            <table className="w-full min-w-[900px] border-collapse bg-white">
              <thead>
                <tr className="bg-[#d9dee3]">
                  <th className="px-4 py-4 text-center text-sm font-extrabold text-black">
                    Orden de compra
                  </th>
                  <th className="px-4 py-4 text-center text-sm font-extrabold text-black">
                    Monto cobrado
                  </th>
                  <th className="px-4 py-4 text-center text-sm font-extrabold text-black">
                    Estatus de la orden
                  </th>
                  <th className="px-4 py-4 text-center text-sm font-extrabold text-black">
                    Cantidad de boletos en la orden
                  </th>
                  <th className="px-4 py-4 text-center text-sm font-extrabold text-black">
                    Acciones
                  </th>
                </tr>
              </thead>

              <tbody>
                {tickets.map((ticket) => (
                  <tr key={ticket.IdOrder} className="border-b border-[#d9dee3]">
                    <td className="px-4 py-5 text-center text-sm text-slate-700">
                      {ticket.IdOrder}
                    </td>
                    <td className="px-4 py-5 text-center text-sm text-slate-700">
                      {formatMoney(ticket.Amount)}
                    </td>
                    <td className="px-4 py-5 text-center text-sm text-slate-700">
                      {ticket.Status}
                    </td>
                    <td className="px-4 py-5 text-center text-sm text-slate-700">
                      {ticket.Quantity}
                    </td>
                    <td className="px-4 py-5 text-center">
                      {ticket.PDFURL ? (
                        <button
                          type="button"
                          title="Ver Reporte"
                          onClick={() => openPdf(ticket.PDFURL, ticket.IdOrder)}
                          className="inline-flex cursor-pointer items-center justify-center rounded-lg p-1 hover:bg-slate-100"
                        >
                          <img src="/img/eye.svg" width={20} height={20} alt="Ver Reporte" />
                        </button>
                      ) : null}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            <Pagination page={page} totalPages={totalPages} onPageChange={goToPage} />
          </div>
        ) : null}

        {showModal ? (
          <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-6"
            onClick={closeModal}
          >
            <div
              className="flex h-[87dvh] w-full max-w-5xl flex-col overflow-hidden rounded-lg bg-white"
              onClick={(event) => event.stopPropagation()}
            >
              <div className="flex h-[3em] items-center justify-between border-b border-slate-200 px-4">
                <h5 className="text-sm font-semibold text-black">
                  Visualización PDF - Orden de Compra: {idOrderSelected}
                </h5>
                <button
                  type="button"
                  onClick={closeModal}
                  className="cursor-pointer border-none bg-white text-black"
                >
                  X
                </button>
              </div>
              <div className="flex-1">
                <iframe src={pdfUrl} className="h-full w-full border-none" title="Reporte PDF" />
              </div>
            </div>
          </div>
        ) : null}
      </div>
    </AppShell>
  );
}
