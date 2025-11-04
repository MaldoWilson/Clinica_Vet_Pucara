-- Este esquema, es solo un esquema de referencia, no esta conectado a la base de datos.

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
CREATE TABLE public.mascotas (
  mascotas_id bigint GENERATED ALWAYS AS IDENTITY NOT NULL,
  nombre text,
  especie boolean,
  raza text,
  sexo boolean,
  color text,
  fecha_nacimiento date,
  numero_microchip text,
  esterilizado boolean,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  propietario_id bigint,
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
CREATE TABLE public.productos (
  id bigint GENERATED ALWAYS AS IDENTITY NOT NULL,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  nombre text NOT NULL,
  descripcion text NOT NULL,
  precio numeric NOT NULL,
  sku character varying NOT NULL UNIQUE,
  categoria text,
  stock numeric NOT NULL DEFAULT '0'::numeric,
  imagen_principal text NOT NULL,
  imagenes ARRAY,
  updated_at timestamp without time zone DEFAULT now(),
  CONSTRAINT productos_pkey PRIMARY KEY (id)
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
CREATE TABLE public.stock (
  id bigint GENERATED ALWAYS AS IDENTITY NOT NULL,
  nombre text NOT NULL,
  categoria text NOT NULL,
  cantidad numeric,
  stock_min numeric NOT NULL,
  unidad text NOT NULL,
  precio numeric NOT NULL,
  estado text NOT NULL,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  CONSTRAINT stock_pkey PRIMARY KEY (id)
);
CREATE TABLE public.veterinarios (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  nombre text NOT NULL,
  especialidad text,
  foto_url text,
  creado_en timestamp with time zone DEFAULT now(),
  descripcion text,
  CONSTRAINT veterinarios_pkey PRIMARY KEY (id)
);