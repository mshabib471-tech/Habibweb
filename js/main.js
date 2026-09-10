// Shared optional UI helpers. All DOM lookups are guarded so this file can be
// safely included on pages that do not use every component.
(function () {
  'use strict';

  if (window.feather && typeof window.feather.replace === 'function') {
    window.feather.replace();
  }

  const themeToggleBtn = document.getElementById('theme-toggle');
  const themeToggleDarkIcon = document.getElementById('theme-toggle-dark-icon');
  const themeToggleLightIcon = document.getElementById('theme-toggle-light-icon');

  function applyTheme(theme) {
    const dark = theme === 'dark';
    document.documentElement.classList.toggle('dark', dark);
    if (themeToggleDarkIcon) themeToggleDarkIcon.classList.toggle('hidden', dark);
    if (themeToggleLightIcon) themeToggleLightIcon.classList.toggle('hidden', !dark);
  }

  const storedTheme = localStorage.getItem('color-theme');
  const systemDark = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
  applyTheme(storedTheme || (systemDark ? 'dark' : 'light'));

  if (themeToggleBtn) {
    themeToggleBtn.addEventListener('click', function () {
      const next = document.documentElement.classList.contains('dark') ? 'light' : 'dark';
      localStorage.setItem('color-theme', next);
      applyTheme(next);
    });
  }

  const header = document.getElementById('main-header');
  if (header) {
    const updateHeader = function () {
      if (window.scrollY > 20) {
        header.classList.add('shadow-md', 'py-3');
        header.classList.remove('py-5');
      } else {
        header.classList.add('py-5');
        header.classList.remove('shadow-md', 'py-3');
      }
    };
    window.addEventListener('scroll', updateHeader, { passive: true });
    updateHeader();
  }

  const menuBtn = document.getElementById('mobile-menu-btn');
  const mobileMenu = document.getElementById('mobile-menu');
  let isMenuOpen = false;

  function closeMobileMenu() {
    if (!menuBtn || !mobileMenu) return;
    isMenuOpen = false;
    mobileMenu.classList.add('hidden');
    menuBtn.innerHTML = '<i data-feather="menu" class="w-6 h-6"></i>';
    if (window.feather) window.feather.replace();
  }

  window.closeMobileMenu = closeMobileMenu;

  if (menuBtn && mobileMenu) {
    menuBtn.addEventListener('click', function () {
      isMenuOpen = !isMenuOpen;
      mobileMenu.classList.toggle('hidden', !isMenuOpen);
      menuBtn.innerHTML = isMenuOpen
        ? '<i data-feather="x" class="w-6 h-6"></i>'
        : '<i data-feather="menu" class="w-6 h-6"></i>';
      if (window.feather) window.feather.replace();
    });
  }

  window.toggleAccordion = window.toggleAccordion || function (element) {
    if (!element) return;
    const content = element.querySelector('.acc-content');
    const icon = element.querySelector('.acc-icon');
    if (!content) return;
    const shouldOpen = content.classList.contains('hidden');

    document.querySelectorAll('.accordion-item').forEach(function (item) {
      const itemContent = item.querySelector('.acc-content');
      const itemIcon = item.querySelector('.acc-icon');
      if (itemContent) itemContent.classList.add('hidden');
      if (itemIcon) itemIcon.classList.remove('rotate-180');
    });

    if (shouldOpen) {
      content.classList.remove('hidden');
      if (icon) icon.classList.add('rotate-180');
    }
  };
})();
