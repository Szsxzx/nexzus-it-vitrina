/**
 * Datos de respaldo del catálogo de NEXZUS IT SERVICE (contenido de ejemplo).
 * El catálogo real viene del backend FastAPI; las imágenes están en /public/img/products.
 */
import type { Category } from "@/lib/types";
export type { Category };

export interface Product {
  slug: string;
  name: string;
  category: Category;
  description: string;
  price: string;
  oldPrice?: string;
  image: string;
  rating: number; // 0-5
  reviewCount: number;
  discount?: string;
  tags?: string[];
}

export const products: Product[] = [
  { slug: "portatil-empresarial", name: "Portátil empresarial 15 pulgadas", category: "hardware",
    description: "Core i7, 16 GB RAM, SSD 512 GB. Pensado para jornada completa de oficina.",
    price: "$3.890.000", oldPrice: "$4.290.000", image: "/img/products/portatil-empresarial.svg",
    rating: 4.5, reviewCount: 38, discount: "-9%", tags: ["GARANTÍA 1 AÑO"] },

  { slug: "pc-escritorio", name: "PC de escritorio All-in-One", category: "hardware",
    description: "Equipo compacto para puestos de trabajo, con teclado y mouse incluidos.",
    price: "$2.950.000", image: "/img/products/pc-escritorio.svg",
    rating: 4, reviewCount: 21, tags: ["LISTO PARA USAR"] },

  { slug: "servidor-rack", name: "Servidor rack 1U", category: "hardware",
    description: "Servidor para virtualización y archivos, con fuente redundante.",
    price: "$12.500.000", image: "/img/products/servidor-rack.svg",
    rating: 5, reviewCount: 9, tags: ["INSTALACIÓN OPCIONAL"] },

  { slug: "monitor-27", name: "Monitor 27 pulgadas IPS", category: "accesorios",
    description: "Panel IPS Full HD con ajuste de altura y entrada HDMI/DisplayPort.",
    price: "$890.000", image: "/img/products/monitor-27.svg",
    rating: 4.5, reviewCount: 52, tags: ["IPS"] },

  { slug: "switch-24", name: "Switch gestionable 24 puertos", category: "redes",
    description: "Gigabit con VLAN y PoE+, para redes de oficina en crecimiento.",
    price: "$1.650.000", image: "/img/products/switch-24.svg",
    rating: 4, reviewCount: 14, tags: ["POE+"] },

  { slug: "router-wifi6", name: "Router Wi-Fi 6 empresarial", category: "redes",
    description: "Doble banda, múltiples SSID y administración centralizada.",
    price: "$520.000", oldPrice: "$590.000", image: "/img/products/router-wifi6.svg",
    rating: 4, reviewCount: 27, discount: "-12%", tags: ["WI-FI 6"] },

  { slug: "licencia-windows-pro", name: "Licencia Windows 11 Pro", category: "licencias",
    description: "Licencia original con activación digital y factura a nombre de su empresa.",
    price: "$690.000", image: "/img/products/licencia-windows-pro.svg",
    rating: 5, reviewCount: 61, tags: ["ENTREGA DIGITAL"] },

  { slug: "microsoft-365", name: "Microsoft 365 Empresa", category: "software",
    description: "Suscripción anual por usuario: Office, correo y almacenamiento en la nube.",
    price: "$520.000", image: "/img/products/microsoft-365.svg",
    rating: 4.5, reviewCount: 44, tags: ["ANUAL"] },

  { slug: "antivirus-empresarial", name: "Antivirus empresarial (10 equipos)", category: "software",
    description: "Protección de endpoints con consola centralizada y soporte técnico.",
    price: "$480.000", image: "/img/products/antivirus-empresarial.svg",
    rating: 4, reviewCount: 33, tags: ["1 AÑO"] },

  { slug: "erp-pyme", name: "ERP para pymes", category: "software",
    description: "Facturación, inventario y contabilidad con implementación guiada.",
    price: "$2.400.000", image: "/img/products/erp-pyme.svg",
    rating: 4.5, reviewCount: 12, tags: ["CON IMPLEMENTACIÓN"] },

  { slug: "teclado-mouse", name: "Combo teclado y mouse inalámbrico", category: "accesorios",
    description: "Conexión por receptor USB, batería de larga duración, distribución en español.",
    price: "$120.000", image: "/img/products/teclado-mouse.svg",
    rating: 4, reviewCount: 70, tags: ["INALÁMBRICO"] },

  { slug: "ups-1500", name: "UPS 1500 VA", category: "accesorios",
    description: "Respaldo de energía para equipos y red, con regulación de voltaje.",
    price: "$780.000", image: "/img/products/ups-1500.svg",
    rating: 4.5, reviewCount: 19, tags: ["8 TOMAS"] },
];

export const categoriesMeta: { id: Category; label: string; cssClass: string }[] = [
  { id: "software",   label: "Software",   cssClass: "from-primary to-secondary" },
  { id: "hardware",   label: "Hardware",   cssClass: "from-primary to-secondary" },
  { id: "licencias",  label: "Licencias",  cssClass: "from-accent to-primary" },
  { id: "redes",      label: "Redes",      cssClass: "from-accent to-primary" },
  { id: "accesorios", label: "Accesorios", cssClass: "from-secondary to-primary" },
];
