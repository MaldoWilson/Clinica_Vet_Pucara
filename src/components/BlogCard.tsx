import Link from "next/link";

// Componente para mostrar las cartas de blog
type Props = { 
  blog: { 
    id: string; 
    titulo: string; 
    contenido: string; 
    created_at?: string;
    image_url?: string | null;
  } 
};

export default function BlogCard({ blog }: Props) {
  // Render markdown simple para el resumen (mismo estilo que vista previa)
  function escapeHtml(s: string) {
    return s
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/\"/g, "&quot;")
      .replace(/'/g, "&#39;");
  }

  function applyInline(md: string) {
    let out = md;
    out = out.replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>");
    out = out.replace(/_(.+?)_/g, "<em>$1</em>");
    out = out.replace(/`([^`]+)`/g, "<code class=\"px-1 py-0.5 bg-gray-200 rounded\">$1</code>");
    return out;
  }

  function renderMarkdown(md: string) {
    const src = (md || "").slice(0, 600); // limitar fuente para resumen
    const lines = src.split(/\r?\n/);
    const html: string[] = [];
    let inList = false;
    for (const raw of lines) {
      const h1 = raw.match(/^#\s+(.+)/);
      const h2 = raw.match(/^##\s+(.+)/);
      const h3 = raw.match(/^###\s+(.+)/);
      if (/^\s*-\s+/.test(raw)) {
        if (!inList) {
          html.push('<ul class="list-disc pl-5 mb-2">');
          inList = true;
        }
        const item = applyInline(escapeHtml(raw.replace(/^\s*-\s+/, "")));
        html.push(`<li>${item}</li>`);
        continue;
      } else if (inList) {
        html.push('</ul>');
        inList = false;
      }

      if (h3) {
        html.push(`<h3 class=\"text-base font-semibold mt-2\">${applyInline(escapeHtml(h3[1]))}</h3>`);
      } else if (h2) {
        html.push(`<h2 class=\"text-lg font-bold mt-2\">${applyInline(escapeHtml(h2[1]))}</h2>`);
      } else if (h1) {
        html.push(`<h1 class=\"text-xl font-bold mt-2\">${applyInline(escapeHtml(h1[1]))}</h1>`);
      } else if (raw.trim() === "") {
        html.push('<div class="h-2"></div>');
      } else {
        html.push(`<p class=\"mb-2 leading-relaxed\">${applyInline(escapeHtml(raw))}</p>`);
      }
    }
    if (inList) html.push('</ul>');
    return html.join("");
  }

  // Formatear la fecha
  const formatDate = (dateString?: string) => {
    if (!dateString) return "";
    const date = new Date(dateString);
    return date.toLocaleDateString("es-CL", {
      year: "numeric",
      month: "long",
      day: "numeric"
    });
  };

  return (
    <div className="w-full max-w-sm mx-auto bg-white border border-gray-200 rounded-lg shadow-sm hover:shadow-xl hover:scale-105 transition-all duration-300 cursor-pointer group">
      <Link href={`/blog/${blog.id}`}>
        {blog.image_url && (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={blog.image_url}
            alt={blog.titulo}
            className="rounded-t-lg w-full h-48 object-cover group-hover:brightness-110 transition-all duration-300"
          />
        )}
      </Link>
      <div className="p-5">
        <Link href={`/blog/${blog.id}`}>
          <h5 className="mb-2 text-xl font-bold tracking-tight text-gray-900 line-clamp-2 group-hover:text-indigo-400 transition-colors duration-300">
            {blog.titulo}
          </h5>
        </Link>
        <div className="mb-3 font-normal text-gray-700 relative max-h-28 overflow-hidden">
          <div
            className="text-sm"
            dangerouslySetInnerHTML={{ __html: renderMarkdown(blog.contenido) }}
          />
          <div className="pointer-events-none absolute inset-x-0 bottom-0 h-6 bg-gradient-to-t from-white to-white/0" />
        </div>
        {blog.created_at && (
          <p className="text-xs text-gray-500 font-medium">
            {formatDate(blog.created_at)}
          </p>
        )}
      </div>
    </div>
  );
}
