import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import Navbar from "../components/Navbar";

const inter = Inter({ subsets: ["latin"] });

// Defina a URL base para facilitar a manutenção
const siteUrl = "https://cantina-igreja.vercel.app";

export const metadata: Metadata = {
  title: "Cantina PIB | Sistema",
  description: "Gerenciamento de pedidos e estoque da Cantina",
  
  icons: {
    icon: "/Logotipo_blue.png",
    apple: "/Logotipo_blue.png",
    // Se quiser que o ícone fique perfeito em Android/Chrome, adicione o shortcut:
    shortcut: "/Logotipo_blue.png",
  },

  openGraph: {
    title: "Cantina PIB",
    description: "Faça seu pedido e acompanhe a cozinha em tempo real.",
    url: siteUrl,
    siteName: "Cantina App",
    images: [
      {
        // Usar a URL completa aqui garante que o WhatsApp sempre encontre o logo
        url: `${siteUrl}/Logotipo_blue.png`, 
        width: 1200,
        height: 630,
        alt: "Logo Cantina PIB",
      },
    ],
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
        <Navbar />
        <main>{children}</main>
      </body>
    </html>
  );
}