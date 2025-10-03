"use client";

import { useState, useEffect, useMemo } from "react";

interface Cita {
  id: string;
  tutor_nombre: string;
  tutor_telefono?: string;
  tutor_email?: string;
  mascota_nombre: string;
  estado: string;
  notas?: string;
  inicio: string;
  fin: string;
  servicios: {
    nombre: string;
    duracion_min: number;
  };
  horarios: {
    inicio: string;
    fin: string;
  };
}

interface CalendarViewProps {}

export default function CalendarView({}: CalendarViewProps) {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [viewMode, setViewMode] = useState<"semana" | "dia" | "mes">("semana");
  const [showMiniCalendar, setShowMiniCalendar] = useState(false);
  const [citas, setCitas] = useState<Cita[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCita, setSelectedCita] = useState<Cita | null>(null);
  const [showCitaModal, setShowCitaModal] = useState(false);

  // Función para obtener citas
  const fetchCitas = async () => {
      try {
        setLoading(true);
        const response = await fetch("/api/citas");
        const data = await response.json();
        
        if (data.ok) {
          // Filtrar citas para mostrar en el calendario (temporalmente incluir PENDIENTE para debug)
          const citasVisibles = data.citas?.filter((cita: any) => 
            cita.estado === "CONFIRMADA" || cita.estado === "ATENDIDA" || cita.estado === "PENDIENTE"
          ) || [];
          
          console.log(`Cargadas ${citasVisibles.length} citas confirmadas/atendidas`);
          console.log("Todas las citas recibidas:", data.citas);
          
          // Debug: mostrar detalles de las citas
          citasVisibles.forEach((cita: any, index: number) => {
            console.log(`Cita ${index + 1}:`, {
              mascota: cita.mascota_nombre,
              servicio: cita.servicios?.nombre,
              duracion: cita.servicios?.duracion_min,
              inicio: cita.inicio,
              fin: cita.fin,
              estado: cita.estado
            });
          });
          
          setCitas(citasVisibles);
        } else {
          console.error("Error en la respuesta de la API:", data);
        }
      } catch (error) {
        console.error("Error fetching citas:", error);
      } finally {
        setLoading(false);
      }
    };

  // Obtener citas al cargar el componente
  useEffect(() => {
    fetchCitas();
  }, []);

  // Calcular fechas de la semana actual
  const weekDates = useMemo(() => {
    const startOfWeek = new Date(currentDate);
    const day = startOfWeek.getDay();
    const diff = startOfWeek.getDate() - day + (day === 0 ? -6 : 1); // Lunes
    startOfWeek.setDate(diff);
    
    const dates = [];
    for (let i = 0; i < 7; i++) {
      const date = new Date(startOfWeek);
      date.setDate(startOfWeek.getDate() + i);
      dates.push(date);
    }
    return dates;
  }, [currentDate]);

  // Calcular fechas del mes actual
  const monthDates = useMemo(() => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const startDate = new Date(firstDay);
    startDate.setDate(startDate.getDate() - firstDay.getDay() + 1); // Lunes
    
    const dates = [];
    for (let i = 0; i < 42; i++) { // 6 semanas
      const date = new Date(startDate);
      date.setDate(startDate.getDate() + i);
      dates.push(date);
    }
    return dates;
  }, [currentDate]);

  // Configuración del calendario
  const startHour = 9; // inicio a las 09:00
  const endHour = 20;  // fin del día visual
  const slotHeightPx = 48; // alto de cada bloque de 30 min

  // Calcular slots de tiempo
  const timeSlots = useMemo(() => {
    const slots = [];
    for (let hour = startHour; hour < endHour; hour++) {
      for (let minute = 0; minute < 60; minute += 30) {
        const time = new Date();
        time.setHours(hour, minute, 0, 0);
        slots.push(time);
      }
    }
    return slots;
  }, [startHour, endHour]);

  // Formatear fecha para mostrar
  const formatDate = (date: Date) => {
    return date.toLocaleDateString("es-ES", {
      day: "numeric",
      month: "short",
    });
  };

  // Formatear fecha completa
  const formatFullDate = (date: Date) => {
    return date.toLocaleDateString("es-ES", {
      day: "numeric",
      month: "long",
      year: "numeric",
    });
  };

  // Formatear hora
  const formatTime = (date: Date) => {
    return date.toLocaleTimeString("es-ES", {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  // YMD local (evita cambios por zona horaria al usar toISOString)
  const getLocalYMD = (d: Date) => {
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${y}-${m}-${day}`;
  };

  // Obtener citas para una fecha específica
  const getCitasForDate = (date: Date) => {
    const dateStr = getLocalYMD(date);
    console.log(`Buscando citas para fecha: ${dateStr}`);
    console.log(`Total de citas disponibles: ${citas.length}`);
    
    const citasDelDia = citas.filter(cita => {
      if (!cita.inicio) {
        console.log("Cita sin inicio:", cita);
        return false;
      }
      const citaDate = new Date(cita.inicio);
      const citaDateStr = getLocalYMD(citaDate);
      const matches = citaDateStr === dateStr;
      if (matches) {
        console.log(`Cita encontrada para ${dateStr}:`, cita.mascota_nombre, cita.inicio);
      }
      return matches;
    });
    
    console.log(`Citas encontradas para ${dateStr}: ${citasDelDia.length}`);
    return citasDelDia;
  };

  // Obtener citas para un slot de tiempo específico
  const getCitasForTimeSlot = (date: Date, timeSlot: Date) => {
    const citasDelDia = getCitasForDate(date);
    const slotTimeStr = timeSlot.toLocaleTimeString();
    console.log(`Buscando citas para slot: ${slotTimeStr}`);
    
    const citasEnSlot = citasDelDia.filter(cita => {
      if (!cita.inicio) return false;
      
      const citaStart = new Date(cita.inicio);
      const slotStart = new Date(timeSlot);
      
      // Verificar si la cita comienza en este slot de 30 minutos
      const citaHour = citaStart.getHours();
      const citaMinute = citaStart.getMinutes();
      const slotHour = slotStart.getHours();
      const slotMinute = slotStart.getMinutes();
      
      const matches = citaHour === slotHour && citaMinute >= slotMinute && citaMinute < slotMinute + 30;
      if (matches) {
        console.log(`Cita encontrada en slot ${slotTimeStr}:`, cita.mascota_nombre, citaStart.toLocaleTimeString());
      }
      
      // La cita debe comenzar en este slot de 30 minutos
      return matches;
    });
    
    console.log(`Citas en slot ${slotTimeStr}: ${citasEnSlot.length}`);
    return citasEnSlot;
  };

  // Navegar entre semanas
  const navigateWeek = (direction: "prev" | "next") => {
    const newDate = new Date(currentDate);
    newDate.setDate(currentDate.getDate() + (direction === "next" ? 7 : -7));
    setCurrentDate(newDate);
  };

  // Navegar entre días
  const navigateDay = (direction: "prev" | "next") => {
    const newDate = new Date(currentDate);
    newDate.setDate(currentDate.getDate() + (direction === "next" ? 1 : -1));
    setCurrentDate(newDate);
  };

  // Navegar entre meses
  const navigateMonth = (direction: "prev" | "next") => {
    const newDate = new Date(currentDate);
    newDate.setMonth(currentDate.getMonth() + (direction === "next" ? 1 : -1));
    setCurrentDate(newDate);
  };

  // Navegar según el modo de vista
  const navigate = (direction: "prev" | "next") => {
    if (viewMode === "semana") {
      navigateWeek(direction);
    } else if (viewMode === "dia") {
      navigateDay(direction);
    } else if (viewMode === "mes") {
      navigateMonth(direction);
    }
  };

  // Ir a hoy
  const goToToday = () => {
    setCurrentDate(new Date());
  };

  // Seleccionar fecha del mini calendario
  const selectDate = (date: Date) => {
    setCurrentDate(date);
    setShowMiniCalendar(false);
  };

  // Manejar clic en cita
  const handleCitaClick = (cita: Cita) => {
    setSelectedCita(cita);
    setShowCitaModal(true);
  };

  // Cerrar modal
  const closeModal = () => {
    setShowCitaModal(false);
    setSelectedCita(null);
  };

  // Generar días del mes para el mini calendario
  const generateMiniCalendarDays = (date: Date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const startDate = new Date(firstDay);
    startDate.setDate(startDate.getDate() - firstDay.getDay() + 1); // Lunes
    
    const days = [];
    for (let i = 0; i < 42; i++) {
      const day = new Date(startDate);
      day.setDate(startDate.getDate() + i);
      days.push(day);
    }
    return days;
  };

  const miniCalendarDays = generateMiniCalendarDays(currentDate);
  const monthNames = [
    "enero", "febrero", "marzo", "abril", "mayo", "junio",
    "julio", "agosto", "septiembre", "octubre", "noviembre", "diciembre"
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Cargando citas...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200">
      {/* Header del calendario */}
      <div className="flex items-center justify-between p-4 border-b border-gray-200 bg-indigo-400 text-white">
        <div className="flex items-center space-x-4">
            <button
              onClick={goToToday}
              className="px-3 py-1.5 text-sm font-medium text-indigo-400 bg-white rounded-md hover:bg-gray-100 transition-colors"
            >
              Hoy
            </button>
            
            <button
              onClick={fetchCitas}
              className="px-3 py-1.5 text-sm font-medium text-indigo-400 bg-white rounded-md hover:bg-gray-100 transition-colors"
            >
              Actualizar
            </button>
          
          <div className="flex items-center space-x-2">
            <button
              onClick={() => navigate("prev")}
              className="p-1.5 text-white hover:bg-indigo-500 rounded-md transition-colors"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>
            
            <button
              onClick={() => setShowMiniCalendar(!showMiniCalendar)}
              className="px-3 py-1.5 text-sm font-medium text-indigo-400 bg-white border border-white rounded-md hover:bg-gray-100 transition-colors"
            >
              {viewMode === "semana" 
                ? `${formatDate(weekDates[0])} - ${formatDate(weekDates[6])} ${currentDate.getFullYear()}`
                : viewMode === "dia"
                ? `${formatFullDate(currentDate)}`
                : `${monthNames[currentDate.getMonth()]} ${currentDate.getFullYear()}`
              }
            </button>
            
            <button
              onClick={() => navigate("next")}
              className="p-1.5 text-white hover:bg-indigo-500 rounded-md transition-colors"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </button>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          <button className="flex items-center space-x-2 px-3 py-1.5 text-sm text-indigo-400 bg-white border border-white rounded-md hover:bg-gray-100 transition-colors">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
            </svg>
            <span>Filtrar</span>
          </button>
          
          <div className="relative">
            <select
              value={viewMode}
              onChange={(e) => setViewMode(e.target.value as "semana" | "dia" | "mes")}
              className="px-3 py-1.5 text-sm text-indigo-400 bg-white border border-white rounded-md hover:bg-gray-100 transition-colors appearance-none pr-8"
            >
              <option value="semana">SEMANA</option>
              <option value="mes">MES</option>
            </select>
            <div className="absolute inset-y-0 right-0 flex items-center pr-2 pointer-events-none">
              <svg className="w-4 h-4 text-indigo-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </div>
          </div>
        </div>
      </div>

      {/* Mini calendario desplegable */}
      {showMiniCalendar && (
        <div className="absolute z-10 mt-2 bg-white border border-gray-200 rounded-lg shadow-lg p-4">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-medium text-gray-900">
              {monthNames[currentDate.getMonth()]} de {currentDate.getFullYear()}
            </h3>
            <div className="flex space-x-1">
              <button
                onClick={() => {
                  const newDate = new Date(currentDate);
                  newDate.setMonth(newDate.getMonth() - 1);
                  setCurrentDate(newDate);
                }}
                className="p-1 text-gray-600 hover:bg-gray-100 rounded"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
              </button>
              <button
                onClick={() => {
                  const newDate = new Date(currentDate);
                  newDate.setMonth(newDate.getMonth() + 1);
                  setCurrentDate(newDate);
                }}
                className="p-1 text-gray-600 hover:bg-gray-100 rounded"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </button>
            </div>
          </div>
          
          <div className="grid grid-cols-7 gap-1 mb-2">
            {["lun", "mar", "mié", "jue", "vie", "sáb", "dom"].map(day => (
              <div key={day} className="text-xs text-gray-500 text-center py-1">
                {day}
              </div>
            ))}
          </div>
          
          <div className="grid grid-cols-7 gap-1">
            {miniCalendarDays.map((day, index) => {
              const isCurrentMonth = day.getMonth() === currentDate.getMonth();
              const isToday = day.toDateString() === new Date().toDateString();
              const isSelected = day.toDateString() === currentDate.toDateString();
              
              return (
                <button
                  key={index}
                  onClick={() => selectDate(day)}
                  className={`w-8 h-8 text-xs rounded-md transition-colors ${
                    isCurrentMonth
                      ? isSelected
                        ? "bg-blue-600 text-white"
                        : isToday
                        ? "bg-blue-100 text-blue-600"
                        : "text-gray-900 hover:bg-gray-100"
                      : "text-gray-400"
                  }`}
                >
                  {day.getDate()}
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Vista del calendario */}
      <div className="relative">
        {viewMode === "mes" ? (
          /* Vista mensual */
          <div className="p-4">
            <div className="grid grid-cols-7 gap-1">
              {/* Headers de días */}
              {["Lun", "Mar", "Mié", "Jue", "Vie", "Sáb", "Dom"].map(day => (
                <div key={day} className="p-2 text-center text-sm font-medium text-gray-500 bg-gray-50">
                  {day}
                </div>
              ))}
              
              {/* Días del mes */}
              {monthDates.map((date, index) => {
                const isCurrentMonth = date.getMonth() === currentDate.getMonth();
                const isToday = date.toDateString() === new Date().toDateString();
                const citasDelDia = getCitasForDate(date);
                
                return (
                  <div
                    key={index}
                    className={`min-h-[120px] p-2 border border-gray-200 ${
                      isCurrentMonth ? "bg-white" : "bg-gray-50"
                    } ${isToday ? "bg-blue-50 border-blue-300" : ""}`}
                  >
                    <div className={`text-sm font-medium mb-1 ${
                      isCurrentMonth 
                        ? isToday 
                          ? "text-blue-600" 
                          : "text-gray-900"
                        : "text-gray-400"
                    }`}>
                      {date.getDate()}
                    </div>
                    
                    <div className="space-y-1">
                      {citasDelDia.slice(0, 3).map((cita, citaIndex) => (
                        <div
                          key={citaIndex}
                          onClick={() => handleCitaClick(cita)}
                          className="bg-amber-300 border border-amber-400 rounded p-1 text-xs cursor-pointer hover:bg-amber-400 hover:shadow-sm transition-all duration-200"
                        >
                          <div className="font-medium text-amber-900 truncate">
                            {cita.mascota_nombre}
                          </div>
                          <div className="text-amber-800 truncate">
                            {cita.servicios.nombre}
                          </div>
                        </div>
                      ))}
                      {citasDelDia.length > 3 && (
                        <div className="text-xs text-gray-500 text-center">
                          +{citasDelDia.length - 3} más
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        ) : viewMode === "semana" ? (
          <div className="grid grid-cols-8">
            {/* Columna de tiempo */}
            <div className="border-r border-gray-200">
              <div className="h-12 border-b border-gray-200"></div>
              {timeSlots.map((time, index) => (
                <div key={index} className="h-12 border-b border-gray-100 flex items-start justify-end pr-2 pt-1">
                  <span className="text-xs text-gray-500">
                    {formatTime(time)}
                  </span>
                </div>
              ))}
            </div>

            {/* Días de la semana */}
            {weekDates.map((date, dayIndex) => {
              const citasDelDia = getCitasForDate(date);
              const isToday = date.toDateString() === new Date().toDateString();
              
              return (
                <div key={dayIndex} className="border-r border-gray-200 last:border-r-0">
                  {/* Header del día */}
                  <div className={`h-12 border-b border-gray-200 flex flex-col items-center justify-center ${
                    isToday ? "bg-blue-50" : ""
                  }`}>
                    <div className="text-sm font-medium text-gray-900">
                      {["lun", "mar", "mié", "jue", "vie", "sáb", "dom"][dayIndex]}
                    </div>
                    <div className={`text-lg font-bold ${
                      isToday ? "text-blue-600" : "text-gray-900"
                    }`}>
                      {date.getDate()}
                    </div>
                  </div>

                  {/* Slots de tiempo */}
                  {timeSlots.map((timeSlot, timeIndex) => {
                    const citasEnSlot = getCitasForTimeSlot(date, timeSlot);
                    
                    return (
                      <div
                        key={timeIndex}
                        className="h-12 border-b border-gray-100 relative hover:bg-gray-50"
                      >
                        {citasEnSlot.map((cita, citaIndex) => {
                          // Calcular cuántos slots debe ocupar la cita
                          const duracionMinutos = cita.servicios?.duracion_min || 30;
                          const slotsOcupados = Math.ceil(duracionMinutos / 30);
                          const alturaTotal = slotsOcupados * slotHeightPx;
                          
                          // Solo mostrar la cita en el primer slot
                          const citaStart = new Date(cita.inicio);
                          const slotStart = new Date(timeSlot);
                          const esPrimerSlot = citaStart.getHours() === slotStart.getHours() && 
                                             citaStart.getMinutes() === slotStart.getMinutes();
                          
                          if (!esPrimerSlot) return null;
                          
                          return (
                            <div
                              key={citaIndex}
                              onClick={() => handleCitaClick(cita)}
                              className="absolute left-1 right-1 bg-amber-300 border border-amber-400 rounded-lg p-2 text-sm overflow-hidden cursor-pointer hover:bg-amber-400 hover:shadow-md transition-all duration-200 z-10"
                              style={{ height: `${alturaTotal - 8}px` }}
                              title={`${cita.tutor_nombre} - ${cita.mascota_nombre} - ${cita.servicios.nombre} (${duracionMinutos} min)`}
                            >
                              <div className="font-bold text-amber-900 truncate text-base">
                                {cita.mascota_nombre}
                              </div>
                              <div className="text-amber-800 truncate font-medium">
                                {cita.servicios.nombre}
                              </div>
                              <div className="text-amber-700 truncate text-xs">
                                {(() => {
                                  const start = new Date(cita.inicio);
                                  const end = new Date(cita.fin);
                                  return `${formatTime(start)} - ${formatTime(end)}`;
                                })()}
                              </div>
                              <div className="text-amber-600 truncate text-xs">
                                {duracionMinutos} min
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    );
                  })}
                </div>
              );
            })}
          </div>
        ) : (
          /* Vista diaria */
          <div className="grid grid-cols-8">
            {/* Columna de tiempo */}
            <div className="border-r border-gray-200">
              <div className="h-12 border-b border-gray-200"></div>
              {timeSlots.map((time, index) => (
                <div key={index} className="h-12 border-b border-gray-100 flex items-start justify-end pr-2 pt-1">
                  <span className="text-xs text-gray-500">
                    {formatTime(time)}
                  </span>
                </div>
              ))}
            </div>

            {/* Día actual */}
            <div className="col-span-7">
              <div className="h-12 border-b border-gray-200 flex items-center justify-center bg-blue-50">
                <div className="text-lg font-bold text-blue-600">
                  {formatFullDate(currentDate)}
                </div>
              </div>

              {timeSlots.map((timeSlot, timeIndex) => {
                const citasEnSlot = getCitasForTimeSlot(currentDate, timeSlot);
                
                return (
                  <div
                    key={timeIndex}
                    className="h-12 border-b border-gray-100 relative hover:bg-gray-50"
                  >
                    {citasEnSlot.map((cita, citaIndex) => {
                      const duracionMinutos = cita.servicios?.duracion_min || 30;
                      const slotsOcupados = Math.ceil(duracionMinutos / 30);
                      const alturaTotal = slotsOcupados * slotHeightPx;
                      
                      // Solo mostrar la cita en el primer slot
                      const citaStart = new Date(cita.inicio);
                      const slotStart = new Date(timeSlot);
                      const esPrimerSlot = citaStart.getHours() === slotStart.getHours() && 
                                         citaStart.getMinutes() === slotStart.getMinutes();
                      
                      if (!esPrimerSlot) return null;
                      
                      return (
                        <div
                          key={citaIndex}
                          onClick={() => handleCitaClick(cita)}
                          className="absolute left-1 right-1 bg-amber-300 border border-amber-400 rounded-lg p-3 text-sm overflow-hidden cursor-pointer hover:bg-amber-400 hover:shadow-md transition-all duration-200 z-10"
                          style={{ height: `${alturaTotal - 8}px` }}
                          title={`${cita.tutor_nombre} - ${cita.mascota_nombre} - ${cita.servicios.nombre} (${duracionMinutos} min)`}
                        >
                          <div className="font-bold text-amber-900 text-lg">
                            {cita.mascota_nombre}
                          </div>
                          <div className="text-amber-800 font-medium">
                            {cita.servicios.nombre}
                          </div>
                          <div className="text-amber-700 text-sm">
                            {cita.tutor_nombre}
                          </div>
                          <div className="text-amber-600 text-xs">
                            {(() => {
                              const start = new Date(cita.inicio);
                              const end = new Date(cita.fin);
                              return `${formatTime(start)} - ${formatTime(end)}`;
                            })()}
                          </div>
                          <div className="text-amber-500 text-xs">
                            {duracionMinutos} min
                          </div>
                        </div>
                      );
                    })}
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {/* Modal de detalles de cita */}
      {showCitaModal && selectedCita && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4">
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900">Detalles de la Cita</h3>
                <button
                  onClick={closeModal}
                  className="text-gray-400 hover:text-gray-600 transition-colors"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              
              <div className="space-y-4">
                <div className="flex items-center space-x-3">
                  <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                    <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                  </div>
                  <div>
                    <h4 className="font-medium text-gray-900">{selectedCita.tutor_nombre}</h4>
                    <p className="text-sm text-gray-500">Tutor</p>
                  </div>
                </div>

                <div className="flex items-center space-x-3">
                  <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                    <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                    </svg>
                  </div>
                  <div>
                    <h4 className="font-medium text-gray-900">{selectedCita.mascota_nombre}</h4>
                    <p className="text-sm text-gray-500">Mascota</p>
                  </div>
                </div>

                <div className="flex items-center space-x-3">
                  <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center">
                    <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                    </svg>
                  </div>
                  <div>
                    <h4 className="font-medium text-gray-900">{selectedCita.servicios.nombre}</h4>
                    <p className="text-sm text-gray-500">Servicio</p>
                  </div>
                </div>

                <div className="flex items-center space-x-3">
                  <div className="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center">
                    <svg className="w-6 h-6 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <div>
                    <h4 className="font-medium text-gray-900">
                      {(() => {
                        const start = new Date(selectedCita.inicio);
                        const end = new Date(selectedCita.fin);
                        return `${formatTime(start)} - ${formatTime(end)}`;
                      })()}
                    </h4>
                    <p className="text-sm text-gray-500">Horario</p>
                  </div>
                </div>

                {selectedCita.tutor_telefono && (
                  <div className="flex items-center space-x-3">
                    <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center">
                      <svg className="w-6 h-6 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                      </svg>
                    </div>
                    <div>
                      <h4 className="font-medium text-gray-900">{selectedCita.tutor_telefono}</h4>
                      <p className="text-sm text-gray-500">Teléfono</p>
                    </div>
                  </div>
                )}

                {selectedCita.tutor_email && (
                  <div className="flex items-center space-x-3">
                    <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center">
                      <svg className="w-6 h-6 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                      </svg>
                    </div>
                    <div>
                      <h4 className="font-medium text-gray-900">{selectedCita.tutor_email}</h4>
                      <p className="text-sm text-gray-500">Email</p>
                    </div>
                  </div>
                )}

                {selectedCita.notas && (
                  <div className="mt-4 p-3 bg-gray-50 rounded-lg">
                    <h5 className="text-sm font-medium text-gray-700 mb-1">Notas</h5>
                    <p className="text-sm text-gray-600">{selectedCita.notas}</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
