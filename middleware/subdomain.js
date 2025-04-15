// middleware/subdomain.js
module.exports = function (req, res, next) {
  // Extrai o host a partir dos headers (atenção: em ambiente local pode vir com porta, ex: 'localhost:3000')
  let host = req.headers.host;
  if (host) {
    // Converte para minúsculas para evitar discrepâncias (pode incluir lógica para extrair somente o subdomínio se necessário)
    req.subdomain = host.toLowerCase();
  } else {
    req.subdomain = null;
  }
  next();
};
