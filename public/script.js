const form = document.getElementById('chat-form');
const input = document.getElementById('user-input');
const chatBox = document.getElementById('chat-box');
const tokenCountDiv = document.getElementById('token-count');

form.addEventListener('submit', async function (e) {
  e.preventDefault();

  const userMessage = input.value.trim();
  if (!userMessage) return;

  appendMessage('user', userMessage);
  input.value = '';

  const loadingMsg = appendMessage('bot', 'Gemini is thinking...');

  try {
    const response = await fetch('http://localhost:3000/generate-text', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ prompt: userMessage })
    });
    const data = await response.json();

    loadingMsg.remove();

    if (data.generatedText) {
      appendMessage('bot', data.generatedText);
      if (typeof data.tokenCount === 'number') {
        tokenCountDiv.textContent = `Token Count: ${data.tokenCount}`;
      }
    } else {
      appendMessage('bot', data.error || 'Terjadi kesalahan.');
    }
  } catch (err) {
    loadingMsg.remove();
    appendMessage('bot', 'Gagal terhubung ke server.');
  }
});

function appendMessage(sender, text) {
  const msg = document.createElement('div');
  msg.classList.add('message', sender);
  if (sender === 'bot') {
    msg.innerHTML = text.replace(/\n/g, '<br>');
  } else {
    msg.textContent = text;
  }
  chatBox.appendChild(msg);
  chatBox.scrollTop = chatBox.scrollHeight;
  return msg;
}