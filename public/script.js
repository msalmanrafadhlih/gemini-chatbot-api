document.addEventListener('DOMContentLoaded', () => {
  const form = document.getElementById('chat-form');
  const input = document.getElementById('user-input');
  const chatBox = document.getElementById('chat-box');
  const tokenCountDiv = document.getElementById('token-count');
  const sendBtn = document.getElementById('send-btn');

  form.addEventListener('submit', async function (e) {
    e.preventDefault();

    const userMessage = input.value.trim();
    if (!userMessage) return;
    

    input.disabled = true;
    sendBtn.disabled = true;
    sendBtn.innerHTML = '<div class="loader"></div>';

    appendMessage('user', userMessage);
    input.value = '';

    const loadingMsg = appendMessage('bot', '...');

    try {
      const response = await fetch('http://localhost:3000/generate-text', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt: userMessage })
      });
      
      if (!response.ok) {
        throw new Error(`Server error: ${response.statusText}`);
      }
      
      const data = await response.json();

      loadingMsg.remove();

      if (data.generatedText) {
        appendMessage('bot', data.generatedText);
        if (typeof data.tokenCount === 'number') {
          tokenCountDiv.textContent = `Token Count: ${data.tokenCount}`;
        }
      } else {
        appendMessage('bot', data.error || 'Terjadi kesalahan saat memproses respons.');
      }
    } catch (err) {
      console.error(err);
      loadingMsg.remove();
      appendMessage('bot', 'Gagal terhubung ke server. Pastikan server lokal Anda berjalan.');
    } finally {
      // Re-enable form
      input.disabled = false;
      sendBtn.disabled = false;
      sendBtn.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" width="24" height="24"><path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z"></path></svg>`;
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
    

    const sanitizedText = text.replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/\n/g, '<br>');
    bubble.innerHTML = sanitizedText;
    

    if(text === '...') {
      bubble.innerHTML = '<div class="typing-indicator"><span></span><span></span><span></span></div>';
    }


    msg.appendChild(avatar);
    msg.appendChild(bubble);

    chatBox.appendChild(msg);
    chatBox.scrollTop = chatBox.scrollHeight;
    return msg;
  }
});