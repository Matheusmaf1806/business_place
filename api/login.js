// api/login.js
import { createClient } from '@supabase/supabase-js';

// Criação do cliente Supabase usando as variáveis de ambiente configuradas no Vercel
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_KEY; // Utilize a chave de serviço ou a chave pública conforme sua necessidade
const supabase = createClient(supabaseUrl, supabaseKey);

export default async function handler(req, res) {
  // Aceita apenas método POST
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Método não permitido' });
  }
  
  const { email, password } = req.body;

  // Validação dos dados
  if (!email || !password) {
    return res.status(400).json({ error: 'Email e senha são obrigatórios' });
  }

  // Realiza a autenticação com Supabase
  const { data, error } = await supabase.auth.signInWithPassword({ email, password });

  if (error) {
    // Se ocorrer erro na autenticação (credenciais incorretas, por exemplo)
    return res.status(401).json({ error: error.message });
  }

  // A resposta contém o usuário e a sessão
  const { user, session } = data;

  // Consulta a tabela user_affiliates para buscar informações extras do usuário
  const { data: affiliateData, error: affiliateError } = await supabase
    .from('user_affiliates')
    .select('*')
    .eq('user_id', user.id)
    .single();

  if (affiliateError) {
    // Caso não encontre os dados na tabela, podemos logar o erro e continuar
    console.error('Erro ao buscar dados do afiliado:', affiliateError);
  }

  // Retorna os dados do usuário, sessão e os dados do afiliado
  return res.status(200).json({
    success: true,
    user,
    session,
    affiliate: affiliateData,
    // A duração do token de acesso pode ser verificada em session.expires_in (normalmente 3600 segundos)
    expiresIn: session?.expires_in || 3600
  });
}
