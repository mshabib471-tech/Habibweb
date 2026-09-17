// Habib iFix n8n Official Chat Embed Script
(function() {
    // Load n8n Chat CSS
    if (!document.getElementById('n8n-chat-styles')) {
        const link = document.createElement('link');
        link.id = 'n8n-chat-styles';
        link.rel = 'stylesheet';
        link.href = 'https://cdn.jsdelivr.net/npm/@n8n/chat/dist/style.css';
        document.head.appendChild(link);
    }

    // Load n8n Chat Bundle and Initialize
    const script = document.createElement('script');
    script.type = 'module';
    script.textContent = `
        import { createChat } from 'https://cdn.jsdelivr.net/npm/@n8n/chat/dist/chat.bundle.es.js';

        createChat({
            webhookUrl: 'https://habibifix.app.n8n.cloud/webhook/8dc7fa55-14f1-42a5-979e-614dca7025de/chat',
            target: '#habib-n8n-chat-container',
            mode: 'window',
            showWelcomeScreen: false,
            initialMessages: [
                'আসসালামু আলাইকুম! হাবিব iFix এ আপনাকে স্বাগতম। আপনার যেকোনো প্রশ্ন বা সার্ভিস সম্পর্কে জানতে এখানে মেসেজ করুন।'
            ],
            i18n: {
                en: {
                    title: 'Habib AI Assistant',
                    subtitle: 'Online | Habib iFix',
                    footer: '',
                    getStarted: 'Chat with us',
                    inputPlaceholder: 'Type your message...',
                }
            }
        });
    `;
    document.body.appendChild(script);

    // Create a wrapper container for the chat if not exists
    if (!document.getElementById('habib-n8n-chat-container')) {
        const chatContainer = document.createElement('div');
        chatContainer.id = 'habib-n8n-chat-container';
        document.body.appendChild(chatContainer);
    }
})();
