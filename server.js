// server.js

const express = require("express");
const path = require("path");
const app = express();
const PORT = process.env.PORT || 3000;

/* ----------------------------------------------------
   1) Middleware para interpretar JSON do corpo (POST/PUT)
----------------------------------------------------- */
app.use(express.json());

/* ----------------------------------------------------
   2) (Opcional) Handler para requisições OPTIONS – útil para pré-requisições CORS
----------------------------------------------------- */
app.options("/*", (req, res) => {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");
  res.header("Access-Control-Allow-Headers", "Content-Type");
  res.sendStatus(200);
});

/* ----------------------------------------------------
   3) Middleware para extrair o subdomínio a partir do "Host"
----------------------------------------------------- */
app.use((req, res, next) => {
  const host = req.headers.host; // Ex.: "lucastur.airland.com.br:3000"
  if (!host) {
    req.subdomain = null;
    return next();
  }

  // Remove a parte da porta (se houver)
  const hostWithoutPort = host.split(":")[0];

  // Domínio base configurado conforme sua necessidade
  const baseDomain = "airland.com.br";

  let subdomain = null;
  if (hostWithoutPort.toLowerCase() === baseDomain.toLowerCase()) {
    // Caso seja exatamente airland.com.br
    subdomain = null;
  } else if (hostWithoutPort.toLowerCase().endsWith(`.${baseDomain.toLowerCase()}`)) {
    // Ex.: "lucastur.airland.com.br" → extrai "lucastur"
    subdomain = hostWithoutPort.substring(
      0,
      hostWithoutPort.length - baseDomain.length - 1
    );
  } else {
    // Caso não siga o padrão, usa o host completo
    subdomain = hostWithoutPort;
  }

  // Força subdomínio para minúsculas
  req.subdomain = subdomain ? subdomain.toLowerCase() : null;
  console.log("Subdomínio extraído:", req.subdomain);
  next();
});

/* ----------------------------------------------------
   4) Servir arquivos estáticos da pasta "public"
      Dessa forma, /signin.html, /assets/, etc. funcionam
----------------------------------------------------- */
app.use(express.static(path.join(__dirname, "public")));

/* ----------------------------------------------------
   5) Rotas de páginas específicas (ex.: login-agente, dashboard)
----------------------------------------------------- */
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

/* ----------------------------------------------------
   6) Configuração do Supabase
      Necessário ter SUPABASE_URL e SUPABASE_SERVICE_ROLE_KEY no ambiente
----------------------------------------------------- */
if (!process.env.SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
  throw new Error("As variáveis SUPABASE_URL e SUPABASE_SERVICE_ROLE_KEY devem estar configuradas.");
}
const { createClient } = require("@supabase/supabase-js");
const supabaseClient = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

/* ----------------------------------------------------
   7) Rota GET /api/affiliate
      Ex.: para obter dados do afiliado baseado no subdomínio
----------------------------------------------------- */
app.get("/api/affiliate", async (req, res) => {
  if (!req.subdomain) {
    return res.status(400).json({ error: "Subdomínio não definido na requisição." });
  }

  try {
    // Exemplo: "lucastur.airland.com.br" salvo em affiliates.subdomain
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

/* ----------------------------------------------------
   8) Rota POST /api/login
      Faz login via Supabase Auth e valida se o subdomínio corresponde ao slug
----------------------------------------------------- */
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

    // Busca o affiliate_id do usuário na tabela user_affiliates
    const { data: userAffiliate, error: userAffError } = await supabaseClient
      .from("user_affiliates")
      .select("*")
      .eq("user_id", user.id)
      .single();

    if (userAffError) {
      console.error("Erro ao buscar dados do afiliado:", userAffError);
      return res.status(500).json({ error: "Erro ao recuperar dados do afiliado." });
    }

    // Consulta na tabela affiliates para obter os dados da agência
    const { data: affiliate, error: affiliateError } = await supabaseClient
      .from("affiliates")
      .select("*")
      .eq("id", userAffiliate.affiliate_id)
      .single();

    if (affiliateError) {
      console.error("Erro ao buscar dados na tabela affiliates:", affiliateError);
      return res.status(500).json({ error: "Erro ao recuperar informações da agência." });
    }

    // Se o subdomínio não for "businessplace", verifica se ele bate com o slug
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

/* ----------------------------------------------------
   9) Rota catch-all
      Se nenhuma rota anterior for atendida, envia o arquivo index.html
----------------------------------------------------- */
app.get("*", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "index.html"));
});

/* ----------------------------------------------------
   10) Inicia o servidor local se NODE_ENV=development
       Em produção (Vercel), esse app será exportado
----------------------------------------------------- */
if (process.env.NODE_ENV === "development") {
  app.listen(PORT, () => {
    console.log(`Servidor rodando na porta ${PORT}`);
  });
}

// Exporta o app para que o Vercel (ou outro ambiente) o invoque como função serverless
module.exports = app;
