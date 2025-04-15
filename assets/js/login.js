// assets/js/login.js
document.getElementById('login-form').addEventListener('submit', async function(e) {
  e.preventDefault();

  const email = e.target.email.value;
  const password = e.target.password.value;
  
  try {
    const response = await fetch('/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password })
    });

    const result = await response.json();

    if (result.success) {
      // Redireciona para a área protegida (por exemplo, dashboard)
      window.location.href = '/painel-vendas';
    } else {
      // Exibe a mensagem de erro recebida
      const errorMessage = document.getElementById('error-message');
      errorMessage.style.display = 'block';
      errorMessage.innerText = result.error;
    }
  } catch (error) {
    console.error('Erro durante o login:', error);
  }
});
