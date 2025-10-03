"use client";

import { useState, useEffect } from "react";
import CalendarView from "@/components/CalendarView";

export default function AdminCalendarioPage() {
  return (
    <div className="px-4 py-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Calendario de Citas</h1>
        <p className="text-gray-600 mt-1">Visualiza y gestiona las citas confirmadas</p>
      </div>
      
      <CalendarView />
    </div>
  );
}
