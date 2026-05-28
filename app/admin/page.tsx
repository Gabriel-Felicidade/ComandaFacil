"use client";

import { useState, useEffect } from "react";
import { supabase } from "../../lib/supabase";
import { Plus, Trash2, Download, Package, DollarSign, Receipt, LayoutDashboard, Edit2, X, Check } from "lucide-react";
import { useModal } from "../../components/ModalProvider";

export default function AdminPage() {
  // ESTADOS DA APLICAÇÃO: Reatividade para interface e armazenamento de dados
  const [items, setItems] = useState<any[]>([]);
  const [orders, setOrders] = useState<any[]>([]);
  const [selectedOption, setSelectedOption] = useState("");
  const [customName, setCustomName] = useState("");
  const [price, setPrice] = useState("");
  const [stock, setStock] = useState("");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [filterPeriod, setFilterPeriod] = useState("hoje");
  const [totalArrecadado, setTotalArrecadado] = useState(0);
  const [isHighlighting, setIsHighlighting] = useState(false);
  const { showAlert, showConfirm } = useModal();

  // PAGINAÇÃO E SCROLL
  const [productPage, setProductPage] = useState(1);
  const [orderPage, setOrderPage] = useState(1);
  const itemsPerPage = 20;

  const PREDEFINED_ITEMS = [
    "coxinha",
    "kibe",
    "risole",
    "pastel de carne",
    "pastel de queijo",
    "Refrigerante Cola",
    "Refrigerante Guaraná",
    "Suco de Laranja",
    "Suco de Uva",
    "Água Mineral",
    "Bolo de Pote"
  ];

  // CICLO DE VIDA: Executa ao montar o componente
  useEffect(() => {
    // PROTEÇÃO CLIENT-SIDE: Garante que a sessão existe
    supabase.auth.getSession().then(({ data }) => {
      if (!data.session) window.location.href = "/login";
    });
    fetchItems();
  }, []);

  // Re-busca pedidos sempre que o período selecionado mudar
  useEffect(() => {
    setOrderPage(1);
    fetchOrders();
  }, [filterPeriod]);

  // Garante que a página atual de pedidos não fique fora do limite após atualizações
  useEffect(() => {
    const maxPages = Math.ceil(orders.length / itemsPerPage);
    if (maxPages > 0 && orderPage > maxPages) {
      setOrderPage(maxPages);
    }
  }, [orders.length, orderPage]);

  // Garante que a página atual de produtos não fique fora do limite após atualizações
  useEffect(() => {
    const maxPages = Math.ceil(items.length / itemsPerPage);
    if (maxPages > 0 && productPage > maxPages) {
      setProductPage(maxPages);
    }
  }, [items.length, productPage]);

  const totalProductPages = Math.ceil(items.length / itemsPerPage);
  const displayedItems = items.slice((productPage - 1) * itemsPerPage, productPage * itemsPerPage);

  const totalOrderPages = Math.ceil(orders.length / itemsPerPage);
  const displayedOrders = orders.slice((orderPage - 1) * itemsPerPage, orderPage * itemsPerPage);

  /**
   * OPERAÇÃO (READ): Busca itens do estoque no Supabase
   */
  async function fetchItems() {
    const { data } = await supabase.from("items").select("*").order("name");
    if (data) setItems(data);
  }

  /**
   * OPERAÇÃO (READ): Busca vendas com filtros reativos
   */
  async function fetchOrders() {
    let query = supabase
      .from("orders")
      .select(`
        id,
        order_number,
        customer_name,
        payment_method,
        total_amount,
        created_at,
        order_items (
          quantity,
          items (
            name
          )
        )
      `)
      .order("created_at", { ascending: false });

    // LÓGICA DE FILTRAGEM DE HISTÓRICO DE VENDAS
    const dateLimit = new Date();
    if (filterPeriod === "hoje") {
      dateLimit.setHours(0, 0, 0, 0);
    } else if (filterPeriod === "7dias") {
      dateLimit.setDate(dateLimit.getDate() - 7);
    } else if (filterPeriod === "15dias") {
      dateLimit.setDate(dateLimit.getDate() - 15);
    } else if (filterPeriod === "30dias") {
      dateLimit.setDate(dateLimit.getDate() - 30);
    }

    if (filterPeriod !== "tudo") {
      query = query.gte("created_at", dateLimit.toISOString());
    }

    const { data } = await query;

    if (data) {
      setOrders(data);
      const total = data.reduce((acc, order) => acc + Number(order.total_amount), 0);
      setTotalArrecadado(total);
    }
  }

  /**
   * EDICÃO: Prepara a interface para edicão do produto
   */
  function startEditItem(item: any) {
    setEditingId(item.id);
    setPrice(String(item.price));
    setStock(String(item.stock_quantity));
    
    if (PREDEFINED_ITEMS.includes(item.name)) {
      setSelectedOption(item.name);
      setCustomName("");
    } else {
      setSelectedOption("Outro");
      setCustomName(item.name);
    }

    // Subir a página suavemente para focar no formulário
    window.scrollTo({ top: 0, behavior: "smooth" });

    // Destacar visualmente o formulário
    setIsHighlighting(true);
    setTimeout(() => {
      setIsHighlighting(false);
    }, 2000);
  }

  /**
   * OPERAÇÃO (UPDATE): Atualiza um produto existente no banco de dados
   */
  async function handleUpdateItem(e: React.FormEvent) {
    e.preventDefault();
    const finalName = selectedOption === "Outro" ? customName.trim() : selectedOption;
    if (!finalName || !price || !stock || !editingId) {
      await showAlert("Preencha todos os campos", "Aviso", "warning");
      return;
    }

    const stockQty = parseInt(stock);
    if (stockQty < 0) {
      const confirmDelete = await showConfirm(
        `O estoque de "${finalName}" não pode ser menor que zero. Se você deseja retirar este item do cardápio, prefere excluí-lo permanentemente agora?`,
        "Estoque Negativo",
        "warning"
      );
      if (confirmDelete) {
        const idToDelete = editingId;
        setEditingId(null); setSelectedOption(""); setCustomName(""); setPrice(""); setStock("");
        await handleDeleteItem(idToDelete, true);
      }
      return;
    }

    const { error } = await supabase
      .from("items")
      .update({ name: finalName, price: parseFloat(price), stock_quantity: stockQty, active: true })
      .eq("id", editingId);

    if (error) {
      await showAlert("Erro ao editar: " + error.message, "Erro", "error");
    } else {
      setEditingId(null); setSelectedOption(""); setCustomName(""); setPrice(""); setStock(""); fetchItems();
    }
  }

  /**
   * OPERAÇÃO (CREATE): Insere um novo produto no banco de dados
   */
  async function handleAddItem(e: React.FormEvent) {
    e.preventDefault();
    const finalName = selectedOption === "Outro" ? customName.trim() : selectedOption;
    if (!finalName || !price || !stock) {
      await showAlert("Preencha todos os campos", "Aviso", "warning");
      return;
    }

    const stockQty = parseInt(stock);
    if (stockQty < 0) {
      await showAlert("O estoque inicial de um novo produto não pode ser menor que zero! Digite 0 ou uma quantidade positiva.", "Aviso", "warning");
      return;
    }

    const { error } = await supabase.from("items").insert([
      { name: finalName, price: parseFloat(price), stock_quantity: stockQty },
    ]);

    if (error) {
      await showAlert("Erro ao adicionar: " + error.message, "Erro", "error");
    } else {
      setSelectedOption(""); setCustomName(""); setPrice(""); setStock(""); fetchItems();
    }
  }

  /**
   * OPERAÇÃO (DELETE): Remove um item do estoque
   * Nota: Possui restrição de integridade referencial no banco
   */
  async function handleDeleteItem(id: string, forceSkipConfirm = false) {
    if (forceSkipConfirm || await showConfirm("Tem certeza que deseja remover este item?", "Excluir Item", "warning")) {
      // Verifica se o item possui alguma venda registrada no histórico
      const { count } = await supabase
        .from("order_items")
        .select("id", { count: "exact", head: true })
        .eq("item_id", id);

      if (count && count > 0) {
        // Se possui histórico, fazemos a Exclusão Lógica (Soft Delete)
        const { error } = await supabase
          .from("items")
          .update({ active: false })
          .eq("id", id);

        if (error) {
          await showAlert("Erro ao ocultar o item: " + error.message, "Erro", "error");
        } else {
          await showAlert("Este produto possui histórico de vendas e foi ocultado do cardápio com sucesso para manter a integridade dos seus relatórios!", "Sucesso", "success");
          fetchItems();
        }
      } else {
        // Se nunca foi vendido, fazemos a Exclusão Física (Hard Delete)
        const { error } = await supabase
          .from("items")
          .delete()
          .eq("id", id);

        if (error) {
          await showAlert("Erro ao excluir o item: " + error.message, "Erro", "error");
        } else {
          await showAlert("Produto excluído permanentemente com sucesso!", "Sucesso", "success");
          fetchItems();
        }
      }
    }
  }

  /**
   * OPERAÇÃO (DELETE): Exclui um log de venda. Se a venda for de HOJE, devolve seus itens ao estoque automaticamente.
   */
  async function handleDeleteOrder(id: string) {
    if (await showConfirm("Tem certeza que deseja cancelar e apagar esta venda? Se a venda for de HOJE, os itens retornarão ao estoque automaticamente.", "Cancelar Venda", "warning")) {
      // 1. Busca os detalhes da venda para verificar a data
      const { data: orderData } = await supabase
        .from("orders")
        .select("created_at")
        .eq("id", id)
        .single();

      const isToday = orderData && new Date(orderData.created_at).toDateString() === new Date().toDateString();

      // Se for de hoje, devolve os itens ao estoque
      if (isToday) {
        const { data: orderItems } = await supabase
          .from("order_items")
          .select("item_id, quantity")
          .eq("order_id", id);

        if (orderItems && orderItems.length > 0) {
          for (const item of orderItems) {
            // Busca a quantidade atual de estoque do produto
            const { data: currentItem } = await supabase
              .from("items")
              .select("stock_quantity")
              .eq("id", item.item_id)
              .single();

            if (currentItem) {
              // Devolve a quantidade do pedido de volta ao estoque
              await supabase
                .from("items")
                .update({ stock_quantity: currentItem.stock_quantity + item.quantity })
                .eq("id", item.item_id);
            }
          }
        }
      }

      // 2. Deleta em cascata no banco de dados (primeiro itens, depois a venda)
      await supabase.from("order_items").delete().eq("order_id", id);
      const { error } = await supabase.from("orders").delete().eq("id", id);

      if (error) {
        await showAlert("Erro ao excluir a venda: " + error.message, "Erro", "error");
      } else {
        if (isToday) {
          await showAlert("Venda cancelada com sucesso e itens devolvidos ao estoque!", "Sucesso", "success");
        } else {
          await showAlert("Venda antiga excluída com sucesso! Os itens não retornaram ao estoque para manter a integridade histórica.", "Sucesso", "success");
        }
        fetchOrders();
        fetchItems(); // Atualiza na hora o painel de estoque do Admin!
      }
    }
  }


  async function exportToCSV() {
    if (orders.length === 0) {
      await showAlert("Não há vendas para exportar.", "Aviso", "warning");
      return;
    }
    
    const headers = ["Ticket", "Cliente", "Data", "Hora", "Pagamento", "Total (R$)", "Itens"];
    const rows = orders.map(order => {
      const data = new Date(order.created_at);
      const itensFormatados = order.order_items.map((oi: any) => `${oi.quantity}x ${oi.items?.name}`).join(" | ");
      return [
        order.order_number,
        order.customer_name || "Anônimo",
        data.toLocaleDateString(),
        data.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        order.payment_method.toUpperCase(),
        Number(order.total_amount).toFixed(2).replace(".", ","),
        `"${itensFormatados}"`
      ];
    });

    const csvContent = "\ufeff" + [headers, ...rows].map(e => e.join(";")).join("\n");
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", `relatorio_vendas_${new Date().toLocaleDateString().replace(/\//g, '-')}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }

  return (
    <div className="p-4 lg:p-8 min-h-[calc(100vh-64px)] bg-[#F8FAFC]">
      
      {/* Cabeçalho e Estatísticas */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-6">
          <div className="bg-slate-800 p-3 rounded-2xl text-white shadow-lg">
            <LayoutDashboard size={24} />
          </div>
          <div>
            <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">O que vai ser o cardápio do dia?</h1>
            <p className="text-slate-500 font-medium">Gerencie o estoque e acompanhe as vendas de hoje</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <DollarSign size={28} />
            </div>
            <div>
              <p className="text-slate-500 text-sm font-bold uppercase tracking-wider">Arrecadado Hoje</p>
              <p className="text-3xl font-black text-slate-900">R$ {totalArrecadado.toFixed(2)}</p>
            </div>
          </div>

          <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center">
              <Receipt size={28} />
            </div>
            <div>
              <p className="text-slate-500 text-sm font-bold uppercase tracking-wider">Vendas Hoje</p>
              <p className="text-3xl font-black text-slate-900">{orders.length} pedidos</p>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Coluna Esquerda: Cadastro e Estoque */}
        <div className="lg:col-span-1 space-y-8">
          
          {/* Cadastro de Produto */}
          <div className={`bg-white p-6 rounded-3xl border shadow-sm transition-all duration-500 ${
            isHighlighting 
              ? "border-blue-500 ring-4 ring-blue-100 scale-[1.02]" 
              : "border-slate-200"
          }`}>
            <h2 className="text-xl font-bold text-slate-800 mb-5 flex items-center gap-2">
              <Package size={20} className="text-blue-500"/> {editingId ? "Editar Produto" : "Cadastrar Produto"}
            </h2>
            <form onSubmit={editingId ? handleUpdateItem : handleAddItem} className="space-y-4">
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-1">Nome do Item</label>
                <select
                  value={selectedOption}
                  onChange={(e) => {
                    setSelectedOption(e.target.value);
                    if (e.target.value !== "Outro") {
                      setCustomName("");
                    }
                  }}
                  className="w-full border-2 border-slate-200 p-3 rounded-xl focus:border-blue-500 focus:outline-none text-slate-900 bg-white font-medium"
                >
                  <option value="">Selecione um produto...</option>
                  <option value="coxinha">Coxinha</option>
                  <option value="kibe">Kibe</option>
                  <option value="risole">Risole</option>
                  <option value="pastel de carne">Pastel de Carne</option>
                  <option value="pastel de queijo">Pastel de Queijo</option>
                  <option value="Refrigerante Cola">Refrigerante Cola</option>
                  <option value="Refrigerante Guaraná">Refrigerante Guaraná</option>
                  <option value="Suco de Laranja">Suco de Laranja</option>
                  <option value="Suco de Uva">Suco de Uva</option>
                  <option value="Água Mineral">Água Mineral</option>
                  <option value="Bolo de Pote">Bolo de Pote</option>
                  <option value="Outro">Outro (Digitar nome...)</option>
                </select>
              </div>

              {selectedOption === "Outro" && (
                <div className="mt-3">
                  <label className="block text-sm font-bold text-slate-700 mb-1">Nome Personalizado</label>
                  <input
                    type="text"
                    value={customName}
                    onChange={(e) => setCustomName(e.target.value)}
                    placeholder="Ex: Pastel de Palmito"
                    className="w-full border-2 border-slate-200 p-3 rounded-xl focus:border-blue-500 focus:outline-none text-slate-900 placeholder:text-slate-400"
                  />
                </div>
              )}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-1">Preço (R$)</label>
                  <input 
                    type="number" step="0.01" value={price} onChange={(e) => setPrice(e.target.value)} placeholder="0.00" 
                    className="w-full border-2 border-slate-200 p-3 rounded-xl focus:border-blue-500 focus:outline-none text-slate-900 placeholder:text-slate-400"
                  />
                </div>
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-1">Estoque Inicial</label>
                  <input 
                    type="number" value={stock} onChange={(e) => setStock(e.target.value)} placeholder="0" 
                    className="w-full border-2 border-slate-200 p-3 rounded-xl focus:border-blue-500 focus:outline-none text-slate-900 placeholder:text-slate-400"
                  />
                </div>
              </div>
              <div className="flex gap-2">
                {editingId && (
                  <button 
                    type="button" 
                    onClick={() => {
                      setEditingId(null); setSelectedOption(""); setCustomName(""); setPrice(""); setStock("");
                    }} 
                    className="flex-1 bg-slate-200 text-slate-700 py-3.5 rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-slate-300 transition-colors"
                  >
                    <X size={20} /> Cancelar
                  </button>
                )}
                <button type="submit" className="flex-[2] bg-slate-800 text-white py-3.5 rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-slate-900 transition-colors">
                  {editingId ? <Check size={20} /> : <Plus size={20} />} {editingId ? "Salvar Alterações" : "Salvar Produto"}
                </button>
              </div>
            </form>
          </div>

          {/* Lista de Estoque */}
          <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm flex flex-col justify-between">
            <div>
              <h2 className="text-xl font-bold text-slate-800 mb-5">Estoque Atual</h2>
              <div className="space-y-3 max-h-[400px] overflow-y-auto pr-2">
                {displayedItems.map((item) => (
                  <div key={item.id} className="flex justify-between items-center p-4 rounded-2xl bg-slate-50 border border-slate-100 group">
                    <div>
                      <p className="font-bold text-slate-800 flex items-center gap-2">
                        {item.name}
                        {!item.active && (
                          <span className="bg-slate-100 text-slate-500 text-[10px] font-extrabold px-2 py-0.5 rounded-full border border-slate-200 uppercase tracking-wider">
                            Oculto
                          </span>
                        )}
                      </p>
                      <div className="flex gap-3 text-sm mt-1">
                        <span className="text-slate-500 font-medium">R$ {item.price.toFixed(2)}</span>
                        <span className={`font-bold ${item.stock_quantity > 0 ? 'text-emerald-600' : 'text-rose-500'}`}>
                          Qtd: {item.stock_quantity}
                        </span>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <button onClick={() => startEditItem(item)} className="text-slate-400 hover:text-blue-500 transition-colors p-2 bg-white rounded-full shadow-sm border border-slate-100" title="Editar item">
                        <Edit2 size={18} />
                      </button>
                      <button onClick={() => handleDeleteItem(item.id)} className="text-slate-400 hover:text-rose-500 transition-colors p-2 bg-white rounded-full shadow-sm border border-slate-100" title="Apagar item">
                        <Trash2 size={18} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Controle de Paginação do Estoque */}
            {totalProductPages > 1 && (
              <div className="flex items-center justify-center gap-1.5 mt-6 pt-4 border-t border-slate-100 flex-wrap">
                {Array.from({ length: totalProductPages }).map((_, i) => {
                  const pageNum = i + 1;
                  return (
                    <button
                      key={pageNum}
                      onClick={() => setProductPage(pageNum)}
                      className={`w-8 h-8 rounded-xl font-bold text-xs flex items-center justify-center transition-all ${
                        productPage === pageNum
                          ? "bg-blue-600 text-white shadow-md shadow-blue-200"
                          : "bg-slate-50 text-slate-600 hover:bg-slate-100 active:scale-95"
                      }`}
                    >
                      {pageNum}
                    </button>
                  );
                })}
              </div>
            )}
          </div>

        </div>

        {/* Coluna Direita: Log de Vendas */}
        <div className="lg:col-span-2 relative lg:min-h-[600px]">
          <div className="lg:absolute lg:inset-0 h-full">
            <div className="bg-white p-6 lg:p-8 rounded-3xl border border-slate-200 shadow-sm h-full flex flex-col justify-between">
              <div className="flex-1 flex flex-col min-h-0">
                
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
                  <h2 className="text-xl font-bold text-slate-800">
                    Log de Vendas ({filterPeriod === 'hoje' ? 'Hoje' : filterPeriod === '7dias' ? 'Últimos 7 dias' : filterPeriod === '15dias' ? 'Últimos 15 dias' : filterPeriod === '30dias' ? 'Últimos 30 dias' : 'Tudo'})
                  </h2>
                  <div className="flex flex-wrap items-center gap-3">
                    <select
                      value={filterPeriod}
                      onChange={(e) => setFilterPeriod(e.target.value)}
                      className="bg-white border-2 border-slate-200 px-4 py-2.5 rounded-full font-bold text-sm text-slate-700 focus:border-blue-500 focus:outline-none cursor-pointer"
                    >
                      <option value="hoje">Hoje</option>
                      <option value="7dias">Últimos 7 dias</option>
                      <option value="15dias">Últimos 15 dias</option>
                      <option value="30dias">Últimos 30 dias</option>
                      <option value="tudo">Todo o Histórico</option>
                    </select>
                    
                    <button 
                      onClick={exportToCSV}
                      className="bg-emerald-50 text-emerald-700 px-5 py-2.5 rounded-full font-bold text-sm hover:bg-emerald-100 transition-colors flex items-center justify-center gap-2 border border-emerald-200"
                    >
                      <Download size={18} /> Exportar Excel
                    </button>
                  </div>
                </div>

                {orders.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-20 text-slate-400 my-auto flex-1">
                    <Receipt size={48} className="opacity-20 mb-4" />
                    <p className="font-medium">
                      Nenhuma venda registrada {filterPeriod === 'hoje' ? 'hoje' : filterPeriod === '7dias' ? 'nos últimos 7 dias' : filterPeriod === '15dias' ? 'nos últimos 15 dias' : filterPeriod === '30dias' ? 'nos últimos 30 dias' : 'no histórico'}.
                    </p>
                  </div>
                ) : (
                  <div className="overflow-x-auto flex-1 min-h-[300px] max-h-[500px] lg:max-h-none overflow-y-auto pr-2 relative border border-slate-100 rounded-2xl">
                    <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="text-slate-500 text-xs font-bold uppercase tracking-wider">
                        <th className="py-3 px-2 bg-white sticky top-0 z-10 border-b border-slate-100 text-left">Ticket</th>
                        <th className="py-3 px-2 bg-white sticky top-0 z-10 border-b border-slate-100 text-left">Cliente</th>
                        <th className="py-3 px-2 bg-white sticky top-0 z-10 border-b border-slate-100 text-left">Data/Hora</th>
                        <th className="py-3 px-2 bg-white sticky top-0 z-10 border-b border-slate-100 text-left">Itens</th>
                        <th className="py-3 px-2 bg-white sticky top-0 z-10 border-b border-slate-100 text-left">Pagamento</th>
                        <th className="py-3 px-2 bg-white sticky top-0 z-10 border-b border-slate-100 text-right">Total</th>
                        <th className="py-3 px-2 bg-white sticky top-0 z-10 border-b border-slate-100 text-center">Ação</th>
                      </tr>
                    </thead>
                    <tbody className="text-slate-700">
                      {displayedOrders.map((order) => (
                        <tr key={order.id} className="border-b border-slate-100 hover:bg-slate-50 transition-colors">
                          <td className="py-3 px-2 font-black text-slate-900">#{order.order_number}</td>
                          <td className="py-3 px-2 font-medium max-w-[110px] truncate" title={order.customer_name || "-"}>
                            {order.customer_name || "-"}
                          </td>
                          <td className="py-3 px-2 text-xs font-semibold text-slate-500">
                            <div className="whitespace-nowrap">{new Date(order.created_at).toLocaleDateString("pt-BR")}</div>
                            <div className="text-slate-400 text-[10px] font-medium mt-0.5 whitespace-nowrap">
                              {new Date(order.created_at).toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" })}
                            </div>
                          </td>
                          <td className="py-3 px-2 text-sm max-w-[200px] break-words">
                            {order.order_items.map((oi: any) => `${oi.quantity}x ${oi.items?.name}`).join(", ")}
                          </td>
                          <td className="py-3 px-2">
                            <span className="bg-slate-100 text-slate-600 text-[10px] font-bold px-2 py-0.5 rounded uppercase whitespace-nowrap">
                              {order.payment_method}
                            </span>
                          </td>
                          <td className="py-3 px-2 font-bold text-right text-slate-900 whitespace-nowrap">
                            R$ {Number(order.total_amount).toFixed(2)}
                          </td>
                          <td className="py-3 px-2 text-center">
                            <button 
                              onClick={() => handleDeleteOrder(order.id)}
                              className="text-slate-400 hover:text-rose-500 transition-colors p-1.5 bg-white rounded-full shadow-sm border border-slate-100 mx-auto block"
                              title="Apagar Log de Venda"
                            >
                              <Trash2 size={16} />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>

            {/* Controle de Paginação das Vendas */}
            {orders.length > 0 && totalOrderPages > 1 && (
              <div className="flex items-center justify-center gap-1.5 mt-6 pt-4 border-t border-slate-100 flex-wrap">
                {Array.from({ length: totalOrderPages }).map((_, i) => {
                  const pageNum = i + 1;
                  return (
                    <button
                      key={pageNum}
                      onClick={() => setOrderPage(pageNum)}
                      className={`w-8 h-8 rounded-xl font-bold text-xs flex items-center justify-center transition-all ${
                        orderPage === pageNum
                          ? "bg-blue-600 text-white shadow-md shadow-blue-200"
                          : "bg-slate-50 text-slate-600 hover:bg-slate-100 active:scale-95"
                      }`}
                    >
                      {pageNum}
                    </button>
                  );
                })}
              </div>
            )}
          </div>
          </div>
        </div>

      </div>
    </div>
  );
}