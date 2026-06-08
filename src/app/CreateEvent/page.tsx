"use client";

import { FormEvent, useState } from "react";
import { AppShell } from "@/components/AppShell";
import { getStoredToken, postLegacy } from "@/lib/apiClient";

interface CreateEventResponse {
  code?: boolean;
  Code?: boolean;
  message?: string;
  Message?: string;
}

interface EventForm {
  IdOrganizer: string;
  Name: string;
  IdEventCategory: string;
  Description: string;
  keyWords: string;
  NamePlace: string;
  Street: string;
  NumExt: string;
  IdState: string;
  IdNeighborhood: string;
  LinkMap: string;
  Latitude: string;
  Longitude: string;
  EventDate: string;
  EventDateEnd: string;
  Address: string;
  IdStatus: string;
  EventOwner: string;
}

const initialForm: EventForm = {
  IdOrganizer: "",
  Name: "",
  IdEventCategory: "",
  Description: "",
  keyWords: "",
  NamePlace: "",
  Street: "",
  NumExt: "",
  IdState: "",
  IdNeighborhood: "",
  LinkMap: "",
  Latitude: "",
  Longitude: "",
  EventDate: "",
  EventDateEnd: "",
  Address: "",
  IdStatus: "",
  EventOwner: "",
};

function getLocalOrganizerId() {
  if (typeof window === "undefined") return "";

  const storedIdOrganizer = localStorage.getItem("IdOrganizer");
  return storedIdOrganizer && Number(storedIdOrganizer) > 0 ? storedIdOrganizer : "";
}

function FieldIcon({ children }: { children: string }) {
  return (
    <span className="flex h-8 w-8 shrink-0 items-center justify-center text-xl text-[#111827]">
      {children}
    </span>
  );
}

function TextField({
  label,
  required,
  icon,
  value,
  placeholder,
  type = "text",
  onChange,
}: {
  label: string;
  required?: boolean;
  icon: string;
  value: string;
  placeholder: string;
  type?: string;
  onChange: (value: string) => void;
}) {
  return (
    <label className="flex min-h-[58px] items-center gap-3 rounded-lg border border-[#d9dee3] bg-white px-3 transition focus-within:border-[#5b2de2] focus-within:shadow-sm">
      <FieldIcon>{icon}</FieldIcon>

      <div className="flex w-full flex-col">
        <span className="text-sm font-medium text-[#8b8797]">
          {required ? <span className="text-red-500">* </span> : null}
          {label}
        </span>

        <input
          type={type}
          value={value}
          placeholder={placeholder}
          onChange={(event) => onChange(event.target.value)}
          className="w-full border-none bg-transparent text-sm font-medium text-black outline-none placeholder:text-black"
        />
      </div>
    </label>
  );
}

function TextAreaField({
  label,
  required,
  value,
  placeholder,
  onChange,
}: {
  label: string;
  required?: boolean;
  value: string;
  placeholder: string;
  onChange: (value: string) => void;
}) {
  return (
    <label className="flex min-h-[150px] items-start gap-3 border border-[#d9dee3] bg-white px-3 py-4 transition focus-within:border-[#5b2de2] focus-within:shadow-sm">
      <FieldIcon>▣</FieldIcon>

      <div className="flex w-full flex-col">
        <span className="text-sm font-medium text-[#8b8797]">
          {required ? <span className="text-red-500">* </span> : null}
          {label}
        </span>

        <textarea
          value={value}
          placeholder={placeholder}
          onChange={(event) => onChange(event.target.value)}
          className="min-h-[100px] w-full resize-none border-none bg-transparent text-sm font-medium text-black outline-none placeholder:text-black"
        />
      </div>
    </label>
  );
}

function UploadBox({
  title,
  size,
}: {
  title: string;
  size: string;
}) {
  return (
    <div className="grid h-[158px] grid-cols-2 overflow-hidden rounded-lg border-2 border-dashed border-[#4b5563] bg-white">
      <div className="flex flex-col items-center justify-center border-r-2 border-dashed border-[#4b5563] text-center">
        <div className="mb-2 text-2xl text-[#7aa7ff]">▧</div>
        <p className="text-sm font-medium text-black">
          <span className="text-red-500">* </span>
          {title}
        </p>
        <p className="text-sm font-extrabold text-black">{size}</p>
      </div>

      <div className="flex items-center justify-center text-sm font-medium text-[#8b8797]">
        Vista previa
      </div>
    </div>
  );
}

export default function Page() {
  const [form, setForm] = useState<EventForm>(() => ({
    ...initialForm,
    IdOrganizer: getLocalOrganizerId(),
    IdStatus: "1",
  }));

  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  function updateField(name: keyof EventForm, value: string) {
    setForm((current) => ({
      ...current,
      [name]: value,
    }));
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setMessage("");
    setError("");

    try {
      const response = await postLegacy<CreateEventResponse>(
        "CreateEvent",
        {
          IdOrganizer: Number(form.IdOrganizer),
          Name: form.Name,
          IdEventCategory: Number(form.IdEventCategory),
          Description: form.Description,
          keyWords: form.keyWords,
          NamePlace: form.NamePlace,
          Street: form.Street,
          NumExt: form.NumExt,
          IdState: Number(form.IdState),
          IdNeighborhood: Number(form.IdNeighborhood),
          LinkMap: form.LinkMap,
          Latitude: form.Latitude,
          Longitude: form.Longitude,
          EventDate: form.EventDate,
          EventDateEnd: form.EventDateEnd,
          Address: form.Address,
          IdStatus: Number(form.IdStatus),
          EventOwner: form.EventOwner,
        },
        getStoredToken()
      );

      const success = response.code ?? response.Code ?? false;
      const responseMessage = response.message ?? response.Message ?? "";

      if (!success) {
        setError(responseMessage || "No se pudo crear el evento");
        return;
      }

      setMessage(responseMessage || "Evento creado correctamente");
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
    } finally {
      setLoading(false);
    }
  }

  return (
    <AppShell>
      <section className="min-h-screen bg-white px-6 py-8">
        <form
          onSubmit={handleSubmit}
          className="mx-auto w-full max-w-[860px]"
        >
          <div className="mb-8 flex items-center justify-end gap-16 text-sm font-medium">
            <button
              type="button"
              onClick={() => setStep(1)}
              className={step === 1 ? "border-b-2 border-[#0d8cff] pb-2 text-[#8b8797]" : "pb-2 text-black"}
            >
              1. Detalle del evento
            </button>

            <button
              type="button"
              onClick={() => setStep(2)}
              className={step === 2 ? "border-b-2 border-[#0d8cff] pb-2 text-[#8b8797]" : "pb-2 text-black"}
            >
              2. Boleto
            </button>

            <button
              type="button"
              onClick={() => setStep(3)}
              className={step === 3 ? "border-b-2 border-[#0d8cff] pb-2 text-[#8b8797]" : "pb-2 text-black"}
            >
              3. Publicación
            </button>
          </div>

          <h1 className="mb-5 text-[28px] font-extrabold text-black">
            Crear nuevo evento
          </h1>

          <h2 className="mb-4 text-xl font-extrabold text-black">
            Información básica
          </h2>

          {error ? (
            <div className="mb-5 rounded-lg bg-red-50 px-4 py-3 text-sm font-medium text-red-700">
              {error}
            </div>
          ) : null}

          {message ? (
            <div className="mb-5 rounded-lg bg-green-50 px-4 py-3 text-sm font-medium text-green-700">
              {message}
            </div>
          ) : null}

          <div className="space-y-5">
            <TextField
              label="IdOrganizer"
              required
              icon="◎"
              value={form.IdOrganizer}
              placeholder="Id del organizador"
              type="number"
              onChange={(value) => updateField("IdOrganizer", value)}
            />

            <TextField
              label="Nombre del evento"
              required
              icon="▣"
              value={form.Name}
              placeholder="Escribe el nombre del evento"
              onChange={(value) => updateField("Name", value)}
            />

            <TextField
              label="Categoría"
              required
              icon="▦"
              value={form.IdEventCategory}
              placeholder="Id de categoría"
              type="number"
              onChange={(value) => updateField("IdEventCategory", value)}
            />

            <TextAreaField
              label="Descripción del evento"
              required
              value={form.Description}
              placeholder="Escribe una descripción del evento"
              onChange={(value) => updateField("Description", value)}
            />

            <TextField
              label="Etiquetas del evento"
              required
              icon="◇"
              value={form.keyWords}
              placeholder="Añade palabras clave del evento"
              onChange={(value) => updateField("keyWords", value)}
            />
          </div>

          <h2 className="mb-4 mt-8 text-xl font-extrabold text-black">
            Imagen del evento
          </h2>

          <div className="mb-4 flex items-center gap-8 text-sm font-medium text-[#8b8797]">
            <span>ⓘ</span>
            <span>Tamaño máximo 5 MB</span>
            <span>Imágenes soportadas JPEG o PNG</span>
          </div>

          <div className="space-y-4">
            <UploadBox title="Subir imagen para app" size="800 x 800 px" />
            <UploadBox title="Subir imagen para web" size="1000px x 300 px" />
          </div>

          <div className="my-10 border-t border-[#d9dee3]" />

          <h2 className="mb-4 text-xl font-extrabold text-black">
            Locación
          </h2>

          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <TextField
              label="Nombre del lugar"
              required
              icon="⌖"
              value={form.NamePlace}
              placeholder="Escribe el nombre del lugar"
              onChange={(value) => updateField("NamePlace", value)}
            />

            <TextField
              label="Número interior"
              icon="▦"
              value={form.Address}
              placeholder="Escribe el número interior"
              onChange={(value) => updateField("Address", value)}
            />

            <TextField
              label="Estado"
              required
              icon="▱"
              value={form.IdState}
              placeholder="Estado"
              type="number"
              onChange={(value) => updateField("IdState", value)}
            />

            <TextField
              label="Colonia"
              required
              icon="▱"
              value={form.IdNeighborhood}
              placeholder="Colonia"
              type="number"
              onChange={(value) => updateField("IdNeighborhood", value)}
            />

            <TextField
              label="Calle"
              required
              icon="▱"
              value={form.Street}
              placeholder="Ej.14"
              onChange={(value) => updateField("Street", value)}
            />

            <TextField
              label="Número exterior"
              required
              icon="▦"
              value={form.NumExt}
              placeholder="Escribe el número exterior"
              onChange={(value) => updateField("NumExt", value)}
            />

            <TextField
              label="Link mapa"
              icon="⌖"
              value={form.LinkMap}
              placeholder="Link del mapa"
              onChange={(value) => updateField("LinkMap", value)}
            />

            <TextField
              label="Latitud"
              icon="⌖"
              value={form.Latitude}
              placeholder="Latitud"
              onChange={(value) => updateField("Latitude", value)}
            />

            <TextField
              label="Longitud"
              icon="⌖"
              value={form.Longitude}
              placeholder="Longitud"
              onChange={(value) => updateField("Longitude", value)}
            />

            <TextField
              label="Responsable"
              icon="◎"
              value={form.EventOwner}
              placeholder="Responsable del evento"
              onChange={(value) => updateField("EventOwner", value)}
            />
          </div>

          <div className="mt-6 flex items-start gap-4 text-sm font-medium leading-5 text-[#8b8797]">
            <span className="text-xl">ⓘ</span>
            <p>
              Para agregar el pin dentro del mapa, por favor haz zoom en la ubicación,
              y desplaza el pin sobre el lugar exacto al que deseas señalar.
            </p>
          </div>

          <div className="mt-36">
            <h2 className="mb-4 text-xl font-extrabold text-black">
              Fecha y hora
            </h2>

            <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
              <TextField
                label="Fecha y hora de inicio"
                required
                icon="□"
                type="datetime-local"
                value={form.EventDate}
                placeholder=""
                onChange={(value) => updateField("EventDate", value)}
              />

              <TextField
                label="Fecha y hora de finalización"
                required
                icon="□"
                type="datetime-local"
                value={form.EventDateEnd}
                placeholder=""
                onChange={(value) => updateField("EventDateEnd", value)}
              />
            </div>
          </div>

          <div className="my-10 border-t border-[#d9dee3]" />

          <div className="flex justify-end">
            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-lg bg-[#5b2de2] px-8 py-4 text-base font-extrabold text-white transition hover:bg-[#4b24c9] disabled:cursor-not-allowed disabled:opacity-60 md:w-[290px]"
            >
              {loading ? "Guardando..." : "Guardar y continuar"}
            </button>
          </div>
        </form>
      </section>
    </AppShell>
  );
}