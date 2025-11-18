import { ReactNode } from "react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

export default function WebLayout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-dvh flex flex-col">
      <Navbar />
      <main className="flex-1 pt-16 lg:pt-18 bg-white relative z-0">{children}</main>
      <Footer />
    </div>
  );
}
