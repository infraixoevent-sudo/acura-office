import type { LegacyEndpoint } from "@/lib/endpoints";

export async function postLegacy<TResponse = unknown, TRequest = unknown>(
  endpoint: LegacyEndpoint,
  body?: TRequest,
  token?: string | null,
): Promise<TResponse> {
  const response = await fetch(`/api/${endpoint}`, {
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
  return localStorage.getItem("Id_Session") || localStorage.getItem("token") || localStorage.getItem("tkn");
}

export function setSessionValues(data: any) {
  if (typeof window === "undefined" || !data) return;
  const token = data.tkn || data.token || data.Token;
  if (token) {
    localStorage.setItem("Id_Session", token);
    localStorage.setItem("token", token);
    localStorage.setItem("tkn", token);
  }
  if (data.idUser) localStorage.setItem("IdUser", String(data.idUser));
  if (data.IdOrganizer) localStorage.setItem("IdOrganizer", String(data.IdOrganizer));
  if (data.name) localStorage.setItem("Name", String(data.name));
  if (data.userMenu) localStorage.setItem("userMenu", JSON.stringify(data.userMenu));
}
