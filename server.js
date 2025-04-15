// server.js
const express = require('express');
const session = require('express-session');
const bcrypt = require('bcrypt');
const { createClient } = require('@supabase/supabase-js');
const subdomainMiddleware = require('./middleware/subdomain');

const app = express();

// Configuração dos middlewares para interpretar JSON e dados via formulário
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Configuração das sessões usando cookies com validade de 1 hora
app.use(session({
  secret: process.env.SESSION_SECRET || 'mySecret', // Defina a variável SESSION_SECRET nas variáveis de ambiente
  resave: false,
  saveUninitialized: false,
  cookie: { maxAge: 3600000 } // 1 hora em milissegundos
}));

// Usa o middleware para extrair o subdomínio (ou host) da requisição
app.use(subdomainMiddleware);

// Inicializa o cliente do Supabase
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

// Armazenamento em memória para tentativas de login (apenas para demonstração)
const loginAttempts = {};

// Função auxiliar para verificar se o login está bloqueado para determinado e-mail
function isBlocked(email) {
  const attempt = loginAttempts[email];
  if (!attempt) return false;
  if (attempt.blockUntil && Date.now() < attempt.blockUntil) {
    return true;
  }
  return false;
}

// Rota de login
app.post('/login', async (req, res) => {
  const { email, password } = req.body;
  const subdomain = req.subdomain;

  if (!subdomain) {
    return res.status(400).json({ success: false, error: 'Subdomínio não identificado.' });
  }

  // Consulta o afiliado (loja) com base no domínio/subdomínio
  const { data: affiliate, error: affError } = await supabase
    .from('affiliates')
    .select('*')
    .eq('domain', subdomain)
    .single();

  if (affError || !affiliate) {
    return res.status(400).json({ success: false, error: 'Affiliado não encontrado para este subdomínio.' });
  }

  // Verifica se o usuário está bloqueado por tentativas excessivas
  if (isBlocked(email)) {
    return res.status(403).json({ success: false, error: 'Muitas tentativas. Tente novamente mais tarde.' });
  }

  // Consulta o usuário na tabela user_affiliates, verificando se o usuário pertence ao afiliado identificado
  const { data: user, error: userError } = await supabase
    .from('user_affiliates')
    .select('*')
    .eq('email', email)
    .eq('affiliate_id', affiliate.id)
    .single();

  if (userError || !user) {
    // Incrementa a contagem de tentativas de login
    if (!loginAttempts[email]) {
      loginAttempts[email] = { count: 1 };
    } else {
      loginAttempts[email].count += 1;
    }
    if (loginAttempts[email].count >= 5) {
      loginAttempts[email].blockUntil = Date.now() + 3 * 60 * 60 * 1000; // Bloqueia por 3 horas
    }
    return res.status(400).json({ success: false, error: 'Usuário não encontrado ou credenciais inválidas.' });
  }

  // Verifica a senha usando bcrypt
  const passwordMatch = await bcrypt.compare(password, user.password);
  if (!passwordMatch) {
    if (!loginAttempts[email]) {
      loginAttempts[email] = { count: 1 };
    } else {
      loginAttempts[email].count += 1;
    }
    if (loginAttempts[email].count >= 5) {
      loginAttempts[email].blockUntil = Date.now() + 3 * 60 * 60 * 1000;
    }
    return res.status(400).json({ success: false, error: 'Senha incorreta.' });
  }

  // Se o login for bem-sucedido, reseta as tentativas e cria a sessão do usuário
  loginAttempts[email] = { count: 0 };
  req.session.user = {
    id: user.id,
    email: user.email,
    affiliate_id: user.affiliate_id,
    primeiro_nome: user.primeiro_nome,
    ultimo_nome: user.ultimo_nome
  };

  return res.status(200).json({ success: true, message: 'Login efetuado com sucesso.' });
});

// Rota de exemplo para acessar uma área restrita (dashboard)
app.get('/dashboard', (req, res) => {
  if (!req.session.user) {
    return res.status(401).send('Não autorizado. Faça login.');
  }
  res.send(`Bem-vindo, ${req.session.user.primeiro_nome || 'Usuário'}!`);
});

// Inicia o servidor
const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log(`Servidor rodando na porta ${port}`);
});
