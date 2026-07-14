"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { AdminShell } from "@/components/AdminShell";
import { Pagination } from "@/components/Pagination";
import { postLegacy } from "@/lib/apiClient";
import { useAdminGuard } from "@/lib/useAdminGuard";
import type { GetOrganizersInfoFilteredR, OrganizerGeneralInfo, RGetOrganizersInfoFiltered } from "@/types/acura";

const EMAIL_PATTERN = /^[a-zA-Z0-9_.+-]+@[a-zA-Z0-9-]+\.[a-zA-Z0-9-.]+$/;

// Espejo de _states en ListOfOrganizers.razor: catálogo hardcodeado en el
// Blazor (sin llamada a ningún endpoint de catálogo).
const STATES = [
  { idState: 0, name: "Todos" },
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

// Espejo de _statusOrganizers: 2 = "Todos" (sin filtro), 1 = Activo, 0 = Baja.
const ORGANIZER_STATUSES = [
  { idOrganizerStatus: 2, name: "Todos" },
  { idOrganizerStatus: 1, name: "Activo" },
  { idOrganizerStatus: 0, name: "Baja" },
];

function formatDate(value?: string | null) {
  if (!value) return "";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  return `${String(date.getUTCDate()).padStart(2, "0")}/${String(date.getUTCMonth() + 1).padStart(2, "0")}/${date.getUTCFullYear()}`;
}

export default function Page() {
  const { session } = useAdminGuard();

  const [organizerName, setOrganizerName] = useState("");
  const [email, setEmail] = useState("");
  const [emailError, setEmailError] = useState("");
  const [idState, setIdState] = useState(0);
  const [idOrganizerStatus, setIdOrganizerStatus] = useState(2);

  const [organizers, setOrganizers] = useState<OrganizerGeneralInfo[]>([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const [searched, setSearched] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const [openRowId, setOpenRowId] = useState<number | null>(null);

  useEffect(() => {
    if (session) fetchOrganizers(1, {});
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [session]);

  async function fetchOrganizers(
    targetPage: number,
    filters: {
      organizerName?: string;
      email?: string;
      idState?: number;
      idOrganizerStatus?: number;
    }
  ) {
    if (!session) return;

    setLoading(true);
    setError("");

    try {
      const response = await postLegacy<GetOrganizersInfoFilteredR, RGetOrganizersInfoFiltered>(
        "GetOrganizersInfoFiltered",
        {
          organizerName: filters.organizerName || undefined,
          email: filters.email || undefined,
          idState: filters.idState || undefined,
          idOrganizerStatus: filters.idOrganizerStatus === 2 ? undefined : filters.idOrganizerStatus,
          page: targetPage - 1,
        },
        session.token
      );

      setOrganizers(response.code ? response.organizers ?? [] : []);
      setTotalPages(response.code ? response.totalPages ?? 0 : 0);
      setPage(targetPage);
      setSearched(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
      setOrganizers([]);
      setTotalPages(0);
    } finally {
      setLoading(false);
    }
  }

  function search() {
    if (email && !EMAIL_PATTERN.test(email)) {
      setEmailError("Correo electrónico inválido");
      return;
    }
    setEmailError("");
    fetchOrganizers(1, { organizerName, email, idState, idOrganizerStatus });
  }

  function clearFilters() {
    setOrganizerName("");
    setEmail("");
    setEmailError("");
    setIdState(0);
    setIdOrganizerStatus(2);
    fetchOrganizers(1, {});
  }

  function goToPage(targetPage: number) {
    fetchOrganizers(targetPage, { organizerName, email, idState, idOrganizerStatus });
  }

  function toggleActions(idOrganizer: number) {
    setOpenRowId((current) => (current === idOrganizer ? null : idOrganizer));
    localStorage.setItem("idOrganizer-ListOrganizer", String(idOrganizer));
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
        <h1 className="mb-6 text-[28px] font-extrabold text-black">Listado de organizadores</h1>

        {error ? (
          <div className="mb-6 rounded-lg bg-red-50 px-4 py-3 text-sm font-medium text-red-700">{error}</div>
        ) : null}

        <div className="flex flex-col gap-4 lg:flex-row lg:flex-wrap">
          <div className="flex-1 lg:min-w-[220px]">
            <label htmlFor="organizerName" className="mb-1 block text-sm font-semibold text-slate-700">
              Nombre del Organizador
            </label>
            <input
              id="organizerName"
              type="text"
              placeholder="Ej.Servicios Pérez"
              value={organizerName}
              onChange={(event) => setOrganizerName(event.target.value)}
              className="h-[58px] w-full rounded-lg border border-slate-300 bg-white px-4 text-sm text-slate-900"
            />
          </div>

          <div className="flex-1 lg:min-w-[220px]">
            <label htmlFor="email" className="mb-1 block text-sm font-semibold text-slate-700">
              Correo electrónico
            </label>
            <input
              id="email"
              type="text"
              placeholder="Correo electrónico"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              className="h-[58px] w-full rounded-lg border border-slate-300 bg-white px-4 text-sm text-slate-900"
            />
            {emailError ? <p className="mt-1 text-sm text-red-600">{emailError}</p> : null}
          </div>

          <div className="flex-1 lg:min-w-[200px]">
            <label htmlFor="stateSelect" className="mb-1 block text-sm font-semibold text-slate-700">
              Selecciona Estado
            </label>
            <select
              id="stateSelect"
              value={idState}
              onChange={(event) => setIdState(Number(event.target.value))}
              className="h-[58px] w-full rounded-lg border border-slate-300 bg-white px-4 text-sm text-slate-900"
            >
              {STATES.map((item) => (
                <option key={item.idState} value={item.idState}>
                  {item.name}
                </option>
              ))}
            </select>
          </div>

          <div className="flex-1 lg:min-w-[200px]">
            <label htmlFor="statusSelect" className="mb-1 block text-sm font-semibold text-slate-700">
              Estatus organizador
            </label>
            <select
              id="statusSelect"
              value={idOrganizerStatus}
              onChange={(event) => setIdOrganizerStatus(Number(event.target.value))}
              className="h-[58px] w-full rounded-lg border border-slate-300 bg-white px-4 text-sm text-slate-900"
            >
              {ORGANIZER_STATUSES.map((item) => (
                <option key={item.idOrganizerStatus} value={item.idOrganizerStatus}>
                  {item.name}
                </option>
              ))}
            </select>
          </div>

          <div className="flex items-end gap-2">
            <button
              type="button"
              onClick={clearFilters}
              className="h-[58px] rounded-lg border-2 border-black px-6 text-sm font-semibold text-black"
            >
              Limpiar
            </button>
            <button
              type="button"
              onClick={search}
              disabled={loading}
              className="h-[58px] rounded-lg bg-[#562BD2] px-6 text-sm font-semibold text-white disabled:cursor-not-allowed disabled:opacity-60"
            >
              Filtrar
            </button>
          </div>
        </div>

        {loading ? (
          <div className="mt-6 rounded-lg bg-blue-50 px-4 py-3 text-sm font-medium text-blue-700">Cargando...</div>
        ) : null}

        {searched && !loading && organizers.length === 0 ? (
          <div className="mt-10 text-center">
            <p className="mt-5 font-bold text-black">No se encontraron eventos.</p>
          </div>
        ) : null}

        {organizers.length > 0 ? (
          <div className="mt-6 overflow-x-auto">
            <table className="w-full min-w-[1000px] border-collapse bg-white">
              <thead>
                <tr className="bg-[#d9dee3]">
                  <th className="px-4 py-4 text-left text-sm font-extrabold text-black">Nombre del Organizador</th>
                  <th className="px-4 py-4 text-left text-sm font-extrabold text-black">Correo electrónico</th>
                  <th className="px-4 py-4 text-left text-sm font-extrabold text-black">Teléfono</th>
                  <th className="px-4 py-4 text-left text-sm font-extrabold text-black">Estado</th>
                  <th className="px-4 py-4 text-left text-sm font-extrabold text-black">Fecha de Aprobación</th>
                  <th className="px-4 py-4 text-left text-sm font-extrabold text-black">Estatus organizador</th>
                  <th className="px-4 py-4 text-center text-sm font-extrabold text-black">Eventos creados</th>
                  <th className="px-4 py-4 text-center text-sm font-extrabold text-black">Eventos activos</th>
                  <th className="px-4 py-4 text-center text-sm font-extrabold text-black">Acciones</th>
                </tr>
              </thead>

              <tbody>
                {organizers.map((organizer) => (
                  <tr key={organizer.idOrganizer} className="border-b border-[#d9dee3]">
                    <td className="px-4 py-5 text-sm text-slate-700">{organizer.name}</td>
                    <td className="px-4 py-5 text-sm text-slate-700">{organizer.email}</td>
                    <td className="px-4 py-5 text-sm text-slate-700">{organizer.phoneNumber}</td>
                    <td className="px-4 py-5 text-sm text-slate-700">{organizer.state}</td>
                    <td className="px-4 py-5 text-sm text-slate-700">{formatDate(organizer.approvedAt)}</td>
                    <td className="px-4 py-5 text-sm">
                      {organizer.idStatus === 1 ? (
                        <span className="inline-flex h-[21px] w-[57px] items-center justify-center rounded bg-[#25B80014] text-[#0B8400]">
                          Activo
                        </span>
                      ) : (
                        <span className="inline-flex h-[21px] w-[48px] items-center justify-center rounded bg-[#12121214] text-slate-700">
                          Baja
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-5 text-center text-sm text-slate-700">{organizer.eventsCreated}</td>
                    <td className="px-4 py-5 text-center text-sm text-slate-700">{organizer.activeEvents}</td>
                    <td className="relative px-4 py-5 text-center">
                      <button
                        type="button"
                        title="Consultar Evento"
                        onClick={() => toggleActions(organizer.idOrganizer)}
                        className="inline-flex cursor-pointer items-center justify-center rounded-lg p-1 hover:bg-slate-100"
                      >
                        <img src="/img/iconCalculator.png" width={20} height={20} alt="Consultar Evento" />
                      </button>

                      {openRowId === organizer.idOrganizer ? (
                        <div className="absolute right-4 top-14 z-10 w-[150px] rounded-lg bg-white p-2 text-left shadow-[0_2px_8px_rgba(0,0,0,0.3)]">
                          <Link
                            href="/Admin/List-of-commissions"
                            className="block text-sm text-[#302a45] hover:text-[#6b35f5]"
                          >
                            Ir a Comisiones
                          </Link>
                        </div>
                      ) : null}
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
