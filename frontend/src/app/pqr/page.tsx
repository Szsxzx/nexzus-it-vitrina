"use client";
import { Suspense, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import SiteHeader from "@/components/SiteHeader";
import SiteFooter from "@/components/SiteFooter";
import type { ApiError } from "@/lib/api";
import {
  PQR_ESTADOS, PQR_TIPOS, consultarPqr, estadoLabel, fmtFecha, radicarPqr, tipoLabel,
  type PqrConsulta, type PqrCreated, type PqrTipo, type TipoDocumento,
} from "@/lib/pqr";
import { Alert, btnOutline, btnPrimary, describedBy, FormField, inputCls, Spinner } from "@/lib/formUi";

const MAX_DESC = 3000;
const DOC_TYPES: { v: TipoDocumento; l: string }[] = [
  { v: "CC", l: "Cédula de ciudadanía" },
  { v: "CE", l: "Cédula de extranjería" },
  { v: "NIT", l: "NIT" },
  { v: "PAS", l: "Pasaporte" },
];

type Tab = "radicar" | "consultar";

function PqrContent() {
  const params = useSearchParams();
  const radicadoParam = params.get("radicado") ?? "";
  const [tab, setTab] = useState<Tab>(radicadoParam ? "consultar" : "radicar");
  const [prefill, setPrefill] = useState(radicadoParam);
  const tabRefs = useRef<Record<Tab, HTMLButtonElement | null>>({ radicar: null, consultar: null });

  function onKey(e: React.KeyboardEvent) {
    if (e.key === "ArrowRight" || e.key === "ArrowLeft" || e.key === "Home" || e.key === "End") {
      e.preventDefault();
      const next: Tab = e.key === "Home" ? "radicar" : e.key === "End" ? "consultar" : tab === "radicar" ? "consultar" : "radicar";
      setTab(next);
      tabRefs.current[next]?.focus();
    }
  }
  const tabCls = (t: Tab) =>
    `min-h-[44px] flex-1 rounded-lg px-4 py-2.5 text-base font-semibold transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-accent ${
      tab === t ? "bg-primary text-white shadow-sm" : "text-secondary hover:bg-muted"
    }`;

  return (
    <>
      <div role="tablist" aria-label="Gestión de PQR" onKeyDown={onKey} className="mt-8 flex gap-1 rounded-xl border border-line bg-card p-1 shadow-sm">
        {(["radicar", "consultar"] as Tab[]).map((t) => (
          <button
            key={t} ref={(el) => { tabRefs.current[t] = el; }} role="tab" id={`tab-${t}`}
            aria-selected={tab === t} aria-controls={`panel-${t}`} tabIndex={tab === t ? 0 : -1}
            onClick={() => setTab(t)} className={tabCls(t)}
          >
            <i className={`fa-solid ${t === "radicar" ? "fa-file-pen" : "fa-magnifying-glass"} mr-2`} aria-hidden="true" />
            {t === "radicar" ? "Radicar PQR" : "Consultar PQR"}
          </button>
        ))}
      </div>

      <div role="tabpanel" id="panel-radicar" aria-labelledby="tab-radicar" hidden={tab !== "radicar"} className="mt-6">
        {tab === "radicar" && <RadicarForm onConsultar={(r) => { setPrefill(r); setTab("consultar"); }} />}
      </div>
      <div role="tabpanel" id="panel-consultar" aria-labelledby="tab-consultar" hidden={tab !== "consultar"} className="mt-6">
        {tab === "consultar" && <ConsultaForm initialRadicado={prefill} />}
      </div>
    </>
  );
}

/* ───────────────────────── Radicar ───────────────────────── */

type RErr = Partial<Record<"nombre" | "numero" | "email" | "asunto" | "descripcion" | "consent", string>>;

function RadicarForm({ onConsultar }: { onConsultar: (radicado: string) => void }) {
  const [tipo, setTipo] = useState<PqrTipo>("peticion");
  const [nombre, setNombre] = useState("");
  const [tipoDoc, setTipoDoc] = useState<TipoDocumento>("CC");
  const [numero, setNumero] = useState("");
  const [email, setEmail] = useState("");
  const [telefono, setTelefono] = useState("");
  const [asunto, setAsunto] = useState("");
  const [descripcion, setDescripcion] = useState("");
  const [pedido, setPedido] = useState("");
  const [consent, setConsent] = useState(false);
  const [errors, setErrors] = useState<RErr>({});
  const [loading, setLoading] = useState(false);
  const [serverErr, setServerErr] = useState<string | null>(null);
  const [done, setDone] = useState<PqrCreated | null>(null);
  const [copied, setCopied] = useState(false);

  function validate(): RErr {
    const e: RErr = {};
    if (nombre.trim().length < 3) e.nombre = "Escribe tu nombre completo.";
    if (!/^[A-Za-z0-9.\-]{5,20}$/.test(numero.trim())) e.numero = "Ingresa tu número de documento (5 a 20 caracteres, sin espacios).";
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email.trim())) e.email = "Ingresa un correo válido.";
    if (asunto.trim().length < 5) e.asunto = "Describe el asunto en al menos 5 caracteres.";
    if (descripcion.trim().length < 20) e.descripcion = "Cuéntanos con más detalle (mínimo 20 caracteres).";
    if (descripcion.length > MAX_DESC) e.descripcion = `Máximo ${MAX_DESC} caracteres.`;
    if (!consent) e.consent = "Debes aceptar el tratamiento de datos personales para radicar.";
    return e;
  }

  async function submit(ev: React.FormEvent) {
    ev.preventDefault();
    if (loading) return;
    const e = validate();
    setErrors(e); setServerErr(null);
    if (Object.keys(e).length) {
      const ids: Record<string, string> = { nombre: "pq-nombre", numero: "pq-numero", email: "pq-email", asunto: "pq-asunto", descripcion: "pq-desc", consent: "pq-consent" };
      document.getElementById(ids[Object.keys(e)[0]])?.focus();
      return;
    }
    setLoading(true);
    try {
      const r = await radicarPqr({
        tipo, nombre: nombre.trim(), tipo_documento: tipoDoc, numero_documento: numero.trim(),
        email: email.trim(), telefono: telefono.trim() || undefined, asunto: asunto.trim(),
        descripcion: descripcion.trim(), referencia_pedido: pedido.trim() || undefined,
        acepta_tratamiento_datos: true,
      });
      setDone(r);
      requestAnimationFrame(() => document.getElementById("pq-exito")?.focus());
    } catch (err) {
      const a = err as ApiError;
      setServerErr(a.isNetwork || a.status === 0
        ? "No pudimos conectar con el servidor. Revisa tu conexión e inténtalo de nuevo."
        : a.detail || "No se pudo radicar la solicitud. Inténtalo de nuevo.");
    } finally { setLoading(false); }
  }

  async function copy() {
    if (!done) return;
    try { await navigator.clipboard.writeText(done.radicado); setCopied(true); setTimeout(() => setCopied(false), 2500); } catch { /* sin permiso de portapapeles */ }
  }

  if (done) {
    return (
      <div id="pq-exito" tabIndex={-1} role="status" className="rounded-xl border border-success/30 bg-card p-6 shadow-sm focus:outline-none md:p-10">
        <div className="flex flex-col items-center text-center">
          <span className="flex h-14 w-14 items-center justify-center rounded-full bg-success/10 text-2xl text-success"><i className="fa-solid fa-circle-check" aria-hidden="true" /></span>
          <h2 className="mt-4 font-heading text-2xl font-semibold text-primary">Tu solicitud fue radicada</h2>
          <p className="mt-2 text-secondary">Guarda tu número de radicado: lo necesitarás para consultar el estado.</p>
          <div className="mt-6 w-full max-w-md rounded-xl border border-accent/30 bg-accent-soft p-5">
            <p className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">Número de radicado</p>
            <p className="mt-1 break-all font-heading text-3xl font-semibold tracking-tight text-primary">{done.radicado}</p>
            <button onClick={copy} className={`${btnOutline} mt-4 w-full`} aria-live="polite">
              <i className={`fa-solid ${copied ? "fa-check" : "fa-copy"}`} aria-hidden="true" /> {copied ? "Copiado" : "Copiar radicado"}
            </button>
          </div>
          <dl className="mt-6 w-full max-w-md divide-y divide-line rounded-lg border border-line text-left text-sm">
            <div className="flex justify-between gap-4 px-4 py-3"><dt className="text-muted-foreground">Fecha de radicación</dt><dd>{fmtFecha(done.fecha_radicacion)}</dd></div>
            <div className="flex justify-between gap-4 px-4 py-3"><dt className="text-muted-foreground">Fecha límite de respuesta</dt><dd className="font-semibold">{fmtFecha(done.fecha_limite_respuesta)}</dd></div>
            <div className="flex justify-between gap-4 px-4 py-3"><dt className="text-muted-foreground">Estado</dt><dd>{estadoLabel(done.estado)}</dd></div>
          </dl>
          <div className="mt-6 flex flex-col gap-3 sm:flex-row">
            <button onClick={() => onConsultar(done.radicado)} className={btnPrimary}>Consultar este radicado</button>
            <button onClick={() => { setDone(null); setAsunto(""); setDescripcion(""); setPedido(""); setConsent(false); }} className={btnOutline}>Radicar otra solicitud</button>
          </div>
        </div>
      </div>
    );
  }

  const bind = (id: string, err?: string, hint?: string) => ({
    id, "aria-invalid": err ? true : undefined, "aria-describedby": describedBy(id, hint, err), className: inputCls,
  });

  return (
    <form onSubmit={submit} noValidate className="space-y-6" aria-label="Radicar PQR">
      <fieldset className="rounded-xl border border-line bg-card p-5 shadow-sm md:p-6">
        <legend className="px-1 font-heading text-lg font-semibold text-primary">Tipo de solicitud</legend>
        <div className="mt-3 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {PQR_TIPOS.map((t) => (
            <label key={t.value}
              className={`flex min-h-[44px] cursor-pointer items-start gap-3 rounded-lg border p-3.5 transition-colors focus-within:ring-2 focus-within:ring-accent ${
                tipo === t.value ? "border-accent bg-accent-soft" : "border-line hover:border-secondary"}`}>
              <input type="radio" name="pq-tipo" value={t.value} checked={tipo === t.value} onChange={() => setTipo(t.value)} className="mt-1 h-4 w-4 accent-accent" />
              <span>
                <span className="block font-semibold text-primary">{t.label}</span>
                <span className="block text-sm text-muted-foreground">{t.desc}</span>
              </span>
            </label>
          ))}
        </div>
      </fieldset>

      <section className="rounded-xl border border-line bg-card p-5 shadow-sm md:p-6" aria-labelledby="pq-h-datos">
        <h2 id="pq-h-datos" className="font-heading text-lg font-semibold text-primary">Datos personales</h2>
        <div className="mt-5 grid gap-5 md:grid-cols-2">
          <div className="md:col-span-2">
            <FormField id="pq-nombre" label="Nombre completo o razón social" required error={errors.nombre}>
              <input {...bind("pq-nombre", errors.nombre)} value={nombre} onChange={(e) => setNombre(e.target.value)} autoComplete="name" />
            </FormField>
          </div>
          <FormField id="pq-tipodoc" label="Tipo de documento" required>
            <select id="pq-tipodoc" className={inputCls} value={tipoDoc} onChange={(e) => setTipoDoc(e.target.value as TipoDocumento)}>
              {DOC_TYPES.map((d) => <option key={d.v} value={d.v}>{d.l}</option>)}
            </select>
          </FormField>
          <FormField id="pq-numero" label="Número de documento" required error={errors.numero}>
            <input {...bind("pq-numero", errors.numero)} value={numero} onChange={(e) => setNumero(e.target.value)} />
          </FormField>
          <FormField id="pq-email" label="Correo electrónico" required error={errors.email} hint="Te notificaremos la respuesta a este correo.">
            <input {...bind("pq-email", errors.email, "x")} type="email" value={email} onChange={(e) => setEmail(e.target.value)} autoComplete="email" />
          </FormField>
          <FormField id="pq-tel" label="Teléfono">
            <input id="pq-tel" type="tel" className={inputCls} value={telefono} onChange={(e) => setTelefono(e.target.value)} autoComplete="tel" />
          </FormField>
        </div>
      </section>

      <section className="rounded-xl border border-line bg-card p-5 shadow-sm md:p-6" aria-labelledby="pq-h-caso">
        <h2 id="pq-h-caso" className="font-heading text-lg font-semibold text-primary">Tu solicitud</h2>
        <div className="mt-5 space-y-5">
          <FormField id="pq-asunto" label="Asunto" required error={errors.asunto}>
            <input {...bind("pq-asunto", errors.asunto)} maxLength={150} value={asunto} onChange={(e) => setAsunto(e.target.value)} />
          </FormField>
          <div>
            <FormField id="pq-desc" label="Descripción" required error={errors.descripcion} hint="Incluye fechas, productos y cualquier dato que ayude a resolver tu caso.">
              <textarea {...bind("pq-desc", errors.descripcion, "x")} rows={6} maxLength={MAX_DESC} value={descripcion} onChange={(e) => setDescripcion(e.target.value)} />
            </FormField>
            <p className={`mt-1 text-right text-sm ${descripcion.length > MAX_DESC - 100 ? "font-semibold text-warning" : "text-muted-foreground"}`} aria-live="polite">
              {descripcion.length} / {MAX_DESC}
            </p>
          </div>
          <FormField id="pq-pedido" label="Referencia del pedido" hint="Si tu solicitud se relaciona con una compra, escribe la referencia que recibiste.">
            <input id="pq-pedido" className={inputCls} aria-describedby="pq-pedido-hint" value={pedido} onChange={(e) => setPedido(e.target.value)} />
          </FormField>
        </div>
      </section>

      <section className="rounded-xl border border-line bg-card p-5 shadow-sm md:p-6">
        <div className="flex items-start gap-3">
          <input id="pq-consent" type="checkbox" checked={consent} onChange={(e) => setConsent(e.target.checked)}
            aria-invalid={errors.consent ? true : undefined} aria-describedby={errors.consent ? "pq-consent-err" : undefined}
            className="mt-1 h-5 w-5 flex-shrink-0 rounded border-line accent-accent focus:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2" />
          <label htmlFor="pq-consent" className="text-sm leading-relaxed text-secondary">
            Autorizo el tratamiento de mis datos personales conforme a la Ley 1581 de 2012 para gestionar esta solicitud.{" "}
            <a href="#datos" className="font-semibold text-accent underline underline-offset-2 hover:text-accent-hover">Ver política de tratamiento de datos</a>.
            <span className="text-destructive" aria-hidden="true"> *</span>
          </label>
        </div>
        {errors.consent && (
          <p id="pq-consent-err" role="alert" className="mt-2 flex items-start gap-1.5 text-sm font-medium text-destructive">
            <i className="fa-solid fa-circle-exclamation mt-0.5" aria-hidden="true" /> {errors.consent}
          </p>
        )}
      </section>

      {serverErr && <Alert kind="error">{serverErr}</Alert>}
      <button type="submit" disabled={loading} aria-busy={loading} className={`${btnPrimary} w-full sm:w-auto`}>
        {loading ? <><Spinner /> Radicando…</> : <><i className="fa-solid fa-paper-plane" aria-hidden="true" /> Radicar solicitud</>}
      </button>
    </form>
  );
}

/* ───────────────────────── Consultar ───────────────────────── */

function ConsultaForm({ initialRadicado }: { initialRadicado: string }) {
  const [radicado, setRadicado] = useState(initialRadicado);
  const [doc, setDoc] = useState("");
  const [errors, setErrors] = useState<{ radicado?: string; doc?: string }>({});
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const [res, setRes] = useState<PqrConsulta | null>(null);

  useEffect(() => { if (initialRadicado) setRadicado(initialRadicado); }, [initialRadicado]);

  async function submit(ev: React.FormEvent) {
    ev.preventDefault();
    if (loading) return;
    const e: typeof errors = {};
    if (!radicado.trim()) e.radicado = "Ingresa el número de radicado, por ejemplo PQR-2026-000001.";
    if (!doc.trim()) e.doc = "Ingresa el número de documento con el que radicaste.";
    setErrors(e); setErr(null);
    if (e.radicado || e.doc) { document.getElementById(e.radicado ? "cq-radicado" : "cq-doc")?.focus(); return; }
    setLoading(true); setRes(null);
    try {
      setRes(await consultarPqr(radicado.trim(), doc.trim()));
    } catch (x) {
      const a = x as ApiError;
      setErr(a.status === 404
        ? "No encontramos una solicitud con esos datos. Verifica el radicado y el número de documento."
        : a.isNetwork || a.status === 0 ? "No pudimos conectar con el servidor. Inténtalo de nuevo."
        : a.detail || "No se pudo realizar la consulta.");
    } finally { setLoading(false); }
  }

  const bind = (id: string, e?: string) => ({ id, "aria-invalid": e ? true : undefined, "aria-describedby": e ? `${id}-err` : undefined, className: inputCls });

  return (
    <div className="space-y-6">
      <form onSubmit={submit} noValidate className="rounded-xl border border-line bg-card p-5 shadow-sm md:p-6" aria-label="Consultar PQR">
        <div className="grid gap-5 md:grid-cols-2">
          <FormField id="cq-radicado" label="Número de radicado" required error={errors.radicado}>
            <input {...bind("cq-radicado", errors.radicado)} value={radicado} onChange={(e) => setRadicado(e.target.value)} placeholder="PQR-2026-000001" />
          </FormField>
          <FormField id="cq-doc" label="Número de documento" required error={errors.doc}>
            <input {...bind("cq-doc", errors.doc)} value={doc} onChange={(e) => setDoc(e.target.value)} />
          </FormField>
        </div>
        <button type="submit" disabled={loading} aria-busy={loading} className={`${btnPrimary} mt-5`}>
          {loading ? <><Spinner /> Consultando…</> : <><i className="fa-solid fa-magnifying-glass" aria-hidden="true" /> Consultar</>}
        </button>
      </form>

      {err && <Alert kind="error">{err}</Alert>}
      {res && <Resultado r={res} />}
    </div>
  );
}

function Resultado({ r }: { r: PqrConsulta }) {
  const steps = PQR_ESTADOS;
  const cur = steps.findIndex((s) => s.value === r.estado);
  return (
    <div className="rounded-xl border border-line bg-card p-5 shadow-sm md:p-6" role="region" aria-label="Resultado de la consulta">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">{tipoLabel(r.tipo)}</p>
          <h2 className="font-heading text-xl font-semibold text-primary">{r.radicado}</h2>
        </div>
        <span className="rounded-full bg-accent-soft px-3 py-1 text-sm font-semibold text-primary">{estadoLabel(r.estado)}</span>
      </div>

      <ol className="mt-6 grid grid-cols-4 gap-2" aria-label="Línea de tiempo del estado">
        {steps.map((s, i) => {
          const done = i <= cur;
          return (
            <li key={s.value} aria-current={i === cur ? "step" : undefined} className="text-center">
              <div className={`mx-auto flex h-9 w-9 items-center justify-center rounded-full border-2 text-sm ${done ? "border-accent bg-accent text-white" : "border-line bg-card text-muted-foreground"}`}>
                {done ? <i className="fa-solid fa-check" aria-hidden="true" /> : i + 1}
              </div>
              <p className={`mt-1.5 text-sm ${i === cur ? "font-semibold text-primary" : "text-muted-foreground"}`}>{s.label}</p>
              <span className="sr-only">{done ? "(completado)" : "(pendiente)"}</span>
            </li>
          );
        })}
      </ol>

      <dl className="mt-6 divide-y divide-line rounded-lg border border-line text-sm">
        <div className="px-4 py-3"><dt className="text-muted-foreground">Asunto</dt><dd className="mt-0.5 font-semibold text-foreground">{r.asunto}</dd></div>
        <div className="px-4 py-3"><dt className="text-muted-foreground">Descripción</dt><dd className="mt-0.5 whitespace-pre-line text-foreground">{r.descripcion}</dd></div>
        <div className="flex justify-between gap-4 px-4 py-3"><dt className="text-muted-foreground">Radicada el</dt><dd>{fmtFecha(r.fecha_radicacion)}</dd></div>
        <div className="flex justify-between gap-4 px-4 py-3"><dt className="text-muted-foreground">Fecha límite de respuesta</dt><dd className="font-semibold">{fmtFecha(r.fecha_limite_respuesta)}</dd></div>
      </dl>

      {r.respuesta ? (
        <div className="mt-6 rounded-lg border border-success/30 bg-success/5 p-4">
          <p className="flex items-center gap-2 font-semibold text-success"><i className="fa-solid fa-reply" aria-hidden="true" /> Respuesta de NEXZUS IT SERVICE{r.fecha_respuesta ? ` · ${fmtFecha(r.fecha_respuesta)}` : ""}</p>
          <p className="mt-2 whitespace-pre-line text-foreground">{r.respuesta}</p>
        </div>
      ) : (
        <p className="mt-6 flex items-start gap-2 text-sm text-muted-foreground"><i className="fa-solid fa-hourglass-half mt-0.5" aria-hidden="true" /> Aún no hay una respuesta. Te notificaremos por correo apenas la tengamos.</p>
      )}
    </div>
  );
}

/* ───────────────────────── Página ───────────────────────── */

export default function PqrPage() {
  return (
    <>
      <SiteHeader />
      <main id="contenido" className="min-h-screen bg-background pb-16 pt-28">
        <div className="mx-auto max-w-4xl px-4 md:px-6">
          <h1 className="font-heading text-3xl font-semibold tracking-tight text-primary md:text-4xl">Peticiones, quejas, reclamos y sugerencias</h1>
          <p className="mt-2 max-w-2xl text-muted-foreground">
            Radica tu solicitud o consulta su estado. Atendemos cada caso dentro de los plazos legales.
          </p>

          <Suspense fallback={<div role="status" className="mt-8 text-muted-foreground">Cargando…</div>}>
            <PqrContent />
          </Suspense>

          {/*
            PLANTILLA LEGAL — A REVISAR POR LA EMPRESA / ASESOR JURÍDICO.
            Los textos de esta sección son un modelo genérico basado en la Ley 1581 de 2012 y la Ley 1755 de 2015.
            Deben ajustarse con los datos reales del responsable (razón social, NIT, dirección, canales) antes de producción.
          */}
          <section id="datos" aria-labelledby="h-datos-pers" className="mt-14 scroll-mt-28 rounded-xl border border-line bg-card p-6 shadow-sm md:p-8">
            <h2 id="h-datos-pers" className="font-heading text-2xl font-semibold text-primary">Política de tratamiento de datos personales</h2>
            <p className="mt-1 text-sm text-muted-foreground">Resumen · Ley 1581 de 2012 y Decreto 1377 de 2013</p>
            <div className="mt-4 space-y-3 text-secondary">
              <p><strong className="text-primary">Responsable.</strong> NEXZUS IT SERVICE (NIT 000.000.000-0), Bogotá, Colombia. Correo: contacto@nexzusit.com.</p>
              <p><strong className="text-primary">Finalidad.</strong> Usamos tus datos para gestionar compras, pagos, entregas, soporte, y para tramitar y responder PQR. No los vendemos a terceros.</p>
              <p><strong className="text-primary">Tus derechos.</strong> Puedes conocer, actualizar, rectificar y suprimir tus datos, solicitar prueba de la autorización, ser informado del uso que se les da y revocar la autorización, así como presentar quejas ante la Superintendencia de Industria y Comercio.</p>
              <p><strong className="text-primary">Datos sensibles.</strong> No solicitamos datos sensibles. Si los compartes voluntariamente, no estás obligado a hacerlo.</p>
              <p><strong className="text-primary">Cómo ejercer tus derechos.</strong> Radica una petición en esta misma página o escribe a contacto@nexzusit.com indicando tu documento de identidad.</p>
              <p><strong className="text-primary">Pagos.</strong> Los pagos son procesados por Wompi. NEXZUS IT SERVICE no almacena datos de tarjetas ni credenciales bancarias.</p>
            </div>

            <div className="mt-6 rounded-lg bg-accent-soft p-4">
              <h3 className="flex items-center gap-2 font-heading text-base font-semibold text-primary"><i className="fa-solid fa-scale-balanced text-accent" aria-hidden="true" /> Plazos de respuesta</h3>
              <p className="mt-1 text-sm text-secondary">
                Conforme a la Ley 1755 de 2015, las peticiones se responden dentro de los <strong>15 días hábiles</strong> siguientes a su radicación. Si no es posible
                responder en ese término, te informaremos el motivo y la nueva fecha, que no excederá el doble del plazo inicial.
              </p>
            </div>
            <p className="mt-4 text-sm">
              <Link href="/tienda" className="font-semibold text-accent underline underline-offset-2 hover:text-accent-hover">Volver a la tienda</Link>
            </p>
          </section>
        </div>
      </main>
      <SiteFooter />
    </>
  );
}
