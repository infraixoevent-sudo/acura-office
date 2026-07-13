---
description: Estándares de desarrollo frontend, mejores prácticas y convenciones para la aplicación acura-office (Next.js App Router) incluyendo patrones de componentes, gestión de estado, capa de proxy hacia servicios legacy, directrices de UI/UX con Tailwind CSS y estrategia de migración desde Blazor
globs: ["src/**/*.{ts,tsx}", "src/app/api/**/route.ts", "tsconfig.json", "next.config.ts", "postcss.config.mjs", "package.json"]
alwaysApply: true
---

# Configuración y Mejores Prácticas del Proyecto Frontend acura-office

> **Documento canónico del front** (v2, 2026-07-12). Maestro en `C:\wrkia\frontend-standards-office.md`; sustituye a `frontend-standards.md` (ahora un apuntador). La re-migración de rutas sigue el plan de `C:\wrkia\plan-migracion-rutas-office.md` y va en el mismo ciclo que la re-migración de sus endpoints (protocolo R1-R7 de `backend-standards.md`).

## Tabla de Contenidos

- [Descripción General](#descripción-general)
- [Stack Tecnológico](#stack-tecnológico)
  - [Tecnologías Principales](#tecnologías-principales)
  - [Framework de UI](#framework-de-ui)
  - [Gestión de Estado y Flujo de Datos](#gestión-de-estado-y-flujo-de-datos)
  - [Documentación de API](#documentación-de-api)
  - [Herramientas de Desarrollo](#herramientas-de-desarrollo)
- [Estructura del Proyecto](#estructura-del-proyecto)
- [Terminología del Dominio](#terminología-del-dominio)
- [Estándares de Codificación](#estándares-de-codificación)
  - [Idioma y Convenciones de Nomenclatura](#idioma-y-convenciones-de-nomenclatura)
  - [Convenciones de Componentes](#convenciones-de-componentes)
  - [Gestión de Estado](#gestión-de-estado)
  - [Gestión de Sesión](#gestión-de-sesión)
  - [Arquitectura de la Capa de Servicios](#arquitectura-de-la-capa-de-servicios)
  - [Tipos del Dominio (Contratos Legacy)](#tipos-del-dominio-contratos-legacy)
- [Estándares de UI/UX](#estándares-de-uiux)
  - [Integración de Tailwind CSS](#integración-de-tailwind-css)
  - [Manejo de Formularios](#manejo-de-formularios)
  - [Patrones de Navegación](#patrones-de-navegación)
  - [Accesibilidad](#accesibilidad)
- [Estándares de Verificación y Pruebas](#estándares-de-verificación-y-pruebas)
  - [Verificación Manual con Swagger](#verificación-manual-con-swagger)
  - [Pruebas Automatizadas (Roadmap)](#pruebas-automatizadas-roadmap)
- [Estándares de Configuración](#estándares-de-configuración)
  - [Configuración de TypeScript](#configuración-de-typescript)
  - [Configuración de Next.js](#configuración-de-nextjs)
  - [Configuración de ESLint](#configuración-de-eslint)
  - [Configuración del Entorno](#configuración-del-entorno)
- [Mejores Prácticas de Rendimiento](#mejores-prácticas-de-rendimiento)
  - [Componentes de Servidor vs Cliente](#componentes-de-servidor-vs-cliente)
  - [Optimización de Bundle](#optimización-de-bundle)
  - [Eficiencia en la API](#eficiencia-en-la-api)
- [Flujo de Trabajo de Desarrollo](#flujo-de-trabajo-de-desarrollo)
  - [Flujo de Trabajo Git](#flujo-de-trabajo-git)
  - [Scripts de Desarrollo](#scripts-de-desarrollo)
  - [Calidad del Código](#calidad-del-código)
- [Estrategia de Migración](#estrategia-de-migración)
  - [Migración desde Blazor WebAssembly](#migración-desde-blazor-webassembly)
  - [Modernización de Pantallas](#modernización-de-pantallas)
  - [Adopción Gradual del Modo Estricto](#adopción-gradual-del-modo-estricto)

---

## Descripción General

Este documento describe las mejores prácticas, convenciones y estándares utilizados en la aplicación frontend de **acura-office**, el panel de administración para organizadores de eventos de la plataforma Eventize/ACURA. La aplicación fue migrada desde Blazor WebAssembly a Next.js y actúa como capa de presentación y proxy hacia los servicios legacy de usuarios y eventos. Estas prácticas garantizan la consistencia del código, la mantenibilidad y una experiencia de desarrollo óptima.

## Stack Tecnológico

### Tecnologías Principales
- **Next.js 16.2.4 (App Router)**: Framework React con enrutamiento basado en el sistema de archivos, API Routes y despliegue en Vercel
- **React 19.2.4**: React moderno con componentes funcionales y hooks
- **TypeScript 5**: Para seguridad de tipos y mejor experiencia de desarrollo
- **Node.js 20**: Versión de tipos y runtime de referencia

### Framework de UI
- **Tailwind CSS 4**: Framework CSS utility-first integrado vía `@tailwindcss/postcss`
- **SVG inline**: Iconos definidos como componentes funcionales locales (p. ej., `MenuIcon`, `Chevron`, `LogoutIcon` en `AppShell.tsx`); no se usa biblioteca de iconos externa
- **Activos estáticos**: Imágenes de marca en `public/img` (migradas desde `wwwroot` de Blazor)

### Gestión de Estado y Flujo de Datos
- **React Hooks**: useState, useEffect, useMemo para gestión de estado local
- **fetch nativo**: Cliente HTTP para comunicación con la API (no se usa axios)
- **localStorage**: Persistencia de la sesión del usuario (token, organizador, menú por rol)

### Documentación de API
- **swagger-ui-react 5.32.4**: Visor de la especificación OpenAPI en la ruta `/swagger`
- **Especificación local**: Definida en `src/app/swagger/openapi.ts` y servida por `src/app/api/swagger/route.ts`

### Herramientas de Desarrollo
- **ESLint 9** con **eslint-config-next**: Linting del código con reglas específicas para Next.js y React
- **TypeScript**: Verificación de tipos estática
- **PostCSS**: Pipeline de estilos para Tailwind (`postcss.config.mjs`)

## Estructura del Proyecto

```
acura-office/
├── public/                     # Activos estáticos (img, css, js migrados de wwwroot)
├── src/
│   ├── app/                    # App Router: cada carpeta PascalCase es una ruta
│   │   ├── api/                # API Routes: un endpoint legacy por carpeta
│   │   │   ├── LogIn/route.ts
│   │   │   ├── GetAdminEvents/route.ts
│   │   │   ├── CreateEvent/route.ts
│   │   │   └── ...             # ~40 endpoints proxy hacia servicios legacy
│   │   ├── Cashier/            # Sub-rutas del módulo de caja
│   │   │   ├── CashierEvent/page.tsx
│   │   │   ├── Payment/page.tsx
│   │   │   └── Ticketing/page.tsx
│   │   ├── DashBoard/page.tsx  # Tablero del organizador
│   │   ├── Events/page.tsx     # Mis eventos
│   │   ├── CreateEvent/page.tsx
│   │   ├── Tickets/page.tsx
│   │   ├── Users/page.tsx
│   │   ├── Role/page.tsx
│   │   ├── swagger/            # Visor de la API (openapi.ts + page.tsx)
│   │   ├── layout.tsx          # Layout raíz (lang="es", metadata)
│   │   ├── page.tsx            # Página de inicio de sesión (ruta /)
│   │   ├── not-found.tsx       # Página 404
│   │   └── globals.css         # Estilos globales + import de Tailwind
│   ├── components/             # Componentes de UI reutilizables
│   │   ├── AppShell.tsx        # Sidebar + layout de pantallas autenticadas
│   │   ├── EndpointForm.tsx    # Formulario genérico contra un endpoint legacy
│   │   └── EndpointTable.tsx   # Tabla genérica contra un endpoint legacy
│   ├── lib/                    # Capa de servicios
│   │   ├── apiClient.ts        # postLegacy, getStoredToken, setSessionValues
│   │   ├── endpoints.ts        # Registro endpoint → servicio (user | events)
│   │   └── legacyProxy.ts      # Proxy del lado servidor hacia backends legacy
│   └── types/
│       └── acura.ts            # Contratos Request/Response migrados de C#
├── .env.example                # Plantilla de variables de entorno
├── next.config.ts              # Configuración de Next.js
├── tsconfig.json               # Configuración de TypeScript
├── postcss.config.mjs          # Configuración de PostCSS/Tailwind
├── MIGRATION_NOTES.md          # Equivalencias Blazor → Next.js
└── package.json                # Dependencias y scripts
```

## Terminología del Dominio

El dominio es la **gestión y venta de boletos para eventos**. Usar de forma consistente estos términos en código, tipos y endpoints:

| Término | Significado en el dominio |
|---|---|
| **Organizer** (`IdOrganizer`) | Organizador de eventos; entidad dueña de eventos, boletos y equipo |
| **Event** (`IdEvent`) | Evento publicable con fecha, lugar, categoría y estado |
| **Ticket / TicketClass** (`IdTicketClass`) | Clase de boleto con precio, cantidad e inventario disponible |
| **Cashier** (`idCashier`) | Cajero: módulo de venta presencial de boletos (módulo `Cashier/`) |
| **Folio** | Identificador de una preorden/venta usado en taquilla y facturación |
| **Role** (`IdRole`) | Rol de un miembro del equipo del organizador con vistas asignadas |
| **UserMenu** | Menú dinámico por rol devuelto por el LogIn y persistido en sesión |
| **Visibility** (`idVisibility`) | Estado de publicación del evento (público, oculto, programado) |
| **Commission** | Comisión por organizador aplicada a la venta |

## Estándares de Codificación

### Idioma y Convenciones de Nomenclatura

**Regla de idiomas del proyecto:**
- **Identificadores de código** (variables, funciones, componentes, tipos): en **inglés**
- **Comentarios de código**: en **español**
- **Mensajes de error y textos visibles para el usuario**: en **español**
- **Mensajes de commit**: en **español**
- **Campos de contratos legacy**: conservar el nombre **exacto** del backend (aunque mezcle estilos), ver [Tipos del Dominio](#tipos-del-dominio-contratos-legacy)

**Convenciones de nomenclatura:**

- **Carpetas de ruta**: Usar PascalCase replicando la página Blazor de origen (p. ej., `CreateEvent/`, `DashBoard/`, `Cashier/TicketingFolio/`)
- **Carpetas de API Routes**: Usar el nombre exacto del endpoint legacy (p. ej., `api/GetAdminEvents/`, `api/sendRecoverPasswordEmail/`)
- **Nomenclatura de Componentes**: Usar PascalCase para componentes React (p. ej., `AppShell`, `EndpointForm`, `EndpointTable`)
- **Nomenclatura de Variables**: Usar camelCase para variables y funciones (p. ej., `eventsOpen`, `getStoredToken`, `proxyLegacyEndpoint`)
- **Nomenclatura de Tipos/Interfaces**: Usar PascalCase (p. ej., `LegacyEndpoint`, `RCreateEvent`, `LogInR`)
- **Nomenclatura de Archivos**: PascalCase para componentes (`AppShell.tsx`), camelCase para utilidades y librerías (`apiClient.ts`, `legacyProxy.ts`)
- **Variables de Entorno**: UPPER_SNAKE_CASE con prefijo del servicio (p. ej., `NEXT_PUBLIC_ACURA_USERS_API_URL`)
- **Nomenclatura de Hooks**: camelCase con prefijo "use" (p. ej., `useSessionToken`, `useEventFilters`)

**Ejemplos:**

```tsx
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { setSessionValues } from "@/lib/apiClient";

export default function LoginPage() {
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Envía las credenciales al servicio de usuarios y persiste la sesión
  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    // ...
  }

  return (
    <main className="min-h-screen bg-white">
      {/* Textos visibles al usuario siempre en español */}
      <h1 className="mb-4 text-[30px] font-extrabold text-black">
        Inicia sesión
      </h1>
    </main>
  );
}
```

**Mensajes de Error y Retroalimentación al Usuario:**

```tsx
// Correcto: Mensajes de error en español, identificadores en inglés
if (!response.ok || data?.code === false || data?.Code === false) {
  setError(
    data?.message ||
    data?.Message ||
    "Usuario y/o contraseña incorrectos"
  );
  return;
}

// Evitar: Mensajes visibles al usuario en inglés
setError("Invalid username or password");
```

### Convenciones de Componentes

#### Componentes Funcionales
- **Siempre usar componentes funcionales** con hooks; nunca componentes de clase
- **Todo nuevo código en TypeScript** (`.tsx` / `.ts`)
- Las páginas interactivas deben declarar **`"use client"`** en la primera línea, ya que dependen de `localStorage`, hooks de navegación y estado local
- Las páginas autenticadas se envuelven en **`<AppShell>`**, que provee la barra lateral, el perfil del organizador y el cierre de sesión

```tsx
"use client";

import { AppShell } from "@/components/AppShell";
import { EndpointTable } from "@/components/EndpointTable";

export default function Page() {
  return (
    <AppShell>
      <EndpointTable
        title="Eventos"
        endpoint="GetAdminEvents"
        body={{ IdOrganizer: 1, IdStatus: "", Name: "", Date: "", IdState: "" }}
      />
    </AppShell>
  );
}
```

#### Props de Componentes
- **Definir tipos TypeScript** para las props (inline o con `type` nombrado)
- Usar **desestructuración** para las props
- Incluir **valores predeterminados** donde sea apropiado (p. ej., `submitLabel = "Guardar"`)
- Los callbacks opcionales se invocan con encadenamiento opcional: `onSuccess?.(data)`

```tsx
type Field = {
  name: string;
  label?: string;
  type?: string;
  required?: boolean;
  defaultValue?: string | number | boolean;
  options?: { label: string; value: string | number }[];
};

export function EndpointForm({
  title,
  endpoint,
  fields,
  submitLabel = "Guardar",
  onSuccess,
}: {
  title: string;
  endpoint: LegacyEndpoint;
  fields: Field[];
  submitLabel?: string;
  onSuccess?: (data: unknown) => void;
}) {
  // Implementación del componente
}
```

### Gestión de Estado

#### Estado Local con Hooks
- Usar **useState** para el estado a nivel de componente
- Usar **useMemo** para valores derivados costosos (p. ej., valores iniciales de un formulario a partir de su definición de campos)
- Usar **actualizaciones funcionales** al derivar del estado anterior: `setForm(prev => ({ ...prev, [name]: value }))`
- **Extraer hooks personalizados** cuando la misma lógica con estado se repita en varias pantallas

```tsx
const initialValue = useMemo(
  () =>
    Object.fromEntries(
      fields.map((field) => [field.name, field.defaultValue ?? ""])
    ),
  [fields]
);

const [form, setForm] = useState<Record<string, any>>(initialValue);
```

#### Estados de Carga y Error
- **Siempre manejar estados de carga** para operaciones asíncronas
- **Implementar manejo de errores** con mensajes en español amigables para el usuario
- Resetear `error` y `result` al inicio de cada envío y liberar `loading` en `finally`

```tsx
const [loading, setLoading] = useState(false);
const [result, setResult] = useState("");
const [error, setError] = useState("");

async function submit(event: React.FormEvent<HTMLFormElement>) {
  event.preventDefault();

  setLoading(true);
  setResult("");
  setError("");

  try {
    const data = await postLegacy(endpoint, form, getStoredToken());
    setResult(JSON.stringify(data, null, 2));
    onSuccess?.(data);
  } catch (err) {
    setError(err instanceof Error ? err.message : String(err));
  } finally {
    setLoading(false);
  }
}
```

### Gestión de Sesión

La sesión vive en **localStorage** y se administra exclusivamente desde `src/lib/apiClient.ts`:

- **`setSessionValues(data)`**: tras el LogIn persiste token (`Id_Session`, `token`, `tkn`), `IdUser`, `IdOrganizer`, `Name`, `Email`, `NameRol` y `userMenu`. Normaliza las variantes de capitalización del backend (`tkn`/`token`/`Token`, `idUser`/`IdUser`)
- **`getStoredToken()`**: recupera el token probando las claves conocidas; devuelve `null` en el servidor (`typeof window === "undefined"`)
- **Cierre de sesión**: `localStorage.clear()` + redirección a `/` (ver `AppShell.logout`)

Reglas:
- **Nunca acceder a localStorage directamente** desde páginas o componentes; usar los helpers del apiClient
- **Siempre proteger el acceso a `window`/`localStorage`** con la comprobación de entorno servidor, ya que las páginas pueden prerenderizarse
- El token se envía como header `Authorization: Bearer <token>` en cada llamada autenticada

#### Guard de sesión por ruta (obligatorio en rutas re-migradas)

Hoy no existe guard: una página protegida sin sesión (o sin `IdOrganizer`) dispara el error crudo de la API — así llegó "IdOrganizer es requerido" a `/ReportsByEvent`. Nota del backend: el LogIn solo devuelve `idOrganizer` cuando el request lleva `IsAdmin: true` (espejo del C#).

Toda ruta re-migrada valida sus requisitos **antes** de llamar APIs:
- Sin token → redirigir a `/` (login)
- Requisitos de la ruta incumplidos (p. ej. `IdOrganizer > 0` en pantallas de organizador) → mensaje claro en español + redirección, **nunca** el error crudo del backend
- Encapsular la lógica en un helper/componente compartido (no repetir el chequeo ad hoc por página)

### Arquitectura de la Capa de Servicios

La comunicación con los backends legacy (`acura-users` y `acura-events`) tiene **tres piezas** que deben mantenerse sincronizadas:

#### 1. Registro de endpoints (`src/lib/endpoints.ts`)
Mapa que asocia cada endpoint legacy con su servicio de origen. Es la **única fuente de verdad** del tipo `LegacyEndpoint`:

```typescript
export const legacyEndpoints = {
  "LogIn": "user",
  "GetAdminEvents": "events",
  "CreateEvent": "events",
  "FullPayment": "user",
  // ...
} as const;

export type LegacyEndpoint = keyof typeof legacyEndpoints;
```

#### 2. Cliente del lado del navegador (`src/lib/apiClient.ts`)
Función genérica `postLegacy` con tipos parametrizados para petición y respuesta:

```typescript
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
```

#### 3. Proxy del lado del servidor (`src/lib/legacyProxy.ts` + `src/app/api/*/route.ts`) — TRANSITORIO

⚠️ El proxy es andamiaje de la primera migración (apunta al formato C# `/<Endpoint>` sin `/api`, con fallbacks a `*.vantis.team`). **Las rutas re-migradas llaman a las APIs Next directamente vía `postLegacy`** — no crear proxies nuevos; el proxy se retira cuando ninguna página lo use. Cada endpoint legacy existente tiene una API Route que delega en `proxyLegacyEndpoint`:

```typescript
import { NextRequest } from "next/server";
import { proxyLegacyEndpoint } from "@/lib/legacyProxy";

export const dynamic = "force-dynamic";

export async function POST(request: NextRequest) {
  return proxyLegacyEndpoint(request, "LogIn");
}

export async function GET(request: NextRequest) {
  return proxyLegacyEndpoint(request, "LogIn");
}
```

El proxy reenvía el body y el header `Authorization`, usa `cache: "no-store"` y devuelve un error uniforme en fallos:

```typescript
return NextResponse.json(
  {
    code: false,
    message: "Legacy service request failed",
    error: error instanceof Error ? error.message : String(error),
  },
  { status: 500 }
);
```

**Para agregar un endpoint nuevo:**
1. Registrarlo en `legacyEndpoints` con su servicio (`"user"` o `"events"`)
2. Crear `src/app/api/<Endpoint>/route.ts` con el patrón uniforme anterior
3. Agregar los tipos de petición/respuesta en `src/types/acura.ts`
4. Documentarlo en `src/app/swagger/openapi.ts`

### Tipos del Dominio (Contratos Legacy)

Todos los contratos de la API viven en `src/types/acura.ts`, migrados desde las clases C# `Request`/`Response`/`dto` de Blazor:

- **Convención de prefijo `R`** para peticiones (p. ej., `RCreateEvent`, `RLogIn`, `RFullPayment`)
- **Convención de sufijo `R`** para respuestas (p. ej., `LogInR`, `EventsR`, `TicketR`)
- Campos opcionales del backend marcados con `?`
- Las respuestas con doble envoltura usan el sufijo `RR` (p. ej., `GetUserbyEmailRR` contiene `resp: GetUserbyEmailR`)

**Regla de casing (actualizada con la Fase 8 / re-migración):** el contrato de las rutas **re-migradas** es el **wire camelCase final** — la forma serializada real del C# (`JsonNamingPolicy.CamelCase`) que ya emiten los endpoints Next re-migrados, y que los no re-migrados también emiten vía doble emisión. Al re-migrar una ruta se corrigen sus tipos a camelCase y se **envía y lee solo camelCase**:

```typescript
export interface GetTicketsReportR {
  code: boolean;
  message?: string;
  tickets?: TicketsList[];
  totalElements: number;
  totalPages: number;
}
```

- **No tolerar ambas capitalizaciones en código nuevo** (nada de `data.Code ?? data.code`) — esa tolerancia era del periodo pre-Fase 8; los helpers heredados que la tienen (`setSessionValues`) se limpian al re-migrar su flujo
- Los tipos PascalCase que queden en `types/acura.ts` corresponden a rutas NO re-migradas — se corrigen **solo** en el ciclo de su ruta, nunca "de paso"

## Estándares de UI/UX

### Integración de Tailwind CSS
- Tailwind se importa una sola vez en `src/app/globals.css` con `@import "tailwindcss"`
- **Estilizar con clases utilitarias** directamente en el JSX; no crear archivos CSS por componente
- Usar **valores arbitrarios** para los colores y medidas exactos de la marca (p. ej., `bg-[#10d46e]`, `text-[#6b35f5]`, `w-[250px]`, `h-[58px]`)
- Paleta de marca de referencia: verde Eventize `#10d46e`/`#09c866`, morado de acción `#6b35f5`/`#5b2ce6`, fondo de aplicación `#f4f6fb`, texto `#27243a`
- **Diseño responsivo** con los breakpoints de Tailwind (`lg:`, `md:`, `xl:`), p. ej. el grid del login `grid-cols-1 lg:grid-cols-[30%_70%]`
- Variables CSS globales (`--background`, `--foreground`) definidas en `globals.css` para el tema base

```tsx
<section className="rounded-2xl bg-white p-6 shadow-[0_12px_28px_rgba(15,23,42,0.08)]">
  <h3 className="mb-2 text-xl font-semibold text-slate-900">{title}</h3>
</section>
```

### Manejo de Formularios
- Usar **componentes controlados** para entradas de formulario (`value` + `onChange`)
- Usar `required` nativo de HTML para validaciones básicas
- **Deshabilitar botones de envío** durante el envío y mostrar texto de progreso en español
- Convertir a número los campos `type="number"` en el `onChange`
- Para formularios CRUD estándar contra un endpoint legacy, **reutilizar `EndpointForm`** definiendo los campos de forma declarativa

```tsx
<button
  type="submit"
  disabled={loading}
  className="mt-5 rounded-full bg-slate-900 px-5 py-2.5 text-sm font-bold text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60"
>
  {loading ? "Procesando..." : submitLabel}
</button>
```

### Patrones de Navegación
- Usar **`next/link`** (`<Link href="...">`) para la navegación declarativa del menú
- Usar **`useRouter` de `next/navigation`** para navegación programática (p. ej., `router.push("/DashBoard")` tras el login)
- Usar **`usePathname`** para resaltar/expandir la sección activa del menú en `AppShell`
- Las rutas reflejan los nombres PascalCase de las carpetas: `/DashBoard`, `/CreateEvent`, `/Cashier/CashierEvent`

```tsx
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";

const pathname = usePathname();
const router = useRouter();

const [eventsOpen, setEventsOpen] = useState(
  pathname === "/Events" || pathname === "/CreateEvent"
);
```

### Accesibilidad
- Asociar etiquetas a campos con **`htmlFor` + `id`**
- Marcar los SVG decorativos con **`aria-hidden="true"`**
- Proporcionar **texto alternativo** (`alt`) en todas las imágenes
- Usar elementos **HTML semánticos** (`main`, `aside`, `nav`, `section`, `button type="button"`)
- El layout raíz declara **`lang="es"`**

```tsx
<label htmlFor={field.name} className="text-sm font-semibold text-slate-700">
  {field.label || field.name}
</label>
<input id={field.name} type={field.type || "text"} ... />
```

## Estándares de Verificación y Pruebas

### Verificación Manual con Swagger
El proyecto aún no cuenta con un framework de pruebas automatizadas. La verificación actual se apoya en:

- **`/swagger`**: visor de la especificación OpenAPI (`swagger-ui-react`) para explorar y ejercitar los endpoints proxy
- **Componentes genéricos `EndpointForm`/`EndpointTable`**: muestran la respuesta JSON cruda del endpoint, lo que permite validar contratos pantalla por pantalla durante la migración
- **`npm run lint` y `npm run build`** como puertas de calidad mínimas antes de integrar cambios

Reglas al verificar manualmente:
- **Probar tanto escenarios de éxito como de error** (credenciales inválidas, token expirado, servicio legacy caído)
- **Verificar contra ambos servicios** cuando el cambio toque el registro de endpoints (usuarios y eventos)
- Mantener `src/app/swagger/openapi.ts` **actualizado** al agregar o modificar endpoints

### Pruebas Automatizadas (Roadmap)
Cuando se incorporen pruebas, seguir estos lineamientos:

- **Pruebas end-to-end** para los flujos críticos del organizador: inicio de sesión, creación/publicación de evento, venta en caja, recuperación de contraseña
- **Probar flujos de trabajo del usuario** en lugar de detalles de implementación
- Usar atributos **data-testid** para la selección confiable de elementos
- **Organizar las pruebas por módulo** del dominio (events, tickets, cashier, users, roles)
- **Incluir pruebas de API** contra las API Routes del proxy junto con las pruebas de UI

## Estándares de Configuración

### Configuración de TypeScript
- Objetivo **ES2017** con resolución de módulos **bundler** (estándar de Next.js)
- **Mapeo de rutas** con `@/*` apuntando a `src/*`; usar siempre importaciones con alias (`@/lib/apiClient`, `@/components/AppShell`) en lugar de rutas relativas profundas
- `strict` está actualmente en **false** por la migración desde Blazor; ver [Adopción Gradual del Modo Estricto](#adopción-gradual-del-modo-estricto)
- `allowJs` habilitado solo como soporte de transición; no agregar archivos `.js` nuevos

```json
{
  "compilerOptions": {
    "target": "ES2017",
    "strict": false,
    "moduleResolution": "bundler",
    "jsx": "react-jsx",
    "paths": {
      "@/*": ["./src/*"]
    }
  }
}
```

### Configuración de Next.js
- `reactStrictMode` está en **false** para evitar dobles efectos durante la migración; no depender de ese comportamiento en código nuevo (escribir efectos idempotentes)
- El servidor de desarrollo corre con **webpack** (`next dev --webpack`)
- Las API Routes del proxy declaran **`export const dynamic = "force-dynamic"`** para impedir el cacheo de respuestas legacy

```typescript
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: false,
};

export default nextConfig;
```

### Configuración de ESLint
- **ESLint 9** con la configuración plana de **eslint-config-next**
- Ejecutar `npm run lint` antes de cada commit
- **Estilo de código consistente** en todo el proyecto; no deshabilitar reglas sin justificación en el comentario

### Configuración del Entorno
- Copiar `.env.example` a `.env.local` para desarrollo local
- Variables **`NEXT_PUBLIC_*`** para llamadas desde el navegador; variables sin prefijo para el proxy del lado servidor
- Un par de variables por servicio legacy: `ACURA_USERS_API_URL`, `ACURA_EVENTS_API_URL` (y `ADMIN`/`PDF` reservadas)
- **Validar la presencia de la variable** antes de usarla y fallar con un mensaje claro; el proxy del servidor puede usar el fallback a los dominios `vantis.team`

```typescript
const value =
  service === "user"
    ? process.env.NEXT_PUBLIC_ACURA_USERS_API_URL
    : process.env.NEXT_PUBLIC_ACURA_EVENTS_API_URL;

if (!value) {
  throw new Error("Missing NEXT_PUBLIC_ACURA_USERS_API_URL");
}

return value.replace(/\/$/, "");
```

- **Nunca commitear `.env` ni `.env.local`**; mantener `.env.example` como plantilla actualizada

## Mejores Prácticas de Rendimiento

### Componentes de Servidor vs Cliente
- Marcar con `"use client"` **solo** los componentes que lo necesiten (estado, eventos, localStorage, hooks de navegación)
- Mantener `layout.tsx` y componentes puramente presentacionales como componentes de servidor cuando sea posible
- **Memoizar cálculos costosos** con useMemo y callbacks estables con useCallback
- **Extraer lógica reutilizable** en hooks personalizados o componentes genéricos (patrón `EndpointForm`/`EndpointTable`)

### Optimización de Bundle
- **División de código automática por ruta** provista por el App Router
- Cargar dependencias pesadas (p. ej., `swagger-ui-react`) solo en su ruta dedicada
- **Optimizar imágenes** de `public/img` y preferir SVG inline para iconos
- **Monitorear el tamaño del bundle** con la salida de `npm run build`

### Eficiencia en la API
- El proxy usa **`cache: "no-store"`**: los datos legacy nunca se sirven cacheados; no introducir cacheo sin acordarlo con el backend
- **Implementar manejo de errores adecuado** para solicitudes de red, incluyendo `response.json().catch(() => null)` para respuestas sin cuerpo JSON
- **Usar estados de carga** para mejorar el rendimiento percibido
- **Agrupar llamadas independientes** con `Promise.all` cuando una pantalla necesite varios endpoints

## Flujo de Trabajo de Desarrollo

### Flujo de Trabajo Git
- **Ramas de Funcionalidad**: Desarrollar funcionalidades en ramas separadas, agregando el sufijo descriptivo "-frontend" para permitir trabajar en paralelo y evitar conflictos o colisiones
- **Commits Descriptivos**: Escribir mensajes de commit descriptivos **en español** (p. ej., `Agrega proxy y tipos para GetCommissionByOrganizer`)
- **Revisión de Código**: Revisión de código antes de hacer merge
- **Ramas Pequeñas**: Mantener las ramas pequeñas y enfocadas, idealmente una pantalla o un endpoint por rama

### Scripts de Desarrollo
```bash
npm install        # Instalar dependencias
npm run dev        # Servidor de desarrollo (next dev --webpack)
npm run build      # Compilación de producción
npm run start      # Servir la compilación de producción
npm run lint       # Validación con ESLint
```

### Calidad del Código
- **Validación con ESLint** antes de commits
- **`npm run build` sin errores** antes de integrar (incluye verificación de tipos)
- **Verificación manual** del flujo afectado (login, módulo de caja, etc.) antes del despliegue
- **Despliegue en Vercel**: la rama principal debe estar siempre desplegable

## Estrategia de Migración

### Migración desde Blazor WebAssembly
El proyecto proviene de `TXMXB12305-ACURA-OFFICE-main` (Blazor WebAssembly). Las equivalencias documentadas en `MIGRATION_NOTES.md` son la guía para localizar el código de origen:

| Origen (Blazor) | Destino (Next.js) |
|---|---|
| `Pages/*.razor` | `src/app/<Route>/page.tsx` |
| `Pages/Cashier/*.razor` | `src/app/Cashier/<Route>/page.tsx` |
| `Request/*.cs`, `Response/*.cs`, `dto/*.cs` | `src/types/acura.ts` |
| URLs hardcodeadas hacia los servicios | `src/app/api/<Endpoint>/route.ts` + `src/lib/legacyProxy.ts` |
| `wwwroot/img`, `wwwroot/css`, `wwwroot/js` | `public/` |

Reglas durante la migración:
- **No hardcodear URLs de servicios** en páginas: toda llamada pasa por `postLegacy`
- **Conservar los nombres de ruta y endpoint** del proyecto Blazor para mantener trazabilidad 1:1
- **Migrar los contratos completos** a `src/types/acura.ts` antes de construir la pantalla que los consume

#### Ciclo de re-migración de una ruta (checklist del PR)

La primera migración dejó un cascarón (solo `/Users` y `/ReportsByEvent` funcionan). Cada ruta se **re-migra** con este ciclo, en el orden de `plan-migracion-rutas-office.md`:

1. Leer la página Blazor original **y sus servicios** (`Services/*.cs`) → lista de endpoints y comportamiento completo (confirmaciones, navegación, side effects)
2. **Backend primero**: re-migrar/verificar esos endpoints con el protocolo R1-R7 del estándar backend (PRs coordinados, mismo ciclo). Para endpoints de ADMIN el office es el único consumidor → wire final camelCase directo
3. Tipos de esos endpoints en `types/acura.ts` → camelCase final; registrar endpoints nuevos en `legacyEndpoints`
4. Página con el patrón de `/ReportsByEvent` (estados loading/error/data, `validate()` antes de llamar, banner de error) + **guard de sesión**
5. Paridad funcional con el Blazor (la paridad visual exacta puede iterar); portar comportamiento, no librerías (SweetAlert → banner/modal propio)
6. Puertas: `npx tsc --noEmit` sin errores + pasada manual del flujo completo en el preview de Vercel (login → ruta → operaciones), anotada en el PR

### Modernización de Pantallas
- La estructura ya está en Next/Vercel; el trabajo pendiente es dejar cada pantalla **1:1 visual** con el diseño original
- **Reemplazar los formularios genéricos** (`EndpointForm`/`EndpointTable`) por la UI final exacta, pantalla por pantalla, reutilizando los componentes React ya creados
- **Extraer componentes reutilizables** a `src/components` cuando un patrón visual se repita en dos o más pantallas
- **Principios de diseño responsivo** con Tailwind en toda la aplicación

### Adopción Gradual del Modo Estricto
- **Nuevos módulos sin `any`**: tipar peticiones y respuestas con los contratos de `src/types/acura.ts` y los genéricos de `postLegacy<TResponse, TRequest>`
- **Reducir los `any` heredados** (p. ej., `setSessionValues(data: any)`) al tocar el archivo correspondiente
- Objetivo a mediano plazo: habilitar `"strict": true` en `tsconfig.json` y `reactStrictMode: true` en `next.config.ts` una vez completada la migración visual
- **Agregar tipos incrementalmente** al código existente; no bloquear entregas por refactorizaciones de tipos masivas

Este documento sirve como base para mantener la calidad y consistencia del código en toda la aplicación frontend de acura-office. Todos los miembros del equipo deben seguir estas prácticas para garantizar una base de código mantenible y escalable.
