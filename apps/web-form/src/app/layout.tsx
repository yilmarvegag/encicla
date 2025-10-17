import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import ResponsiveToaster from "@/components/ResponsiveToaster";

if (process.env.NODE_ENV === "development" && typeof window !== "undefined") {
  import("@/mocks/browser").then(({ worker }) => worker.start());
}

const geistSans = Geist({ variable: "--font-geist-sans", subsets: ["latin"] });
const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Formulario Encicla",
  description: "Registro de usuarios",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="es" className="h-full">
      {/* <body className={`${geistSans.variable} ${geistMono.variable} antialiased h-full bg-encicla text-slate-100`}> */}
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased h-full bg-slate-900 text-slate-100`}
      >
        {/* contenedor central */}
        <div className="min-h-full">
          {children}
          <ResponsiveToaster />
        </div>
      </body>
    </html>
  );
}
