// server.js

const express = require("express");
const path = require("path");
const app = express();
const PORT = process.env.PORT || 3000;

/* -----------------------------------------------------------------------------
  1) Middleware para interpretar JSON (body parser)
----------------------------------------------------------------------------- */
app.use(express.json());

/* -----------------------------------------------------------------------------
  2) (Opcional) Handler para requisições OPTIONS – útil para pré-requisições CORS
----------------------------------------------------------------------------- */
app.options("/*", (req, res) => {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");
  res.header("Access-Control-Allow-Headers", "Content-Type");
  res.sendStatus(200);
});

/* -----------------------------------------------------------------------------
  3) Middleware para extrair o subdomínio a partir do header "Host"
----------------------------------------------------------------------------- */
app.use((req, res, next) => {
  const host = req.headers.host; // Exemplo: "lucastur.airland.com.br:3000"
  if (!host) {
    req.subdomain = null;
    return next();
  }
  const hostWithoutPort = host.split(":")[0];
  const baseDomain = "airland.com.br";
  let subdomain = null;

  if (hostWithoutPort.toLowerCase() === baseDomain.toLowerCase()) {
    subdomain = null;
  } else if (hostWithoutPort.toLowerCase().endsWith(`.${baseDomain.toLowerCase()}`)) {
    subdomain = hostWithoutPort.substring(0, hostWithoutPort.length - baseDomain.length - 1);
  } else {
    subdomain = hostWithoutPort;
  }
  req.subdomain = subdomain ? subdomain.toLowerCase() : null;
  console.log("Subdomínio extraído:", req.subdomain);
  next();
});

/* -----------------------------------------------------------------------------
  4) Rotas de API: Definidas ANTES do middleware de arquivos estáticos
----------------------------------------------------------------------------- */

/* 4.1) Rota API para obter dados do afiliado com base no subdomínio */
app.get("/api/affiliate", async (req, res) => {
  if (!req.subdomain) {
    return res.status(400).json({ error: "Subdomínio não definido na requisição." });
  }
  try {
    // Supondo que o campo "subdomain" esteja armazenado como "lucastur.airland.com.br"
    const fullSubdomain = req.subdomain + ".airland.com.br";
    const { data, error } = await supabaseClient
      .from("affiliates")
      .select("*")
      .eq("subdomain", fullSubdomain)
      .single();

    if (error) {
      return res.status(404).json({
        error: `Agência não encontrada para o subdomínio '${fullSubdomain}'. Detalhes: ${error.message}`,
      });
    }
    return res.status(200).json({ affiliate: data });
  } catch (err) {
    console.error("Erro ao consultar afiliado:", err);
    return res.status(500).json({ error: "Erro interno no servidor" });
  }
});

/* 4.2) Rota API para login (POST /api/login) */
app.post("/api/login", async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json({ error: "Email e senha são obrigatórios." });
  }
  if (!req.subdomain) {
    return res.status(400).json({ error: "Subdomínio não identificado. Use um subdomínio." });
  }

  try {
    // Autenticação via Supabase Auth
    const { data, error } = await supabaseClient.auth.signInWithPassword({ email, password });
    if (error) {
      return res.status(401).json({ error: error.message });
    }
    const { user, session } = data;

    // Consulta à tabela user_affiliates para obter o affiliate_id associado
    const { data: userAffiliate, error: userAffError } = await supabaseClient
      .from("user_affiliates")
      .select("*")
      .eq("user_id", user.id)
      .single();
    if (userAffError) {
      console.error("Erro ao buscar dados do afiliado:", userAffError);
      return res.status(500).json({ error: "Erro ao recuperar dados do afiliado." });
    }

    // Consulta à tabela affiliates para obter os dados da agência
    const { data: affiliate, error: affiliateError } = await supabaseClient
      .from("affiliates")
      .select("*")
      .eq("id", userAffiliate.affiliate_id)
      .single();
    if (affiliateError) {
      console.error("Erro ao buscar dados na tabela affiliates:", affiliateError);
      return res.status(500).json({ error: "Erro ao recuperar informações da agência." });
    }

    // Se o subdomínio não for "businessplace" (backoffice), verifica se bate com o slug do afiliado
    const affiliateSlug = affiliate.slug ? affiliate.slug.toLowerCase() : "";
    if (req.subdomain !== "businessplace" && req.subdomain !== affiliateSlug) {
      return res.status(403).json({ error: "Você não tem permissão para acessar este subdomínio." });
    }

    return res.status(200).json({
      success: true,
      user,
      session,
      affiliate,
      expiresIn: session?.expires_in || 3600,
    });
  } catch (err) {
    console.error("Erro no login:", err);
    return res.status(500).json({ error: "Erro interno no servidor durante o login." });
  }
});

/* -----------------------------------------------------------------------------
  5) Integração com Supabase
     Certifique-se de que as variáveis de ambiente SUPABASE_URL e SUPABASE_SERVICE_ROLE_KEY estejam definidas.
----------------------------------------------------------------------------- */
if (!process.env.SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
  throw new Error("As variáveis SUPABASE_URL e SUPABASE_SERVICE_ROLE_KEY devem estar configuradas.");
}
const { createClient } = require("@supabase/supabase-js");
const supabaseClient = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

/* -----------------------------------------------------------------------------
  6) Outras rotas de páginas (não API)
----------------------------------------------------------------------------- */
app.get("/login-agente", (req, res) => {
  if (!req.subdomain) {
    return res.status(400).send("Subdomínio não identificado. Use um subdomínio válido.");
  }
  res.sendFile(path.join(__dirname, "public", "login-agente.html"));
});

app.get("/dashboard", (req, res) => {
  if (!req.subdomain) {
    return res.status(400).send("Subdomínio não identificado. Verifique sua URL.");
  }
  res.sendFile(path.join(__dirname, "public", "dashboard.html"));
});

/* -----------------------------------------------------------------------------
  7) Middleware para servir arquivos estáticos para os demais caminhos
----------------------------------------------------------------------------- */
app.use(express.static(path.join(__dirname, "public")));

/* -----------------------------------------------------------------------------
  8) Rota catch-all para servir o index.html se nenhuma rota anterior for atendida
----------------------------------------------------------------------------- */
app.get("*", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "index.html"));
});

/* -----------------------------------------------------------------------------
  9) Inicia o servidor localmente se NODE_ENV === "development"
     Em produção, o app será exportado como função serverless.
----------------------------------------------------------------------------- */
if (process.env.NODE_ENV === "development") {
  app.listen(PORT, () => {
    console.log(`Servidor rodando na porta ${PORT}`);
  });
}

module.exports = app;
