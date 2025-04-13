// assets/js/main.js

document.addEventListener('DOMContentLoaded', function () {
  /* ========= Preloader ======== */
  const preloader = document.querySelector('#preloader'); // Assumindo que é um único elemento
  window.addEventListener('load', function () {
    if (preloader) {
      preloader.style.display = 'none';
    }
  });

  /* ========= Add Box Shadow in Header on Scroll ======== */
  window.addEventListener('scroll', function () {
    const header = document.querySelector('.header');
    if (header) {
      if (window.scrollY > 0) {
        header.style.boxShadow = '0px 0px 30px 0px rgba(200, 208, 216, 0.30)';
      } else {
        header.style.boxShadow = 'none';
      }
    }
  });

  /* ========= Sidebar Toggle ======== */
  const sidebarNavWrapper = document.querySelector('.sidebar-nav-wrapper');
  const mainWrapper = document.querySelector('.main-wrapper');
  const menuToggleButton = document.querySelector('#menu-toggle');
  const menuToggleButtonIcon = document.querySelector('#menu-toggle i');
  const overlay = document.querySelector('.overlay');

  if (menuToggleButton && sidebarNavWrapper && mainWrapper && overlay && menuToggleButtonIcon) {
    menuToggleButton.addEventListener('click', () => {
      sidebarNavWrapper.classList.toggle('active');
      overlay.classList.add('active');
      mainWrapper.classList.toggle('active');

      if (document.body.clientWidth > 1200) {
        if (menuToggleButtonIcon.classList.contains('lni-chevron-left')) {
          menuToggleButtonIcon.classList.remove('lni-chevron-left');
          menuToggleButtonIcon.classList.add('lni-menu');
        } else {
          menuToggleButtonIcon.classList.remove('lni-menu');
          menuToggleButtonIcon.classList.add('lni-chevron-left');
        }
      } else {
        if (menuToggleButtonIcon.classList.contains('lni-chevron-left')) {
          menuToggleButtonIcon.classList.remove('lni-chevron-left');
          menuToggleButtonIcon.classList.add('lni-menu');
        }
      }
    });

    overlay.addEventListener('click', () => {
      sidebarNavWrapper.classList.remove('active');
      overlay.classList.remove('active');
      mainWrapper.classList.remove('active');
    });
  }

  // ========== Theme Switcher ==========
  const optionButton = document.querySelector('.option-btn');
  const optionButtonClose = document.querySelector('.option-btn-close');
  const optionBox = document.querySelector('.option-box');
  const optionOverlay = document.querySelector('.option-overlay');

  if (optionButton && optionButtonClose && optionBox && optionOverlay) {
    optionButton.addEventListener('click', () => {
      optionBox.classList.add('show');
      optionOverlay.classList.add('show');
    });
    optionButtonClose.addEventListener('click', () => {
      optionBox.classList.remove('show');
      optionOverlay.classList.remove('show');
    });
    optionOverlay.addEventListener('click', () => {
      optionBox.classList.remove('show');
      optionOverlay.classList.remove('show');
    });
  }

  // ========== Layout Change ==========
  const leftSidebarButton = document.querySelector('.leftSidebarButton');
  const rightSidebarButton = document.querySelector('.rightSidebarButton');
  const dropdownMenuEnd = document.querySelectorAll('.header-right .dropdown-menu');

  if (rightSidebarButton && leftSidebarButton) {
    rightSidebarButton.addEventListener('click', () => {
      document.body.classList.add('rightSidebar');
      rightSidebarButton.classList.add('active');
      leftSidebarButton.classList.remove('active');

      dropdownMenuEnd.forEach((el) => {
        el.classList.remove('dropdown-menu-end');
      });
    });
    leftSidebarButton.addEventListener('click', () => {
      document.body.classList.remove('rightSidebar');
      leftSidebarButton.classList.add('active');
      rightSidebarButton.classList.remove('active');

      dropdownMenuEnd.forEach((el) => {
        el.classList.add('dropdown-menu-end');
      });
    });
  }

  // ========== Theme Change ==========
  const lightThemeButton = document.querySelector('.lightThemeButton');
  const darkThemeButton = document.querySelector('.darkThemeButton');
  const logo = document.querySelector('.navbar-logo img');

  if (lightThemeButton && darkThemeButton && logo) {
    // Verifica a preferência de tema do usuário
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme === 'dark') {
      document.body.classList.add('darkTheme');
      darkThemeButton.classList.add('active');
      lightThemeButton.classList.remove('active');
      logo.src = 'assets/images/logo/logo-white.svg';
    } else {
      document.body.classList.remove('darkTheme');
      lightThemeButton.classList.add('active');
      darkThemeButton.classList.remove('active');
      logo.src = 'assets/images/logo/logo.svg';
    }

    darkThemeButton.addEventListener('click', () => {
      document.body.classList.add('darkTheme');
      localStorage.setItem('theme', 'dark');
      darkThemeButton.classList.add('active');
      lightThemeButton.classList.remove('active');
      logo.src = 'assets/images/logo/logo-white.svg';
    });

    lightThemeButton.addEventListener('click', () => {
      document.body.classList.remove('darkTheme');
      localStorage.setItem('theme', 'light');
      lightThemeButton.classList.add('active');
      darkThemeButton.classList.remove('active');
      logo.src = 'assets/images/logo/logo.svg';
    });
  }

  // ========== Enabling Bootstrap Tooltips ==========
  const tooltipTriggerList = document.querySelectorAll('[data-bs-toggle="tooltip"]');
  const tooltipList = Array.from(tooltipTriggerList).map(
    (tooltipTriggerEl) => new bootstrap.Tooltip(tooltipTriggerEl)
  );
});
