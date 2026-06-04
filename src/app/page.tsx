"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { setSessionValues } from "@/lib/apiClient";

export default function LoginPage() {
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [Pass, setPass] = useState("");
  const [IsAdmin, setIsAdmin] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
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
    <main className="min-h-screen bg-white">
      <div className="grid min-h-screen grid-cols-1 lg:grid-cols-[30%_70%]">
        <section className="hidden items-center justify-center bg-gradient-to-br from-[#09c866] via-[#35e881] to-[#6aff9c] lg:flex">
          <img
            src="/img/eventize.png"
            alt="Ixevent"
            className="w-[280px] max-w-[70%] object-contain"
          />
        </section>

        <section className="flex min-h-screen items-center justify-center px-6 py-10">
          <div className="w-full max-w-[760px]">
            <div className="mb-10 flex justify-center lg:hidden">
              <img
                src="/img/eventize.png"
                alt="Ixevent"
                className="w-[220px] object-contain"
              />
            </div>

            <h1 className="mb-4 text-[30px] font-extrabold text-black">
              Inicia sesión
            </h1>

            <form onSubmit={submit} className="space-y-3">
              <div className="relative">
                <span className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-black">
                  <svg
                    width="24"
                    height="24"
                    viewBox="0 0 24 24"
                    fill="none"
                    aria-hidden="true"
                  >
                    <path
                      d="M4 6.5H20V17.5H4V6.5Z"
                      stroke="currentColor"
                      strokeWidth="1.8"
                      strokeLinejoin="round"
                    />
                    <path
                      d="M4.5 7L12 13L19.5 7"
                      stroke="currentColor"
                      strokeWidth="1.8"
                      strokeLinejoin="round"
                    />
                  </svg>
                </span>

                <input
                  type="email"
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  required
                  placeholder="Correo electrónico"
                  className="h-[58px] w-full rounded-lg border border-[#d8dce5] bg-white pl-14 pr-4 text-sm text-slate-900 outline-none transition placeholder:text-[#8c8f99] focus:border-[#5b2ce6] focus:ring-2 focus:ring-[#5b2ce6]/10"
                />
              </div>

              <div className="relative">
                <span className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-black">
                  <svg
                    width="25"
                    height="25"
                    viewBox="0 0 24 24"
                    fill="none"
                    aria-hidden="true"
                  >
                    <path
                      d="M6.5 10H17.5C18.3284 10 19 10.6716 19 11.5V18C19 18.8284 18.3284 19.5 17.5 19.5H6.5C5.67157 19.5 5 18.8284 5 18V11.5C5 10.6716 5.67157 10 6.5 10Z"
                      stroke="currentColor"
                      strokeWidth="1.8"
                    />
                    <path
                      d="M8 10V7.5C8 5.29086 9.79086 3.5 12 3.5C14.2091 3.5 16 5.29086 16 7.5V10"
                      stroke="currentColor"
                      strokeWidth="1.8"
                    />
                  </svg>
                </span>

                <input
                  type={showPassword ? "text" : "password"}
                  value={Pass}
                  onChange={(event) => setPass(event.target.value)}
                  required
                  className="h-[58px] w-full rounded-lg border border-[#d8dce5] bg-white pl-14 pr-14 text-sm text-slate-900 outline-none transition focus:border-[#5b2ce6] focus:ring-2 focus:ring-[#5b2ce6]/10"
                />

                <button
                  type="button"
                  onClick={() => setShowPassword((value) => !value)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 cursor-pointer text-[#8c8f99] transition hover:text-black"
                  aria-label={
                    showPassword ? "Ocultar contraseña" : "Mostrar contraseña"
                  }
                >
                  {showPassword ? (
                    <svg
                      width="22"
                      height="22"
                      viewBox="0 0 24 24"
                      fill="none"
                      aria-hidden="true"
                    >
                      <path
                        d="M2.5 12C4.5 7.8 7.7 5.7 12 5.7C16.3 5.7 19.5 7.8 21.5 12C19.5 16.2 16.3 18.3 12 18.3C7.7 18.3 4.5 16.2 2.5 12Z"
                        stroke="currentColor"
                        strokeWidth="1.7"
                      />
                      <path
                        d="M12 15A3 3 0 1 0 12 9A3 3 0 0 0 12 15Z"
                        stroke="currentColor"
                        strokeWidth="1.7"
                      />
                    </svg>
                  ) : (
                    <svg
                      width="22"
                      height="22"
                      viewBox="0 0 24 24"
                      fill="none"
                      aria-hidden="true"
                    >
                      <path
                        d="M3 3L21 21"
                        stroke="currentColor"
                        strokeWidth="1.7"
                        strokeLinecap="round"
                      />
                      <path
                        d="M10.6 5.85C11.05 5.75 11.52 5.7 12 5.7C16.3 5.7 19.5 7.8 21.5 12C20.9 13.26 20.18 14.34 19.35 15.22"
                        stroke="currentColor"
                        strokeWidth="1.7"
                        strokeLinecap="round"
                      />
                      <path
                        d="M16.1 16.65C14.89 17.75 13.52 18.3 12 18.3C7.7 18.3 4.5 16.2 2.5 12C3.46 9.98 4.7 8.44 6.23 7.38"
                        stroke="currentColor"
                        strokeWidth="1.7"
                        strokeLinecap="round"
                      />
                      <path
                        d="M9.9 9.9C9.35 10.44 9 11.18 9 12A3 3 0 0 0 12 15C12.82 15 13.56 14.65 14.1 14.1"
                        stroke="currentColor"
                        strokeWidth="1.7"
                        strokeLinecap="round"
                      />
                    </svg>
                  )}
                </button>
              </div>

              <div className="flex items-center justify-between pt-1">
                <label className="flex items-center gap-3 text-sm font-medium text-black">
                  <input
                    type="checkbox"
                    checked={IsAdmin}
                    onChange={(event) => setIsAdmin(event.target.checked)}
                    className="h-6 w-6 rounded border-[#b8beca] accent-[#5b2ce6]"
                  />
                  Recordarme
                </label>

                <a
                  href="/RecoverPassword"
                  className="text-sm font-medium text-black transition hover:text-[#5b2ce6] hover:underline"
                >
                  ¿Olvidaste la contraseña?
                </a>
              </div>

              {error ? (
                <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                  {error}
                </div>
              ) : null}

              <button
                type="submit"
                disabled={loading}
                className="h-[58px] w-full cursor-pointer rounded-lg bg-[#5b2ce6] px-4 text-base font-bold text-white transition hover:bg-[#4b22c8] disabled:cursor-not-allowed disabled:opacity-60"
              >
                {loading ? "Ingresando..." : "Ingresar"}
              </button>
            </form>
          </div>
        </section>
      </div>
    </main>
  );
}