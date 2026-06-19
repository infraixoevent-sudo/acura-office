"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Swal from "sweetalert2";
import { AppShell } from "@/components/AppShell";
import { getStoredToken, postLegacy } from "@/lib/apiClient";
import type { GetAvailableRoleViewsR, RoleView } from "@/types/acura";

function getOrganizerId(): number {
  return parseInt(localStorage.getItem("IdOrganizer") ?? "0", 10);
}

const inputClass =
  "w-full rounded-xl border border-slate-300 bg-white px-3 py-2.5 text-sm text-slate-900 outline-none transition focus:border-[#6b35f5] focus:ring-2 focus:ring-[#6b35f5]/10";

export default function RolePage() {
  const router = useRouter();
  const [views, setViews] = useState<RoleView[]>([]);
  const [loadingViews, setLoadingViews] = useState(true);
  const [roleName, setRoleName] = useState("");
  const [selectedViews, setSelectedViews] = useState<number[]>([]);
  const [nameError, setNameError] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    loadViews();
  }, []);

  async function loadViews() {
    setLoadingViews(true);
    const token = getStoredToken();
    try {
      const res = await postLegacy<GetAvailableRoleViewsR>(
        "GetAvailableRoleViews",
        {},
        token
      );
      setViews(res.Views ?? []);
    } catch {
      setViews([]);
    } finally {
      setLoadingViews(false);
    }
  }

  function toggleView(idView: number) {
    setSelectedViews((prev) =>
      prev.includes(idView) ? prev.filter((v) => v !== idView) : [...prev, idView]
    );
  }

  async function handleSubmit() {
    if (!roleName.trim()) {
      setNameError("El nombre del rol es requerido");
      return;
    }
    setNameError("");
    setSaving(true);

    const token = getStoredToken();
    const idOrganizer = getOrganizerId();

    try {
      const res = await postLegacy<{ code: boolean; message: string }>(
        "CreateOrganizerRole",
        {
          RoleName: roleName.trim(),
          IdOrganizer: idOrganizer,
          RoleViews: selectedViews,
        },
        token
      );

      if (res.code) {
        await Swal.fire({
          title: "Exitoso",
          text: res.message ?? "Rol creado correctamente",
          icon: "success",
          confirmButtonText: "Aceptar",
        });
        router.push("/Users");
      } else {
        await Swal.fire({
          title: "Error",
          text: res.message ?? "Error al crear el rol",
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

  return (
    <AppShell>
      <div className="flex flex-col gap-6 max-w-2xl">

        {/* Encabezado */}
        <div className="flex items-start justify-between gap-4">
          <h2 className="text-2xl font-bold text-[#27243a]">Agregar Rol de usuario</h2>
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
            {loadingViews ? (
              <p className="text-sm text-slate-400">Cargando vistas...</p>
            ) : views.length === 0 ? (
              <p className="text-sm text-slate-400">No hay vistas disponibles</p>
            ) : (
              <ul className="flex flex-col gap-2">
                {views.map((view) => {
                  const isChild = view.Main !== null && view.Main !== undefined && view.Main !== 0;
                  return (
                    <li key={view.IdView}>
                      <label
                        className={`flex items-center gap-3 ${isChild ? "cursor-not-allowed opacity-40" : "cursor-pointer"}`}
                      >
                        <input
                          type="checkbox"
                          checked={selectedViews.includes(view.IdView)}
                          onChange={() => !isChild && toggleView(view.IdView)}
                          disabled={isChild}
                          className="h-4 w-4 rounded border-slate-300 accent-[#6b35f5] disabled:cursor-not-allowed"
                        />
                        <span className="text-sm text-slate-700">
                          {view.Description ?? view.URL}
                        </span>
                      </label>
                    </li>
                  );
                })}
              </ul>
            )}
          </div>
        </div>

        {/* Botón Agregar Rol */}
        <button
          type="button"
          onClick={handleSubmit}
          disabled={saving || loadingViews}
          className="w-full rounded-xl bg-[#6b35f5] py-3 text-sm font-bold text-white transition hover:bg-[#5b2ce6] disabled:cursor-not-allowed disabled:opacity-60"
        >
          {saving ? "Guardando..." : "Agregar Rol"}
        </button>
      </div>
    </AppShell>
  );
}
