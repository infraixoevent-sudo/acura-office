"use client";

import { AppShell } from "@/components/AppShell";
import { EndpointForm } from "@/components/EndpointForm";
import { EndpointTable } from "@/components/EndpointTable";

export default function Page() {
  return (<EndpointForm title="Recuperar contrase\u00f1a" endpoint="RecoveryPassword" fields={[{"name": "Email", "label": "Email", "type": "email", "defaultValue": ""}, {"name": "Subject", "label": "Asunto", "type": "text", "defaultValue": "Recuperación de contraseña"}]} />);
}
