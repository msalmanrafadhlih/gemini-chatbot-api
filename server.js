const express = require('express');
const dotenv = require('dotenv');
const { GoogleGenerativeAI } = require('@google/generative-ai');
const cors = require('cors');

dotenv.config();

const path = require('path');
const app = express();
const port = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

if (!process.env.GEMINI_API_KEY) {
  console.error("Kesalahan: GEMINI_API_KEY tidak ditemukan. Pastikan Anda sudah mengaturnya di file .env");
  process.exit(1);
}
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

app.post('/generate-text', async (req, res) => {
  try {
    const { prompt } = req.body;
    if (!prompt) {
      return res.status(400).json({ error: 'Input "prompt" diperlukan dalam body permintaan.' });
    }
    const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();
    const promptTokens = prompt.split(/\s+/).length;
    const responseTokens = text.split(/\s+/).length;
    const totalTokens = promptTokens + responseTokens;

    res.json({ generatedText: text, tokenCount: totalTokens });
  } catch (error) {
    console.error('Error saat berinteraksi dengan Gemini API:', error);
    if (error.message) {
      res.status(500).json({ error: `Terjadi kesalahan pada server: ${error.message}` });
    } else {
      res.status(500).json({ error: 'Terjadi kesalahan pada server saat memproses permintaan Anda.' });
    }
  }
});

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.listen(port, () => {
  console.log(`Server berjalan di http://localhost:${port}`);
});