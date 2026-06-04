import { legacyEndpoints, type LegacyEndpoint } from "@/lib/endpoints";

function getBaseUrl(endpoint: LegacyEndpoint) {
  const service = legacyEndpoints[endpoint];

  const value =
    service === "user"
      ? process.env.NEXT_PUBLIC_ACURA_USERS_API_URL
      : process.env.NEXT_PUBLIC_ACURA_EVENTS_API_URL;

  if (!value) {
    throw new Error(
      service === "user"
        ? "Missing NEXT_PUBLIC_ACURA_USERS_API_URL"
        : "Missing NEXT_PUBLIC_ACURA_EVENTS_API_URL"
    );
  }

  return value.replace(/\/$/, "");
}

export async function postLegacy<TResponse = unknown, TRequest = unknown>(
  endpoint: LegacyEndpoint,
  body?: TRequest,
  token?: string | null
): Promise<TResponse> {
  const response = await fetch(`${getBaseUrl(endpoint)}/api/${endpoint}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: body === undefined ? undefined : JSON.stringify(body),
  });

  const data = await response.json().catch(() => null);

  if (!response.ok) {
    throw new Error((data as any)?.message || "Request failed");
  }

  return data as TResponse;
}

export function getStoredToken() {
  if (typeof window === "undefined") return null;

  return (
    localStorage.getItem("Id_Session") ||
    localStorage.getItem("token") ||
    localStorage.getItem("tkn")
  );
}

export function setSessionValues(data: any) {
  if (typeof window === "undefined" || !data) return;

  const token = data.tkn || data.token || data.Token;
  const idUser = data.idUser ?? data.IdUser;
  const idOrganizer = data.idOrganizer ?? data.IdOrganizer;
  const name = data.name ?? data.Name;
  const email = data.email ?? data.Email;
  const nameRol = data.NameRol ?? data.nameRol;
  const userMenu = data.userMenu ?? data.UserMenu;

  if (token) {
    localStorage.setItem("Id_Session", String(token));
    localStorage.setItem("token", String(token));
    localStorage.setItem("tkn", String(token));
  }

  if (idUser !== undefined && idUser !== null) {
    localStorage.setItem("IdUser", String(idUser));
  }

  if (idOrganizer !== undefined && idOrganizer !== null) {
    localStorage.setItem("IdOrganizer", String(idOrganizer));
  }

  if (name) {
    localStorage.setItem("Name", String(name));
  }

  if (email) {
    localStorage.setItem("Email", String(email));
  }

  if (nameRol) {
    localStorage.setItem("NameRol", String(nameRol));
  }

  if (userMenu) {
    localStorage.setItem("userMenu", JSON.stringify(userMenu));
  }
}