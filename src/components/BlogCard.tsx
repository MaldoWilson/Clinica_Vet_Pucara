import Link from "next/link";

// Componente para mostrar las cartas de blog
type Props = { 
  blog: { 
    id: string; 
    titulo: string; 
    contenido: string; 
    created_at?: string;
  } 
};

export default function BlogCard({ blog }: Props) {
  // Truncar el contenido para mostrar solo un resumen
  const truncateContent = (content: string, maxLength: number = 150) => {
    if (content.length <= maxLength) return content;
    return content.substring(0, maxLength) + "...";
  };

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
    <Link href={`/blog/${blog.id}`} className="block">
      <article className="rounded-2xl border p-6 hover:shadow-lg transition-all duration-300 bg-white cursor-pointer h-full">
        <h3 className="font-semibold text-xl mb-3 text-gray-800 line-clamp-2">{blog.titulo}</h3>
        <p className="text-sm text-gray-600 mb-4 leading-relaxed line-clamp-3">
          {truncateContent(blog.contenido)}
        </p>
        {blog.created_at && (
          <p className="text-xs text-gray-500 mt-auto">
            {formatDate(blog.created_at)}
          </p>
        )}
      </article>
    </Link>
  );
}
