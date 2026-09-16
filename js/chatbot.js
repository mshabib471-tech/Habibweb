// Habib iFix Live AI Chatbot Script for n8n Webhook
(function() {
    // Inject Custom Styles for Chat Widget
    if (!document.getElementById('habibChatStyle')) {
        const style = document.createElement('style');
        style.id = 'habibChatStyle';
        style.innerHTML = `
            .habib-glass-box {
                background: rgba(255, 255, 255, 0.95);
                backdrop-filter: blur(20px);
                -webkit-backdrop-filter: blur(20px);
                border: 1px solid rgba(255, 255, 255, 0.8);
                box-shadow: 0 15px 35px rgba(0, 0, 0, 0.1);
            }
            .habib-chat-icon-btn {
                background: #000000;
                box-shadow: 0 10px 25px rgba(0, 0, 0, 0.2);
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

    // Generate Unique Visitor ID
    let habibUserId = localStorage.getItem('habib_visitor_id');
    if (!habibUserId) {
        habibUserId = 'User_' + Math.floor(1000 + Math.random() * 9000);
        localStorage.setItem('habib_visitor_id', habibUserId);
    }

    // Chat Widget HTML Structure
    const chatWidgetHTML = `
    <div id="habibAiChatWidget" style="position: fixed; bottom: 20px; right: 20px; z-index: 99999; pointer-events: auto;">
        <!-- Toggle Button -->
        <button onclick="toggleHabibChatWindow()" id="chatToggleButton" class="habib-chat-icon-btn w-12 h-12 sm:w-14 sm:h-14 rounded-full flex items-center justify-center transition-all transform hover:scale-110 cursor-pointer text-white text-base sm:text-lg">
            <i class="fa-solid fa-message" id="chatButtonIcon"></i>
        </button>

        <!-- Chat Window -->
        <div id="habibChatWindow" class="hidden absolute bottom-16 right-0 w-[300px] sm:w-[350px] h-[420px] habib-glass-box rounded-[28px] flex flex-col overflow-hidden border border-white habib-chat-reveal">
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

            <!-- Chat Messages Body -->
            <div id="habibChatMessages" class="flex-grow p-4 overflow-y-auto flex flex-col gap-3 bg-slate-50/50">
                <div class="flex gap-2 max-w-[85%]">
                    <div class="w-6 h-6 rounded-full bg-indigo-100 flex items-center justify-center text-[8px] font-bold text-indigo-600 shrink-0 mt-auto shadow-sm">AI</div>
                    <div class="bg-white border border-slate-100 text-xs text-slate-600 p-3 rounded-2xl rounded-bl-none shadow-sm font-medium leading-relaxed">
                        আসসালামু আলাইকুম! হাবিব iFix এ আপনাকে স্বাগতম। আপনার যেকোনো প্রশ্ন বা সার্ভিস সম্পর্কে জানতে এখানে মেসেজ করুন।
                    </div>
                </div>
            </div>

            <!-- Input Box -->
            <div class="p-3 border-t border-slate-100 bg-white/80 backdrop-blur-md flex gap-2">
                <input type="text" id="habibChatInputBox" placeholder="Type a message..." class="flex-grow bg-white border border-slate-200 rounded-xl px-4 py-2 text-xs outline-none focus:border-indigo-400 transition-colors text-slate-700">
                <button onclick="sendHabibMessageToN8N()" class="bg-black text-white w-10 h-10 rounded-xl flex items-center justify-center text-xs hover:scale-105 transition-transform shadow-md shrink-0">
                    <i class="fa-solid fa-paper-plane"></i>
                </button>
            </div>
        </div>
    </div>
    `;

    // Append Widget to Body
    const div = document.createElement('div');
    div.innerHTML = chatWidgetHTML;
    document.body.appendChild(div);

    // Bind Enter key event
    setTimeout(() => {
        const inputBox = document.getElementById('habibChatInputBox');
        if (inputBox) {
            inputBox.addEventListener('keypress', function(event) {
                if (event.key === 'Enter') {
                    sendHabibMessageToN8N();
                }
            });
        }
    }, 500);

    window.habibCurrentUserId = habibUserId;
})();

// Toggle Chat Window Function
function toggleHabibChatWindow() {
    const win = document.getElementById('habibChatWindow');
    const icon = document.getElementById('chatButtonIcon');
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

// Send Message to n8n Webhook
async function sendHabibMessageToN8N() {
    const input = document.getElementById('habibChatInputBox');
    const msgBox = document.getElementById('habibChatMessages');
    if (!input || !msgBox) return;

    const text = input.value.trim();
    if (!text) return;

    // Append User Message
    msgBox.innerHTML += `
        <div class="flex gap-2 max-w-[85%] self-end">
            <div class="bg-indigo-600 text-white text-xs p-3 rounded-2xl rounded-br-none shadow-md font-medium leading-relaxed">${escapeHtml(text)}</div>
        </div>`;
    input.value = '';
    msgBox.scrollTop = msgBox.scrollHeight;

    // Loading Animation ID
    const loadId = 'load_' + Date.now();
    msgBox.innerHTML += `
        <div id="${loadId}" class="flex gap-2 max-w-[85%]">
            <div class="w-6 h-6 rounded-full bg-indigo-100 flex items-center justify-center text-[8px] font-bold text-indigo-600 shrink-0 mt-auto shadow-sm">AI</div>
            <div class="bg-white border border-slate-100 text-xs text-slate-400 p-3 rounded-2xl rounded-bl-none shadow-sm italic">Typing...</div>
        </div>`;
    msgBox.scrollTop = msgBox.scrollHeight;

    const n8nWebhookURL = "https://habibifix.app.n8n.cloud/webhook/bfe53675-dcc8-4117-914e-b5f814c2b120/chat";

    try {
        const response = await fetch(n8nWebhookURL, {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                action: "user_message",
                userId: window.habibCurrentUserId || "User_1234",
                message: text
            })
        });

        // Remove Loading Element
        const loaderEl = document.getElementById(loadId);
        if (loaderEl) loaderEl.remove();

        let botReply = "দুঃখিত, এই মুহূর্তে উত্তর দিতে পারছি না। একটু পরে আবার চেষ্টা করুন।";
        
        if (response.ok) {
            const data = await response.json();
            // n8n থেকে রিসিভ হওয়া আউটপুট ফরম্যাট অনুযায়ী ফিল্ড সেট করা (যেমন data.output বা data.reply বা সরাসরি টেক্সট)
            botReply = data.output || data.reply || data.message || JSON.stringify(data);
        }

        // Append Bot Reply
        msgBox.innerHTML += `
            <div class="flex gap-2 max-w-[85%]">
                <div class="w-6 h-6 rounded-full bg-indigo-100 flex items-center justify-center text-[8px] font-bold text-indigo-600 shrink-0 mt-auto shadow-sm">AI</div>
                <div class="bg-white border border-slate-100 text-xs text-slate-600 p-3 rounded-2xl rounded-bl-none shadow-sm font-medium leading-relaxed">${formatBotReply(botReply)}</div>
            </div>`;
        msgBox.scrollTop = msgBox.scrollHeight;

    } catch (err) {
        console.error("n8n Chat Error:", err);
        const loaderEl = document.getElementById(loadId);
        if (loaderEl) loaderEl.remove();

        msgBox.innerHTML += `
            <div class="flex gap-2 max-w-[85%]">
                <div class="w-6 h-6 rounded-full bg-red-100 flex items-center justify-center text-[8px] font-bold text-red-600 shrink-0 mt-auto shadow-sm">AI</div>
                <div class="bg-white border border-red-100 text-xs text-red-500 p-3 rounded-2xl rounded-bl-none shadow-sm">সার্ভার কানেকশন ত্রুটি! অনুগ্রহ করে সরাসরি কল করুন: +880 1868 461577</div>
            </div>`;
        msgBox.scrollTop = msgBox.scrollHeight;
    }
}

function escapeHtml(value) {
    return String(value).replace(/[&<>"']/g, function(ch) {
        return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[ch];
    });
}

function formatBotReply(text) {
    return String(text).replace(/\*\*(.*?)\*\*/g, '<b>$1</b>').replace(/\n/g, '<br>');
}
