# Clínica Veterinaria Pucará

Aplicación web en Next.js 14 para reserva de horas, gestión de contenido y panel de administración.

## Requisitos
- Node.js >= 20
- npm >= 10

Verifica la instalación:

```bash
node -v
npm -v
```

## Instalación
1. Instala dependencias en la raíz del proyecto:
```bash
npm install
```

```bash
npm install xlsx
npm install recharts
```

2. Variables de entorno:
- Crea el archivo `.env` y completa los valores.

```bash
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY= 
SUPABASE_SERVICE_ROLE_KEY= 
NEXT_PUBLIC_SITE_NAME= Clinica Veterinaria Pucará

ADMIN_EMAILS= "Email de los admin"
SUPABASE_STORAGE_BUCKET=media

NEXT_PUBLIC_WHATSAPP_PHONE= "Numero de contacto del sitio web"
NEXT_PUBLIC_CONTACT_EMAIL= "Correo del sitio web"
```

3. Ejecuta en desarrollo:
```bash
npm run dev
```




## Estructura del proyecto (resumen)
```
src/
  app/
    (web)/           # Sitio público (layouts/páginas)
    admin/           # Panel de administración protegido
    api/             # Rutas API (Next.js Route Handlers)
  components/        # Componentes UI
  lib/               # Clientes/utilidades (Supabase, Sanity, validaciones)
  styles/            # CSS global (Tailwind)
```








