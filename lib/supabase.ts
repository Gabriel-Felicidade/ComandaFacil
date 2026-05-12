import { createBrowserClient } from '@supabase/ssr';

// Variáveis de Ambiente: Fundamental para segurança (não expor chaves no código fonte)
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

/**
 * Inicialização do cliente otimizado para o ambiente do navegador.
 * Este cliente será usado em todos os 'use client' components para operações de CRUD.
 */
export const supabase = createBrowserClient(supabaseUrl, supabaseAnonKey);

/**
 * CONFIGURAÇÕES GLOBAIS DE NOMENCLATURA
 * Centralizar nomes aqui ajuda na manutenção futura do projeto acadêmico.
 * Se você decidir mudar 'Item' para 'Produto', altera apenas aqui.
 */
export const ITEM_NAME = 'Item'; 
export const ITEM_NAME_PLURAL = 'Itens';
export const STOCK_NAME = 'Estoque';