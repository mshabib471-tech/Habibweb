const fs = require('fs');
const path = require('path');

const SIDEBAR_HTML = `    <!-- Mobile Backdrop -->
    <div id="sidebarBackdrop" onclick="closeSidebar()" class="hidden fixed inset-0 bg-black/60 backdrop-blur-xs z-45 lg:hidden transition-opacity"></div>

    <!-- Luxury Sidebar Navigation (Matching Reference Image) -->
    <nav id="sidebar" class="sidebar-luxury fixed left-0 top-0 h-full w-64 z-50 transition-all duration-300 transform -translate-x-full lg:translate-x-0 flex flex-col justify-between select-none">
        <!-- Top Section: User Profile & Brand -->
        <div class="p-4 border-b sidebar-divider flex flex-col gap-3">
            <div class="flex items-center justify-between">
                <a href="index.html" class="flex items-center gap-2 group">
                    <img src="/logo.png" class="w-8 h-8 rounded-lg object-contain shadow-sm" alt="Habib iFix">
                    <div class="flex flex-col">
                        <span class="text-xs font-black tracking-wider uppercase brand-name-habib">Habib iFix</span>
                        <span class="text-[9px] text-cyan-500 font-mono font-bold tracking-tight">MASTER LAB</span>
                    </div>
                </a>
                <button onclick="toggleSidebar()" class="lg:hidden text-slate-400 hover:text-slate-900 dark:hover:text-white p-1 rounded-lg transition-colors cursor-pointer" aria-label="Close sidebar">
                    <i class="fa-solid fa-xmark text-lg"></i>
                </button>
            </div>

            <!-- Profile Widget Container (Populated dynamically by site-auth.js) -->
            <div id="sidebarProfileSection" class="pt-2 border-t sidebar-divider">
                <a href="login.html" class="flex items-center gap-3 p-2 rounded-2xl hover:bg-black/5 dark:hover:bg-white/5 transition-all text-left">
                    <div class="w-10 h-10 rounded-xl bg-slate-100 dark:bg-white/10 flex items-center justify-center text-slate-500 dark:text-slate-400 shrink-0">
                        <i class="fa-solid fa-user text-base"></i>
                    </div>
                    <div class="flex-1 min-w-0">
                        <div class="sidebar-user-name text-sm font-black text-slate-900 dark:text-white">Account</div>
                        <div class="sidebar-user-email text-xs text-indigo-600 dark:text-cyan-400 font-bold">Sign In / Register &rarr;</div>
                    </div>
                </a>
            </div>
        </div>
        
        <!-- Center Section: Navigation Links (Current page hidden dynamically) -->
        <div id="sidebar-links" class="p-3 space-y-1.5 flex-1 overflow-y-auto">
            <a href="admin.html" class="sidebar-link flex items-center gap-3 px-3.5 py-2.5 rounded-xl transition-all" data-page="admin.html">
                <i class="fa-solid fa-gauge w-5 text-center text-sm"></i>
                <span class="text-sm font-bold">Dashboard</span>
            </a>
            <a href="frp.html" class="sidebar-link flex items-center gap-3 px-3.5 py-2.5 rounded-xl transition-all" data-page="frp.html">
                <i class="fa-solid fa-unlock-keyhole w-5 text-center text-sm"></i>
                <span class="text-sm font-bold">FRP 2027</span>
            </a>
            <a href="index.html" class="sidebar-link flex items-center gap-3 px-3.5 py-2.5 rounded-xl transition-all" data-page="index.html">
                <i class="fa-solid fa-house w-5 text-center text-sm"></i>
                <span class="text-sm font-bold">Home</span>
            </a>
            <a href="free-offer.html" class="sidebar-link flex items-center gap-3 px-3.5 py-2.5 rounded-xl transition-all" data-page="free-offer.html">
                <i class="fa-solid fa-gift w-5 text-center text-sm"></i>
                <span class="text-sm font-bold">Free Offers</span>
            </a>
            <a href="services.html" class="sidebar-link flex items-center gap-3 px-3.5 py-2.5 rounded-xl transition-all" data-page="services.html">
                <i class="fa-solid fa-screwdriver-wrench w-5 text-center text-sm"></i>
                <span class="text-sm font-bold">Free Services</span>
            </a>
            <a href="shop.html" class="sidebar-link flex items-center gap-3 px-3.5 py-2.5 rounded-xl transition-all" data-page="shop.html">
                <i class="fa-solid fa-bag-shopping w-5 text-center text-sm"></i>
                <span class="text-sm font-bold">Shop</span>
            </a>
            <a href="courses.html" class="sidebar-link flex items-center gap-3 px-3.5 py-2.5 rounded-xl transition-all" data-page="courses.html">
                <i class="fa-solid fa-graduation-cap w-5 text-center text-sm"></i>
                <span class="text-sm font-bold">Courses</span>
            </a>
            <a href="blog.html" class="sidebar-link flex items-center gap-3 px-3.5 py-2.5 rounded-xl transition-all" data-page="blog.html">
                <i class="fa-solid fa-newspaper w-5 text-center text-sm"></i>
                <span class="text-sm font-bold">Blog</span>
            </a>

            <!-- Divider before utility links -->
            <div class="my-2 border-t sidebar-divider"></div>

            <a href="contact.html" class="sidebar-link flex items-center gap-3 px-3.5 py-2.5 rounded-xl transition-all" data-page="contact.html">
                <i class="fa-solid fa-headset w-5 text-center text-sm"></i>
                <span class="text-sm font-bold">Support</span>
            </a>
            <a href="settings.html" class="sidebar-link flex items-center gap-3 px-3.5 py-2.5 rounded-xl transition-all" data-page="settings.html">
                <i class="fa-solid fa-gear w-5 text-center text-sm"></i>
                <span class="text-sm font-bold">Settings</span>
            </a>
            <button id="sidebarLogoutBtn" onclick="window.doRealLogout()" class="sidebar-link hidden w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-red-500 hover:text-red-400 hover:bg-red-500/10 transition-all cursor-pointer text-left">
                <i class="fa-solid fa-arrow-right-from-bracket w-5 text-center text-sm"></i>
                <span class="text-sm font-bold">Log Out</span>
            </button>
        </div>
        
        <!-- Bottom Section: Segmented Light / Dark Toggle (Exact match to reference image) -->
        <div class="p-3 border-t sidebar-divider">
            <div class="theme-switch-pill flex items-center p-1 rounded-xl">
                <button onclick="setSiteTheme('light')" id="themeBtnLight" type="button" class="theme-btn-option flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer">
                    <i class="fa-regular fa-sun text-sm"></i>
                    <span>Light</span>
                </button>
                <button onclick="setSiteTheme('dark')" id="themeBtnDark" type="button" class="theme-btn-option flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer">
                    <i class="fa-regular fa-moon text-sm"></i>
                    <span>Dark</span>
                </button>
            </div>
        </div>
    </nav>`;

const HEADER_HTML = `    <!-- Main Content Wrapper (adjust for sidebar) -->
    <div id="mainContent" class="lg:ml-64 transition-all duration-300">
        <header class="sticky top-0 left-0 w-full z-40 glass-nav">
            <div class="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 h-18 sm:h-20 flex items-center justify-between gap-3">
                <div class="flex items-center gap-3">
                    <button onclick="toggleSidebar()" class="lg:hidden p-2 rounded-xl border border-slate-200 dark:border-white/10 hover:bg-black/5 dark:hover:bg-white/5 cursor-pointer">
                        <i class="fa-solid fa-bars text-lg text-slate-800 dark:text-white"></i>
                    </button>
                    <a href="index.html" class="lg:hidden flex items-center gap-2">
                        <img src="/logo.png" class="w-7 h-7 rounded-lg object-contain" alt="Habib iFix">
                        <span class="text-xs font-black uppercase brand-name-habib">Habib iFix</span>
                    </a>
                </div>

                <div class="flex items-center gap-2 sm:gap-3">
                    <button onclick="toggleLanguage()" id="langSwitchBtn" class="text-xs font-bold px-3 py-1.5 rounded-lg border border-slate-200 dark:border-white/10 hover:bg-black/5 dark:hover:bg-white/5 cursor-pointer flex items-center gap-1.5 text-slate-700 dark:text-slate-200">
                        <i class="fa-solid fa-globe text-cyan-400 text-xs"></i> <span>EN | BN</span>
                    </button>
                    <div id="loginNavBtn" class="sm:hidden">
                        <a href="login.html" class="text-xs font-bold px-3 py-1.5 rounded-lg bg-indigo-600 text-white">Login</a>
                    </div>
                </div>
            </div>
        </header>`;

const TARGET_FILES = [
  'index.html',
  'services.html',
  'shop.html',
  'courses.html',
  'free-offer.html',
  'frp.html',
  'blog.html',
  'contact.html',
  'about.html',
  'login.html'
];

TARGET_FILES.forEach(fileName => {
  const filePath = path.join(process.cwd(), fileName);
  if (!fs.existsSync(filePath)) return;

  let content = fs.readFileSync(filePath, 'utf8');

  // Ensure site-auth.js is loaded as module
  content = content.replace(/<script src="\/js\/site-auth\.js"><\/script>/g, '<script type="module" src="/js/site-auth.js"></script>');
  content = content.replace(/<script src="js\/site-auth\.js"><\/script>/g, '<script type="module" src="/js/site-auth.js"></script>');

  // If already has <nav id="sidebar", replace from before <nav id="sidebar" up to </header>
  if (content.includes('id="sidebar"')) {
    // Regex matching from optional backdrop or <nav id="sidebar" to closing </header>
    const navRegex = /(?:<!-- Mobile Backdrop -->\s*<div id="sidebarBackdrop"[\s\S]*?)?<nav id="sidebar"[\s\S]*?<\/header>/;
    if (navRegex.test(content)) {
      content = content.replace(navRegex, `${SIDEBAR_HTML}\n\n${HEADER_HTML}`);
      console.log(`Updated existing sidebar in ${fileName}`);
    }
  } else {
    // Replace legacy <header ... </header>
    const headerRegex = /<!-- MAIN NAVBAR[\s\S]*?<\/header>/;
    if (headerRegex.test(content)) {
      content = content.replace(headerRegex, `${SIDEBAR_HTML}\n\n${HEADER_HTML}`);
      // Also close mainContent div before </body> if not present
      if (!content.includes('id="mainContent"')) {
        content = content.replace('</body>', '    </div>\n</body>');
      }
      console.log(`Inserted luxury sidebar in ${fileName}`);
    } else {
      // Fallback for simple header
      const simpleHeader = /<header class="sticky[\s\S]*?<\/header>/;
      if (simpleHeader.test(content)) {
        content = content.replace(simpleHeader, `${SIDEBAR_HTML}\n\n${HEADER_HTML}`);
        if (!content.includes('id="mainContent"')) {
          content = content.replace('</body>', '    </div>\n</body>');
        }
        console.log(`Inserted luxury sidebar (simple) in ${fileName}`);
      }
    }
  }

  // Ensure theme.js is imported in head
  if (!content.includes('theme.js')) {
    content = content.replace('</head>', '    <script src="/js/theme.js"></script>\n</head>');
  }

  // Ensure site-auth.js is imported before </body>
  if (!content.includes('site-auth.js')) {
    content = content.replace('</body>', '    <script type="module" src="/js/site-auth.js"></script>\n</body>');
  }

  // Ensure mainContent div is properly closed before </body>
  const openCount = (content.match(/<div id="mainContent"/g) || []).length;
  if (openCount > 0 && !content.includes('</div><!-- /mainContent -->')) {
    // Check if properly balanced
    if (!content.includes('</div>\n</body>') && !content.includes('</div>\n    <script')) {
      content = content.replace(/(<script[\s\S]*?<\/body>)/, '    </div>\n$1');
    }
  }

  fs.writeFileSync(filePath, content, 'utf8');
});

console.log('All sidebars synchronized successfully!');
