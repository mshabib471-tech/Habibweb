// Shared optional UI helpers. All DOM lookups are guarded so this file can be
// safely included on pages that do not use every component.
(function () {
  'use strict';

  if (window.feather && typeof window.feather.replace === 'function') {
    window.feather.replace();
  }

  // Force Light Theme Only
  function applyTheme() {
    document.documentElement.classList.remove('dark');
    document.documentElement.setAttribute('data-theme', 'light');
    if (document.body) {
      document.body.classList.remove('dark-mode');
      document.body.classList.add('light-mode');
    }
  }

  applyTheme();

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
