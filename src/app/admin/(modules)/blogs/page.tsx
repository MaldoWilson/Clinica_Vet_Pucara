"use client";

import BlogsForm from "@/components/BlogsForm";

export default function AdminBlogsPage() {
  return (
    <div className="px-4 py-8">
      <div className="mb-6 max-w-5xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900">Gestión de Blogs</h1>
        <p className="text-gray-600 mt-1">Crea y administra publicaciones del sitio</p>
      </div>
      <div className="max-w-5xl mx-auto">
        <BlogsForm />
      </div>
    </div>
  );
}


