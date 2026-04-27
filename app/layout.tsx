import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import Navbar from "../components/Navbar"; // Importamos o menu aqui

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Cantina App",
  description: "Jesus vive",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR">
      <body className={inter.className}>
        {/* O menu fica aqui, acima de todo o resto do site */}
        <Navbar />
        {/* Aqui é onde o conteúdo de cada página (Caixa, Cozinha, etc) vai aparecer */}
        <main>{children}</main>
      </body>
    </html>
  );
}