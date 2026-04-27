"use client";
import { useState } from "react";
import { supabase } from "../../lib/supabase";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const router = useRouter();

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    const { error } = await supabase.auth.signInWithPassword({ email, password });

    if (error) {
      alert("Erro no login: " + error.message);
    } else {
      // Redireciona para uma página inicial ou para o caixa
      router.push("/caixa");
    }
  }

  return (
    <div className="flex h-screen items-center justify-center bg-gray-100">
      <form onSubmit={handleLogin} className="bg-white p-8 rounded-xl shadow-lg w-96">
        <h1 className="text-2xl font-bold mb-6 text-center text-gray-800">Acesso Cantina</h1>
        <div className="space-y-4">
          <input 
            type="email" placeholder="E-mail" 
            className="w-full border p-3 rounded"
            onChange={(e) => setEmail(e.target.value)}
          />
          <input 
            type="password" placeholder="Senha" 
            className="w-full border p-3 rounded"
            onChange={(e) => setPassword(e.target.value)}
          />
          <button type="submit" className="w-full bg-blue-600 text-white py-3 rounded font-bold hover:bg-blue-700">
            Entrar
          </button>
        </div>
      </form>
    </div>
  );
}