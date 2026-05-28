# Migration notes

Este proyecto fue convertido desde `TXMXB12305-ACURA-OFFICE-main` Blazor WebAssembly a Next.js.

## Equivalencias principales

- `Pages/*.razor` → `src/app/<Route>/page.tsx`
- `Pages/Cashier/*.razor` → `src/app/Cashier/<Route>/page.tsx`
- `Request/*.cs`, `Response/*.cs`, `dto/*.cs` → `src/types/acura.ts`
- URLs hardcodeadas de Blazor → `src/app/api/<Endpoint>/route.ts` + `src/lib/legacyProxy.ts`
- `wwwroot/img` → `public/img`
- `wwwroot/css` → `public/css`
- `wwwroot/js` → `public/js`

## Pendiente normal de una migración visual

La estructura ya está en Next/Vercel. Para dejarlo 1:1 visual, el siguiente paso es reemplazar cada formulario genérico por su UI final exacta, pantalla por pantalla, usando los componentes React ya creados.
