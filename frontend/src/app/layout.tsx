import type { Metadata } from "next";
import "@/styles/globals.css";
import HeroUIProvider from "@/components/HeroUIProvider";

// La URL pública real del sitio. En Netlify se define NEXT_PUBLIC_SITE_URL
// (Site configuration → Environment variables); el fallback debe apuntar
// siempre al dominio que está en producción ahora mismo.
const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "https://bejewelled-moxie-f32376.netlify.app";
const SITE_NAME = "Carnicería Expendio Fuente de Vida";
const SITE_DESC = "La mejor carne de Medellín — cortes premium 100% naturales, domicilios el mismo día. Res, cerdo, pollo y más.";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: SITE_NAME,
    template: `%s | ${SITE_NAME}`,
  },
  description: SITE_DESC,
  keywords: [
    "carnicería Medellín", "carne premium", "cortes de res", "carne natural",
    "domicilios carne Medellín", "carnicería Fuente de Vida", "carne de cerdo",
    "pollo fresco", "embutidos artesanales", "carnicería Barrio París",
  ],
  authors: [{ name: "Fuente de Vida" }],
  creator: "Carnicería Expendio Fuente de Vida",
  openGraph: {
    type: "website",
    locale: "es_CO",
    url: SITE_URL,
    siteName: SITE_NAME,
    title: SITE_NAME,
    description: SITE_DESC,
    images: [
      {
        url: "/img/og-image.jpg",
        width: 1200,
        height: 630,
        alt: "Carnicería Fuente de Vida — Carne Premium Medellín",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: SITE_NAME,
    description: SITE_DESC,
    images: ["/img/og-image.jpg"],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true },
  },
  icons: {
    icon: "/img/logo.svg",
    apple: "/img/logo.svg",
  },
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
        <link
          href="https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,400;0,600;0,700;1,400;1,600;1,700&family=DM+Sans:wght@400;500;600;700&display=swap"
          rel="stylesheet"
        />
        {/* Schema.org — Local Business */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "LocalBusiness",
              "name": SITE_NAME,
              "description": SITE_DESC,
              "url": SITE_URL,
              "telephone": "+57 316 401 3230",
              "email": "contacto@fuentedevida.co",
              "address": {
                "@type": "PostalAddress",
                "streetAddress": "Carrera 76 #20f-107, Barrio París",
                "addressLocality": "Medellín",
                "addressRegion": "Antioquia",
                "addressCountry": "CO",
              },
              "openingHours": ["Mo-Sa 07:00-20:00", "Su 08:00-14:00"],
              "servesCuisine": "Carnicería",
              "priceRange": "$$",
              "image": `${SITE_URL}/img/og-image.jpg`,
              "sameAs": [],
            }),
          }}
        />
      </head>
      <body>
        <HeroUIProvider>{children}</HeroUIProvider>
      </body>
    </html>
  );
}
