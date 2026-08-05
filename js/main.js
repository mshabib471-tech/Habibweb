const menuToggle = document.querySelector('.menu-toggle');
const sidebar = document.querySelector('.sidebar');
const themeToggle = document.getElementById('theme-toggle');
const serviceData = {
  s1: ['Apple Premium Service', 'iPhone software restore, iCloud support, Face ID diagnosis, battery health check এবং premium parts guidance.'],
  s2: ['Samsung Advanced Service', 'Samsung FRP, Knox, firmware flash, display replacement support এবং performance optimization.'],
  s3: ['Xiaomi Popular Service', 'Mi account issue, bootloop fix, unlock, flash, charging diagnosis এবং accessory setup.'],
  s4: ['Huawei Pro Service', 'FRP remove, boot repair, software recovery, network support এবং complete device checkup.']
};

menuToggle?.addEventListener('click', () => sidebar?.classList.toggle('open'));

document.querySelectorAll('.sidebar a[href^="#"], .quick-links-list a[href^="#"]').forEach((link) => {
  link.addEventListener('click', () => sidebar?.classList.remove('open'));
});

themeToggle?.addEventListener('click', () => {
  document.body.classList.toggle('light');
  localStorage.setItem('habib-theme', document.body.classList.contains('light') ? 'light' : 'dark');
});

if (localStorage.getItem('habib-theme') === 'light') {
  document.body.classList.add('light');
}

const serviceTitle = document.getElementById('service-title');
const serviceText = document.getElementById('service-text');
document.querySelectorAll('.brand-card').forEach((card) => {
  card.addEventListener('click', () => {
    document.querySelectorAll('.brand-card').forEach((item) => item.classList.remove('active'));
    card.classList.add('active');
    const [title, text] = serviceData[card.dataset.target];
    serviceTitle.textContent = title;
    serviceText.textContent = text;
  });
});

const revealObserver = new IntersectionObserver((entries) => {
  entries.forEach((entry) => {
    if (entry.isIntersecting) {
      entry.target.classList.add('visible');
      revealObserver.unobserve(entry.target);
    }
  });
}, { threshold: 0.12 });

document.querySelectorAll('.reveal').forEach((item) => revealObserver.observe(item));

let deferredPrompt;
const installButton = document.getElementById('install-app-btn');
window.addEventListener('beforeinstallprompt', (event) => {
  event.preventDefault();
  deferredPrompt = event;
  if (installButton) installButton.hidden = false;
});
installButton?.addEventListener('click', async () => {
  if (!deferredPrompt) return;
  deferredPrompt.prompt();
  await deferredPrompt.userChoice;
  deferredPrompt = null;
  installButton.hidden = true;
});

const chatFab = document.getElementById('chat-fab');
const chatPopup = document.getElementById('chat-popup');
const chatMenu = document.getElementById('chat-menu');
const chatLive = document.getElementById('chat-live');
const chatClose = document.getElementById('chat-close');
const chatBack = document.getElementById('chat-back');
const chatSend = document.getElementById('chat-send');
const chatInput = document.getElementById('chat-input');
const chatLog = document.getElementById('chat-log');

chatFab?.addEventListener('click', () => {
  chatPopup.hidden = !chatPopup.hidden;
  chatMenu.hidden = false;
  chatLive.hidden = true;
});
chatClose?.addEventListener('click', () => chatPopup.hidden = true);
document.querySelector('[data-chat="live"]')?.addEventListener('click', () => {
  chatMenu.hidden = true;
  chatLive.hidden = false;
  chatInput.focus();
});
chatBack?.addEventListener('click', () => chatPopup.hidden = true);
chatSend?.addEventListener('click', () => {
  const message = chatInput.value.trim();
  if (!message) return;
  const safeMessage = message.replace(/[&<>'\"]/g, (char) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[char]));
  chatLog.insertAdjacentHTML('beforeend', `<p class="me">${safeMessage}</p>`);
  chatLog.insertAdjacentHTML('beforeend', '<p class="bot">ধন্যবাদ! দ্রুত support এর জন্য WhatsApp: 01868461577.</p>');
  chatInput.value = '';
  chatLog.scrollTop = chatLog.scrollHeight;
});
