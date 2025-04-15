const express = require("express");
const path = require("path");
const { createClient } = require("@supabase/supabase-js");

const app = express();
const PORT = process.env.PORT || 3000;

// Verifica as variáveis de ambiente para Supabase
if (!process.env.SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
  throw new Error("As variáveis de ambiente SUPABASE_URL e SUPABASE_SERVICE_ROLE_KEY são necessárias.");
}
const supabaseClient = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

// Middleware para interpretar o corpo das requisições
app.use(express.json());

// Middleware de CORS (ajuste a liberação conforme sua necessidade)
app.use((req, res, next) => {
  res.header("Access-Control-Allow-Origin", "*");  
  res.header("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
  res.header("Access-Control-Allow-Headers", "Content-Type, Authorization");
  if (req.method === "OPTIONS") {
    return res.sendStatus(200);
  }
  next();
});

// Rota de API: POST /api/login
app.post("/api/login", async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ error: "Email e senha são obrigatórios." });
  }

  try {
    const { data, error } = await supabaseClient.auth.signInWithPassword({ email, password });
    if (error) {
      return res.status(401).json({ error: error.message });
    }
    const { user, session } = data;
    return res.status(200).json({
      success: true,
      user,
      session,
      expiresIn: session?.expires_in || 3600,
    });
  } catch (err) {
    console.error("Erro durante login:", err);
    return res.status(500).json({ error: "Erro interno no servidor durante o login." });
  }
});

// Serve arquivos estáticos a partir do diretório raiz
app.use(express.static(__dirname));

// Rota catch-all para GET
// Se o arquivo requisitado existir no sistema, o middleware express.static o enviará automaticamente
// Caso contrário, podemos optar por enviar um arquivo default (ex.: index.html)
app.get("*", (req, res) => {
  // Tenta enviar o arquivo solicitado (exemplo: /signin.html ou /index.html)
  const requestedFile = path.join(__dirname, req.path);
  res.sendFile(requestedFile, err => {
    // Se não for encontrado, envia o index.html (ou outro arquivo default)
    if (err) {
      res.sendFile(path.join(__dirname, "index.html"));
    }
  });
});

// Inicializa o servidor
app.listen(PORT, () => {
  console.log(`Servidor rodando na porta ${PORT}`);
});

module.exports = app;
