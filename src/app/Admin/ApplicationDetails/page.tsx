"use client";

import { Suspense, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Swal from "sweetalert2";
import { AdminShell } from "@/components/AdminShell";
import { postLegacy } from "@/lib/apiClient";
import { useAdminGuard } from "@/lib/useAdminGuard";
import type {
  GetOrganizerApplicationDetailR,
  OrganizerApplicationDetail,
  RGetOrganizerApplicationDetail,
  RUpdateStatusOrganizerApplication,
  UpdateStatusOrganizerApplicationR,
} from "@/types/acura";

// Espejo del dropdown de acción en ApplicationDetails.razor.
const ACTIONS = [
  { idStatusApplication: 1, description: "Aprobar solicitud" },
  { idStatusApplication: 2, description: "Solicitar información" },
  { idStatusApplication: 3, description: "Cancelar solicitud" },
];

function ApplicationDetailsContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const idOrganizer = Number(searchParams.get("idOrganizer") ?? "0");
  const { session } = useAdminGuard();

  const [organizer, setOrganizer] = useState<OrganizerApplicationDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [pageError, setPageError] = useState("");

  const [idStatusApplication, setIdStatusApplication] = useState(1);
  const [message, setMessage] = useState("");
  const [messageError, setMessageError] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (session) loadOrganizer();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [session]);

  async function loadOrganizer() {
    if (!session) return;

    if (!idOrganizer || idOrganizer <= 0) {
      setPageError("No se encontró la solicitud a consultar.");
      setLoading(false);
      return;
    }

    setLoading(true);
    setPageError("");

    try {
      const response = await postLegacy<GetOrganizerApplicationDetailR, RGetOrganizerApplicationDetail>(
        "GetOrganizerByIdOrganizer",
        { idOrganizer },
        session.token
      );

      if (!response.code || !response.organizerInfo) {
        setPageError(response.msj ?? "No se pudo obtener la solicitud.");
        return;
      }

      setOrganizer(response.organizerInfo);
    } catch (err) {
      setPageError(err instanceof Error ? err.message : String(err));
    } finally {
      setLoading(false);
    }
  }

  // Espejo de la validación cliente de ApplicationDetails.razor: obligatorio
  // solo cuando se rechaza (status 2), entre 30 y 500 caracteres.
  function validateMessage(): boolean {
    if (idStatusApplication !== 2) {
      setMessageError("");
      return true;
    }
    if (message.trim().length < 30 || message.trim().length > 500) {
      setMessageError("Describe el motivo entre 30 y 500 caracteres");
      return false;
    }
    setMessageError("");
    return true;
  }

  async function confirm() {
    if (!session || !validateMessage()) return;

    setSaving(true);

    try {
      const request: RUpdateStatusOrganizerApplication = {
        idOrganizer,
        idStatusApplication,
        message: idStatusApplication === 2 ? message.trim() : undefined,
        // Espejo de ApprovedAt = DateTime.Now en ApplicationDetails.razor (fecha/hora del cliente)
        approvedAt: idStatusApplication === 1 ? new Date().toISOString().slice(0, 19) : undefined,
      };

      const response = await postLegacy<UpdateStatusOrganizerApplicationR, RUpdateStatusOrganizerApplication>(
        "UpdateStatusOrganizerApplication",
        request,
        session.token
      );

      await Swal.fire({
        title: "",
        text: response.msj,
        icon: response.code ? "success" : "error",
        confirmButtonText: "Aceptar",
      });
    } catch (err) {
      await Swal.fire({
        title: "Error",
        text: err instanceof Error ? err.message : String(err),
        icon: "error",
        confirmButtonText: "Aceptar",
      });
    } finally {
      setSaving(false);
      router.push("/Admin/Applications");
    }
  }

  if (!session || loading) {
    return (
      <AdminShell>
        <p className="py-10 text-center text-sm text-slate-400">Cargando...</p>
      </AdminShell>
    );
  }

  if (pageError || !organizer) {
    return (
      <AdminShell>
        <div className="flex max-w-2xl flex-col gap-4">
          <div className="rounded-xl bg-red-50 p-4 text-sm text-red-700">{pageError}</div>
          <button
            type="button"
            onClick={() => router.push("/Admin/Applications")}
            className="w-fit rounded-lg border-2 border-black px-6 py-3 text-sm font-semibold text-black"
          >
            Atrás
          </button>
        </div>
      </AdminShell>
    );
  }

  return (
    <AdminShell>
      <div className="pb-10">
        <div className="mb-6 flex items-center justify-between">
          <h1 className="text-[28px] font-extrabold text-black">Solicitud de organizador</h1>
          <button
            type="button"
            onClick={() => router.push("/Admin/Applications")}
            className="rounded-lg border-2 border-black px-6 py-3 text-sm font-semibold text-black"
          >
            Atrás
          </button>
        </div>

        <div className="flex items-center gap-4">
          {organizer.urlImg ? (
            <img src={organizer.urlImg} alt={organizer.name ?? ""} className="h-20 w-20 rounded-full object-cover" />
          ) : null}
          <div>
            <p className="text-lg font-bold text-black">{organizer.name}</p>
            <p className="text-sm text-slate-500">{organizer.companyName}</p>
          </div>
        </div>

        <div className="mt-6 grid grid-cols-2 gap-6 lg:grid-cols-3">
          <div>
            <p className="text-sm text-slate-500">Contacto</p>
            <p className="text-sm text-slate-900">{organizer.contactname}</p>
          </div>
          <div>
            <p className="text-sm text-slate-500">Correo</p>
            <p className="text-sm text-slate-900">{organizer.contactEmail}</p>
          </div>
          <div>
            <p className="text-sm text-slate-500">Teléfono</p>
            <p className="text-sm text-slate-900">{organizer.contactPhoneNumber}</p>
          </div>
          <div>
            <p className="text-sm text-slate-500">Sitio web</p>
            <p className="text-sm text-slate-900">{organizer.website ?? "—"}</p>
          </div>
          <div>
            <p className="text-sm text-slate-500">RFC</p>
            <p className="text-sm text-slate-900">{organizer.rfc ?? "—"}</p>
          </div>
          <div>
            <p className="text-sm text-slate-500">CURP</p>
            <p className="text-sm text-slate-900">{organizer.curp ?? "—"}</p>
          </div>
          <div>
            <p className="text-sm text-slate-500">CLABE</p>
            <p className="text-sm text-slate-900">{organizer.clabe ?? "—"}</p>
          </div>
          <div>
            <p className="text-sm text-slate-500">Banco</p>
            <p className="text-sm text-slate-900">{organizer.bankName ?? "—"}</p>
          </div>
        </div>

        <div className="mt-6">
          <p className="mb-2 text-sm font-semibold text-slate-700">Descripción</p>
          <p className="text-sm text-slate-700">{organizer.organizerDescription ?? "—"}</p>
        </div>

        <div className="mt-6 flex flex-wrap gap-4">
          {organizer.proofTaxSituation ? (
            <a href={organizer.proofTaxSituation} target="_blank" rel="noopener noreferrer" className="text-sm text-[#562BD2] underline">
              Constancia de situación fiscal
            </a>
          ) : null}
          {organizer.accountStatement ? (
            <a href={organizer.accountStatement} target="_blank" rel="noopener noreferrer" className="text-sm text-[#562BD2] underline">
              Estado de cuenta
            </a>
          ) : null}
          {organizer.proofResidency ? (
            <a href={organizer.proofResidency} target="_blank" rel="noopener noreferrer" className="text-sm text-[#562BD2] underline">
              Comprobante de domicilio
            </a>
          ) : null}
          {organizer.officialRepresentativeID ? (
            <a href={organizer.officialRepresentativeID} target="_blank" rel="noopener noreferrer" className="text-sm text-[#562BD2] underline">
              Identificación oficial
            </a>
          ) : null}
        </div>

        <div className="mt-10 max-w-xl">
          <label htmlFor="actionSelect" className="mb-1 block text-sm font-semibold text-slate-700">
            Acción
          </label>
          <select
            id="actionSelect"
            value={idStatusApplication}
            onChange={(event) => {
              setIdStatusApplication(Number(event.target.value));
              setMessageError("");
            }}
            className="h-[58px] w-full rounded-lg border border-slate-300 bg-white px-4 text-sm text-slate-900"
          >
            {ACTIONS.map((item) => (
              <option key={item.idStatusApplication} value={item.idStatusApplication}>
                {item.description}
              </option>
            ))}
          </select>

          {idStatusApplication === 2 ? (
            <div className="mt-4">
              <label htmlFor="message" className="mb-1 block text-sm font-semibold text-slate-700">
                Motivo de la solicitud de información
              </label>
              <textarea
                id="message"
                value={message}
                onChange={(event) => setMessage(event.target.value)}
                minLength={30}
                maxLength={500}
                rows={4}
                className="w-full rounded-lg border border-slate-300 bg-white p-4 text-sm text-slate-900"
              />
              {messageError ? <p className="mt-1 text-sm text-red-600">{messageError}</p> : null}
            </div>
          ) : null}

          <button
            type="button"
            onClick={confirm}
            disabled={saving}
            className="mt-6 h-[58px] w-full rounded-lg bg-[#562BD2] px-6 text-sm font-semibold text-white disabled:cursor-not-allowed disabled:opacity-60"
          >
            Confirmar
          </button>
        </div>
      </div>
    </AdminShell>
  );
}

export default function ApplicationDetailsPage() {
  return (
    <Suspense fallback={null}>
      <ApplicationDetailsContent />
    </Suspense>
  );
}
