/* ==========================================================================
   NOVA AI - Jarvis Assistant Engine
   Voice Conversation + Multi-API + History
   Designed & Developed by Lucky
   ========================================================================== */

// ===== STATE =====
const state = {
    currentUser: null,
    currentPersona: 'general',
    currentChatId: null,
    messages: [],
    isListening: false,
    isSpeaking: false,
    isMuted: false,
    autoRead: true,
    continuousVoice: false,
    apiKeys: {},
    activeProvider: 'local',
    voiceSettings: { speed: 1, pitch: 1, voiceIndex: 0 },
    recognition: null,
    synthesis: window.speechSynthesis,
    voices: [],
    lastTranscript: '',
};

// ===== PERSONA CONFIG =====
const PERSONAS = {
    general: {
        name: 'Nova Assistant',
        icon: 'fa-brain',
        color: '#00d4ff',
        systemPrompt: `You are Nova, an advanced AI assistant made by Lucky. You are talking to the user over a VOICE interface. CRITICAL RULES: 1. Talk like a real human friend. 2. Keep responses very short and conversational (1-3 sentences max). 3. Always use natural Hinglish (Hindi + English mix). 4. Do NOT use bullet points, long lists, or markdown symbols like ** because this text will be spoken out loud. 5. Be very friendly, casual, and empathetic.`,
    },
    code: {
        name: 'Code Architect',
        icon: 'fa-code',
        color: '#7c3aed',
        systemPrompt: `You are Lucky's Code Architect, an expert developer AI. You are talking over VOICE. CRITICAL RULES: Keep it short and conversational in Hinglish. Don't read out massive blocks of code over voice unless asked. Explain logic like a human pair-programmer. No bullet points.`,
    },
    productivity: {
        name: 'Productivity Pro',
        icon: 'fa-bolt',
        color: '#f59e0b',
        systemPrompt: `You are a Productivity Coach AI made by Lucky. Talking over VOICE. Keep responses very short, conversational, and energetic in Hinglish. No long lists or bullet points. Talk like a real human coach.`,
    },
    creative: {
        name: 'Creative Studio',
        icon: 'fa-wand-magic-sparkles',
        color: '#ec4899',
        systemPrompt: `You are a Creative AI made by Lucky. Talking over VOICE. Be imaginative, short, and conversational in Hinglish. Talk like a human friend brainstorming ideas. No bullet points.`,
    },
    tutor: {
        name: 'Polyglot Tutor',
        icon: 'fa-graduation-cap',
        color: '#10b981',
        systemPrompt: `You are a Multilingual Tutor AI made by Lucky. Talking over VOICE. Be very encouraging, short, and conversational in Hinglish. Teach like a human teacher having a casual chat. No bullet points.`,
    },
};

// ===== LOCAL FALLBACK RESPONSES =====
const LOCAL_RESPONSES = {
    greetings: ['hello', 'hi', 'hey', 'hii', 'kaise', 'kya haal', 'namaste', 'sup', 'good morning', 'good evening', 'good afternoon'],
    creator: ['made by', 'kisne banaya', 'tumhara malik', 'who made', 'who created', 'who built', 'lucky', 'creator'],
    name: ['your name', 'tera naam', 'kya naam', 'what are you', 'kaun ho', 'introduce'],
    thanks: ['thanks', 'thank you', 'shukriya', 'dhanyavad', 'great', 'nice', 'good job', 'amazing', 'awesome', 'shabash'],
    bye: ['bye', 'goodbye', 'alvida', 'baad mein', 'see you', 'goodnight', 'g2g'],
    help: ['help', 'kya kar sakte', 'features', 'kya ho', 'abilities', 'what can you do', 'capabilities'],
    voice: ['voice', 'bolna', 'speak', 'listen', 'mic', 'microphone', 'sunaao'],
    api: ['api', 'real ai', 'chatgpt', 'gemini', 'groq', 'connect', 'live ai'],
};

function detectLocalIntent(text) {
    const t = text.toLowerCase();
    for (const [intent, keywords] of Object.entries(LOCAL_RESPONSES)) {
        if (keywords.some(k => t.includes(k))) return intent;
    }
    return 'default';
}

function getLocalResponse(intent, input) {
    const persona = PERSONAS[state.currentPersona].name;
    const responses = {
        greetings: [
            `Hello! Main hoon **Nova AI** — aapka personal Jarvis, by Lucky! 👋 Aaj kya help chahiye?`,
            `Hey! Kya hal hai? Main ${persona} hoon. Type ya speak karke kuch bhi puchhein! 🚀`,
            `Namaste! Nova AI here. Koi bhi sawaal ho — main hazir hoon! ✨`,
        ],
        creator: [
            `Mujhe **Lucky** ne create kiya hai — ek passionate developer jo AI aur technology se pyaar karta hai! ❤️ Made with love & code.`,
            `Nova AI ko design aur develop kiya hai **Lucky** ne. Ek futuristic Jarvis-style assistant!`,
        ],
        name: [
            `Main hoon **Nova AI** — ek Jarvis-inspired intelligent assistant, crafted by **Lucky**. ${state.currentPersona !== 'general' ? `Abhi main **${persona}** mode mein hoon.` : ''}`,
            `I'm Nova AI! Think of me as your personal JARVIS, made by Lucky. ${persona} at your service! 🤖`,
        ],
        thanks: [
            `Shukriya! 😊 Koi aur kaam ho toh batao — main hamesha yahan hoon!`,
            `Bahut bahut dhanyawad! Aapki seva mein sada hazir. 🙏`,
            `Thanks aapko bhi! Kuch aur chahiye ho toh boliye!`,
        ],
        bye: [
            `Goodbye! Take care! Jab bhi zaroorat ho — main hoon yahan. 👋`,
            `Alvida! Nova AI is always online for you. See you soon! 🌟`,
        ],
        help: [
            `Main yeh sab kar sakta hoon:\n\n💬 **Chat** - Koi bhi sawaal puchho\n🎙️ **Voice** - Mic button se bolke baat karo\n💻 **Code** - Code likhna, debug karna\n✍️ **Writing** - Emails, essays, stories\n🌐 **Language** - Translation & learning\n⚡ **Productivity** - Planning & summaries\n\n**Pro Tip:** Settings mein API key add karo real AI ke liye!`,
        ],
        voice: [
            `Voice feature ke liye:\n\n🎙️ Orb ke niche **"Hold to Speak"** button dabao\n🔊 AI ki awaaz sunne ke liye **mute button** check karo\n⚙️ Settings > Voice mein speed/pitch adjust karo\n\nYa input box mein mic icon se bhi baat kar sakte ho!`,
        ],
        api: [
            `Real AI connect karne ke liye:\n\n1. **Settings** ⚙️ open karo\n2. **API Keys** tab pe jao\n3. Apni key paste karo (Groq free hai!)\n4. **Save** dabao\n\n**Groq AI** sabse fast aur free hai! [groq.com](https://console.groq.com) se free key milti hai.`,
        ],
        default: [
            `Interesting question! Main abhi **local mode** mein hoon. Real AI responses ke liye Settings mein **Groq API key** add karo — bilkul free hai! 🔑`,
            `Mujhe samajh aaya! Lekin is sawaal ka deep jawab dene ke liye mujhe ek **API key** chahiye. Settings > API Keys mein jaayein!`,
            `Hm, yeh ek achha sawaal hai! Main aur behtar jawab de sakta hoon agar aap **Settings** mein Groq key add karein. Try karo!`,
        ],
    };
    const arr = responses[intent] || responses.default;
    return arr[Math.floor(Math.random() * arr.length)];
}

// ===== DOM REFS =====
const dom = {
    // Sidebar
    sidebarToggle: document.getElementById('sidebarToggle'),
    sidebar: document.getElementById('sidebar'),
    sidebarOverlay: document.getElementById('sidebarOverlay'),
    newChatBtn: document.getElementById('newChatBtn'),
    historyList: document.getElementById('historyList'),
    personaItems: document.querySelectorAll('.persona-item'),
    settingsModal: document.getElementById('settingsModal'),
    settingsBtn: document.getElementById('settingsBtn'),
    activeProviderText: document.getElementById('activeProviderText'),
    activePersonaLabel: document.getElementById('activePersonaLabel'),
    currentPersonaHint: document.getElementById('currentPersonaHint'),
    // Orb
    jarvisOrb: document.getElementById('jarvisOrb'),
    orbWrapper: document.getElementById('orbWrapper'),
    orbIcon: document.getElementById('orbIcon'),
    orbStatusText: document.getElementById('orbStatusText'),
    voiceVisualizer: document.getElementById('voiceVisualizer'),
    // Voice Controls
    micBtn: document.getElementById('micBtn'),
    stopBtn: document.getElementById('stopBtn'),
    muteBtn: document.getElementById('muteBtn'),
    micInlineBtn: document.getElementById('micInlineBtn'),
    // Chat
    chatMessages: document.getElementById('chatMessages'),
    chatInput: document.getElementById('chatInput'),
    sendBtn: document.getElementById('sendBtn'),
    // Settings Modal
    closeSettings: document.getElementById('closeSettings'),
    tabBtns: document.querySelectorAll('.tab-btn'),
    // Account
    loggedOutView: document.getElementById('loggedOutView'),
    loggedInView: document.getElementById('loggedInView'),
    authDisplayName: document.getElementById('authDisplayName'),
    authEmail: document.getElementById('authEmail'),
    loginBtn: document.getElementById('loginBtn'),
    logoutBtn: document.getElementById('logoutBtn'),
    userNameDisplay: document.getElementById('userNameDisplay'),
    userEmailDisplay: document.getElementById('userEmailDisplay'),
    userAvatarBig: document.getElementById('userAvatarBig'),
    statChats: document.getElementById('statChats'),
    statMessages: document.getElementById('statMessages'),
    // API
    groqKey: document.getElementById('groqKey'),
    groqModel: document.getElementById('groqModel'),
    geminiKey: document.getElementById('geminiKey'),
    openaiKey: document.getElementById('openaiKey'),
    openrouterKey: document.getElementById('openrouterKey'),
    engineSelect: document.getElementById('engineSelect'),
    // Voice Settings
    voiceSpeed: document.getElementById('voiceSpeed'),
    voiceSpeedVal: document.getElementById('voiceSpeedVal'),
    voicePitch: document.getElementById('voicePitch'),
    voicePitchVal: document.getElementById('voicePitchVal'),
    voiceSelect: document.getElementById('voiceSelect'),
    testVoiceBtn: document.getElementById('testVoiceBtn'),
    autoReadToggle: document.getElementById('autoReadToggle'),
    continuousVoiceToggle: document.getElementById('continuousVoiceToggle'),
};

// ===== PARTICLE CANVAS =====
function initParticles() {
    const canvas = document.getElementById('particleCanvas');
    const ctx = canvas.getContext('2d');
    let W, H, particles = [];

    function resize() {
        W = canvas.width = window.innerWidth;
        H = canvas.height = window.innerHeight;
    }
    resize();
    window.addEventListener('resize', resize);

    class Particle {
        constructor() { this.reset(); }
        reset() {
            this.x = Math.random() * W;
            this.y = Math.random() * H;
            this.size = Math.random() * 1.5 + 0.3;
            this.speed = Math.random() * 0.3 + 0.05;
            this.opacity = Math.random() * 0.5 + 0.1;
            this.hue = Math.random() > 0.7 ? 280 : 190; // purple or cyan
        }
        update() {
            this.y -= this.speed;
            if (this.y < 0) this.reset(), this.y = H;
        }
        draw() {
            ctx.beginPath();
            ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
            ctx.fillStyle = `hsla(${this.hue}, 100%, 70%, ${this.opacity})`;
            ctx.fill();
        }
    }

    for (let i = 0; i < 80; i++) particles.push(new Particle());

    function animate() {
        ctx.clearRect(0, 0, W, H);
        particles.forEach(p => { p.update(); p.draw(); });
        requestAnimationFrame(animate);
    }
    animate();
}

// ===== ORB MOUSE TRACKING =====
function initOrbTracking() {
    const orb = dom.jarvisOrb;
    const section = document.getElementById('jarvisSection');

    section.addEventListener('mousemove', (e) => {
        const rect = orb.getBoundingClientRect();
        const cx = rect.left + rect.width / 2;
        const cy = rect.top + rect.height / 2;
        const dx = (e.clientX - cx) / rect.width;
        const dy = (e.clientY - cy) / rect.height;
        const intensity = 12;
        orb.style.transform = `perspective(400px) rotateY(${dx * intensity}deg) rotateX(${-dy * intensity}deg)`;
    });

    section.addEventListener('mouseleave', () => {
        orb.style.transform = 'perspective(400px) rotateY(0deg) rotateX(0deg)';
    });
}

// ===== SPEECH SYNTHESIS (AI SPEAKING) =====
function loadVoices() {
    return new Promise((resolve) => {
        let voices = speechSynthesis.getVoices();
        if (voices.length) { state.voices = voices; resolve(voices); return; }
        speechSynthesis.onvoiceschanged = () => {
            state.voices = speechSynthesis.getVoices();
            resolve(state.voices);
        };
    });
}

function populateVoiceSelect() {
    const voices = state.voices;
    dom.voiceSelect.innerHTML = '';
    voices.forEach((v, i) => {
        const opt = document.createElement('option');
        opt.value = i;
        opt.textContent = `${v.name} (${v.lang})`;
        dom.voiceSelect.appendChild(opt);
    });
    // Try to select an Indian voice by default for clearer Hinglish
    const preferred = voices.findIndex(v => v.lang.includes('IN') || v.lang.includes('hi'));
    if (preferred !== -1) { 
        dom.voiceSelect.value = preferred; 
        state.voiceSettings.voiceIndex = preferred; 
    } else if (voices.length > 0) {
        dom.voiceSelect.value = 0;
        state.voiceSettings.voiceIndex = 0;
    }
}

function speak(text) {
    if (state.isMuted || !state.synthesis) return;
    
    // Fix Chrome synthesis bug
    state.synthesis.cancel();
    state.synthesis.resume();
    
    const plain = text.replace(/[*#`_~\[\]]/g, '').replace(/\n+/g, '. ');
    const utterance = new SpeechSynthesisUtterance(plain);
    utterance.rate = state.voiceSettings.speed;
    utterance.pitch = state.voiceSettings.pitch;
    
    const voices = state.voices;
    if (voices.length > 0) {
        const selectedVoice = voices[state.voiceSettings.voiceIndex];
        if (selectedVoice) utterance.voice = selectedVoice;
    }

    utterance.onstart = () => {
        state.isSpeaking = true;
        setOrbState('speaking');
    };
    
    utterance.onend = () => {
        state.isSpeaking = false;
        setOrbState('idle');
        if (state.continuousVoice && !state.isListening) {
            setTimeout(startListening, 600);
        }
    };
    
    utterance.onerror = (e) => {
        console.error('TTS Error:', e);
        state.isSpeaking = false;
        setOrbState('idle');
    };
    
    state.synthesis.speak(utterance);
    
    // Keep engine alive for long responses
    let r = setInterval(() => {
        if (!state.synthesis.speaking) clearInterval(r);
        else state.synthesis.resume();
    }, 10000);
}

function stopSpeaking() {
    state.synthesis.cancel();
    state.isSpeaking = false;
    setOrbState('idle');
}

// ===== SPEECH RECOGNITION (USER LISTENING) =====
function initSpeechRecognition() {
    const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SR) {
        dom.micBtn.disabled = true;
        dom.micBtn.title = 'Voice not supported in this browser';
        dom.micInlineBtn.disabled = true;
        return false;
    }
    const rec = new SR();
    rec.continuous = false;
    rec.interimResults = true;
    rec.lang = 'en-IN'; // Supports Hindi + English

    rec.onstart = () => {
        state.isListening = true;
        setOrbState('listening');
        dom.voiceVisualizer.classList.add('active');
        dom.micBtn.classList.add('active');
        dom.micInlineBtn.classList.add('listening');
        dom.micBtn.classList.add('hidden');
        dom.stopBtn.classList.remove('hidden');
    };

    rec.onresult = (e) => {
        let interim = '', final = '';
        for (let i = e.resultIndex; i < e.results.length; i++) {
            if (e.results[i].isFinal) final += e.results[i][0].transcript;
            else interim += e.results[i][0].transcript;
        }
        const current = final || interim;
        if (current) {
            dom.chatInput.value = current;
            dom.orbStatusText.textContent = `"${current.substring(0, 40)}${current.length > 40 ? '...' : ''}"`;
            state.lastTranscript = current;
        }
    };

    rec.onend = () => {
        state.isListening = false;
        dom.voiceVisualizer.classList.remove('active');
        dom.micBtn.classList.remove('active');
        dom.micInlineBtn.classList.remove('listening');
        dom.micBtn.classList.remove('hidden');
        dom.stopBtn.classList.add('hidden');
        setOrbState('idle');

        if (state.lastTranscript.trim()) {
            const text = state.lastTranscript.trim();
            state.lastTranscript = '';
            dom.chatInput.value = '';
            sendMessage(text);
        }
    };

    rec.onerror = (e) => {
        state.isListening = false;
        dom.voiceVisualizer.classList.remove('active');
        dom.micBtn.classList.remove('active', 'hidden');
        dom.stopBtn.classList.add('hidden');
        setOrbState('idle');
        if (e.error !== 'aborted') {
            setOrbStatusText(`Voice error: ${e.error}`, false);
        }
    };

    state.recognition = rec;
    return true;
}

function startListening() {
    if (!state.recognition) return;
    if (state.isSpeaking) stopSpeaking();
    try { state.recognition.start(); }
    catch (e) { console.log('Recognition already started'); }
}

function stopListening() {
    if (state.recognition && state.isListening) {
        state.recognition.stop();
    }
}

// ===== ORB STATE =====
function setOrbState(stateName) {
    const orb = dom.jarvisOrb;
    orb.classList.remove('listening', 'speaking');
    if (stateName === 'listening') {
        orb.classList.add('listening');
        dom.orbIcon.className = 'fa-solid fa-microphone';
        setOrbStatusText('Listening... Boliye!', true);
    } else if (stateName === 'speaking') {
        orb.classList.add('speaking');
        dom.orbIcon.className = 'fa-solid fa-volume-high';
        setOrbStatusText('Nova is speaking...', false, true);
    } else {
        dom.orbIcon.className = 'fa-solid fa-brain';
        setOrbStatusText('Say something or type below...', false);
    }
}

function setOrbStatusText(text, listening = false, speaking = false) {
    dom.orbStatusText.textContent = text;
    dom.orbStatusText.className = 'orb-status-text';
    if (listening) dom.orbStatusText.classList.add('listening-text');
    if (speaking) dom.orbStatusText.classList.add('speaking-text');
}

// ===== API CALLS =====
async function callGroq(messages, apiKey, model) {
    const res = await fetch('https://api.groq.com/openai/v1/chat/completions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${apiKey}` },
        body: JSON.stringify({
            model: model || 'llama-3.3-70b-versatile',
            messages,
            max_tokens: 1024,
            temperature: 0.7,
        }),
    });
    if (!res.ok) throw new Error(`Groq Error: ${res.status}`);
    const data = await res.json();
    return data.choices[0].message.content;
}

async function callGemini(messages, apiKey) {
    const contents = messages.filter(m => m.role !== 'system').map(m => ({
        role: m.role === 'assistant' ? 'model' : 'user',
        parts: [{ text: m.content }]
    }));
    const systemInstruction = messages.find(m => m.role === 'system')?.content;
    const body = {
        contents,
        ...(systemInstruction && { systemInstruction: { parts: [{ text: systemInstruction }] } }),
        generationConfig: { maxOutputTokens: 1024, temperature: 0.7 }
    };
    const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
    });
    if (!res.ok) throw new Error(`Gemini Error: ${res.status}`);
    const data = await res.json();
    return data.candidates[0].content.parts[0].text;
}

async function callOpenAI(messages, apiKey) {
    const res = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${apiKey}` },
        body: JSON.stringify({ model: 'gpt-4o-mini', messages, max_tokens: 1024, temperature: 0.7 }),
    });
    if (!res.ok) throw new Error(`OpenAI Error: ${res.status}`);
    const data = await res.json();
    return data.choices[0].message.content;
}

async function callOpenRouter(messages, apiKey) {
    const res = await fetch('https://openrouter.ai/api/v1/chat/completions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${apiKey}` },
        body: JSON.stringify({ model: 'openai/gpt-4o-mini', messages, max_tokens: 1024 }),
    });
    if (!res.ok) throw new Error(`OpenRouter Error: ${res.status}`);
    const data = await res.json();
    return data.choices[0].message.content;
}

async function getAIResponse(userMessage) {
    const systemPrompt = PERSONAS[state.currentPersona].systemPrompt;
    const history = state.messages.slice(-10).map(m => ({ role: m.role, content: m.content }));
    const messages = [{ role: 'system', content: systemPrompt }, ...history, { role: 'user', content: userMessage }];

    const keys = state.apiKeys;
    const selectedEngine = dom.engineSelect ? dom.engineSelect.value : 'groq';

    // No key saved? Use local fallback
    if (selectedEngine === 'groq' && !keys.groq) {
        const intent = detectLocalIntent(userMessage);
        return getLocalResponse(intent, userMessage);
    }
    if (selectedEngine === 'openai' && !keys.openai) {
        const intent = detectLocalIntent(userMessage);
        return getLocalResponse(intent, userMessage);
    }

    try {
        if (selectedEngine === 'groq') {
            return await callGroq(messages, keys.groq, dom.groqModel ? dom.groqModel.value : null);
        } else if (selectedEngine === 'openai') {
            return await callOpenAI(messages, keys.openai);
        }
    } catch (err) {
        console.error('API Error:', err);
        return `⚠️ **API Error**: ${err.message}\n\nSettings mein apni API key check karo.`;
    }

    const intent = detectLocalIntent(userMessage);
    return getLocalResponse(intent, userMessage);
}

// ===== CHAT =====
function getCurrentChatKey() {
    const userKey = state.currentUser ? state.currentUser.email : 'guest';
    return `nova_chat_${userKey}_${state.currentChatId}`;
}

function saveCurrentChat() {
    if (!state.currentChatId || state.messages.length === 0) return;
    const key = getCurrentChatKey();
    const title = state.messages.find(m => m.role === 'user')?.content.substring(0, 45) || 'New Chat';
    localStorage.setItem(key, JSON.stringify({
        id: state.currentChatId,
        title,
        messages: state.messages,
        persona: state.currentPersona,
        timestamp: Date.now(),
    }));
    loadHistoryList();
}

function loadHistoryList() {
    const userKey = state.currentUser ? state.currentUser.email : 'guest';
    const prefix = `nova_chat_${userKey}_`;
    const items = [];
    for (let i = 0; i < localStorage.length; i++) {
        const k = localStorage.key(i);
        if (k.startsWith(prefix)) {
            try {
                const data = JSON.parse(localStorage.getItem(k));
                items.push(data);
            } catch { }
        }
    }
    items.sort((a, b) => b.timestamp - a.timestamp);

    dom.historyList.innerHTML = '';
    if (items.length === 0) {
        dom.historyList.innerHTML = `<div class="empty-history"><i class="fa-solid fa-comment-slash"></i><p>No chats yet</p></div>`;
        return;
    }

    items.forEach(item => {
        const div = document.createElement('div');
        div.className = `history-item${item.id === state.currentChatId ? ' active' : ''}`;
        div.dataset.chatId = item.id;
        div.innerHTML = `<i class="fa-regular fa-message"></i><span title="${item.title}">${item.title}</span>`;
        div.addEventListener('click', () => loadChat(item.id));
        dom.historyList.appendChild(div);
    });

    // Update stats
    dom.statChats.textContent = items.length;
    dom.statMessages.textContent = items.reduce((sum, i) => sum + (i.messages?.length || 0), 0);
}

function loadChat(chatId) {
    const userKey = state.currentUser ? state.currentUser.email : 'guest';
    const key = `nova_chat_${userKey}_${chatId}`;
    const data = JSON.parse(localStorage.getItem(key));
    if (!data) return;

    state.currentChatId = data.id;
    state.messages = data.messages;
    state.currentPersona = data.persona;

    // Update persona UI
    document.querySelectorAll('.persona-item').forEach(el => {
        el.classList.toggle('active', el.dataset.persona === state.currentPersona);
    });
    updatePersonaUI();

    // Render messages
    dom.chatMessages.innerHTML = '';
    state.messages.forEach(m => appendMessage(m.role, m.content, false));
    dom.chatMessages.scrollTop = dom.chatMessages.scrollHeight;
    loadHistoryList();
    closeSidebarOnMobile();
}

function startNewChat() {
    saveCurrentChat();
    state.currentChatId = Date.now().toString();
    state.messages = [];
    dom.chatMessages.innerHTML = `
        <div class="welcome-msg">
            <h2>Hello, I'm <span>Nova AI</span> 👋</h2>
            <p>Your personal Jarvis-style AI assistant, crafted by <strong>Lucky</strong>.<br>Speak to me or type below to begin.</p>
        </div>`;
    loadHistoryList();
    closeSidebarOnMobile();
}

function formatMessage(text) {
    return text
        .replace(/```(\w+)?\n?([\s\S]*?)```/g, (_, lang, code) => {
            const l = lang || '';
            return `<div style="position:relative"><pre><code class="${l}">${code.trim().replace(/</g, '&lt;').replace(/>/g, '&gt;')}</code><button class="copy-code-btn" onclick="copyCode(this)">Copy</button></pre></div>`;
        })
        .replace(/`([^`]+)`/g, '<code>$1</code>')
        .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
        .replace(/\*(.*?)\*/g, '<em>$1</em>')
        .replace(/\n/g, '<br>');
}

function appendMessage(role, content, animate = true) {
    const isUser = role === 'user';
    const time = new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' });
    const persona = PERSONAS[state.currentPersona];

    const row = document.createElement('div');
    row.className = `msg-row ${isUser ? 'user' : 'ai'}${!animate ? '' : ''}`;

    const avatarIcon = isUser ? 'fa-user' : `fa-${persona.icon.replace('fa-', '')}`;
    const formatted = isUser ? content.replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/\n/g, '<br>') : formatMessage(content);

    row.innerHTML = `
        <div class="msg-avatar"><i class="fa-solid ${avatarIcon}"></i></div>
        <div class="msg-content">
            <div class="msg-bubble">${formatted}</div>
            <div class="msg-meta">
                <span>${isUser ? 'You' : persona.name}</span>
                <span>${time}</span>
                <button class="copy-msg-btn" onclick="copyText(\`${content.replace(/`/g, '\\`')}\`)" title="Copy"><i class="fa-regular fa-copy"></i></button>
            </div>
        </div>`;

    dom.chatMessages.appendChild(row);
    dom.chatMessages.scrollTop = dom.chatMessages.scrollHeight;
}

function showTypingIndicator() {
    const div = document.createElement('div');
    div.className = 'msg-row ai';
    div.id = 'typingIndicator';
    div.innerHTML = `
        <div class="msg-avatar"><i class="fa-solid fa-brain"></i></div>
        <div class="msg-content">
            <div class="msg-bubble">
                <div class="typing-indicator">
                    <div class="typing-dot"></div>
                    <div class="typing-dot"></div>
                    <div class="typing-dot"></div>
                </div>
            </div>
        </div>`;
    dom.chatMessages.appendChild(div);
    dom.chatMessages.scrollTop = dom.chatMessages.scrollHeight;
}

function removeTypingIndicator() {
    const t = document.getElementById('typingIndicator');
    if (t) t.remove();
}

async function sendMessage(text) {
    const msg = (text || dom.chatInput.value).trim();
    if (!msg) return;
    dom.chatInput.value = '';
    resizeTextarea();

    if (!state.currentChatId) state.currentChatId = Date.now().toString();

    // Add user message
    state.messages.push({ role: 'user', content: msg });
    appendMessage('user', msg);

    // Remove welcome
    const welcome = dom.chatMessages.querySelector('.welcome-msg');
    if (welcome) welcome.remove();

    // Show typing
    showTypingIndicator();
    setOrbStatusText('Processing...', false);

    try {
        const response = await getAIResponse(msg);
        removeTypingIndicator();
        state.messages.push({ role: 'assistant', content: response });
        appendMessage('ai', response);
        setOrbState('idle');

        if (state.autoRead && !state.isMuted) {
            speak(response);
        }

        saveCurrentChat();
    } catch (err) {
        removeTypingIndicator();
        const errMsg = `Sorry, something went wrong: ${err.message}`;
        state.messages.push({ role: 'assistant', content: errMsg });
        appendMessage('ai', errMsg);
        setOrbState('idle');
    }
}

// ===== PERSONA =====
function updatePersonaUI() {
    const p = PERSONAS[state.currentPersona];
    dom.activePersonaLabel.innerHTML = `<span class="status-dot"></span>${p.name}`;
    dom.currentPersonaHint.textContent = `${p.name} mode`;
    dom.orbIcon.className = `fa-solid ${p.icon}`;
}

// ===== SETTINGS =====
function openSettings() { dom.settingsModal.classList.remove('hidden'); }
function closeSettingsModal() { dom.settingsModal.classList.add('hidden'); }

function switchTab(tabName) {
    dom.tabBtns.forEach(btn => btn.classList.toggle('active', btn.dataset.tab === tabName));
    document.querySelectorAll('.tab-content').forEach(el => {
        el.classList.toggle('hidden', el.id !== `tab-${tabName}`);
        el.classList.toggle('active', el.id === `tab-${tabName}`);
    });
}

// ===== AUTH =====
function updateAuthUI() {
    const user = state.currentUser;
    if (user) {
        dom.loggedOutView.classList.add('hidden');
        dom.loggedInView.classList.remove('hidden');
        dom.userNameDisplay.textContent = user.name;
        dom.userEmailDisplay.textContent = user.email;
        dom.userAvatarBig.textContent = user.name.charAt(0).toUpperCase();
    } else {
        dom.loggedOutView.classList.remove('hidden');
        dom.loggedInView.classList.add('hidden');
    }
    loadHistoryList();
}

function login() {
    const name = dom.authDisplayName.value.trim() || 'Lucky';
    const email = dom.authEmail.value.trim() || 'lucky@gmail.com';
    if (!email.includes('@')) { dom.authEmail.style.borderColor = '#ef4444'; return; }
    dom.authEmail.style.borderColor = '';
    state.currentUser = { name, email };
    localStorage.setItem('nova_user', JSON.stringify(state.currentUser));
    updateAuthUI();
}

function logout() {
    state.currentUser = null;
    localStorage.removeItem('nova_user');
    updateAuthUI();
    startNewChat();
}

// ===== API KEY MANAGEMENT =====
function loadApiKeys() {
    ['groq', 'gemini', 'openai', 'openrouter'].forEach(p => {
        const k = localStorage.getItem(`nova_key_${p}`);
        if (k) state.apiKeys[p] = k;
    });
    const model = localStorage.getItem('nova_groq_model');
    if (model) dom.groqModel.value = model;
    updateProviderDisplay();
    // Show saved keys (masked)
    if (state.apiKeys.groq) dom.groqKey.placeholder = '••••••••••••••••••••';
    if (state.apiKeys.gemini) dom.geminiKey.placeholder = '••••••••••••••••••••';
    if (state.apiKeys.openai) dom.openaiKey.placeholder = '••••••••••••••••••••';
    if (state.apiKeys.openrouter) dom.openrouterKey.placeholder = '••••••••••••••••••••';
}

function saveApiKey(provider) {
    const inputs = { groq: dom.groqKey, gemini: dom.geminiKey, openai: dom.openaiKey, openrouter: dom.openrouterKey };
    const val = inputs[provider].value.trim();
    if (!val) { delete state.apiKeys[provider]; localStorage.removeItem(`nova_key_${provider}`); }
    else { state.apiKeys[provider] = val; localStorage.setItem(`nova_key_${provider}`, val); }
    if (provider === 'groq') localStorage.setItem('nova_groq_model', dom.groqModel.value);
    inputs[provider].value = '';
    inputs[provider].placeholder = val ? '••••••••••••••••••••' : inputs[provider].placeholder;
    updateProviderDisplay();
}

function updateProviderDisplay() {
    const keys = state.apiKeys;
    let provider = 'Local Engine';
    if (keys.groq) provider = 'Groq AI (Active)';
    else if (keys.gemini) provider = 'Google Gemini (Active)';
    else if (keys.openai) provider = 'OpenAI GPT (Active)';
    else if (keys.openrouter) provider = 'OpenRouter (Active)';
    dom.activeProviderText.textContent = provider;
}

// ===== COPY HELPERS =====
window.copyCode = (btn) => {
    const code = btn.previousElementSibling.textContent;
    navigator.clipboard.writeText(code).then(() => {
        btn.textContent = '✓ Copied';
        setTimeout(() => btn.textContent = 'Copy', 2000);
    });
};

window.copyText = (text) => {
    navigator.clipboard.writeText(text);
};

// ===== SIDEBAR MOBILE =====
function closeSidebarOnMobile() {
    if (window.innerWidth <= 768) {
        dom.sidebar.classList.remove('open');
        dom.sidebarOverlay.classList.remove('visible');
    }
}

// ===== TEXTAREA AUTO RESIZE =====
function resizeTextarea() {
    dom.chatInput.style.height = 'auto';
    dom.chatInput.style.height = Math.min(dom.chatInput.scrollHeight, 120) + 'px';
}

// ===================================================================
//  INIT
// ===================================================================
async function init() {
    // Particles
    initParticles();

    // Orb tracking
    initOrbTracking();

    // Speech synthesis voices
    await loadVoices();
    populateVoiceSelect();

    // Speech recognition
    initSpeechRecognition();

    // Load saved user
    const savedUser = localStorage.getItem('nova_user');
    if (savedUser) { state.currentUser = JSON.parse(savedUser); updateAuthUI(); }

    // Load API keys
    loadApiKeys();

    // Load chat history
    loadHistoryList();

    // Start default chat
    startNewChat();

    // ===== EVENT LISTENERS =====

    // Sidebar toggle
    dom.sidebarToggle.addEventListener('click', () => {
        dom.sidebar.classList.toggle('open');
        dom.sidebarOverlay.classList.toggle('visible');
    });
    dom.sidebarOverlay.addEventListener('click', () => {
        dom.sidebar.classList.remove('open');
        dom.sidebarOverlay.classList.remove('visible');
    });

    // New Chat
    dom.newChatBtn.addEventListener('click', startNewChat);

    // Persona Items
    dom.personaItems.forEach(el => {
        el.addEventListener('click', () => {
            dom.personaItems.forEach(p => p.classList.remove('active'));
            el.classList.add('active');
            state.currentPersona = el.dataset.persona;
            updatePersonaUI();
            closeSidebarOnMobile();
        });
    });

    // Settings
    dom.settingsBtn.addEventListener('click', openSettings);
    dom.closeSettings.addEventListener('click', closeSettingsModal);
    dom.settingsModal.addEventListener('click', (e) => { if (e.target === dom.settingsModal) closeSettingsModal(); });

    // Settings Tabs
    dom.tabBtns.forEach(btn => btn.addEventListener('click', () => switchTab(btn.dataset.tab)));

    // Auth
    dom.loginBtn.addEventListener('click', login);
    dom.logoutBtn.addEventListener('click', logout);

    // API Keys
    document.querySelectorAll('.api-save-btn').forEach(btn => {
        btn.addEventListener('click', () => saveApiKey(btn.dataset.provider));
    });

    // Voice Controls
    dom.micBtn.addEventListener('click', () => {
        if (state.isListening) stopListening();
        else startListening();
    });
    dom.stopBtn.addEventListener('click', () => {
        stopListening();
        stopSpeaking();
    });
    dom.muteBtn.addEventListener('click', () => {
        state.isMuted = !state.isMuted;
        dom.muteBtn.classList.toggle('muted', state.isMuted);
        dom.muteBtn.querySelector('i').className = state.isMuted ? 'fa-solid fa-volume-xmark' : 'fa-solid fa-volume-high';
        dom.muteBtn.querySelector('span').textContent = state.isMuted ? 'AI Voice Off' : 'AI Voice On';
        if (state.isMuted && state.isSpeaking) stopSpeaking();
    });

    dom.micInlineBtn.addEventListener('click', () => {
        if (state.isListening) stopListening();
        else startListening();
    });

    // Orb click = mic
    dom.jarvisOrb.addEventListener('click', () => {
        if (state.isListening) stopListening();
        else if (state.isSpeaking) stopSpeaking();
        else startListening();
    });

    // Send message
    dom.sendBtn.addEventListener('click', () => sendMessage());
    dom.chatInput.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendMessage(); }
    });
    dom.chatInput.addEventListener('input', resizeTextarea);

    // Voice settings
    dom.voiceSpeed.addEventListener('input', (e) => {
        state.voiceSettings.speed = parseFloat(e.target.value);
        dom.voiceSpeedVal.textContent = `${e.target.value}x`;
    });
    dom.voicePitch.addEventListener('input', (e) => {
        state.voiceSettings.pitch = parseFloat(e.target.value);
        dom.voicePitchVal.textContent = e.target.value;
    });
    dom.voiceSelect.addEventListener('change', (e) => {
        state.voiceSettings.voiceIndex = parseInt(e.target.value);
    });
    if (dom.testVoiceBtn) {
        dom.testVoiceBtn.addEventListener('click', () => {
            const tempMuted = state.isMuted;
            state.isMuted = false;
            speak("Hello! This is a test of my voice module. Testing 1 2 3.");
            state.isMuted = tempMuted;
        });
    }
    dom.autoReadToggle.addEventListener('change', (e) => {
        state.autoRead = e.target.checked;
    });
    dom.continuousVoiceToggle.addEventListener('change', (e) => {
        state.continuousVoice = e.target.checked;
    });

    // Initial persona UI
    updatePersonaUI();
}

// Start!
document.addEventListener('DOMContentLoaded', init);
