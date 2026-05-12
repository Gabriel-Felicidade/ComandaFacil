"use client";

import { useState } from "react";
import { supabase } from "../../lib/supabase";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  // GESTÃO DE ESTADO: Controle dos campos de entrada (Controlled Components)
  const [email, setEmail] = useState("comanda@facil.com");
  const [password, setPassword] = useState("comanda1234");
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  /**
   * LÓGICA DE AUTENTICAÇÃO
   * @param e Evento de submissão do formulário
   */
  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    setIsLoading(true);

    // OPERAÇÃO DE AUTH (READ): Verifica as credenciais no Supabase Auth
    // O Supabase gerencia o JWT e a sessão automaticamente
    const { error } = await supabase.auth.signInWithPassword({ email, password });

    setIsLoading(false);

    if (error) {
      alert("Erro no login: Usuário ou senha incorretos.");
    } else {
      // Feedback visual ao usuário antes do redirecionamento
      alert("✅ Login aprovado! Entrando no sistema...");
      
      // REDIRECIONAMENTO: Forçamos o recarregamento para que o Middleware 
      // capture os novos cookies de sessão gerados pelo signInWithPassword.
      window.location.href = "/admin";
    }
  }


  return (
    <div className="flex h-screen items-center justify-center bg-gray-50">
      <form onSubmit={handleLogin} className="bg-white p-8 rounded-2xl shadow-xl border border-gray-100 w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-black text-blue-600 mb-2">ComandaFácil</h1>
          <p className="text-gray-500">Faça login para acessar o sistema</p>
        </div>

        <div className="space-y-5">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">E-mail</label>
            <input 
              required
              type="email" 
              placeholder="seu@email.com" 
              value={email}
              className="w-full border-2 p-3 rounded-lg focus:border-blue-500 focus:outline-none transition-colors text-black"
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Senha</label>
            <input 
              required
              type="password" 
              placeholder="••••••••" 
              value={password}
              className="w-full border-2 p-3 rounded-lg focus:border-blue-500 focus:outline-none transition-colors text-black"
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>
          <button 
            type="submit" 
            disabled={isLoading}
            className="w-full bg-blue-600 text-white py-3 rounded-lg font-bold text-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
          >
            {isLoading ? "Entrando..." : "Entrar"}
          </button>
        </div>
      </form>
    </div>
  );
}