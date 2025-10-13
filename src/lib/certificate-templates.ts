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
  } | null;
  veterinarios: Array<{ id: string; nombre: string }>;
  now: Date;
};

export type CertificateTemplate = {
  id: number;
  name: string;
  description?: string;
  fields: CertificateField[];
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
};

export type CertificateTemplateKey = keyof typeof certificateTemplates;


