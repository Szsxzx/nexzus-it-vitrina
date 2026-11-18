import { api } from "./api";

export type PaymentStatus = "pendiente" | "aprobado" | "rechazado" | "anulado" | "error";

export interface CheckoutItemIn {
  product_id?: number;
  name: string;
  qty: number;
  unit_price: number;
}

export interface CheckoutIn {
  customer_name: string;
  customer_email: string;
  customer_phone: string;
  customer_document?: string;
  address?: string;
  notes?: string;
  items: CheckoutItemIn[];
}

export interface CheckoutOut {
  order_id: number;
  reference: string;
  amount_in_cents: number;
  currency: "COP";
  public_key: string;
  signature_integrity: string;
  redirect_url: string;
  checkout_url: string;
}

export interface PaymentStatusOut {
  reference: string;
  order_id: number;
  status: PaymentStatus;
  amount_in_cents: number;
  payment_method: string | null;
  transaction_id: string | null;
  customer_name: string;
}

export const createCheckout = (body: CheckoutIn) => api.post<CheckoutOut>("/payments/checkout", body);

export const getPaymentStatus = (q: { id?: string; reference?: string }) => {
  const qs = q.id ? `id=${encodeURIComponent(q.id)}` : `reference=${encodeURIComponent(q.reference ?? "")}`;
  return api.get<PaymentStatusOut>(`/payments/status?${qs}`);
};

export const fmtCOP = new Intl.NumberFormat("es-CO", { style: "currency", currency: "COP", maximumFractionDigits: 0 });
