"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { supabase } from "../lib/supabase";
import { Store, ChefHat, LayoutDashboard, LogOut } from "lucide-react";

export default function Navbar() {
  const pathname = usePathname();

  // Esconde o menu se a pessoa estiver na tela de login ou na página inicial de redirecionamento
  if (pathname === "/login" || pathname === "/") return null;

  async function handleLogout() {
    await supabase.auth.signOut();
    window.location.href = "/login";
  }

  return (
    <nav className="bg-blue-800 text-white shadow-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          
          {/* Logo / Nome */}
          <div className="flex-shrink-0 flex items-center gap-2 font-bold text-xl">
            <Store className="text-yellow-400" />
            <span>Cantina PIB</span>
          </div>

          {/* Links de Navegação */}
          <div className="flex items-center gap-2 md:gap-4">
            <Link 
              href="/caixa" 
              className={`flex items-center gap-2 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                pathname === '/caixa' ? 'bg-blue-900 text-yellow-400' : 'hover:bg-blue-700'
              }`}
            >
              <Store size={18} /> <span className="hidden md:inline">Caixa</span>
            </Link>
            
            <Link 
              href="/cozinha" 
              className={`flex items-center gap-2 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                pathname === '/cozinha' ? 'bg-blue-900 text-yellow-400' : 'hover:bg-blue-700'
              }`}
            >
              <ChefHat size={18} /> <span className="hidden md:inline">Cozinha</span>
            </Link>
            
            <Link 
              href="/admin" 
              className={`flex items-center gap-2 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                pathname === '/admin' ? 'bg-blue-900 text-yellow-400' : 'hover:bg-blue-700'
              }`}
            >
              <LayoutDashboard size={18} /> <span className="hidden md:inline">Admin</span>
            </Link>

            {/* Divisor vertical */}
            <div className="h-6 w-px bg-blue-700 mx-2 hidden md:block"></div>

            {/* Botão de Sair */}
            <button 
              onClick={handleLogout} 
              className="flex items-center gap-2 px-3 py-2 rounded-md text-sm font-medium bg-red-500 hover:bg-red-600 transition-colors"
            >
              <LogOut size={18} /> <span className="hidden md:inline">Sair</span>
            </button>
          </div>

        </div>
      </div>
    </nav>
  );
}