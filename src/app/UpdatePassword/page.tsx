"use client";

import { AppShell } from "@/components/AppShell";
import { EndpointForm } from "@/components/EndpointForm";
import { EndpointTable } from "@/components/EndpointTable";

export default function Page() {
  return (<EndpointForm title="Cambiar contrase\u00f1a" endpoint="UpdatePasswordRecovery" fields={[{"name": "Code", "label": "Código", "type": "text", "defaultValue": ""}, {"name": "Password", "label": "Nueva contraseña", "type": "password", "defaultValue": ""}]} />);
}
