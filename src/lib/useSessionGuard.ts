"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { getStoredToken } from "@/lib/apiClient";

export interface OrganizerSession {
  token: string;
  idOrganizer: number;
}

// Guard de sesión obligatorio en rutas re-migradas (docs/frontend-standards.md
// / "Guard de sesión por ruta"): sin token redirige a "/"; sin IdOrganizer > 0
// muestra un mensaje claro en español en vez de dejar pasar el error crudo de
// la API (así llegó "IdOrganizer es requerido" a /ReportsByEvent).
export function useSessionGuard(): { session: OrganizerSession | null; error: string } {
  const router = useRouter();
  const [session, setSession] = useState<OrganizerSession | null>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    const token = getStoredToken();
    if (!token) {
      router.replace("/");
      return;
    }

    const idOrganizer = parseInt(localStorage.getItem("IdOrganizer") ?? "0", 10);
    if (!idOrganizer || idOrganizer <= 0) {
      setError(
        "No se encontró un organizador asociado a tu sesión. Vuelve a iniciar sesión."
      );
      return;
    }

    setSession({ token, idOrganizer });
  }, [router]);

  return { session, error };
}
