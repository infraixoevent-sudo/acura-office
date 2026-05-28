"use client";

import { AppShell } from "@/components/AppShell";
import { EndpointForm } from "@/components/EndpointForm";
import { EndpointTable } from "@/components/EndpointTable";

export default function Page() {
  return (
    <AppShell>
      <div className="flex flex-col gap-6">
        <EndpointTable
          title="Consulta de Usuarios y Roles"
          endpoint="GetRolesByOrganizer"
          body={{
            idOrganizer: 1,
            page: 1,
          }}
        />

        <EndpointForm
          title="Filtros / acción"
          endpoint="GetRolesByOrganizer"
          fields={[
            { name: "idOrganizer", label: "IdOrganizer", type: "number", defaultValue: 1 },
            { name: "page", label: "Página", type: "number", defaultValue: 1 },
          ]}
          submitLabel="Consultar"
        />
      </div>
    </AppShell>
  );
}