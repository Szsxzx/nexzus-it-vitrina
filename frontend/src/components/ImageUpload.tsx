"use client";
/**
 * ImageUpload — Componente reutilizable para subir imágenes al admin.
 * Llama a /api/upload (Next.js route handler) y guarda el archivo en public/img/.
 */
import { useRef, useState } from "react";

interface Props {
  /** URL actual de la imagen (para mostrar preview). Puede ser "" o null. */
  value: string;
  /** Callback con la nueva URL tras subir correctamente. */
  onUpload: (url: string) => void;
  /** Callback para quitar la imagen actual. */
  onClear: () => void;
}

export default function ImageUpload({ value, onUpload, onClear }: Props) {
  const inputRef               = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError]         = useState<string | null>(null);
  const [drag, setDrag]           = useState(false);

  async function upload(file: File) {
    setUploading(true);
    setError(null);
    const form = new FormData();
    form.append("file", file);
    try {
      const res  = await fetch("/api/upload", { method: "POST", body: form });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Error al subir");
      onUpload(data.url);
    } catch (e: any) {
      setError(e.message);
    } finally {
      setUploading(false);
    }
  }

  function onFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const f = e.target.files?.[0];
    if (f) upload(f);
    e.target.value = "";          // permite volver a elegir el mismo archivo
  }

  function onDrop(e: React.DragEvent) {
    e.preventDefault();
    setDrag(false);
    const f = e.dataTransfer.files?.[0];
    if (f) upload(f);
  }

  return (
    <div className="space-y-2">
      {/* Zona de drop / preview */}
      <div
        onDragOver={(e) => { e.preventDefault(); setDrag(true); }}
        onDragLeave={() => setDrag(false)}
        onDrop={onDrop}
        onClick={() => !value && inputRef.current?.click()}
        className={[
          "relative w-full rounded-xl border-2 border-dashed transition-all overflow-hidden",
          drag ? "border-red-400 bg-red-50" : "border-gray-200 bg-gray-50",
          !value ? "cursor-pointer hover:border-red-300 hover:bg-red-50/40" : "",
        ].join(" ")}
        style={{ minHeight: 140 }}
      >
        {value ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={value}
            alt="preview"
            className="w-full h-40 object-cover"
            onError={(e) => { e.currentTarget.src = "/img/placeholder.jpg"; }}
          />
        ) : (
          <div className="flex flex-col items-center justify-center h-36 gap-2 text-gray-400 select-none">
            {uploading ? (
              <>
                <i className="fa-solid fa-spinner fa-spin text-2xl text-red-600" />
                <span className="text-xs">Subiendo imagen...</span>
              </>
            ) : (
              <>
                <i className="fa-solid fa-cloud-arrow-up text-3xl" />
                <span className="text-xs text-center px-4 leading-relaxed">
                  Arrastra una imagen aquí<br />o haz clic para seleccionar
                </span>
                <span className="text-[10px] text-gray-300">JPG · PNG · WEBP — máx 5 MB</span>
              </>
            )}
          </div>
        )}

        {/* Spinner encima del preview mientras sube */}
        {uploading && value && (
          <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
            <i className="fa-solid fa-spinner fa-spin text-white text-2xl" />
          </div>
        )}
      </div>

      {/* Botones */}
      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          disabled={uploading}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-white border border-gray-200 text-gray-600 hover:border-gray-400 hover:text-gray-800 transition disabled:opacity-50"
        >
          <i className="fa-solid fa-folder-open text-xs" />
          {value ? "Cambiar imagen" : "Elegir archivo"}
        </button>

        {value && (
          <button
            type="button"
            onClick={onClear}
            disabled={uploading}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-red-600 border border-red-200 hover:bg-red-50 transition disabled:opacity-50"
          >
            <i className="fa-solid fa-trash text-xs" />
            Quitar
          </button>
        )}

        <input
          ref={inputRef}
          type="file"
          accept="image/jpeg,image/png,image/webp,image/gif"
          className="hidden"
          onChange={onFileChange}
        />
      </div>

      {error && (
        <p className="text-xs text-red-600 flex items-center gap-1.5 mt-1">
          <i className="fa-solid fa-circle-exclamation" /> {error}
        </p>
      )}
    </div>
  );
}
