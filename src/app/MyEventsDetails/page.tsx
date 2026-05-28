"use client";

import { AppShell } from "@/components/AppShell";
import { EndpointForm } from "@/components/EndpointForm";
import { EndpointTable } from "@/components/EndpointTable";

export default function Page() {
  return (<AppShell><EndpointForm title="Mis detalles del evento" endpoint="GetAdminEventByIdEvent" fields={[{"name": "IdEvent", "label": "Id evento", "type": "text", "defaultValue": ""}]} /></AppShell>);
}
