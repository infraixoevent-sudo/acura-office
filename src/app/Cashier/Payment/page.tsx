"use client";

import { AppShell } from "@/components/AppShell";
import { EndpointForm } from "@/components/EndpointForm";
import { EndpointTable } from "@/components/EndpointTable";

export default function Page() {
  return (<AppShell><EndpointForm title="Informaci\u00f3n de pago" endpoint="FullPayment" fields={[{"name": "idCashier", "label": "Id cajero", "type": "number", "defaultValue": ""}, {"name": "idMethodPayment", "label": "Método de pago", "type": "number", "defaultValue": ""}, {"name": "paymentAuthorizationNumber", "label": "Autorización", "type": "text", "defaultValue": ""}, {"name": "name", "label": "Nombre cliente", "type": "text", "defaultValue": ""}, {"name": "email", "label": "Email", "type": "email", "defaultValue": ""}, {"name": "phone", "label": "Teléfono", "type": "text", "defaultValue": ""}, {"name": "amount", "label": "Monto", "type": "number", "defaultValue": ""}, {"name": "idEvent", "label": "Id evento", "type": "number", "defaultValue": ""}, {"name": "folio", "label": "Folio", "type": "number", "defaultValue": ""}]} /></AppShell>);
}
