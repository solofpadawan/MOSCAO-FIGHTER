export const i18n = {
    currentLang: 'en',
    translations: {
        pt: {
            "press_start": "Pressione algo para começar!",
            "top_players": "TOP 10 JOGADORES",
            "score_prefix": "Pontos",
            "level_prefix": "Nível",
            "level_word": "NÍVEL",
            "game_over": "FIM DE JOGO",
            "enter_name": "Digite seu nome:",
            "player_placeholder": "PLAYER",
            "enter_btn": "[ ENTRAR ]",
            "restart_msg": "Pressione ESPAÇO ou Toque para Reiniciar",
            "share_whatsapp": "Desafiar no WhatsApp",
            "celebration_prefix": "PARABÉNS"
        },
        en: {
            "press_start": "Press anything to start!",
            "top_players": "TOP 10 PLAYERS",
            "score_prefix": "Score",
            "level_prefix": "Level",
            "level_word": "LEVEL",
            "game_over": "GAME OVER",
            "enter_name": "Enter your name:",
            "player_placeholder": "PLAYER",
            "enter_btn": "[ ENTER ]",
            "restart_msg": "Press SPACE or Touch to Restart",
            "share_whatsapp": "Challenge on WhatsApp",
            "celebration_prefix": "CONGRATULATIONS"
        }
    },

    init() {
        this.detectLanguage();
        this.updateDOM();
    },

    detectLanguage() {
        const userLang = navigator.language || navigator.userLanguage;
        if (userLang.startsWith('pt')) {
            this.currentLang = 'pt';
        } else {
            this.currentLang = 'en';
        }
        console.log(`Language detected: ${this.currentLang} (${userLang})`);

        // Update html tag lang attribute
        document.documentElement.lang = this.currentLang === 'pt' ? 'pt-BR' : 'en-US';
    },

    t(key) {
        if (this.translations[this.currentLang] && this.translations[this.currentLang][key]) {
            return this.translations[this.currentLang][key];
        }
        console.warn(`Missing translation for key: ${key}`);
        return key;
    },

    updateDOM() {
        const elements = document.querySelectorAll('[data-i18n]');
        elements.forEach(el => {
            const key = el.getAttribute('data-i18n');
            const translation = this.t(key);

            // Handle placeholders/attributes if necessary
            if (el.tagName === 'INPUT' && el.getAttribute('placeholder')) {
                // For input placeholders, we might need a specific handling or just replace content
                // But wait, key is usually for textContent. 
                // Let's add support for data-i18n-placeholder
            }

            if (el.tagName === 'INPUT') {
                // If it's an input, we likely want to translate the placeholder, NOT the value
                // Use a convention: if data-i18n is on an input, assume it's for placeholder
                el.placeholder = translation;
            } else {
                el.textContent = translation;
            }
        });

        // Specific handling for complex elements if needed, 
        // but for now the design seems simple enough for text replacement.

        // Handle elements with separate placeholder attribute keys
        const placeholderElements = document.querySelectorAll('[data-i18n-placeholder]');
        placeholderElements.forEach(el => {
            const key = el.getAttribute('data-i18n-placeholder');
            el.placeholder = this.t(key);
        });
    }
};
