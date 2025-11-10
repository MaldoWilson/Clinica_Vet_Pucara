
# Manual de Usuario – Sistema de Gestión Clínica Vet Pucará

**Versión:** 1.0
**Fecha:** 10 de Noviembre de 2025

---

## Tabla de Contenidos

1.  **Introducción**
    *   1.1. Propósito del Manual
    *   1.2. Alcance del Sistema
    *   1.3. Perfiles de Usuario

2.  **Parte 1: Manual para el Usuario Público (Cliente)**
    *   2.1. Acceso al Sitio Web
    *   2.2. Navegación Principal
        *   2.2.1. Página de Inicio
        *   2.2.2. Servicios
        *   2.2.3. Productos
        *   2.2.4. Misión y Visión
        *   2.2.5. Equipo
        *   2.2.6. Blog
        *   2.2.7. Contacto
    *   2.3. Sistema de Reserva de Citas
        *   2.3.1. Selección de Servicio
        *   2.3.2. Selección de Horario
        *   2.3.3. Confirmación de Reserva

3.  **Parte 2: Manual para el Administrador**
    *   3.1. Acceso al Panel de Administración
    *   3.2. Dashboard Principal (Resumen)
    *   3.3. Módulos de Gestión
        *   3.3.1. Gestión de Citas
        *   3.3.2. Gestión de Fichas Clínicas
        *   3.3.3. Gestión de Horarios y Disponibilidad
        *   3.3.4. Gestión de Servicios
        *   3.3.5. Gestión de Productos y Stock
        *   3.3.6. Administración Financiera (Flujo de Caja)
        *   3.3.7. Gestión de Equipo Profesional
        *   3.3.8. Gestión de Contenidos (Blog)
        *   3.3.9. Generación de Certificados
        *   3.3.10. Registro y Seguimiento de Vacunas

4.  **Solución de Problemas (FAQ)**
    *   4.1. Problemas de Acceso
    *   4.2. Errores en Reservas

5.  **Contacto y Soporte**

---

## 1. Introducción

### 1.1. Propósito del Manual

Este manual proporciona una guía detallada sobre el uso del sistema web de la Clínica Vet Pucará. Su objetivo es facilitar la comprensión de las funcionalidades tanto para los clientes que visitan el sitio público como para el personal administrativo que gestiona la clínica a través del panel de administración.

### 1.2. Alcance del Sistema

El sistema cubre dos áreas principales:
*   **Sitio Web Público:** Permite a los usuarios informarse sobre la clínica, ver servicios, productos, y reservar citas en línea.
*   **Panel de Administración:** Una herramienta interna para gestionar todas las operaciones de la clínica, incluyendo citas, fichas de pacientes, inventario, finanzas y personal.

### 1.3. Perfiles de Usuario

*   **Usuario Público/Cliente:** Cualquier persona que acceda al sitio web `[URL de tu sitio web]`. No requiere inicio de sesión para la mayoría de las funciones, excepto para confirmar reservas.
*   **Administrador:** Personal de la clínica con credenciales para acceder al panel de administración en `/admin`.

---

## 2. Parte 1: Manual para el Usuario Público (Cliente)

Esta sección detalla cómo los clientes interactúan con el sitio web de la clínica.

### 2.1. Acceso al Sitio Web

Para acceder al sistema, simplemente abre un navegador web (se recomienda Google Chrome, Firefox o Safari) y navega a `[URL de tu sitio web]`.

### 2.2. Navegación Principal

La barra de navegación principal, ubicada en la parte superior, permite un acceso rápido a todas las secciones informativas.

*   **2.2.1. Página de Inicio (`/`)**
    *   Muestra un resumen de la clínica, con acceso rápido a servicios destacados, últimos productos y artículos del blog.
    *   *[Captura de pantalla de la página de inicio]*

*   **2.2.2. Servicios (`/servicios`)**
    *   Presenta una lista detallada de todos los servicios ofrecidos por la clínica (consultas, cirugías, etc.).
    *   Cada servicio puede tener una descripción, precio y duración.
    *   *[Captura de pantalla de la página de servicios]*

*   **2.2.3. Productos (`/productos`)**
    *   Muestra el catálogo de productos disponibles para la venta (alimentos, medicamentos, accesorios).
    *   *[Captura de pantalla de la página de productos]*

*   **2.2.4. Misión y Visión (`/mision-vision`)**
    *   Contiene información sobre los valores y objetivos de la clínica.

*   **2.2.5. Equipo (`/equipo`)**
    *   Presenta al personal de la clínica, incluyendo veterinarios y asistentes, con sus fotos y especialidades.

*   **2.2.6. Blog (`/blog`)**
    *   Artículos de interés sobre cuidado de mascotas, noticias de la clínica y consejos de salud.

*   **2.2.7. Contacto (`/contacto`)**
    *   Muestra la dirección de la clínica en un mapa, número de teléfono, email y un formulario de contacto para consultas generales.

### 2.3. Sistema de Reserva de Citas (`/reservas`)

Esta es la funcionalidad principal para los clientes.

*   **2.3.1. Selección de Servicio (`/reservas/servicio/[servicioId]`)**
    1.  El usuario comienza seleccionando el servicio para el cual desea una cita.
    2.  El sistema mostrará los veterinarios y horarios disponibles para ese servicio específico.

*   **2.3.2. Selección de Horario (`/reservas/servicio/[servicioId]/horario`)**
    1.  Se presenta un calendario donde los días con horas disponibles están marcados.
    2.  Al seleccionar un día, se muestran los "slots" o bloques de tiempo disponibles.
    3.  El usuario hace clic en el horario de su preferencia.
    *   *[Captura de pantalla del calendario de selección de horario]*

*   **2.3.3. Confirmación de Reserva (`/reservas/[slotId]`)**
    1.  Tras seleccionar un horario, el usuario debe completar un formulario con sus datos personales y los de su mascota (Nombre, RUT, teléfono, etc.).
    2.  Finalmente, hace clic en "Confirmar Reserva".
    3.  El sistema enviará una confirmación al correo electrónico proporcionado y/o un mensaje de WhatsApp.

---

## 3. Parte 2: Manual para el Administrador

Esta sección está dirigida al personal autorizado para gestionar la clínica.

### 3.1. Acceso al Panel de Administración

1.  Navega a `[URL de tu sitio web]/admin/login`.
2.  Ingresa tu nombre de usuario y contraseña.
3.  Serás redirigido al Dashboard principal.

### 3.2. Dashboard Principal (`/admin`)

El dashboard ofrece una vista general del estado de la clínica con gráficos y estadísticas clave:
*   **Ingresos vs. Egresos:** Un análisis visual del flujo de caja.
*   **Distribución de Vacunas:** Gráfico que muestra los tipos de vacunas más aplicadas.
*   **Citas del Día:** Una tabla con las citas programadas para la jornada actual.
*   *[Captura de pantalla del dashboard principal]*

### 3.3. Módulos de Gestión

El menú lateral izquierdo permite navegar entre los diferentes módulos de administración.

*   **3.3.1. Gestión de Citas (`/admin/citas`)**
    *   Visualiza todas las citas (pasadas, presentes y futuras) en una tabla o calendario.
    *   Permite confirmar, reagendar o cancelar citas.
    *   Permite filtrar citas por fecha, cliente o veterinario.

*   **3.3.2. Gestión de Fichas Clínicas (`/admin/fichas`)**
    *   Crea, edita y consulta las fichas de los pacientes (mascotas).
    *   Cada ficha contiene datos del propietario, historial de consultas, vacunas, antecedentes y recetas.
    *   Permite adjuntar archivos (exámenes, radiografías) a una ficha.

*   **3.3.3. Gestión de Horarios (`/admin/horarios`)**
    *   Define los horarios de trabajo de cada veterinario.
    *   Permite bloquear días o rangos de horas por vacaciones, licencias o eventos especiales.

*   **3.3.4. Gestión de Servicios (`/admin/servicios`)**
    *   Crea, edita o elimina los servicios ofrecidos por la clínica.
    *   Define nombre, descripción, precio, duración y a qué veterinario(s) se asocia.

*   **3.3.5. Gestión de Productos y Stock (`/admin/productos` y `/admin/stock`)**
    *   **Productos:** Añade nuevos productos al catálogo con su nombre, descripción, precio y foto.
    *   **Stock:** Actualiza la cantidad disponible de cada producto. El sistema puede alertar cuando el stock esté bajo.

*   **3.3.6. Administración Financiera (`/admin/flujo-caja`)**
    *   Registra todos los ingresos (ventas, consultas) y egresos (compras, sueldos).
    *   Genera reportes financieros por período.

*   **3.3.7. Gestión de Equipo Profesional (`/admin/equipo`)**
    *   Añade o edita la información de los miembros del equipo (veterinarios, asistentes).
    *   Sube sus fotografías y define sus especialidades.

*   **3.3.8. Gestión de Contenidos (`/admin/blogs`)**
    *   Crea, edita y publica nuevos artículos en el blog del sitio web.

*   **3.3.9. Generación de Certificados (`/admin/certificados`)**
    *   Genera documentos PDF estandarizados (certificados de salud, de viaje, etc.) a partir de plantillas, rellenando automáticamente los datos del paciente.

*   **3.3.10. Registro y Seguimiento de Vacunas (`/admin/vacunas`)**
    *   Administra el catálogo de vacunas disponibles.
    *   Registra las vacunas aplicadas a cada paciente en su ficha clínica.

---

## 4. Solución de Problemas (FAQ)

### 4.1. Problemas de Acceso
*   **Pregunta:** Olvidé mi contraseña de administrador.
*   **Respuesta:** Utiliza la opción "¿Olvidaste tu contraseña?" en la página de login o contacta al administrador del sistema.

### 4.2. Errores en Reservas
*   **Pregunta:** Un cliente dice que no puede reservar una hora que debería estar disponible.
*   **Respuesta:** Verifica en el módulo de "Gestión de Horarios" que el veterinario tenga ese bloque de tiempo configurado como disponible y que no haya sido ocupado por una cita creada manualmente.

---

## 5. Contacto y Soporte

Para problemas técnicos con el sistema, por favor contacta a:
*   **Email:** `soporte-tecnico@example.com`
*   **Teléfono:** `+56 9 XXXX XXXX`
*   **Responsable:** [Nombre del responsable técnico]

