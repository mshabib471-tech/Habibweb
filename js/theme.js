// Habib iFix .Tech Global Dual-Theme & Luxury Sidebar Controller
(function() {
  // Theme Management
  window.setSiteTheme = function(theme) {
    const isDark = theme === 'dark';
    document.documentElement.classList.toggle('dark', isDark);
    document.documentElement.setAttribute('data-theme', isDark ? 'dark' : 'light');
    if (document.body) {
      document.body.classList.toggle('dark-mode', isDark);
      document.body.classList.toggle('light-mode', !isDark);
    }
    localStorage.setItem('habib_theme', isDark ? 'dark' : 'light');
    updateThemeToggleUI(isDark);
  };

  window.toggleTheme = function() {
    const currentTheme = localStorage.getItem('habib_theme') || 'dark';
    const nextTheme = currentTheme === 'dark' ? 'light' : 'dark';
    window.setSiteTheme(nextTheme);
  };

  function updateThemeToggleUI(isDark) {
    const darkBtns = document.querySelectorAll('#themeBtnDark, .btn-theme-dark');
    const lightBtns = document.querySelectorAll('#themeBtnLight, .btn-theme-light');

    darkBtns.forEach(btn => {
      if (isDark) {
        btn.classList.add('bg-[#282d3c]', 'text-white', 'shadow-sm', 'font-extrabold');
        btn.classList.remove('text-slate-400', 'text-slate-500');
      } else {
        btn.classList.remove('bg-[#282d3c]', 'text-white', 'shadow-sm', 'font-extrabold');
        btn.classList.add('text-slate-400');
      }
    });

    lightBtns.forEach(btn => {
      if (!isDark) {
        btn.classList.add('bg-white', 'text-slate-900', 'shadow-sm', 'font-extrabold');
        btn.classList.remove('text-slate-400', 'text-slate-500');
      } else {
        btn.classList.remove('bg-white', 'text-slate-900', 'shadow-sm', 'font-extrabold');
        btn.classList.add('text-slate-400');
      }
    });
  }

  function initTheme() {
    const savedTheme = localStorage.getItem('habib_theme') || 'dark';
    const isDark = savedTheme === 'dark';
    document.documentElement.classList.toggle('dark', isDark);
    document.documentElement.setAttribute('data-theme', isDark ? 'dark' : 'light');
    if (document.body) {
      document.body.classList.toggle('dark-mode', isDark);
      document.body.classList.toggle('light-mode', !isDark);
    }
    updateThemeToggleUI(isDark);
  }

  // Execute immediately to prevent flash of wrong theme
  try {
    const saved = localStorage.getItem('habib_theme') || 'dark';
    const dark = saved === 'dark';
    document.documentElement.classList.toggle('dark', dark);
    document.documentElement.setAttribute('data-theme', dark ? 'dark' : 'light');
  } catch(e) {}

  // Universal HTML Escape
  window.escapeHtml = function(text) {
    if (!text) return '';
    return String(text).replace(/[&<>"']/g, function(m) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#039;' }[m];
    });
  };

  // Luxury Sidebar Toggle (Mobile & Desktop)
  window.toggleSidebar = function() {
    const sidebar = document.getElementById('sidebar');
    const backdrop = document.getElementById('sidebarBackdrop');
    if (!sidebar) return;
    
    const isHidden = sidebar.classList.contains('-translate-x-full');
    if (isHidden) {
      sidebar.classList.remove('-translate-x-full');
      sidebar.classList.add('translate-x-0');
      if (backdrop) backdrop.classList.remove('hidden');
    } else {
      sidebar.classList.add('-translate-x-full');
      sidebar.classList.remove('translate-x-0');
      if (backdrop) backdrop.classList.add('hidden');
    }
  };

  window.closeSidebar = function() {
    const sidebar = document.getElementById('sidebar');
    const backdrop = document.getElementById('sidebarBackdrop');
    if (sidebar) {
      sidebar.classList.add('-translate-x-full');
      sidebar.classList.remove('translate-x-0');
    }
    if (backdrop) backdrop.classList.add('hidden');
  };

  // Toggle user popup modal from sidebar avatar
  window.toggleSidebarUserPopup = function(e) {
    if (e) e.stopPropagation();
    const popup = document.getElementById('sidebarUserPopup');
    if (popup) {
      popup.classList.toggle('hidden');
    }
  };

  // Universal Active Page Filter: Hides active page link in sidebar
  function hideCurrentPageInSidebar() {
    let currentPath = window.location.pathname.split('/').pop() || 'index.html';
    if (!currentPath || currentPath === '') currentPath = 'index.html';

    // Normalize mapping
    const pathMap = {
      '': 'index.html',
      '/': 'index.html',
      'index.html': 'index.html',
      'free-offer.html': 'free-offer.html',
      'services.html': 'services.html',
      'shop.html': 'shop.html',
      'courses.html': 'courses.html',
      'blog.html': 'blog.html',
      'contact.html': 'contact.html',
      'frp.html': 'frp.html',
      'admin.html': 'admin.html',
      'about.html': 'about.html',
      'login.html': 'login.html'
    };

    const target = pathMap[currentPath] || currentPath;

    document.querySelectorAll('.sidebar-link, [data-page]').forEach(link => {
      const page = link.getAttribute('data-page');
      if (page && (page === target || page === currentPath)) {
        link.style.display = 'none';
      }
    });
  }

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
      setTimeout(() => { banner.style.display = 'none'; }, 250);
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

  // Close popups when clicking outside
  document.addEventListener('click', (e) => {
    const popup = document.getElementById('sidebarUserPopup');
    const profileBtn = document.getElementById('sidebarProfileSection');
    if (popup && !popup.classList.contains('hidden')) {
      if (!popup.contains(e.target) && (!profileBtn || !profileBtn.contains(e.target))) {
        popup.classList.add('hidden');
      }
    }
  });

  document.addEventListener('DOMContentLoaded', () => {
    initTheme();
    hideCurrentPageInSidebar();
    window.applyLanguage(currentLang);

    if (sessionStorage.getItem('habib_promo_dismissed') === 'true') {
      const banner = document.getElementById('topPromoBanner');
      if (banner) banner.style.display = 'none';
    }

    // Analytics record visit
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
