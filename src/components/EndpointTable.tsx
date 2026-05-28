"use client";

import { useEffect, useMemo, useState } from "react";
import { getStoredToken, postLegacy } from "@/lib/apiClient";
import type { LegacyEndpoint } from "@/lib/endpoints";

function firstArray(data: any): any[] {
  if (!data || typeof data !== "object") return [];
  if (Array.isArray(data)) return data;
  for (const value of Object.values(data)) {
    if (Array.isArray(value)) return value;
    if (value && typeof value === "object") {
      const nested = firstArray(value);
      if (nested.length) return nested;
    }
  }
  return [];
}

export function EndpointTable({ title, endpoint, body, columns }: { title: string; endpoint: LegacyEndpoint; body?: Record<string, unknown>; columns?: string[] }) {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const rows = useMemo(() => firstArray(data), [data]);
  const resolvedColumns = useMemo(() => columns?.length ? columns : Object.keys(rows[0] || {}).slice(0, 8), [columns, rows]);

  async function load() {
    setLoading(true);
    setError("");
    try {
      const response = await postLegacy(endpoint, body || {}, getStoredToken());
      setData(response);
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { load(); }, []);

  return (
    <section className="acura-card">
      <div className="d-flex justify-content-between align-items-center mb-3">
        <h3 className="Iniciosesion mb-0">{title}</h3>
        <button className="acura-button secondary" onClick={load} disabled={loading}>{loading ? "Cargando..." : "Actualizar"}</button>
      </div>
      {error ? <pre className="acura-alert acura-error">{error}</pre> : null}
      {rows.length ? (
        <div style={{ overflowX: "auto" }}>
          <table className="acura-table">
            <thead><tr>{resolvedColumns.map((column) => <th key={column}>{column}</th>)}</tr></thead>
            <tbody>{rows.map((row, index) => <tr key={index}>{resolvedColumns.map((column) => <td key={column}>{String(row?.[column] ?? "")}</td>)}</tr>)}</tbody>
          </table>
        </div>
      ) : (
        <pre className="acura-alert">{data ? JSON.stringify(data, null, 2) : "Sin datos todavía."}</pre>
      )}
    </section>
  );
}
