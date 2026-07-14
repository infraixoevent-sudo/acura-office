"use client";

import { Suspense, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { AdminShell } from "@/components/AdminShell";
import { postLegacy } from "@/lib/apiClient";
import { useAdminGuard } from "@/lib/useAdminGuard";
import type { GetTransferDetailsR, RGetTransferDetails } from "@/types/acura";

function formatDate(value?: string | null) {
  if (!value) return "";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  return date.toLocaleDateString("es-ES", { day: "2-digit", month: "short", year: "numeric" });
}

function formatMoney(value: number) {
  return new Intl.NumberFormat("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(value || 0);
}

function PaymentDetailsContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const idTransfer = Number(searchParams.get("idTransfer") ?? "0");
  const { session } = useAdminGuard();

  const [payment, setPayment] = useState<GetTransferDetailsR | null>(null);
  const [loading, setLoading] = useState(true);
  const [pageError, setPageError] = useState("");

  useEffect(() => {
    if (session) loadDetails();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [session]);

  async function loadDetails() {
    if (!session) return;

    if (!idTransfer || idTransfer <= 0) {
      setPageError("No se encontró el pago a consultar.");
      setLoading(false);
      return;
    }

    setLoading(true);
    setPageError("");

    try {
      const response = await postLegacy<GetTransferDetailsR, RGetTransferDetails>(
        "GetTransferDetails",
        { idTransfer },
        session.token
      );

      if (!response.code) {
        setPageError(response.message ?? "No se pudo obtener el detalle del pago.");
        return;
      }

      setPayment(response);
    } catch (err) {
      setPageError(err instanceof Error ? err.message : String(err));
    } finally {
      setLoading(false);
    }
  }

  if (!session || loading) {
    return (
      <AdminShell>
        <p className="py-10 text-center text-sm text-slate-400">Cargando...</p>
      </AdminShell>
    );
  }

  if (pageError || !payment) {
    return (
      <AdminShell>
        <div className="flex max-w-2xl flex-col gap-4">
          <div className="rounded-xl bg-red-50 p-4 text-sm text-red-700">{pageError}</div>
          <button
            type="button"
            onClick={() => router.push("/Admin/PaymentHistory")}
            className="w-fit rounded-lg border-2 border-black px-6 py-3 text-sm font-semibold text-black"
          >
            Atrás
          </button>
        </div>
      </AdminShell>
    );
  }

  const tickets = payment.tickets ?? [];
  const commissions = payment.commissions ?? [];

  return (
    <AdminShell>
      <div className="pb-10">
        <div className="mb-6 flex items-center justify-between">
          <h1 className="text-[28px] font-extrabold text-black">Detalle de pago organizador</h1>
          <button
            type="button"
            onClick={() => router.push("/Admin/PaymentHistory")}
            className="rounded-lg border-2 border-black px-6 py-3 text-sm font-semibold text-black"
          >
            Atrás
          </button>
        </div>

        <div className="grid grid-cols-2 gap-6 lg:grid-cols-4">
          <div>
            <p className="text-sm text-slate-500">Nombre de Evento</p>
            <p className="text-sm text-slate-900">{payment.eventName}</p>
          </div>
          <div>
            <p className="text-sm text-slate-500">No. operación bancaria</p>
            <p className="text-sm text-slate-900">{payment.bankTransactionNumber}</p>
          </div>
          <div>
            <p className="text-sm text-slate-500">Fecha de pago</p>
            <p className="text-sm text-slate-900">{formatDate(payment.transferDate)}</p>
          </div>
          <div>
            <p className="text-sm text-slate-500">Comprobante de pago</p>
            {payment.transferReceiptUrl ? (
              <a
                href={payment.transferReceiptUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm text-[#562BD2] underline"
              >
                Ver imagen
              </a>
            ) : (
              <p className="text-sm text-slate-400">—</p>
            )}
          </div>
        </div>

        {tickets.length > 0 ? (
          <div className="mt-6">
            <table className="w-full min-w-[600px] border-collapse bg-white">
              <thead>
                <tr>
                  <th className="px-4 py-3 text-left text-sm font-bold text-black">Nombre del boleto</th>
                  <th className="px-4 py-3 text-left text-sm font-bold text-black">No. de boletos vendidos</th>
                  <th className="px-4 py-3 text-left text-sm font-bold text-black">Monto</th>
                </tr>
              </thead>
              <tbody className="text-slate-600">
                {tickets.map((ticket, index) => (
                  <tr key={index} className="border-b border-slate-100">
                    <th scope="row" className="px-4 py-3 text-left text-sm font-normal">{ticket.name}</th>
                    <td className="px-4 py-3 text-sm">{ticket.quantity}</td>
                    <td className="px-4 py-3 text-sm">${formatMoney(ticket.amount)}</td>
                  </tr>
                ))}
              </tbody>
            </table>

            <div className="mt-3 text-right">
              <span style={{ color: "#1F7A10" }}>Subtotal ${formatMoney(payment.subtotal ?? 0)}</span>
            </div>
            <ul className="my-1 py-1 text-right">
              {commissions.map((commission, index) => (
                <li key={index} style={{ color: "#FF004D" }}>
                  {commission.description} - ${formatMoney(commission.value)}
                </li>
              ))}
            </ul>
            <div className="text-right font-bold">
              Total ${formatMoney(payment.total ?? 0)}
            </div>
          </div>
        ) : (
          <p className="mt-10 text-center font-bold text-black">No tienes pagos para mostrar</p>
        )}
      </div>
    </AdminShell>
  );
}

export default function PaymentDetailsPage() {
  return (
    <Suspense fallback={null}>
      <PaymentDetailsContent />
    </Suspense>
  );
}
