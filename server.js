// server.js
const express = require("express");
const path = require("path");
const app = express();
const { createClient } = require("@supabase/supabase-js");

// Porta local ou variável de ambiente
const PORT = process.env.PORT || 3000;

// Verificação das variáveis de ambiente para Supabase
if (!process.env.SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
  throw new Error(
    "As variáveis de ambiente SUPABASE_URL e SUPABASE_SERVICE_ROLE_KEY são necessárias."
  );
}

// Inicializa o client Supabase
const supabaseClient = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

/* ----------------------------------------------------------
   1) Middleware para interpretar JSON no body
---------------------------------------------------------- */
app.use(express.json());

/* ----------------------------------------------------------
   2) Middleware de CORS básico
   (Ajuste conforme a necessidade real de origem e credenciais)
---------------------------------------------------------- */
app.use((req, res, next) => {
  // Liberando origem para testes (outra abordagem seria especificar domínios)
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");
  res.header("Access-Control-Allow-Headers", "Content-Type, Authorization");
  // Se quiser enviar cookies (credentials), não use "*"
  // res.header("Access-Control-Allow-Origin", "http://seu-dominio.com");
  // res.header("Access-Control-Allow-Credentials", "true");

  if (req.method === "OPTIONS") {
    return res.sendStatus(200);
  }
  next();
});

/* ----------------------------------------------------------
   3) (Opcional) Extração simples de subdomínio
   Se não precisar, remova este bloco
---------------------------------------------------------- */
app.use((req, res, next) => {
  const host = req.headers.host || "";
  const [possibleSubdomain] = host.split(".");
  // Se "possibleSubdomain" for "businessplace" ou outra
  // Lógica adicional pode ser feita aqui
  req.subdomain = possibleSubdomain;
  console.log("Subdomínio detectado:", req.subdomain);
  next();
});

/* ----------------------------------------------------------
   4) Rotas de API
---------------------------------------------------------- */

// POST /api/login
app.post("/api/login", async (req, res) => {
  const { email, password } = req.body;

  // Validação básica
  if (!email || !password) {
    return res.status(400).json({ error: "Email e senha são obrigatórios." });
  }

  try {
    // Autenticação via Supabase
    const { data, error } = await supabaseClient.auth.signInWithPassword({
      email,
      password,
    });
    if (error) {
      // Retorna 401 se credenciais forem inválidas
      return res.status(401).json({ error: error.message });
    }

    const { user, session } = data;

    // Exemplo de lookup em outra tabela (se houver):
    // const { data: extraData, error: extraError } = await supabaseClient
    //   .from("some_table")
    //   .select("*")
    //   .eq("user_id", user.id)
    //   .single();
    // if (extraError) {
    //   return res.status(500).json({ error: "Erro ao buscar dados extras." });
    // }

    // Retorna objeto com dados de sucesso
    return res.json({
      success: true,
      user,
      session,
      // exampleExtra: extraData,
    });
  } catch (err) {
    console.error("Erro durante login:", err);
    return res
      .status(500)
      .json({ error: "Erro interno no servidor durante o login." });
  }
});

/* ----------------------------------------------------------
   5) Servindo arquivos estáticos
---------------------------------------------------------- */
app.use(express.static(path.join(__dirname, "public")));

/* ----------------------------------------------------------
   6) Rota catch-all (para qualquer outra rota GET que não seja /api/)
---------------------------------------------------------- */
app.get("*", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "index.html"));
});

/* ----------------------------------------------------------
   7) Inicializa o servidor
---------------------------------------------------------- */
app.listen(PORT, () => {
  console.log(`Servidor iniciado na porta ${PORT}`);
});

module.exports = app;
