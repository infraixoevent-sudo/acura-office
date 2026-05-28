"use client";

import { AppShell } from "@/components/AppShell";
import { EndpointForm } from "@/components/EndpointForm";
import { EndpointTable } from "@/components/EndpointTable";

export default function Page() {
  return (<AppShell><EndpointForm title="Cancelar un evento" endpoint="CancelEvent" fields={[{"name": "idEvent", "label": "Id evento", "type": "text", "defaultValue": ""}, {"name": "Comment", "label": "Comentario", "type": "textarea", "defaultValue": ""}]} /></AppShell>);
}
