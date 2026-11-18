"use client";
import { useState } from "react";
import Link from "next/link";
import SiteHeader from "@/components/SiteHeader";
import SiteFooter from "@/components/SiteFooter";
import { useCart } from "@/lib/cart";
import type { ApiError } from "@/lib/api";
import { createCheckout, fmtCOP } from "@/lib/payments";
import { Alert, btnPrimary, describedBy, FormField, inputCls, Spinner } from "@/lib/formUi";

type Errors = Partial<Record<"name" | "email" | "phone" | "docNum" | "address" | "consent", string>>;

const DOC_TYPES = [
  { v: "CC", l: "Cédula de ciudadanía" },
  { v: "CE", l: "Cédula de extranjería" },
  { v: "NIT", l: "NIT" },
  { v: "PAS", l: "Pasaporte" },
];
const METODOS = ["PSE", "Visa", "Mastercard", "American Express", "Nequi"];

export default function CheckoutPage() {
  const { items, inc, dec } = useCart();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [docType, setDocType] = useState("CC");
  const [docNum, setDocNum] = useState("");
  const [address, setAddress] = useState("");
  const [notes, setNotes] = useState("");
  const [consent, setConsent] = useState(false);
  const [errors, setErrors] = useState<Errors>({});
  const [loading, setLoading] = useState(false);
  const [serverErr, setServerErr] = useState<{ kind: "error" | "warning"; msg: string } | null>(null);

  const total = items.reduce((s, i) => s + i.unitPrice * i.qty, 0);

  function validate(): Errors {
    const e: Errors = {};
    if (name.trim().length < 3) e.name = "Escribe tu nombre completo.";
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email.trim())) e.email = "Ingresa un correo válido, por ejemplo nombre@empresa.com.";
    if (phone.replace(/\D/g, "").length < 7) e.phone = "Ingresa un teléfono de contacto válido (mínimo 7 dígitos).";
    if (!/^[A-Za-z0-9.\-]{5,20}$/.test(docNum.trim())) e.docNum = "Ingresa tu número de documento (5 a 20 caracteres, sin espacios).";
    if (address.trim().length < 5) e.address = "Indica la dirección de entrega o facturación.";
    if (!consent) e.consent = "Debes aceptar el tratamiento de datos personales para continuar.";
    return e;
  }

  async function onSubmit(ev: React.FormEvent) {
    ev.preventDefault();
    if (loading) return;
    const e = validate();
    setErrors(e);
    setServerErr(null);
    if (Object.keys(e).length) {
      const first = Object.keys(e)[0];
      const idMap: Record<string, string> = { name: "co-name", email: "co-email", phone: "co-phone", docNum: "co-docnum", address: "co-address", consent: "co-consent" };
      document.getElementById(idMap[first])?.focus();
      return;
    }
    setLoading(true);
    try {
      const res = await createCheckout({
        customer_name: name.trim(),
        customer_email: email.trim(),
        customer_phone: phone.trim(),
        customer_document: `${docType} ${docNum.trim()}`,
        address: address.trim(),
        notes: notes.trim() || undefined,
        items: items.map((i) => ({
          ...(i.productId != null ? { product_id: i.productId } : {}),
          name: i.name,
          qty: i.qty,
          unit_price: i.unitPrice,
        })),
      });
      window.location.href = res.checkout_url;
      // se mantiene el estado de carga mientras el navegador redirige
    } catch (err) {
      const a = err as ApiError;
      if (a.status === 503) {
        setServerErr({ kind: "warning", msg: "La pasarela de pago aún no está configurada. Puedes enviar tu pedido por WhatsApp desde el carrito y te atenderemos de inmediato." });
      } else if (a.isNetwork || a.status === 0) {
        setServerErr({ kind: "error", msg: "No pudimos conectar con el servidor. Revisa tu conexión e inténtalo de nuevo." });
      } else {
        setServerErr({ kind: "error", msg: a.detail || "No se pudo iniciar el pago. Inténtalo de nuevo." });
      }
      setLoading(false);
    }
  }

  const bind = (id: string, err?: string, hint?: string) => ({
    id,
    "aria-invalid": err ? true : undefined,
    "aria-describedby": describedBy(id, hint, err),
    className: inputCls,
  });

  return (
    <>
      <SiteHeader />
      <main id="contenido" className="min-h-screen bg-background pb-16 pt-28">
        <div className="mx-auto max-w-6xl px-4 md:px-6">
          <nav aria-label="Ruta de navegación" className="mb-4 text-sm text-muted-foreground">
            <Link href="/tienda" className="hover:text-accent focus:outline-none focus-visible:ring-2 focus-visible:ring-accent">Tienda</Link>
            <span className="mx-2" aria-hidden="true">/</span>
            <span className="text-foreground">Pago</span>
          </nav>
          <h1 className="font-heading text-3xl font-semibold tracking-tight text-primary md:text-4xl">Finalizar compra</h1>
          <p className="mt-2 max-w-2xl text-muted-foreground">Revisa tu pedido, completa tus datos y paga de forma segura.</p>

          {items.length === 0 ? (
            <div className="mt-10 rounded-xl border border-line bg-card p-10 text-center shadow-sm">
              <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-xl bg-accent-soft text-accent">
                <i className="fa-solid fa-cart-shopping text-xl" aria-hidden="true" />
              </div>
              <h2 className="font-heading text-xl font-semibold text-primary">Tu carrito está vacío</h2>
              <p className="mt-2 text-muted-foreground">Agrega productos desde la tienda para continuar con el pago.</p>
              <Link href="/tienda" className={`${btnPrimary} mt-6`}>Ir a la tienda</Link>
            </div>
          ) : (
            <div className="mt-8 grid gap-8 lg:grid-cols-[1fr_380px]">
              <form onSubmit={onSubmit} noValidate className="space-y-8" aria-label="Datos de compra">
                <section className="rounded-xl border border-line bg-card p-5 shadow-sm md:p-6" aria-labelledby="h-datos">
                  <h2 id="h-datos" className="font-heading text-lg font-semibold text-primary">Datos del comprador</h2>
                  <div className="mt-5 grid gap-5 md:grid-cols-2">
                    <div className="md:col-span-2">
                      <FormField id="co-name" label="Nombre completo" required error={errors.name}>
                        <input {...bind("co-name", errors.name)} value={name} onChange={(e) => setName(e.target.value)} autoComplete="name" />
                      </FormField>
                    </div>
                    <FormField id="co-email" label="Correo electrónico" required error={errors.email} hint="Aquí enviaremos la confirmación del pago.">
                      <input {...bind("co-email", errors.email, "x")} type="email" value={email} onChange={(e) => setEmail(e.target.value)} autoComplete="email" />
                    </FormField>
                    <FormField id="co-phone" label="Teléfono" required error={errors.phone}>
                      <input {...bind("co-phone", errors.phone)} type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} autoComplete="tel" placeholder="300 123 4567" />
                    </FormField>
                    <FormField id="co-doctype" label="Tipo de documento" required>
                      <select id="co-doctype" className={inputCls} value={docType} onChange={(e) => setDocType(e.target.value)}>
                        {DOC_TYPES.map((d) => <option key={d.v} value={d.v}>{d.l}</option>)}
                      </select>
                    </FormField>
                    <FormField id="co-docnum" label="Número de documento" required error={errors.docNum}>
                      <input {...bind("co-docnum", errors.docNum)} inputMode="text" value={docNum} onChange={(e) => setDocNum(e.target.value)} />
                    </FormField>
                    <div className="md:col-span-2">
                      <FormField id="co-address" label="Dirección" required error={errors.address} hint="Ciudad, dirección y datos para la entrega o facturación.">
                        <input {...bind("co-address", errors.address, "x")} value={address} onChange={(e) => setAddress(e.target.value)} autoComplete="street-address" />
                      </FormField>
                    </div>
                    <div className="md:col-span-2">
                      <FormField id="co-notes" label="Notas del pedido">
                        <textarea id="co-notes" rows={3} className={`${inputCls} resize-y`} value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="Indicaciones especiales, horario de entrega, datos de facturación…" />
                      </FormField>
                    </div>
                  </div>
                </section>

                <section className="rounded-xl border border-line bg-card p-5 shadow-sm md:p-6">
                  <div className="flex items-start gap-3">
                    <input
                      id="co-consent" type="checkbox" checked={consent}
                      onChange={(e) => setConsent(e.target.checked)}
                      aria-invalid={errors.consent ? true : undefined}
                      aria-describedby={errors.consent ? "co-consent-err" : undefined}
                      className="mt-1 h-5 w-5 flex-shrink-0 rounded border-line accent-accent focus:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2"
                    />
                    <label htmlFor="co-consent" className="text-sm leading-relaxed text-secondary">
                      Autorizo el tratamiento de mis datos personales conforme a la Ley 1581 de 2012 para gestionar esta compra.{" "}
                      <Link href="/pqr#datos" className="font-semibold text-accent underline underline-offset-2 hover:text-accent-hover">Ver política de tratamiento de datos</Link>.
                      <span className="text-destructive" aria-hidden="true"> *</span>
                    </label>
                  </div>
                  {errors.consent && (
                    <p id="co-consent-err" role="alert" className="mt-2 flex items-start gap-1.5 text-sm font-medium text-destructive">
                      <i className="fa-solid fa-circle-exclamation mt-0.5" aria-hidden="true" /> {errors.consent}
                    </p>
                  )}
                </section>

                {serverErr && <Alert kind={serverErr.kind}>{serverErr.msg}</Alert>}

                <div className="lg:hidden">
                  <SubmitBlock loading={loading} total={total} />
                </div>
              </form>

              <aside aria-labelledby="h-resumen" className="lg:sticky lg:top-28 lg:self-start">
                <div className="rounded-xl border border-line bg-card p-5 shadow-sm md:p-6">
                  <h2 id="h-resumen" className="font-heading text-lg font-semibold text-primary">Resumen del pedido</h2>
                  <ul className="mt-4 divide-y divide-line">
                    {items.map((it, idx) => (
                      <li key={`${it.name}-${idx}`} className="flex items-center gap-3 py-3">
                        <div className="min-w-0 flex-1">
                          <p className="truncate text-sm font-semibold text-foreground">{it.name}</p>
                          <p className="text-sm text-muted-foreground">{it.price} c/u</p>
                        </div>
                        <div className="flex items-center gap-1">
                          <button type="button" onClick={() => dec(idx)} aria-label={`Quitar una unidad de ${it.name}`}
                            className="flex h-9 w-9 items-center justify-center rounded-lg border border-line text-secondary hover:bg-muted focus:outline-none focus-visible:ring-2 focus-visible:ring-accent">
                            <i className="fa-solid fa-minus text-xs" aria-hidden="true" />
                          </button>
                          <span className="w-6 text-center text-sm font-semibold">{it.qty}</span>
                          <button type="button" onClick={() => inc(idx)} aria-label={`Agregar una unidad de ${it.name}`}
                            className="flex h-9 w-9 items-center justify-center rounded-lg border border-line text-secondary hover:bg-muted focus:outline-none focus-visible:ring-2 focus-visible:ring-accent">
                            <i className="fa-solid fa-plus text-xs" aria-hidden="true" />
                          </button>
                        </div>
                        <p className="w-24 text-right text-sm font-semibold text-foreground">{fmtCOP.format(it.unitPrice * it.qty)}</p>
                      </li>
                    ))}
                  </ul>
                  <dl className="mt-2 space-y-2 border-t border-line pt-4 text-sm">
                    <div className="flex justify-between"><dt className="text-muted-foreground">Subtotal</dt><dd>{fmtCOP.format(total)}</dd></div>
                    <div className="flex justify-between text-base font-semibold text-primary"><dt>Total a pagar</dt><dd className="font-heading">{fmtCOP.format(total)}</dd></div>
                  </dl>
                  <p className="mt-2 text-xs text-muted-foreground">El valor final es confirmado por el servidor al iniciar el pago.</p>

                  <div className="mt-5 hidden lg:block">
                    <SubmitBlock loading={loading} total={total} formSubmit onClick={onSubmit} />
                  </div>

                  <div className="mt-5 rounded-lg bg-accent-soft p-4">
                    <p className="flex items-center gap-2 text-sm font-semibold text-primary">
                      <i className="fa-solid fa-shield-halved text-accent" aria-hidden="true" /> Pago seguro procesado por Wompi
                    </p>
                    <ul className="mt-3 flex flex-wrap gap-2" aria-label="Medios de pago aceptados">
                      {METODOS.map((m) => (
                        <li key={m} className="rounded-md border border-line bg-card px-2.5 py-1 text-xs font-semibold text-secondary">{m}</li>
                      ))}
                    </ul>
                    <p className="mt-3 text-xs text-muted-foreground">No almacenamos los datos de tu tarjeta ni tus credenciales bancarias.</p>
                  </div>
                </div>
              </aside>
            </div>
          )}
        </div>
      </main>
      <SiteFooter />
    </>
  );
}

/** Botón de pago. En móvil va dentro del form (submit nativo); en desktop está en el aside y dispara onSubmit. */
function SubmitBlock({ loading, total, formSubmit, onClick }: { loading: boolean; total: number; formSubmit?: boolean; onClick?: (e: React.FormEvent) => void }) {
  return (
    <button
      type={formSubmit ? "button" : "submit"}
      onClick={formSubmit ? onClick : undefined}
      disabled={loading}
      aria-busy={loading}
      className={`${btnPrimary} w-full`}
    >
      {loading ? <><Spinner /> Redirigiendo a la pasarela…</> : <><i className="fa-solid fa-lock text-sm" aria-hidden="true" /> Pagar {fmtCOP.format(total)}</>}
    </button>
  );
}
