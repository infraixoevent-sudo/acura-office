# ACURA Office - Next.js migration

Migración base desde Blazor WebAssembly a Next.js 16 / React 19 / TypeScript, lista para Vercel.

## Scripts

```bash
npm install
npm run dev
npm run build
```

## Variables de entorno

Copia `.env.example` a `.env.local` para desarrollo local.

## Notas

- Las rutas principales del proyecto Blazor fueron migradas a `src/app`.
- Las llamadas hardcodeadas a `https://acura-user.vantis.team` y `https://acura-events.vantis.team` se movieron a API routes internas de Next.
- Los modelos de `Request`, `Response` y `dto` se pasaron a TypeScript en `src/types/acura.ts`.
- Los assets de `wwwroot/img`, `wwwroot/css` y `wwwroot/js` se movieron a `public`.
