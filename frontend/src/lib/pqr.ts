import { api } from "./api";

export type PqrTipo = "peticion" | "queja" | "reclamo" | "sugerencia" | "felicitacion";
export type PqrEstado = "radicado" | "en_tramite" | "respondido" | "cerrado";
export type TipoDocumento = "CC" | "CE" | "NIT" | "PAS";

export const PQR_TIPOS: { value: PqrTipo; label: string; desc: string }[] = [
  { value: "peticion", label: "Petición", desc: "Solicitud de información, documentos o una gestión." },
  { value: "queja", label: "Queja", desc: "Inconformidad con la atención de un colaborador o un servicio." },
  { value: "reclamo", label: "Reclamo", desc: "Inconformidad con un producto, pedido o cobro." },
  { value: "sugerencia", label: "Sugerencia", desc: "Idea para mejorar nuestros productos o servicios." },
  { value: "felicitacion", label: "Felicitación", desc: "Reconocimiento a un producto o a nuestro equipo." },
];

export const PQR_ESTADOS: { value: PqrEstado; label: string }[] = [
  { value: "radicado", label: "Radicado" },
  { value: "en_tramite", label: "En trámite" },
  { value: "respondido", label: "Respondido" },
  { value: "cerrado", label: "Cerrado" },
];

export const tipoLabel = (t: string) => PQR_TIPOS.find((x) => x.value === t)?.label ?? t;
export const estadoLabel = (e: string) => PQR_ESTADOS.find((x) => x.value === e)?.label ?? e;

export interface PqrCreate {
  tipo: PqrTipo;
  nombre: string;
  tipo_documento: TipoDocumento;
  numero_documento: string;
  email: string;
  telefono?: string;
  asunto: string;
  descripcion: string;
  referencia_pedido?: string;
  acepta_tratamiento_datos: true;
}

export interface PqrCreated {
  radicado: string;
  fecha_radicacion: string;
  fecha_limite_respuesta: string;
  estado: PqrEstado;
}

export interface PqrConsulta {
  radicado: string;
  tipo: PqrTipo;
  asunto: string;
  descripcion: string;
  estado: PqrEstado;
  fecha_radicacion: string;
  fecha_limite_respuesta: string;
  respuesta: string | null;
  fecha_respuesta: string | null;
}

export interface PqrAdmin {
  id: number;
  radicado: string;
  tipo: PqrTipo;
  estado: PqrEstado;
  nombre: string;
  tipo_documento: TipoDocumento;
  numero_documento: string;
  email: string;
  telefono: string | null;
  asunto: string;
  descripcion: string;
  referencia_pedido: string | null;
  fecha_radicacion: string;
  fecha_limite_respuesta: string;
  respuesta: string | null;
  fecha_respuesta: string | null;
}

export const radicarPqr = (b: PqrCreate) => api.post<PqrCreated>("/pqr", b);
export const consultarPqr = (radicado: string, documento: string) =>
  api.get<PqrConsulta>(`/pqr/consulta?radicado=${encodeURIComponent(radicado)}&documento=${encodeURIComponent(documento)}`);
export const listarPqr = (estado?: string, tipo?: string) => {
  const p = new URLSearchParams();
  if (estado) p.set("estado", estado);
  if (tipo) p.set("tipo", tipo);
  const qs = p.toString();
  return api.get<PqrAdmin[]>(`/pqr${qs ? `?${qs}` : ""}`);
};
export const actualizarPqr = (id: number, b: { estado?: PqrEstado; respuesta?: string }) =>
  api.patch<PqrAdmin>(`/pqr/${id}`, b);

/** Días hábiles (lun–vie, sin festivos) desde hoy hasta la fecha. Negativo = vencida. */
export function businessDaysLeft(deadlineIso: string): number {
  const end = new Date(deadlineIso); end.setHours(0, 0, 0, 0);
  const cur = new Date(); cur.setHours(0, 0, 0, 0);
  if (end.getTime() === cur.getTime()) return 0;
  const dir = end > cur ? 1 : -1;
  let n = 0;
  const d = new Date(cur);
  while (d.getTime() !== end.getTime()) {
    d.setDate(d.getDate() + dir);
    const w = d.getDay();
    if (w !== 0 && w !== 6) n += dir;
  }
  return n;
}

export const fmtFecha = (iso: string) =>
  new Date(iso).toLocaleDateString("es-CO", { day: "2-digit", month: "long", year: "numeric" });
