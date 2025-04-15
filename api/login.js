// api/login.js
import { createClient } from '@supabase/supabase-js';

// Verifique se as variáveis de ambiente estão definidas (no Vercel, por exemplo)
if (!process.env.SUPABASE_URL || !process.env.SUPABASE_KEY) {
  throw new Error("As variáveis de ambiente SUPABASE_URL e SUPABASE_KEY devem estar configuradas.");
}

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

export default async function handler(req, res) {
  // Aceita apenas POST
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Método não permitido' });
  }
  
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json({ error: 'Email e senha são obrigatórios' });
  }
  
  // Autentica o usuário com Supabase Auth
  const { data, error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) {
    return res.status(401).json({ error: error.message });
  }
  
  const { user, session } = data;
  
  // Opcional: consulte uma tabela auxiliar (por exemplo, user_affiliates)
  const { data: affiliateData, error: affiliateError } = await supabase
    .from('user_affiliates')
    .select('*')
    .eq('user_id', user.id)
    .single();
    
  if (affiliateError) {
    console.error('Erro ao buscar dados do afiliado:', affiliateError);
  }
  
  // Retorne os dados do usuário, sessão e informações do afiliado
  return res.status(200).json({
    success: true,
    user,
    session,
    affiliate: affiliateData || null,
    expiresIn: session?.expires_in || 3600
  });
}
