"use client";

import { useState, useEffect } from "react";
import { supabase } from "../../lib/supabase";
import { CheckCircle, Clock } from "lucide-react";

export default function CozinhaPage() {
  const [orders, setOrders] = useState<any[]>([]);

  

  useEffect(() => {
    fetchPendingOrders();

    // Aqui acontece a mágica: Ouve novos pedidos em TEMPO REAL
    const subscription = supabase
      .channel('novos_pedidos')
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'orders' }, payload => {
        // Quando entra um pedido novo no banco, atualizamos a tela da cozinha
        fetchPendingOrders(); 
      })
      .subscribe();

    return () => {
      supabase.removeChannel(subscription);
    };
  }, []);

  // Busca os pedidos que estão com status "pendente" e traz os itens junto
  async function fetchPendingOrders() {
    const { data, error } = await supabase
      .from("orders")
      .select(`
        *,
        order_items (
          quantity,
          items ( name )
        )
      `)
      .eq("status", "pendente")
      .order("created_at", { ascending: true }); // Os mais antigos primeiro

    if (data) setOrders(data);
  }

  // Altera o status para "pronto"
  async function markAsReady(orderId: string) {
    const { error } = await supabase
      .from("orders")
      .update({ status: "pronto" })
      .eq("id", orderId);

    if (!error) {
      // Remove o pedido da tela instantaneamente
      setOrders((prev) => prev.filter((o) => o.id !== orderId));
    }
  }

  // Calcula quantos minutos se passaram
  function getMinutesAgo(dateString: string) {
    const diff = new Date().getTime() - new Date(dateString).getTime();
    return Math.floor(diff / 60000);
  }

  return (
    <div className="p-8 min-h-screen bg-gray-900 text-white">
      <h1 className="text-3xl font-bold mb-8 text-yellow-400 flex items-center gap-2">
        👨‍🍳 Tela da Cozinha
      </h1>

      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {orders.length === 0 && (
          <p className="text-gray-400 text-lg col-span-full">Nenhum pedido pendente no momento. Ufa!</p>
        )}

        {orders.map((order) => (
          <div key={order.id} className="bg-gray-800 rounded-xl p-6 border-t-4 border-yellow-500 shadow-lg flex flex-col">
            <div className="flex justify-between items-start mb-4">
              <div>
                {/* Número do Ticket BEM GRANDE */}
                <h2 className="text-5xl font-black text-white">#{order.order_number}</h2>
                <p className="text-gray-400 mt-1">{order.customer_name || "Sem nome"}</p>
              </div>
              <div className="flex items-center text-yellow-500 bg-gray-700 px-2 py-1 rounded text-sm font-bold">
                <Clock size={16} className="mr-1" />
                {getMinutesAgo(order.created_at)} min
              </div>
            </div>

            <div className="flex-1">
              <ul className="space-y-4 mb-6 mt-4">
                {order.order_items.map((oi: any, index: number) => (
                  <li key={index} className="flex items-center text-xl">
                    <span className="bg-gray-700 text-yellow-400 font-bold px-3 py-1 rounded mr-3">
                      {oi.quantity}x
                    </span>
                    <span>{oi.items?.name}</span>
                  </li>
                ))}
              </ul>
            </div>

            <button
              onClick={() => markAsReady(order.id)}
              className="w-full bg-green-600 hover:bg-green-500 text-white font-bold py-4 px-4 rounded-lg flex justify-center items-center gap-2 transition-colors text-lg"
            >
              <CheckCircle size={28} />
              Pronto!
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}