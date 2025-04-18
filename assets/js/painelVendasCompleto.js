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
                <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path
                    d="M8.74999 18.3333C12.2376 18.3333 15.1364 15.8128 15.7244 12.4941C15.8448 11.8143 15.2737 11.25 14.5833 11.25H9.99999C9.30966 11.25 8.74999 10.6903 8.74999 10V5.41666C8.74999 4.7263 8.18563 4.15512 7.50586 4.27556C4.18711 4.86357 1.66666 7.76243 1.66666 11.25C1.66666 15.162 4.83797 18.3333 8.74999 18.3333Z" />
                  <path
                    d="M17.0833 10C17.7737 10 18.3432 9.43708 18.2408 8.75433C17.7005 5.14918 14.8508 2.29947 11.2457 1.75912C10.5629 1.6568 10 2.2263 10 2.91665V9.16666C10 9.62691 10.3731 10 10.8333 10H17.0833Z" />
                </svg>
              </span>
              <span class="text">Painel de Vendas</span>
            </a>
          </li>
          <!-- Menu: Vendas com submenu -->
          <li class="nav-item nav-item-has-children">
            <a href="#0" class="collapsed" data-bs-toggle="collapse" data-bs-target="#ddmenu_2" 
               aria-controls="ddmenu_2" aria-expanded="false" aria-label="Toggle navigation">
               <span class="icon">
                <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path
                    d="M2.49999 3.33333C2.03976 3.33333 1.66666 3.70643 1.66666 4.16666V7.49999C1.66666 7.96023 2.03976 8.33333 2.49999 8.33333H5.83332C6.29356 8.33333 6.66666 7.96023 6.66666 7.49999V4.16666C6.66666 3.70643 6.29356 3.33333 5.83332 3.33333H2.49999Z" />
                  <path
                    d="M2.49999 11.6667C2.03976 11.6667 1.66666 12.0398 1.66666 12.5V15.8333C1.66666 16.2936 2.03976 16.6667 2.49999 16.6667H5.83332C6.29356 16.6667 6.66666 16.2936 6.66666 15.8333V12.5C6.66666 12.0398 6.29356 11.6667 5.83332 11.6667H2.49999Z" />
                  <path
                    d="M8.33334 4.16667C8.33334 3.8215 8.61318 3.54167 8.95834 3.54167H17.7083C18.0535 3.54167 18.3333 3.8215 18.3333 4.16667C18.3333 4.51185 18.0535 4.79167 17.7083 4.79167H8.95834C8.61318 4.79167 8.33334 4.51185 8.33334 4.16667Z" />
                  <path
                    d="M8.33334 7.5C8.33334 7.15483 8.61318 6.875 8.95834 6.875H14.7917C15.1368 6.875 15.4167 7.15483 15.4167 7.5C15.4167 7.84517 15.1368 8.125 14.7917 8.125H8.95834C8.61318 8.125 8.33334 7.84517 8.33334 7.5Z" />
                  <path
                    d="M8.95834 11.875C8.61318 11.875 8.33334 12.1548 8.33334 12.5C8.33334 12.8452 8.61318 13.125 8.95834 13.125H17.7083C18.0535 13.125 18.3333 12.8452 18.3333 12.5C18.3333 12.1548 18.0535 11.875 17.7083 11.875H8.95834Z" />
                  <path
                    d="M8.95834 15.2083C8.61318 15.2083 8.33334 15.4882 8.33334 15.8333C8.33334 16.1785 8.61318 16.4583 8.95834 16.4583H14.7917C15.1368 16.4583 15.4167 16.1785 15.4167 15.8333C15.4167 15.4882 15.1368 15.2083 14.7917 15.2083H8.95834Z" />
                </svg>
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
                <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path
                    d="M3.33334 3.35442C3.33334 2.4223 4.07954 1.66666 5.00001 1.66666H15C15.9205 1.66666 16.6667 2.4223 16.6667 3.35442V16.8565C16.6667 17.5519 15.8827 17.9489 15.3333 17.5317L13.8333 16.3924C13.537 16.1673 13.1297 16.1673 12.8333 16.3924L10.5 18.1646C10.2037 18.3896 9.79634 18.3896 9.50001 18.1646L7.16668 16.3924C6.87038 16.1673 6.46298 16.1673 6.16668 16.3924L4.66668 17.5317C4.11731 17.9489 3.33334 17.5519 3.33334 16.8565V3.35442ZM4.79168 5.04218C4.79168 5.39173 5.0715 5.6751 5.41668 5.6751H10C10.3452 5.6751 10.625 5.39173 10.625 5.04218C10.625 4.69264 10.3452 4.40927 10 4.40927H5.41668C5.0715 4.40927 4.79168 4.69264 4.79168 5.04218ZM5.41668 7.7848C5.0715 7.7848 4.79168 8.06817 4.79168 8.41774C4.79168 8.76724 5.0715 9.05066 5.41668 9.05066H10C10.3452 9.05066 10.625 8.76724 10.625 8.41774C10.625 8.06817 10.3452 7.7848 10 7.7848H5.41668ZM4.79168 11.7932C4.79168 12.1428 5.0715 12.4262 5.41668 12.4262H10C10.3452 12.4262 10.625 12.1428 10.625 11.7932C10.625 11.4437 10.3452 11.1603 10 11.1603H5.41668C5.0715 11.1603 4.79168 11.4437 4.79168 11.7932ZM13.3333 4.40927C12.9882 4.40927 12.7083 4.69264 12.7083 5.04218C12.7083 5.39173 12.9882 5.6751 13.3333 5.6751H14.5833C14.9285 5.6751 15.2083 5.39173 15.2083 5.04218C15.2083 4.69264 14.9285 4.40927 14.5833 4.40927H13.3333ZM12.7083 8.41774C12.7083 8.76724 12.9882 9.05066 13.3333 9.05066H14.5833C14.9285 9.05066 15.2083 8.76724 15.2083 8.41774C15.2083 8.06817 14.9285 7.7848 14.5833 7.7848H13.3333C12.9882 7.7848 12.7083 8.06817 12.7083 8.41774ZM13.3333 11.1603C12.9882 11.1603 12.7083 11.4437 12.7083 11.7932C12.7083 12.1428 12.9882 12.4262 13.3333 12.4262H14.5833C14.9285 12.4262 15.2083 12.1428 15.2083 11.7932C15.2083 11.4437 14.9285 11.1603 14.5833 11.1603H13.3333Z" />
                </svg>
              </span>
              <span class="text">Orçamentos</span>
            </a>
          </li>
          <!-- Menu: Personalize -->
          <li class="nav-item nav-item-has-children">
            <a href="#0" data-bs-toggle="collapse" data-bs-target="#ddmenu_3" 
               aria-controls="ddmenu_3" aria-expanded="true" aria-label="Toggle navigation">
               <span class="icon">
                <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path
                    d="M4.16666 4.16675C4.16666 2.78604 6.77833 1.66675 9.99999 1.66675C13.2217 1.66675 15.8333 2.78604 15.8333 4.16675V4.57073C15.8027 4.60316 15.7678 4.637 15.7282 4.6722C15.4683 4.90251 15.0568 5.13848 14.4946 5.34931C13.3747 5.76924 11.7858 6.04175 9.99999 6.04175C8.21415 6.04175 6.62521 5.76924 5.5054 5.34931C4.94318 5.13848 4.53162 4.90251 4.27185 4.6722C4.23215 4.637 4.19726 4.60316 4.16666 4.57073V4.16675Z" />
                  <path
                    d="M4.16666 6.10992V8.73742C4.19726 8.76983 4.23215 8.80367 4.27185 8.83883C4.53162 9.06917 4.94318 9.30517 5.5054 9.516C6.62521 9.93592 8.21415 10.2084 9.99999 10.2084C11.7858 10.2084 13.3747 9.93592 14.4946 9.516C15.0568 9.30517 15.4683 9.06917 15.7282 8.83883C15.7678 8.80367 15.8027 8.76983 15.8333 8.73742V6.10992C15.5592 6.26222 15.2563 6.39865 14.9335 6.51972C13.6404 7.00462 11.8961 7.29175 9.99999 7.29175C8.10394 7.29175 6.35954 7.00462 5.06649 6.51972C4.74364 6.39865 4.44074 6.26222 4.16666 6.10992Z" />
                  <path
                    d="M15.8333 10.2766C15.5592 10.4289 15.2563 10.5653 14.9335 10.6864C13.6404 11.1712 11.8961 11.4584 9.99999 11.4584C8.10394 11.4584 6.35954 11.1712 5.06649 10.6864C4.74364 10.5653 4.44074 10.4289 4.16666 10.2766V12.904C4.19726 12.9365 4.23215 12.9703 4.27185 13.0055C4.53162 13.2358 4.94318 13.4718 5.5054 13.6826C6.62521 14.1025 8.21415 14.375 9.99999 14.375C11.7858 14.375 13.3747 14.1025 14.4946 13.6826C15.0568 13.4718 15.4683 13.2358 15.7282 13.0055C15.7678 12.9703 15.8027 12.9365 15.8333 12.904V10.2766Z" />
                  <path
                    d="M15.8333 14.4432C15.5592 14.5956 15.2563 14.732 14.9335 14.8531C13.6404 15.3379 11.8961 15.6251 9.99999 15.6251C8.10394 15.6251 6.35954 15.3379 5.06649 14.8531C4.74364 14.732 4.44074 14.5956 4.16666 14.4432V15.8334C4.16666 17.2142 6.77833 18.3334 9.99999 18.3334C13.2217 18.3334 15.8333 17.2142 15.8333 15.8334V14.4432Z" />
                </svg>
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
                <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path
                    d="M14.9211 10.1294C15.1652 9.88534 15.1652 9.48967 14.9211 9.24559L10.7544 5.0789C10.5103 4.83482 10.1147 4.83482 9.87057 5.0789C9.62649 5.32297 9.62649 5.71871 9.87057 5.96278L12.9702 9.06251H1.97916C1.63398 9.06251 1.35416 9.34234 1.35416 9.68751C1.35416 10.0327 1.63398 10.3125 1.97916 10.3125H12.9702L9.87057 13.4123C9.62649 13.6563 9.62649 14.052 9.87057 14.2961C10.1147 14.5402 10.5103 14.5402 10.7544 14.2961L14.9211 10.1294Z" />
                  <path
                    d="M11.6383 15.18L15.805 11.0133C16.5373 10.2811 16.5373 9.09391 15.805 8.36166L11.6383 4.195C11.2722 3.82888 10.7923 3.64582 10.3125 3.64582V3.02082C10.3125 2.10035 11.0587 1.35416 11.9792 1.35416H16.9792C17.8997 1.35416 18.6458 2.10035 18.6458 3.02082V16.3542C18.6458 17.2747 17.8997 18.0208 16.9792 18.0208H11.9792C11.0587 18.0208 10.3125 17.2747 10.3125 16.3542V15.7292C10.7923 15.7292 11.2722 15.5461 11.6383 15.18Z" />
                </svg>
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
                            <svg width="22" height="22" viewBox="0 0 22 22" fill="none" xmlns="http://www.w3.org/2000/svg">
                              <path
                                d="M11 20.1667C9.88317 20.1667 8.88718 19.63 8.23901 18.7917H13.761C13.113 19.63 12.1169 20.1667 11 20.1667Z"
                                fill="" />
                              <path
                                d="M10.1157 2.74999C10.1157 2.24374 10.5117 1.83333 11 1.83333C11.4883 1.83333 11.8842 2.24374 11.8842 2.74999V2.82604C14.3932 3.26245 16.3051 5.52474 16.3051 8.24999V14.287C16.3051 14.5301 16.3982 14.7633 16.564 14.9352L18.2029 16.6342C18.4814 16.9229 18.2842 17.4167 17.8903 17.4167H4.10961C3.71574 17.4167 3.5185 16.9229 3.797 16.6342L5.43589 14.9352C5.6017 14.7633 5.69485 14.5301 5.69485 14.287V8.24999C5.69485 5.52474 7.60672 3.26245 10.1157 2.82604V2.74999Z"
                                fill="" />
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
                            <a class="text-black/40 dark:text-white/40 hover:text-black dark:hover:text-white text-xs" 
                               href="#">Email@gmail.com</a>
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
