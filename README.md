# ProductVault — DummyJSON CRUD SPA

Aplikasi web **Single Page Application (SPA)** menggunakan **Vanilla JavaScript** dan **Fetch API** untuk melakukan operasi CRUD terhadap [DummyJSON API](https://dummyjson.com/).

---

## ✨ Fitur

| Fitur | Method HTTP | Endpoint |
|---|---|---|
| Tampil Produk | `GET` | `/products?limit=18` |
| Tambah Produk | **`POST`** | `/products/add` |
| Edit Produk | **`PATCH`** | `/products/{id}` |
| Hapus Produk | **`DELETE`** | `/products/{id}` |

---

## 🛠️ Teknologi

- **HTML5** + **CSS3** (tanpa framework)
- **Vanilla JavaScript** (ES2022+)
- `async/await` + `try...catch` untuk semua HTTP request
- **Fetch API** untuk komunikasi ke DummyJSON
- Font: [Syne](https://fonts.google.com/specimen/Syne) + [DM Mono](https://fonts.google.com/specimen/DM+Mono) via Google Fonts

---

## 🚀 Cara Menjalankan

### Opsi 1 — Buka Langsung (Paling Mudah)
1. Download atau clone repository ini
2. Buka file **`index.html`** langsung di browser (double-click)
3. Tidak perlu server atau instalasi apapun ✅

### Opsi 2 — Live Server (VSCode)
1. Install ekstensi [Live Server](https://marketplace.visualstudio.com/items?itemName=ritwickdey.LiveServer) di VSCode
2. Klik kanan pada `index.html` → **Open with Live Server**
3. Browser akan terbuka otomatis di `http://127.0.0.1:5500`

### Opsi 3 — Python HTTP Server
```bash
# Python 3
python -m http.server 8080
# Buka browser: http://localhost:8080
```

---

## 📁 Struktur File

```
project-dummyjson/
├── index.html   ← Struktur HTML + komponen UI
├── style.css    ← Seluruh styling (dark theme, animasi, responsive)
├── app.js       ← Logic JavaScript (CRUD, DOM manipulation)
└── README.md    ← Panduan ini
```

---


