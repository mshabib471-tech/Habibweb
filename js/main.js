// Initialize Feather Icons
feather.replace();

// ================= DARK MODE TOGGLE LOGIC =================
const themeToggleBtn = document.getElementById('theme-toggle');
const themeToggleDarkIcon = document.getElementById('theme-toggle-dark-icon');
const themeToggleLightIcon = document.getElementById('theme-toggle-light-icon');

// Change the icons inside the button based on previous settings
if (localStorage.getItem('color-theme') === 'dark' || (!('color-theme' in localStorage) && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
    themeToggleLightIcon.classList.remove('hidden');
    document.documentElement.classList.add('dark');
} else {
    themeToggleDarkIcon.classList.remove('hidden');
    document.documentElement.classList.remove('dark');
}

themeToggleBtn.addEventListener('click', function() {
    // toggle icons
    themeToggleDarkIcon.classList.toggle('hidden');
    themeToggleLightIcon.classList.toggle('hidden');

    // if set via local storage previously
    if (localStorage.getItem('color-theme')) {
        if (localStorage.getItem('color-theme') === 'light') {
            document.documentElement.classList.add('dark');
            localStorage.setItem('color-theme', 'dark');
        } else {
            document.documentElement.classList.remove('dark');
            localStorage.setItem('color-theme', 'light');
        }
    // if NOT set via local storage previously
    } else {
        if (document.documentElement.classList.contains('dark')) {
            document.documentElement.classList.remove('dark');
            localStorage.setItem('color-theme', 'light');
        } else {
            document.documentElement.classList.add('dark');
            localStorage.setItem('color-theme', 'dark');
        }
    }
});


// ================= STICKY HEADER =================
const header = document.getElementById('main-header');
window.addEventListener('scroll', () => {
  if (window.scrollY > 20) {
    header.classList.add('shadow-md', 'py-3');
    header.classList.remove('py-5');
  } else {
    header.classList.add('py-5');
    header.classList.remove('shadow-md', 'py-3');
  }
});

// ================= MOBILE MENU =================
const menuBtn = document.getElementById('mobile-menu-btn');
const mobileMenu = document.getElementById('mobile-menu');
let isMenuOpen = false;

menuBtn.addEventListener('click', () => {
  isMenuOpen = !isMenuOpen;
  if (isMenuOpen) {
    mobileMenu.classList.remove('hidden');
    menuBtn.innerHTML = '<i data-feather="x" class="w-6 h-6"></i>';
  } else {
    mobileMenu.classList.add('hidden');
    menuBtn.innerHTML = '<i data-feather="menu" class="w-6 h-6"></i>';
  }
  feather.replace();
});

// ================= ACCORDION LOGIC =================
function toggleAccordion(element) {
  const content = element.querySelector('.acc-content');
  const icon = element.querySelector('.acc-icon');
  const title = element.querySelector('h4');
  const isHidden = content.classList.contains('hidden');

  document.querySelectorAll('.accordion-item').forEach(item => {
    item.classList.remove('border-[#9E1B32]', 'bg-rose-50/30');
    // Dark mode default border fixes
    item.classList.add('border-gray-200', 'dark:border-slate-700');
    item.querySelector('.acc-content').classList.add('hidden');
    item.querySelector('.acc-content').classList.remove('block');
    item.querySelector('h4').classList.remove('text-[#9E1B32]');
    item.querySelector('h4').classList.add('text-slate-800', 'dark:text-slate-200');
    item.querySelector('.acc-icon').classList.remove('rotate-180', 'text-[#9E1B32]');
    item.querySelector('.acc-icon').classList.add('text-gray-400');
  });

  if (isHidden) {
    element.classList.add('border-[#9E1B32]', 'bg-rose-50/30');
    element.classList.remove('border-gray-200', 'dark:border-slate-700');
    content.classList.remove('hidden');
    content.classList.add('block');
    title.classList.add('text-[#9E1B32]');
    title.classList.remove('text-slate-800', 'dark:text-slate-200');
    icon.classList.add('rotate-180', 'text-[#9E1B32]');
    icon.classList.remove('text-gray-400');
  }
}
