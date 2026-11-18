import type { Metadata } from "next";
import "@/styles/globals.css";
import HeroUIProvider from "@/components/HeroUIProvider";
import { CartProvider } from "@/lib/cart";

// La URL pública real del sitio. En Netlify se define NEXT_PUBLIC_SITE_URL
// (Site configuration → Environment variables); el fallback debe apuntar
// siempre al dominio que está en producción ahora mismo.
const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "https://bejewelled-moxie-f32376.netlify.app";
const SITE_NAME = "NEXZUS IT SERVICE";
const SITE_DESC =
  "Venta de software y hardware, licencias, redes y servicios de soporte TI para empresas y profesionales en Colombia. Garantía, asesoría técnica y envíos a todo el país.";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: `${SITE_NAME} | Software, hardware y servicios TI en Colombia`,
    template: `%s | ${SITE_NAME}`,
  },
  description: SITE_DESC,
  keywords: [
    "venta de software Colombia", "venta de hardware", "licencias Microsoft", "soporte técnico TI",
    "servicios IT empresas", "redes y cableado estructurado", "portátiles empresariales",
    "servidores", "antivirus empresarial", "NEXZUS IT SERVICE",
  ],
  authors: [{ name: SITE_NAME }],
  creator: SITE_NAME,
  openGraph: {
    type: "website",
    locale: "es_CO",
    url: SITE_URL,
    siteName: SITE_NAME,
    title: SITE_NAME,
    description: SITE_DESC,
    images: [{ url: "/img/og-image.svg", width: 1200, height: 630, alt: "NEXZUS IT SERVICE — Software, hardware y servicios TI" }],
  },
  twitter: {
    card: "summary_large_image",
    title: SITE_NAME,
    description: SITE_DESC,
    images: ["/img/og-image.svg"],
  },
  robots: { index: true, follow: true, googleBot: { index: true, follow: true } },
  icons: { icon: "/img/isotipo-nexzus.png", apple: "/img/logo-nexzus.png" },
};

// Datos de contacto de ejemplo: reemplazar por los reales (también editables desde el panel).
const schema = {
  "@context": "https://schema.org",
  "@type": "Store",
  name: SITE_NAME,
  description: SITE_DESC,
  url: SITE_URL,
  logo: `${SITE_URL}/img/logo-nexzus.png`,
  image: `${SITE_URL}/img/og-image.svg`,
  telephone: "+57 300 000 0000",
  email: "contacto@nexzusit.com",
  taxID: "000.000.000-0",
  address: {
    "@type": "PostalAddress",
    addressLocality: "Bogotá",
    addressCountry: "CO",
  },
  areaServed: { "@type": "Country", name: "Colombia" },
  priceRange: "$$",
  sameAs: [],
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es">
      <head>
        <link
          rel="stylesheet"
          href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.7.2/css/all.min.css"
        />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Lexend:wght@500;600;700&family=Source+Sans+3:wght@400;500;600;700&display=swap"
          rel="stylesheet"
        />
        {/* Schema.org — Organización / tienda */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
        />
      </head>
      <body>
        <HeroUIProvider>
          <CartProvider>{children}</CartProvider>
        </HeroUIProvider>
      </body>
    </html>
  );
}
