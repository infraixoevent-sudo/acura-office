"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { AdminShell } from "@/components/AdminShell";
import { Pagination } from "@/components/Pagination";
import { postLegacy } from "@/lib/apiClient";
import { useAdminGuard } from "@/lib/useAdminGuard";
import type { GetOrganizerApplicationsR, OrganizerApplicationItem, RGetOrganizerApplications } from "@/types/acura";

// Espejo del dropdown de Applications.razor (lista estática, no viene de catálogo).
const STATUS_OPTIONS = [
  { idStatus: 0, description: "Todos" },
  { idStatus: 1, description: "Autorizado" },
  { idStatus: 2, description: "Rechazado" },
  { idStatus: 3, description: "Cancelado" },
  { idStatus: 4, description: "Pendiente" },
  { idStatus: 5, description: "Reenviado" },
];

function formatDate(value?: string | null) {
  if (!value) return "";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  return `${String(date.getUTCDate()).padStart(2, "0")}/${String(date.getUTCMonth() + 1).padStart(2, "0")}/${date.getUTCFullYear()}`;
}

// Espejo de las clases box-color-* usadas para el estatus de la solicitud.
function statusBadgeClass(status: string) {
  switch (status) {
    case "Autorizado":
      return "bg-[#25B80014] text-[#0B8400]";
    case "Rechazado":
    case "Cancelado":
      return "bg-[#FF3B3014] text-[#FF3B30]";
    case "Reenviado":
      return "bg-[#007AFF14] text-[#007AFF]";
    default:
      // Pendiente
      return "bg-[#12121214] text-slate-700";
  }
}

export default function ApplicationsPage() {
  const router = useRouter();
  const { session } = useAdminGuard();

  const [searchTerm, setSearchTerm] = useState("");
  const [idStatusOrganizer, setIdStatusOrganizer] = useState(4);

  const [applications, setApplications] = useState<OrganizerApplicationItem[]>([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const [searched, setSearched] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    // Espejo de OnInitializedAsync en Applications.razor: arranca filtrando
    // solo solicitudes Pendientes (idStatusOrganizer=4).
    if (session) fetchApplications(1, "", 4);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [session]);

  async function fetchApplications(targetPage: number, name: string, status: number) {
    if (!session) return;

    setLoading(true);
    setError("");

    try {
      const request: RGetOrganizerApplications = {
        page: targetPage - 1,
        searchOrganizerName: name || undefined,
        idStatusOrganizer: status || undefined,
      };

      const response = await postLegacy<GetOrganizerApplicationsR, RGetOrganizerApplications>(
        "GetOrganizer",
        request,
        session.token
      );

      setApplications(response.code ? response.dtoOrganizerLst ?? [] : []);
      setTotalPages(response.code ? response.totalDePaginas ?? 0 : 0);
      setPage(targetPage);
      setSearched(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
      setApplications([]);
      setTotalPages(0);
    } finally {
      setLoading(false);
    }
  }

  function search() {
    fetchApplications(1, searchTerm, idStatusOrganizer);
  }

  function goToPage(targetPage: number) {
    fetchApplications(targetPage, searchTerm, idStatusOrganizer);
  }

  function goToDetails(idOrganizer: number) {
    router.push(`/Admin/ApplicationDetails?idOrganizer=${idOrganizer}`);
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
        <h1 className="mb-6 text-[28px] font-extrabold text-black">Solicitudes de organizador</h1>

        {error ? (
          <div className="mb-6 rounded-lg bg-red-50 px-4 py-3 text-sm font-medium text-red-700">{error}</div>
        ) : null}

        <div className="flex flex-col gap-4 lg:flex-row lg:flex-wrap lg:items-end">
          <div className="flex-1 lg:min-w-[260px]">
            <label htmlFor="searchTerm" className="mb-1 block text-sm font-semibold text-slate-700">
              Buscar por nombre
            </label>
            <input
              id="searchTerm"
              type="text"
              placeholder="Ej. Servicios Pérez"
              value={searchTerm}
              onChange={(event) => setSearchTerm(event.target.value)}
              className="h-[58px] w-full rounded-lg border border-slate-300 bg-white px-4 text-sm text-slate-900"
            />
          </div>

          <div className="flex-1 lg:min-w-[180px]">
            <label htmlFor="statusSelect" className="mb-1 block text-sm font-semibold text-slate-700">
              Estatus
            </label>
            <select
              id="statusSelect"
              value={idStatusOrganizer}
              onChange={(event) => setIdStatusOrganizer(Number(event.target.value))}
              className="h-[58px] w-full rounded-lg border border-slate-300 bg-white px-4 text-sm text-slate-900"
            >
              {STATUS_OPTIONS.map((item) => (
                <option key={item.idStatus} value={item.idStatus}>
                  {item.description}
                </option>
              ))}
            </select>
          </div>

          <div className="pb-0">
            <button
              type="button"
              onClick={search}
              disabled={loading}
              className="h-[58px] rounded-lg bg-[#562BD2] px-6 text-sm font-semibold text-white disabled:cursor-not-allowed disabled:opacity-60"
            >
              Buscar
            </button>
          </div>
        </div>

        {loading ? (
          <div className="mt-6 rounded-lg bg-blue-50 px-4 py-3 text-sm font-medium text-blue-700">Cargando...</div>
        ) : null}

        {searched && !loading && applications.length === 0 ? (
          <div className="mt-10 text-center">
            <p className="mt-5 font-bold text-black">No tienes solicitudes para mostrar</p>
          </div>
        ) : null}

        {applications.length > 0 ? (
          <div className="mt-6 overflow-x-auto">
            <table className="w-full min-w-[900px] border-collapse bg-white">
              <thead>
                <tr className="bg-[#d9dee3]">
                  <th className="px-4 py-4 text-left text-sm font-extrabold text-black">Fecha de solicitud</th>
                  <th className="px-4 py-4 text-left text-sm font-extrabold text-black">Nombre</th>
                  <th className="px-4 py-4 text-left text-sm font-extrabold text-black">Correo</th>
                  <th className="px-4 py-4 text-left text-sm font-extrabold text-black">Teléfono</th>
                  <th className="px-4 py-4 text-left text-sm font-extrabold text-black">Estatus</th>
                  <th className="px-4 py-4 text-center text-sm font-extrabold text-black">Acciones</th>
                </tr>
              </thead>

              <tbody>
                {applications.map((item) => (
                  <tr key={item.idOrganizer} className="border-b border-[#d9dee3]">
                    <td className="px-4 py-5 text-sm text-slate-700">{formatDate(item.createdAt)}</td>
                    <td className="px-4 py-5 text-sm text-slate-700">{item.contactname}</td>
                    <td className="px-4 py-5 text-sm text-slate-700">{item.contactEmail}</td>
                    <td className="px-4 py-5 text-sm text-slate-700">{item.contactPhoneNumber}</td>
                    <td className="px-4 py-5 text-sm">
                      <span className={`inline-flex h-[21px] items-center justify-center rounded px-2 ${statusBadgeClass(item.statusApp)}`}>
                        {item.statusApp}
                      </span>
                    </td>
                    <td className="px-4 py-5 text-center">
                      <button
                        type="button"
                        title="Ver solicitud"
                        onClick={() => goToDetails(item.idOrganizer)}
                        className="inline-flex cursor-pointer items-center justify-center rounded-lg p-1 hover:bg-slate-100"
                      >
                        <img src="/img/iconDetailsTwo.png" width={20} height={20} alt="Ver solicitud" />
                      </button>
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
