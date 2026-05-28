"use client";

import { AppShell } from "@/components/AppShell";
import { EndpointForm } from "@/components/EndpointForm";
import { EndpointTable } from "@/components/EndpointTable";

export default function Page() {
  return (
    <AppShell>
      <div className="flex flex-col gap-6">
        <EndpointTable
          title="Caja - eventos"
          endpoint="GetCashierEvents"
          body={{
            IdOrganizer: 1,
            Page: 1,
          }}
        />

        <EndpointForm
          title="Filtros / acción"
          endpoint="GetCashierEvents"
          fields={[
            {
              name: "IdOrganizer",
              label: "IdOrganizer",
              type: "number",
              defaultValue: 1,
            },
            {
              name: "Name",
              label: "Nombre",
              type: "text",
              defaultValue: "",
            },
            {
              name: "Date",
              label: "Fecha",
              type: "date",
              defaultValue: "",
            },
            {
              name: "IdState",
              label: "Estado",
              type: "number",
              defaultValue: "",
            },
            {
              name: "Page",
              label: "Página",
              type: "number",
              defaultValue: 1,
            },
          ]}
          submitLabel="Consultar"
        />
      </div>
    </AppShell>
  );
}