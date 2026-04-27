import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

// Voltando para o createClient padrão que usa o localStorage (infalível para telas de cliente)
export const supabase = createClient(supabaseUrl, supabaseAnonKey);