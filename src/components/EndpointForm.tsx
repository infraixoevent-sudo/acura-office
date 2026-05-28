"use client";

import { useMemo, useState } from "react";
import { getStoredToken, postLegacy } from "@/lib/apiClient";
import type { LegacyEndpoint } from "@/lib/endpoints";

type Field = {
  name: string;
  label?: string;
  type?: string;
  placeholder?: string;
  required?: boolean;
  defaultValue?: string | number | boolean;
  options?: { label: string; value: string | number }[];
};

export function EndpointForm({
  title,
  description,
  endpoint,
  fields,
  submitLabel = "Guardar",
  onSuccess,
}: {
  title: string;
  description?: string;
  endpoint: LegacyEndpoint;
  fields: Field[];
  submitLabel?: string;
  onSuccess?: (data: unknown) => void;
}) {
  const initialValue = useMemo(
    () =>
      Object.fromEntries(
        fields.map((field) => [field.name, field.defaultValue ?? ""])
      ),
    [fields]
  );

  const [form, setForm] = useState<Record<string, any>>(initialValue);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState("");
  const [error, setError] = useState("");

  async function submit(event: React.FormEvent<HTMLFormElement>) {
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
    <section className="rounded-2xl bg-white p-6 shadow-[0_12px_28px_rgba(15,23,42,0.08)]">
      <h3 className="mb-2 text-xl font-semibold text-slate-900">{title}</h3>

      {description ? (
        <p className="mb-5 text-sm text-slate-500">{description}</p>
      ) : null}

      <form onSubmit={submit}>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
          {fields.map((field) => (
            <div key={field.name} className="flex flex-col gap-1.5">
              <label
                htmlFor={field.name}
                className="text-sm font-semibold text-slate-700"
              >
                {field.label || field.name}
              </label>

              {field.options ? (
                <select
                  id={field.name}
                  value={String(form[field.name] ?? "")}
                  required={field.required}
                  onChange={(event) =>
                    setForm((prev) => ({
                      ...prev,
                      [field.name]: event.target.value,
                    }))
                  }
                  className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 outline-none focus:border-slate-900 focus:ring-2 focus:ring-slate-900/10"
                >
                  <option value="">Selecciona una opción</option>
                  {field.options.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              ) : field.type === "textarea" ? (
                <textarea
                  id={field.name}
                  value={String(form[field.name] ?? "")}
                  required={field.required}
                  placeholder={field.placeholder}
                  rows={4}
                  onChange={(event) =>
                    setForm((prev) => ({
                      ...prev,
                      [field.name]: event.target.value,
                    }))
                  }
                  className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 outline-none focus:border-slate-900 focus:ring-2 focus:ring-slate-900/10"
                />
              ) : (
                <input
                  id={field.name}
                  type={field.type || "text"}
                  value={String(form[field.name] ?? "")}
                  required={field.required}
                  placeholder={field.placeholder}
                  onChange={(event) =>
                    setForm((prev) => ({
                      ...prev,
                      [field.name]:
                        field.type === "number"
                          ? Number(event.target.value)
                          : event.target.value,
                    }))
                  }
                  className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 outline-none focus:border-slate-900 focus:ring-2 focus:ring-slate-900/10"
                />
              )}
            </div>
          ))}
        </div>

        <button
          type="submit"
          disabled={loading}
          className="mt-5 rounded-full bg-slate-900 px-5 py-2.5 text-sm font-bold text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {loading ? "Procesando..." : submitLabel}
        </button>
      </form>

      {error ? (
        <pre className="mt-4 whitespace-pre-wrap rounded-xl bg-red-50 p-4 text-sm text-red-700">
          {error}
        </pre>
      ) : null}

      {result ? (
        <pre className="mt-4 max-h-[420px] overflow-auto whitespace-pre-wrap rounded-xl bg-blue-50 p-4 text-sm text-blue-800">
          {result}
        </pre>
      ) : null}
    </section>
  );
}