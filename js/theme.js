// Habib iFix .Tech Global UI Controller
// Permanent Pure Dark Mode (Black Theme) + Bulletproof Mobile & Desktop Menu
(function() {
  // Always enforce dark mode as requested: "only black mood raken"
  function enforcePureDarkMode() {
    const root = document.documentElement;
    const body = document.body;
    
    root.classList.remove('theme-light');
    root.classList.add('dark');
    
    if (body) {
      body.classList.remove('light-mode');
      body.classList.add('dark-mode');
    }
    
    localStorage.setItem('habib_theme', 'dark');
  }

  // Execute immediately
  enforcePureDarkMode();

  // Global Safe HTML Escape
  window.escapeHtml = function(text) {
    if (!text) return '';
    return String(text).replace(/[&<>"']/g, function(m) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#039;' }[m];
    });
  };

  // Bulletproof Universal Menu Toggle (Desktop & Mobile 3-line bar)
  window.toggleMobileMenu = function(e) {
    if (e) {
      if (e.stopPropagation) e.stopPropagation();
    }
    const menu = document.getElementById('mobileMenu');
    const icon = document.getElementById('mobileMenuIcon');
    if (!menu) return;
    
    const isHidden = menu.classList.contains('hidden') || menu.style.display === 'none';
    if (isHidden) {
      menu.classList.remove('hidden');
      menu.style.display = 'block';
      if (icon) {
        icon.classList.remove('fa-bars');
        icon.classList.add('fa-xmark');
      }
    } else {
      menu.classList.add('hidden');
      menu.style.display = 'none';
      if (icon) {
        icon.classList.remove('fa-xmark');
        icon.classList.add('fa-bars');
      }
    }
  };

  // Close Promo Banner
  window.closePromoBanner = function() {
    const banner = document.getElementById('topPromoBanner');
    if (banner) {
      banner.style.transition = 'all 0.25s ease';
      banner.style.opacity = '0';
      banner.style.maxHeight = '0';
      banner.style.overflow = 'hidden';
      banner.style.paddingTop = '0';
      banner.style.paddingBottom = '0';
      setTimeout(() => {
        banner.style.display = 'none';
      }, 250);
    }
    sessionStorage.setItem('habib_promo_dismissed', 'true');
  };

  // Language Manager
  let currentLang = localStorage.getItem('habib_lang') || 'en';
  window.applyLanguage = function(lang) {
    currentLang = lang;
    localStorage.setItem('habib_lang', lang);
    const btn = document.getElementById('langSwitchBtn');
    if (btn) {
      btn.innerHTML = `<i class="fa-solid fa-globe text-cyan-400 text-xs"></i> <span class="hidden sm:inline font-bold">${lang === 'en' ? 'বাংলা (BAN)' : 'English (ENG)'}</span><span class="sm:hidden font-extrabold">${lang === 'en' ? 'বাংলা' : 'EN'}</span>`;
    }
    document.querySelectorAll('[data-en]').forEach(el => {
      const text = el.getAttribute(`data-${lang}`);
      if (text) {
        if (el.tagName === 'INPUT' || el.tagName === 'TEXTAREA') {
          el.placeholder = text;
        } else {
          el.innerText = text;
        }
      }
    });
  };

  window.toggleLanguage = function() {
    window.applyLanguage(currentLang === 'en' ? 'bn' : 'en');
  };

  // Active Menu Link Highlighter
  function highlightCurrentMenuLink() {
    const currentPath = window.location.pathname.split('/').pop() || 'index.html';
    
    document.querySelectorAll('.glass-nav nav a, #mobileMenu a').forEach(a => {
      const href = a.getAttribute('href');
      if (href && (href === currentPath || (currentPath === '' && href === 'index.html'))) {
        if (!a.classList.contains('bg-indigo-600') && !a.classList.contains('text-cyan-400')) {
          a.classList.add('text-indigo-400', 'font-bold');
        }
      }
    });
  }

  document.addEventListener('DOMContentLoaded', () => {
    enforcePureDarkMode();
    window.applyLanguage(currentLang);
    highlightCurrentMenuLink();

    // Check if promo banner was dismissed
    if (sessionStorage.getItem('habib_promo_dismissed') === 'true') {
      const banner = document.getElementById('topPromoBanner');
      if (banner) banner.style.display = 'none';
    }

    // Auto-close mobile drawer when any link is clicked
    const mobileMenu = document.getElementById('mobileMenu');
    if (mobileMenu) {
      mobileMenu.querySelectorAll('a, button').forEach(link => {
        link.addEventListener('click', () => {
          if (!link.classList.contains('theme-toggle-btn')) {
            mobileMenu.classList.add('hidden');
            const icon = document.getElementById('mobileMenuIcon');
            if (icon) {
              icon.classList.remove('fa-xmark');
              icon.classList.add('fa-bars');
            }
          }
        });
      });
    }

    // Close menu when clicking outside (safe check)
    document.addEventListener('click', (e) => {
      const menu = document.getElementById('mobileMenu');
      const isToggleBtn = e.target.closest('[onclick*="toggleMobileMenu"]') || e.target.closest('.menu-toggle-btn') || e.target.closest('#mobileMenuIcon');
      if (isToggleBtn) return;
      if (menu && !menu.classList.contains('hidden')) {
        if (!menu.contains(e.target)) {
          menu.classList.add('hidden');
          const icon = document.getElementById('mobileMenuIcon');
          if (icon) {
            icon.classList.remove('fa-xmark');
            icon.classList.add('fa-bars');
          }
        }
      }
    });

    // Close promo banner buttons
    document.querySelectorAll('.close-promo-btn, #closePromoBtn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.preventDefault();
        window.closePromoBanner();
      });
    });

    // Record page visit for analytics ("site koi jon visit korce")
    try {
      const currentPath = window.location.pathname.split('/').pop() || 'index.html';
      if (!currentPath.includes('admin')) {
        fetch('/api/record-visit', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ path: currentPath })
        }).catch(() => {});
      }
    } catch(e) {}
  });
})();
