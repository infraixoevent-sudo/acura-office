"use client";

import { AppShell } from "@/components/AppShell";
import { EndpointForm } from "@/components/EndpointForm";
import { EndpointTable } from "@/components/EndpointTable";

export default function Page() {
  return (<AppShell><EndpointForm title="Publica tu evento" endpoint="PublishEvent" fields={[{"name": "IdEvent", "label": "Id evento", "type": "text", "defaultValue": ""}, {"name": "IdOrganizer", "label": "IdOrganizer", "type": "text", "defaultValue": ""}, {"name": "Visibility", "label": "Visibilidad", "type": "text", "defaultValue": ""}, {"name": "visibilityStartDate", "label": "Fecha de publicación", "type": "datetime-local", "defaultValue": ""}]} /></AppShell>);
}
