"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Swal from "sweetalert2";
import { AppShell } from "@/components/AppShell";
import { getStoredToken, postLegacy } from "@/lib/apiClient";
import type {
  UserRoles,
  Roles,
  UserRolesRR,
  RolesR,
  GenericRR,
  GetUserbyEmailRR,
} from "@/types/acura";

type Tab = "users" | "roles";
type ModalMode = "add" | "edit";

function getOrganizerId(): number {
  return parseInt(localStorage.getItem("IdOrganizer") ?? "0", 10);
}

function formatDate(dateStr: string): string {
  try {
    const d = new Date(dateStr);
    return d.toLocaleDateString("es-MX", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
  } catch {
    return dateStr ?? "";
  }
}

function isValidEmail(email: string): boolean {
  return /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]+$/.test(email);
}

function UserPlusIcon() {
  return (
    <svg width="17" height="17" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
      <circle cx="9" cy="7" r="4" stroke="currentColor" strokeWidth="1.8" />
      <line x1="19" y1="8" x2="19" y2="14" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
      <line x1="22" y1="11" x2="16" y2="11" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
    </svg>
  );
}

function PlusIcon() {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <line x1="12" y1="5" x2="12" y2="19" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      <line x1="5" y1="12" x2="19" y2="12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}

function EditIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function TrashIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <polyline points="3 6 5 6 21 6" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M19 6l-1 14H6L5 6" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M10 11v6M14 11v6" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
      <path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

const inputClass =
  "w-full rounded-xl border border-slate-300 bg-white px-3 py-2.5 text-sm text-slate-900 outline-none transition focus:border-[#6b35f5] focus:ring-2 focus:ring-[#6b35f5]/10";

const inputDisabledClass =
  "w-full rounded-xl border border-slate-200 bg-slate-100 px-3 py-2.5 text-sm text-slate-500 outline-none cursor-not-allowed";

export default function UsersPage() {
  const [activeTab, setActiveTab] = useState<Tab>("users");
  const [userRoles, setUserRoles] = useState<UserRoles[]>([]);
  const [roles, setRoles] = useState<Roles[]>([]);
  const [hasUsers, setHasUsers] = useState(false);
  const [loading, setLoading] = useState(true);
  const [pageError, setPageError] = useState("");

  const [modalOpen, setModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<ModalMode>("add");
  const [modalLoading, setModalLoading] = useState(false);
  const [editUserId, setEditUserId] = useState<number | null>(null);
  const [formEmail, setFormEmail] = useState("");
  const [formName, setFormName] = useState("");
  const [formRoleId, setFormRoleId] = useState<number | "">("");
  const [emailError, setEmailError] = useState("");
  const [nameError, setNameError] = useState("");
  const [roleError, setRoleError] = useState("");
  const [emailLookupLoading, setEmailLookupLoading] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    setLoading(true);
    setPageError("");

    const token = getStoredToken();
    const idOrganizer = getOrganizerId();

    try {
      const [rolesRes, usersRes] = await Promise.all([
        postLegacy<RolesR>("GetRoles", {}, token),
        postLegacy<UserRolesRR>("GetRolesByAdmin", { idOrganizer, page: 0 }, token),
      ]);

      setRoles(rolesRes.Roles ?? []);
      setUserRoles(usersRes.resp?.usersRoles ?? []);
      setHasUsers(usersRes.resp?.code ?? false);
    } catch (err) {
      setPageError(err instanceof Error ? err.message : String(err));
    } finally {
      setLoading(false);
    }
  }

  function openAddModal() {
    setModalMode("add");
    setFormEmail("");
    setFormName("");
    setFormRoleId("");
    setEmailError("");
    setNameError("");
    setRoleError("");
    setEditUserId(null);
    setModalOpen(true);
  }

  function openEditModal(user: UserRoles) {
    const matched = roles.find((r) => r.Description === user.roleDescription);
    setModalMode("edit");
    setFormEmail(user.email ?? "");
    setFormName(user.name ?? "");
    setFormRoleId(matched?.IdRole ?? "");
    setEmailError("");
    setNameError("");
    setRoleError("");
    setEditUserId(user.idUser);
    setModalOpen(true);
  }

  async function handleEmailBlur() {
    if (modalMode !== "add") return;
    if (!formEmail || !isValidEmail(formEmail)) return;

    setEmailLookupLoading(true);
    setFormName("");
    setEmailError("");

    const token = getStoredToken();
    try {
      const res = await postLegacy<GetUserbyEmailRR>(
        "GetUserbyEmail",
        { Email: formEmail },
        token
      );
      if (res.resp?.code) {
        const name = res.resp.UserName ?? "";
        setFormName(name);
      } else {
        setEmailError("Este correo no ha sido registrado previamente");
        setFormName("");
      }
    } catch {
      setEmailError("No se pudo verificar el correo");
    } finally {
      setEmailLookupLoading(false);
    }
  }

  function validateForm(): boolean {
    let valid = true;

    if (!formEmail) {
      setEmailError("El correo electrónico es requerido");
      valid = false;
    } else if (!isValidEmail(formEmail)) {
      setEmailError("Dirección de correo no válida");
      valid = false;
    } else {
      setEmailError("");
    }

    if (!formName.trim()) {
      setNameError("El nombre es requerido");
      valid = false;
    } else {
      setNameError("");
    }

    if (formRoleId === "") {
      setRoleError("El rol es requerido");
      valid = false;
    } else {
      setRoleError("");
    }

    return valid;
  }

  async function handleAddUser() {
    if (!validateForm()) return;

    setModalLoading(true);
    const token = getStoredToken();
    const idOrganizer = getOrganizerId();

    try {
      const emailCheck = await postLegacy<GetUserbyEmailRR>(
        "GetUserbyEmail",
        { Email: formEmail },
        token
      );

      if (!emailCheck.resp?.code) {
        setEmailError("Este correo no ha sido registrado previamente");
        return;
      }

      const idUser = emailCheck.resp.IdUser ?? 0;

      const result = await postLegacy<GenericRR>(
        "CreateRole",
        {
          IdOrganizer: idOrganizer,
          IdUser: idUser,
          IdRole: formRoleId,
          Email: formEmail,
          Name: formName,
        },
        token
      );

      setModalOpen(false);

      if (result.resp?.code) {
        await Swal.fire({
          title: "Exitoso",
          text: result.resp.message ?? "Colaborador invitado exitosamente",
          icon: "success",
          confirmButtonText: "Aceptar",
        });
        await loadData();
      } else {
        await Swal.fire({
          title: "Error",
          text: result.resp?.message ?? "Error al invitar colaborador",
          icon: "error",
          confirmButtonText: "Aceptar",
        });
      }
    } catch (err) {
      setModalOpen(false);
      await Swal.fire({
        title: "Error",
        text: err instanceof Error ? err.message : String(err),
        icon: "error",
        confirmButtonText: "Aceptar",
      });
    } finally {
      setModalLoading(false);
    }
  }

  async function handleEditUser() {
    if (!validateForm() || editUserId === null) return;

    setModalLoading(true);
    const token = getStoredToken();
    const idOrganizer = getOrganizerId();

    try {
      const result = await postLegacy<GenericRR>(
        "EditRole",
        {
          IdOrganizer: idOrganizer,
          IdUser: editUserId,
          IdRole: formRoleId,
          Email: formEmail,
          Name: formName,
        },
        token
      );

      setModalOpen(false);

      if (result.resp?.code) {
        await Swal.fire({
          title: "Exitoso",
          text: result.resp.message ?? "Cambios guardados exitosamente",
          icon: "success",
          confirmButtonText: "Aceptar",
        });
        await loadData();
      } else {
        await Swal.fire({
          title: "Error",
          text: result.resp?.message ?? "Error al guardar cambios",
          icon: "error",
          confirmButtonText: "Aceptar",
        });
      }
    } catch (err) {
      setModalOpen(false);
      await Swal.fire({
        title: "Error",
        text: err instanceof Error ? err.message : String(err),
        icon: "error",
        confirmButtonText: "Aceptar",
      });
    } finally {
      setModalLoading(false);
    }
  }

  async function handleDeleteUser(user: UserRoles) {
    const confirmed = await Swal.fire({
      title: "",
      html: `¿Estás seguro de eliminar al siguiente <br /> colaborador del proyecto?<br /><strong>${user.name}</strong>`,
      imageUrl: "/img/trash user.png",
      imageWidth: 150,
      imageAlt: "Eliminar colaborador",
      showCancelButton: true,
      cancelButtonText: "Cancelar",
      confirmButtonText: "Confirmar",
      customClass: {
        confirmButton: "swalCancelButtonPayment",
        cancelButton: "swalCloseButtonPayment",
        actions: "swalActionsDeny",
        htmlContainer: "titleCancelUserswal",
        image: "imageUser",
      },
      buttonsStyling: true,
    });

    if (!confirmed.isConfirmed) return;

    const token = getStoredToken();
    const idOrganizer = getOrganizerId();

    try {
      const result = await postLegacy<GenericRR>(
        "DeleteRole",
        { IdOrganizer: idOrganizer, IdUser: user.idUser },
        token
      );

      if (result.resp?.code) {
        await Swal.fire({
          title: "Exitoso",
          text: result.resp.message ?? "Colaborador eliminado exitosamente",
          icon: "success",
          confirmButtonText: "Aceptar",
        });
        await loadData();
      } else {
        await Swal.fire({
          title: "Error",
          text: result.resp?.message ?? "Error al eliminar colaborador",
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
    }
  }

  return (
    <AppShell>
      <div className="flex flex-col gap-6">

        {/* Encabezado */}
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold text-[#27243a]">Consulta de Usuarios</h2>
          <button
            type="button"
            onClick={openAddModal}
            className="flex items-center gap-2 rounded-full bg-[#6b35f5] px-5 py-2.5 text-sm font-bold text-white transition hover:bg-[#5b2ce6]"
          >
            <UserPlusIcon />
            Invitar colaboradores
          </button>
        </div>

        {/* Error de carga */}
        {pageError && (
          <pre className="rounded-xl bg-red-50 p-4 text-sm text-red-700 whitespace-pre-wrap">
            {pageError}
          </pre>
        )}

        {/* Tabs */}
        <section className="rounded-2xl bg-white shadow-[0_12px_28px_rgba(15,23,42,0.08)]">

          {/* Navegación de pestañas */}
          <div className="flex border-b border-slate-200">
            <button
              type="button"
              onClick={() => setActiveTab("users")}
              className={`flex-1 py-4 text-sm font-semibold transition ${
                activeTab === "users"
                  ? "border-b-2 border-[#6b35f5] text-[#6b35f5]"
                  : "text-slate-500 hover:text-slate-700"
              }`}
            >
              Consultar usuarios
            </button>
            <button
              type="button"
              onClick={() => setActiveTab("roles")}
              className={`flex-1 py-4 text-sm font-semibold transition ${
                activeTab === "roles"
                  ? "border-b-2 border-[#6b35f5] text-[#6b35f5]"
                  : "text-slate-500 hover:text-slate-700"
              }`}
            >
              Consultar roles
            </button>
          </div>

          {/* Contenido de las pestañas */}
          <div className="p-6">
            {loading ? (
              <p className="py-10 text-center text-sm text-slate-400">Cargando...</p>
            ) : activeTab === "users" ? (
              hasUsers ? (
                <div className="overflow-x-auto">
                  <table className="w-full border-collapse">
                    <thead>
                      <tr>
                        {[
                          "Nombre de usuario",
                          "Correo electrónico",
                          "Rol",
                          "Fecha de asignación",
                          "Acciones",
                        ].map((col) => (
                          <th
                            key={col}
                            className="border-b border-slate-200 bg-slate-50 px-4 py-3 text-left text-sm font-semibold text-slate-700"
                          >
                            {col}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {userRoles.map((user) => (
                        <tr key={user.idUser}>
                          <td className="border-b border-slate-100 px-4 py-3 text-sm text-slate-700">
                            {user.name}
                          </td>
                          <td className="border-b border-slate-100 px-4 py-3 text-sm text-slate-700">
                            {user.email}
                          </td>
                          <td className="border-b border-slate-100 px-4 py-3 text-sm text-slate-700">
                            {user.roleDescription}
                          </td>
                          <td className="border-b border-slate-100 px-4 py-3 text-sm text-slate-700">
                            {formatDate(user.roleDate)}
                          </td>
                          <td className="border-b border-slate-100 px-4 py-3">
                            <div className="flex items-center gap-1">
                              <button
                                type="button"
                                onClick={() => openEditModal(user)}
                                title="Editar usuario"
                                className="rounded-lg p-1.5 text-slate-500 transition hover:bg-slate-100 hover:text-[#6b35f5]"
                              >
                                <EditIcon />
                              </button>
                              <button
                                type="button"
                                onClick={() => handleDeleteUser(user)}
                                title="Eliminar colaborador"
                                className="rounded-lg p-1.5 text-slate-500 transition hover:bg-red-50 hover:text-red-600"
                              >
                                <TrashIcon />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                /* Estado vacío */
                <div className="flex flex-col items-center py-14 text-center">
                  <img
                    src="/img/user-plus.png"
                    alt=""
                    aria-hidden="true"
                    className="mb-6 w-20 opacity-60"
                  />
                  <p className="mb-2 text-lg font-bold text-slate-800">
                    Agrega personas a tu equipo
                  </p>
                  <p className="mb-6 max-w-xs text-sm leading-relaxed text-slate-500">
                    <Link
                      href="/Role"
                      className="font-semibold text-[#6b35f5] hover:underline"
                    >
                      Crea roles
                    </Link>{" "}
                    personalizados y asigna responsabilidades, o invita a usuarios
                    a un rol de acceso total.
                  </p>
                  <button
                    type="button"
                    onClick={openAddModal}
                    className="flex items-center gap-2 rounded-full bg-[#6b35f5] px-5 py-2.5 text-sm font-bold text-white transition hover:bg-[#5b2ce6]"
                  >
                    <UserPlusIcon />
                    Invitar colaboradores
                  </button>
                </div>
              )
            ) : (
              /* Pestaña de roles — solo lectura */
              <div>
                <div className="mb-4 flex items-center justify-between">
                  <span className="text-sm text-slate-500">
                    {roles.length} rol{roles.length !== 1 ? "es" : ""} disponible{roles.length !== 1 ? "s" : ""}
                  </span>
                  <Link
                    href="/Role"
                    className="flex items-center gap-1.5 rounded-full border border-slate-300 bg-white px-4 py-2 text-sm font-bold text-slate-900 transition hover:bg-slate-50"
                  >
                    <PlusIcon />
                    Agregar Rol
                  </Link>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full border-collapse">
                    <thead>
                      <tr>
                        <th className="border-b border-slate-200 bg-slate-50 px-4 py-3 text-left text-sm font-semibold text-slate-700">
                          Rol
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {roles.map((role) => (
                        <tr key={role.IdRole}>
                          <td className="border-b border-slate-100 px-4 py-3 text-sm text-slate-700">
                            {role.Description}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        </section>
      </div>

      {/* Modal Agregar / Editar usuario */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl">

            <div className="mb-4 flex items-center justify-between">
              <h3 className="text-lg font-bold text-slate-900">
                {modalMode === "add" ? "Agregar Usuario" : "Editar Usuario"}
              </h3>
              <button
                type="button"
                onClick={() => setModalOpen(false)}
                aria-label="Cerrar"
                className="text-2xl leading-none text-slate-400 transition hover:text-slate-700"
              >
                ×
              </button>
            </div>

            {modalMode === "add" && (
              <p className="mb-5 text-sm leading-relaxed text-slate-500">
                Ingresa los correos electrónicos de los usuarios y elige sus roles en tu equipo,
                estos deberán estar previamente registrados en la aplicación.
              </p>
            )}

            <div className="flex flex-col gap-4">

              {/* Correo electrónico */}
              <div>
                <label
                  htmlFor="modal-email"
                  className="mb-1.5 block text-sm font-semibold text-slate-700"
                >
                  <span className="text-red-500">*</span> Correo electrónico
                </label>
                <input
                  id="modal-email"
                  type="email"
                  value={formEmail}
                  onChange={(e) => {
                    setFormEmail(e.target.value);
                    setFormName("");
                    setEmailError("");
                  }}
                  onBlur={handleEmailBlur}
                  disabled={modalMode === "edit"}
                  placeholder="correo@ejemplo.com"
                  className={modalMode === "edit" ? inputDisabledClass : inputClass}
                />
                {emailLookupLoading && (
                  <p className="mt-1 text-xs text-slate-400">Buscando usuario...</p>
                )}
                {emailError && (
                  <p className="mt-1 text-xs text-red-600">{emailError}</p>
                )}
              </div>

              {/* Nombre Completo */}
              <div>
                <label
                  htmlFor="modal-name"
                  className="mb-1.5 block text-sm font-semibold text-slate-700"
                >
                  <span className="text-red-500">*</span> Nombre Completo
                </label>
                <input
                  id="modal-name"
                  type="text"
                  value={formName}
                  readOnly
                  disabled
                  maxLength={30}
                  placeholder={
                    modalMode === "add"
                      ? "Se obtiene al ingresar el correo"
                      : "Nombre completo"
                  }
                  className={inputDisabledClass}
                />
                {nameError && (
                  <p className="mt-1 text-xs text-red-600">{nameError}</p>
                )}
              </div>

              {/* Rol */}
              <div>
                <label
                  htmlFor="modal-role"
                  className="mb-1.5 block text-sm font-semibold text-slate-700"
                >
                  <span className="text-red-500">*</span> Selecciona un rol
                </label>
                <select
                  id="modal-role"
                  value={formRoleId}
                  onChange={(e) =>
                    setFormRoleId(e.target.value === "" ? "" : Number(e.target.value))
                  }
                  className={inputClass}
                >
                  <option value="">Selecciona una opción</option>
                  {roles.map((role) => (
                    <option key={role.IdRole} value={role.IdRole}>
                      {role.Description}
                    </option>
                  ))}
                </select>
                {roleError && (
                  <p className="mt-1 text-xs text-red-600">{roleError}</p>
                )}
              </div>
            </div>

            <button
              type="button"
              onClick={modalMode === "add" ? handleAddUser : handleEditUser}
              disabled={modalLoading || emailLookupLoading}
              className="mt-6 w-full rounded-full bg-[#6b35f5] py-2.5 text-sm font-bold text-white transition hover:bg-[#5b2ce6] disabled:cursor-not-allowed disabled:opacity-60"
            >
              {modalLoading
                ? "Procesando..."
                : modalMode === "add"
                ? "Enviar invitación"
                : "Guardar cambios"}
            </button>
          </div>
        </div>
      )}
    </AppShell>
  );
}
