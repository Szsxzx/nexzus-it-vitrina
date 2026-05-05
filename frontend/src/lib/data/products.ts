/**
 * Datos del catálogo. En el siguiente sprint vendrán del backend FastAPI.
 * Las imágenes apuntan a /img/* — coloca los archivos en /public/img/ o reemplaza por placeholder.
 */
export type Category = "res" | "cerdo" | "pollo" | "embutidos" | "pescado";

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
  { slug: "lomo-fino-angus", name: "Lomo Fino Angus", category: "res",
    description: "Corte premium ideal para filetes, con marmoleo perfecto",
    price: "$32.000", oldPrice: "$35.500", image: "/img/lomo-fino.jpg",
    rating: 4, reviewCount: 48, discount: "-10%", tags: ["TOP VENTAS", "ORIGEN ARGENTINA"] },

  { slug: "chuleta-cerdo", name: "Chuleta de Cerdo", category: "cerdo",
    description: "Corte fresco y jugoso, ideal para asar o freír",
    price: "$18.500", oldPrice: "$21.800", image: "/img/chuleta-cerdo.jpg",
    rating: 3, reviewCount: 32, discount: "-15%", tags: ["ANTIOQUIA"] },

  { slug: "pechuga-pollo-organico", name: "Pechuga de Pollo Orgánico", category: "pollo",
    description: "Pechuga deshuesada y sin piel, de crianza orgánica",
    price: "$12.900", image: "/img/pechuga-pollo.jpg",
    rating: 5, reviewCount: 65, tags: ["ORGÁNICO", "SANTANDER"] },

  { slug: "carne-molida", name: "Carne Molida Premium", category: "res",
    description: "Mezcla 80/20 perfecta para hamburguesas y salsas",
    price: "$25.600", image: "/img/carne-molida.jpg",
    rating: 4, reviewCount: 41, tags: ["RECOMENDADO"] },

  { slug: "tomahawk", name: "Tomahawk Steak", category: "res",
    description: "Filete grueso con hueso, perfecto para parrilla",
    price: "$68.000", oldPrice: "$77.300", image: "/img/tomahawk.jpg",
    rating: 4.5, reviewCount: 28, discount: "-12%", tags: ["PREMIUM", "NUEVO"] },

  { slug: "chorizos-artesanales", name: "Chorizos Artesanales", category: "embutidos",
    description: "Elaborados con especias seleccionadas",
    price: "$15.800", image: "/img/chorizos.jpg",
    rating: 4, reviewCount: 56, tags: ["RECETA TRADICIONAL"] },

  { slug: "costillas-bbq", name: "Costillas BBQ", category: "cerdo",
    description: "Marinadas en salsa BBQ casera, listas para asar",
    price: "$25.900", oldPrice: "$31.600", image: "/img/costillas-bbq.jpg",
    rating: 4, reviewCount: 39, discount: "-18%", tags: ["INCLUYE SALSA"] },

  { slug: "alitas-picantes", name: "Alitas Picantes", category: "pollo",
    description: "Marinadas en salsa picante artesanal",
    price: "$15.500", image: "/img/alitas-picantes.jpg",
    rating: 4.5, reviewCount: 47, tags: ["PICANTE MEDIO"] },
];

export const categoriesMeta: { id: Category; label: string; cssClass: string }[] = [
  { id: "res",       label: "Cortes de Res",      cssClass: "from-rojo to-rojo-mid" },
  { id: "cerdo",     label: "Cortes de Cerdo",    cssClass: "from-pink-700 to-pink-900" },
  { id: "pollo",     label: "Cortes de Pollo",    cssClass: "from-amber-600 to-amber-800" },
  { id: "embutidos", label: "Embutidos",          cssClass: "from-orange-700 to-red-900" },
  { id: "pescado",   label: "Cortes de Pescado",  cssClass: "from-azul to-azul-dark" },
];
