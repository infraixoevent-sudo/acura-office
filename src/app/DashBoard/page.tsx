"use client";

import { AppShell } from "@/components/AppShell";
import { EndpointForm } from "@/components/EndpointForm";
import { EndpointTable } from "@/components/EndpointTable";

export default function Page() {
  return (<AppShell><div className="d-flex flex-column gap-4"><EndpointTable title="Inicio" endpoint="GetDashboardEvents" body={{"IdOrganizer": 1, "Page": 1}} /><EndpointForm title="Filtros / acción" endpoint="GetDashboardEvents" fields={[{"name": "IdOrganizer", "label": "IdOrganizer", "type": "number", "defaultValue": 1}, {"name": "Page", "label": "Página", "type": "number", "defaultValue": 1}] submitLabel="Consultar" /></div></AppShell>);
}
