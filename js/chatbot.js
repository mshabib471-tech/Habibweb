// Habib iFix Direct Browser AI Chatbot (No Webhook/n8n needed)
(function() {
    const oldWidget = document.getElementById('habibAiChatWidget');
    if (oldWidget) oldWidget.remove();

    if (!document.getElementById('habibChatStyle')) {
        const style = document.createElement('style');
        style.id = 'habibChatStyle';
        style.innerHTML = `
            .habib-glass-box {
                background: rgba(255, 255, 255, 0.98);
                backdrop-filter: blur(20px);
                border: 1px solid rgba(255, 255, 255, 0.9);
                box-shadow: 0 20px 40px rgba(0, 0, 0, 0.15);
            }
        `;
        document.head.appendChild(style);
    }

    const chatWidgetHTML = `
    <div id="habibAiChatWidget" style="position: fixed; bottom: 20px; right: 20px; z-index: 99999; font-family: 'Inter', sans-serif;">
        <button onclick="toggleHabibChatWindow()" id="habibChatToggleBtn" class="w-12 h-12 sm:w-14 sm:h-14 bg-black rounded-full flex items-center justify-center shadow-2xl hover:scale-110 transition-transform text-white border-2 border-white/20 cursor-pointer">
            <i class="fa-solid fa-message text-base sm:text-lg" id="habibChatBtnIcon"></i>
        </button>

        <div id="habibChatWindow" class="hidden absolute bottom-16 right-0 w-[300px] sm:w-[360px] h-[420px] habib-glass-box rounded-[28px] flex flex-col overflow-hidden border border-slate-200">
            <div class="bg-black p-4 flex justify-between items-center rounded-t-[28px]">
                <div class="flex items-center gap-3">
                    <div class="w-8 h-8 rounded-full bg-indigo-500 flex items-center justify-center text-white text-[10px] font-bold shadow-lg">AI</div>
                    <div>
                        <h3 class="text-white font-bold text-sm tracking-wide">Habib AI</h3>
                        <p class="text-white/60 text-[9px] flex items-center gap-1 uppercase tracking-widest"><span class="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse"></span> Online</p>
                    </div>
                </div>
                <button onclick="toggleHabibChatWindow()" class="text-white/50 hover:text-white w-8 h-8 flex items-center justify-center rounded-full hover:bg-white/10 transition-colors">
                    <i class="fa-solid fa-xmark"></i>
                </button>
            </div>

            <div id="habibChatMessages" class="flex-grow p-4 overflow-y-auto flex flex-col gap-3 bg-slate-50/50">
                <div class="flex gap-2 max-w-[85%]">
                    <div class="w-6 h-6 rounded-full bg-indigo-100 flex items-center justify-center text-[8px] font-bold text-indigo-600 shrink-0 mt-auto shadow-sm">AI</div>
                    <div class="bg-white border border-slate-100 text-xs text-slate-600 p-3 rounded-2xl rounded-bl-none shadow-sm font-medium leading-relaxed">
                        আসসালামু আলাইকুম! হাবিব iFix এ আপনাকে স্বাগতম। আপনার যেকোনো প্রশ্ন বা সার্ভিস সম্পর্কে জানতে এখানে মেসেজ করুন।
                    </div>
                </div>
            </div>

            <div class="p-3 border-t border-slate-100 bg-white/90 backdrop-blur-md flex gap-2 items-center">
                <input type="text" id="habibChatInputBox" placeholder="Type a message..." class="flex-grow bg-slate-100 border border-slate-200 rounded-xl px-4 py-2.5 text-xs outline-none focus:border-indigo-400 transition-colors text-slate-700">
                <button onclick="sendHabibMessageDirect()" class="bg-black text-white w-10 h-10 rounded-xl flex items-center justify-center text-xs hover:scale-105 transition-transform shadow-md shrink-0 cursor-pointer">
                    <i class="fa-solid fa-paper-plane"></i>
                </button>
            </div>
        </div>
    </div>
    `;

    const div = document.createElement('div');
    div.innerHTML = chatWidgetHTML;
    document.body.appendChild(div);

    setTimeout(() => {
        const inputBox = document.getElementById('habibChatInputBox');
        if (inputBox) {
            inputBox.addEventListener('keypress', function(e) {
                if (e.key === 'Enter') sendHabibMessageDirect();
            });
        }
    }, 300);
})();

function toggleHabibChatWindow() {
    const win = document.getElementById('habibChatWindow');
    const icon = document.getElementById('habibChatBtnIcon');
    if (!win || !icon) return;

    if (win.classList.contains('hidden')) {
        win.classList.remove('hidden');
        icon.classList.remove('fa-message');
        icon.classList.add('fa-xmark');
    } else {
        win.classList.add('hidden');
        icon.classList.remove('fa-xmark');
        icon.classList.add('fa-message');
    }
}

async function sendHabibMessageDirect() {
    const input = document.getElementById('habibChatInputBox');
    const msgBox = document.getElementById('habibChatMessages');
    if (!input || !msgBox) return;

    const text = input.value.trim();
    if (!text) return;

    msgBox.innerHTML += `
        <div class="flex gap-2 max-w-[85%] self-end">
            <div class="bg-indigo-600 text-white text-xs p-3 rounded-2xl rounded-br-none shadow-md font-medium leading-relaxed">${escapeHtml(text)}</div>
        </div>`;
    input.value = '';
    msgBox.scrollTop = msgBox.scrollHeight;

    const loadId = 'load_' + Date.now();
    msgBox.innerHTML += `
        <div id="${loadId}" class="flex gap-2 max-w-[85%]">
            <div class="w-6 h-6 rounded-full bg-indigo-100 flex items-center justify-center text-[8px] font-bold text-indigo-600 shrink-0 mt-auto shadow-sm">AI</div>
            <div class="bg-white border border-slate-100 text-xs text-slate-400 p-3 rounded-2xl rounded-bl-none shadow-sm italic">Typing...</div>
        </div>`;
    msgBox.scrollTop = msgBox.scrollHeight;

    // YOUR GEMINI API KEY HERE
    const GEMINI_API_KEY = "আপনার_জেমিনি_এপিআই_কি_এখানে_বসান"; 
    const systemPrompt = "You are Habib iFix AI Assistant, the official virtual assistant for Habib iFix in Gachbaria, Chattogram. Owner: Habibur Rahman, Phone: +880 1868 461577. Reply concisely in the user's language (Bengali or English).";

    try {
        const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${GEMINI_API_KEY}`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                contents: [
                    { role: "user", parts: [{ text: systemPrompt + "\n\nUser Question: " + text }] }
                ]
            })
        });

        const loaderEl = document.getElementById(loadId);
        if (loaderEl) loaderEl.remove();

        let replyText = "দুঃখিত, এখন উত্তর দিতে পারছি না। কল করুন: +880 1868 461577";

        if (response.ok) {
            const data = await response.json();
            if (data.candidates && data.candidates[0].content && data.candidates[0].content.parts[0]) {
                replyText = data.candidates[0].content.parts[0].text;
            }
        }

        msgBox.innerHTML += `
            <div class="flex gap-2 max-w-[85%]">
                <div class="w-6 h-6 rounded-full bg-indigo-100 flex items-center justify-center text-[8px] font-bold text-indigo-600 shrink-0 mt-auto shadow-sm">AI</div>
                <div class="bg-white border border-slate-100 text-xs text-slate-600 p-3 rounded-2xl rounded-bl-none shadow-sm font-medium leading-relaxed">${formatReply(replyText)}</div>
            </div>`;
        msgBox.scrollTop = msgBox.scrollHeight;

    } catch (error) {
        console.error("Direct AI Error:", error);
        const loaderEl = document.getElementById(loadId);
        if (loaderEl) loaderEl.remove();

        msgBox.innerHTML += `
            <div class="flex gap-2 max-w-[85%]">
                <div class="w-6 h-6 rounded-full bg-indigo-100 flex items-center justify-center text-[8px] font-bold text-indigo-600 shrink-0 mt-auto shadow-sm">AI</div>
                <div class="bg-white border border-slate-100 text-xs text-slate-600 p-3 rounded-2xl rounded-bl-none shadow-sm font-medium leading-relaxed">নেটওয়ার্ক সমস্যা। কল করুন: +880 1868 461577</div>
            </div>`;
        msgBox.scrollTop = msgBox.scrollHeight;
    }
}

function escapeHtml(str) {
    return String(str).replace(/[&<>"']/g, function(m) {
        return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m];
    });
}

function formatReply(text) {
    return String(text).replace(/\*\*(.*?)\*\*/g, '<b>$1</b>').replace(/\n/g, '<br>');
}
