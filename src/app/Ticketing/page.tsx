"use client";

import { AppShell } from "@/components/AppShell";
import { EndpointForm } from "@/components/EndpointForm";
import { EndpointTable } from "@/components/EndpointTable";

export default function Page() {
  return (<AppShell><EndpointForm title="Venta de boletos" endpoint="GetValidateInventoryTicket" fields={[{"name": "IdEvent", "label": "Id evento", "type": "text", "defaultValue": ""}]} /></AppShell>);
}
