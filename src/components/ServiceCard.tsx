type Props = { service: { id?: string; name: string; description: string; price_clp?: number } };
export default function ServiceCard({ service }: Props) {
  return (
    <article className="rounded-2xl border p-5 hover:shadow-md transition">
      <h3 className="font-semibold text-lg">{service.name}</h3>
      <p className="text-sm text-neutral-600 mt-1">{service.description}</p>
      {service.price_clp ? (
        <p className="mt-2 text-sm">Desde ${service.price_clp.toLocaleString("es-CL")}</p>
      ) : null}
    </article>
  );
}
