"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import BlogCard from "./BlogCard";

type Blog = {
  id: string;
  titulo: string;
  contenido: string;
  created_at?: string;
  image_url?: string | null;
};

export default function LatestBlogs() {
  const [blogs, setBlogs] = useState<Blog[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchBlogs = async () => {
      try {
        const response = await fetch('/api/blogs');
        if (!response.ok) {
          throw new Error('Error al cargar los blogs');
        }
        const data = await response.json();
        // Tomar solo los primeros 4 blogs
        setBlogs(data.blogs.slice(0, 4));
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Error desconocido');
      } finally {
        setLoading(false);
      }
    };

    fetchBlogs();
  }, []);

  if (loading) {
    return (
      <section className="py-16 bg-white">
        <div className="mx-auto max-w-screen-2xl px-6">
          <h2 className="text-3xl font-bold text-center mb-12 text-gray-800">
            Blogs
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 xl:grid-cols-4 gap-8">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="animate-pulse">
                <div className="bg-gray-200 rounded-2xl h-64"></div>
              </div>
            ))}
          </div>
        </div>
      </section>
      
    );
  }

  if (error) {
    return (
      <section className="py-16 bg-white">
        <div className="mx-auto max-w-screen-2xl px-6">
          <h2 className="text-3xl font-bold text-center mb-12 text-gray-800">
            Blogs
          </h2>
          <div className="text-center text-red-600">
            <p>Error al cargar los artículos: {error}</p>
          </div>
        </div>
      </section>
    );
  }

  if (blogs.length === 0) {
    return (
      <section className="py-16 bg-white">
        <div className="mx-auto max-w-screen-2xl px-6">
          <h2 className="text-3xl font-bold text-center mb-12 text-gray-800">
            Blogs
          </h2>
          <div className="text-center text-gray-600">
            <p>No hay artículos disponibles en este momento.</p>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="py-12 sm:py-16 bg-white w-full">
      <div className="mx-auto max-w-screen-2xl px-4 sm:px-6 lg:px-8">
        <h2 className="text-3xl sm:text-4xl font-bold text-center mb-8 sm:mb-12 px-4">
          <span className="text-gray-800">Nuestras </span>
          <span className="text-indigo-400">Recomendaciones</span>
          <div className="w-16 h-0.5 bg-indigo-400 mx-auto mt-2"></div>
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6 lg:gap-8 mb-6 sm:mb-8">

          {blogs.map((blog) => (
            <BlogCard key={blog.id} blog={blog} />
          ))}
        </div>

        <div className="text-center px-4">
          <Link
            href="/blog" className="inline-block px-6 py-3 rounded-lg font-semibold text-white bg-indigo-500 hover:bg-indigo-600 transition-colors duration-300 text-sm sm:text-base">
            Ver Más Artículos

          </Link>
        </div>
      </div>
    </section>
  );
}
