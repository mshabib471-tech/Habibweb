// Global Habib iFix AI Chatbot Widget Script (Fixed for CORS & Connection)
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
        `;
        document.head.appendChild(style);
    }

    const chatWidgetHTML = `
    <div id="habibAiChatWidget" class="fixed bottom-6 right-6 z-[999]">
        <button onclick="toggleHabibChatWindow()" id="chatToggleButton" class="w-14 h-14 bg-gradient-to-tr from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white rounded-full shadow-2xl flex items-center justify-center text-2xl transition-all transform hover:scale-110 border-2 border-white/20">
            <i class="fa-solid fa-robot"></i>
        </button>

        <div id="habibChatWindow" class="hidden absolute bottom-20 right-0 w-[320px] sm:w-[360px] h-[480px] habib-glass-box rounded-3xl flex flex-col overflow-hidden text-slate-200">
            <div class="bg-indigo-600/30 p-4 border-b border-white/10 flex justify-between items-center">
                <div class="flex items-center gap-2.5">
                    <div class="w-3 h-3 rounded-full bg-emerald-400 animate-pulse"></div>
                    <span class="font-bold text-white text-sm">Habib iFix AI Assistant</span>
                </div>
                <button onclick="toggleHabibChatWindow()" class="text-slate-400 hover:text-white w-7 h-7 rounded-full flex items-center justify-center bg-white/10">
                    <i class="fa-solid fa-xmark text-xs"></i>
                </button>
            </div>

            <div id="habibChatMessages" class="flex-grow p-4 overflow-y-auto space-y-3 text-xs text-slate-200">
                <div class="bg-indigo-600/20 p-3 rounded-2xl max-w-[85%] border border-indigo-500/30 leading-relaxed">
                    আসসালামু আলাইকুম! আমি হাবিব আইফিক্স এআই অ্যাসিস্ট্যান্ট। মোবাইল রিপেয়ার, এফআরপি আনলক বা আমাদের সার্ভিস সম্পর্কে যেকোনো কিছু আমাকে জিজ্ঞেস করতে পারেন।
                </div>
            </div>

            <div class="p-3 bg-slate-950/80 border-t border-white/10 flex items-center gap-2">
                <input type="text" id="habibChatInputBox" placeholder="আপনার প্রশ্ন এখানে লিখুন..." class="flex-grow bg-white/5 border border-white/10 rounded-xl px-3 py-2.5 text-xs outline-none focus:border-indigo-500 text-white">
                <button onclick="sendHabibChatMessage()" class="bg-indigo-600 hover:bg-indigo-500 text-white w-10 h-10 rounded-xl flex items-center justify-center text-sm transition-colors shadow-md shrink-0">
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
                    sendHabibChatMessage();
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

async function sendHabibChatMessage() {
    const input = document.getElementById('habibChatInputBox');
    const msgBox = document.getElementById('habibChatMessages');
    if (!input || !msgBox) return;

    const text = input.value.trim();
    if (!text) return;

    msgBox.innerHTML += `<div class="bg-indigo-600 p-3 rounded-2xl max-w-[85%] ml-auto text-white leading-relaxed">${text}</div>`;
    input.value = '';
    msgBox.scrollTop = msgBox.scrollHeight;

    const loadId = 'load_' + Date.now();
    msgBox.innerHTML += `<div id="${loadId}" class="bg-slate-800 p-3 rounded-2xl max-w-[85%] text-slate-400 italic">Thinking...</div>`;
    msgBox.scrollTop = msgBox.scrollHeight;

    try {
        // Using CodeCraft API Proxy to completely bypass browser CORS block & OpenAI direct restriction
        const response = await fetch("https://api.codecraftapi.com/v1/chat/completions", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": "Bearer cc_Jsv8GuKNIUk69LaG0nNNWvc7iSgu5pHNOo8xb1Ht5Bcm6ppf"
            },
            body: JSON.stringify({
                model: "gpt-4o",
                messages: [
                    { role: "system", content: "You are an AI assistant for Habib iFix website, a professional mobile repair and online technical service provider in Bangladesh. Reply nicely in Bengali or English based on user query." },
                    { role: "user", content: text }
                ]
            })
        });

        const data = await response.json();
        const loaderEl = document.getElementById(loadId);
        if (loaderEl) loaderEl.remove();

        const reply = data.choices && data.choices[0] ? data.choices[0].message.content : "দুঃখিত, এই মুহূর্তে উত্তর দিতে পারছি না। সরাসরি হোয়াটসঅ্যাপে যোগাযোগ করুন: +8801868461577";
        
        msgBox.innerHTML += `<div class="bg-slate-800 p-3 rounded-2xl max-w-[85%] text-slate-200 border border-white/10 leading-relaxed">${reply}</div>`;
        msgBox.scrollTop = msgBox.scrollHeight;
    }cha
    catch (err) {
        const loaderEl = document.getElementById(loadId);
        if (loaderEl) loaderEl.remove();
        
        msgBox.innerHTML += `<div class="bg-red-900/50 p-3 rounded-2xl max-w-[85%] text-red-200">সংযোগ স্থাপন করতে সমস্যা হচ্ছে। সরাসরি আমাদের WhatsApp এ যোগাযোগ করুন।</div>`;
        msgBox.scrollTop = msgBox.scrollHeight;
    }
}
