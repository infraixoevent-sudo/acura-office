"use client";

import { AppShell } from "@/components/AppShell";
import { EndpointForm } from "@/components/EndpointForm";
import { EndpointTable } from "@/components/EndpointTable";

export default function Page() {
  return (
    <AppShell>
      <div className="flex flex-col gap-6">
        <EndpointTable
          title="Boletos"
          endpoint="GetTicketByOrganizer"
          body={{}}
        />

        <EndpointForm
          title="Filtros / acción"
          endpoint="GetTicketByOrganizer"
          fields={[
            { name: "idEvent", label: "Id evento", type: "text", defaultValue: "" },
          ]}
          submitLabel="Consultar"
        />
      </div>
    </AppShell>
  );
}