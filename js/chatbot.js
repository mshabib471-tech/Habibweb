// Habib iFix Live AI Chatbot Script (Direct Client-Side Fallback & n8n Handler)
(function() {
    // Remove duplicate old widgets if any exist
    const oldWidget = document.getElementById('habibAiChatWidget');
    if (oldWidget) oldWidget.remove();

    // Inject Custom Styles
    if (!document.getElementById('habibChatStyle')) {
        const style = document.createElement('style');
        style.id = 'habibChatStyle';
        style.innerHTML = `
            .habib-glass-box {
                background: rgba(255, 255, 255, 0.98);
                backdrop-filter: blur(20px);
                -webkit-backdrop-filter: blur(20px);
                border: 1px solid rgba(255, 255, 255, 0.9);
                box-shadow: 0 20px 40px rgba(0, 0, 0, 0.15);
            }
            @keyframes chatReveal {
                from { opacity: 0; transform: scale(0.95) translateY(20px); }
                to { opacity: 1; transform: scale(1) translateY(0); }
            }
            .habib-chat-reveal {
                animation: chatReveal 0.3s ease forwards;
            }
        `;
        document.head.appendChild(style);
    }

    // Unique User ID
    let habibUserId = localStorage.getItem('habib_visitor_id');
    if (!habibUserId) {
        habibUserId = 'User_' + Math.floor(1000 + Math.random() * 9000);
        localStorage.setItem('habib_visitor_id', habibUserId);
    }

    // Widget HTML Structure
    const chatWidgetHTML = `
    <div id="habibAiChatWidget" style="position: fixed; bottom: 20px; right: 20px; z-index: 99999; font-family: 'Inter', sans-serif;">
        <!-- Toggle Button -->
        <button onclick="toggleHabibChatWindow()" id="habibChatToggleBtn" class="w-12 h-12 sm:w-14 sm:h-14 bg-black rounded-full flex items-center justify-center shadow-2xl hover:scale-110 transition-transform text-white border-2 border-white/20 cursor-pointer">
            <i class="fa-solid fa-message text-base sm:text-lg" id="habibChatBtnIcon"></i>
        </button>

        <!-- Chat Window -->
        <div id="habibChatWindow" class="hidden absolute bottom-16 right-0 w-[300px] sm:w-[360px] h-[420px] habib-glass-box rounded-[28px] flex flex-col overflow-hidden habib-chat-reveal border border-slate-200">
            <!-- Header -->
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

            <!-- Messages Body -->
            <div id="habibChatMessages" class="flex-grow p-4 overflow-y-auto flex flex-col gap-3 bg-slate-50/50">
                <div class="flex gap-2 max-w-[85%]">
                    <div class="w-6 h-6 rounded-full bg-indigo-100 flex items-center justify-center text-[8px] font-bold text-indigo-600 shrink-0 mt-auto shadow-sm">AI</div>
                    <div class="bg-white border border-slate-100 text-xs text-slate-600 p-3 rounded-2xl rounded-bl-none shadow-sm font-medium leading-relaxed">
                        আসসালামু আলাইকুম! হাবিব iFix এ আপনাকে স্বাগতম। আপনার যেকোনো প্রশ্ন বা সার্ভিস সম্পর্কে জানতে এখানে মেসেজ করুন।
                    </div>
                </div>
            </div>

            <!-- Input Box -->
            <div class="p-3 border-t border-slate-100 bg-white/90 backdrop-blur-md flex gap-2 items-center">
                <input type="text" id="habibChatInputBox" placeholder="Type a message..." class="flex-grow bg-slate-100 border border-slate-200 rounded-xl px-4 py-2.5 text-xs outline-none focus:border-indigo-400 transition-colors text-slate-700">
                <button onclick="sendHabibMessageToN8N()" class="bg-black text-white w-10 h-10 rounded-xl flex items-center justify-center text-xs hover:scale-105 transition-transform shadow-md shrink-0 cursor-pointer">
                    <i class="fa-solid fa-paper-plane"></i>
                </button>
            </div>
        </div>
    </div>
    `;

    const div = document.createElement('div');
    div.innerHTML = chatWidgetHTML;
    document.body.appendChild(div);

    // Enter key listener
    setTimeout(() => {
        const inputBox = document.getElementById('habibChatInputBox');
        if (inputBox) {
            inputBox.addEventListener('keypress', function(e) {
                if (e.key === 'Enter') sendHabibMessageToN8N();
            });
        }
    }, 300);

    window.habibUserId = habibUserId;
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

async function sendHabibMessageToN8N() {
    const input = document.getElementById('habibChatInputBox');
    const msgBox = document.getElementById('habibChatMessages');
    if (!input || !msgBox) return;

    const text = input.value.trim();
    if (!text) return;

    // Show User Message
    msgBox.innerHTML += `
        <div class="flex gap-2 max-w-[85%] self-end">
            <div class="bg-indigo-600 text-white text-xs p-3 rounded-2xl rounded-br-none shadow-md font-medium leading-relaxed">${escapeHtml(text)}</div>
        </div>`;
    input.value = '';
    msgBox.scrollTop = msgBox.scrollHeight;

    // Typing Loader
    const loadId = 'load_' + Date.now();
    msgBox.innerHTML += `
        <div id="${loadId}" class="flex gap-2 max-w-[85%]">
            <div class="w-6 h-6 rounded-full bg-indigo-100 flex items-center justify-center text-[8px] font-bold text-indigo-600 shrink-0 mt-auto shadow-sm">AI</div>
            <div class="bg-white border border-slate-100 text-xs text-slate-400 p-3 rounded-2xl rounded-bl-none shadow-sm italic">Typing...</div>
        </div>`;
    msgBox.scrollTop = msgBox.scrollHeight;

    const webhookURL = "https://habibifix.app.n8n.cloud/webhook/bfe53675-dcc8-4117-914e-b5f814c2b120/chat";

    try {
        const response = await fetch(webhookURL, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                action: "user_message",
                userId: window.habibUserId || "User_1234",
                message: text
            })
        });

        const loaderEl = document.getElementById(loadId);
        if (loaderEl) loaderEl.remove();

        let replyText = "আপনার মেসেজটি সফলভাবে পাওয়া গেছে! আমাদের প্রতিনিধি বা এআই খুব শীঘ্রই আপনাকে সাহায্য করবে। জরুরি প্রয়োজনে কল করুন: +880 1868 461577";

        if (response.ok) {
            const data = await response.json();
            // n8n থেকে আসা রেসপন্স হ্যান্ডেল করা
            replyText = data.output || data.reply || data.message || (typeof data === 'string' ? data : replyText);
        }

        msgBox.innerHTML += `
            <div class="flex gap-2 max-w-[85%]">
                <div class="w-6 h-6 rounded-full bg-indigo-100 flex items-center justify-center text-[8px] font-bold text-indigo-600 shrink-0 mt-auto shadow-sm">AI</div>
                <div class="bg-white border border-slate-100 text-xs text-slate-600 p-3 rounded-2xl rounded-bl-none shadow-sm font-medium leading-relaxed">${formatReply(replyText)}</div>
            </div>`;
        msgBox.scrollTop = msgBox.scrollHeight;

    } catch (error) {
        console.error("Chat Error:", error);
        const loaderEl = document.getElementById(loadId);
        if (loaderEl) loaderEl.remove();

        // যদি n8n এ CORS বা নেটওয়ার্ক সমস্যা হয়, তবুও কাস্টমার যেন প্রফেশনাল উত্তর পায়
        let smartReply = "ধন্যবাদ! আপনার প্রশ্নটি আমাদের কাছে পৌঁছেছে। বিস্তারিত জানতে কল করুন: +880 1868 461577";
        const lowerTxt = text.toLowerCase();
        
        if(lowerTxt.includes('price') || lowerTxt.includes('দাম') || lowerTxt.includes('খরচ')) {
            smartReply = "আমাদের সাধারণ রিপেয়ার খরচ ৳৪০০ থেকে ৳৫০০০ এর মধ্যে হয়ে থাকে। নির্দিষ্ট মডেল জানাতে কল করুন: +880 1868 461577";
        } else if(lowerTxt.includes('location') || lowerTxt.includes('কোথায়') || lowerTxt.includes('ঠিকানা')) {
            smartReply = "আমাদের শপটি গাছবাড়িয়া, চট্টগ্রামে অবস্থিত।";
        } else if(lowerTxt.includes('owner') || lowerTxt.includes('কে')) {
            smartReply = "হাবিব iFix এর প্রতিষ্ঠাতা ও মূল টেকনিশিয়ান হলেন Habibur Rahman (হাবিবুর রহমান)।";
        }

        msgBox.innerHTML += `
            <div class="flex gap-2 max-w-[85%]">
                <div class="w-6 h-6 rounded-full bg-indigo-100 flex items-center justify-center text-[8px] font-bold text-indigo-600 shrink-0 mt-auto shadow-sm">AI</div>
                <div class="bg-white border border-slate-100 text-xs text-slate-600 p-3 rounded-2xl rounded-bl-none shadow-sm font-medium leading-relaxed">${smartReply}</div>
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
