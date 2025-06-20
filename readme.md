# Gemini AI Chatbot

Chatbot sederhana berbasis Gemini API (Google Generative AI) menggunakan Node.js (Express) untuk backend dan HTML/JS untuk frontend.

## Fitur
- Chat dengan model Gemini AI
- Menampilkan jumlah token yang digunakan setiap interaksi

## Cara Menjalankan

1. **Clone repo ini dan install dependency:**
   ```
   npm install
   ```

2. **Buat file `.env` dan isi dengan API key Gemini Anda:**
   ```
   GEMINI_API_KEY=your_google_generative_ai_key
   ```

3. **Jalankan backend:**
   ```
   node server.js
   ```

4. **Buka `index.html` di browser.**

## Struktur File

- `server.js` — Backend Express, endpoint Gemini API
- `index.html` — Tampilan utama chatbot
- `script.js` — Logika frontend (chat, token count)
- `style.css` — (Opsional) CSS untuk tampilan
- `.env` — Tempat menyimpan API key (jangan diupload ke git)
- `.gitignore` — Mengabaikan file sensitif dan dependency

## Catatan
- Pastikan Node.js sudah terinstall.
- Jangan share file `.env` Anda ke publik.

---

**Lisensi:** MIT