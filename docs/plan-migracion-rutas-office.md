# Plan de migración de rutas — ACURA-OFFICE

**Fecha:** 2026-07-12 · **Fuente:** páginas Blazor (`TXMXB12305-ACURA-OFFICE/Pages/*.razor` + su capa `Services/`) cruzadas con el estado real de los endpoints Next (inventario + conciliación + fases 1-8).

**Regla del ciclo** (frontend-standards): cada ruta se migra JUNTO con la re-migración de sus endpoints (protocolo R1-R7). Como el office es el único consumidor de ADMIN, los endpoints de ADMIN re-migrados van directo a **wire final camelCase** y la página nueva lee camelCase — sin ventana de transición.

## Mapa ruta → endpoints (verificado en el Blazor)

| Ruta | Página Blazor | Endpoints que consume | API | Estado Next del endpoint |
|---|---|---|---|---|
| /Admin/List-of-organizers | `Admin/ListOfOrganizers.razor` | GetOrganizersInfoFiltered · GetEventStatus (estatus) | ADMIN · EVENTS | ✅ Reescrito en F5 (QueryBuilder) + wire conocido; catálogo OK |
| /Admin/Consult-events | `Admin/ConsultEvents.razor` | GetOrganizersEventsFiltered · GetEventCategory · GetEventStatus | ADMIN · EVENTS | ✅ Reescrito en F5 — **con el fix del bug bigint: el office por fin mostrará ventas reales, no ceros** |
| /PaymentHistory (organizador) | `Organizer/PaymentHistory.razor` | GetEventsByOrganizer · GetTransferByEvent | ADMIN | ✅ Existentes con pruebas; wire conocido |
| /Admin/PaymentHistory (+detalle +registro) | `Admin/OrganizingPayments.razor` + `PaymentDetails.razor` + `RegistrationPaymentOrganizer.razor` | GetOrganizers · GetEventsByOrganizer · GetTransferByEvent · GetTransferDetails · GetSaldoByEvent · RegisterTransferToOrganizer | ADMIN | ✅ Suite completa de transfers con transacción (F3); wire conocido |
| /Admin/Applications (+detalle) | `Admin/Applications.razor` + `ApplicationDetails.razor` | GetOrganizer · GetOrganizerByIdOrganizer · UpdateStatusOrganizerApplication | EVENTS | ✅ Endurecidos en F5/F6 (transacción + correo con mailer); wire por conciliar fino |
| /Events | `Events.razor` | GetAdminEvents | EVENTS | ✅ Probado en producción por /ReportsByEvent (dropdown) |
| /Dashboard | `DashBoard.razor` | GetDashboardEvents | EVENTS | Existe con validación; re-migrar wire por protocolo |
| /Cashier/CashierEvent | `Cashier/CashierEvent.razor` | GetCashierEvents · GetTicketByFolio | EVENTS | Existen; re-migrar wire. ⚠️ El flujo de caja COMPLETO (Payment/Ticketing) desemboca en FullPayment — estacionado |
| /CreateEvent | `CreateEvent.razor` | CreateEvent · CreateTicket(→USERS CreateTickets) · GetEventCategory · GetNeighborhoodsByZipCode | EVENTS · USERS | Existen. ⚠️ **Revisar EventImage**: el request Blazor manda imagen y el `createEvent` del Next no la procesa (probable GAP tipo FullPayment — verificar contra el C# si sube a MULTIMEDIA → podría quedar estacionado) |

## Orden recomendado (valor ÷ riesgo)

1. **/Admin/List-of-organizers** — la más simple (1 tabla + filtros, 1 endpoint principal ya reescrito y probado). Ideal para estrenar el ciclo ruta+API y el patrón de página.
2. **/Admin/Consult-events** — mismo patrón de tabla; entrega visible: los totales reales (bug bigint corregido en F5).
3. **/PaymentHistory** y **/Admin/PaymentHistory** (cluster de transfers) — comparten servicios y componentes; el registro de pagos ejercita la escritura transaccional.
4. **/Admin/Applications** — flujo con acción de negocio (aprobar/rechazar organizador dispara el correo de F6) — primera ruta con side effect.
5. **/Events** — endpoint ya probado; la página tiene más acciones (navegación a detalle/cancelar/publicar que llevarán a rutas futuras).
6. **/Dashboard** — tarjetas del organizador.
7. **/Cashier/CashierEvent** — solo el listado; los sub-flujos de cobro esperan FullPayment (FP-1..6).
8. **/CreateEvent** — al final: el más grande (formulario multi-paso + catálogos + zip) y con la incógnita de EventImage por resolver primero.

## Metodología por ruta (resumen del checklist del estándar front)

1. Leer la página Blazor original (+ sus servicios) → lista de endpoints y comportamiento.
2. Re-migrar/verificar cada endpoint con el protocolo R1-R7 (para ADMIN: wire final directo; el contrato del office lo definimos nosotros — camelCase exacto).
3. Tipos en `types/acura.ts` → camelCase final; registrar endpoints nuevos en `legacyEndpoints`.
4. Página con el patrón de `/ReportsByEvent` + guard de sesión.
5. `tsc --noEmit` + verificación manual en preview de Vercel (login → ruta → operaciones) anotada en el PR.

**Nota de paridad**: las páginas Blazor usan SweetAlert para confirmaciones y localStorage vía Blazored — los equivalentes Next son el banner/modal propio y los helpers de `apiClient` (no portar librerías, portar comportamiento).
