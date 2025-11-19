-- Es solo un esquema sql de la base de datos real

CREATE TABLE public.antecedentes (
  id bigint GENERATED ALWAYS AS IDENTITY NOT NULL,
  mascota_id bigint NOT NULL,
  origen text,
  habitat text,
  comportamiento text,
  enfermedades text,
  alergias text,
  observaciones text,
  alertas text,
  created_at timestamp with time zone DEFAULT now(),
  CONSTRAINT antecedentes_pkey PRIMARY KEY (id),
  CONSTRAINT antecedentes_mascota_id_fkey FOREIGN KEY (mascota_id) REFERENCES public.mascotas(mascotas_id)
);
CREATE TABLE public.archivos_adjuntos (
  id bigint GENERATED ALWAYS AS IDENTITY NOT NULL,
  nombre_archivo text,
  tipo_archivo text,
  url_archivo text,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  CONSTRAINT archivos_adjuntos_pkey PRIMARY KEY (id)
);
CREATE TABLE public.blogs (
  id bigint GENERATED ALWAYS AS IDENTITY NOT NULL,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  titulo character varying NOT NULL,
  contenido text NOT NULL,
  publico boolean NOT NULL,
  image_url text,
  CONSTRAINT blogs_pkey PRIMARY KEY (id)
);
CREATE TABLE public.categorias (
  id bigint GENERATED ALWAYS AS IDENTITY NOT NULL,
  nombre text NOT NULL UNIQUE,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  CONSTRAINT categorias_pkey PRIMARY KEY (id)
);
CREATE TABLE public.certificados (
  id bigint GENERATED ALWAYS AS IDENTITY NOT NULL,
  id_consulta bigint NOT NULL,
  nombre text,
  datos json NOT NULL,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  CONSTRAINT certificados_pkey PRIMARY KEY (id),
  CONSTRAINT certificados_id_consulta_fkey FOREIGN KEY (id_consulta) REFERENCES public.consultas(id)
);
CREATE TABLE public.citas (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  horario_id uuid UNIQUE,
  servicio_id uuid,
  tutor_nombre text NOT NULL,
  tutor_telefono text,
  tutor_email text,
  mascota_nombre text NOT NULL,
  notas text,
  estado text DEFAULT 'PENDIENTE'::text,
  creado_en timestamp with time zone DEFAULT now(),
  inicio timestamp without time zone,
  fin timestamp without time zone,
  especie boolean,
  CONSTRAINT citas_pkey PRIMARY KEY (id),
  CONSTRAINT citas_servicio_id_fkey FOREIGN KEY (servicio_id) REFERENCES public.servicios(id),
  CONSTRAINT citas_horario_id_fkey FOREIGN KEY (horario_id) REFERENCES public.horarios(id)
);
CREATE TABLE public.consultas (
  id bigint GENERATED ALWAYS AS IDENTITY NOT NULL,
  mascota_id bigint NOT NULL,
  veterinario_id uuid,
  fecha timestamp with time zone NOT NULL DEFAULT now(),
  motivo text,
  tipo_atencion text,
  anamnesis text,
  diagnostico text,
  tratamiento text,
  proximo_control date,
  observaciones text,
  created_at timestamp with time zone DEFAULT now(),
  CONSTRAINT consultas_pkey PRIMARY KEY (id),
  CONSTRAINT consultas_mascota_id_fkey FOREIGN KEY (mascota_id) REFERENCES public.mascotas(mascotas_id),
  CONSTRAINT consultas_veterinario_id_fkey FOREIGN KEY (veterinario_id) REFERENCES public.veterinarios(id)
);
CREATE TABLE public.flujo_caja (
  id integer NOT NULL DEFAULT nextval('flujo_caja_id_seq'::regclass),
  dia integer,
  tipo text,
  categoria text,
  nombre text,
  efectivo numeric,
  debito numeric,
  credito numeric,
  transferencia numeric,
  deuda numeric,
  egreso numeric,
  dr text,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  CONSTRAINT flujo_caja_pkey PRIMARY KEY (id)
);
CREATE TABLE public.horarios (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  veterinario_id uuid,
  inicio timestamp with time zone NOT NULL,
  fin timestamp with time zone NOT NULL,
  reservado boolean DEFAULT false,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  CONSTRAINT horarios_pkey PRIMARY KEY (id),
  CONSTRAINT horarios_veterinario_id_fkey FOREIGN KEY (veterinario_id) REFERENCES public.veterinarios(id)
);
CREATE TABLE public.inventario_lotes (
  id bigint GENERATED ALWAYS AS IDENTITY NOT NULL,
  producto_id bigint NOT NULL,
  numero_lote text NOT NULL,
  fecha_vencimiento date,
  stock_actual numeric NOT NULL DEFAULT 0,
  created_at timestamp with time zone DEFAULT now(),
  activo boolean DEFAULT true,
  CONSTRAINT inventario_lotes_pkey PRIMARY KEY (id),
  CONSTRAINT inventario_lotes_producto_id_fkey FOREIGN KEY (producto_id) REFERENCES public.productos(id)
);
CREATE TABLE public.mascotas (
  mascotas_id bigint GENERATED ALWAYS AS IDENTITY NOT NULL,
  nombre text NOT NULL,
  especie boolean,
  raza text,
  sexo boolean,
  color text,
  fecha_nacimiento date,
  numero_microchip text,
  esterilizado boolean,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  propietario_id bigint,
  imagen_url text,
  CONSTRAINT mascotas_pkey PRIMARY KEY (mascotas_id),
  CONSTRAINT mascotas_propietario_id_fkey FOREIGN KEY (propietario_id) REFERENCES public.propietario(propietario_id)
);
CREATE TABLE public.mensajes_contacto (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  nombre text NOT NULL,
  correo text,
  telefono text,
  mensaje text NOT NULL,
  creado_en timestamp with time zone DEFAULT now(),
  CONSTRAINT mensajes_contacto_pkey PRIMARY KEY (id)
);
CREATE TABLE public.movimientos_stock (
  id bigint GENERATED ALWAYS AS IDENTITY NOT NULL,
  producto_id bigint NOT NULL,
  lote_id bigint,
  tipo_movimiento text NOT NULL,
  cantidad numeric NOT NULL,
  fecha timestamp with time zone DEFAULT now(),
  referencia_id text,
  observacion text,
  usuario_id uuid,
  CONSTRAINT movimientos_stock_pkey PRIMARY KEY (id),
  CONSTRAINT movimientos_stock_producto_id_fkey FOREIGN KEY (producto_id) REFERENCES public.productos(id),
  CONSTRAINT movimientos_stock_lote_id_fkey FOREIGN KEY (lote_id) REFERENCES public.inventario_lotes(id)
);
CREATE TABLE public.productos (
  id bigint GENERATED ALWAYS AS IDENTITY NOT NULL,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  nombre text NOT NULL,
  descripcion text,
  precio numeric,
  sku character varying UNIQUE,
  stock numeric NOT NULL DEFAULT '0'::numeric,
  imagen_principal text,
  imagenes ARRAY,
  updated_at timestamp without time zone DEFAULT now(),
  categoria_id bigint,
  es_publico boolean NOT NULL DEFAULT true,
  tipo_producto text DEFAULT 'VENTA_GENERAL'::text,
  controlar_lotes boolean DEFAULT false,
  CONSTRAINT productos_pkey PRIMARY KEY (id),
  CONSTRAINT productos_categoria_id_fkey FOREIGN KEY (categoria_id) REFERENCES public.categorias(id)
);
CREATE TABLE public.propietario (
  propietario_id bigint GENERATED ALWAYS AS IDENTITY NOT NULL,
  nombre text,
  apellido text,
  rut text UNIQUE,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  telefono text,
  direccion text,
  correo_electronico text,
  CONSTRAINT propietario_pkey PRIMARY KEY (propietario_id)
);
CREATE TABLE public.receta_items (
  id bigint GENERATED ALWAYS AS IDENTITY NOT NULL,
  receta_id bigint NOT NULL,
  nombre_medicamento text NOT NULL,
  dosis text NOT NULL,
  via text,
  frecuencia text,
  duracion text,
  instrucciones text,
  created_at timestamp with time zone DEFAULT now(),
  CONSTRAINT receta_items_pkey PRIMARY KEY (id),
  CONSTRAINT receta_items_receta_id_fkey FOREIGN KEY (receta_id) REFERENCES public.recetas(id)
);
CREATE TABLE public.recetas (
  id bigint GENERATED ALWAYS AS IDENTITY NOT NULL,
  consulta_id bigint,
  emitida_por uuid,
  fecha timestamp with time zone DEFAULT now(),
  peso numeric,
  notas text,
  created_at timestamp with time zone DEFAULT now(),
  CONSTRAINT recetas_pkey PRIMARY KEY (id),
  CONSTRAINT recetas_consulta_id_fkey FOREIGN KEY (consulta_id) REFERENCES public.consultas(id)
);
CREATE TABLE public.servicios (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  nombre text NOT NULL,
  descripcion text,
  precio_clp integer,
  duracion_min integer DEFAULT 30,
  creado_en timestamp with time zone DEFAULT now(),
  image_url text,
  porcentaje_vet numeric DEFAULT 0,
  CONSTRAINT servicios_pkey PRIMARY KEY (id)
);
CREATE TABLE public.vacunas_registradas (
  id bigint GENERATED ALWAYS AS IDENTITY NOT NULL,
  nombre_vacuna text,
  veterinario_id uuid NOT NULL,
  fecha_aplicacion date NOT NULL,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  CONSTRAINT vacunas_registradas_pkey PRIMARY KEY (id),
  CONSTRAINT vacunas_registradas_veterinario_id_fkey FOREIGN KEY (veterinario_id) REFERENCES public.veterinarios(id)
);
CREATE TABLE public.veterinarios (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  nombre text NOT NULL,
  especialidad text,
  foto_url text,
  creado_en timestamp with time zone DEFAULT now(),
  descripcion text,
  email text NOT NULL UNIQUE,
  password text NOT NULL,
  es_admin boolean NOT NULL DEFAULT false,
  activo boolean NOT NULL DEFAULT true,
  CONSTRAINT veterinarios_pkey PRIMARY KEY (id)
);