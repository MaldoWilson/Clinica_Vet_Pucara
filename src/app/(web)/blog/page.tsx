"use client";

import { useEffect, useState } from "react";
import BlogCard from "@/components/BlogCard";
import Image from "next/image";
import blogBanner from "@/app/img/blog.webp";

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

  const HeaderSection = () => (
    <section className="relative h-72 md:h-[260px] flex items-center overflow-hidden -mt-16 lg:-mt-18">
      {/* Imagen de fondo */}
      <div className="absolute inset-0 -z-20">
        <Image
          src={blogBanner}
          alt="Blog Veterinario"
          fill
          priority
          quality={95}
          className="object-cover"
        />
      </div>

      {/* Contenido vacío para mantener el alto */}
      <div className="relative z-10 w-full">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10" />
      </div>

      {/* Efecto ondulado inferior */}
      <div className="absolute bottom-0 left-0 w-full overflow-hidden leading-[0] -z-10 rotate-180 pointer-events-none">
        <svg
          className="relative block w-[140%] md:w-[100%] h-[200px] text-white"
          fill="currentColor"
          data-name="Layer 1"
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 1200 120"
          preserveAspectRatio="none"
        >
          <path d="M321.39,56.44c58-10.79,114.16-30.13,172-41.86,82.39-16.72,168.19-17.73,250.45-.39C823.78,31,906.67,72,985.66,92.83c70.05,18.48,146.53,26.09,214.34,3V0H0V27.35A600.21,600.21,0,0,0,321.39,56.44Z"></path>
        </svg>
      </div>
    </section>
  );

  
  if (loading) {
    return (
      <>
        <HeaderSection />
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
      </>
    );
  }

  if (error) {
    return (
      <>
        <HeaderSection />
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
      </>
    );
  }

  if (blogs.length === 0) {
    return (
      <>
        <HeaderSection />
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
      </>
    );
  }

  return (
    <>
      <HeaderSection />
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
    </>
  );
}
