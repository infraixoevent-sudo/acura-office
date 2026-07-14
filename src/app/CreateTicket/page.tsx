"use client";

import { FormEvent, useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Swal from "sweetalert2";
import { AppShell } from "@/components/AppShell";
import { Pagination } from "@/components/Pagination";
import { postLegacy } from "@/lib/apiClient";
import { useSessionGuard } from "@/lib/useSessionGuard";
import type {
  CreateTicketR,
  GetTicketByOrganizerR,
  RCreateTicket,
  TicketOrganizerItem,
} from "@/types/acura";

// Espejo de AgregarBoleto() en CreateTicket.razor: IdStatusTicket siempre
// viaja hardcodeado en 1 (puebla TicketClass.IdStatus) — el estatus real de
// venta lo calcula el servidor por fecha (idTicketStatus en la respuesta).
const ID_STATUS_TICKET = 1;
const NAME_REGEX = /^[a-zA-Z0-9À-ÿ\s.,#-]+$/;
const PRICE_REGEX = /^\d+(\.\d{1,2})?$/;

interface TicketFormState {
  NameTicket: string;
  DescriptionTicket: string;
  Quantity: string;
  Price: string;
  IsExtra: boolean;
  ColorTicket: string;
  SaleStartDate: string;
  SaleEndDate: string;
}

const initialTicketForm: TicketFormState = {
  NameTicket: "",
  DescriptionTicket: "",
  Quantity: "",
  Price: "",
  IsExtra: false,
  ColorTicket: "#5b2de2",
  SaleStartDate: "",
  SaleEndDate: "",
};

// Espejo de TableCashierEvent-like status badges, aquí basado en el idStatus
// calculado por validateDate en el backend (1 aún no inicia / 2 en venta /
// 3 terminada).
const STATUS_BADGE: Record<number, string> = {
  1: "bg-amber-100 text-amber-700",
  2: "bg-green-100 text-green-700",
  3: "bg-slate-200 text-slate-600",
};

export default function Page() {
  const router = useRouter();
  const { session, error: sessionError } = useSessionGuard();

  const [idEvent, setIdEvent] = useState<number | null>(null);
  const [tickets, setTickets] = useState<TicketOrganizerItem[] | null>(null);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState<TicketFormState>(initialTicketForm);
  const [formError, setFormError] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const stored = localStorage.getItem("IdEvent");
    setIdEvent(stored ? Number(stored) : null);
  }, []);

  const loadTickets = useCallback(
    async (targetPage: number) => {
      if (!session || !idEvent) return;

      setLoading(true);
      setError("");

      try {
        const response = await postLegacy<GetTicketByOrganizerR, { idEvent: number; page: number }>(
          "GetTicketByOrganizer",
          { idEvent, page: targetPage - 1 },
          session.token
        );

        setTickets(response.code ? response.ticketOrganizerList ?? [] : []);
        // La SP real cuenta el total sin el filtro de estatus del listado
        // (bug replicado a propósito, ver ACURA-EVENTS PR #24) — 10 por página.
        setTotalPages(response.code ? Math.ceil(response.totalDeRegistros / 10) : 0);
        setPage(targetPage);
      } catch (err) {
        setError(err instanceof Error ? err.message : String(err));
        setTickets([]);
        setTotalPages(0);
      } finally {
        setLoading(false);
      }
    },
    [session, idEvent]
  );

  useEffect(() => {
    if (session && idEvent) loadTickets(1);
  }, [session, idEvent, loadTickets]);

  function openModal() {
    setForm(initialTicketForm);
    setFormError("");
    setShowModal(true);
  }

  // Espejo de las validaciones de AgregarBoleto() en CreateTicket.razor.
  async function submitTicket(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!session || !idEvent) return;

    if (!form.NameTicket || !NAME_REGEX.test(form.NameTicket) || form.NameTicket.length > 100) {
      setFormError("El campo Nombre no contiene un formato correcto");
      return;
    }
    if (!form.Quantity || Number(form.Quantity) <= 0) {
      setFormError("Escribe la Cantidad de boletos");
      return;
    }
    if (String(Number(form.Quantity)).length > 5) {
      setFormError("La cantidad de boletos excede los 5 dígitos. Intente con una cantidad menor");
      return;
    }
    if (!form.Price || !PRICE_REGEX.test(form.Price)) {
      setFormError("El campo Precio no contiene un formato correcto");
      return;
    }
    if (!form.SaleStartDate || !form.SaleEndDate) {
      setFormError("Indica el inicio y fin de venta del boleto");
      return;
    }

    setFormError("");
    setSaving(true);

    try {
      const request: RCreateTicket = {
        NameTicket: form.NameTicket,
        IdStatusTicket: ID_STATUS_TICKET,
        DescriptionTicket: form.DescriptionTicket,
        IdEvent: idEvent,
        Quantity: Number(form.Quantity),
        Price: Number(form.Price),
        IsExtra: form.IsExtra,
        ColorTicket: form.ColorTicket,
        SaleStartDate: form.SaleStartDate,
        SaleEndDate: form.SaleEndDate,
      };

      const response = await postLegacy<CreateTicketR, RCreateTicket>(
        "CreateTickets",
        request,
        session.token
      );

      if (!response.code) {
        setFormError(response.message || "No se pudo crear el boleto");
        return;
      }

      setShowModal(false);
      await loadTickets(1);
      await Swal.fire({
        text: response.message || "Boleto creado",
        icon: "success",
        confirmButtonText: "Aceptar",
      });
    } catch {
      await Swal.fire({
        text: "Algo salió mal. Por favor, intenta de nuevo más tarde",
        confirmButtonText: "Aceptar",
      });
    } finally {
      setSaving(false);
    }
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

  if (!idEvent) {
    return (
      <AppShell>
        <div className="rounded-xl bg-amber-50 p-4 text-sm text-amber-800">
          No hay un evento activo. Primero crea un evento en{" "}
          <button
            type="button"
            className="underline"
            onClick={() => router.push("/CreateEvent")}
          >
            Crear evento
          </button>
          .
        </div>
      </AppShell>
    );
  }

  const hasTickets = !!tickets?.length;

  return (
    <AppShell>
      <div className="pb-10">
        <div className="mb-6 flex items-center justify-between">
          <h1 className="text-[28px] font-extrabold text-black">Boletos del evento</h1>
          <button
            type="button"
            onClick={openModal}
            className="rounded-lg bg-[#5b2de2] px-4 py-2 text-sm font-semibold text-white"
          >
            + Agregar boleto
          </button>
        </div>

        {error ? (
          <div className="mb-6 rounded-lg bg-red-50 px-4 py-3 text-sm font-medium text-red-700">{error}</div>
        ) : null}

        {loading ? (
          <div className="mb-6 rounded-lg bg-blue-50 px-4 py-3 text-sm font-medium text-blue-700">Cargando...</div>
        ) : null}

        {!loading && tickets !== null && !hasTickets ? (
          <div className="mt-4 flex flex-col items-center pt-4 text-center">
            <p className="mt-4 text-lg font-bold text-black">
              ¡Hora de personalizar! Agrega boletos estándar, VIP, descuentos y extras.
            </p>
          </div>
        ) : null}

        {hasTickets ? (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[900px] border-collapse bg-white">
              <thead>
                <tr className="bg-[#d9dee3]">
                  <th className="px-4 py-4 text-left text-sm font-extrabold text-black">Boleto</th>
                  <th className="px-4 py-4 text-left text-sm font-extrabold text-black">Descripción</th>
                  <th className="px-4 py-4 text-left text-sm font-extrabold text-black">Precio</th>
                  <th className="px-4 py-4 text-left text-sm font-extrabold text-black">Disponibles</th>
                  <th className="px-4 py-4 text-left text-sm font-extrabold text-black">Tipo</th>
                  <th className="px-4 py-4 text-left text-sm font-extrabold text-black">Estatus</th>
                </tr>
              </thead>

              <tbody>
                {tickets?.map((ticket) => (
                  <tr key={ticket.idTicketClass} className="border-b border-[#d9dee3]">
                    <td className="px-4 py-5 text-sm font-semibold text-black">
                      <span
                        className="mr-2 inline-block h-3 w-3 rounded-full align-middle"
                        style={{ backgroundColor: ticket.ticketColor || "#5b2de2" }}
                      />
                      {ticket.name}
                    </td>
                    <td className="px-4 py-5 text-sm text-slate-600">{ticket.descriptionTicket}</td>
                    <td className="px-4 py-5 text-sm text-slate-700">${ticket.price}</td>
                    <td className="px-4 py-5 text-sm text-slate-700">
                      {ticket.available} / {ticket.quantity}
                    </td>
                    <td className="px-4 py-5 text-sm text-slate-700">
                      {ticket.isExtra ? "Extra" : "Entrada"}
                    </td>
                    <td className="px-4 py-5">
                      <span
                        className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${
                          STATUS_BADGE[ticket.idStatus] ?? "bg-slate-100 text-slate-600"
                        }`}
                      >
                        {ticket.statusMsg}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            <Pagination page={page} totalPages={totalPages} onPageChange={loadTickets} />
          </div>
        ) : null}

        <div className="mt-10 flex justify-end">
          <button
            type="button"
            onClick={() => router.push("/EventPublication")}
            className="w-full rounded-lg bg-[#5b2de2] px-8 py-4 text-base font-extrabold text-white transition hover:bg-[#4b24c9] md:w-[290px]"
          >
            Guardar y continuar
          </button>
        </div>
      </div>

      {showModal ? (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-6"
          onClick={() => setShowModal(false)}
        >
          <form
            onSubmit={submitTicket}
            onClick={(event) => event.stopPropagation()}
            className="w-full max-w-lg rounded-lg bg-white p-6"
          >
            <div className="mb-4 flex items-center justify-between">
              <h5 className="text-base font-bold text-black">Agregar boleto</h5>
              <button
                type="button"
                onClick={() => setShowModal(false)}
                className="cursor-pointer border-none bg-white text-black"
              >
                ✕
              </button>
            </div>

            {formError ? (
              <div className="mb-4 rounded-lg bg-red-50 px-3 py-2 text-sm font-medium text-red-700">
                {formError}
              </div>
            ) : null}

            <div className="space-y-3">
              <div>
                <label className="mb-1 block text-xs font-semibold text-slate-500">
                  Tipo de boleto
                </label>
                <input
                  type="text"
                  value={form.NameTicket}
                  onChange={(event) => setForm((f) => ({ ...f, NameTicket: event.target.value }))}
                  className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
                />
              </div>

              <div>
                <label className="mb-1 block text-xs font-semibold text-slate-500">
                  Descripción
                </label>
                <textarea
                  value={form.DescriptionTicket}
                  onChange={(event) =>
                    setForm((f) => ({ ...f, DescriptionTicket: event.target.value }))
                  }
                  className="w-full resize-none rounded-lg border border-slate-300 px-3 py-2 text-sm"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="mb-1 block text-xs font-semibold text-slate-500">
                    Cantidad de boletos
                  </label>
                  <input
                    type="number"
                    min={1}
                    value={form.Quantity}
                    onChange={(event) => setForm((f) => ({ ...f, Quantity: event.target.value }))}
                    className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
                  />
                </div>

                <div>
                  <label className="mb-1 block text-xs font-semibold text-slate-500">Precio</label>
                  <input
                    type="text"
                    value={form.Price}
                    onChange={(event) => setForm((f) => ({ ...f, Price: event.target.value }))}
                    className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="mb-1 block text-xs font-semibold text-slate-500">
                    Inicio de venta
                  </label>
                  <input
                    type="datetime-local"
                    value={form.SaleStartDate}
                    onChange={(event) =>
                      setForm((f) => ({ ...f, SaleStartDate: event.target.value }))
                    }
                    className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
                  />
                </div>

                <div>
                  <label className="mb-1 block text-xs font-semibold text-slate-500">
                    Fin de venta
                  </label>
                  <input
                    type="datetime-local"
                    value={form.SaleEndDate}
                    onChange={(event) =>
                      setForm((f) => ({ ...f, SaleEndDate: event.target.value }))
                    }
                    className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
                  />
                </div>
              </div>

              <div className="flex items-center justify-between gap-3">
                <div>
                  <label className="mb-1 block text-xs font-semibold text-slate-500">Color</label>
                  <input
                    type="color"
                    value={form.ColorTicket}
                    onChange={(event) => setForm((f) => ({ ...f, ColorTicket: event.target.value }))}
                    className="h-9 w-16 rounded border border-slate-300"
                  />
                </div>

                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => setForm((f) => ({ ...f, IsExtra: false }))}
                    className={`rounded-lg px-4 py-2 text-sm font-semibold ${
                      !form.IsExtra ? "bg-[#5b2de2] text-white" : "bg-slate-100 text-slate-600"
                    }`}
                  >
                    Entrada
                  </button>
                  <button
                    type="button"
                    onClick={() => setForm((f) => ({ ...f, IsExtra: true }))}
                    className={`rounded-lg px-4 py-2 text-sm font-semibold ${
                      form.IsExtra ? "bg-[#5b2de2] text-white" : "bg-slate-100 text-slate-600"
                    }`}
                  >
                    Extra
                  </button>
                </div>
              </div>
            </div>

            <button
              type="submit"
              disabled={saving}
              className="mt-5 w-full rounded-lg bg-[#5b2de2] px-4 py-2 text-sm font-semibold text-white disabled:opacity-60"
            >
              {saving ? "Guardando..." : "Agregar boleto"}
            </button>
          </form>
        </div>
      ) : null}
    </AppShell>
  );
}
