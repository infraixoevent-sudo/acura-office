"use client";

import { Suspense, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Swal from "sweetalert2";
import { AppShell } from "@/components/AppShell";
import { RoleViewsChecklist } from "@/components/RoleViewsChecklist";
import { postLegacy } from "@/lib/apiClient";
import { getMissingRoleFields, isValidRoleName, toggleRoleView } from "@/lib/roleViews";
import { useSessionGuard } from "@/lib/useSessionGuard";
import type {
  GetAvailableRoleViewsR,
  GetOrganizerRoleDetailsR,
  OrganizerRoleActionR,
  RoleView,
} from "@/types/acura";

const inputClass =
  "w-full rounded-xl border border-slate-300 bg-white px-3 py-2.5 text-sm text-slate-900 outline-none transition focus:border-[#6b35f5] focus:ring-2 focus:ring-[#6b35f5]/10";

function EditRoleForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const idRole = Number(searchParams.get("idRole") ?? "0");
  const { session, error: sessionError } = useSessionGuard();

  const [views, setViews] = useState<RoleView[]>([]);
  const [loading, setLoading] = useState(true);
  const [pageError, setPageError] = useState("");
  const [roleName, setRoleName] = useState("");
  const [selectedViews, setSelectedViews] = useState<number[]>([]);
  const [nameError, setNameError] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (session) loadData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [session]);

  async function loadData() {
    if (!session) return;

    if (!idRole || idRole <= 0) {
      setPageError("No se encontró el rol a editar.");
      setLoading(false);
      return;
    }

    setLoading(true);
    setPageError("");

    try {
      const [viewsRes, detailsRes] = await Promise.all([
        postLegacy<GetAvailableRoleViewsR>("GetAvailableRoleViews", {}, session.token),
        postLegacy<GetOrganizerRoleDetailsR>(
          "GetOrganizerRoleDetails",
          { idRole },
          session.token
        ),
      ]);

      setViews(viewsRes.views ?? []);

      if (!detailsRes.code) {
        setPageError(detailsRes.message ?? "El rol no existe.");
        return;
      }

      setRoleName(detailsRes.name ?? "");
      setSelectedViews(detailsRes.views ?? []);
    } catch (err) {
      setPageError(err instanceof Error ? err.message : String(err));
    } finally {
      setLoading(false);
    }
  }

  function toggleView(idView: number) {
    setSelectedViews((prev) => toggleRoleView(prev, idView));
  }

  async function alertMissingFields(missing: string[]) {
    await Swal.fire({
      title: "¡Alerta!",
      html: `<p>Los siguientes campos están vacíos o son inválidos:</p><br><p><small>${missing.join("<br>")}</small></p>`,
      confirmButtonText: "Aceptar",
    });
  }

  async function handleSubmit() {
    if (!session) return;

    const missing = getMissingRoleFields(roleName, selectedViews);
    if (missing.length > 0) {
      setNameError(missing.includes("Escribe un Nombre de rol") ? "El nombre del rol es requerido" : "");
      await alertMissingFields(missing);
      return;
    }

    if (!isValidRoleName(roleName)) {
      setNameError("El campo Nombre no contiene un formato correcto");
      await Swal.fire({
        title: "¡Alerta!",
        text: "El campo Nombre no contiene un formato correcto",
        confirmButtonText: "Aceptar",
      });
      return;
    }

    setNameError("");
    setSaving(true);

    try {
      const res = await postLegacy<OrganizerRoleActionR>(
        "UpdateOrganizerRole",
        {
          idRole,
          name: roleName.trim(),
          views: selectedViews,
        },
        session.token
      );

      if (res.code) {
        await Swal.fire({
          title: "",
          text: "se ha editado el rol correctamente",
          icon: "success",
          confirmButtonText: "Aceptar",
        });
        router.push("/Users");
      } else {
        await Swal.fire({
          title: "",
          text: res.message ?? "Error al editar el rol",
          icon: "error",
          confirmButtonText: "Aceptar",
        });
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

  if (pageError) {
    return (
      <AppShell>
        <div className="flex flex-col gap-4 max-w-2xl">
          <div className="rounded-xl bg-red-50 p-4 text-sm text-red-700">{pageError}</div>
          <button
            type="button"
            onClick={() => router.push("/Users")}
            className="w-fit rounded-xl border border-slate-300 bg-white px-5 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
          >
            Volver a Usuarios
          </button>
        </div>
      </AppShell>
    );
  }

  return (
    <AppShell>
      <div className="flex flex-col gap-6 max-w-2xl">

        {/* Encabezado */}
        <div className="flex items-start justify-between gap-4">
          <h2 className="text-2xl font-bold text-[#27243a]">Editar Rol de usuario</h2>
          <button
            type="button"
            onClick={() => router.push("/Users")}
            className="shrink-0 rounded-xl border border-slate-300 bg-white px-5 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
          >
            Atras
          </button>
        </div>

        <div className="rounded-2xl bg-white p-6 shadow-[0_12px_28px_rgba(15,23,42,0.08)] flex flex-col gap-5">

          {/* Nombre del rol */}
          <div>
            <p className="mb-2 text-xs text-slate-500">
              Crea roles personalizados con permisos administrativos.
            </p>
            <label
              htmlFor="role-name"
              className="mb-1.5 block text-sm font-semibold text-slate-700"
            >
              <span className="text-red-500">*</span> Nombre del rol
            </label>
            <div className="relative">
              <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                  <rect x="3" y="3" width="7" height="7" rx="1" stroke="currentColor" strokeWidth="1.8" />
                  <rect x="14" y="3" width="7" height="7" rx="1" stroke="currentColor" strokeWidth="1.8" />
                  <rect x="3" y="14" width="7" height="7" rx="1" stroke="currentColor" strokeWidth="1.8" />
                  <rect x="14" y="14" width="7" height="7" rx="1" stroke="currentColor" strokeWidth="1.8" />
                </svg>
              </span>
              <input
                id="role-name"
                type="text"
                value={roleName}
                onChange={(e) => {
                  setRoleName(e.target.value);
                  setNameError("");
                }}
                placeholder="Nombre del rol"
                className={`${inputClass} pl-9`}
              />
            </div>
            {nameError && (
              <p className="mt-1 text-xs text-red-600">{nameError}</p>
            )}
          </div>

          {/* Selección de vistas */}
          <div>
            <p className="mb-3 text-xs text-slate-500">
              Secciona los permisos a las pantallas que tendría acceso.
            </p>
            <RoleViewsChecklist
              views={views}
              loading={loading}
              selected={selectedViews}
              onToggle={toggleView}
            />
          </div>
        </div>

        {/* Botón Editar Rol */}
        <button
          type="button"
          onClick={handleSubmit}
          disabled={saving || loading}
          className="w-full rounded-xl bg-[#6b35f5] py-3 text-sm font-bold text-white transition hover:bg-[#5b2ce6] disabled:cursor-not-allowed disabled:opacity-60"
        >
          {saving ? "Guardando..." : "Editar Rol"}
        </button>
      </div>
    </AppShell>
  );
}

export default function EditRolePage() {
  return (
    <Suspense fallback={null}>
      <EditRoleForm />
    </Suspense>
  );
}
