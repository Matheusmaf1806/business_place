document.addEventListener("DOMContentLoaded", function () {
  const form = document.getElementById("login-form");
  const errorDiv = document.getElementById("error-message");

  form.addEventListener("submit", async function (e) {
    e.preventDefault();
    errorDiv.style.display = "none";
    errorDiv.innerText = "";

    const email = form.email.value.trim();
    const password = form.password.value.trim();

    if (!email || !password) {
      errorDiv.innerText = "Por favor, preencha todos os campos.";
      errorDiv.style.display = "block";
      return;
    }

    try {
      const response = await fetch("/api/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "same-origin",
        body: JSON.stringify({ email, password }),
      });

      const contentType = response.headers.get("content-type") || "";
      let data;
      if (contentType.includes("application/json")) {
        data = await response.json();
      } else {
        const textData = await response.text();
        throw new Error("Resposta inesperada (não é JSON): " + textData);
      }

      if (!response.ok) {
        throw new Error(data.error || "Erro na requisição: " + response.status);
      }

      if (data.success) {
        localStorage.setItem("affiliateUser", JSON.stringify(data.user));
        window.location.href = "http://businessplace.airland.com.br/index.html";
      } else {
        errorDiv.innerText = data.error || "Email ou senha incorretos!";
        errorDiv.style.display = "block";
      }
    } catch (err) {
      console.error(err);
      errorDiv.innerText = "Ocorreu um erro ao realizar o login: " + err.message;
      errorDiv.style.display = "block";
    }
  });
});
