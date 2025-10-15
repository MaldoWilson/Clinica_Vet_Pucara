"use client";

import BlogsForm from "@/components/BlogsForm";

export default function AdminBlogsPage() {
  return (
    <div className="space-y-6 px-4 py-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Gestión de Blogs</h1>
          <p className="text-gray-600">Crea y administra publicaciones del sitio</p>
        </div>
      </div>
      <BlogsForm />
    </div>
  );
}


