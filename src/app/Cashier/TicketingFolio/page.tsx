"use client";

import { AppShell } from "@/components/AppShell";
import { EndpointForm } from "@/components/EndpointForm";
import { EndpointTable } from "@/components/EndpointTable";

export default function Page() {
  return (<AppShell><EndpointForm title="Caja - boletos por folio" endpoint="GetTicketByFolio" fields={[{"name": "Folio", "label": "Folio", "type": "text", "defaultValue": ""}]} /></AppShell>);
}
