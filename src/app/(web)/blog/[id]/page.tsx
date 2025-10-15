"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";

type Blog = {
  id: string;
  titulo: string;
  contenido: string;
  created_at?: string;
  image_url?: string | null;
};

export default function BlogDetailPage() {
  const params = useParams();
  const router = useRouter();
  const [blog, setBlog] = useState<Blog | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchBlog = async () => {
      try {
        const response = await fetch('/api/blogs');
        if (!response.ok) {
          throw new Error('Error al cargar el blog');
        }
        const data = await response.json();
        const foundBlog = data.blogs.find((b: Blog) => b.id.toString() === params.id);
        
        if (!foundBlog) {
          throw new Error('Blog no encontrado');
        }
        
        setBlog(foundBlog);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Error desconocido');
      } finally {
        setLoading(false);
      }
    };

    if (params.id) {
      fetchBlog();
    }
  }, [params.id]);

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

  // Render Markdown simple (mismo formato que vista previa del admin)
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
    const lines = (md || "").split(/\r?\n/);
    const html: string[] = [];
    let inList = false;
    for (const raw of lines) {
      const h1 = raw.match(/^#\s+(.+)/);
      const h2 = raw.match(/^##\s+(.+)/);
      const h3 = raw.match(/^###\s+(.+)/);
      if (/^\s*-\s+/.test(raw)) {
        if (!inList) {
          html.push('<ul class="list-disc pl-6 mb-2">');
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
        html.push(`<h3 class=\"text-lg font-semibold mt-3\">${applyInline(escapeHtml(h3[1]))}</h3>`);
      } else if (h2) {
        html.push(`<h2 class=\"text-xl font-bold mt-3\">${applyInline(escapeHtml(h2[1]))}</h2>`);
      } else if (h1) {
        html.push(`<h1 class=\"text-2xl font-bold mt-3\">${applyInline(escapeHtml(h1[1]))}</h1>`);
      } else if (raw.trim() === "") {
        html.push('<div class="h-2"></div>');
      } else {
        html.push(`<p class=\"mb-2 leading-relaxed\">${applyInline(escapeHtml(raw))}</p>`);
      }
    }
    if (inList) html.push('</ul>');
    return html.join("");
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 py-16">
        <div className="container mx-auto px-4 max-w-4xl">
          <div className="animate-pulse">
            <div className="bg-gray-200 h-8 w-3/4 mb-4 rounded"></div>
            <div className="bg-gray-200 h-4 w-1/4 mb-8 rounded"></div>
            <div className="space-y-4">
              <div className="bg-gray-200 h-4 rounded"></div>
              <div className="bg-gray-200 h-4 rounded"></div>
              <div className="bg-gray-200 h-4 w-3/4 rounded"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 py-16">
        <div className="container mx-auto px-4 max-w-4xl">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-red-600 mb-4">Error</h1>
            <p className="text-gray-600 mb-8">{error}</p>
            <Link 
              href="/blog"
              className="inline-flex items-center px-6 py-3 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition-colors duration-200"
            >
              <svg 
                className="mr-2 w-4 h-4" 
                fill="none" 
                stroke="currentColor" 
                viewBox="0 0 24 24"
              >
                <path 
                  strokeLinecap="round" 
                  strokeLinejoin="round" 
                  strokeWidth={2} 
                  d="M15 19l-7-7 7-7" 
                />
              </svg>
              Volver a Blogs
            </Link>
          </div>
        </div>
      </div>
    );
  }

  if (!blog) {
    return (
      <div className="min-h-screen bg-gray-50 py-16">
        <div className="container mx-auto px-4 max-w-4xl">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-gray-800 mb-4">Blog no encontrado</h1>
            <p className="text-gray-600 mb-8">El artículo que buscas no existe o ha sido eliminado.</p>
            <Link 
              href="/blog"
              className="inline-flex items-center px-6 py-3 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition-colors duration-200"
            >
              <svg 
                className="mr-2 w-4 h-4" 
                fill="none" 
                stroke="currentColor" 
                viewBox="0 0 24 24"
              >
                <path 
                  strokeLinecap="round" 
                  strokeLinejoin="round" 
                  strokeWidth={2} 
                  d="M15 19l-7-7 7-7" 
                />
              </svg>
              Volver a Blogs
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-16">
      <div className="container mx-auto px-4 max-w-4xl">
        {/* Navegación */}
        <div className="mb-8">
          <Link 
            href="/blog"
            className="inline-flex items-center text-blue-600 hover:text-blue-800 transition-colors duration-200"
          >
            <svg 
              className="mr-2 w-4 h-4" 
              fill="none" 
              stroke="currentColor" 
              viewBox="0 0 24 24"
            >
              <path 
                strokeLinecap="round" 
                strokeLinejoin="round" 
                strokeWidth={2} 
                d="M15 19l-7-7 7-7" 
              />
            </svg>
            Volver a Blogs
          </Link>
        </div>

        {/* Contenido del blog sin estilo de tarjeta */}
        <article className="">
          {blog.image_url && (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={blog.image_url}
              alt={blog.titulo}
              className="w-full h-72 md:h-96 object-cover rounded-xl mb-6"
            />
          )}

          <header className="mb-6">
            <h1 className="text-4xl font-bold text-gray-800 mb-3 leading-tight">
              {blog.titulo}
            </h1>
            {blog.created_at && (
              <p className="text-gray-500 text-lg">
                Publicado el {formatDate(blog.created_at)}
              </p>
            )}
          </header>

          <div className="prose prose-lg max-w-none text-gray-700 leading-relaxed">
            <div
              dangerouslySetInnerHTML={{ __html: renderMarkdown(blog.contenido) }}
            />
          </div>
        </article>
      </div>
    </div>
  );
}
