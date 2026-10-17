// Habib iFix AI Assistant
(function() {
  function playBeep(freq = 600, duration = 0.08) {
    try {
      const ctx = new (window.AudioContext || window.webkitAudioContext)();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.value = freq;
      gain.gain.setValueAtTime(0.04, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + duration);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + duration);
    } catch (e) {}
  }

  // Floating AI Agent Widget HTML (Clean branding without Gemini 3.8 text)
  const widgetHTML = `
  <div id="habib-ai-widget" class="fixed bottom-6 right-6 z-[9999] font-sans antialiased">
    <!-- Floating Trigger Button -->
    <button id="habib-ai-trigger" class="relative group flex items-center justify-center w-14 h-14 sm:w-16 sm:h-16 rounded-full bg-gradient-to-tr from-indigo-600 via-purple-600 to-cyan-500 text-white shadow-[0_0_25px_rgba(99,102,241,0.5)] hover:shadow-[0_0_35px_rgba(6,182,212,0.7)] hover:scale-105 active:scale-95 transition-all duration-300 border-2 border-white/30">
      <div class="absolute -top-1 -right-1 flex h-4 w-4">
        <span class="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
        <span class="relative inline-flex rounded-full h-4 w-4 bg-emerald-500 border-2 border-slate-900"></span>
      </div>
      <i class="fa-solid fa-microchip text-2xl group-hover:rotate-12 transition-transform duration-300"></i>
      <span class="absolute -top-10 right-0 bg-slate-900/95 border border-indigo-500/40 text-cyan-300 text-[11px] font-bold py-1 px-2.5 rounded-full shadow-lg opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none">
        AI Technical Assistant
      </span>
    </button>

    <!-- Chat Window Drawer -->
    <div id="habib-ai-panel" class="hidden flex flex-col fixed bottom-24 right-4 sm:right-6 w-[calc(100vw-2rem)] sm:w-[420px] h-[580px] max-h-[85vh] bg-slate-950/95 backdrop-blur-2xl border border-indigo-500/30 rounded-3xl shadow-[0_20px_60px_rgba(0,0,0,0.8),0_0_40px_rgba(99,102,241,0.2)] overflow-hidden transition-all duration-300 origin-bottom-right">
      
      <!-- Panel Header -->
      <div class="p-4 bg-gradient-to-r from-indigo-950/90 via-purple-950/80 to-slate-900/90 border-b border-white/10 flex items-center justify-between">
        <div class="flex items-center gap-3">
          <div class="w-10 h-10 rounded-2xl bg-gradient-to-tr from-cyan-500 to-indigo-600 flex items-center justify-center text-white shadow-lg shadow-cyan-500/20">
            <i class="fa-solid fa-robot text-lg"></i>
          </div>
          <div>
            <div class="flex items-center gap-2">
              <h3 class="text-sm font-bold text-white tracking-wide">Habib iFix <span class="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-indigo-400">AI Assistant</span></h3>
              <span class="text-[9px] bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 px-1.5 py-0.5 rounded-full font-semibold">ONLINE</span>
            </div>
            <p class="text-[11px] text-emerald-400 flex items-center gap-1.5">
              <span class="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
              Live Technical Diagnostics
            </p>
          </div>
        </div>
        <div class="flex items-center gap-1">
          <button id="habib-ai-clear" title="Clear Chat" class="w-8 h-8 rounded-xl text-slate-400 hover:text-white hover:bg-white/10 flex items-center justify-center transition-colors">
            <i class="fa-solid fa-rotate-right text-xs"></i>
          </button>
          <button id="habib-ai-close" class="w-8 h-8 rounded-xl text-slate-400 hover:text-white hover:bg-white/10 flex items-center justify-center transition-colors">
            <i class="fa-solid fa-xmark text-sm"></i>
          </button>
        </div>
      </div>

      <!-- Quick Suggested Chips -->
      <div class="px-3 py-2 bg-slate-900/60 border-b border-white/5 flex gap-2 overflow-x-auto no-scrollbar text-[11px]">
        <button class="ai-chip whitespace-nowrap bg-indigo-500/10 hover:bg-indigo-500/20 border border-indigo-500/30 text-indigo-300 px-2.5 py-1 rounded-full transition-colors">
          📱 Display Replacement Cost
        </button>
        <button class="ai-chip whitespace-nowrap bg-purple-500/10 hover:bg-purple-500/20 border border-purple-500/30 text-purple-300 px-2.5 py-1 rounded-full transition-colors">
          🔓 FRP Bypass Guide
        </button>
        <button class="ai-chip whitespace-nowrap bg-cyan-500/10 hover:bg-cyan-500/20 border border-cyan-500/30 text-cyan-300 px-2.5 py-1 rounded-full transition-colors">
          💧 Water Damage Urgent Fix
        </button>
        <button class="ai-chip whitespace-nowrap bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/30 text-amber-300 px-2.5 py-1 rounded-full transition-colors">
          ⚡ Dead Phone / Short Repair
        </button>
      </div>

      <!-- Messages Body -->
      <div id="habib-ai-messages" class="flex-1 p-4 overflow-y-auto space-y-4 text-xs scroll-smooth">
        <!-- Welcome Message -->
        <div class="flex items-start gap-3">
          <div class="w-7 h-7 rounded-xl bg-gradient-to-tr from-cyan-500 to-indigo-600 flex items-center justify-center text-white shrink-0 mt-0.5">
            <i class="fa-solid fa-bolt text-xs"></i>
          </div>
          <div class="bg-slate-900/90 border border-indigo-500/20 p-3.5 rounded-2xl rounded-tl-sm text-slate-200 leading-relaxed shadow-sm max-w-[85%]">
            <p class="font-bold text-white mb-1">আসসালামু আলাইকুম! 👋</p>
            <p>আমি <strong>Habib iFix AI Assistant</strong>। আপনার মোবাইলের কোনো সমস্যা (ডিসপ্লে, ডেড ফোন, এফআরপি লক, ব্যাটারি ড্রেন বা সফটওয়্যার ফিক্স) থাকলে মডেল ও সমস্যাটি লিখে পাঠান।</p>
            <div class="mt-2.5 pt-2 border-t border-white/10 text-[10px] text-cyan-300 font-medium">
              💡 আপনি বাংলা বা ইংরেজি যেকোনো ভাষায় প্রশ্ন করতে পারেন।
            </div>
          </div>
        </div>
      </div>

      <!-- Chat Input Area -->
      <form id="habib-ai-form" class="p-3 bg-slate-900/95 border-t border-white/10 flex items-center gap-2">
        <input type="text" id="habib-ai-input" required placeholder="আপনার ফোনের সমস্যা বা মডেল লিখুন..." class="flex-1 bg-white/5 border border-white/10 focus:border-indigo-500/80 rounded-2xl px-4 py-2.5 text-xs text-white placeholder-slate-400 outline-none transition-colors">
        <button type="submit" id="habib-ai-submit" class="w-10 h-10 rounded-2xl bg-gradient-to-r from-indigo-600 to-cyan-500 hover:opacity-90 text-white flex items-center justify-center shadow-lg shadow-indigo-600/30 shrink-0 transition-opacity">
          <i class="fa-solid fa-paper-plane text-xs"></i>
        </button>
      </form>

    </div>
  </div>
  `;

  document.addEventListener('DOMContentLoaded', () => {
    if (!document.getElementById('habib-ai-widget')) {
      const div = document.createElement('div');
      div.innerHTML = widgetHTML;
      document.body.appendChild(div);
      initAIWidget();
    }
  });

  function formatMarkdown(text) {
    if (!text) return '';
    return text
      .replace(/^### (.*$)/gim, '<h4 class="font-bold text-white text-sm my-1 text-indigo-300">$1</h4>')
      .replace(/^## (.*$)/gim, '<h3 class="font-extrabold text-white text-base my-1.5 text-cyan-300">$1</h3>')
      .replace(/^# (.*$)/gim, '<h2 class="font-black text-white text-lg my-2">$1</h2>')
      .replace(/\*\*(.*?)\*\*/g, '<strong class="font-bold text-white">$1</strong>')
      .replace(/\*(.*?)\*/g, '<em class="text-slate-300">$1</em>')
      .replace(/^• (.*$)/gim, '<li class="ml-4 list-disc text-slate-200 my-0.5">$1</li>')
      .replace(/\n/g, '<br/>');
  }

  function initAIWidget() {
    const trigger = document.getElementById('habib-ai-trigger');
    const panel = document.getElementById('habib-ai-panel');
    const closeBtn = document.getElementById('habib-ai-close');
    const clearBtn = document.getElementById('habib-ai-clear');
    const form = document.getElementById('habib-ai-form');
    const input = document.getElementById('habib-ai-input');
    const messages = document.getElementById('habib-ai-messages');
    const chips = document.querySelectorAll('.ai-chip');

    let isOpen = false;

    function toggleChat(force) {
      isOpen = typeof force === 'boolean' ? force : !isOpen;
      if (isOpen) {
        panel.classList.remove('hidden');
        panel.classList.add('flex');
        input.focus();
        playBeep(700, 0.05);
      } else {
        panel.classList.add('hidden');
        panel.classList.remove('flex');
      }
    }

    if (trigger) trigger.addEventListener('click', () => toggleChat());
    if (closeBtn) closeBtn.addEventListener('click', () => toggleChat(false));

    if (clearBtn) {
      clearBtn.addEventListener('click', () => {
        messages.innerHTML = `
          <div class="flex items-start gap-3">
            <div class="w-7 h-7 rounded-xl bg-gradient-to-tr from-cyan-500 to-indigo-600 flex items-center justify-center text-white shrink-0 mt-0.5">
              <i class="fa-solid fa-bolt text-xs"></i>
            </div>
            <div class="bg-slate-900/90 border border-indigo-500/20 p-3.5 rounded-2xl rounded-tl-sm text-slate-200 leading-relaxed shadow-sm max-w-[85%]">
              <p class="font-bold text-white mb-1">চ্যাট ক্লিয়ার করা হয়েছে ✨</p>
              <p>আপনার মোবাইল সম্পর্কিত যেকোনো প্রশ্ন বা সমস্যা জিজ্ঞাসা করতে পারেন।</p>
            </div>
          </div>
        `;
      });
    }

    chips.forEach(chip => {
      chip.addEventListener('click', () => {
        const text = chip.innerText.trim();
        input.value = text;
        form.dispatchEvent(new Event('submit'));
      });
    });

    if (form) {
      form.addEventListener('submit', async (e) => {
        e.preventDefault();
        const text = input.value.trim();
        if (!text) return;
        input.value = '';

        appendMessage('user', text);
        playBeep(850, 0.05);

        const loadingId = 'loading-' + Date.now();
        appendLoading(loadingId);

        try {
          const res = await fetch('/api/ai-chat', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ message: text })
          });
          const data = await res.json();
          removeLoading(loadingId);

          if (data.success && data.text) {
            appendMessage('ai', data.text, data.diagnosis);
            playBeep(980, 0.08);
          } else {
            appendMessage('ai', 'দুঃখিত, বর্তমানে যোগাযোগ করতে সমস্যা হচ্ছে। অনুগ্রহ করে সরাসরি হাবিব ভাইয়ের সাথে যোগাযোগ করুন: 01868461577');
          }
        } catch (err) {
          removeLoading(loadingId);
          appendMessage('ai', 'নেটওয়ার্ক সংযোগে সমস্যা হয়েছে। সরাসরি কল করুন: 01868461577');
        }
      });
    }

    function appendMessage(role, content, diagnosis = null) {
      const msgDiv = document.createElement('div');
      msgDiv.className = `flex items-start gap-3 ${role === 'user' ? 'justify-end' : ''} animate-fade-in-up`;

      if (role === 'user') {
        msgDiv.innerHTML = `
          <div class="bg-gradient-to-r from-indigo-600 to-purple-600 text-white p-3 rounded-2xl rounded-tr-sm max-w-[85%] shadow-md leading-relaxed break-words font-medium">
            ${escapeHtml(content)}
          </div>
          <div class="w-7 h-7 rounded-xl bg-slate-800 border border-white/20 flex items-center justify-center text-slate-300 text-xs shrink-0 mt-0.5">
            <i class="fa-solid fa-user"></i>
          </div>
        `;
      } else {
        const diagBadge = diagnosis ? `
          <div class="mb-2 p-2.5 rounded-xl bg-slate-950/70 border border-white/10 flex flex-wrap items-center justify-between gap-2 text-[10px]">
            <span class="inline-flex items-center gap-1 font-bold text-cyan-300">
              <i class="fa-solid fa-microchip text-indigo-400"></i> ${escapeHtml(diagnosis.category || 'ডায়াগনসিস')}
            </span>
            <div class="flex items-center gap-2">
              <span class="bg-indigo-500/20 text-indigo-300 border border-indigo-500/40 px-2 py-0.5 rounded-md font-mono font-bold">
                💰 ${escapeHtml(diagnosis.estimatedCost || 'সাশ্রয়ী ফি')}
              </span>
              <span class="bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 px-2 py-0.5 rounded-md font-mono font-bold">
                ⏱️ ${escapeHtml(diagnosis.repairTime || 'দ্রুত ডেলিভারি')}
              </span>
            </div>
          </div>
        ` : '';

        const actionButtons = `
          <div class="mt-3 pt-2.5 border-t border-white/10 flex flex-wrap items-center gap-2">
            <button onclick="window.bookFromAI('${escapeHtml(diagnosis ? diagnosis.title : 'Mobile Diagnostic')}', '${escapeHtml(diagnosis ? diagnosis.estimatedCost : '৳৫০০')}')" class="bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold text-[10px] px-3 py-1.5 rounded-lg flex items-center gap-1.5 shadow transition-all cursor-pointer">
              <i class="fa-solid fa-calendar-check"></i> বুকিং দিন
            </button>
            <a href="https://wa.me/8801868461577?text=${encodeURIComponent('আসসালামু আলাইকুম হাবিব ভাই, আমি ওয়েবসাইট থেকে এআই ডায়াগনসিস এর পর যোগাযোগ করছি: ' + (diagnosis ? diagnosis.title : 'সার্ভিস কোয়েরি'))}" target="_blank" class="bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 border border-emerald-500/40 text-[10px] font-bold px-3 py-1.5 rounded-lg flex items-center gap-1.5 transition-colors">
              <i class="fa-brands fa-whatsapp text-emerald-400"></i> হোয়াটসঅ্যাপ
            </a>
            <a href="tel:01868461577" class="bg-white/10 hover:bg-white/20 text-slate-200 text-[10px] font-semibold px-2.5 py-1.5 rounded-lg flex items-center gap-1 transition-colors">
              <i class="fa-solid fa-phone text-indigo-400"></i> কল করুন
            </a>
          </div>
        `;

        msgDiv.innerHTML = `
          <div class="w-7 h-7 rounded-xl bg-gradient-to-tr from-cyan-500 to-indigo-600 flex items-center justify-center text-white shrink-0 mt-0.5 shadow-md shadow-cyan-500/20">
            <i class="fa-solid fa-robot text-xs"></i>
          </div>
          <div class="bg-slate-900/95 border border-indigo-500/30 p-3.5 rounded-2xl rounded-tl-sm text-slate-200 leading-relaxed shadow-lg max-w-[92%]">
            ${diagBadge}
            <div class="prose prose-invert prose-xs text-xs space-y-1.5 font-medium leading-relaxed">
              ${formatMarkdown(content)}
            </div>
            ${actionButtons}
          </div>
        `;
      }

      messages.appendChild(msgDiv);
      messages.scrollTop = messages.scrollHeight;
    }

    function appendLoading(id) {
      const div = document.createElement('div');
      div.id = id;
      div.className = 'flex items-center gap-3 animate-fade-in-up';
      div.innerHTML = `
        <div class="w-7 h-7 rounded-xl bg-gradient-to-tr from-cyan-500 to-indigo-600 flex items-center justify-center text-white shrink-0">
          <i class="fa-solid fa-spinner animate-spin text-xs"></i>
        </div>
        <div class="bg-slate-900/80 border border-white/10 px-4 py-2.5 rounded-2xl text-slate-400 text-xs flex items-center gap-2">
          <span>AI এনালাইসিস করছে...</span>
          <span class="flex gap-1">
            <span class="w-1.5 h-1.5 bg-cyan-400 rounded-full animate-bounce"></span>
            <span class="w-1.5 h-1.5 bg-indigo-400 rounded-full animate-bounce [animation-delay:0.2s]"></span>
            <span class="w-1.5 h-1.5 bg-purple-400 rounded-full animate-bounce [animation-delay:0.4s]"></span>
          </span>
        </div>
      `;
      messages.appendChild(div);
      messages.scrollTop = messages.scrollHeight;
    }

    function removeLoading(id) {
      const el = document.getElementById(id);
      if (el) el.remove();
    }

    function escapeHtml(text) {
      if (!text) return '';
      return text.replace(/[&<>"']/g, function(m) {
        return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#039;' }[m];
      });
    }

    window.openHabibAI = function(prefill) {
      toggleChat(true);
      if (prefill) {
        input.value = prefill;
        form.dispatchEvent(new Event('submit'));
      }
    };

    window.bookFromAI = function(planName, planPrice) {
      if (typeof window.openPlanModal === 'function') {
        window.openPlanModal(planName, planPrice);
      } else {
        window.location.href = `index.html#pricingPlans`;
      }
    };
  }
})();
