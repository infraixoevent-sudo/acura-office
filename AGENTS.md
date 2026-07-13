# ACURA-OFFICE — Guía para agentes

Panel de administración (Next.js App Router) del ecosistema ACURA, en re-migración desde el office Blazor (`TXMXB12305-ACURA-OFFICE`). Hoy solo `/Users` y `/ReportsByEvent` funcionan correctamente; el resto de las rutas se re-migran una por una.

## Documentos rectores (leer antes de tocar código)

- **Estándar del front:** @docs/frontend-standards.md — arquitectura, patrones de página, contratos wire (camelCase final en rutas re-migradas), guard de sesión, checklist del ciclo de re-migración de ruta.
- **Plan de rutas:** @docs/plan-migracion-rutas-office.md — las rutas pendientes mapeadas contra el Blazor con sus endpoints y el orden recomendado.
- El backend se rige por `docs/backend-standards.md` de cada repo API (protocolo de re-migración R1-R7); cada ruta del front se migra **en el mismo ciclo** que sus endpoints.

## Reglas rápidas

- Toda llamada a API vía `postLegacy` tipado (`src/lib/apiClient.ts`) + registro en `src/lib/endpoints.ts`. No crear proxies nuevos (`legacyProxy` es transitorio).
- Rutas re-migradas: tipos y lecturas en **camelCase final**; nada de tolerar ambas capitalizaciones en código nuevo.
- Página de referencia: `/ReportsByEvent`. Sesión solo vía helpers de `apiClient`.
- Puertas antes de PR: `npx tsc --noEmit` sin errores + pasada manual del flujo en el preview de Vercel, anotada en el PR.
- Ramas por ruta/flujo → PR a `develop` → aprobación → merge → borrar ramas. Commits en español, imperativo.
