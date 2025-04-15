// server.js

const express = require("express");
const path = require("path");
const app = express();
const PORT = process.env.PORT || 3000;

// ------------------------------
// Middleware para extrair o subdomínio
// ------------------------------
app.use((req, res, next) => {
  // Obtém o header "Host". Em ambiente local pode vir com a porta, por exemplo, "lucastur.airland.com.br:3000"
  const host = req.headers.host;
  if (!host) {
    req.subdomain = null;
    return next();
  }
  
  // Remove a porta, se existir
  const hostWithoutPort = host.split(":")[0];

  // Define o domínio base (ajuste conforme necessário)
  const baseDomain = "airland.com.br";
  let subdomain = null;

  // Se o host for exatamente o domínio base, não há subdomínio
  if (hostWithoutPort.toLowerCase() === baseDomain.toLowerCase()) {
    subdomain = null;
  } else if (hostWithoutPort.toLowerCase().endsWith(`.${baseDomain.toLowerCase()}`)) {
    // Exemplo: "lucastur.airland.com.br" → extrai "lucastur"
    subdomain = hostWithoutPort.substring(0, hostWithoutPort.length - baseDomain.length - 1);
  } else {
    // Caso o host não siga o padrão, usa o host completo
    subdomain = hostWithoutPort;
  }
  
  // Força subdomínio para minúsculas para padronização
  req.subdomain = subdomain ? subdomain.toLowerCase() : null;
  console.log("Subdomínio extraído:", req.subdomain);
  next();
});

// ------------------------------
// Servir arquivos estáticos da pasta "public"
// ------------------------------
app.use(express.static(path.join(__dirname, "public")));

// ------------------------------
// Rota para a página de login do agente
// Exemplo: acessando "lucastur.airland.com.br/login-agente"
app.get("/login-agente", (req, res) => {
  if (!req.subdomain) {
    return res.status(400).send("Subdomínio não identificado. Use um subdomínio válido.");
  }
  // Envia o arquivo login-agente.html da pasta public
  res.sendFile(path.join(__dirname, "public", "login-agente.html"));
});

// ------------------------------
// Rota para o Dashboard
// Exemplo: "lucastur.airland.com.br/dashboard"
app.get("/dashboard", (req, res) => {
  if (!req.subdomain) {
    return res.status(400).send("Subdomínio não identificado. Verifique sua URL.");
  }
  res.sendFile(path.join(__dirname, "public", "dashboard.html"));
});

// ------------------------------
// Rota API para obter os dados do afiliado com base no subdomínio
// ------------------------------

// Usamos Supabase com a chave de serviço, que deve ser protegida no ambiente server-side
if (!process.env.SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
  throw new Error("As variáveis de ambiente SUPABASE_URL e SUPABASE_SERVICE_ROLE_KEY devem estar configuradas.");
}
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const { createClient } = require('@supabase/supabase-js');
const supabaseClient = createClient(supabaseUrl, supabaseServiceKey);

app.get("/api/affiliate", async (req, res) => {
  if (!req.subdomain) {
    return res.status(400).json({ error: "Subdomínio não definido na requisição." });
  }
  
  try {
    // Se no cadastro o subdomínio foi armazenado com o domínio completo,
    // ex: "lucastur.airland.com.br", então concatene se necessário.
    // Aqui, assumimos que o campo "subdomain" está armazenado assim.
    const fullSubdomain = req.subdomain + "." + "airland.com.br";
    
    // Consulta a tabela affiliates para obter o registro com o subdomínio específico.
    const { data, error } = await supabaseClient
      .from("affiliates")
      .select("*")
      .eq("subdomain", fullSubdomain)
      .single();
      
    if (error) {
      return res.status(404).json({ error: "Agência não encontrada para o subdomínio '" + fullSubdomain + "'. Detalhes: " + error.message });
    }
    
    // Retorna os dados do afiliado (incluindo o campo "id", que deverá ser usado como affiliate_id)
    return res.status(200).json({ affiliate: data });
    
  } catch (err) {
    console.error("Erro ao consultar afiliado:", err);
    return res.status(500).json({ error: "Erro interno no servidor" });
  }
});

// ------------------------------
// Rota catch-all para outras requisições: se nenhuma das anteriores for atendida,
// envia o arquivo index.html, por exemplo, para rotas genéricas.
// ------------------------------
app.get("*", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "index.html"));
});

// ------------------------------
// Inicia o servidor
// ------------------------------
app.listen(PORT, () => {
  console.log(`Servidor rodando na porta ${PORT}`);
});
