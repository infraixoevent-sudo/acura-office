"use client";

import { FormEvent, ReactNode, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Swal from "sweetalert2";
import { AppShell } from "@/components/AppShell";
import { getLegacy, postLegacy } from "@/lib/apiClient";
import { useSessionGuard } from "@/lib/useSessionGuard";
import type {
  CreateEventR,
  EventCategoryItem,
  EventCategoryR,
  GetNeighborhoodsByZipCodeR,
  NeighborhoodDetails,
  RCreateEvent,
  RNeighborhoodsByZipCode,
} from "@/types/acura";

// Espejo de SaveEvent() en CreateEvent.razor: EventOwner nunca lo captura el
// usuario, siempre viaja hardcodeado — el C# lo ignora de todas formas
// (SPEvents.cs:141, @OwnerEvent="" literal), pero se replica el request tal
// cual lo manda el Blazor original.
const EVENT_OWNER = "EVENT JET";

const MAX_IMAGE_BYTES = 5 * 1024 * 1024;
const ALLOWED_IMAGE_TYPES = ["image/jpeg", "image/png", "image/jpg"];

interface EventForm {
  Name: string;
  IdEventCategory: string;
  Description: string;
  KeyWords: string;
  NamePlace: string;
  NumInt: string;
  ZipCode: string;
  IdState: string;
  StateDescription: string;
  Municipality: string;
  IdNeighborhood: string;
  Street: string;
  NumExt: string;
  LinkMap: string;
  Latitude: string;
  Longitude: string;
  EventDate: string;
  EventDateEnd: string;
}

const initialForm: EventForm = {
  Name: "",
  IdEventCategory: "",
  Description: "",
  KeyWords: "",
  NamePlace: "",
  NumInt: "",
  ZipCode: "",
  IdState: "",
  StateDescription: "",
  Municipality: "",
  IdNeighborhood: "",
  Street: "",
  NumExt: "",
  LinkMap: "",
  Latitude: "",
  Longitude: "",
  EventDate: "",
  EventDateEnd: "",
};

function readFileAsBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const result = String(reader.result ?? "");
      // FileReader.readAsDataURL produce "data:image/png;base64,AAAA..." — el
      // backend espera solo la porción base64 (mismo formato que System.Text.Json
      // serializa un byte[] del C#).
      resolve(result.split(",")[1] ?? "");
    };
    reader.onerror = () => reject(reader.error);
    reader.readAsDataURL(file);
  });
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
  onBlur,
  disabled,
}: {
  label: string;
  required?: boolean;
  icon: string;
  value: string;
  placeholder: string;
  type?: string;
  onChange: (value: string) => void;
  onBlur?: () => void;
  disabled?: boolean;
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
          disabled={disabled}
          onChange={(event) => onChange(event.target.value)}
          onBlur={onBlur}
          className="w-full border-none bg-transparent text-sm font-medium text-black outline-none placeholder:text-black disabled:text-slate-400"
        />
      </div>
    </label>
  );
}

function SelectField({
  label,
  required,
  icon,
  value,
  onChange,
  disabled,
  children,
}: {
  label: string;
  required?: boolean;
  icon: string;
  value: string;
  onChange: (value: string) => void;
  disabled?: boolean;
  children: ReactNode;
}) {
  return (
    <label className="flex min-h-[58px] items-center gap-3 rounded-lg border border-[#d9dee3] bg-white px-3 transition focus-within:border-[#5b2de2] focus-within:shadow-sm">
      <FieldIcon>{icon}</FieldIcon>

      <div className="flex w-full flex-col">
        <span className="text-sm font-medium text-[#8b8797]">
          {required ? <span className="text-red-500">* </span> : null}
          {label}
        </span>

        <select
          value={value}
          disabled={disabled}
          onChange={(event) => onChange(event.target.value)}
          className="w-full border-none bg-transparent text-sm font-medium text-black outline-none disabled:text-slate-400"
        >
          {children}
        </select>
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

function ImagePicker({
  title,
  size,
  preview,
  error,
  onSelect,
}: {
  title: string;
  size: string;
  preview: string | null;
  error: string;
  onSelect: (file: File) => void;
}) {
  return (
    <div>
      <label className="grid h-[158px] cursor-pointer grid-cols-2 overflow-hidden rounded-lg border-2 border-dashed border-[#4b5563] bg-white">
        <input
          type="file"
          accept="image/jpeg,image/png"
          className="hidden"
          onChange={(event) => {
            const file = event.target.files?.[0];
            if (file) onSelect(file);
          }}
        />

        <div className="flex flex-col items-center justify-center border-r-2 border-dashed border-[#4b5563] text-center">
          <div className="mb-2 text-2xl text-[#7aa7ff]">▧</div>
          <p className="text-sm font-medium text-black">
            <span className="text-red-500">* </span>
            {title}
          </p>
          <p className="text-sm font-extrabold text-black">{size}</p>
        </div>

        <div className="flex items-center justify-center overflow-hidden text-sm font-medium text-[#8b8797]">
          {preview ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={preview} alt="Vista previa" className="h-full w-full object-cover" />
          ) : (
            "Vista previa"
          )}
        </div>
      </label>
      {error ? <p className="mt-1 text-xs font-medium text-red-600">{error}</p> : null}
    </div>
  );
}

export default function Page() {
  const router = useRouter();
  const { session, error: sessionError } = useSessionGuard();

  const [form, setForm] = useState<EventForm>(initialForm);
  const [categories, setCategories] = useState<EventCategoryItem[]>([]);
  const [neighborhoods, setNeighborhoods] = useState<NeighborhoodDetails[]>([]);
  const [zipLoading, setZipLoading] = useState(false);
  const [zipError, setZipError] = useState("");

  const [imageAppBase64, setImageAppBase64] = useState<string | null>(null);
  const [imageAppPreview, setImageAppPreview] = useState<string | null>(null);
  const [imageAppError, setImageAppError] = useState("");
  const [imageWebBase64, setImageWebBase64] = useState<string | null>(null);
  const [imageWebPreview, setImageWebPreview] = useState<string | null>(null);
  const [imageWebError, setImageWebError] = useState("");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!session) return;
    getLegacy<EventCategoryR>("GetEventCategory")
      .then((response) => setCategories(response.code ? response.eventCategoriesList ?? [] : []))
      .catch(() => setCategories([]));
  }, [session]);

  function updateField<K extends keyof EventForm>(name: K, value: EventForm[K]) {
    setForm((current) => ({ ...current, [name]: value }));
  }

  async function handleZipBlur() {
    if (!session || form.ZipCode.length !== 5) return;

    setZipLoading(true);
    setZipError("");
    setNeighborhoods([]);

    try {
      const response = await postLegacy<GetNeighborhoodsByZipCodeR, RNeighborhoodsByZipCode>(
        "GetNeighborhoodsByZipCode",
        { ZipCode: form.ZipCode },
        session.token
      );

      if (!response.code) {
        setZipError(response.message || "No se encontraron colonias para ese código postal");
        return;
      }

      setNeighborhoods(response.dataZipCode.neighborhoodList);
      setForm((current) => ({
        ...current,
        IdState: String(response.dataZipCode.idState),
        StateDescription: response.dataZipCode.state,
        Municipality: response.dataZipCode.municipality,
        IdNeighborhood: "",
      }));
    } catch (err) {
      setZipError(err instanceof Error ? err.message : String(err));
    } finally {
      setZipLoading(false);
    }
  }

  async function handleImageSelected(
    file: File,
    setBase64: (value: string) => void,
    setPreview: (value: string) => void,
    setFieldError: (value: string) => void
  ) {
    setFieldError("");

    if (!ALLOWED_IMAGE_TYPES.includes(file.type)) {
      setFieldError("Solo se permiten imágenes JPEG o PNG");
      return;
    }
    if (file.size > MAX_IMAGE_BYTES) {
      setFieldError("El tamaño máximo permitido es 5 MB");
      return;
    }

    const base64 = await readFileAsBase64(file);
    setBase64(base64);
    setPreview(URL.createObjectURL(file));
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!session) return;

    setError("");

    // Espejo de las validaciones de SaveEvent() en CreateEvent.razor.
    if (!form.Name || !form.IdEventCategory || !form.Description || !form.KeyWords) {
      setError("Completa el nombre, categoría, descripción y etiquetas del evento");
      return;
    }
    if (!imageAppBase64 || !imageWebBase64) {
      setError("Sube ambas imágenes del evento");
      return;
    }
    if (!form.NamePlace || !form.Street || !form.NumExt || !form.ZipCode || !form.IdNeighborhood) {
      setError("Completa la ubicación del evento, incluyendo la colonia");
      return;
    }
    if (!form.Latitude || !form.Longitude) {
      setError("Indica la latitud y longitud del lugar");
      return;
    }
    if (!form.EventDate || !form.EventDateEnd) {
      setError("Indica la fecha y hora de inicio y fin del evento");
      return;
    }
    if (new Date(form.EventDate).getTime() <= Date.now()) {
      setError("La fecha de inicio debe ser mayor a la fecha actual");
      return;
    }
    if (new Date(form.EventDateEnd).getTime() <= new Date(form.EventDate).getTime()) {
      setError("La fecha de finalización debe ser mayor a la fecha de inicio");
      return;
    }

    setLoading(true);

    try {
      const address = `${form.Street} ${form.NumExt}, ${form.Municipality}, ${form.ZipCode}, ${form.StateDescription}`;

      const request: RCreateEvent = {
        IdOrganizer: session.idOrganizer,
        Name: form.Name,
        IdEventCategory: Number(form.IdEventCategory),
        Description: form.Description,
        KeyWords: form.KeyWords,
        NamePlace: form.NamePlace,
        Street: form.Street,
        NumExt: form.NumExt,
        NumInt: form.NumInt || undefined,
        IdState: Number(form.IdState),
        StateDescription: form.StateDescription,
        IdNeighborhood: Number(form.IdNeighborhood),
        LinkMap: form.LinkMap,
        Latitude: form.Latitude,
        Longitude: form.Longitude,
        EventDate: form.EventDate,
        EventDateEnd: form.EventDateEnd,
        Address: address,
        IdStatus: 1,
        EventOwner: EVENT_OWNER,
        EventMobileImage: imageAppBase64,
        EventImage: imageWebBase64,
      };

      const response = await postLegacy<CreateEventR, RCreateEvent>(
        "CreateEvent",
        request,
        session.token
      );

      if (!response.code) {
        setError(response.message || "No se pudo crear el evento");
        return;
      }

      localStorage.setItem("IdEvent", String(response.idEvent));

      await Swal.fire({
        title: "¡Listo!",
        text: response.message || "Evento creado correctamente",
        icon: "success",
        confirmButtonText: "Continuar",
      });

      router.push("/CreateTicket");
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
    } finally {
      setLoading(false);
    }
  }

  if (sessionError) {
    return (
      <AppShell>
        <div className="rounded-xl bg-red-50 p-4 text-sm text-red-700">{sessionError}</div>
      </AppShell>
    );
  }

  if (!session) {
    return (
      <AppShell>
        <p className="py-10 text-center text-sm text-slate-400">Cargando...</p>
      </AppShell>
    );
  }

  return (
    <AppShell>
      <section className="min-h-screen bg-white px-6 py-8">
        <form onSubmit={handleSubmit} className="mx-auto w-full max-w-[860px]">
          <h1 className="mb-5 text-[28px] font-extrabold text-black">Crear nuevo evento</h1>

          <h2 className="mb-4 text-xl font-extrabold text-black">Información básica</h2>

          {error ? (
            <div className="mb-5 rounded-lg bg-red-50 px-4 py-3 text-sm font-medium text-red-700">
              {error}
            </div>
          ) : null}

          <div className="space-y-5">
            <TextField
              label="Nombre del evento"
              required
              icon="▣"
              value={form.Name}
              placeholder="Escribe el nombre del evento"
              onChange={(value) => updateField("Name", value)}
            />

            <SelectField
              label="Categoría"
              required
              icon="▦"
              value={form.IdEventCategory}
              onChange={(value) => updateField("IdEventCategory", value)}
            >
              <option value="">Selecciona una categoría</option>
              {categories.map((category) => (
                <option key={category.id} value={category.id}>
                  {category.description}
                </option>
              ))}
            </SelectField>

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
              value={form.KeyWords}
              placeholder="Añade palabras clave del evento"
              onChange={(value) => updateField("KeyWords", value)}
            />
          </div>

          <h2 className="mb-4 mt-8 text-xl font-extrabold text-black">Imagen del evento</h2>

          <div className="mb-4 flex flex-wrap items-center gap-x-8 gap-y-1 text-sm font-medium text-[#8b8797]">
            <span>ⓘ</span>
            <span>Tamaño máximo 5 MB</span>
            <span>Imágenes soportadas JPEG o PNG</span>
          </div>

          <div className="mb-2 flex items-start gap-3 rounded-lg bg-amber-50 px-4 py-3 text-sm text-amber-800">
            <span>⚠</span>
            <p>
              La subida a ACURA-MULTIMEDIA queda pendiente (integración con servicio externo
              estacionada) — la imagen se selecciona y valida aquí, pero todavía no se publica.
            </p>
          </div>

          <div className="space-y-4">
            <ImagePicker
              title="Subir imagen para app"
              size="800 x 800 px"
              preview={imageAppPreview}
              error={imageAppError}
              onSelect={(file) =>
                handleImageSelected(file, setImageAppBase64, setImageAppPreview, setImageAppError)
              }
            />
            <ImagePicker
              title="Subir imagen para web"
              size="1000px x 300 px"
              preview={imageWebPreview}
              error={imageWebError}
              onSelect={(file) =>
                handleImageSelected(file, setImageWebBase64, setImageWebPreview, setImageWebError)
              }
            />
          </div>

          <div className="my-10 border-t border-[#d9dee3]" />

          <h2 className="mb-4 text-xl font-extrabold text-black">Locación</h2>

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
              value={form.NumInt}
              placeholder="Escribe el número interior"
              onChange={(value) => updateField("NumInt", value)}
            />

            <TextField
              label="Código postal"
              required
              icon="▱"
              value={form.ZipCode}
              placeholder="5 dígitos"
              onChange={(value) => updateField("ZipCode", value.replace(/\D/g, "").slice(0, 5))}
              onBlur={handleZipBlur}
            />

            <SelectField
              label="Colonia"
              required
              icon="▱"
              value={form.IdNeighborhood}
              onChange={(value) => updateField("IdNeighborhood", value)}
              disabled={!neighborhoods.length}
            >
              <option value="">
                {zipLoading ? "Buscando..." : "Selecciona una colonia"}
              </option>
              {neighborhoods.map((neighborhood) => (
                <option key={neighborhood.idNeighborhood} value={neighborhood.idNeighborhood}>
                  {neighborhood.description}
                </option>
              ))}
            </SelectField>

            <TextField
              label="Estado"
              icon="▱"
              value={form.StateDescription}
              placeholder="Se completa con el código postal"
              disabled
              onChange={() => {}}
            />

            <TextField
              label="Municipio"
              icon="▱"
              value={form.Municipality}
              placeholder="Se completa con el código postal"
              disabled
              onChange={() => {}}
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
              required
              icon="⌖"
              value={form.Latitude}
              placeholder="Latitud"
              onChange={(value) => updateField("Latitude", value)}
            />

            <TextField
              label="Longitud"
              required
              icon="⌖"
              value={form.Longitude}
              placeholder="Longitud"
              onChange={(value) => updateField("Longitude", value)}
            />
          </div>

          {zipError ? (
            <p className="mt-2 text-sm font-medium text-red-600">{zipError}</p>
          ) : null}

          <div className="mt-6 flex items-start gap-4 text-sm font-medium leading-5 text-[#8b8797]">
            <span className="text-xl">ⓘ</span>
            <p>
              Escribe la latitud y longitud exactas del lugar (el mapa interactivo del
              formulario original queda fuera de este ciclo de migración).
            </p>
          </div>

          <div className="mt-10">
            <h2 className="mb-4 text-xl font-extrabold text-black">Fecha y hora</h2>

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
