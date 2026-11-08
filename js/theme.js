// Ensure window.fetch has a setter if only a getter is provided by the browser environment
// Prevents "TypeError: Cannot set property fetch of #<Window> which has only a getter" in browser extensions
(function() {
  try {
    if (typeof window !== 'undefined') {
      let canSet = false;
      try {
        const orig = window.fetch;
        window.fetch = orig;
        canSet = true;
      } catch (err) {
        canSet = false;
      }

      if (!canSet) {
        let currentFetch = window.fetch;
        Object.defineProperty(window, 'fetch', {
          get: function() {
            return currentFetch;
          },
          set: function(newFetch) {
            currentFetch = newFetch;
          },
          configurable: true,
          enumerable: true
        });
      }
    }
  } catch (e) {}
})();

// Habib iFix .Tech - Single Light Mode Engine & ChatGPT-Style Collapsible Sidebar Controller
(function() {
  'use strict';

  // Force Pure Premium Light Mode Always
  window.setSiteTheme = function(theme) {
    document.documentElement.classList.remove('dark');
    document.documentElement.setAttribute('data-theme', 'light');
    if (document.body) {
      document.body.classList.remove('dark-mode');
      document.body.classList.add('light-mode');
    }
    try {
      localStorage.setItem('habib_theme', 'light');
      window.dispatchEvent(new CustomEvent('habibThemeChanged', { detail: { theme: 'light' } }));
    } catch(e) {}
  };

  window.toggleTheme = function() {
    window.setSiteTheme('light');
  };

  function initTheme() {
    window.setSiteTheme('light');
  }

  // Execute immediately to prevent dark flash and initialize sidebar state
  try {
    document.documentElement.classList.remove('dark');
    document.documentElement.setAttribute('data-theme', 'light');
    localStorage.setItem('habib_theme', 'light');

    const isCollapsed = localStorage.getItem('habib_sidebar_collapsed') === 'true';
    if (isCollapsed) {
      document.documentElement.classList.add('sidebar-collapsed-mode');
    }
  } catch(e) {}

  // ChatGPT-Style Desktop Collapsible Sidebar Toggle
  window.toggleDesktopSidebar = function() {
    const isCollapsed = document.documentElement.classList.toggle('sidebar-collapsed-mode');
    if (document.body) {
      document.body.classList.toggle('sidebar-collapsed-mode', isCollapsed);
    }
    localStorage.setItem('habib_sidebar_collapsed', isCollapsed ? 'true' : 'false');
    updateCollapseButtonUI(isCollapsed);
  };

  function updateCollapseButtonUI(isCollapsed) {
    const btns = document.querySelectorAll('#sidebarCollapseBtn, .sidebar-collapse-btn');
    btns.forEach(btn => {
      const icon = btn.querySelector('i');
      if (icon) {
        if (isCollapsed) {
          icon.className = 'fa-solid fa-angles-right text-xs transition-transform duration-300';
          btn.setAttribute('title', 'Expand Sidebar');
        } else {
          icon.className = 'fa-solid fa-angles-left text-xs transition-transform duration-300';
          btn.setAttribute('title', 'Collapse Sidebar');
        }
      }
    });
  }

  function initSidebarState() {
    const isCollapsed = localStorage.getItem('habib_sidebar_collapsed') === 'true';
    if (isCollapsed) {
      document.documentElement.classList.add('sidebar-collapsed-mode');
      if (document.body) document.body.classList.add('sidebar-collapsed-mode');
    } else {
      document.documentElement.classList.remove('sidebar-collapsed-mode');
      if (document.body) document.body.classList.remove('sidebar-collapsed-mode');
    }
    updateCollapseButtonUI(isCollapsed);
  }

  // Universal HTML Escape
  window.escapeHtml = function(text) {
    if (!text) return '';
    return String(text).replace(/[&<>"']/g, function(m) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#039;' }[m];
    });
  };

  // Mobile Drawer Toggle (Slide-out menu)
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

  // Highlight active page link and set up tooltip + mobile auto-close
  function setupSidebarNavigation() {
    let currentPath = window.location.pathname.split('/').pop() || 'index.html';
    if (!currentPath || currentPath === '') currentPath = 'index.html';

    const pathMap = {
      '': 'index.html',
      '/': 'index.html',
      'index.html': 'index.html',
      'dashboard': 'dashboard.html',
      'dashboard.html': 'dashboard.html',
      'free-offer.html': 'free-offer.html',
      'services.html': 'services.html',
      'shop.html': 'shop.html',
      'courses.html': 'courses.html',
      'blog.html': 'blog.html',
      'contact.html': 'contact.html',
      'frp.html': 'frp.html',
      'admin.html': 'admin.html',
      'about.html': 'about.html',
      'login.html': 'login.html',
      'passport-photo.html': 'passport-photo.html',
      'birth-certificate.html': 'birth-certificate.html'
    };

    const target = pathMap[currentPath] || currentPath;

    document.querySelectorAll('.sidebar-link, [data-page]').forEach(link => {
      const page = link.getAttribute('data-page');
      const label = link.querySelector('.sidebar-label, span');
      const text = label ? label.innerText.trim() : (link.getAttribute('title') || '');

      // Assign data-tooltip for desktop collapsed hover
      if (text) {
        link.setAttribute('data-tooltip', text);
        if (!link.getAttribute('title')) {
          link.setAttribute('title', text);
        }
      }

      // Check active state
      if (page && (page === target || page === currentPath)) {
        link.classList.add('sidebar-active-page');
      } else {
        link.classList.remove('sidebar-active-page');
      }

      // Mobile auto-close on link click
      link.addEventListener('click', () => {
        if (window.innerWidth < 1024) {
          window.closeSidebar();
        }
      });
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

  // Deprecated Language Manager (Default English Always)
  window.applyLanguage = function(lang) {
    localStorage.setItem('habib_lang', 'en');
  };

  window.toggleLanguage = function() {
    window.applyLanguage('en');
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

  // Close mobile drawer on Escape key
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      window.closeSidebar();
    }
  });

  document.addEventListener('DOMContentLoaded', () => {
    initTheme();
    initSidebarState();
    setupSidebarNavigation();

    if (sessionStorage.getItem('habib_promo_dismissed') === 'true') {
      const banner = document.getElementById('topPromoBanner');
      if (banner) banner.style.display = 'none';
    }

    // Record visit analytics
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
