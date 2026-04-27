"use client";

import Image from "next/image"; // Adicione essa linha aqui
import Link from "next/link";
import { usePathname } from "next/navigation";
import { supabase } from "../lib/supabase";
import { Store, ChefHat, LayoutDashboard, LogOut } from "lucide-react";


export default function Navbar() {
  const pathname = usePathname();

  if (pathname === "/login" || pathname === "/") return null;

  async function handleLogout() {
    await supabase.auth.signOut();
    window.location.href = "/login";
  }

  return (
    <nav className="bg-white/90 backdrop-blur-md border-b border-gray-200 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          
          {/* Logo */}
          <div className="flex-shrink-0 flex items-center gap-2 font-black text-xl tracking-tight text-blue-600">
            {/* <Store className="text-blue-500" strokeWidth={2.5} /> */}
            <Image 
                src="/Logotipo_blue.png" // O nome exato do arquivo que você colocou na pasta public
                alt="Logo Cantina"
                width={40}  // Largura em pixels
                height={40} // Altura em pixels
                className="rounded-lg object-contain" // Deixa os cantos arredondados se quiser
            />

            <span className="hidden sm:block">PIB Cantina</span>
          </div>

          {/* Links de Navegação */}
          <div className="flex items-center gap-1 sm:gap-2">
            <Link 
              href="/caixa" 
              className={`flex items-center gap-2 px-3 sm:px-4 py-2 rounded-full text-sm font-semibold transition-all ${
                pathname === '/caixa' ? 'bg-blue-50 text-blue-700 shadow-sm' : 'text-gray-500 hover:bg-gray-100 hover:text-gray-900'
              }`}
            >
              <Store size={18} /> <span className="hidden md:inline">Caixa</span>
            </Link>
            
            <Link 
              href="/cozinha" 
              className={`flex items-center gap-2 px-3 sm:px-4 py-2 rounded-full text-sm font-semibold transition-all ${
                pathname === '/cozinha' ? 'bg-blue-50 text-blue-700 shadow-sm' : 'text-gray-500 hover:bg-gray-100 hover:text-gray-900'
              }`}
            >
              <ChefHat size={18} /> <span className="hidden md:inline">Cozinha</span>
            </Link>
            
            <Link 
              href="/admin" 
              className={`flex items-center gap-2 px-3 sm:px-4 py-2 rounded-full text-sm font-semibold transition-all ${
                pathname === '/admin' ? 'bg-blue-50 text-blue-700 shadow-sm' : 'text-gray-500 hover:bg-gray-100 hover:text-gray-900'
              }`}
            >
              <LayoutDashboard size={18} /> <span className="hidden md:inline">Admin</span>
            </Link>

            <div className="h-6 w-px bg-gray-200 mx-1 sm:mx-2"></div>

            {/* Botão de Sair Minimalista */}
            <button 
              onClick={handleLogout} 
              className="p-2 sm:px-4 sm:py-2 rounded-full text-sm font-semibold text-red-500 hover:bg-red-50 hover:text-red-700 transition-colors flex items-center gap-2"
            >
              <LogOut size={18} /> <span className="hidden md:inline">Sair</span>
            </button>
          </div>

        </div>
      </div>
    </nav>
  );
}