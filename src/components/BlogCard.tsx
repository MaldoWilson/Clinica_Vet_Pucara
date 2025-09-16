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
    <div className="max-w-sm bg-white border border-gray-200 rounded-lg shadow-sm hover:shadow-xl hover:scale-105 transition-all duration-300 cursor-pointer group">
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
          <h5 className="mb-2 text-2xl font-bold tracking-tight text-gray-900 line-clamp-2 group-hover:text-gray-900 transition-colors duration-300">
            {blog.titulo}
          </h5>
        </Link>
        <p className="mb-3 font-normal text-gray-700 line-clamp-3">
          {truncateContent(blog.contenido)}
        </p>
        {blog.created_at && (
          <p className="text-xs text-gray-500 font-medium">
            {formatDate(blog.created_at)}
          </p>
        )}
      </div>
    </div>
  );
}
