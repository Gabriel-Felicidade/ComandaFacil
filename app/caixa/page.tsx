"use client";

import { useState, useEffect } from "react";
import { supabase } from "../../lib/supabase";
import { ShoppingBag, Check, Trash2 } from "lucide-react";

export default function CaixaPage() {
  const [items, setItems] = useState<any[]>([]);
  const [cart, setCart] = useState<any[]>([]);
  const [customerName, setCustomerName] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("dinheiro");
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      if (!data.session) window.location.href = "/login";
    });
    fetchItems();
  }, []);

  async function fetchItems() {
    const { data } = await supabase.from("items").select("*").order("name");
    if (data) setItems(data);
  }

  function addToCart(item: any) {
    setCart((prev) => {
      const existing = prev.find((i) => i.id === item.id);
      if (existing) {
        return prev.map((i) => i.id === item.id ? { ...i, quantity: i.quantity + 1 } : i);
      }
      return [...prev, { id: item.id, name: item.name, price: item.price, quantity: 1 }];
    });
  }

  function removeFromCart(id: string) {
    setCart((prev) => prev.filter((i) => i.id !== id));
  }

  const total = cart.reduce((acc, item) => acc + item.price * item.quantity, 0);

  async function handleCheckout() {
    if (cart.length === 0) return alert("Carrinho vazio!");
    setIsLoading(true);

    const cartItemsDb = cart.map((item) => ({ item_id: item.id, quantity: item.quantity, price: item.price }));

    const { data, error } = await supabase.rpc("process_order", {
      p_items: cartItemsDb, p_customer_name: customerName || "Anônimo", p_payment_method: paymentMethod, p_total_amount: total,
    });

    setIsLoading(false);

    if (error) {
      alert("Erro: " + error.message);
    } else {
      alert(`✅ Sucesso! Ticket: #${data.order_number}`);
      setCart([]); setCustomerName(""); fetchItems();
    }
  }

  return (
    <div className="flex flex-col lg:flex-row min-h-[calc(100vh-64px)] bg-gray-50/50">
      
      {/* Lado Esquerdo: Produtos */}
      <div className="flex-1 p-4 lg:p-8 lg:overflow-y-auto">
        <div className="mb-6">
          <h1 className="text-2xl font-black text-gray-800 tracking-tight">Cardápio</h1>
          <p className="text-gray-500 text-sm">Toque nos itens para adicionar ao pedido</p>
        </div>
        
        <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-4 gap-3 lg:gap-4">
          {items.map((item) => (
            <button
              key={item.id}
              onClick={() => addToCart(item)}
              disabled={item.stock_quantity <= 0}
              className={`relative flex flex-col items-start p-4 lg:p-5 rounded-2xl border transition-all active:scale-95 ${
                item.stock_quantity > 0
                  ? "bg-white border-gray-200 hover:border-blue-400 hover:shadow-lg hover:shadow-blue-100"
                  : "bg-gray-100 border-gray-200 opacity-50 cursor-not-allowed"
              }`}
            >
              <h3 className="font-bold text-gray-800 leading-tight mb-1">{item.name}</h3>
              <p className="text-blue-600 font-black text-lg">R$ {item.price.toFixed(2)}</p>
              
              <div className={`mt-3 text-xs font-semibold px-2 py-1 rounded-md ${
                item.stock_quantity > 10 ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
              }`}>
                Estoque: {item.stock_quantity}
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Lado Direito: Carrinho (No mobile desce para o final) */}
      <div className="w-full lg:w-[400px] bg-white border-t lg:border-t-0 lg:border-l border-gray-200 flex flex-col shadow-2xl lg:shadow-none">
        <div className="p-6 border-b border-gray-100 bg-white sticky top-0 z-10 flex items-center gap-3">
          <div className="bg-blue-100 p-2 rounded-full text-blue-600">
            <ShoppingBag size={20} />
          </div>
          <h2 className="text-xl font-bold text-gray-800">Pedido Atual</h2>
          {cart.length > 0 && (
            <span className="ml-auto bg-blue-600 text-white text-xs font-bold px-2 py-1 rounded-full">
              {cart.reduce((a, b) => a + b.quantity, 0)} itens
            </span>
          )}
        </div>

        <div className="flex-1 overflow-y-auto p-6">
          {cart.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-gray-400 gap-4 opacity-60 mt-10 lg:mt-0">
              <ShoppingBag size={48} strokeWidth={1} />
              <p>Nenhum item adicionado</p>
            </div>
          ) : (
            <div className="space-y-4">
              {cart.map((item) => (
                <div key={item.id} className="flex justify-between items-center group">
                  <div className="flex items-center gap-3">
                    <span className="bg-gray-100 text-gray-700 font-bold px-3 py-1 rounded-lg">{item.quantity}x</span>
                    <div>
                      <p className="font-bold text-gray-800">{item.name}</p>
                      <p className="text-sm text-gray-500">R$ {(item.price * item.quantity).toFixed(2)}</p>
                    </div>
                  </div>
                  <button onClick={() => removeFromCart(item.id)} className="text-red-400 p-2 rounded-full hover:bg-red-50 hover:text-red-600 transition-colors">
                    <Trash2 size={18} />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Resumo Fixo na Base */}
        <div className="p-6 bg-gray-50/50 border-t border-gray-100">
          <div className="space-y-3 mb-6">
            <input
              type="text"
              value={customerName}
              onChange={(e) => setCustomerName(e.target.value)}
              placeholder="Nome do Cliente (Opcional)"
              className="w-full bg-white border border-gray-200 p-3 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all text-sm"
            />
            <select
              value={paymentMethod}
              onChange={(e) => setPaymentMethod(e.target.value)}
              className="w-full bg-white border border-gray-200 p-3 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all text-sm font-medium text-gray-700"
            >
              <option value="dinheiro">💵 Dinheiro</option>
              <option value="pix">💠 PIX</option>
              <option value="cartao">💳 Cartão</option>
            </select>
          </div>

          <div className="flex justify-between items-center mb-4">
            <span className="text-gray-500 font-semibold">Total a pagar</span>
            <span className="text-3xl font-black text-gray-800 tracking-tight">R$ {total.toFixed(2)}</span>
          </div>

          <button
            onClick={handleCheckout}
            disabled={cart.length === 0 || isLoading}
            className="w-full bg-blue-600 text-white py-4 rounded-xl font-bold text-lg flex justify-center items-center gap-2 hover:bg-blue-700 active:scale-[0.98] transition-all disabled:opacity-50 disabled:active:scale-100 shadow-md shadow-blue-200"
          >
            {isLoading ? "Processando..." : <><Check size={24} /> Confirmar Pedido</>}
          </button>
        </div>
      </div>
    </div>
  );
}