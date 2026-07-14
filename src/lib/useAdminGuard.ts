"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { getStoredToken } from "@/lib/apiClient";

export interface AdminSession {
  token: string;
}

// Guard de sesión para las rutas /Admin/* (panel de staff, distinto del
// AdminLayout.razor original): a diferencia de useSessionGuard, no exige
// IdOrganizer — estas páginas no dependen de un organizador específico.
export function useAdminGuard(): { session: AdminSession | null } {
  const router = useRouter();
  const [session, setSession] = useState<AdminSession | null>(null);

  useEffect(() => {
    const token = getStoredToken();
    if (!token) {
      router.replace("/");
      return;
    }

    setSession({ token });
  }, [router]);

  return { session };
}
