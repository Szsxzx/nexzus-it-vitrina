export interface BlogPost {
  id: string;
  title: string;
  date: string;
  image: string;
  excerpt: string;
  content: string;
}

// Contenido de ejemplo: reemplazar por artículos reales desde el panel de administración.
export const blogs: BlogPost[] = [
  {
    id: "copias-de-seguridad-3-2-1",
    title: "Copias de seguridad: la regla 3-2-1",
    date: "12 Enero 2026",
    image: "/img/products/servidor-rack.svg",
    excerpt: "Una estrategia simple para no perder información de su empresa ante fallos o ransomware.",
    content: `<p>La regla 3-2-1 sigue siendo la base de cualquier plan de respaldo razonable.</p>
<h4>En qué consiste</h4>
<ul>
  <li><strong>3 copias</strong> de sus datos: la original y dos respaldos.</li>
  <li><strong>2 tipos de medio</strong> distintos, por ejemplo disco externo y nube.</li>
  <li><strong>1 copia fuera de sitio</strong> para sobrevivir a un incendio o robo.</li>
</ul>
<h4>Recomendaciones</h4>
<ul>
  <li>Automatice los respaldos; los manuales se olvidan.</li>
  <li>Pruebe la restauración al menos una vez al trimestre.</li>
</ul>`,
  },
  {
    id: "licencias-originales",
    title: "Por qué usar licencias de software originales",
    date: "28 Enero 2026",
    image: "/img/products/licencia-windows-pro.svg",
    excerpt: "Riesgos legales y de seguridad del software sin licencia, y qué opciones hay para pymes.",
    content: `<p>El software sin licencia expone a la empresa a sanciones y a vulnerabilidades sin parches.</p>
<h4>Beneficios del software licenciado</h4>
<ul>
  <li>Actualizaciones de seguridad y soporte del fabricante.</li>
  <li>Cumplimiento ante auditorías y facturación a nombre de la empresa.</li>
  <li>Opciones de suscripción que reducen la inversión inicial.</li>
</ul>`,
  },
  {
    id: "elegir-portatil-empresa",
    title: "Cómo elegir un portátil para su empresa",
    date: "10 Febrero 2026",
    image: "/img/products/portatil-empresarial.svg",
    excerpt: "Procesador, memoria, almacenamiento y garantía: qué mirar según el tipo de trabajo.",
    content: `<p>El mejor portátil no es el más caro, sino el que se ajusta al trabajo del equipo.</p>
<h4>Criterios clave</h4>
<ul>
  <li><strong>Memoria RAM:</strong> 16 GB es hoy un mínimo cómodo para ofimática y videollamadas.</li>
  <li><strong>Almacenamiento:</strong> SSD siempre; 512 GB cubre la mayoría de casos.</li>
  <li><strong>Garantía:</strong> prefiera equipos con garantía en sitio o con repuestos en el país.</li>
</ul>`,
  },
  {
    id: "seguridad-wifi-oficina",
    title: "Seguridad de la red Wi-Fi de la oficina",
    date: "3 Marzo 2026",
    image: "/img/products/router-wifi6.svg",
    excerpt: "Cuatro ajustes que reducen el riesgo en redes inalámbricas empresariales.",
    content: `<p>Muchas intrusiones empiezan en una red Wi-Fi mal configurada.</p>
<h4>Ajustes recomendados</h4>
<ul>
  <li>Use WPA3 o, como mínimo, WPA2 con contraseña robusta.</li>
  <li>Separe la red de invitados de la red interna con una VLAN.</li>
  <li>Cambie las credenciales de administración del router.</li>
  <li>Mantenga el firmware actualizado.</li>
</ul>`,
  },
];
