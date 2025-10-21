"use client";
  
import { ReactNode, useState } from "react";

type AdminPanelTab = {
  id: string;
  label: string;
  content: ReactNode;
};

export default function AdminPanel({
  title = "Panel de Administración",
  tabs,
  initialActiveTabId,
}: {
  title?: string;
  tabs: AdminPanelTab[];
  initialActiveTabId?: string;
}) {
  const [activeTab, setActiveTab] = useState(
    initialActiveTabId ?? (tabs.length > 0 ? tabs[0].id : "")
  );

  const active = tabs.find((t) => t.id === activeTab) ?? tabs[0];

  return (
    <div className="max-w-6xl mx-auto px-4 py-12">
      <h1 className="text-2xl md:text-3xl font-semibold mb-6">{title}</h1>

      <div className="flex gap-4 mb-8">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`px-4 py-2 rounded-xl font-medium transition-all shadow-sm ${
              activeTab === tab.id
                ? "bg-blue-600 text-white shadow-md"
                : "bg-gray-100 text-gray-700 hover:bg-gray-200"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {active?.content}
    </div>
  );
}
