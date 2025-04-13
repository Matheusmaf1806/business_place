// Supondo que suas variáveis de ambiente estejam configuradas corretamente no ambiente Node
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL; // ou outra variável, ex: SUPABASE_URL
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY; // ou SUPABASE_ANON_KEY

const supabaseClient = createClient(supabaseUrl, supabaseAnonKey);

module.exports = supabaseClient;
