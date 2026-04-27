"use client";

import { useState, useEffect } from "react";
import { supabase } from "../../lib/supabase";
import { ShoppingCart, Check, Trash2 } from "lucide-react";

export default function CaixaPage() {
  const [items, setItems] = useState<any[]>([]);
  const [cart, setCart] = useState<any[]>([]);
  const [customerName, setCustomerName] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("dinheiro");
  const [isLoading, setIsLoading] = useState(false);

  // Busca os produtos assim que a tela abre
  useEffect(() => {
    fetchItems();
  }, []);

  async function fetchItems() {
    const { data, error } = await supabase
      .from("items")
      .select("*")
      .order("name");
    if (data) setItems(data);
  }

  // Lógica do Carrinho
  function addToCart(item: any) {
    setCart((prev) => {
      const existing = prev.find((i) => i.id === item.id);
      if (existing) {
        return prev.map((i) =>
          i.id === item.id ? { ...i, quantity: i.quantity + 1 } : i
        );
      }
      return [...prev, { id: item.id, name: item.name, price: item.price, quantity: 1 }];
    });
  }

  function removeFromCart(id: string) {
    setCart((prev) => prev.filter((i) => i.id !== id));
  }

  const total = cart.reduce((acc, item) => acc + item.price * item.quantity, 0);

  // Finaliza a Venda
  async function handleCheckout() {
    if (cart.length === 0) return alert("Carrinho vazio!");
    setIsLoading(true);

    // Formata o carrinho para a função do banco
    const cartItemsDb = cart.map((item) => ({
      item_id: item.id,
      quantity: item.quantity,
      price: item.price,
    }));

    // Chama a função segura que deduz o estoque atomicamente
    const { data, error } = await supabase.rpc("process_order", {
      p_items: cartItemsDb,
      p_customer_name: customerName || "Anônimo",
      p_payment_method: paymentMethod,
      p_total_amount: total,
    });

    setIsLoading(false);

    if (error) {
      alert("Erro ao finalizar pedido. Pode ser falta de estoque. " + error.message);
    } else {
      // O banco nos devolve o número do ticket
      alert(`✅ Sucesso! O número do Ticket é: ${data.order_number}`);
      setCart([]);
      setCustomerName("");
      fetchItems(); // Atualiza o estoque na tela
    }
  }

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Lado Esquerdo: Produtos */}
      <div className="flex-1 p-6 overflow-y-auto">
        <h1 className="text-3xl font-bold mb-6 text-gray-800">Caixa da Cantina</h1>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          {items.map((item) => (
            <button
              key={item.id}
              onClick={() => addToCart(item)}
              disabled={item.stock_quantity <= 0}
              className={`p-6 rounded-xl border-2 text-left transition-all ${
                item.stock_quantity > 0
                  ? "bg-white border-blue-100 hover:border-blue-500 hover:shadow-md"
                  : "bg-gray-200 border-gray-300 opacity-60 cursor-not-allowed"
              }`}
            >
              <h3 className="font-bold text-xl text-gray-800">{item.name}</h3>
              <p className="text-gray-600 font-medium">R$ {item.price.toFixed(2)}</p>
              <p className="text-sm mt-2 text-gray-500">
                Estoque: {item.stock_quantity}
              </p>
            </button>
          ))}
        </div>
      </div>

      {/* Lado Direito: Carrinho */}
      <div className="w-96 bg-white border-l shadow-xl flex flex-col">
        <div className="p-6 bg-blue-600 text-white flex items-center gap-2">
          <ShoppingCart />
          <h2 className="text-xl font-bold">Pedido Atual</h2>
        </div>

        {/* Lista de Itens no Carrinho */}
        <div className="flex-1 overflow-y-auto p-6">
          {cart.length === 0 ? (
            <p className="text-gray-400 text-center mt-10">Carrinho vazio</p>
          ) : (
            <div className="space-y-4">
              {cart.map((item) => (
                <div key={item.id} className="flex justify-between items-center border-b pb-2">
                  <div>
                    <p className="font-bold text-gray-800">{item.quantity}x {item.name}</p>
                    <p className="text-sm text-gray-500">R$ {(item.price * item.quantity).toFixed(2)}</p>
                  </div>
                  <button onClick={() => removeFromCart(item.id)} className="text-red-500 p-2">
                    <Trash2 size={18} />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Resumo e Pagamento */}
        <div className="p-6 bg-gray-50 border-t">
          <div className="mb-4">
            <label className="block text-sm text-gray-600 mb-1">Nome do Cliente (Opcional)</label>
            <input
              type="text"
              value={customerName}
              onChange={(e) => setCustomerName(e.target.value)}
              placeholder="Ex: João Silva"
              className="w-full border p-2 rounded"
            />
          </div>

          <div className="mb-6">
            <label className="block text-sm text-gray-600 mb-1">Forma de Pagamento</label>
            <select
              value={paymentMethod}
              onChange={(e) => setPaymentMethod(e.target.value)}
              className="w-full border p-2 rounded"
            >
              <option value="dinheiro">Dinheiro</option>
              <option value="pix">PIX</option>
              <option value="cartao">Cartão</option>
            </select>
          </div>

          <div className="flex justify-between items-end mb-4">
            <span className="text-gray-600 font-semibold">Total:</span>
            <span className="text-3xl font-bold text-gray-800">R$ {total.toFixed(2)}</span>
          </div>

          <button
            onClick={handleCheckout}
            disabled={cart.length === 0 || isLoading}
            className="w-full bg-green-600 text-white py-4 rounded-lg font-bold text-lg flex justify-center items-center gap-2 hover:bg-green-700 disabled:opacity-50"
          >
            {isLoading ? "Processando..." : <><Check /> Finalizar Pedido</>}
          </button>
        </div>
      </div>
    </div>
  );
}