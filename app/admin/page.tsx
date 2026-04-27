"use client";

import { useState, useEffect } from "react";
import { supabase } from "../../lib/supabase";
import { PlusCircle, Trash2 } from "lucide-react";

export default function AdminPage() {
  const [items, setItems] = useState<any[]>([]);
  const [orders, setOrders] = useState<any[]>([]); // Estado para os logs
  const [name, setName] = useState("");
  const [price, setPrice] = useState("");
  const [stock, setStock] = useState("");

  useEffect(() => {
    fetchItems();
    fetchOrders(); // Busca as vendas quando a tela abre
  }, []);

  // --- FUNÇÕES DE PRODUTOS ---
  async function fetchItems() {
    const { data } = await supabase.from("items").select("*").order("created_at", { ascending: false });
    if (data) setItems(data);
  }

  async function handleAddItem(e: React.FormEvent) {
    e.preventDefault();
    const { error } = await supabase.from("items").insert([
      { name, price: parseFloat(price), stock_quantity: parseInt(stock) }
    ]);
    if (!error) {
      setName(""); setPrice(""); setStock("");
      fetchItems();
    } else {
      alert("Erro ao salvar: " + error.message);
    }
  }

  async function handleDeleteItem(id: string) {
    await supabase.from("items").delete().eq("id", id);
    fetchItems();
  }

  // --- FUNÇÕES DE LOGS/VENDAS ---
  async function fetchOrders() {
    // Busca os pedidos e junta com as informações dos itens comprados
    const { data } = await supabase
      .from("orders")
      .select(`
        *,
        order_items ( quantity, items ( name ) )
      `)
      .order("created_at", { ascending: false }); // Do mais recente para o mais antigo
    
    if (data) setOrders(data);
  }

  // Função para exportar os dados para CSV (compatível com Excel)
  function exportToCSV() {
    if (orders.length === 0) {
      alert("Não há vendas para exportar.");
      return;
    }

    // 1. Definir o cabeçalho das colunas
    const headers = ["Ticket", "Cliente", "Data", "Hora", "Pagamento", "Total (R$)", "Itens"];
    
    // 2. Formatar as linhas com os dados dos pedidos
    const rows = orders.map(order => {
      const data = new Date(order.created_at);
      const itensFormatados = order.order_items
        .map((oi: any) => `${oi.quantity}x ${oi.items?.name}`)
        .join(" | "); // Separa os itens por uma barra para caber numa célula só

      return [
        order.order_number,
        order.customer_name || "Anônimo",
        data.toLocaleDateString(),
        data.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        order.payment_method.toUpperCase(),
        Number(order.total_amount).toFixed(2).replace(".", ","), // Formato de moeda BR
        `"${itensFormatados}"` // Aspas para o CSV não confundir a barra com nova coluna
      ];
    });

    // 3. Montar o conteúdo final
    // O "\ufeff" no início serve para o Excel entender acentos (UTF-8)
    const csvContent = "\ufeff" + [headers, ...rows].map(e => e.join(";")).join("\n");

    // 4. Criar o link de download
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", `relatorio_vendas_${new Date().toLocaleDateString().replace(/\//g, '-')}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }

  async function handleDeleteOrder(id: string) {
    // Pede confirmação para evitar cliques acidentais
    const confirmou = window.confirm("Tem certeza que deseja apagar esse registro de venda? Isso vai limpar o pedido do sistema.");
    if (confirmou) {
      // Como configuramos ON DELETE CASCADE no banco, apagar a ordem apaga os itens dela automaticamente
      await supabase.from("orders").delete().eq("id", id);
      fetchOrders(); // Atualiza a lista
    }
  }

  // Calcula o total de dinheiro que entrou
  const totalArrecadado = orders.reduce((acc, order) => acc + Number(order.total_amount), 0);

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-8 bg-gray-50 min-h-screen">
      <h1 className="text-3xl font-bold text-gray-800">Painel de Administração</h1>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        
        {/* LADO ESQUERDO: Produtos (O que já tínhamos) */}
        <div className="space-y-8">
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
            <h2 className="text-xl font-semibold mb-4 text-gray-800">Cadastrar Novo Lanche</h2>
            <form onSubmit={handleAddItem} className="flex flex-col gap-4">
              <div className="flex gap-4">
                <div className="flex-1">
                  <label className="block text-sm text-gray-600 mb-1">Nome</label>
                  <input required value={name} onChange={(e) => setName(e.target.value)} className="w-full border p-2 rounded" />
                </div>
                <div className="w-24">
                  <label className="block text-sm text-gray-600 mb-1">Preço (R$)</label>
                  <input required type="number" step="0.01" value={price} onChange={(e) => setPrice(e.target.value)} className="w-full border p-2 rounded" />
                </div>
                <div className="w-24">
                  <label className="block text-sm text-gray-600 mb-1">Estoque</label>
                  <input required type="number" value={stock} onChange={(e) => setStock(e.target.value)} className="w-full border p-2 rounded" />
                </div>
              </div>
              <button type="submit" className="bg-blue-600 text-white p-2 rounded flex justify-center items-center gap-2 hover:bg-blue-700 transition-colors">
                <PlusCircle size={20} /> Adicionar Produto
              </button>
            </form>
          </div>

          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 h-[400px] overflow-y-auto">
            <h2 className="text-xl font-semibold mb-4 text-gray-800">Estoque Atual</h2>
            <div className="divide-y">
              {items.map((item) => (
                <div key={item.id} className="py-3 flex justify-between items-center">
                  <div>
                    <p className="font-bold text-gray-800">{item.name}</p>
                    <p className="text-sm text-gray-500">R$ {item.price.toFixed(2)} | Qtd: {item.stock_quantity}</p>
                  </div>
                  <button onClick={() => handleDeleteItem(item.id)} className="text-red-400 hover:text-red-600 p-2">
                    <Trash2 size={18} />
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* LADO DIREITO: NOVO - Log de Vendas e Relatório */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex flex-col h-[750px]">
          {/* Altere o cabeçalho do Log de Vendas para incluir o botão */}
            <div className="flex justify-between items-center mb-6 border-b pb-4">
            <h2 className="text-xl font-semibold text-gray-800">Log de Vendas (Hoje)</h2>
            <div className="flex items-center gap-4 text-right">
                {/* NOVO BOTÃO DE EXPORTAR */}
                <button 
                onClick={exportToCSV}
                className="bg-green-100 text-green-700 px-3 py-2 rounded-lg font-bold text-sm hover:bg-green-200 transition-colors flex items-center gap-2"
                >
                📥 Exportar Excel
                </button>
                
                <div>
                <p className="text-sm text-gray-500">Total Arrecadado</p>
                <p className="text-2xl font-bold text-green-600">R$ {totalArrecadado.toFixed(2)}</p>
                </div>
            </div>
            </div>

          <div className="flex-1 overflow-y-auto pr-2 divide-y">
            {orders.map((order) => (
              <div key={order.id} className="py-4 flex justify-between items-start hover:bg-gray-50 transition-colors rounded px-2">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-black text-lg text-gray-800">#{order.order_number}</span>
                    <span className="text-xs font-bold uppercase bg-gray-200 px-2 py-1 rounded text-gray-700">
                      {order.payment_method}
                    </span>
                    <span className={`text-xs font-bold uppercase px-2 py-1 rounded ${
                      order.status === 'pendente' ? 'bg-yellow-100 text-yellow-700' : 'bg-green-100 text-green-700'
                    }`}>
                      {order.status}
                    </span>
                  </div>
                  <p className="text-sm text-gray-500 font-medium">
                    {order.customer_name || "Anônimo"} • {new Date(order.created_at).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                  </p>
                  
                  {/* Itens do Pedido */}
                  <ul className="mt-2 space-y-1">
                    {order.order_items.map((oi: any, idx: number) => (
                      <li key={idx} className="text-sm text-gray-600 flex items-center gap-1">
                        <span className="font-bold text-gray-800">{oi.quantity}x</span> {oi.items?.name}
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="flex flex-col items-end gap-3">
                  <p className="font-bold text-gray-800">R$ {Number(order.total_amount).toFixed(2)}</p>
                  <button 
                    onClick={() => handleDeleteOrder(order.id)} 
                    className="text-red-500 bg-red-50 p-2 rounded hover:bg-red-100 transition-colors"
                    title="Apagar este registro"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            ))}
            {orders.length === 0 && (
              <div className="flex h-full items-center justify-center">
                <p className="text-gray-400">Nenhuma venda registrada ainda.</p>
              </div>
            )}
          </div>
        </div>

      </div>
    </div>
  );
}