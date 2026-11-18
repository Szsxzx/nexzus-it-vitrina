"use client";
import { Suspense, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import SiteHeader from "@/components/SiteHeader";
import SiteFooter from "@/components/SiteFooter";
import { useCart } from "@/lib/cart";
import type { ApiError } from "@/lib/api";
import { fmtCOP, getPaymentStatus, type PaymentStatusOut } from "@/lib/payments";
import { btnOutline, btnPrimary, Spinner } from "@/lib/formUi";

const POLL_MS = 5000;
const MAX_POLL_MS = 60000;

const META = {
  aprobado:  { icon: "fa-circle-check",        title: "Pago aprobado",        text: "Recibimos tu pago correctamente. Te enviaremos la confirmación a tu correo.", box: "border-success/30 bg-success/5", fg: "text-success" },
  pendiente: { icon: "fa-clock",               title: "Pago en validación",   text: "Tu pago aún está siendo validado por la entidad financiera. Esto puede tardar unos minutos, sobre todo con PSE.", box: "border-warning/30 bg-warning/5", fg: "text-warning" },
  rechazado: { icon: "fa-circle-xmark",        title: "Pago rechazado",       text: "La entidad financiera no aprobó la transacción. No se realizó ningún cobro. Puedes intentarlo de nuevo con otro medio de pago.", box: "border-destructive/30 bg-destructive/5", fg: "text-destructive" },
  anulado:   { icon: "fa-ban",                 title: "Pago anulado",         text: "La transacción fue anulada o cancelada. No se realizó ningún cobro.", box: "border-destructive/30 bg-destructive/5", fg: "text-destructive" },
  error:     { icon: "fa-triangle-exclamation", title: "Error en el pago",     text: "Ocurrió un error al procesar la transacción. Si te descontaron el valor, comunícate con nosotros indicando la referencia.", box: "border-destructive/30 bg-destructive/5", fg: "text-destructive" },
} as const;

function Resultado() {
  const params = useSearchParams();
  const id = params.get("id");
  const reference = params.get("reference");
  const { clear } = useCart();
  const [data, setData] = useState<PaymentStatusOut | null>(null);
  const [fetchErr, setFetchErr] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [waitedOut, setWaitedOut] = useState(false);
  const [nonce, setNonce] = useState(0);
  const cleared = useRef(false);

  useEffect(() => {
    if (!id && !reference) { setLoading(false); return; }
    let cancelled = false;
    let timer: ReturnType<typeof setTimeout> | undefined;
    const start = Date.now();
    setLoading(true); setFetchErr(null); setWaitedOut(false);

    async function tick() {
      try {
        const r = await getPaymentStatus(id ? { id } : { reference: reference! });
        if (cancelled) return;
        setData(r); setFetchErr(null); setLoading(false);
        if (r.status === "pendiente") {
          if (Date.now() - start >= MAX_POLL_MS) setWaitedOut(true);
          else timer = setTimeout(tick, POLL_MS);
        }
      } catch (e) {
        if (cancelled) return;
        setFetchErr((e as ApiError).detail || "No se pudo consultar el estado del pago.");
        setLoading(false);
      }
    }
    tick();
    return () => { cancelled = true; if (timer) clearTimeout(timer); };
  }, [id, reference, nonce]);

  useEffect(() => {
    if (data?.status === "aprobado" && !cleared.current) { cleared.current = true; clear(); }
  }, [data, clear]);

  if (!id && !reference) {
    return (
      <Card icon="fa-circle-question" tone="text-secondary" box="border-line bg-card" title="No encontramos la transacción"
        text="Falta el identificador del pago en la dirección. Si ya pagaste, revisa tu correo o contáctanos.">
        <Links />
      </Card>
    );
  }
  if (loading) {
    return (
      <div role="status" className="flex flex-col items-center rounded-xl border border-line bg-card p-12 text-center shadow-sm">
        <span className="text-2xl text-accent"><Spinner /></span>
        <p className="mt-3 font-semibold text-primary">Consultando el estado de tu pago…</p>
      </div>
    );
  }
  if (fetchErr || !data) {
    return (
      <Card icon="fa-triangle-exclamation" tone="text-destructive" box="border-destructive/30 bg-destructive/5" title="No pudimos consultar tu pago" text={fetchErr ?? "Error desconocido."}>
        <button onClick={() => setNonce((n) => n + 1)} className={btnPrimary}>Reintentar</button>
        <Links />
      </Card>
    );
  }

  const m = META[data.status];
  return (
    <Card icon={m.icon} tone={m.fg} box={m.box} title={m.title} text={m.text} live>
      {data.status === "pendiente" && !waitedOut && (
        <p className="flex items-center justify-center gap-2 text-sm text-muted-foreground"><Spinner /> Verificando automáticamente cada 5 segundos…</p>
      )}
      {data.status === "pendiente" && waitedOut && (
        <div className="text-center text-sm text-muted-foreground">
          <p>Aún no hay una respuesta final. Puedes volver a consultar o esperar el correo de confirmación.</p>
          <button onClick={() => setNonce((n) => n + 1)} className={`${btnOutline} mt-3`}>Consultar de nuevo</button>
        </div>
      )}
      <dl className="w-full divide-y divide-line rounded-lg border border-line bg-card text-left text-sm">
        <Row k="Referencia" v={<span className="font-mono">{data.reference}</span>} />
        <Row k="Monto" v={<strong>{fmtCOP.format(data.amount_in_cents / 100)}</strong>} />
        <Row k="Método de pago" v={data.payment_method ?? "Por confirmar"} />
        <Row k="Estado" v={<span className={`font-semibold ${m.fg}`}><i className={`fa-solid ${m.icon} mr-1.5`} aria-hidden="true" />{m.title}</span>} />
        <Row k="Cliente" v={data.customer_name} />
      </dl>
      {(data.status === "rechazado" || data.status === "anulado" || data.status === "error") && (
        <Link href="/checkout" className={btnPrimary}>Intentar de nuevo</Link>
      )}
      <Links />
    </Card>
  );
}

function Row({ k, v }: { k: string; v: React.ReactNode }) {
  return <div className="flex justify-between gap-4 px-4 py-3"><dt className="text-muted-foreground">{k}</dt><dd className="text-right text-foreground">{v}</dd></div>;
}

function Links() {
  return (
    <div className="flex flex-col gap-3 sm:flex-row">
      <Link href="/tienda" className={btnOutline}>Volver a la tienda</Link>
      <Link href="/pqr" className={btnOutline}>Radicar una PQR</Link>
    </div>
  );
}

function Card({ icon, tone, box, title, text, children, live }: {
  icon: string; tone: string; box: string; title: string; text: string; children?: React.ReactNode; live?: boolean;
}) {
  return (
    <div className={`rounded-xl border p-6 shadow-sm md:p-10 ${box}`} role={live ? "status" : undefined}>
      <div className="flex flex-col items-center gap-5 text-center">
        <span className={`flex h-16 w-16 items-center justify-center rounded-full bg-card text-3xl ${tone}`}><i className={`fa-solid ${icon}`} aria-hidden="true" /></span>
        <div>
          <h1 className="font-heading text-2xl font-semibold text-primary md:text-3xl">{title}</h1>
          <p className="mx-auto mt-2 max-w-xl text-secondary">{text}</p>
        </div>
        <div className="flex w-full max-w-md flex-col items-center gap-5">{children}</div>
      </div>
    </div>
  );
}

export default function ResultadoPage() {
  return (
    <>
      <SiteHeader />
      <main id="contenido" className="min-h-screen bg-background pb-16 pt-28">
        <div className="mx-auto max-w-3xl px-4 md:px-6">
          <Suspense fallback={<div role="status" className="p-12 text-center text-muted-foreground">Cargando…</div>}>
            <Resultado />
          </Suspense>
        </div>
      </main>
      <SiteFooter />
    </>
  );
}
