"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { setSessionValues } from "@/lib/apiClient";

export default function LoginPage() {
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [Pass, setPass] = useState("");
  const [IsAdmin, setIsAdmin] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    setLoading(true);
    setError("");

    try {
      const acuraUsersApiUrl = process.env.NEXT_PUBLIC_ACURA_USERS_API_URL;

      if (!acuraUsersApiUrl) {
        setError("Missing NEXT_PUBLIC_ACURA_USERS_API_URL");
        return;
      }

      const response = await fetch(`${acuraUsersApiUrl}/api/LogIn`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email,
          Pass,
          IsAdmin,
        }),
      });

      const data = await response.json();

      if (!response.ok || data?.code === false || data?.Code === false) {
        setError(
          data?.message ||
          data?.Message ||
          "Usuario y/o contraseña incorrectos"
        );
        return;
      }

      setSessionValues(data);
      router.push("/DashBoard");
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-[#f4f6fb] px-4 py-8">
      <section className="w-full max-w-[440px] rounded-2xl bg-white px-8 py-9 shadow-[0_18px_45px_rgba(15,23,42,0.12)]">
        <div className="mb-8 flex justify-center">
          <img
            src="/img/EventizeLogin.png"
            alt="Eventize"
            className="w-[190px] max-w-full object-contain"
          />
        </div>

        <h3 className="mb-6 text-center text-2xl font-semibold text-slate-900">
          Inicia sesión
        </h3>

        <form onSubmit={submit} className="space-y-5">
          <div className="space-y-2">
            <label className="block text-sm font-medium text-slate-700">
              Email
            </label>

            <input
              type="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              required
              className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-slate-900 focus:ring-2 focus:ring-slate-900/10"
            />
          </div>

          <div className="space-y-2">
            <label className="block text-sm font-medium text-slate-700">
              Contraseña
            </label>

            <input
              type="password"
              value={Pass}
              onChange={(event) => setPass(event.target.value)}
              required
              className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-slate-900 focus:ring-2 focus:ring-slate-900/10"
            />
          </div>

          <label className="flex items-center gap-2 text-sm text-slate-700">
            <input
              type="checkbox"
              checked={IsAdmin}
              onChange={(event) => setIsAdmin(event.target.checked)}
              className="h-4 w-4 rounded border-slate-300 accent-slate-900"
            />
            Acceso administrador
          </label>

          {error ? (
            <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
              {error}
            </div>
          ) : null}

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-xl bg-slate-900 px-4 py-3 text-sm font-semibold text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {loading ? "Entrando..." : "Entrar"}
          </button>
        </form>

        <div className="mt-5 text-center">
          <a
            href="/RecoverPassword"
            className="text-sm font-medium text-slate-700 hover:text-slate-950 hover:underline"
          >
            Recuperar contraseña
          </a>
        </div>
      </section>
    </main>
  );
}