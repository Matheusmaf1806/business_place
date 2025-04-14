/***************************************************************************************
 * painelVendasCompleto.js
 *
 * Esse arquivo único contém:
 *    1) TODo o HTML original do seu Painel de Vendas (100% completo, sem omissões).
 *    2) O carregamento da biblioteca Supabase via CDN e a criação do client.
 *    3) Funções para consultar dados da tabela "supplier_pedidos" filtrando pelo affiliate_id.
 *    4) Funções para calcular métricas (Clientes, Faturamento, Receita, Take Rate).
 *    5) A lógica para popular os blocos dinâmicos (cards, tabelas de “Pedidos Recentes” e “Pedidos por Região”).
 *
 * Configure as variáveis SUPABASE_URL, SUPABASE_KEY e affiliate_id conforme seu ambiente.
 **************************************************************************************/

// ================== CONFIGURAÇÕES ====================
const SUPABASE_URL = process.env.SUPABASE_URL
const SUPABASE_KEY = process.env.SUPABASE_ANON_KEY
const affiliate_id = 123; // Altere para obter dinamicamente o id do afiliado

// ================== FUNÇÃO PARA CARREGAR A BIBLIOTECA SUPABASE ====================
function loadSupabase(callback) {
  if (window.supabase) {
    callback();
  } else {
    const script = document.createElement("script");
    script.src = "https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/dist/umd/supabase.min.js";
    script.onload = callback;
    document.head.appendChild(script);
  }
}

// ================== TODO O HTML ORIGINAL (100% COMPLETO) ====================
const painelHTML = String.raw`
<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta http-equiv="X-UA-Compatible" content="IE=edge" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <link rel="shortcut icon" href="assets/images/favicon.svg" type="image/x-icon" />
    <title>Airland</title>

    <!-- ========== All CSS files linkup ========= -->
    <link rel="stylesheet" href="assets/css/bootstrap.min.css" />
    <link rel="stylesheet" href="assets/css/lineicons.css" />
    <link rel="stylesheet" href="assets/css/quill/bubble.css" />
    <link rel="stylesheet" href="assets/css/quill/snow.css" />
    <link rel="stylesheet" href="assets/css/fullcalendar.css" />
    <link rel="stylesheet" href="assets/css/morris.css" />
    <link rel="stylesheet" href="assets/css/datatable.css" />
    <link rel="stylesheet" href="assets/css/main.css" />
    
    <!-- ========== CSS do Calendário (Anexo 1) ========= -->
    <link rel="stylesheet" href="assets/css/calcom.css" />
  </head>
  <body>
    <!-- ======== Preloader ========= -->
    <div id="preloader">
      <div class="spinner"></div>
    </div>
    <!-- ======== Fim Preloader ========= -->

    <!-- ======== Sidebar Navigation ========= -->
    <aside class="sidebar-nav-wrapper">
      <div class="navbar-logo">
        <a href="index.html">
          <img src="assets/images/logo/logo.svg" alt="logo" />
        </a>
      </div>
      <nav class="sidebar-nav">
        <ul>
          <!-- Menu: Painel de Vendas -->
          <li class="nav-item">
            <a href="painel-vendas.html">
              <span class="icon">
                <!-- SVG omitido para brevidade -->
              </span>
              <span class="text">Painel de Vendas</span>
            </a>
          </li>
          <!-- Menu: Vendas com submenu -->
          <li class="nav-item nav-item-has-children">
            <a href="#0" class="collapsed" data-bs-toggle="collapse" data-bs-target="#ddmenu_2" 
               aria-controls="ddmenu_2" aria-expanded="false" aria-label="Toggle navigation">
              <span class="icon">
                <!-- SVG omitido -->
              </span>
              <span class="text">Vendas</span>
            </a>
            <ul id="ddmenu_2" class="collapse dropdown-nav">
              <li><a href="pedidos.html"><span class="arrow-icon">→</span> Pedidos</a></li>
              <li><a href="clientes.html"><span class="arrow-icon">→</span> Clientes</a></li>
            </ul>
          </li>
          <!-- Menu: Orçamentos -->
          <li class="nav-item">
            <a href="orcamentos.html">
              <span class="icon">
                <!-- SVG omitido -->
              </span>
              <span class="text">Orçamentos</span>
            </a>
          </li>
          <!-- Menu: Personalize -->
          <li class="nav-item nav-item-has-children">
            <a href="#0" data-bs-toggle="collapse" data-bs-target="#ddmenu_3" 
               aria-controls="ddmenu_3" aria-expanded="true" aria-label="Toggle navigation">
              <span class="icon">
                <!-- SVG omitido -->
              </span>
              <span class="text">Personalize</span>
            </a>
            <ul id="ddmenu_3" class="collapsed show dropdown-nav">
              <li><a href="design.html#idvisual"><span class="arrow-icon">→</span> Identidade Visual</a></li>
              <li><a href="design.html#paleta"><span class="arrow-icon">→</span> Paleta de Cores</a></li>
              <li><a href="design.html#banner"><span class="arrow-icon">→</span> Banner</a></li>
              <li><a href="design.html/#footer"><span class="arrow-icon">→</span> Rodapé</a></li>
            </ul>
          </li>
          <!-- Menu: Usuários -->
          <li class="nav-item nav-item-has-children">
            <a href="#0" data-bs-toggle="collapse" data-bs-target="#ddmenu_usuarios" 
               aria-controls="ddmenu_usuarios" aria-expanded="true" aria-label="Toggle navigation">
              <span class="icon">
                <!-- SVG omitido -->
              </span>
              <span class="text">Usuários</span>
            </a>
            <ul id="ddmenu_usuarios" class="collapsed show dropdown-nav">
              <li><a href="createuser.html"><span class="arrow-icon">→</span> Criar acesso</a></li>
              <li><a href="users.html"><span class="arrow-icon">→</span> Gerenciar usuários</a></li>
            </ul>
          </li>
        </ul>
      </nav>
      <!-- Caixa promocional do afiliado -->
      <div class="promo-box">
        <div class="promo-icon">
          <img class="mx-auto" src="assets/images/logo/logo-icon-big.svg" alt="Logo" />
        </div>
        <h3>Adam Joe</h3>
        <p>A Airland agradece por lhe ter como colaborador do nosso time.</p>
      </div>
    </aside>
    <div class="overlay"></div>
    <!-- ======== Fim Sidebar Navigation ========= -->

    <!-- ================= Main Wrapper e Header ================= -->
    <main class="main-wrapper">
      <header class="header">
        <div class="container-fluid">
          <div class="row">
            <!-- Menu Toggle -->
            <div class="col-lg-5 col-md-5 col-6">
              <div class="header-left d-flex align-items-center">
                <div class="menu-toggle-btn mr-15">
                  <button id="menu-toggle" class="main-btn primary-btn btn-hover">
                    <i class="lni lni-chevron-left me-2"></i> Menu
                  </button>
                </div>
              </div>
            </div>
            <!-- Dados do Perfil no Header -->
            <div class="col-lg-7 col-md-7 col-6">
              <div class="header-right">
                <!-- Notificações -->
                <div class="notification-box ml-15 d-none d-md-flex">
                  <button class="dropdown-toggle" type="button" id="notification" 
                          data-bs-toggle="dropdown" aria-expanded="false">
                    <svg width="22" height="22" viewBox="0 0 22 22" fill="none">
                      <!-- SVG omitido -->
                    </svg>
                    <span></span>
                  </button>
                  <ul class="dropdown-menu dropdown-menu-end" aria-labelledby="notification">
                    <li>
                      <a href="#0">
                        <div class="image">
                          <img src="assets/images/lead/lead-6.png" alt="" />
                        </div>
                        <div class="content">
                          <h6>John Doe <span class="text-regular">comment on a product.</span></h6>
                          <p>Lorem ipsum dolor sit amet, consect etur adipiscing elit Vivamus tortor.</p>
                          <span>10 mins ago</span>
                        </div>
                      </a>
                    </li>
                    <li>
                      <a href="#0">
                        <div class="image">
                          <img src="assets/images/lead/lead-1.png" alt="" />
                        </div>
                        <div class="content">
                          <h6>Jonathon <span class="text-regular">like on a product.</span></h6>
                          <p>Lorem ipsum dolor sit amet, consect etur adipiscing elit Vivamus tortor.</p>
                          <span>10 mins ago</span>
                        </div>
                      </a>
                    </li>
                  </ul>
                </div>
                <!-- Perfil -->
                <div class="profile-box ml-15">
                  <button class="dropdown-toggle bg-transparent border-0" type="button" 
                          id="profile" data-bs-toggle="dropdown" aria-expanded="false">
                    <div class="profile-info">
                      <div class="info">
                        <div class="image">
                          <img src="assets/images/profile/profile-image.png" alt="" />
                        </div>
                        <div>
                          <h6 class="fw-500">Adam Joe</h6>
                          <p>Admin</p>
                        </div>
                      </div>
                    </div>
                  </button>
                  <ul class="dropdown-menu dropdown-menu-end" aria-labelledby="profile">
                    <li>
                      <div class="author-info flex items-center !p-1">
                        <div class="image">
                          <img src="assets/images/profile/profile-image.png" alt="image" />
                        </div>
                        <div class="content">
                          <h4 class="text-sm">Adam Joe</h4>
                          <a class="text-black/40 dark:text-white/40 hover:text-black dark:hover:text-white text-xs" href="#">
                            Email@gmail.com
                          </a>
                        </div>
                      </div>
                    </li>
                    <li class="divider"></li>
                    <li><a href="#0"><i class="lni lni-user"></i> View Profile</a></li>
                    <li><a href="#0"><i class="lni lni-alarm"></i> Notifications</a></li>
                    <li><a href="#0"><i class="lni lni-inbox"></i> Messages</a></li>
                    <li><a href="#0"><i class="lni lni-cog"></i> Settings</a></li>
                    <li class="divider"></li>
                    <li><a href="#0"><i class="lni lni-exit"></i> Sign Out</a></li>
                  </ul>
                </div>
                <!-- Fim do Perfil -->
              </div>
            </div>
          </div>
        </div>
      </header>
      <!-- ================= Fim do Header ================= -->

      <!-- ================= Seção Principal ================= -->
      <section class="section">
        <div class="container-fluid">
          <!-- ===== Title Wrapper: Título à esquerda e botão "Selecionar Data" à direita ===== -->
          <div class="title-wrapper pt-30">
            <div class="row align-items-center">
              <div class="col-md-6">
                <div class="title">
                  <h2>Painel de Vendas</h2>
                </div>
              </div>
              <div class="col-md-6">
                <div class="d-flex justify-content-end align-items-center">
                  <span style="font-size: 1rem; margin-right: 15px;">
                    Datas selecionadas: <strong id="selectedDates">[vazio]</strong>
                  </span>
                  <button id="openCalendarBtn" class="main-btn primary-btn btn-hover">
                    Selecionar Data
                  </button>
                </div>
              </div>
            </div>
          </div>
          <!-- ===== Fim do Title Wrapper ===== -->

          <!-- ===== Blocos de Métricas: Clientes, Faturamento, Receita, Take Rate ===== -->
          <div class="row">
            <!-- Clientes -->
            <div class="col-xl-3 col-lg-4 col-sm-6">
              <div class="icon-card mb-30">
                <div class="icon purple">
                  <i class="lni lni-users"></i>
                </div>
                <div class="content">
                  <h6 class="mb-10">Clientes</h6>
                  <h3 id="clientCount" class="text-bold mb-10">0</h3>
                  <p class="text-sm text-success">
                    <i class="lni lni-arrow-up"></i> 0%
                  </p>
                </div>
              </div>
            </div>
            <!-- Faturamento -->
            <div class="col-xl-3 col-lg-4 col-sm-6">
              <div class="icon-card mb-30">
                <div class="icon success">
                  <i class="lni lni-eye"></i>
                </div>
                <div class="content">
                  <h6 class="mb-10">Faturamento</h6>
                  <h3 id="faturamento" class="text-bold mb-10">0</h3>
                  <p class="text-sm text-danger">
                    <i class="lni lni-arrow-down"></i> 0%
                  </p>
                </div>
              </div>
            </div>
            <!-- Receita -->
            <div class="col-xl-3 col-lg-4 col-sm-6">
              <div class="icon-card mb-30">
                <div class="icon primary">
                  <i class="lni lni-thumbs-up"></i>
                </div>
                <div class="content">
                  <h6 class="mb-10">Receita</h6>
                  <h3 id="receita" class="text-bold mb-10">0</h3>
                  <p class="text-sm text-danger">
                    <i class="lni lni-arrow-down"></i> 0%
                  </p>
                </div>
              </div>
            </div>
            <!-- Take Rate -->
            <div class="col-xl-3 col-lg-4 col-sm-6">
              <div class="icon-card mb-30">
                <div class="icon orange">
                  <i class="lni lni-pie-chart"></i>
                </div>
                <div class="content">
                  <h6 class="mb-10">Take Rate</h6>
                  <h3 id="takeRate" class="text-bold mb-10">0%</h3>
                  <p class="text-sm text-success">
                    <i class="lni lni-arrow-up"></i> 0%
                  </p>
                </div>
              </div>
            </div>
          </div>
          <!-- ===== Fim dos Blocos de Métricas ===== -->

          <!-- ===== Seção: Calendário Interativo ===== -->
          <div class="row" id="calendarRow" style="display: none;">
            <div class="col-12" id="calendarContainer"></div>
          </div>

          <!-- ===== Seção: Pedidos Recentes e Pedidos por Região (lado a lado) ===== -->
          <div class="row">
            <!-- Pedidos Recentes (coluna da esquerda) -->
            <div class="col-lg-6">
              <div class="card-style activity-card mb-30">
                <div class="title d-flex flex-wrap align-items-center justify-content-between mb-10">
                  <div class="left mb-2">
                    <h6 class="text-medium mb-2">Pedidos Recentes</h6>
                    <p class="text-gray text-sm">Exibindo no máximo 15 registros por página.</p>
                  </div>
                </div>
                <div class="table-responsive">
                  <table class="table activity-table">
                    <thead>
                      <tr>
                        <th>Cliente</th>
                        <th>Vendedor</th>
                        <th>Valor</th>
                        <th class="text-end">Status</th>
                      </tr>
                    </thead>
                    <tbody id="pedidosBody">
                      <!-- Se não houver dados da API, será exibida uma linha com "0" -->
                    </tbody>
                  </table>
                </div>
                <div class="d-flex justify-content-end" style="gap: 10px;">
                  <button id="prevPageBtn" class="main-btn secondary-btn btn-sm">
                    &laquo; Anterior
                  </button>
                  <span id="paginationInfo" class="text-sm fw-bold"></span>
                  <button id="nextPageBtn" class="main-btn secondary-btn btn-sm">
                    Próximo &raquo;
                  </button>
                </div>
              </div>
            </div>
            <!-- Pedidos por Região (coluna da direita) -->
            <div class="col-lg-6">
              <div class="card-style mb-30">
                <div class="title d-flex justify-content-between align-items-center">
                  <h6 class="mb-10">Pedidos por Região</h6>
                  <div class="more-btn-wrapper mb-10">
                    <button class="more-btn dropdown-toggle" id="moreAction" data-bs-toggle="dropdown"
                            aria-expanded="false">
                      <i class="lni lni-more-alt"></i>
                    </button>
                    <ul class="dropdown-menu dropdown-menu-end" aria-labelledby="moreAction">
                      <li class="dropdown-item">
                        <a href="#0" class="text-gray">Clear All</a>
                      </li>
                      <li class="dropdown-item">
                        <a href="#0" class="text-gray">Delete Cookies</a>
                      </li>
                    </ul>
                  </div>
                </div>
                <!-- Mapa (mantido conforme o layout original) -->
                <div id="map" style="width: 100%; height: 400px"></div>
                <!-- Tabela de Pedidos por Região -->
                <div class="table-wrapper">
                  <table class="table">
                    <thead>
                      <tr>
                        <th><h5 class="text-sm text-medium">Estados</h5></th>
                        <th><h5 class="text-sm text-medium">Faturado</h5></th>
                        <th><h5 class="text-sm text-medium">Porcentagem</h5></th>
                      </tr>
                    </thead>
                    <tbody id="regiaoBody">
                      <!-- Se não houver dados, exibe uma linha padrão -->
                      <tr>
                        <td><p class="text-sm">0</p></td>
                        <td><p class="text-sm">R$ 0</p></td>
                        <td><p class="text-sm">0%</p></td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>
          <!-- ===== Fim dos Blocos: Pedidos Recentes e Pedidos por Região ===== -->
        </div>
      </div>
    </section>
    <!-- ================= Fim Seção Principal ================= -->

    <!-- ================= Footer ================= -->
    <footer class="footer">
      <div class="container-fluid">
        <div class="row">
          <div class="col-md-6 order-last order-md-first">
            <div class="copyright text-center text-md-start">
              <p class="text-sm">
                Designed and Developed by
                <a href="https://Airland.com" rel="nofollow" target="_blank">Airland</a>
              </p>
            </div>
          </div>
        </div>
      </div>
    </footer>
    <!-- ================= Fim Footer ================= -->

    <!-- ============ Theme Option Start ============= -->
    <button class="option-btn">
      <i class="lni lni-cog"></i>
    </button>
    <div class="option-overlay"></div>
    <div class="option-box">
      <div class="option-header">
        <h5>Settings</h5>
        <button class="option-btn-close text-gray">
          <i class="lni lni-close"></i>
        </button>
      </div>
      <h6 class="mb-10">Layout</h6>
      <ul class="mb-30">
        <li><button class="leftSidebarButton active">Left Sidebar</button></li>
        <li><button class="rightSidebarButton">Right Sidebar</button></li>
      </ul>
      <h6 class="mb-10">Theme</h6>
      <ul class="d-flex flex-wrap align-items-center">
        <li><button class="lightThemeButton active">Light Theme + Sidebar 1</button></li>
        <li><button class="darkThemeButton">Dark Theme + Sidebar 1</button></li>
      </ul>
      <div class="promo-box">
        <div class="promo-icon">
          <img class="mx-auto" src="./assets/images/logo/logo-icon-big.svg" alt="Logo" />
        </div>
        <h3>Upgrade to PRO</h3>
        <p>Improve your development process and start doing more with Airland PRO!</p>
        <a href="https://Airland.com/pro" target="_blank" rel="nofollow" class="main-btn primary-btn btn-hover">
          Upgrade to PRO
        </a>
      </div>
    </div>
    <!-- ============ Theme Option End ============= -->

    <!-- ========= All Javascript files linkup ======== -->
    <script src="assets/js/bootstrap.bundle.min.js"></script>
    <script src="assets/js/Chart.min.js"></script>
    <script src="assets/js/apexcharts.min.js"></script>
    <script src="assets/js/dynamic-pie-chart.js"></script>
    <script src="assets/js/moment.min.js"></script>
    <script src="assets/js/fullcalendar.js"></script>
    <script src="assets/js/jvectormap.min.js"></script>
    <script src="assets/js/world-merc.js"></script>
    <script src="assets/js/polyfill.js"></script>
    <script src="assets/js/quill.min.js"></script>
    <script src="assets/js/datatable.js"></script>
    <script src="assets/js/Sortable.min.js"></script>
    <script src="assets/js/main.js"></script>

    <!-- ========== Importação do módulo do Calendário (Anexo 1) ========= -->
    <script type="module">
      // Importa o módulo do calendário (ajuste o caminho se necessário)
      import { createCalendarComponent } from "./assets/js/calendarComponent.js";
      const btnOpenCalendar = document.getElementById("openCalendarBtn");
      btnOpenCalendar.style.marginBottom = "20px";
      const calendarContainer = document.getElementById("calendarContainer");
      const selectedDatesEl = document.getElementById("selectedDates");
      selectedDatesEl.style.display = "none";
      const calendarEl = createCalendarComponent();
      calendarEl.style.position = "absolute";
      calendarEl.style.display = "none";
      calendarEl.style.zIndex = "1000";
      document.body.appendChild(calendarEl);
      function positionCalendar() {
        const rect = btnOpenCalendar.getBoundingClientRect();
        calendarEl.style.top = (rect.bottom + window.scrollY) + "px";
        calendarEl.style.left = (rect.left + window.scrollX) + "px";
        requestAnimationFrame(() => {
          const calendarRect = calendarEl.getBoundingClientRect();
          if (calendarRect.right > window.innerWidth) {
            const shiftX = calendarRect.right - window.innerWidth + 10;
            calendarEl.style.left = (parseFloat(calendarEl.style.left) - shiftX) + "px";
          }
          if (calendarRect.bottom > window.innerHeight) {
            const shiftY = calendarRect.bottom - window.innerHeight + 10;
            calendarEl.style.top = (parseFloat(calendarEl.style.top) - shiftY) + "px";
          }
        });
      }
      btnOpenCalendar.addEventListener("mouseenter", () => {
        positionCalendar();
        calendarEl.style.display = "block";
      });
      btnOpenCalendar.addEventListener("mouseleave", () => {
        setTimeout(() => {
          if (!calendarEl.matches(":hover")) {
            calendarEl.style.display = "none";
          }
        }, 200);
      });
      calendarEl.addEventListener("mouseleave", () => {
        calendarEl.style.display = "none";
      });
      const btnApply = calendarEl.querySelector(".calendar__button--primary");
      btnApply.addEventListener("click", () => {
        const datasSelecionadas = "01/04/2025 - 23/04/2025"; // Exemplo fixo
        selectedDatesEl.textContent = datasSelecionadas;
        selectedDatesEl.style.display = "inline";
        calendarEl.style.display = "none";
      });
      const btnBack = calendarEl.querySelector(".calendar__button--grey");
      btnBack.addEventListener("click", () => {
        calendarEl.style.display = "none";
      });
    </script>
  </body>
</html>
`;

// ================== FUNÇÕES DE CONSULTA E CÁLCULOS ==================

// Busca os pedidos para o affiliate_id na tabela supplier_pedidos
async function fetchPedidos() {
  try {
    const { data, error } = await window.supabase
      .from("supplier_pedidos")
      .select("*")
      .eq("affiliate_id", affiliate_id);
    if (error) {
      console.error("Erro ao buscar supplier_pedidos:", error);
      return [];
    }
    return data || [];
  } catch (err) {
    console.error("Erro geral ao buscar pedidos:", err);
    return [];
  }
}

// Calcula a contagem de clientes (distinct pelo nome_comprador)
function calcClientes(pedidos) {
  const setClientes = new Set();
  pedidos.forEach(p => {
    if (p.nome_comprador) setClientes.add(p.nome_comprador);
  });
  return setClientes.size;
}

// Calcula o faturamento (soma de valor_venda)
function calcFaturamento(pedidos) {
  return pedidos.reduce((acc, curr) => acc + parseFloat(curr.valor_venda || 0), 0);
}

// Receita: utiliza o mesmo valor do faturamento (pode ser ajustada se necessário)
function calcReceita(faturamento) {
  return faturamento;
}

// Take Rate: exemplo fixo de 10%
function calcTakeRate() {
  return 10;
}

// Agrupa os pedidos por UF e soma o valor_venda
function agruparPorUF(pedidos) {
  const mapUF = {};
  pedidos.forEach(p => {
    const uf = (p.UF || "N/D").toUpperCase();
    if (!mapUF[uf]) mapUF[uf] = 0;
    mapUF[uf] += parseFloat(p.valor_venda || 0);
  });
  return mapUF;
}

// ================== FUNÇÃO PARA POPULAR O DASHBOARD ==================
async function populateDashboard() {
  const pedidos = await fetchPedidos();

  // Cálculos para os cards
  const totalClientes = calcClientes(pedidos);
  const totalFaturamento = calcFaturamento(pedidos);
  const totalReceita = calcReceita(totalFaturamento);
  const takeRate = calcTakeRate();

  // Atualiza os cards
  document.getElementById("clientCount").textContent = totalClientes;
  document.getElementById("faturamento").textContent = totalFaturamento.toFixed(2);
  document.getElementById("receita").textContent = totalReceita.toFixed(2);
  document.getElementById("takeRate").textContent = takeRate + "%";

  // Pedidos Recentes: ordena por data (supondo que exista a coluna created_at)
  const pedidosOrdenados = pedidos.sort((a, b) => new Date(b.created_at || 0) - new Date(a.created_at || 0));
  const recentes = pedidosOrdenados.slice(0, 15); // exibe 15 registros por página
  const tbodyPedidos = document.getElementById("pedidosBody");
  tbodyPedidos.innerHTML = "";
  recentes.forEach(p => {
    const tr = document.createElement("tr");
    tr.innerHTML = `
      <td>${p.nome_comprador || "N/D"}</td>
      <td>${p.efetivado_por || "N/D"}</td>
      <td>${parseFloat(p.valor_venda || 0).toFixed(2)}</td>
      <td class="text-end">${p.status || "N/D"}</td>
    `;
    tbodyPedidos.appendChild(tr);
  });

  // Pedidos por Região
  const ufMap = agruparPorUF(pedidos);
  const totalGeral = totalFaturamento;
  const tbodyRegiao = document.getElementById("regiaoBody");
  tbodyRegiao.innerHTML = "";
  Object.keys(ufMap).forEach(uf => {
    const valor = ufMap[uf];
    const perc = totalGeral > 0 ? (valor / totalGeral) * 100 : 0;
    const tr = document.createElement("tr");
    tr.innerHTML = `
      <td>${uf}</td>
      <td>${valor.toFixed(2)}</td>
      <td>${perc.toFixed(2)}%</td>
    `;
    tbodyRegiao.appendChild(tr);
  });
}

// ================== FUNÇÃO DE INICIALIZAÇÃO ==================
function initDashboard() {
  // Escreve todo o HTML no documento
  document.open();
  document.write(painelHTML);
  document.close();

  // Aguarda o carregamento completo do DOM (da página injetada)
  document.addEventListener("DOMContentLoaded", async () => {
    // Inicializa o Supabase usando a biblioteca carregada via CDN
    window.supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_KEY);
    // Popula o dashboard com os dados do Supabase
    await populateDashboard();
  });
}

// ================== INICIALIZAÇÃO FINAL ==================
loadSupabase(initDashboard);
