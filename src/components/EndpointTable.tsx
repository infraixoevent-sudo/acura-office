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

export function EndpointTable({
  title,
  endpoint,
  body,
  columns,
}: {
  title: string;
  endpoint: LegacyEndpoint;
  body?: Record<string, unknown>;
  columns?: string[];
}) {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const rows = useMemo(() => firstArray(data), [data]);

  const resolvedColumns = useMemo(
    () => (columns?.length ? columns : Object.keys(rows[0] || {}).slice(0, 8)),
    [columns, rows]
  );

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

  useEffect(() => {
    load();
  }, []);

  return (
    <section className="rounded-2xl bg-white p-6 shadow-[0_12px_28px_rgba(15,23,42,0.08)]">
      <div className="mb-4 flex items-center justify-between gap-4">
        <h3 className="text-xl font-semibold text-slate-900">{title}</h3>

        <button
          type="button"
          onClick={load}
          disabled={loading}
          className="rounded-full border border-slate-300 bg-white px-4 py-2 text-sm font-bold text-slate-900 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {loading ? "Cargando..." : "Actualizar"}
        </button>
      </div>

      {error ? (
        <pre className="mb-4 whitespace-pre-wrap rounded-xl bg-red-50 p-4 text-sm text-red-700">
          {error}
        </pre>
      ) : null}

      {rows.length ? (
        <div className="overflow-x-auto">
          <table className="w-full border-collapse overflow-hidden rounded-xl bg-white">
            <thead>
              <tr>
                {resolvedColumns.map((column) => (
                  <th
                    key={column}
                    className="border-b border-slate-200 bg-slate-50 px-4 py-3 text-left text-sm font-semibold text-slate-700"
                  >
                    {column}
                  </th>
                ))}
              </tr>
            </thead>

            <tbody>
              {rows.map((row, index) => (
                <tr key={index}>
                  {resolvedColumns.map((column) => (
                    <td
                      key={column}
                      className="border-b border-slate-100 px-4 py-3 text-sm text-slate-700"
                    >
                      {String(row?.[column] ?? "")}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <pre className="whitespace-pre-wrap rounded-xl bg-blue-50 p-4 text-sm text-blue-800">
          {data ? JSON.stringify(data, null, 2) : "Sin datos todavía."}
        </pre>
      )}
    </section>
  );
}