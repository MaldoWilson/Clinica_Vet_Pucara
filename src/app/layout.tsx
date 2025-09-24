import type { Metadata, Viewport } from "next";
import { ReactNode } from "react";
import "@/styles/globals.css";

export const metadata: Metadata = {
  title: process.env.NEXT_PUBLIC_SITE_NAME || "Clínica Pucará",
  description: "Atención veterinaria integral. Agenda tu hora.",
  keywords: ["veterinaria", "clínica", "mascotas", "citas", "atención veterinaria"],
  authors: [{ name: "Clínica Pucará" }],
  robots: "index, follow",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="es">
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no" />
      </head>
      <body>
        {children}
      </body>
    </html>
  );
}
