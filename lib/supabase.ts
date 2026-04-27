import { createBrowserClient } from '@supabase/ssr';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

// O createBrowserClient garante que o login seja salvo nos Cookies para o Middleware ler
export const supabase = createBrowserClient(supabaseUrl, supabaseAnonKey);