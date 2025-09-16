"use client";

import { useEffect, useState } from "react";
import BlogCard from "@/components/BlogCard";

type Blog = {
  id: string;
  titulo: string;
  contenido: string;
  created_at?: string;
};

export default function BlogPage() {
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
        setBlogs(data.blogs);
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
      <div className="min-h-screen bg-gray-50 py-16">
        <div className="container mx-auto px-4">
        <h2 className="text-4xl font-bold text-center mb-12">
          <span className="text-gray-800">Blog </span>
          <span className="text-indigo-400">Veterinario</span>
          <div className="w-16 h-0.5 bg-indigo-400 mx-auto mt-2"></div>
        </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="animate-pulse">
                <div className="bg-gray-200 rounded-2xl h-64"></div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 py-16">
        <div className="container mx-auto px-4">
        <h2 className="text-4xl font-bold text-center mb-12">
          <span className="text-gray-800">Blog </span>
          <span className="text-indigo-400">Veterinario</span>
          <div className="w-16 h-0.5 bg-indigo-400 mx-auto mt-2"></div>
        </h2>
          <div className="text-center text-red-600">
            <p>Error al cargar los artículos: {error}</p>
          </div>
        </div>
      </div>
    );
  }

  if (blogs.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 py-16">
        <div className="container mx-auto px-4">
        <h2 className="text-4xl font-bold text-center mb-12">
          <span className="text-gray-800">Blog </span>
          <span className="text-indigo-400">Veterinario</span>
          <div className="w-16 h-0.5 bg-indigo-400 mx-auto mt-2"></div>
        </h2>
          <div className="text-center text-gray-600">
            <p>No hay artículos disponibles en este momento.</p>
            <p className="mt-2">Pronto publicaremos contenido interesante sobre el cuidado de tus mascotas.</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="py-20">
      <div className="container mx-auto">
      <h2 className="text-4xl font-bold text-center mb-12">
          <span className="text-gray-800">Blog </span>
          <span className="text-indigo-400">Veterinario</span>
          <div className="w-16 h-0.5 bg-indigo-400 mx-auto mt-2"></div>
        </h2>
        <p className="text-center text-gray-600 mb-12 max-w-2xl mx-auto">
          Descubre consejos, noticias y artículos sobre el cuidado de tus mascotas, 
          escritos por nuestros veterinarios especialistas.
        </p>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {blogs.map((blog) => (
            <BlogCard key={blog.id} blog={blog} />
          ))}
        </div>
      </div>
    </div>
  );
}
