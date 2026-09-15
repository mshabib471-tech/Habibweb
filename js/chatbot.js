// Global Habib iFix Live Support Chatbot (No AI, Manual Admin Reply via Google Sheets)
(function() {
    if (!document.getElementById('habibChatStyle')) {
        const style = document.createElement('style');
        style.id = 'habibChatStyle';
        style.innerHTML = `
            .habib-glass-box {
                background: rgba(15, 23, 42, 0.95);
                backdrop-filter: blur(25px);
                -webkit-backdrop-filter: blur(25px);
                border: 1px solid rgba(255, 255, 255, 0.15);
                box-shadow: 0 20px 50px rgba(0, 0, 0, 0.4);
            }
            .habib-chat-icon-btn {
                background: rgba(255, 255, 255, 0.08);
                backdrop-filter: blur(15px);
                -webkit-backdrop-filter: blur(15px);
                border: 1px solid rgba(255, 255, 255, 0.25);
                box-shadow: 0 10px 30px rgba(99, 102, 241, 0.3);
            }
        `;
        document.head.appendChild(style);
    }

    const chatWidgetHTML = `
    <div id="habibAiChatWidget" style="position: fixed; bottom: 24px; right: 24px; z-index: 999999; pointer-events: auto;">
        <!-- Toggle Button with Glass Image -->
        <button onclick="toggleHabibChatWindow()" id="chatToggleButton" class="habib-chat-icon-btn w-14 h-14 rounded-full flex items-center justify-center transition-all transform hover:scale-110 cursor-pointer overflow-hidden p-2.5">
            <img src="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTOSPaC38Uw4MVPIwoo_we5Ns0ZJkLjnx9C6u5uBttE0Q&s=10" alt="Live Chat" class="w-full h-full object-cover rounded-full">
        </button>

        <!-- Chat Window Box -->
        <div id="habibChatWindow" class="hidden absolute bottom-20 right-0 w-[320px] sm:w-[360px] h-[480px] habib-glass-box rounded-3xl flex flex-col overflow-hidden text-slate-200 shadow-2xl">
            <!-- Header -->
            <div class="bg-indigo-600/30 p-4 border-b border-white/10 flex justify-between items-center">
                <div class="flex items-center gap-2.5">
                    <div class="w-3 h-3 rounded-full bg-emerald-400 animate-pulse"></div>
                    <span class="font-bold text-white text-sm">Habib iFix Live Support</span>
                </div>
                <button onclick="toggleHabibChatWindow()" class="text-slate-400 hover:text-white w-7 h-7 rounded-full flex items-center justify-center bg-white/10">
                    <i class="fa-solid fa-xmark text-xs"></i>
                </button>
            </div>

            <!-- Messages Body -->
            <div id="habibChatMessages" class="flex-grow p-4 overflow-y-auto space-y-3 text-xs text-slate-200">
                <div class="bg-indigo-600/20 p-3 rounded-2xl max-w-[85%] border border-indigo-500/30 leading-relaxed">
                    আসসালামু আলাইকুম! আপনার যেকোনো সমস্যা বা প্রশ্ন এখানে লিখুন। হাবিব সাহেব সরাসরি আপনার মেসেজ দেখে দ্রুত উত্তর দেবেন।
                </div>
            </div>

            <!-- Input Footer -->
            <div class="p-3 bg-slate-950/80 border-t border-white/10 flex items-center gap-2">
                <input type="text" id="habibChatInputBox" placeholder="আপনার মেসেজ এখানে লিখুন..." class="flex-grow bg-white/5 border border-white/10 rounded-xl px-3 py-2.5 text-xs outline-none focus:border-indigo-500 text-white">
                <button onclick="sendHabibManualMessage()" class="bg-indigo-600 hover:bg-indigo-500 text-white w-10 h-10 rounded-xl flex items-center justify-center text-sm transition-colors shadow-md shrink-0">
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
            inputBox.addEventListener('keypress', function(event) {
                if (event.key === 'Enter') {
                    sendHabibManualMessage();
                }
            });
        }
    }, 500);
})();

function toggleHabibChatWindow() {
    const win = document.getElementById('habibChatWindow');
    if (win) {
        win.classList.toggle('hidden');
    }
}

// Function to send user message to Google Sheet
async function sendHabibManualMessage() {
    const input = document.getElementById('habibChatInputBox');
    const msgBox = document.getElementById('habibChatMessages');
    if (!input || !msgBox) return;

    const text = input.value.trim();
    if (!text) return;

    // Show User Message in Chat Box
    msgBox.innerHTML += `<div class="bg-indigo-600 p-3 rounded-2xl max-w-[85%] ml-auto text-white leading-relaxed">${text}</div>`;
    input.value = '';
    msgBox.scrollTop = msgBox.scrollHeight;

    // Loading/Success feedback
    const loadId = 'load_' + Date.now();
    msgBox.innerHTML += `<div id="${loadId}" class="bg-slate-800 p-3 rounded-2xl max-w-[85%] text-slate-400 italic">Sending to Habib iFix...</div>`;
    msgBox.scrollTop = msgBox.scrollHeight;

    const scriptURL = "https://script.google.com/macros/s/AKfycbyN7mNvq1mUplw-AXHLUw5qhqjAKs1iQtcAADicCXRelZVchvVNMoY8C-ZHWNfYG-TcSQ/exec";
    
    try {
        await fetch(scriptURL, {
            method: "POST",
            mode: "no-cors",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                sender: "User",
                message: text
            })
        });

        const loaderEl = document.getElementById(loadId);
        if (loaderEl) loaderEl.remove();

        // Confirmation message to user
        msgBox.innerHTML += `<div class="bg-slate-800 p-3 rounded-2xl max-w-[85%] text-slate-200 border border-white/10 leading-relaxed">ধন্যবাদ! আপনার মেসেজটি সফলভাবে পৌঁছেছে। শীঘ্রই আপনাকে রিপ্লাই দেওয়া হবে।</div>`;
        msgBox.scrollTop = msgBox.scrollHeight;

    } catch (err) {
        const loaderEl = document.getElementById(loadId);
        if (loaderEl) loaderEl.remove();
        
        msgBox.innerHTML += `<div class="bg-red-900/50 p-3 rounded-2xl max-w-[85%] text-red-200">মেসেজ পাঠাতে সমস্যা হয়েছে। দয়া করে WhatsApp এ যোগাযোগ করুন।</div>`;
        msgBox.scrollTop = msgBox.scrollHeight;
    }
}
