/**
 * api/subdomainRouter.js
 *
 * Esse endpoint recebe requisições GET e extrai o subdomínio a partir do header "Host".
 * O subdomínio é utilizado para consultar a tabela "affiliates" no Supabase e retornar
 * os dados do afiliado, onde o campo "id" é o identificador universal (usado em outras tabelas como affiliate_id).
 *
 * Para que isso funcione, configure as variáveis de ambiente:
 *    SUPABASE_URL e SUPABASE_SERVICE_ROLE_KEY
 * 
 * Exemplo:
 *  Host: lucastur.airland.com.br  →  subdomain = "lucastur"
 *
 * Resposta de sucesso:
 *    { affiliate: { id: ..., slug: ..., subdomain: ..., name: ..., logo_url: ..., ... } }
 *
 * Em caso de erro, retornará um JSON com a mensagem de erro e o código HTTP correspondente.
 */

import { createClient } from '@supabase/supabase-js';

// Verifica se as variáveis de ambiente estão configuradas
if (!process.env.SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
  throw new Error("SUPABASE_URL e SUPABASE_SERVICE_ROLE_KEY devem estar definidos nas variáveis de ambiente.");
}

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

// Cria o client do Supabase usando a chave de serviço (ideal para ambientes server-side)
const supabaseClient = createClient(supabaseUrl, supabaseServiceKey);

export default async function handler(req, res) {
  // Permite apenas o método GET
  if (req.method !== 'GET') {
    res.status(405).json({ error: 'Método não permitido. Use GET.' });
    return;
  }

  // Extrai o header "Host"
  const host = req.headers.host;
  if (!host) {
    res.status(400).json({ error: 'Header "Host" não encontrado na requisição.' });
    return;
  }

  // Define o domínio base
  const baseDomain = "airland.com.br";
  
  // Se o host for exatamente o domínio base, então nenhum subdomínio foi informado
  if (host.toLowerCase() === baseDomain) {
    res.status(400).json({ error: 'Subdomínio não informado. Acesse através de um subdomínio válido.' });
    return;
  }

  // Extrai o subdomínio: se o host termina com ".airland.com.br", remove o baseDomain.
  let subdomain = "";
  if (host.toLowerCase().endsWith(`.${baseDomain}`)) {
    // Exemplo: "lucastur.airland.com.br" → "lucastur"
    subdomain = host.substring(0, host.length - baseDomain.length - 1);
  } else {
    // Caso o host não contenha o domínio base de forma padrão, usa o host completo.
    subdomain = host;
  }
  // Força minúsculas para padronização
  subdomain = subdomain.toLowerCase();

  // Consulta a tabela affiliates para encontrar o registro cujo campo "subdomain" seja igual
  const { data, error } = await supabaseClient
    .from('affiliates')
    .select('*')
    .eq('subdomain', subdomain)
    .single();

  if (error) {
    // Se não encontrar ou ocorrer erro na consulta, retorna 404 (ou 500 se for outro problema)
    res.status(404).json({
      error: `Agência não encontrada para o subdomínio "${subdomain}". Detalhes: ${error.message}`
    });
    return;
  }

  // Se tudo ocorreu bem, retorna o registro do afiliado.
  res.status(200).json({ affiliate: data });
}
