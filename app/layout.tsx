import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import Navbar from "../components/Navbar";
import { ModalProvider } from "../components/ModalProvider";

const inter = Inter({ subsets: ["latin"] });

// Defina a URL base para facilitar a manutenção
const siteUrl = "https://comandafacil.vercel.app";

export const metadata: Metadata = {
  title: "ComandaFácil | Sistema",
  description: "Gerenciamento inteligente de pedidos e comandas",
  


  openGraph: {
    title: "ComandaFácil",
    description: "Faça seu pedido e acompanhe sua comanda em tempo real.",
    url: siteUrl,
    siteName: "ComandaFácil App",

    locale: "pt_BR",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR">
      <body className={inter.className}>
        <ModalProvider>
          <Navbar />
          <main>{children}</main>
        </ModalProvider>
      </body>
    </html>
  );
}