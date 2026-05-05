export interface BlogPost {
  id: string;
  title: string;
  date: string;
  image: string;
  excerpt: string;
  content: string;
}

export const blogs: BlogPost[] = [
  {
    id: "como-cocinar-carne",
    title: "Cómo cocinar la carne perfecta",
    date: "15 Enero 2023",
    image: "/img/blog-cocinar-carne.jpg",
    excerpt: "Aprende los secretos para lograr el punto perfecto de cocción, desde rare hasta well done.",
    content: `<p>Lograr el punto perfecto de cocción es un arte que todo amante de la carne debe dominar.</p>
<h4>🥩 Los puntos de cocción</h4>
<ul>
  <li><strong>Azul (Blue):</strong> Sellado por fuera, rojo y frío por dentro. 1-2 min por lado.</li>
  <li><strong>Poco hecho (Rare):</strong> Rojo y tibio en el centro. 2-3 min por lado.</li>
  <li><strong>Término medio (Medium Rare):</strong> Rosa en el centro, jugoso. 3-4 min por lado.</li>
  <li><strong>Tres cuartos (Medium Well):</strong> Apenas rosado. 4-5 min por lado.</li>
  <li><strong>Bien cocido (Well Done):</strong> Sin rosado. 5-6 min por lado.</li>
</ul>
<h4>🔥 Consejos clave</h4>
<ul>
  <li>Saca la carne del refrigerador 30 minutos antes de cocinar.</li>
  <li>Seca la superficie con papel absorbente antes de poner al fuego.</li>
  <li>No presiones la carne con la espátula — pierdes los jugos.</li>
  <li>Deja reposar 5 minutos antes de cortar.</li>
</ul>`,
  },
  {
    id: "guia-cortes",
    title: "Guía de cortes de carne",
    date: "22 Febrero 2023",
    image: "/img/blog-cortes.jpg",
    excerpt: "Descubre los diferentes cortes, sus características y las mejores formas de prepararlos.",
    content: `<p>Conocer los diferentes cortes te ayuda a elegir el más adecuado para cada preparación.</p>
<h4>🐄 Cortes de Res populares</h4>
<ul>
  <li><strong>Lomo fino:</strong> Suave y magro, ideal para filetes.</li>
  <li><strong>Tomahawk:</strong> Con hueso largo, espectacular para parrilla.</li>
  <li><strong>Punta de anca:</strong> Corte brasileño muy jugoso.</li>
  <li><strong>Costilla:</strong> Cocción lenta para máxima terneza.</li>
  <li><strong>Carne molida:</strong> Mezcla 80/20 para hamburguesas.</li>
</ul>`,
  },
  {
    id: "marinar",
    title: "Técnicas para marinar carne",
    date: "10 Marzo 2023",
    image: "/img/blog-marinar.jpg",
    excerpt: "Recetas y técnicas profesionales para marinar tus carnes y realzar su sabor.",
    content: `<p>Marinar correctamente transforma una carne ordinaria en algo extraordinario.</p>
<h4>🧄 Marinada básica universal</h4>
<ul>
  <li>Aceite de oliva (base grasa)</li>
  <li>Jugo de limón o vinagre (ácido — ablanda fibras)</li>
  <li>Ajo machacado + hierbas frescas</li>
  <li>Sal, pimienta y paprika al gusto</li>
</ul>
<h4>⏱️ Tiempos recomendados</h4>
<ul>
  <li><strong>Pollo:</strong> 2 a 8 horas en refrigeración.</li>
  <li><strong>Cerdo:</strong> 4 a 12 horas.</li>
  <li><strong>Res (cortes gruesos):</strong> 6 a 24 horas.</li>
</ul>`,
  },
  {
    id: "asado",
    title: "Consejos para un asado perfecto",
    date: "25 Marzo 2023",
    image: "/img/blog-asado.jpg",
    excerpt: "Desde el encendido del fuego hasta el corte final, domina el arte del asado.",
    content: `<p>El asado es toda una ceremonia. Cada paso importa.</p>
<h4>🔥 El fuego correcto</h4>
<ul>
  <li>Carbón de buena calidad o leña de maderas duras.</li>
  <li>Brasas completamente encendidas — sin llama viva.</li>
  <li>Crea zonas de alta y baja temperatura.</li>
</ul>`,
  },
  {
    id: "higiene",
    title: "Higiene y manipulación de carne",
    date: "2 Abril 2023",
    image: "/img/blog-higiene.jpg",
    excerpt: "Mantén la calidad y seguridad alimentaria con estos consejos prácticos.",
    content: `<p>La seguridad alimentaria no es opcional.</p>
<h4>❄️ Almacenamiento correcto</h4>
<ul>
  <li><strong>Refrigerador (0-4°C):</strong> Carne fresca: 1-2 días.</li>
  <li><strong>Congelador (-18°C):</strong> Res hasta 12 meses.</li>
</ul>`,
  },
  {
    id: "hamburguesas",
    title: "Receta casera de hamburguesas",
    date: "10 Abril 2023",
    image: "/img/blog-receta-hamburguesa.jpg",
    excerpt: "Prepará hamburguesas jugosas y sabrosas desde cero.",
    content: `<p>Una hamburguesa perfecta empieza por la carne correcta.</p>
<h4>🛒 Ingredientes (4 hamburguesas)</h4>
<ul>
  <li>500g de carne molida 80/20</li>
  <li>1 cdita de sal gruesa</li>
  <li>½ cdita de pimienta negra</li>
  <li>1 cdita de ajo en polvo</li>
</ul>`,
  },
];
