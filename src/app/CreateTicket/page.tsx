"use client";

import { AppShell } from "@/components/AppShell";
import { EndpointForm } from "@/components/EndpointForm";
import { EndpointTable } from "@/components/EndpointTable";

export default function Page() {
  return (<AppShell><EndpointForm title="Crear boleto" endpoint="CreateTickets" fields={[{"name": "NameTicket", "label": "Tipo de boleto", "type": "text", "defaultValue": ""}, {"name": "IdStatusTicket", "label": "Estatus", "type": "number", "defaultValue": ""}, {"name": "DescriptionTicket", "label": "Descripción", "type": "textarea", "defaultValue": ""}, {"name": "IdEvent", "label": "Id evento", "type": "text", "defaultValue": ""}, {"name": "Quantity", "label": "Cantidad", "type": "number", "defaultValue": ""}, {"name": "Price", "label": "Precio", "type": "number", "defaultValue": ""}, {"name": "ColorTicket", "label": "Color", "type": "color", "defaultValue": ""}, {"name": "SaleStartDate", "label": "Inicio venta", "type": "datetime-local", "defaultValue": ""}, {"name": "SaleEndDate", "label": "Fin venta", "type": "datetime-local", "defaultValue": ""}]} /></AppShell>);
}
