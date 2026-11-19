// Habib iFix.Tech - Global Reusable Header, Brand & ChatGPT-Style Sidebar Component System
(function () {
  'use strict';

  var BRAND_TEXT = '𝐇𝐚𝐛𝐢𝐛 𝐢𝐅𝐢𝐱.𝐓𝐞𝐜𝐡';

  var ICONS = {
    LOGIN: 'https://static.vecteezy.com/system/resources/previews/071/395/775/non_2x/solid-login-icon-for-secure-authentication-in-web-and-mobile-ui-free-vector.jpg',
    LOGOUT: 'https://static.vecteezy.com/system/resources/previews/021/919/671/non_2x/login-icon-in-trendy-flat-style-isolated-on-white-background-approach-symbol-for-your-web-site-design-logo-app-ui-illustration-eps10-flat-style-for-graphic-design-vector.jpg',
    FRP: 'https://m.media-amazon.com/images/I/31YjxctHiDL.jpg',
    SIDEBAR_OPEN: 'https://images.icon-icons.com/3863/PNG/512/sidebar_left_icon_241259.png',
    SIDEBAR_CLOSE: 'https://www.svgrepo.com/show/497526/sidebar-right.svg',
    FREE_SERVICE: 'https://previews.123rf.com/images/chekman/chekman1911/chekman191100489/133662631-vector-service-icon-isolated-black-web-service-icon-in-flat-design-service-concept.jpg',
    HOME: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSPhB4CuxqZj1WlKqa6Cx9D33vUvmuWGJ-uTK2iUoDxhg&s=10'
  };

  function svgDataUri(svgBody) {
    return 'data:image/svg+xml;utf8,' + encodeURIComponent('<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="#0369a1" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">' + svgBody + '</svg>');
  }

  var FALLBACK_ICONS = {
    LOGIN: svgDataUri('<path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4"/><polyline points="10 17 15 12 10 7"/><line x1="15" y1="12" x2="3" y2="12"/>'),
    LOGOUT: svgDataUri('<path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/>'),
    FRP: svgDataUri('<rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 9.9-1"/>'),
    SIDEBAR_OPEN: svgDataUri('<rect x="3" y="3" width="18" height="18" rx="3"/><line x1="9" y1="3" x2="9" y2="21"/><polyline points="14 9 17 12 14 15"/>'),
    SIDEBAR_CLOSE: svgDataUri('<rect x="3" y="3" width="18" height="18" rx="3"/><line x1="9" y1="3" x2="9" y2="21"/><polyline points="16 9 13 12 16 15"/>'),
    FREE_SERVICE: svgDataUri('<path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z"/>'),
    HOME: svgDataUri('<path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/>')
  };

  var AUTHORIZED_ADMINS = ['tec.habiburrahman@gmail.com', 'mshabib471@gmail.com'];

  var MENU_PRIMARY = [
    { page: 'index.html', label: 'Home', icon: 'fa-house' },
    { page: 'dashboard.html', label: 'Dashboard', icon: 'fa-gauge' },
    { page: 'frp.html', label: 'FRP 2027', icon: 'fa-unlock-keyhole' },
    { page: 'free-offer.html', label: 'Free Offers', icon: 'fa-gift' },
    { page: 'services.html', label: 'Free Services', icon: 'fa-screwdriver-wrench' },
    { page: 'background-remover.html', label: 'BG Remover Studio', icon: 'fa-wand-magic-sparkles' },
    { page: 'shop.html', label: 'Shop', icon: 'fa-bag-shopping' },
    { page: 'courses.html', label: 'Courses', icon: 'fa-graduation-cap' },
    { page: 'blog.html', label: 'Blog', icon: 'fa-newspaper' }
  ];

  var MENU_UTILITY = [
    { page: 'contact.html', label: 'Support', icon: 'fa-headset' },
    { page: 'about.html', label: 'Settings', icon: 'fa-gear' }
  ];

  function escapeStr(str) {
    if (!str) return '';
    return String(str).replace(/[&<>"']/g, function (m) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#039;' }[m];
    });
  }

  function getStoredUser() {
    try {
      var raw = localStorage.getItem('habib_current_user');
      if (raw) return JSON.parse(raw);
    } catch (e) {}
    return null;
  }

  function isUserAdmin(user) {
    if (!user || !user.email) return false;
    return AUTHORIZED_ADMINS.indexOf(String(user.email).trim().toLowerCase()) !== -1;
  }

  function getCurrentPageName() {
    try {
      var pathname = (window.location && window.location.pathname) ? window.location.pathname : '/';
      var segment = pathname.split('/').filter(Boolean).pop() || '';
      if (!segment || segment === 'index' || segment === 'index.html') return 'index.html';
      if (segment.indexOf('.') === -1) return segment + '.html';
      return segment;
    } catch (e) {
      return 'index.html';
    }
  }

  function isHomePage() {
    return getCurrentPageName() === 'index.html';
  }

  function renderIconImg(key, altText, extraClass) {
    var src = ICONS[key] || '';
    var fallback = FALLBACK_ICONS[key] || '';
    return '<img src="' + src + '" alt="' + escapeStr(altText) + '" referrerpolicy="no-referrer" class="' + (extraClass || '') + '" onerror="if(this.dataset.fb)return;this.dataset.fb=1;this.src=\'' + fallback + '\';">';
  }

  // Component 1: BrandLogo
  function renderBrandLogo(options) {
    var opts = options || {};
    var href = opts.href || 'index.html';
    var imgClass = opts.imgClass || 'global-brand-logo';
    var textClass = opts.textClass || 'global-brand-text';
    return (
      '<a href="' + href + '" class="global-brand-lockup" title="' + BRAND_TEXT + '">' +
        '<img src="/logo.png" class="' + imgClass + '" alt="Habib iFix">' +
        '<span class="' + textClass + '">' + BRAND_TEXT + '</span>' +
      '</a>'
    );
  }

  // Component 2: HeaderQuickActions (ONLY 3 icon-only glass buttons, zero text labels)
  function renderHeaderQuickActions(homeFlag, user) {
    var loggedIn = !!user;
    var authActionHtml = loggedIn
      ? '<button type="button" id="headerAuthBtn" onclick="if(window.doRealLogout){window.doRealLogout();}else{window.location.href=\'login.html\';}" class="global-glass-icon-btn" title="Logout" aria-label="Logout">' +
          renderIconImg('LOGOUT', 'Logout') +
        '</button>'
      : '<a href="login.html" id="headerAuthBtn" class="global-glass-icon-btn" title="Sign In / Login" aria-label="Sign In">' +
          renderIconImg('LOGIN', 'Login') +
        '</a>';

    var freeServiceHtml =
      '<a href="services.html" class="global-glass-icon-btn" title="Free Services" aria-label="Free Services">' +
        renderIconImg('FREE_SERVICE', 'Free Services') +
      '</a>';

    var frpHtml =
      '<a href="frp.html" class="global-glass-icon-btn" title="FRP 2027" aria-label="FRP 2027">' +
        renderIconImg('FRP', 'FRP 2027') +
      '</a>';

    var homeHtml =
      '<a href="index.html" class="global-glass-icon-btn" title="Home" aria-label="Home">' +
        renderIconImg('HOME', 'Home') +
      '</a>';

    if (homeFlag) {
      // HOMEPAGE ONLY: Login/Logout -> Free Service -> FRP 2027
      return (
        '<div id="headerQuickActions" class="flex items-center gap-1.5 sm:gap-2.5 shrink-0">' +
          authActionHtml +
          freeServiceHtml +
          frpHtml +
        '</div>'
      );
    }

    // ALL OTHER PAGES: Home -> FRP 2027 -> Login/Logout (NEVER Free Service)
    return (
      '<div id="headerQuickActions" class="flex items-center gap-1.5 sm:gap-2.5 shrink-0">' +
        homeHtml +
        frpHtml +
        authActionHtml +
      '</div>'
    );
  }

  // Component 3: GlobalHeader
  function renderGlobalHeader(user) {
    var homeFlag = isHomePage();
    return (
      '<header class="no-print sticky top-0 left-0 w-full z-40 global-header">' +
        '<div class="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 h-16 sm:h-20 flex items-center justify-between gap-2 sm:gap-3">' +
          '<div class="flex items-center gap-2 sm:gap-3 min-w-0">' +
            '<button type="button" onclick="window.toggleSidebar()" class="lg:hidden global-glass-icon-btn" aria-label="Open Sidebar" title="Open Sidebar">' +
              renderIconImg('SIDEBAR_OPEN', 'Open Sidebar') +
            '</button>' +
            '<button type="button" id="headerSidebarToggleBtn" onclick="window.toggleDesktopSidebar()" class="hidden lg:inline-flex global-glass-icon-btn" aria-label="Toggle Sidebar" title="Toggle Sidebar">' +
              renderIconImg('SIDEBAR_OPEN', 'Toggle Sidebar') +
            '</button>' +
            renderBrandLogo() +
          '</div>' +
          renderHeaderQuickActions(homeFlag, user) +
        '</div>' +
      '</header>'
    );
  }

  // Component 4: SidebarAccountCard
  function renderSidebarAccountCard(user) {
    if (user) {
      var avatarUrl = user.avatar || ('https://api.dicebear.com/7.x/initials/svg?seed=' + encodeURIComponent(user.name || 'User'));
      var adminFlag = isUserAdmin(user);
      var safeName = escapeStr(user.name || 'User');
      var safeEmail = escapeStr(user.email || 'Member');
      return (
        '<div class="relative w-full">' +
          '<div onclick="if(window.toggleSidebarUserPopup){window.toggleSidebarUserPopup(event);}" class="sidebar-user-card sidebar-user-card-surface w-full flex items-center gap-3 p-2.5 rounded-2xl transition-all text-left cursor-pointer" title="' + safeName + ' (' + safeEmail + ')">' +
            '<img src="' + avatarUrl + '" class="sidebar-user-avatar w-10 h-10 rounded-xl object-cover border-2 ' + (adminFlag ? 'border-amber-400' : 'border-sky-400') + ' shrink-0 shadow-sm" alt="Avatar">' +
            '<div class="sidebar-user-info flex-1 min-w-0">' +
              '<div class="sidebar-user-name text-sm font-black truncate text-slate-900">' + safeName + '</div>' +
              '<div class="sidebar-user-email text-xs truncate text-sky-600 font-semibold">' + safeEmail + '</div>' +
            '</div>' +
            '<i class="sidebar-user-chevron fa-solid fa-chevron-right text-xs text-slate-400 shrink-0"></i>' +
          '</div>' +
          '<div id="sidebarUserPopup" class="hidden absolute left-0 right-0 top-full mt-2 rounded-2xl bg-white border border-slate-200 shadow-2xl p-3 z-50 divide-y divide-slate-100">' +
            '<div class="pb-2">' +
              '<div class="text-xs font-black text-slate-900 truncate">' + safeName + '</div>' +
              '<div class="text-[10px] text-slate-500 truncate">' + safeEmail + '</div>' +
              '<div class="mt-1.5 flex items-center gap-1.5 flex-wrap">' +
                '<span class="text-[10px] font-mono font-bold ' + (adminFlag ? 'text-amber-600' : 'text-sky-600') + '">' + (adminFlag ? '★ ADMINISTRATOR' : '✓ MEMBER') + '</span>' +
                (user.emailVerified
                  ? '<span class="text-[9px] px-1.5 py-0.5 rounded bg-emerald-100 text-emerald-700 font-bold font-mono">VERIFIED</span>'
                  : '<span class="text-[9px] px-1.5 py-0.5 rounded bg-amber-100 text-amber-700 font-bold font-mono">UNVERIFIED</span>') +
              '</div>' +
            '</div>' +
            '<div class="py-2 space-y-1">' +
              '<a href="dashboard.html" class="flex items-center gap-2 p-2 rounded-xl text-xs font-bold text-slate-700 hover:bg-sky-50 transition-colors">' +
                '<i class="fa-solid fa-gauge text-sky-600"></i> My Dashboard' +
              '</a>' +
              (adminFlag
                ? '<a href="admin.html" class="flex items-center gap-2 p-2 rounded-xl text-xs font-bold text-amber-700 hover:bg-amber-50 transition-colors">' +
                    '<i class="fa-solid fa-shield-halved text-amber-600"></i> Admin CMS &amp; Control' +
                  '</a>'
                : '') +
              '<a href="contact.html" class="flex items-center gap-2 p-2 rounded-xl text-xs font-bold text-slate-700 hover:bg-sky-50 transition-colors">' +
                '<i class="fa-solid fa-wrench text-sky-600"></i> My Repairs / Tickets' +
              '</a>' +
              '<a href="free-offer.html" class="flex items-center gap-2 p-2 rounded-xl text-xs font-bold text-slate-700 hover:bg-sky-50 transition-colors">' +
                '<i class="fa-solid fa-gift text-indigo-600"></i> Free Offers &amp; Perks' +
              '</a>' +
            '</div>' +
            '<div class="pt-2">' +
              '<button type="button" onclick="window.doRealLogout()" class="w-full flex items-center gap-2.5 p-2 rounded-xl text-xs font-bold text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer">' +
                '<span class="w-5 h-5 rounded-md bg-rose-50 border border-rose-200 flex items-center justify-center shrink-0 overflow-hidden">' +
                  renderIconImg('LOGOUT', 'Log Out', 'w-3.5 h-3.5 object-contain mix-blend-multiply') +
                '</span>' +
                '<span>Log Out</span>' +
              '</button>' +
            '</div>' +
          '</div>' +
        '</div>'
      );
    }

    // Logged out: Premium Blue Glassmorphism Login Icon + Account / Sign In ->
    return (
      '<a href="login.html" class="sidebar-user-card sidebar-user-card-surface flex items-center gap-3 p-2.5 rounded-2xl transition-all text-left" title="Sign In / Register">' +
        '<div class="blue-glass-login-icon">' +
          renderIconImg('LOGIN', 'Login') +
        '</div>' +
        '<div class="sidebar-user-info flex-1 min-w-0">' +
          '<div class="sidebar-user-name text-sm font-black text-slate-900 leading-tight">Account</div>' +
          '<div class="sidebar-user-email text-xs text-sky-600 font-extrabold mt-0.5 truncate">Sign In / Register &rarr;</div>' +
        '</div>' +
      '</a>'
    );
  }

  // Component 5: NavigationMenu
  function renderNavigationMenu(currentPage, user) {
    var adminFlag = isUserAdmin(user);
    var loggedIn = !!user;

    function linkHtml(item) {
      var isActive = currentPage === item.page;
      var cls = 'sidebar-link flex items-center gap-3 px-3.5 py-2.5 rounded-xl transition-all' + (isActive ? ' sidebar-active-page' : '');
      return (
        '<a href="' + item.page + '" class="' + cls + '" data-page="' + item.page + '" title="' + item.label + '" data-tooltip="' + item.label + '">' +
          '<i class="fa-solid ' + item.icon + ' w-5 text-center text-sm shrink-0"></i>' +
          '<span class="sidebar-label text-sm font-bold truncate">' + item.label + '</span>' +
        '</a>'
      );
    }

    var html = MENU_PRIMARY.map(linkHtml).join('');

    if (adminFlag) {
      var adminActive = currentPage === 'admin.html';
      html +=
        '<a href="admin.html" id="sidebarAdminLink" class="sidebar-link flex items-center gap-3 px-3.5 py-2.5 rounded-xl transition-all text-amber-700 hover:bg-amber-50' + (adminActive ? ' sidebar-active-page' : '') + '" data-page="admin.html" title="Admin CMS" data-tooltip="Admin CMS">' +
          '<i class="fa-solid fa-shield-halved w-5 text-center text-sm shrink-0 text-amber-600"></i>' +
          '<span class="sidebar-label text-sm font-bold truncate">Admin CMS</span>' +
        '</a>';
    }

    html += '<div class="my-2 border-t sidebar-divider"></div>';
    html += MENU_UTILITY.map(linkHtml).join('');

    html +=
      '<button type="button" id="sidebarLogoutBtn" onclick="window.doRealLogout()" class="sidebar-link ' + (loggedIn ? '' : 'hidden ') + 'w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-rose-600 hover:text-rose-700 hover:bg-rose-50 transition-all cursor-pointer text-left" title="Log Out" data-tooltip="Log Out">' +
        '<span class="w-5 h-5 flex items-center justify-center shrink-0">' +
          renderIconImg('LOGOUT', 'Log Out', 'w-4 h-4 object-contain mix-blend-multiply') +
        '</span>' +
        '<span class="sidebar-label text-sm font-bold truncate">Log Out</span>' +
      '</button>';

    return html;
  }

  // Component 6: GlobalSidebar
  function renderGlobalSidebar(currentPage, user) {
    return (
      '<div id="sidebarBackdrop" onclick="window.closeSidebar()" class="hidden fixed inset-0 z-40 lg:hidden transition-opacity"></div>' +
      '<nav id="sidebar" class="no-print sidebar-luxury fixed left-0 top-0 h-full w-64 z-50 transition-all duration-300 transform -translate-x-full lg:translate-x-0 flex flex-col justify-between select-none">' +
        '<div class="p-4 border-b sidebar-divider flex flex-col gap-3">' +
          '<div class="flex items-center justify-between gap-2">' +
            '<a href="index.html" class="flex items-center gap-2.5 group overflow-hidden min-w-0" title="' + BRAND_TEXT + '">' +
              '<img src="/logo.png" class="w-8 h-8 rounded-xl object-contain shadow-sm shrink-0" alt="Habib iFix">' +
              '<div class="sidebar-brand-text flex flex-col min-w-0">' +
                '<span class="text-sm font-black tracking-tight text-slate-900 whitespace-nowrap leading-tight">' + BRAND_TEXT + '</span>' +
                '<span class="text-[9px] text-sky-600 font-mono font-bold tracking-widest uppercase">MASTER LAB</span>' +
              '</div>' +
            '</a>' +
            '<div class="flex items-center gap-1 shrink-0">' +
              '<button type="button" id="sidebarCollapseBtn" onclick="window.toggleDesktopSidebar()" class="hidden lg:inline-flex global-glass-icon-btn !w-8 !h-8 !rounded-lg" title="Collapse / Expand Sidebar" aria-label="Collapse Sidebar">' +
                renderIconImg('SIDEBAR_CLOSE', 'Close Sidebar', 'w-4 h-4 object-contain mix-blend-multiply') +
              '</button>' +
              '<button type="button" onclick="window.closeSidebar()" class="lg:hidden global-glass-icon-btn !w-8 !h-8 !rounded-lg" aria-label="Close Sidebar" title="Close Sidebar">' +
                renderIconImg('SIDEBAR_CLOSE', 'Close Sidebar', 'w-4 h-4 object-contain mix-blend-multiply') +
              '</button>' +
            '</div>' +
          '</div>' +
          '<div id="sidebarProfileSection" class="pt-2 border-t sidebar-divider">' +
            renderSidebarAccountCard(user) +
          '</div>' +
        '</div>' +
        '<div id="sidebar-links" class="p-3 space-y-1 flex-1 overflow-y-auto">' +
          renderNavigationMenu(currentPage, user) +
        '</div>' +
        '<div class="sidebar-footer-note p-3 border-t sidebar-divider">' +
          '<div class="text-[11px] text-slate-500 text-center font-bold">' + BRAND_TEXT + ' &copy; 2026</div>' +
        '</div>' +
      '</nav>'
    );
  }

  function bindSidebarAutoClose() {
    document.querySelectorAll('#sidebar .sidebar-link').forEach(function (link) {
      if (link.dataset.boundClose) return;
      link.dataset.boundClose = '1';
      link.addEventListener('click', function () {
        if (window.innerWidth < 1024 && typeof window.closeSidebar === 'function') {
          window.closeSidebar();
        }
      });
    });
  }

  function mountGlobalChrome() {
    var user = getStoredUser();
    var currentPage = getCurrentPageName();

    var sidebarRoot = document.getElementById('global-sidebar-root');
    if (sidebarRoot) {
      sidebarRoot.innerHTML = renderGlobalSidebar(currentPage, user);
    }

    var headerRoot = document.getElementById('global-header-root');
    if (headerRoot) {
      headerRoot.innerHTML = renderGlobalHeader(user);
    }

    bindSidebarAutoClose();
  }

  function updateAuthChrome(user) {
    var currentUser = typeof user === 'undefined' ? getStoredUser() : user;
    var homeFlag = isHomePage();
    var currentPage = getCurrentPageName();

    var actionsEl = document.getElementById('headerQuickActions');
    if (actionsEl) {
      var temp = document.createElement('div');
      temp.innerHTML = renderHeaderQuickActions(homeFlag, currentUser);
      if (temp.firstChild) {
        actionsEl.replaceWith(temp.firstChild);
      }
    }

    var profileEl = document.getElementById('sidebarProfileSection');
    if (profileEl) {
      profileEl.innerHTML = renderSidebarAccountCard(currentUser);
    }

    var linksEl = document.getElementById('sidebar-links');
    if (linksEl) {
      linksEl.innerHTML = renderNavigationMenu(currentPage, currentUser);
      bindSidebarAutoClose();
    }
  }

  var SOCIAL_LINKS = [
    { name: 'Website', href: 'https://www.habibifix.tech/', icon: 'fa-solid fa-globe', cls: 'social-web' },
    { name: 'Facebook', href: 'https://www.facebook.com/share/1F5aLYAJ9a/', icon: 'fa-brands fa-facebook-f', cls: 'social-fb' },
    { name: 'Telegram', href: 'https://t.me/habibifix', icon: 'fa-brands fa-telegram', cls: 'social-tg' },
    { name: 'WhatsApp', href: 'https://wa.me/8801868461577', icon: 'fa-brands fa-whatsapp', cls: 'social-wa' },
    { name: 'TikTok', href: 'https://www.tiktok.com/@habibifix.tech', icon: 'fa-brands fa-tiktok', cls: 'social-tt' },
    { name: 'YouTube', href: 'https://www.youtube.com/@habibifix.t', icon: 'fa-brands fa-youtube', cls: 'social-yt' },
    { name: 'Instagram', href: 'https://www.instagram.com/habibifix.tech?dmpr=MTJtNW1ibTk2aDUxdA==', icon: 'fa-brands fa-instagram', cls: 'social-ig' }
  ];

  function renderSocialLinks() {
    return (
      '<div class="flex flex-wrap items-center gap-2.5">' +
        SOCIAL_LINKS.map(function (s) {
          return '<a href="' + s.href + '" target="_blank" rel="noopener noreferrer" title="' + s.name + '" aria-label="' + s.name + '" class="social-icon-btn ' + s.cls + '"><i class="' + s.icon + '"></i></a>';
        }).join('') +
      '</div>'
    );
  }

  window.HabibLayout = {
    BRAND_TEXT: BRAND_TEXT,
    ICONS: ICONS,
    FALLBACK_ICONS: FALLBACK_ICONS,
    SOCIAL_LINKS: SOCIAL_LINKS,
    renderBrandLogo: renderBrandLogo,
    renderHeaderQuickActions: renderHeaderQuickActions,
    renderGlobalHeader: renderGlobalHeader,
    renderSidebarAccountCard: renderSidebarAccountCard,
    renderNavigationMenu: renderNavigationMenu,
    renderGlobalSidebar: renderGlobalSidebar,
    renderSocialLinks: renderSocialLinks,
    mount: mountGlobalChrome,
    updateAuthChrome: updateAuthChrome,
    getCurrentPageName: getCurrentPageName,
    isHomePage: isHomePage
  };

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', mountGlobalChrome);
  }
})();
