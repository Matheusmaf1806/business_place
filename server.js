const express = require("express");
const path = require("path");
const app = express();
const PORT = process.env.PORT || 3000;

// Middleware para interpretar o corpo das requisições
app.use(express.json());

// Middleware de CORS (ajuste conforme necessário)
app.use((req, res, next) => {
  res.header("Access-Control-Allow-Origin", "*");  
  res.header("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
  res.header("Access-Control-Allow-Headers", "Content-Type, Authorization");
  if (req.method === "OPTIONS") {
    return res.sendStatus(200);
  }
  next();
});

// Sirva arquivos estáticos a partir do diretório raiz (onde estão seus HTML, assets, etc.)
app.use(express.static(__dirname));

// Rota catch-all: se o arquivo não existir, envia index.html (ou outro arquivo default)
app.get("*", (req, res) => {
  const requestedFile = path.join(__dirname, req.path);
  res.sendFile(requestedFile, err => {
    if (err) {
      res.sendFile(path.join(__dirname, "index.html"));
    }
  });
});

// Inicializa o servidor (para testes locais)
app.listen(PORT, () => {
  console.log(`Servidor rodando na porta ${PORT}`);
});

module.exports = app;
