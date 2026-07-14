"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Swal from "sweetalert2";
import { AdminShell } from "@/components/AdminShell";
import { postLegacy } from "@/lib/apiClient";
import { useAdminGuard } from "@/lib/useAdminGuard";
import type {
  GetEventsByOrganizerR,
  GetOrganizersR,
  GetSaldoByEventR,
  OrganizerEventListItem,
  OrganizerListItem,
  RGetEventsByOrganizer,
  RGetSaldoByEvent,
  RRegisterTransferToOrganizer,
  RegisterTransferR,
} from "@/types/acura";

const SELECT_ORGANIZER_PLACEHOLDER: OrganizerListItem = { idOrganizer: 0, name: "Selecciona un organizador" };
const SELECT_EVENT_PLACEHOLDER: OrganizerEventListItem = { idEvent: 0, name: "Selecciona un Evento" };

function formatMoney(value: number) {
  return new Intl.NumberFormat("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(value || 0);
}

export default function Page() {
  const router = useRouter();
  const { session } = useAdminGuard();

  const [organizers, setOrganizers] = useState<OrganizerListItem[]>([SELECT_ORGANIZER_PLACEHOLDER]);
  const [events, setEvents] = useState<OrganizerEventListItem[]>([SELECT_EVENT_PLACEHOLDER]);
  const [selectedOrganizerId, setSelectedOrganizerId] = useState(0);
  const [selectedEventId, setSelectedEventId] = useState(0);

  const [balanceTotal, setBalanceTotal] = useState(0);
  const [balanceTransfered, setBalanceTransfered] = useState(0);

  const [bankOperationNumber, setBankOperationNumber] = useState("");
  const [paymentDate, setPaymentDate] = useState("");
  const [amount, setAmount] = useState("");

  const [errorSelectOrganizer, setErrorSelectOrganizer] = useState("");
  const [errorSelectEvent, setErrorSelectEvent] = useState("");
  const [errorNumberOperation, setErrorNumberOperation] = useState("");
  const [errorDate, setErrorDate] = useState("");
  const [errorAmount, setErrorAmount] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (session) loadOrganizers();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [session]);

  async function loadOrganizers() {
    if (!session) return;

    try {
      const response = await postLegacy<GetOrganizersR>("GetOrganizers", undefined, session.token);
      setOrganizers([SELECT_ORGANIZER_PLACEHOLDER, ...(response.code ? response.organizers ?? [] : [])]);
    } catch {
      // el catálogo queda vacío; el usuario puede reintentar
    }
  }

  async function selectOrganizer(idOrganizer: number) {
    setSelectedOrganizerId(idOrganizer);
    setSelectedEventId(0);
    setEvents([SELECT_EVENT_PLACEHOLDER]);
    setBalanceTotal(0);
    setBalanceTransfered(0);
    if (!session || !idOrganizer) return;

    try {
      const response = await postLegacy<GetEventsByOrganizerR, RGetEventsByOrganizer>(
        "GetEventsByOrganizer",
        { idOrganizer },
        session.token
      );
      setEvents([SELECT_EVENT_PLACEHOLDER, ...(response.code ? response.events ?? [] : [])]);
    } catch {
      setEvents([SELECT_EVENT_PLACEHOLDER]);
    }
  }

  async function selectEvent(idEvent: number) {
    setSelectedEventId(idEvent);
    setBalanceTotal(0);
    setBalanceTransfered(0);
    if (!session || !idEvent) return;

    try {
      const response = await postLegacy<GetSaldoByEventR, RGetSaldoByEvent>(
        "GetSaldoByEvent",
        { idEvent },
        session.token
      );
      if (response.code) {
        setBalanceTotal(response.balanceTotal);
        setBalanceTransfered(response.balanceTransfered);
      }
    } catch {
      // el saldo queda en cero; la validación de saldo real la hace el backend al registrar
    }
  }

  async function handleSubmit() {
    if (!session) return;

    const missing: string[] = [];

    if (!selectedOrganizerId) {
      missing.push("Selecciona un organizador");
      setErrorSelectOrganizer("Selecciona un organizador");
    } else {
      setErrorSelectOrganizer("");
    }

    if (!selectedEventId) {
      missing.push("Selecciona un Evento");
      setErrorSelectEvent("Selecciona un Evento");
    } else {
      setErrorSelectEvent("");
    }

    if (!bankOperationNumber) {
      missing.push("Escribe No. operación bancaria");
      setErrorNumberOperation("Escribe No. operación bancaria");
    } else {
      setErrorNumberOperation("");
    }

    if (!paymentDate) {
      missing.push("Selecciona una Fecha de pago");
      setErrorDate("Selecciona una Fecha de pago");
    } else {
      setErrorDate("");
    }

    const amountValue = Number(amount);
    if (!amount || !Number.isFinite(amountValue) || amountValue <= 0) {
      missing.push("Escribe un Monto válido");
      setErrorAmount("Escribe un Monto válido");
    } else {
      setErrorAmount("");
    }

    if (missing.length > 0) {
      await Swal.fire({
        title: "¡Alerta!",
        html: `<p>Los siguientes campos están vacíos o son inválidos:</p><br><p><small>${missing.join("<br>")}</small></p>`,
        confirmButtonText: "Aceptar",
      });
      return;
    }

    const idUserMaster = Number(localStorage.getItem("IdUser")) || 0;

    setSaving(true);

    try {
      const request: RRegisterTransferToOrganizer = {
        idEvent: selectedEventId,
        amount: amountValue,
        createDate: new Date(`${paymentDate}T00:00:00`).toISOString(),
        idUserMaster,
        idTransaccion: bankOperationNumber,
      };

      const response = await postLegacy<RegisterTransferR, RRegisterTransferToOrganizer>(
        "RegisterTransferToOrganizer",
        request,
        session.token
      );

      if (response.code) {
        await Swal.fire({ title: "Exitoso", text: response.message, icon: "success", confirmButtonText: "Aceptar" });
        router.push("/Admin/PaymentHistory");
      } else {
        await Swal.fire({ title: "Error", text: response.message, icon: "error", confirmButtonText: "Aceptar" });
      }
    } catch (err) {
      await Swal.fire({
        title: "Error",
        text: err instanceof Error ? err.message : String(err),
        icon: "error",
        confirmButtonText: "Aceptar",
      });
    } finally {
      setSaving(false);
    }
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
      <div className="max-w-3xl pb-10">
        <h1 className="mb-6 text-[28px] font-extrabold text-black">Registro de pagos a organizador</h1>

        <p className="mb-1 text-sm font-semibold text-slate-700">Resumen de pagos:</p>
        <div className="mb-4 flex flex-wrap gap-x-10 gap-y-1">
          <p className="text-xs font-bold" style={{ color: "#1F7A10" }}>
            Monto Transferido: <span className="font-normal">${formatMoney(balanceTransfered)}</span>
          </p>
          <p className="text-xs font-bold" style={{ color: "#FF004D" }}>
            Monto pendiente de pago: <span className="font-normal">${formatMoney(balanceTotal)}</span>
          </p>
        </div>

        <div className="flex flex-col gap-4 lg:flex-row">
          <div className="flex-1">
            <label htmlFor="organizerDropdown" className="mb-1 block text-sm font-semibold text-slate-700">
              <span className="text-red-500">*</span> Selecciona un organizador
            </label>
            <select
              id="organizerDropdown"
              value={selectedOrganizerId}
              onChange={(event) => selectOrganizer(Number(event.target.value))}
              className="h-[58px] w-full rounded-lg border border-slate-300 bg-white px-4 text-sm text-slate-900"
            >
              {organizers.map((item) => (
                <option key={item.idOrganizer} value={item.idOrganizer}>
                  {item.name}
                </option>
              ))}
            </select>
            {errorSelectOrganizer ? <p className="mt-1 text-sm text-red-600">{errorSelectOrganizer}</p> : null}
          </div>

          <div className="flex-1">
            <label htmlFor="eventDropdown" className="mb-1 block text-sm font-semibold text-slate-700">
              <span className="text-red-500">*</span> Selecciona un Evento
            </label>
            <select
              id="eventDropdown"
              value={selectedEventId}
              onChange={(event) => selectEvent(Number(event.target.value))}
              className="h-[58px] w-full rounded-lg border border-slate-300 bg-white px-4 text-sm text-slate-900"
            >
              {events.map((item) => (
                <option key={item.idEvent} value={item.idEvent}>
                  {item.name}
                </option>
              ))}
            </select>
            {errorSelectEvent ? <p className="mt-1 text-sm text-red-600">{errorSelectEvent}</p> : null}
          </div>
        </div>

        {/* Comprobante de pago: pendiente de integrar ACURA-MULTIMEDIA (servicio
            externo estacionado, ver docs/dimensionamiento-fullpayment.md en
            ACURA-USERS). El backend ya soporta registrar la transferencia sin
            comprobante. */}
        <div className="mt-4 rounded-lg border border-dashed border-slate-300 bg-slate-50 px-4 py-3">
          <p className="text-sm font-semibold text-slate-500">Comprobante de pago</p>
          <p className="text-xs text-slate-400">
            Próximamente: subida de comprobante PDF. Por ahora el pago se registra sin comprobante adjunto.
          </p>
        </div>

        <hr className="my-4 border-slate-200" />

        <p className="mb-1 text-sm font-semibold text-slate-700">Ingresa el número de operación bancaria</p>
        <div className="max-w-md">
          <label htmlFor="bankOperationNumber" className="mb-1 block text-sm font-semibold text-slate-700">
            <span className="text-red-500">*</span> No. operación bancaria
          </label>
          <input
            id="bankOperationNumber"
            type="text"
            value={bankOperationNumber}
            onChange={(event) => setBankOperationNumber(event.target.value)}
            className="h-[58px] w-full rounded-lg border border-slate-300 bg-white px-4 text-sm text-slate-900"
          />
          {errorNumberOperation ? <p className="mt-1 text-sm text-red-600">{errorNumberOperation}</p> : null}
        </div>

        <p className="mb-1 mt-4 text-sm font-semibold text-slate-700">Detalles de Pago:</p>
        <div className="flex flex-col gap-4 lg:flex-row">
          <div className="flex-1">
            <label htmlFor="paymentDate" className="mb-1 block text-sm font-semibold text-slate-700">
              Fecha de pago
            </label>
            <input
              id="paymentDate"
              type="date"
              value={paymentDate}
              onChange={(event) => setPaymentDate(event.target.value)}
              className="h-[58px] w-full rounded-lg border border-slate-300 bg-white px-4 text-sm text-slate-900"
            />
            {errorDate ? <p className="mt-1 text-sm text-red-600">{errorDate}</p> : null}
          </div>

          <div className="flex-1">
            <label htmlFor="amount" className="mb-1 block text-sm font-semibold text-slate-700">
              <span className="text-red-500">*</span> Monto
            </label>
            <input
              id="amount"
              type="text"
              placeholder="Monto"
              value={amount}
              onChange={(event) => setAmount(event.target.value)}
              className="h-[58px] w-full rounded-lg border border-slate-300 bg-white px-4 text-sm text-slate-900"
            />
            {errorAmount ? <p className="mt-1 text-sm text-red-600">{errorAmount}</p> : null}
          </div>
        </div>

        <div className="mt-6 flex gap-3">
          <button
            type="button"
            onClick={handleSubmit}
            disabled={saving}
            className="rounded-lg bg-[#562BD2] px-8 py-3 text-sm font-semibold text-white disabled:cursor-not-allowed disabled:opacity-60"
          >
            {saving ? "Registrando..." : "Registrar pago"}
          </button>
          <button
            type="button"
            onClick={() => router.push("/Admin/PaymentHistory")}
            className="rounded-lg border-2 border-black px-8 py-3 text-sm font-semibold text-black"
          >
            Cancelar
          </button>
        </div>
      </div>
    </AdminShell>
  );
}
