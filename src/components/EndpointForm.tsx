"use client";

import { useMemo, useState } from "react";
import { getStoredToken, postLegacy } from "@/lib/apiClient";
import type { LegacyEndpoint } from "@/lib/endpoints";

type Field = { name: string; label?: string; type?: string; placeholder?: string; required?: boolean; defaultValue?: string | number | boolean; options?: { label: string; value: string | number }[] };

export function EndpointForm({ title, description, endpoint, fields, submitLabel = "Guardar", onSuccess }: { title: string; description?: string; endpoint: LegacyEndpoint; fields: Field[]; submitLabel?: string; onSuccess?: (data: unknown) => void }) {
  const initialValue = useMemo(() => Object.fromEntries(fields.map((field) => [field.name, field.defaultValue ?? ""])), [fields]);
  const [form, setForm] = useState<Record<string, any>>(initialValue);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<string>("");
  const [error, setError] = useState<string>("");

  async function submit(event: React.FormEvent) {
    event.preventDefault();
    setLoading(true);
    setResult("");
    setError("");
    try {
      const data = await postLegacy(endpoint, form, getStoredToken());
      setResult(JSON.stringify(data, null, 2));
      onSuccess?.(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
    } finally {
      setLoading(false);
    }
  }

  return (
    <section className="acura-card">
      <h3 className="Iniciosesion">{title}</h3>
      {description ? <p className="text-muted">{description}</p> : null}
      <form onSubmit={submit}>
        <div className="acura-grid">
          {fields.map((field) => (
            <div className="acura-field" key={field.name}>
              <label htmlFor={field.name}>{field.label || field.name}</label>
              {field.options ? (
                <select id={field.name} value={String(form[field.name] ?? "")} required={field.required} onChange={(e) => setForm((prev) => ({ ...prev, [field.name]: e.target.value }))}>
                  <option value="">Selecciona una opción</option>
                  {field.options.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}
                </select>
              ) : field.type === "textarea" ? (
                <textarea id={field.name} value={String(form[field.name] ?? "")} required={field.required} placeholder={field.placeholder} rows={4} onChange={(e) => setForm((prev) => ({ ...prev, [field.name]: e.target.value }))} />
              ) : (
                <input id={field.name} type={field.type || "text"} value={String(form[field.name] ?? "")} required={field.required} placeholder={field.placeholder} onChange={(e) => setForm((prev) => ({ ...prev, [field.name]: field.type === "number" ? Number(e.target.value) : e.target.value }))} />
              )}
            </div>
          ))}
        </div>
        <button className="acura-button" disabled={loading}>{loading ? "Procesando..." : submitLabel}</button>
      </form>
      {error ? <pre className="acura-alert acura-error">{error}</pre> : null}
      {result ? <pre className="acura-alert">{result}</pre> : null}
    </section>
  );
}
