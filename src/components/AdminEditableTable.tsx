"use client";
import Image from "next/image";
import React from "react";

type AdminEditableTableProps<T extends { id: string }> = {
  items: T[];
  loading: boolean;
  emptyText?: string;
  columns: Array<{
    key: string;
    header: string;
    render: (item: T) => React.ReactNode;
    className?: string;
  }>;
  onEdit?: (item: T) => void;
  onDelete?: (id: string) => void;
  onUploadImage?: (id: string, file: File) => Promise<void> | void;
};

export default function AdminEditableTable<T extends { id: string }>(props: AdminEditableTableProps<T>) {
  const { items, loading, emptyText = "Sin registros", columns, onEdit, onDelete, onUploadImage } = props;

  return (
    <div className="bg-white rounded-lg shadow overflow-x-auto">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            {columns.map((c) => (
              <th key={c.key} className={`px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase ${c.className || ""}`}>{c.header}</th>
            ))}
            {(onEdit || onDelete) && <th className="px-4 py-2"></th>}
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-100">
          {loading ? (
            <tr><td className="px-4 py-4" colSpan={columns.length + 1}>Cargando...</td></tr>
          ) : items.length === 0 ? (
            <tr><td className="px-4 py-4" colSpan={columns.length + 1}>{emptyText}</td></tr>
          ) : (
            items.map((item) => (
              <tr key={item.id}>
                {columns.map((c) => (
                  <td key={c.key} className={`px-4 py-2 ${c.className || ""}`}>{c.render(item)}</td>
                ))}
                {(onEdit || onDelete) && (
                  <td className="px-4 py-2">
                    <div className="flex items-center gap-2">
                      {onEdit && (
                        <button onClick={() => onEdit(item)} className="px-3 py-1 rounded border">Editar</button>
                      )}
                      {onDelete && (
                        <button onClick={() => onDelete(item.id)} className="px-3 py-1 rounded bg-red-600 text-white">Eliminar</button>
                      )}
                    </div>
                  </td>
                )}
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}


