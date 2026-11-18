import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Tienda",
  description:
    "Compre portátiles, servidores, redes, licencias de software y accesorios con garantía y envíos a toda Colombia.",
};

export default function TiendaLayout({ children }: { children: React.ReactNode }) {
  return children;
}
