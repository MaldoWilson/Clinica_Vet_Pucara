export type CertificateField =
  | { key: string; label: string; type: "auto"; source: (ctx: AutoContext) => string }
  | { key: string; label: string; type: "manual"; placeholder?: string };

export type AutoContext = {
  paciente: {
    id: string;
    nombre: string;
    especie: boolean | null;
    raza?: string | null;
    sexo?: boolean | null;
    fecha_nacimiento?: string | null; // YYYY-MM-DD
  };
  propietario: {
    nombre?: string | null;
    apellido?: string | null;
    direccion?: string | null;
    rut?: string | null;
    telefono?: string | null;
    correo_electronico?: string | null;
  } | null;
  veterinarios: Array<{ id: string; nombre: string }>;
  now: Date;
};

export type CertificateFieldGroup = {
  id: string;
  name: string;
  description?: string;
  fields: CertificateField[];
  collapsed?: boolean;
};

export type CertificateTemplate = {
  id: number;
  name: string;
  description?: string;
  fields: CertificateField[];
  fieldGroups?: CertificateFieldGroup[];
  // Si el PDF usa nombres de campos distintos, mapea aquí: Texbox1 -> nombre real del campo
  acroFieldAlias?: Record<string, string>;
};

function formatFechaDDMMYYYY(d: Date) {
  const dd = String(d.getDate()).padStart(2, "0");
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const yyyy = d.getFullYear();
  return `${dd}/${mm}/${yyyy}`;
}

function calcularEdadDesde(fechaYYYYMMDD?: string | null): string {
  if (!fechaYYYYMMDD) return "";
  const [y, m, d] = fechaYYYYMMDD.split("-").map((n) => parseInt(n, 10));
  if (!y || !m || !d) return "";
  const birth = new Date(y, m - 1, d);
  const now = new Date();
  let years = now.getFullYear() - birth.getFullYear();
  let months = now.getMonth() - birth.getMonth();
  let days = now.getDate() - birth.getDate();
  if (days < 0) {
    months -= 1;
    days += new Date(now.getFullYear(), now.getMonth(), 0).getDate();
  }
  if (months < 0) {
    years -= 1;
    months += 12;
  }
  if (years > 0) return `${years} año${years === 1 ? "" : "s"}`;
  return `${months} mes${months === 1 ? "" : "es"}`;
}

function especieTexto(v?: boolean | null): string {
  if (v === true) return "Gato";
  if (v === false) return "Perro";
  return "";
}

function sexoTexto(v?: boolean | null): string {
  if (v === true) return "Macho";
  if (v === false) return "Hembra";
  return "";
}

export const certificateTemplates: Record<string, CertificateTemplate> = {
  // Clave por id o nombre; aquí usamos id="1"
  "1": {
    id: 1,
    name: "Certificado Base (ID 1)",
    description: "Plantilla genérica con Texbox1..Texbox9",
    fields: [
      {
        key: "Texbox1",
        label: "Nombre del propietario",
        type: "auto",
        source: ({ propietario }) =>
          [propietario?.nombre || "", propietario?.apellido || ""].filter(Boolean).join(" "),
      },
      {
        key: "Texbox2",
        label: "Nombre de la mascota",
        type: "auto",
        source: ({ paciente }) => paciente.nombre || "",
      },
      {
        key: "Texbox3",
        label: "Edad de la mascota",
        type: "auto",
        source: ({ paciente }) => calcularEdadDesde(paciente.fecha_nacimiento),
      },
      {
        key: "Texbox4",
        label: "Veterinario (selección)",
        type: "manual",
        placeholder: "Seleccionar veterinario",
      },
      {
        key: "Texbox5",
        label: "Especie",
        type: "auto",
        source: ({ paciente }) => especieTexto(paciente.especie),
      },
      {
        key: "Texbox6",
        label: "Sexo",
        type: "auto",
        source: ({ paciente }) => sexoTexto(paciente.sexo),
      },
      {
        key: "Texbox7",
        label: "Fecha actual (dd/mm/yyyy)",
        type: "auto",
        source: ({ now }) => formatFechaDDMMYYYY(now),
      },
      {
        key: "Texbox8",
        label: "Raza",
        type: "auto",
        source: ({ paciente }) => paciente.raza || "",
      },
      {
        key: "Texbox9",
        label: "ID Mascota",
        type: "auto",
        source: ({ paciente }) => paciente.id,
      },
    ],
    acroFieldAlias: (() => {
      const map: Record<string, string> = {};
      // Mapea TexboxN -> TextboxN para compatibilidad con PDFs que usan "Textbox" (como en el ejemplo)
      for (let i = 1; i <= 21; i++) {
        map[`Texbox${i}`] = `Textbox${i}`;
      }
      return map;
    })(),
  },
  // Certificado ID 2 con la misma estructura pero para diferentes propósitos
  "2": {
    id: 2,
    name: "Certificado ID 2",
    description: "Certificado con Texbox1..Texbox9 para diferentes propósitos",
    fields: [
      {
        key: "Texbox1",
        label: "Nombre del propietario",
        type: "auto",
        source: ({ propietario }) =>
          [propietario?.nombre || "", propietario?.apellido || ""].filter(Boolean).join(" "),
      },
      {
        key: "Texbox2",
        label: "Nombre de la mascota",
        type: "auto",
        source: ({ paciente }) => paciente.nombre || "",
      },
      {
        key: "Texbox3",
        label: "Edad de la mascota",
        type: "auto",
        source: ({ paciente }) => calcularEdadDesde(paciente.fecha_nacimiento),
      },
      {
        key: "Texbox4",
        label: "Veterinario (selección)",
        type: "manual",
        placeholder: "Seleccionar veterinario",
      },
      {
        key: "Texbox5",
        label: "Especie",
        type: "auto",
        source: ({ paciente }) => especieTexto(paciente.especie),
      },
      {
        key: "Texbox6",
        label: "Sexo",
        type: "auto",
        source: ({ paciente }) => sexoTexto(paciente.sexo),
      },
      {
        key: "Texbox7",
        label: "Fecha actual (dd/mm/yyyy)",
        type: "auto",
        source: ({ now }) => formatFechaDDMMYYYY(now),
      },
      {
        key: "Texbox8",
        label: "Raza",
        type: "auto",
        source: ({ paciente }) => paciente.raza || "",
      },
      {
        key: "Texbox9",
        label: "ID Mascota",
        type: "auto",
        source: ({ paciente }) => paciente.id,
      },
    ],
    acroFieldAlias: (() => {
      const map: Record<string, string> = {};
      // Mapea TexboxN -> TextboxN para compatibilidad con PDFs que usan "Textbox" (como en el ejemplo)
      for (let i = 1; i <= 21; i++) {
        map[`Texbox${i}`] = `Textbox${i}`;
      }
      return map;
    })(),
  },
  // Certificado ID 4 con 18 campos para microchip y certificados médicos
  "4": {
    id: 4,
    name: "Certificado ID 4",
    description: "Certificado con 18 campos para microchip y certificados médicos",
    fields: [
      {
        key: "Texbox1",
        label: "Nombre del propietario",
        type: "auto",
        source: ({ propietario }) =>
          [propietario?.nombre || "", propietario?.apellido || ""].filter(Boolean).join(" "),
      },
      {
        key: "Texbox2",
        label: "Dirección del propietario",
        type: "auto",
        source: ({ propietario }) => propietario?.direccion || "",
      },
      {
        key: "Texbox3",
        label: "RUT del propietario",
        type: "auto",
        source: ({ propietario }) => propietario?.rut || "",
      },
      {
        key: "Texbox4",
        label: "Teléfono del propietario",
        type: "auto",
        source: ({ propietario }) => propietario?.telefono || "",
      },
      {
        key: "Texbox5",
        label: "Nombre de la mascota",
        type: "auto",
        source: ({ paciente }) => paciente.nombre || "",
      },
      {
        key: "Texbox6",
        label: "Especie de la mascota",
        type: "auto",
        source: ({ paciente }) => especieTexto(paciente.especie),
      },
      {
        key: "Texbox7",
        label: "Color de la mascota",
        type: "manual",
        placeholder: "Ingrese el color de la mascota",
      },
      {
        key: "Texbox8",
        label: "Edad de la mascota",
        type: "auto",
        source: ({ paciente }) => calcularEdadDesde(paciente.fecha_nacimiento),
      },
      {
        key: "Texbox9",
        label: "Sexo de la mascota",
        type: "auto",
        source: ({ paciente }) => sexoTexto(paciente.sexo),
      },
      {
        key: "Texbox10",
        label: "Fecha de aplicación del microchip",
        type: "manual",
        placeholder: "DD/MM/YYYY",
      },
      {
        key: "Texbox11",
        label: "Peso de la mascota",
        type: "manual",
        placeholder: "Ingrese el peso en kg",
      },
      {
        key: "Texbox12",
        label: "Raza de la mascota",
        type: "auto",
        source: ({ paciente }) => paciente.raza || "",
      },
      {
        key: "Texbox13",
        label: "Número de microchip",
        type: "manual",
        placeholder: "Ingrese el número de microchip",
      },
      {
        key: "Texbox14",
        label: "Sitio de aplicación del microchip",
        type: "manual",
        placeholder: "Ingrese el sitio de aplicación",
      },
      {
        key: "Texbox15",
        label: "Nombre del propietario (duplicado)",
        type: "auto",
        source: ({ propietario }) =>
          [propietario?.nombre || "", propietario?.apellido || ""].filter(Boolean).join(" "),
      },
      {
        key: "Texbox16",
        label: "RUT del propietario (duplicado)",
        type: "auto",
        source: ({ propietario }) => propietario?.rut || "",
      },
      {
        key: "Texbox17",
        label: "Nombre del veterinario",
        type: "manual",
        placeholder: "Seleccionar veterinario",
      },
      {
        key: "Texbox18",
        label: "Pronóstico esperado y eutanasia recomendada",
        type: "manual",
        placeholder: "Ingrese el pronóstico y recomendaciones",
      },
      {
        key: "Texbox19",
        label: "Exámenes relevantes realizados",
        type: "manual",
        placeholder: "Ingrese los exámenes realizados",
      },
      {
        key: "Texbox20",
        label: "Fecha actual (dd/mm/yyyy)",
        type: "auto",
        source: ({ now }) => formatFechaDDMMYYYY(now),
      },
    ],
    acroFieldAlias: (() => {
      const map: Record<string, string> = {};
      // Mapea TexboxN -> TextboxN para compatibilidad con PDFs que usan "Textbox"
      for (let i = 1; i <= 21; i++) {
        map[`Texbox${i}`] = `Textbox${i}`;
      }
      return map;
    })(),
  },
  // Certificado ID 7 con 63 campos para certificado de vacunación y desparasitación
  "7": {
    id: 7,
    name: "Certificado de Vacunación ID 7",
    description: "Certificado completo de vacunación y desparasitación con 63 campos",
    fields: [
      // Campos básicos que siempre se muestran
      {
        key: "Textbox1",
        label: "Nombre de la mascota",
        type: "auto",
        source: ({ paciente }) => paciente.nombre || "",
      },
      {
        key: "Textbox2",
        label: "Especie del animal",
        type: "auto",
        source: ({ paciente }) => especieTexto(paciente.especie),
      },
      {
        key: "Textbox3",
        label: "Edad del animal",
        type: "auto",
        source: ({ paciente }) => calcularEdadDesde(paciente.fecha_nacimiento),
      },
      {
        key: "Textbox4",
        label: "Raza de la mascota",
        type: "auto",
        source: ({ paciente }) => paciente.raza || "",
      },
      {
        key: "Textbox7",
        label: "Sexo del animal",
        type: "auto",
        source: ({ paciente }) => sexoTexto(paciente.sexo),
      },
      {
        key: "Textbox11",
        label: "Nombre completo del dueño o dueña",
        type: "auto",
        source: ({ propietario }) =>
          [propietario?.nombre || "", propietario?.apellido || ""].filter(Boolean).join(" "),
      },
      {
        key: "Textbox12",
        label: "RUT o número de pasaporte del propietario",
        type: "auto",
        source: ({ propietario }) => propietario?.rut || "",
      },
      {
        key: "Textbox13",
        label: "Dirección del propietario",
        type: "auto",
        source: ({ propietario }) => propietario?.direccion || "",
      },
      {
        key: "Textbox14",
        label: "Número de teléfono o contacto del propietario",
        type: "auto",
        source: ({ propietario }) => propietario?.telefono || "",
      },
      {
        key: "Textbox63",
        label: "Fecha del certificado de salud emitido",
        type: "auto",
        source: ({ now }) => formatFechaDDMMYYYY(now),
      },
    ],
    fieldGroups: [
      {
        id: "datos-fisicos",
        name: "Datos Físicos y Microchip",
        description: "Información física de la mascota y datos del microchip",
        fields: [
          {
            key: "Textbox5",
            label: "Peso del animal en kilogramos",
            type: "manual",
            placeholder: "Ingrese el peso en kg",
          },
          {
            key: "Textbox6",
            label: "Color del pelaje o del animal",
            type: "manual",
            placeholder: "Ingrese el color del animal",
          },
          {
            key: "Textbox8",
            label: "Número del microchip implantado",
            type: "manual",
            placeholder: "Ingrese el número de microchip",
          },
          {
            key: "Textbox9",
            label: "Fecha de aplicación del microchip",
            type: "manual",
            placeholder: "DD/MM/YYYY",
          },
          {
            key: "Textbox10",
            label: "Sitio del cuerpo donde se aplicó el microchip",
            type: "manual",
            placeholder: "Ingrese el sitio de aplicación",
          },
        ],
        collapsed: true,
      },
      {
        id: "vacuna-distemper",
        name: "Vacuna Distemper",
        description: "Información de la vacuna contra Distemper",
        fields: [
          {
            key: "Textbox15",
            label: "Nombre de la vacuna contra Distemper",
            type: "manual",
            placeholder: "Nombre de la vacuna Distemper",
          },
          {
            key: "Textbox16",
            label: "Laboratorio fabricante de la vacuna contra Distemper",
            type: "manual",
            placeholder: "Laboratorio de la vacuna Distemper",
          },
          {
            key: "Textbox17",
            label: "Número de serie de la vacuna contra Distemper",
            type: "manual",
            placeholder: "Número de serie Distemper",
          },
          {
            key: "Textbox18",
            label: "Fecha de vacunación contra Distemper",
            type: "manual",
            placeholder: "DD/MM/YYYY",
          },
          {
            key: "Textbox19",
            label: "Fecha de vigencia de la vacuna contra Distemper",
            type: "manual",
            placeholder: "DD/MM/YYYY",
          },
        ],
        collapsed: true,
      },
      {
        id: "vacuna-adenovirus",
        name: "Vacuna Adenovirus (Hepatitis)",
        description: "Información de la vacuna contra Adenovirus",
        fields: [
          {
            key: "Textbox20",
            label: "Nombre de la vacuna contra Adenovirus (Hepatitis)",
            type: "manual",
            placeholder: "Nombre de la vacuna Adenovirus",
          },
          {
            key: "Textbox21",
            label: "Laboratorio de la vacuna contra Adenovirus (Hepatitis)",
            type: "manual",
            placeholder: "Laboratorio de la vacuna Adenovirus",
          },
          {
            key: "Textbox22",
            label: "Número de serie de la vacuna contra Adenovirus (Hepatitis)",
            type: "manual",
            placeholder: "Número de serie Adenovirus",
          },
          {
            key: "Textbox23",
            label: "Fecha de vacunación contra Adenovirus (Hepatitis)",
            type: "manual",
            placeholder: "DD/MM/YYYY",
          },
          {
            key: "Textbox24",
            label: "Fecha de vigencia de la vacuna contra Adenovirus (Hepatitis)",
            type: "manual",
            placeholder: "DD/MM/YYYY",
          },
        ],
        collapsed: true,
      },
      {
        id: "vacuna-leptospira",
        name: "Vacuna Leptospira",
        description: "Información de la vacuna contra Leptospira",
        fields: [
          {
            key: "Textbox25",
            label: "Nombre de la vacuna contra Leptospira (L. canicola e icterohaemorrhagie)",
            type: "manual",
            placeholder: "Nombre de la vacuna Leptospira",
          },
          {
            key: "Textbox26",
            label: "Laboratorio de la vacuna contra Leptospira",
            type: "manual",
            placeholder: "Laboratorio de la vacuna Leptospira",
          },
          {
            key: "Textbox27",
            label: "Número de serie de la vacuna contra Leptospira",
            type: "manual",
            placeholder: "Número de serie Leptospira",
          },
          {
            key: "Textbox28",
            label: "Fecha de vacunación contra Leptospira",
            type: "manual",
            placeholder: "DD/MM/YYYY",
          },
          {
            key: "Textbox29",
            label: "Fecha de vigencia de la vacuna contra Leptospira",
            type: "manual",
            placeholder: "DD/MM/YYYY",
          },
        ],
        collapsed: true,
      },
      {
        id: "vacuna-parvovirus",
        name: "Vacuna Parvovirus",
        description: "Información de la vacuna contra Parvovirus",
        fields: [
          {
            key: "Textbox30",
            label: "Nombre de la vacuna contra Parvovirus",
            type: "manual",
            placeholder: "Nombre de la vacuna Parvovirus",
          },
          {
            key: "Textbox31",
            label: "Laboratorio de la vacuna contra Parvovirus",
            type: "manual",
            placeholder: "Laboratorio de la vacuna Parvovirus",
          },
          {
            key: "Textbox32",
            label: "Número de serie de la vacuna contra Parvovirus",
            type: "manual",
            placeholder: "Número de serie Parvovirus",
          },
          {
            key: "Textbox33",
            label: "Fecha de vacunación contra Parvovirus",
            type: "manual",
            placeholder: "DD/MM/YYYY",
          },
          {
            key: "Textbox34",
            label: "Fecha de vigencia de la vacuna contra Parvovirus",
            type: "manual",
            placeholder: "DD/MM/YYYY",
          },
        ],
        collapsed: true,
      },
      {
        id: "vacuna-parainfluenza",
        name: "Vacuna Parainfluenza",
        description: "Información de la vacuna contra Parainfluenza",
        fields: [
          {
            key: "Textbox35",
            label: "Nombre de la vacuna contra Parainfluenza",
            type: "manual",
            placeholder: "Nombre de la vacuna Parainfluenza",
          },
          {
            key: "Textbox36",
            label: "Laboratorio de la vacuna contra Parainfluenza",
            type: "manual",
            placeholder: "Laboratorio de la vacuna Parainfluenza",
          },
          {
            key: "Textbox37",
            label: "Número de serie de la vacuna contra Parainfluenza",
            type: "manual",
            placeholder: "Número de serie Parainfluenza",
          },
          {
            key: "Textbox38",
            label: "Fecha de vacunación contra Parainfluenza",
            type: "manual",
            placeholder: "DD/MM/YYYY",
          },
          {
            key: "Textbox39",
            label: "Fecha de vigencia de la vacuna contra Parainfluenza",
            type: "manual",
            placeholder: "DD/MM/YYYY",
          },
        ],
        collapsed: true,
      },
      {
        id: "vacuna-coronavirus",
        name: "Vacuna Coronavirus",
        description: "Información de la vacuna contra Coronavirus",
        fields: [
          {
            key: "Textbox40",
            label: "Nombre de la vacuna contra Coronavirus",
            type: "manual",
            placeholder: "Nombre de la vacuna Coronavirus",
          },
          {
            key: "Textbox41",
            label: "Laboratorio de la vacuna contra Coronavirus",
            type: "manual",
            placeholder: "Laboratorio de la vacuna Coronavirus",
          },
          {
            key: "Textbox42",
            label: "Número de serie de la vacuna contra Coronavirus",
            type: "manual",
            placeholder: "Número de serie Coronavirus",
          },
          {
            key: "Textbox43",
            label: "Fecha de vacunación contra Coronavirus",
            type: "manual",
            placeholder: "DD/MM/YYYY",
          },
          {
            key: "Textbox44",
            label: "Fecha de vigencia de la vacuna contra Coronavirus",
            type: "manual",
            placeholder: "DD/MM/YYYY",
          },
        ],
        collapsed: true,
      },
      {
        id: "vacuna-antirrabica",
        name: "Vacuna Antirrábica",
        description: "Información de la vacuna Antirrábica",
        fields: [
          {
            key: "Textbox45",
            label: "Nombre de la vacuna Antirrábica",
            type: "manual",
            placeholder: "Nombre de la vacuna Antirrábica",
          },
          {
            key: "Textbox46",
            label: "Laboratorio de la vacuna Antirrábica",
            type: "manual",
            placeholder: "Laboratorio de la vacuna Antirrábica",
          },
          {
            key: "Textbox47",
            label: "Número de serie de la vacuna Antirrábica",
            type: "manual",
            placeholder: "Número de serie Antirrábica",
          },
          {
            key: "Textbox48",
            label: "Fecha de vacunación de la vacuna Antirrábica",
            type: "manual",
            placeholder: "DD/MM/YYYY",
          },
          {
            key: "Textbox49",
            label: "Fecha de vigencia de la vacuna Antirrábica",
            type: "manual",
            placeholder: "DD/MM/YYYY",
          },
        ],
        collapsed: true,
      },
      {
        id: "desparasitacion-interna",
        name: "Desparasitación Interna",
        description: "Información de la desparasitación interna",
        fields: [
          {
            key: "Textbox50",
            label: "Nombre del producto usado para la desparasitación interna",
            type: "manual",
            placeholder: "Nombre del producto desparasitación interna",
          },
          {
            key: "Textbox51",
            label: "Laboratorio del producto de desparasitación interna",
            type: "manual",
            placeholder: "Laboratorio desparasitación interna",
          },
          {
            key: "Textbox52",
            label: "Principio activo del producto de desparasitación interna",
            type: "manual",
            placeholder: "Principio activo desparasitación interna",
          },
          {
            key: "Textbox53",
            label: "Lote del producto de desparasitación interna",
            type: "manual",
            placeholder: "Lote desparasitación interna",
          },
          {
            key: "Textbox54",
            label: "Fecha en que se realizó la desparasitación interna",
            type: "manual",
            placeholder: "DD/MM/YYYY",
          },
          {
            key: "Textbox55",
            label: "Hora en que se realizó la desparasitación interna",
            type: "manual",
            placeholder: "HH:MM",
          },
        ],
        collapsed: true,
      },
      {
        id: "desparasitacion-externa",
        name: "Desparasitación Externa",
        description: "Información de la desparasitación externa",
        fields: [
          {
            key: "Textbox56",
            label: "Nombre del producto usado para la desparasitación externa",
            type: "manual",
            placeholder: "Nombre del producto desparasitación externa",
          },
          {
            key: "Textbox57",
            label: "Laboratorio del producto de desparasitación externa",
            type: "manual",
            placeholder: "Laboratorio desparasitación externa",
          },
          {
            key: "Textbox58",
            label: "Principio activo del producto de desparasitación externa",
            type: "manual",
            placeholder: "Principio activo desparasitación externa",
          },
          {
            key: "Textbox59",
            label: "Lote del producto de desparasitación externa",
            type: "manual",
            placeholder: "Lote desparasitación externa",
          },
          {
            key: "Textbox60",
            label: "Fecha en que se realizó la desparasitación externa",
            type: "manual",
            placeholder: "DD/MM/YYYY",
          },
          {
            key: "Textbox61",
            label: "Hora en que se realizó la desparasitación externa",
            type: "manual",
            placeholder: "HH:MM",
          },
        ],
        collapsed: true,
      },
      {
        id: "fechas-certificado",
        name: "Fechas del Certificado",
        description: "Fechas de inspección y emisión del certificado",
        fields: [
          {
            key: "Textbox62",
            label: "Fecha de inspección física del animal (examen del veterinario)",
            type: "manual",
            placeholder: "DD/MM/YYYY",
          },
        ],
        collapsed: true,
      },
    ],
    acroFieldAlias: (() => {
      const map: Record<string, string> = {};
      // Mapea TextboxN -> TextboxN para compatibilidad con PDFs
      for (let i = 1; i <= 63; i++) {
        map[`Textbox${i}`] = `Textbox${i}`;
      }
      return map;
    })(),
  },
  // Certificado ID 3 con 17 campos para autorización quirúrgica
  "3": {
    id: 3,
    name: "Certificado de Autorización Quirúrgica ID 3",
    description: "Certificado de autorización para intervenciones quirúrgicas con 17 campos",
    fields: [
      {
        key: "Texbox1",
        label: "Nombre de la mascota",
        type: "auto",
        source: ({ paciente }) => paciente.nombre || "",
      },
      {
        key: "Texbox2",
        label: "Fecha actual de emisión",
        type: "auto",
        source: ({ now }) => formatFechaDDMMYYYY(now),
      },
      {
        key: "Texbox3",
        label: "Especie de la mascota",
        type: "auto",
        source: ({ paciente }) => especieTexto(paciente.especie),
      },
      {
        key: "Texbox4",
        label: "Raza de la mascota",
        type: "auto",
        source: ({ paciente }) => paciente.raza || "",
      },
      {
        key: "Texbox5",
        label: "Color de la mascota",
        type: "manual",
        placeholder: "Ingrese el color de la mascota",
      },
      {
        key: "Texbox6",
        label: "Sexo de la mascota",
        type: "auto",
        source: ({ paciente }) => sexoTexto(paciente.sexo),
      },
      {
        key: "Texbox7",
        label: "Edad de la mascota",
        type: "auto",
        source: ({ paciente }) => calcularEdadDesde(paciente.fecha_nacimiento),
      },
      {
        key: "Texbox8",
        label: "Peso de la mascota",
        type: "manual",
        placeholder: "Ingrese el peso en kg",
      },
      {
        key: "Texbox9",
        label: "Nombre del propietario",
        type: "auto",
        source: ({ propietario }) =>
          [propietario?.nombre || "", propietario?.apellido || ""].filter(Boolean).join(" "),
      },
      {
        key: "Texbox10",
        label: "C.I del propietario",
        type: "auto",
        source: ({ propietario }) => propietario?.rut || "",
      },
      {
        key: "Texbox11",
        label: "Dirección del propietario",
        type: "auto",
        source: ({ propietario }) => propietario?.direccion || "",
      },
      {
        key: "Texbox12",
        label: "Teléfono del propietario",
        type: "auto",
        source: ({ propietario }) => propietario?.telefono || "",
      },
      {
        key: "Texbox13",
        label: "Correo del propietario",
        type: "auto",
        source: ({ propietario }) => propietario?.correo_electronico || "",
      },
      {
        key: "Texbox14",
        label: "Autorización de intervención quirúrgica",
        type: "manual",
        placeholder: "Ingrese la autorización quirúrgica",
      },
      {
        key: "Texbox15",
        label: "Exámenes prequirúrgicos - SÍ",
        type: "manual",
        placeholder: "Sí",
      },
      {
        key: "Texbox16",
        label: "Exámenes prequirúrgicos - NO",
        type: "manual",
        placeholder: "No",
      },
      {
        key: "Texbox17",
        label: "Aranceles de los exámenes",
        type: "manual",
        placeholder: "Ingrese los aranceles de los exámenes",
      },
    ],
    acroFieldAlias: (() => {
      const map: Record<string, string> = {};
      // Mapea TexboxN -> TextboxN para compatibilidad con PDFs que usan "Textbox"
      for (let i = 1; i <= 21; i++) {
        map[`Texbox${i}`] = `Textbox${i}`;
      }
      return map;
    })(),
  },
  // Certificado ID 5 con 12 campos para certificado médico/veterinario
  "5": {
    id: 5,
    name: "Certificado Médico ID 5",
    description: "Certificado médico/veterinario con diagnóstico, tratamiento y observaciones",
    fields: [
      {
        key: "Texbox1",
        label: "Día de emisión",
        type: "auto",
        source: ({ now }) => String(now.getDate()).padStart(2, '0'),
      },
      {
        key: "Texbox2",
        label: "Mes de emisión",
        type: "auto",
        source: ({ now }) => String(now.getMonth() + 1).padStart(2, '0'),
      },
      {
        key: "Texbox3",
        label: "Año de emisión",
        type: "auto",
        source: ({ now }) => String(now.getFullYear()),
      },
      {
        key: "Texbox4",
        label: "Nombre de la mascota",
        type: "auto",
        source: ({ paciente }) => paciente.nombre || "",
      },
      {
        key: "Texbox5",
        label: "Nombre del propietario",
        type: "auto",
        source: ({ propietario }) =>
          [propietario?.nombre || "", propietario?.apellido || ""].filter(Boolean).join(" "),
      },
      {
        key: "Texbox6",
        label: "Diagnóstico",
        type: "manual",
        placeholder: "Ingrese el diagnóstico",
      },
      {
        key: "Texbox7",
        label: "Tratamiento",
        type: "manual",
        placeholder: "Ingrese el tratamiento",
      },
      {
        key: "Texbox8",
        label: "Observaciones",
        type: "manual",
        placeholder: "Ingrese las observaciones",
      },
      {
        key: "Texbox9",
        label: "Próximo control",
        type: "manual",
        placeholder: "Ingrese la fecha del próximo control",
      },
      {
        key: "Texbox10",
        label: "Edad de la mascota",
        type: "auto",
        source: ({ paciente }) => calcularEdadDesde(paciente.fecha_nacimiento),
      },
      {
        key: "Texbox11",
        label: "Peso de la mascota",
        type: "manual",
        placeholder: "Ingrese el peso en kg",
      },
      {
        key: "Texbox12",
        label: "Alimentación para la mascota",
        type: "manual",
        placeholder: "Ingrese las recomendaciones de alimentación",
      },
    ],
    acroFieldAlias: (() => {
      const map: Record<string, string> = {};
      // Mapea TexboxN -> TextboxN para compatibilidad con PDFs que usan "Textbox"
      for (let i = 1; i <= 12; i++) {
        map[`Texbox${i}`] = `Textbox${i}`;
      }
      return map;
    })(),
  },
  // Certificado ID 6 con 11 campos para descripción general del paciente
  "6": {
    id: 6,
    name: "Certificado de Descripción General ID 6",
    description: "Certificado con descripción general del paciente y datos básicos",
    fields: [
      {
        key: "Texbox1",
        label: "Fecha de emisión",
        type: "auto",
        source: ({ now }) => formatFechaDDMMYYYY(now),
      },
      {
        key: "Texbox2",
        label: "Nombre de la mascota",
        type: "auto",
        source: ({ paciente }) => paciente.nombre || "",
      },
      {
        key: "Texbox3",
        label: "Especie de la mascota",
        type: "auto",
        source: ({ paciente }) => especieTexto(paciente.especie),
      },
      {
        key: "Texbox4",
        label: "Raza de la mascota",
        type: "auto",
        source: ({ paciente }) => paciente.raza || "",
      },
      {
        key: "Texbox5",
        label: "Sexo de la mascota",
        type: "auto",
        source: ({ paciente }) => sexoTexto(paciente.sexo),
      },
      {
        key: "Texbox6",
        label: "Edad de la mascota",
        type: "auto",
        source: ({ paciente }) => calcularEdadDesde(paciente.fecha_nacimiento),
      },
      {
        key: "Texbox7",
        label: "Peso de la mascota",
        type: "manual",
        placeholder: "Ingrese el peso en kg",
      },
      {
        key: "Texbox8",
        label: "Nombre del propietario",
        type: "auto",
        source: ({ propietario }) =>
          [propietario?.nombre || "", propietario?.apellido || ""].filter(Boolean).join(" "),
      },
      {
        key: "Texbox9",
        label: "Teléfono del propietario",
        type: "auto",
        source: ({ propietario }) => propietario?.telefono || "",
      },
      {
        key: "Texbox10",
        label: "Dirección del propietario",
        type: "auto",
        source: ({ propietario }) => propietario?.direccion || "",
      },
      {
        key: "Texbox11",
        label: "Descripción general del paciente",
        type: "manual",
        placeholder: "Ingrese una descripción detallada del paciente",
      },
    ],
    acroFieldAlias: (() => {
      const map: Record<string, string> = {};
      // Mapea TexboxN -> TextboxN para compatibilidad con PDFs que usan "Textbox"
      for (let i = 1; i <= 11; i++) {
        map[`Texbox${i}`] = `Textbox${i}`;
      }
      return map;
    })(),
  },
  // Certificado ID 8 con 21 campos para certificado de hospitalización
  "8": {
    id: 8,
    name: "Certificado de Hospitalización ID 8",
    description: "Certificado de hospitalización con fechas de ingreso/egreso, diagnóstico y tratamiento",
    fields: [
      {
        key: "Texbox1",
        label: "Fecha de ingreso",
        type: "manual",
        placeholder: "DD/MM/YYYY",
      },
      {
        key: "Texbox2",
        label: "Fecha de egreso",
        type: "manual",
        placeholder: "DD/MM/YYYY",
      },
      {
        key: "Texbox3",
        label: "Nombre del propietario",
        type: "auto",
        source: ({ propietario }) =>
          [propietario?.nombre || "", propietario?.apellido || ""].filter(Boolean).join(" "),
      },
      {
        key: "Texbox4",
        label: "Dirección del propietario",
        type: "auto",
        source: ({ propietario }) => propietario?.direccion || "",
      },
      {
        key: "Texbox5",
        label: "RUT del propietario",
        type: "auto",
        source: ({ propietario }) => propietario?.rut || "",
      },
      {
        key: "Texbox6",
        label: "Teléfono del propietario",
        type: "auto",
        source: ({ propietario }) => propietario?.telefono || "",
      },
      {
        key: "Texbox7",
        label: "Nombre de la mascota",
        type: "auto",
        source: ({ paciente }) => paciente.nombre || "",
      },
      {
        key: "Texbox8",
        label: "Especie de la mascota",
        type: "auto",
        source: ({ paciente }) => especieTexto(paciente.especie),
      },
      {
        key: "Texbox9",
        label: "Edad de la mascota",
        type: "auto",
        source: ({ paciente }) => calcularEdadDesde(paciente.fecha_nacimiento),
      },
      {
        key: "Texbox10",
        label: "Raza de la mascota",
        type: "auto",
        source: ({ paciente }) => paciente.raza || "",
      },
      {
        key: "Texbox11",
        label: "Peso de la mascota",
        type: "manual",
        placeholder: "Ingrese el peso en kg",
      },
      {
        key: "Texbox12",
        label: "Color de la mascota",
        type: "manual",
        placeholder: "Ingrese el color de la mascota",
      },
      {
        key: "Texbox13",
        label: "Sexo de la mascota",
        type: "auto",
        source: ({ paciente }) => sexoTexto(paciente.sexo),
      },
      {
        key: "Textbox14",
        label: "Síntomas y signos clínicos de ingreso",
        type: "manual",
        placeholder: "Describa los síntomas y signos clínicos al ingreso",
      },
      {
        key: "Textbox15",
        label: "Diagnóstico de ingreso",
        type: "manual",
        placeholder: "Ingrese el diagnóstico al momento del ingreso",
      },
      {
        key: "Textbox16",
        label: "Diagnóstico de egreso",
        type: "manual",
        placeholder: "Ingrese el diagnóstico al momento del egreso",
      },
      {
        key: "Textbox17",
        label: "Causa del egreso",
        type: "manual",
        placeholder: "Describa la causa del egreso (alta médica, alta relativa, etc.)",
      },
      {
        key: "Textbox18",
        label: "Exámenes complementarios realizados",
        type: "manual",
        placeholder: "Liste los exámenes complementarios realizados",
      },
      {
        key: "Textbox19",
        label: "Tratamiento realizado durante la hospitalización",
        type: "manual",
        placeholder: "Describa el tratamiento realizado durante la estancia",
      },
      {
        key: "Textbox20",
        label: "Tratamiento a seguir después del egreso",
        type: "manual",
        placeholder: "Indique el tratamiento domiciliario o seguimiento",
      },
      {
        key: "Textbox21",
        label: "Recomendaciones finales del médico veterinario",
        type: "manual",
        placeholder: "Escriba las recomendaciones finales (cuidados, controles, medicación, etc.)",
      },
    ],
    acroFieldAlias: (() => {
      const map: Record<string, string> = {};
      // Mapea TexboxN -> TextboxN para compatibilidad con PDFs que usan "Textbox"
      for (let i = 1; i <= 21; i++) {
        map[`Texbox${i}`] = `Textbox${i}`;
        map[`Textbox${i}`] = `Textbox${i}`;
      }
      return map;
    })(),
  },
  // Certificado ID 9 - Plantilla básica (pendiente de definir campos específicos)
  "9": {
    id: 9,
    name: "Certificado de Identificación y Vacunación ID 9",
    description: "Identificación del animal, del propietario, vacunación y desparasitación (46 campos)",
    fields: [
      // 🐾 Identificación del animal (auto)
      { key: "Textbox1",  label: "Nombre de la mascota", type: "auto", source: ({ paciente }) => paciente.nombre || "" },
      { key: "Textbox2",  label: "Raza del animal", type: "auto", source: ({ paciente }) => paciente.raza || "" },
      { key: "Textbox6",  label: "Edad del animal", type: "auto", source: ({ paciente }) => calcularEdadDesde(paciente.fecha_nacimiento) },
      { key: "Textbox7",  label: "Sexo del animal", type: "auto", source: ({ paciente }) => sexoTexto(paciente.sexo) },

      // 👤 Identificación del propietario (auto)
      { key: "Textbox10", label: "Nombre completo del propietario", type: "auto", source: ({ propietario }) => [propietario?.nombre || "", propietario?.apellido || ""].filter(Boolean).join(" ") },
      { key: "Textbox11", label: "RUT o pasaporte del propietario", type: "auto", source: ({ propietario }) => propietario?.rut || "" },
      { key: "Textbox12", label: "Dirección del propietario", type: "auto", source: ({ propietario }) => propietario?.direccion || "" },
      { key: "Textbox13", label: "Teléfono del propietario", type: "auto", source: ({ propietario }) => propietario?.telefono || "" },
    ],
    fieldGroups: [
      {
        id: "datos-fisicos",
        name: "Datos Físicos y Microchip",
        description: "Información física de la mascota y datos del microchip",
        fields: [
          { key: "Textbox3",  label: "Número de microchip", type: "manual", placeholder: "Ingrese el N° de microchip" },
          { key: "Textbox4",  label: "Especie del animal", type: "auto", source: ({ paciente }) => especieTexto(paciente.especie) },
          { key: "Textbox5",  label: "Color del animal", type: "manual", placeholder: "Ingrese el color" },
          { key: "Textbox8",  label: "Fecha de aplicación del microchip", type: "manual", placeholder: "DD/MM/YYYY" },
          { key: "Textbox9",  label: "Sitio de aplicación del microchip", type: "manual", placeholder: "Ej: subcutáneo, escapular izq., etc." },
        ],
        collapsed: true,
      },
      {
        id: "vacuna-panleucopenia",
        name: "Vacuna Panleucopenia",
        description: "Información de la vacuna contra Panleucopenia",
        fields: [
          { key: "Textbox15", label: "Nombre de la vacuna", type: "manual", placeholder: "Nombre de la vacuna" },
          { key: "Textbox16", label: "Laboratorio", type: "manual", placeholder: "Laboratorio" },
          { key: "Textbox17", label: "Número de serie", type: "manual", placeholder: "Número de serie" },
          { key: "Textbox18", label: "Fecha de vacunación", type: "manual", placeholder: "DD/MM/YYYY" },
          { key: "Textbox19", label: "Fecha de vigencia", type: "manual", placeholder: "DD/MM/YYYY" },
        ],
        collapsed: true,
      },
      {
        id: "vacuna-rinotraqueitis",
        name: "Vacuna Rinotraqueítis",
        description: "Información de la vacuna contra Rinotraqueítis",
        fields: [
          { key: "Textbox20", label: "Nombre de la vacuna", type: "manual", placeholder: "Nombre de la vacuna" },
          { key: "Textbox21", label: "Laboratorio", type: "manual", placeholder: "Laboratorio" },
          { key: "Textbox22", label: "Número de serie", type: "manual", placeholder: "Número de serie" },
          { key: "Textbox23", label: "Fecha de vacunación", type: "manual", placeholder: "DD/MM/YYYY" },
          { key: "Textbox24", label: "Fecha de vigencia", type: "manual", placeholder: "DD/MM/YYYY" },
        ],
        collapsed: true,
      },
      {
        id: "vacuna-calicivirus",
        name: "Vacuna Calicivirus",
        description: "Información de la vacuna contra Calicivirus",
        fields: [
          { key: "Textbox25", label: "Nombre de la vacuna", type: "manual", placeholder: "Nombre de la vacuna" },
          { key: "Textbox26", label: "Laboratorio", type: "manual", placeholder: "Laboratorio" },
          { key: "Textbox27", label: "Número de serie", type: "manual", placeholder: "Número de serie" },
          { key: "Textbox28", label: "Fecha de vacunación", type: "manual", placeholder: "DD/MM/YYYY" },
          { key: "Textbox29", label: "Fecha de vigencia", type: "manual", placeholder: "DD/MM/YYYY" },
        ],
        collapsed: true,
      },
      {
        id: "vacuna-antirrabica",
        name: "Vacuna Antirrábica",
        description: "Información de la vacuna Antirrábica",
        fields: [
          { key: "Textbox30", label: "Nombre de la vacuna", type: "manual", placeholder: "Nombre de la vacuna" },
          { key: "Textbox31", label: "Laboratorio", type: "manual", placeholder: "Laboratorio" },
          { key: "Textbox32", label: "Número de serie", type: "manual", placeholder: "Número de serie" },
          { key: "Textbox33", label: "Fecha de vacunación", type: "manual", placeholder: "DD/MM/YYYY" },
          { key: "Textbox34", label: "Fecha de vigencia", type: "manual", placeholder: "DD/MM/YYYY" },
        ],
        collapsed: true,
      },
      {
        id: "desparasitacion-interna",
        name: "Desparasitación Interna",
        description: "Información de la desparasitación interna",
        fields: [
          { key: "Textbox35", label: "Nombre del producto", type: "manual", placeholder: "Nombre comercial" },
          { key: "Textbox36", label: "Laboratorio", type: "manual", placeholder: "Laboratorio" },
          { key: "Textbox37", label: "Principio activo", type: "manual", placeholder: "Principio activo" },
          { key: "Textbox38", label: "Lote", type: "manual", placeholder: "Lote" },
          { key: "Textbox39", label: "Fecha de desparasitación", type: "manual", placeholder: "DD/MM/YYYY" },
          { key: "Textbox40", label: "Hora de aplicación", type: "manual", placeholder: "HH:MM" },
        ],
        collapsed: true,
      },
      {
        id: "desparasitacion-externa",
        name: "Desparasitación Externa",
        description: "Información de la desparasitación externa",
        fields: [
          { key: "Textbox41", label: "Nombre del producto", type: "manual", placeholder: "Nombre comercial" },
          { key: "Textbox42", label: "Laboratorio", type: "manual", placeholder: "Laboratorio" },
          { key: "Textbox43", label: "Principio activo", type: "manual", placeholder: "Principio activo" },
          { key: "Textbox44", label: "Lote", type: "manual", placeholder: "Lote" },
          { key: "Textbox45", label: "Fecha de desparasitación", type: "manual", placeholder: "DD/MM/YYYY" },
          { key: "Textbox46", label: "Hora de aplicación", type: "manual", placeholder: "HH:MM" },
        ],
        collapsed: true,
      },
      {
        id: "fechas-certificado",
        name: "Fechas del Certificado",
        description: "Fechas de inspección y emisión del certificado",
        fields: [
          { key: "Textbox14", label: "Fecha de inspección física", type: "manual", placeholder: "DD/MM/YYYY" },
          { key: "Textbox47", label: "Fecha de emisión del certificado", type: "auto", source: ({ now }) => formatFechaDDMMYYYY(now) },
        ],
        collapsed: true,
      },
    ],
    acroFieldAlias: (() => {
      const map: Record<string, string> = {};
      for (let i = 1; i <= 47; i++) {
        map[`Texbox${i}`] = `Textbox${i}`;
        map[`Textbox${i}`] = `Textbox${i}`;
      }
      return map;
    })(),
  },
  // Certificado ID 10 - Certificado de defunción (14 campos)
  "10": {
    id: 10,
    name: "Certificado de Defunción ID 10",
    description: "Certificado de defunción del paciente con datos del propietario y del evento",
    fields: [
      {
        key: "Textbox1",
        label: "Nombre completo del propietario",
        type: "auto",
        source: ({ propietario }) => [propietario?.nombre || "", propietario?.apellido || ""].filter(Boolean).join(" "),
      },
      {
        key: "Textbox2",
        label: "Dirección del propietario",
        type: "auto",
        source: ({ propietario }) => propietario?.direccion || "",
      },
      {
        key: "Textbox3",
        label: "RUT o pasaporte del propietario",
        type: "auto",
        source: ({ propietario }) => propietario?.rut || "",
      },
      {
        key: "Textbox4",
        label: "Teléfono del propietario",
        type: "auto",
        source: ({ propietario }) => propietario?.telefono || "",
      },
      {
        key: "Textbox5",
        label: "Nombre de la mascota",
        type: "auto",
        source: ({ paciente }) => paciente.nombre || "",
      },
      {
        key: "Textbox6",
        label: "Especie del animal",
        type: "auto",
        source: ({ paciente }) => especieTexto(paciente.especie),
      },
      {
        key: "Textbox7",
        label: "Raza de la mascota",
        type: "auto",
        source: ({ paciente }) => paciente.raza || "",
      },
      {
        key: "Textbox8",
        label: "Color del animal",
        type: "manual",
        placeholder: "Ingrese el color del pelaje o del animal",
      },
      {
        key: "Textbox9",
        label: "Sexo del animal",
        type: "auto",
        source: ({ paciente }) => sexoTexto(paciente.sexo),
      },
      {
        key: "Textbox10",
        label: "Motivo de defunción",
        type: "manual",
        placeholder: "Enfermedad, accidente, eutanasia, etc.",
      },
      {
        key: "Textbox11",
        label: "Lugar de defunción",
        type: "manual",
        placeholder: "Clínica, domicilio u otro",
      },
      {
        key: "Textbox12",
        label: "Peso al momento de la defunción",
        type: "manual",
        placeholder: "Ingrese el peso en kg",
      },
      {
        key: "Textbox13",
        label: "Fecha de nacimiento del animal",
        type: "auto",
        source: ({ paciente }) => paciente?.fecha_nacimiento ? formatFechaDDMMYYYY(new Date(paciente.fecha_nacimiento)) : "",
      },
      {
        key: "Textbox14",
        label: "Fecha de defunción",
        type: "manual",
        placeholder: "DD/MM/YYYY",
      },
    ],
    acroFieldAlias: (() => {
      const map: Record<string, string> = {};
      for (let i = 1; i <= 14; i++) {
        map[`Texbox${i}`] = `Textbox${i}`;
        map[`Textbox${i}`] = `Textbox${i}`;
      }
      return map;
    })(),
  },
  // Certificado ID 11 - Plantilla base (provisional)
  "11": {
    id: 11,
    name: "Health Certificate (ID 11)",
    description: "Identificación, vacunación y desparasitación (similar a ID 7)",
    fields: [
      // 🐾 Identificación del animal (auto)
      { key: "Textbox1",  label: "Nombre de la mascota", type: "auto", source: ({ paciente }) => paciente.nombre || "" },
      { key: "Textbox2",  label: "Especie del animal", type: "auto", source: ({ paciente }) => especieTexto(paciente.especie) },
      { key: "Textbox3",  label: "Edad de la mascota", type: "auto", source: ({ paciente }) => calcularEdadDesde(paciente.fecha_nacimiento) },
      { key: "Textbox6",  label: "Raza de la mascota", type: "auto", source: ({ paciente }) => paciente.raza || "" },
      { key: "Textbox5",  label: "Sexo de la mascota", type: "auto", source: ({ paciente }) => sexoTexto(paciente.sexo) },

      // 👤 Identificación del propietario (auto)
      { key: "Textbox11", label: "Nombre del propietario", type: "auto", source: ({ propietario }) => [propietario?.nombre || "", propietario?.apellido || ""].filter(Boolean).join(" ") },
      { key: "Textbox12", label: "RUT/Pasaporte del propietario", type: "auto", source: ({ propietario }) => propietario?.rut || "" },
      { key: "Textbox13", label: "Dirección del propietario", type: "auto", source: ({ propietario }) => propietario?.direccion || "" },
      { key: "Textbox14", label: "Teléfono del propietario", type: "auto", source: ({ propietario }) => propietario?.telefono || "" },

      // Fechas principales (auto)
      { key: "Textbox63", label: "Fecha de emisión del Health Certificate", type: "auto", source: ({ now }) => formatFechaDDMMYYYY(now) },
    ],
    fieldGroups: [
      {
        id: "datos-fisicos",
        name: "Datos Físicos y Microchip",
        description: "Información física de la mascota y datos del microchip",
        fields: [
          { key: "Textbox7",  label: "Peso de la mascota", type: "manual", placeholder: "Ingrese el peso en kg" },
          { key: "Textbox4",  label: "Color de la mascota", type: "manual", placeholder: "Ingrese el color" },
          { key: "Textbox8",  label: "Número de microchip", type: "manual", placeholder: "Ingrese el N° de microchip" },
          { key: "Textbox9",  label: "Fecha de aplicación del microchip", type: "manual", placeholder: "DD/MM/YYYY" },
          { key: "Textbox10", label: "Sitio de aplicación del microchip", type: "manual", placeholder: "Ej: subcutáneo, escapular izq., etc." },
          { key: "Textbox15", label: "Fecha de inspección física", type: "manual", placeholder: "DD/MM/YYYY" },
        ],
        collapsed: true,
      },
      // Vacunas (igual estructura que ID 7)
      {
        id: "vacuna-distemper",
        name: "Vacuna Distemper",
        description: "Información de la vacuna contra Distemper",
        fields: [
          { key: "Textbox20", label: "Nombre de la vacuna contra Distemper", type: "manual", placeholder: "Nombre de la vacuna Distemper" },
          { key: "Textbox16", label: "Laboratorio de la vacuna contra Distemper", type: "manual", placeholder: "Laboratorio de la vacuna Distemper" },
          { key: "Textbox17", label: "Número de serie de la vacuna contra Distemper", type: "manual", placeholder: "Número de serie Distemper" },
          { key: "Textbox18", label: "Fecha de vacunación contra Distemper", type: "manual", placeholder: "DD/MM/YYYY" },
          { key: "Textbox19", label: "Fecha de vigencia de la vacuna contra Distemper", type: "manual", placeholder: "DD/MM/YYYY" },
        ],
        collapsed: true,
      },
      {
        id: "vacuna-adenovirus",
        name: "Vacuna Adenovirus (Hepatitis)",
        description: "Información de la vacuna contra Adenovirus (Hepatitis)",
        fields: [
          { key: "Textbox25", label: "Nombre de la vacuna contra Adenovirus (Hepatitis)", type: "manual", placeholder: "Nombre de la vacuna Adenovirus" },
          { key: "Textbox21", label: "Laboratorio de la vacuna contra Adenovirus (Hepatitis)", type: "manual", placeholder: "Laboratorio de la vacuna Adenovirus" },
          { key: "Textbox22", label: "Número de serie de la vacuna contra Adenovirus (Hepatitis)", type: "manual", placeholder: "Número de serie Adenovirus" },
          { key: "Textbox23", label: "Fecha de vacunación contra Adenovirus (Hepatitis)", type: "manual", placeholder: "DD/MM/YYYY" },
          { key: "Textbox24", label: "Fecha de vigencia de la vacuna contra Adenovirus (Hepatitis)", type: "manual", placeholder: "DD/MM/YYYY" },
        ],
        collapsed: true,
      },
      {
        id: "vacuna-leptospira",
        name: "Vacuna Leptospira",
        description: "Información de la vacuna contra Leptospira",
        fields: [
          { key: "Textbox30", label: "Nombre de la vacuna contra Leptospira", type: "manual", placeholder: "Nombre de la vacuna Leptospira" },
          { key: "Textbox26", label: "Laboratorio de la vacuna contra Leptospira", type: "manual", placeholder: "Laboratorio de la vacuna Leptospira" },
          { key: "Textbox27", label: "Número de serie de la vacuna contra Leptospira", type: "manual", placeholder: "Número de serie Leptospira" },
          { key: "Textbox28", label: "Fecha de vacunación contra Leptospira", type: "manual", placeholder: "DD/MM/YYYY" },
          { key: "Textbox29", label: "Fecha de vigencia de la vacuna contra Leptospira", type: "manual", placeholder: "DD/MM/YYYY" },
        ],
        collapsed: true,
      },
      {
        id: "vacuna-parvovirus",
        name: "Vacuna Parvovirus",
        description: "Información de la vacuna contra Parvovirus",
        fields: [
          { key: "Textbox35", label: "Nombre de la vacuna contra Parvovirus", type: "manual", placeholder: "Nombre de la vacuna Parvovirus" },
          { key: "Textbox31", label: "Laboratorio de la vacuna contra Parvovirus", type: "manual", placeholder: "Laboratorio de la vacuna Parvovirus" },
          { key: "Textbox32", label: "Número de serie de la vacuna contra Parvovirus", type: "manual", placeholder: "Número de serie Parvovirus" },
          { key: "Textbox33", label: "Fecha de vacunación contra Parvovirus", type: "manual", placeholder: "DD/MM/YYYY" },
          { key: "Textbox34", label: "Fecha de vigencia de la vacuna contra Parvovirus", type: "manual", placeholder: "DD/MM/YYYY" },
        ],
        collapsed: true,
      },
      {
        id: "vacuna-parainfluenza",
        name: "Vacuna Parainfluenza",
        description: "Información de la vacuna contra Parainfluenza",
        fields: [
          { key: "Textbox40", label: "Nombre de la vacuna contra Parainfluenza", type: "manual", placeholder: "Nombre de la vacuna Parainfluenza" },
          { key: "Textbox36", label: "Laboratorio de la vacuna contra Parainfluenza", type: "manual", placeholder: "Laboratorio de la vacuna Parainfluenza" },
          { key: "Textbox37", label: "Número de serie de la vacuna contra Parainfluenza", type: "manual", placeholder: "Número de serie Parainfluenza" },
          { key: "Textbox38", label: "Fecha de vacunación contra Parainfluenza", type: "manual", placeholder: "DD/MM/YYYY" },
          { key: "Textbox39", label: "Fecha de vigencia de la vacuna contra Parainfluenza", type: "manual", placeholder: "DD/MM/YYYY" },
        ],
        collapsed: true,
      },
      {
        id: "vacuna-coronavirus",
        name: "Vacuna Coronavirus",
        description: "Información de la vacuna contra Coronavirus",
        fields: [
          { key: "Textbox45", label: "Nombre de la vacuna contra Coronavirus", type: "manual", placeholder: "Nombre de la vacuna Coronavirus" },
          { key: "Textbox41", label: "Laboratorio de la vacuna contra Coronavirus", type: "manual", placeholder: "Laboratorio de la vacuna Coronavirus" },
          { key: "Textbox42", label: "Número de serie de la vacuna contra Coronavirus", type: "manual", placeholder: "Número de serie Coronavirus" },
          { key: "Textbox43", label: "Fecha de vacunación contra Coronavirus", type: "manual", placeholder: "DD/MM/YYYY" },
          { key: "Textbox44", label: "Fecha de vigencia de la vacuna contra Coronavirus", type: "manual", placeholder: "DD/MM/YYYY" },
        ],
        collapsed: true,
      },
      {
        id: "vacuna-antirrabica",
        name: "Vacuna Antirrábica",
        description: "Información de la vacuna contra Antirrábica",
        fields: [
          { key: "Textbox50", label: "Nombre de la vacuna contra Antirrábica", type: "manual", placeholder: "Nombre de la vacuna Antirrábica" },
          { key: "Textbox46", label: "Laboratorio de la vacuna contra Antirrábica", type: "manual", placeholder: "Laboratorio de la vacuna Antirrábica" },
          { key: "Textbox47", label: "Número de serie de la vacuna contra Antirrábica", type: "manual", placeholder: "Número de serie Antirrábica" },
          { key: "Textbox48", label: "Fecha de vacunación contra Antirrábica", type: "manual", placeholder: "DD/MM/YYYY" },
          { key: "Textbox49", label: "Fecha de vigencia de la vacuna contra Antirrábica", type: "manual", placeholder: "DD/MM/YYYY" },
        ],
        collapsed: true,
      },
      {
        id: "desparasitacion-interna",
        name: "Desparasitación Interna",
        description: "Información de la desparasitación interna",
        fields: [
          { key: "Textbox51", label: "Nombre del producto usado para la desparasitación interna", type: "manual", placeholder: "Nombre del producto desparasitación interna" },
          { key: "Textbox52", label: "Laboratorio del producto de desparasitación interna", type: "manual", placeholder: "Laboratorio desparasitación interna" },
          { key: "Textbox53", label: "Principio activo del producto de desparasitación interna", type: "manual", placeholder: "Principio activo desparasitación interna" },
          { key: "Textbox54", label: "Lote del producto de desparasitación interna", type: "manual", placeholder: "Lote desparasitación interna" },
          { key: "Textbox55", label: "Fecha en que se realizó la desparasitación interna", type: "manual", placeholder: "DD/MM/YYYY" },
          { key: "Textbox56", label: "Hora en que se realizó la desparasitación interna", type: "manual", placeholder: "HH:MM" },
        ],
        collapsed: true,
      },
      {
        id: "desparasitacion-externa",
        name: "Desparasitación Externa",
        description: "Información de la desparasitación externa",
        fields: [
          { key: "Textbox57", label: "Nombre del producto usado para la desparasitación externa", type: "manual", placeholder: "Nombre del producto desparasitación externa" },
          { key: "Textbox58", label: "Laboratorio del producto de desparasitación externa", type: "manual", placeholder: "Laboratorio desparasitación externa" },
          { key: "Textbox59", label: "Principio activo del producto de desparasitación externa", type: "manual", placeholder: "Principio activo desparasitación externa" },
          { key: "Textbox60", label: "Lote del producto de desparasitación externa", type: "manual", placeholder: "Lote desparasitación externa" },
          { key: "Textbox61", label: "Fecha en que se realizó la desparasitación externa", type: "manual", placeholder: "DD/MM/YYYY" },
          { key: "Textbox62", label: "Hora en que se realizó la desparasitación externa", type: "manual", placeholder: "HH:MM" },
        ],
        collapsed: true,
      },
    ],
    acroFieldAlias: (() => {
      const map: Record<string, string> = {};
      for (let i = 1; i <= 63; i++) {
        map[`Texbox${i}`] = `Textbox${i}`;
        map[`Textbox${i}`] = `Textbox${i}`;
      }
      return map;
    })(),
  },
};

export type CertificateTemplateKey = keyof typeof certificateTemplates;


