/**
 * siteData.ts — Store central para el contenido editable del sitio.
 * Los datos se persisten en localStorage para que los cambios del
 * panel de admin sean visibles inmediatamente en el frontend.
 */

// ─── Tipos ───────────────────────────────────────────────────────────────────

export interface BannerData {
  subtitle: string;
  title: string;
  highlight: string;
  ctaText: string;
  ctaHref: string;
}

export interface PromoItem {
  id: string;
  name: string;
  price: string;
  oldPrice?: string;
  off: string;
  color: string;
  img: string;
}

export interface BlogPost {
  id: string;
  title: string;
  date: string;
  image: string;
  excerpt: string;
  content: string;
}

export interface CatalogCategory {
  id: string;
  label: string;
  cssClass: string;
  image?: string;  // URL de imagen de portada
}

export interface PremiumSection {
  id: string;
  title: string;
  icon: string;   // clase fa-*
  color: string;  // clase bg-*
}

export interface PremiumCut {
  id: string;
  sectionId: string;
  name: string;
  price: string;
  unitPrice: number;
  origin: string;
  img: string;
  badge: string;
  badgeColor: string;
  text: string;
}

export interface FooterData {
  address: string;
  phone: string;
  email: string;
  whatsappNumber: string;
  scheduleWeek: string;
  scheduleSunday: string;
  copyright: string;
}

// ─── Datos por defecto ────────────────────────────────────────────────────────

export const defaultBanner: BannerData = {
  subtitle: "La mejor carne de la ciudad",
  title: "100% Natural",
  highlight: "Carne Premium",
  ctaText: "Ver catálogo",
  ctaHref: "#products",
};

export const defaultPromos: PromoItem[] = [
  { id: "t-bone",        name: "T-Bone Steak",        price: "$45.000", oldPrice: "$70.300", off: "36% OFF",  color: "bg-rojo",   img: "/img/t-bone.jpg" },
  { id: "costillas",     name: "Costillas BBQ",        price: "$38.500", oldPrice: "$62.100", off: "38% OFF",  color: "bg-negro2", img: "/img/costillas-bbq.jpg" },
  { id: "paq-familiar",  name: "Paquete Familiar",     price: "$89.900", oldPrice: "$128.400",off: "30% OFF",  color: "bg-azul",   img: "/img/paquete-familiar.jpg" },
  { id: "chorizos",      name: "Chorizos Artesanales", price: "$15.800",                      off: "ESPECIAL", color: "bg-rojo",   img: "/img/chorizos.jpg" },
];

export const defaultBlogs: BlogPost[] = [
  {
    id: "como-cocinar-carne",
    title: "Cómo cocinar la carne perfecta",
    date: "15 Enero 2023",
    image: "/img/blog-cocinar-carne.jpg",
    excerpt: "Aprende los secretos para lograr el punto perfecto de cocción.",
    content: "<p>Lograr el punto perfecto de cocción es un arte que todo amante de la carne debe dominar.</p><h4>🥩 Los puntos de cocción</h4><ul><li><strong>Rare:</strong> Rojo y tibio en el centro. 2-3 min por lado.</li><li><strong>Medium Rare:</strong> Rosa en el centro, jugoso. 3-4 min por lado.</li><li><strong>Well Done:</strong> Sin rosado. 5-6 min por lado.</li></ul>",
  },
  {
    id: "guia-cortes",
    title: "Guía de cortes de carne",
    date: "22 Febrero 2023",
    image: "/img/blog-cortes.jpg",
    excerpt: "Descubre los diferentes cortes y las mejores formas de prepararlos.",
    content: "<p>Conocer los diferentes cortes te ayuda a elegir el más adecuado para cada preparación.</p><h4>🐄 Cortes de Res populares</h4><ul><li><strong>Lomo fino:</strong> Suave y magro, ideal para filetes.</li><li><strong>Tomahawk:</strong> Con hueso largo, espectacular para parrilla.</li><li><strong>Carne molida:</strong> Mezcla 80/20 para hamburguesas.</li></ul>",
  },
  {
    id: "marinar",
    title: "Técnicas para marinar carne",
    date: "10 Marzo 2023",
    image: "/img/blog-marinar.jpg",
    excerpt: "Recetas y técnicas profesionales para marinar tus carnes.",
    content: "<p>Marinar correctamente transforma una carne ordinaria en algo extraordinario.</p><h4>🧄 Marinada básica universal</h4><ul><li>Aceite de oliva (base grasa)</li><li>Jugo de limón o vinagre (ácido)</li><li>Ajo machacado + hierbas frescas</li></ul>",
  },
  {
    id: "asado",
    title: "Consejos para un asado perfecto",
    date: "25 Marzo 2023",
    image: "/img/blog-asado.jpg",
    excerpt: "Desde el encendido del fuego hasta el corte final.",
    content: "<p>El asado es toda una ceremonia. Cada paso importa.</p><h4>🔥 El fuego correcto</h4><ul><li>Carbón de buena calidad o leña de maderas duras.</li><li>Brasas completamente encendidas — sin llama viva.</li></ul>",
  },
  {
    id: "higiene",
    title: "Higiene y manipulación de carne",
    date: "2 Abril 2023",
    image: "/img/blog-higiene.jpg",
    excerpt: "Mantén la calidad y seguridad alimentaria con estos consejos.",
    content: "<p>La seguridad alimentaria no es opcional.</p><h4>❄️ Almacenamiento correcto</h4><ul><li><strong>Refrigerador (0-4°C):</strong> Carne fresca: 1-2 días.</li><li><strong>Congelador (-18°C):</strong> Res hasta 12 meses.</li></ul>",
  },
  {
    id: "hamburguesas",
    title: "Receta casera de hamburguesas",
    date: "10 Abril 2023",
    image: "/img/blog-receta-hamburguesa.jpg",
    excerpt: "Prepará hamburguesas jugosas y sabrosas desde cero.",
    content: "<p>Una hamburguesa perfecta empieza por la carne correcta.</p><h4>🛒 Ingredientes (4 hamburguesas)</h4><ul><li>500g de carne molida 80/20</li><li>1 cdita de sal gruesa</li><li>½ cdita de pimienta negra</li></ul>",
  },
];

export const defaultCategories: CatalogCategory[] = [
  { id: "res",       label: "Cortes de Res",     cssClass: "from-rojo to-rojo-mid",        image: "/img/cat-res.svg" },
  { id: "cerdo",     label: "Cortes de Cerdo",   cssClass: "from-pink-700 to-pink-900",    image: "/img/cat-cerdo.svg" },
  { id: "pollo",     label: "Cortes de Pollo",   cssClass: "from-amber-600 to-amber-800",  image: "/img/cat-pollo.svg" },
  { id: "embutidos", label: "Embutidos",         cssClass: "from-orange-700 to-red-900",   image: "/img/cat-embutidos.svg" },
  { id: "pescado",   label: "Cortes de Pescado", cssClass: "from-azul to-azul-dark",       image: "/img/cat-pescado.svg" },
];

export const defaultPremiumSections: PremiumSection[] = [
  { id: "res",   title: "Cortes de Res",   icon: "fa-cow",            color: "bg-rojo"   },
  { id: "cerdo", title: "Cortes de Cerdo", icon: "fa-piggy-bank",     color: "bg-negro2" },
  { id: "pollo", title: "Cortes de Pollo", icon: "fa-drumstick-bite", color: "bg-azul"   },
];

export const defaultPremiumCuts: PremiumCut[] = [
  { id: "lomo-fino",     sectionId: "res",   name: "Lomo Fino Angus",  price: "$32.000/kg",      unitPrice: 32000, origin: "Origen: Argentina",    img: "/img/lomo-fino.jpg",       badge: "TOP VENTAS",  badgeColor: "bg-azul",   text: "Corte premium ideal para filetes, con marmoleo perfecto que garantiza terneza y sabor." },
  { id: "tomahawk",      sectionId: "res",   name: "Tomahawk",         price: "$68.000/unidad",  unitPrice: 68000, origin: "Origen: Colombia",     img: "/img/tomahawk.jpg",        badge: "NUEVO",       badgeColor: "bg-rojo",   text: "Filete grueso con hueso, perfecto para parrilla. Peso aproximado 1.2kg por unidad." },
  { id: "chuleta",       sectionId: "cerdo", name: "Chuleta de Cerdo", price: "$18.500/kg",      unitPrice: 18500, origin: "Origen: Antioquia",    img: "/img/chuleta-cerdo.jpg",   badge: "-15%",        badgeColor: "bg-rojo",   text: "Corte fresco y jugoso, ideal para asar o freír. Presentación en paquetes de 1kg." },
  { id: "costillas-bbq", sectionId: "cerdo", name: "Costillas BBQ",    price: "$25.900/paquete", unitPrice: 25900, origin: "Origen: Valle",        img: "/img/costillas-bbq.jpg",   badge: "RECOMENDADO", badgeColor: "bg-azul",   text: "Paquete de costillas marinadas listas para la parrilla. Incluye salsa BBQ artesanal." },
  { id: "pechuga",       sectionId: "pollo", name: "Pechuga de Pollo", price: "$12.900/bandeja", unitPrice: 12900, origin: "Origen: Santander",    img: "/img/pechuga-pollo.jpg",   badge: "ORGÁNICO",    badgeColor: "bg-negro2", text: "Pechuga deshuesada y sin piel, de crianza orgánica. Bandeja de 500g." },
  { id: "alitas",        sectionId: "pollo", name: "Alitas Picantes",  price: "$15.500/paquete", unitPrice: 15500, origin: "Origen: Cundinamarca", img: "/img/alitas-picantes.jpg", badge: "ESPECIAL",    badgeColor: "bg-azul",   text: "Alitas marinadas en salsa picante artesanal, listas para hornear. Paquete de 1kg." },
];

export const defaultFooter: FooterData = {
  address: "Carrera 76 #20f-107, Barrio París, Medellín",
  phone: "316 401 3230",
  email: "contacto@fuentedevida.co",
  whatsappNumber: "573164013230",
  scheduleWeek: "Lunes a Sábado: 7am – 8pm",
  scheduleSunday: "Domingos: 8am – 2pm",
  copyright: "Carnicería Expendio Fuente de Vida — Todos los derechos reservados.",
};

// ─── Helpers localStorage ─────────────────────────────────────────────────────

const KEYS = {
  banner:          "incodol_banner",
  promos:          "incodol_promos",
  blogs:           "incodol_blogs",
  categories:      "incodol_categories",
  footer:          "incodol_footer",
  premiumSections: "incodol_premium_sections",
  premiumCuts:     "incodol_premium_cuts",
} as const;

function load<T>(key: string, fallback: T): T {
  if (typeof window === "undefined") return fallback;
  try {
    const raw = localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : fallback;
  } catch {
    return fallback;
  }
}

function save<T>(key: string, data: T): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(key, JSON.stringify(data));
}

// ─── API pública ──────────────────────────────────────────────────────────────

export const siteData = {
  getBanner:          (): BannerData          => load(KEYS.banner,          defaultBanner),
  getPromos:          (): PromoItem[]         => load(KEYS.promos,          defaultPromos),
  getBlogs:           (): BlogPost[]          => load(KEYS.blogs,           defaultBlogs),
  getCategories:      (): CatalogCategory[]   => load(KEYS.categories,      defaultCategories),
  getFooter:          (): FooterData          => load(KEYS.footer,          defaultFooter),
  getPremiumSections: (): PremiumSection[]    => load(KEYS.premiumSections, defaultPremiumSections),
  getPremiumCuts:     (): PremiumCut[]        => load(KEYS.premiumCuts,     defaultPremiumCuts),

  setBanner:          (d: BannerData)         => save(KEYS.banner,          d),
  setPromos:          (d: PromoItem[])        => save(KEYS.promos,          d),
  setBlogs:           (d: BlogPost[])         => save(KEYS.blogs,           d),
  setCategories:      (d: CatalogCategory[])  => save(KEYS.categories,      d),
  setFooter:          (d: FooterData)         => save(KEYS.footer,          d),
  setPremiumSections: (d: PremiumSection[])   => save(KEYS.premiumSections, d),
  setPremiumCuts:     (d: PremiumCut[])       => save(KEYS.premiumCuts,     d),

  resetBanner:          () => localStorage.removeItem(KEYS.banner),
  resetPromos:          () => localStorage.removeItem(KEYS.promos),
  resetBlogs:           () => localStorage.removeItem(KEYS.blogs),
  resetCategories:      () => localStorage.removeItem(KEYS.categories),
  resetFooter:          () => localStorage.removeItem(KEYS.footer),
  resetPremiumSections: () => localStorage.removeItem(KEYS.premiumSections),
  resetPremiumCuts:     () => localStorage.removeItem(KEYS.premiumCuts),
};
