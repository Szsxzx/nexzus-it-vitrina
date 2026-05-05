const features = [
  { icon: "fa-truck",       title: "Envío gratuito",      text: "En pedidos superiores a $100.000 en Medellín" },
  { icon: "fa-certificate", title: "Calidad garantizada", text: "Certificación INVIMA y trazabilidad completa" },
  { icon: "fa-percent",     title: "Descuentos",          text: "Programa de fidelidad para clientes frecuentes" },
  { icon: "fa-clock",       title: "Horario extendido",   text: "Lunes a Sábado 7am - 8pm" },
];

export default function Features() {
  return (
    <section className="container mx-auto px-4 py-12 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
      {features.map((f) => (
        <div key={f.title} className="bg-white rounded-xl p-5 shadow-sm border flex gap-4">
          <i className={`fa-solid ${f.icon} text-3xl text-rojo`} />
          <div>
            <div className="font-semibold">{f.title}</div>
            <p className="text-sm text-gray-600">{f.text}</p>
          </div>
        </div>
      ))}
    </section>
  );
}
