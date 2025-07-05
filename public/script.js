let chatHistory = [];

document.addEventListener('DOMContentLoaded', () => {
  const form = document.getElementById('chat-form');
  const input = document.getElementById('user-input');
  const chatBox = document.getElementById('chat-box');
  const tokenCountDiv = document.getElementById('token-count');
  const sendBtn = document.getElementById('send-btn');
  const downloadBtn = document.getElementById('download-chat');
  const loadBtn = document.getElementById('load-chat-btn');
  const loadFile = document.getElementById('load-chat-file');
  const resetBtn = document.getElementById('reset-chat');

  // Load chat & token count
  chatHistory = loadChatHistory();
  chatHistory.forEach(msg => appendMessage(msg.role, msg.content));
  tokenCountDiv.textContent = `Token Count: ${loadTokenCount()}`;

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const userMessage = input.value.trim();
    if (!userMessage) return;

    setInputState(true);
    appendMessage('user', userMessage);
    chatHistory.push({ role: 'user', content: userMessage });
    saveChatHistory();
    input.value = '';

    const loadingMsg = appendMessage('bot', '...');
    try {
      const response = await fetch(`http://localhost:3000/generate-text`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt: chatHistory.map(msg =>
            `${msg.role === 'user' ? 'User' : 'Bot'}: ${msg.content}`
          ).join('\n') + '\nBot:'
        })
      });
      if (!response.ok) throw new Error(`Server error: ${response.statusText}`);
      const data = await response.json();
      loadingMsg.remove();

      if (data.generatedText) {
        appendMessage('bot', data.generatedText);
        chatHistory.push({ role: 'bot', content: data.generatedText });
        saveChatHistory();
        if (typeof data.tokenCount === 'number') {
          tokenCountDiv.textContent = `Token Count: ${data.tokenCount}`;
          saveTokenCount(data.tokenCount);
        }
      } else {
        appendMessage('bot', data.error || 'Terjadi kesalahan saat memproses respons.');
      }
    } catch (err) {
      console.error(err);
      loadingMsg.remove();
      appendMessage('bot', 'Gagal terhubung ke server. Pastikan server lokal Anda berjalan.');
    } finally {
      setInputState(false);
    }
  });

  downloadBtn.addEventListener('click', () => {
    const blob = new Blob([JSON.stringify(chatHistory, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'chat-history.json';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  });

  loadBtn.addEventListener('click', () => loadFile.click());

  loadFile.addEventListener('change', function (e) {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = function (event) {
      try {
        const imported = JSON.parse(event.target.result);
        if (Array.isArray(imported)) {
          chatHistory = imported;
          saveChatHistory();
          chatBox.innerHTML = '';
          chatHistory.forEach(msg => appendMessage(msg.role, msg.content));
        } else {
          alert('File tidak valid!');
        }
      } catch {
        alert('File tidak valid!');
      }
    };
    reader.readAsText(file);
    e.target.value = '';
  });

  resetBtn.addEventListener('click', () => {
    if (confirm('Apakah Anda yakin ingin mereset seluruh chat?')) {
      chatHistory = [];
      saveChatHistory();
      saveTokenCount(0);
      chatBox.innerHTML = `
        <div class="message bot">
          <div class="avatar">🤖</div>
          <div class="bubble"> Halo! Ada yang bisa saya bantu?</div>
        </div>
      `;
      tokenCountDiv.textContent = 'Token Count: 0';
    }
  });

  function appendMessage(sender, text) {
    const msg = document.createElement('div');
    msg.classList.add('message', sender);

    const avatar = document.createElement('div');
    avatar.className = 'avatar';
    avatar.textContent = sender === 'user' ? '🧑' : '🤖';

    const bubble = document.createElement('div');
    bubble.className = 'bubble';

    if (text === '...') {
      bubble.innerHTML = '<div class="typing-indicator"><span></span><span></span><span></span></div>';
    } else if (sender === 'bot' && window.marked) {
      bubble.innerHTML = marked.parse(text);
      bubble.querySelectorAll('a').forEach(a => {
        a.setAttribute('target', '_blank');
        a.setAttribute('rel', 'noopener noreferrer');
        a.setAttribute('style', 'color: #1e90ff; text-decoration: none;');
      });
      bubble.querySelectorAll('pre').forEach(pre => {
        const btn = document.createElement('button');
        btn.className = 'copy-btn';
        btn.innerHTML = `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#fff" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"> <rect x="9" y="9" width="13" height="13" rx="2" ry="2" fill="#444b"/> <rect x="3" y="3" width="13" height="13" rx="2" ry="2" fill="#888"/> </svg>`;
        btn.onclick = function () {
          const code = pre.querySelector('code');
          const codeText = code ? code.innerText : pre.innerText;
          navigator.clipboard.writeText(codeText);
          btn.innerHTML = 'Copied!';
          setTimeout(() => {
            btn.innerHTML = `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#fff" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"> <rect x="9" y="9" width="13" height="13" rx="2" ry="2" fill="#444b"/> <rect x="3" y="3" width="13" height="13" rx="2" ry="2" fill="#888"/> </svg>`;
          }, 1200);
        };
        pre.appendChild(btn);
      });
    } else {
      bubble.innerHTML = text.replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/\n/g, '<br>');
    }

    msg.appendChild(avatar);
    msg.appendChild(bubble);
    chatBox.appendChild(msg);
    chatBox.scrollTop = chatBox.scrollHeight;
    return msg;
  }

  function setInputState(disabled) {
    input.disabled = disabled;
    sendBtn.disabled = disabled;
    sendBtn.innerHTML = disabled
      ? '<div class="loader"></div>'
      : `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" width="24" height="24"><path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z"></path></svg>`;
  }
});

function saveChatHistory() {
  localStorage.setItem('chatHistory', JSON.stringify(chatHistory));
}
function loadChatHistory() {
  const data = localStorage.getItem('chatHistory');
  return data ? JSON.parse(data) : [];
}
function saveTokenCount(count) {
  localStorage.setItem('tokenCount', count);
}
function loadTokenCount() {
  return localStorage.getItem('tokenCount') || 0;
}