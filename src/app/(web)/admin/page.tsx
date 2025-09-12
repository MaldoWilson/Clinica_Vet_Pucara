import Link from "next/link";

export default function AdminHome() {
  return (
    <div className="max-w-6xl mx-auto px-4 py-12">
      <h1 className="text-2xl md:text-3xl font-semibold mb-6">Panel de administración</h1>
      <ul className="list-disc ml-6">
        <li><Link href="/admin/citas" className="underline">Reservas</Link></li>
        <li><Link href="/admin/citas" className="underline">Citas</Link></li>
        <li><Link href="/admin/citas" className="underline">Citas</Link></li>
        <li><Link href="/admin/citas" className="underline">Citas</Link></li>

      </ul>
    </div>
  );
}
