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
    <div className="max-w-sm bg-white border border-gray-200 rounded-lg shadow-sm dark:bg-gray-800 dark:border-gray-700">
      <Link href={`/blog/${blog.id}`}>
        {blog.image_url && (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={blog.image_url}
            alt={blog.titulo}
            className="rounded-t-lg w-full h-48 object-cover"
          />
        )}
      </Link>
      <div className="p-5">
        <Link href={`/blog/${blog.id}`}>
          <h5 className="mb-2 text-2xl font-bold tracking-tight text-gray-900 dark:text-white line-clamp-2">
            {blog.titulo}
          </h5>
        </Link>
        <p className="mb-3 font-normal text-gray-700 dark:text-gray-400 line-clamp-3">
          {truncateContent(blog.contenido)}
        </p>
        <Link 
          href={`/blog/${blog.id}`} 
          className="inline-flex items-center px-3 py-2 text-sm font-medium text-center text-white bg-blue-700 rounded-lg hover:bg-blue-800 focus:ring-4 focus:outline-none focus:ring-blue-300 dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800"
        >
          Leer más
          <svg className="rtl:rotate-180 w-3.5 h-3.5 ms-2" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 14 10">
            <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M1 5h12m0 0L9 1m4 4L9 9"/>
          </svg>
        </Link>
        {blog.created_at && (
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
            {formatDate(blog.created_at)}
          </p>
        )}
      </div>
    </div>
  );
}
