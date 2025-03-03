// profile.js

// Função para buscar os dados do usuário
function fetchUserProfile(userId) {
  // Se você estiver usando cookies/sessão, pode alterar o "id" dinamicamente ou passar como parâmetro
  // Exemplo: const userId = 1; ou userId que vier do seu back-end

  // Faz a chamada à API
  fetch(`https://airland.com.br/affiliatesacess/get_user_profile.php?id=${userId}`, {
    credentials: 'include' // se precisar enviar cookies junto
  })
  .then(response => response.json())
  .then(result => {
    if (result.success) {
      const data = result.data;
      // Preenche os campos do DOM, caso existam
      if (document.getElementById("dropdownUserName")) {
        document.getElementById("dropdownUserName").textContent =
          data.primeiro_nome + " " + data.ultimo_nome;
      }
      if (document.getElementById("dropdownUserEmail")) {
        document.getElementById("dropdownUserEmail").textContent = data.email;
      }
      if (document.getElementById("profileImage")) {
        document.getElementById("profileImage").src = data.fotodeperfil;
      }
      if (document.getElementById("profileImageDropdown")) {
        document.getElementById("profileImageDropdown").src = data.fotodeperfil;
      }
      // Se tiver outro local, ex: document.getElementById("profileImageLeft").src = data.fotodeperfil;
    } else {
      console.error("Erro:", result.error);
    }
  })
  .catch(error => console.error("Erro na API:", error));
}

// Exemplo de execução assim que a página carrega
document.addEventListener("DOMContentLoaded", function() {
  // Substitua 1 pelo ID real do usuário logado
  fetchUserProfile(1);
});
