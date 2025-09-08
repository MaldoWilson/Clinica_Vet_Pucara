// Componente de footer 
export default function Footer() {
  return (
    <footer className="border-t mt-12">
      <div className="max-w-6xl mx-auto px-4 py-8 text-sm text-neutral-600">
        © {new Date().getFullYear()} Clínica Veterinaria Pucará – San Bernardo
        
      </div>
    </footer>
  );
}
