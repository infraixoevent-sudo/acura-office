"use client";

import { AppShell } from "@/components/AppShell";
import { EndpointForm } from "@/components/EndpointForm";
import { EndpointTable } from "@/components/EndpointTable";

export default function Page() {
  return (<AppShell><div className="d-flex flex-column gap-4"><EndpointTable title="Eventos" endpoint="GetAdminEvents" body={{"IdOrganizer": 1, "IdStatus": "", "Name": "", "Date": "", "IdState": ""}} /><EndpointForm title="Filtros / acción" endpoint="GetAdminEvents" fields={[{"name": "IdOrganizer", "label": "IdOrganizer", "type": "number", "defaultValue": 1}, {"name": "IdStatus", "label": "Estatus", "type": "text", "defaultValue": ""}, {"name": "Name", "label": "Nombre", "type": "text", "defaultValue": ""}, {"name": "Date", "label": "Fecha", "type": "date", "defaultValue": ""}, {"name": "IdState", "label": "Estado", "type": "number", "defaultValue": ""}] submitLabel="Consultar" /></div></AppShell>);
}
