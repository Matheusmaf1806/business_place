// api/login.js
import { createClient } from '@supabase/supabase-js';

// Verifica se as variáveis de ambiente estão configuradas
if (!process.env.SUPABASE_URL || !process.env.SUPABASE_KEY) {
  throw new Error("As variáveis de ambiente SUPABASE_URL e SUPABASE_KEY devem estar configuradas.");
}

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

export default async function handler(req, res) {
  // Permite somente o método POST
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Método não permitido. Use POST.' });
  }

  // Extrai email e senha do corpo da requisição
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json({ error: 'Email e senha são obrigatórios.' });
  }

  // --- Extração do subdomínio a partir do header "Host" ---
  const host = req.headers.host;
  if (!host) {
    return res.status(400).json({ error: 'Header "Host" não informado.' });
  }
  // Remove porta (se houver) e converte para minúsculas
  const hostWithoutPort = host.split(":")[0].toLowerCase();
  const baseDomain = "airland.com.br";
  let extractedSubdomain = "";
  if (hostWithoutPort === baseDomain) {
    // Se o host for igual ao domínio principal, não há subdomínio – rejeita acesso.
    return res.status(400).json({ error: 'Acesso pelo domínio principal não permitido. Use um subdomínio.' });
  } else if (hostWithoutPort.endsWith(`.${baseDomain}`)) {
    // Exemplo: "lucastur.airland.com.br" → extrai "lucastur"
    extractedSubdomain = hostWithoutPort.substring(0, hostWithoutPort.length - baseDomain.length - 1);
  } else {
    // Caso o host não contenha o padrão, usa o host completo.
    extractedSubdomain = hostWithoutPort;
  }

  // --- Autenticação via Supabase Auth ---
  const { data, error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) {
    return res.status(401).json({ error: error.message });
  }
  const { user, session } = data;

  // --- Consulta à tabela user_affiliates para obter o affiliate_id associado ao usuário ---
  const { data: userAffiliate, error: userAffError } = await supabase
    .from('user_affiliates')
    .select('*')
    .eq('user_id', user.id)
    .single();

  if (userAffError) {
    console.error("Erro ao buscar dados do afiliado na tabela user_affiliates:", userAffError);
    return res.status(500).json({ error: "Erro ao recuperar dados do afiliado." });
  }

  // --- Consulta à tabela affiliates para obter os dados da agência usando o affiliate_id ---
  const { data: affiliate, error: affiliateError } = await supabase
    .from('affiliates')
    .select('*')
    .eq('id', userAffiliate.affiliate_id)
    .single();

  if (affiliateError) {
    console.error("Erro ao buscar dados na tabela affiliates:", affiliateError);
    return res.status(500).json({ error: "Erro ao recuperar informações da agência." });
  }

  // --- Verificação se o subdomínio corresponde ao afiliado cadastrado ---
  // Neste exemplo, comparamos o subdomínio extraído com o slug da agência
  // Convertendo o slug para minúsculas para padronização.
  const affiliateSlug = affiliate.slug ? affiliate.slug.toLowerCase() : "";
  if (extractedSubdomain !== affiliateSlug) {
    return res.status(403).json({ error: "Você não tem permissão para acessar este subdomínio." });
  }

  // --- Se tudo estiver OK, retorna os dados do usuário, sessão e os dados do afiliado ---
  return res.status(200).json({
    success: true,
    user,
    session,
    affiliate,
    expiresIn: session?.expires_in || 3600
  });
}
