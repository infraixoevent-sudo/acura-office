"use client";

import { AppShell } from "@/components/AppShell";
import { EndpointForm } from "@/components/EndpointForm";
import { EndpointTable } from "@/components/EndpointTable";

export default function Page() {
  return (<AppShell><EndpointForm title="Agregar Rol de usuario" endpoint="CreateRole" fields={[{"name": "email", "label": "Email", "type": "email", "defaultValue": ""}, {"name": "name", "label": "Nombre", "type": "text", "defaultValue": ""}, {"name": "idRole", "label": "Rol", "type": "number", "defaultValue": ""}, {"name": "idUser", "label": "Id usuario", "type": "number", "defaultValue": ""}, {"name": "idOrganizer", "label": "IdOrganizer", "type": "number", "defaultValue": ""}]} /></AppShell>);
}
