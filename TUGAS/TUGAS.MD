# Penjelasan Celah Keamanan & Implementasi Mandiri

---

# Bagian 1 — Penjelasan Celah Keamanan (Security Vulnerabilities)

## 1. SQL Injection

![SQL Injection](./SCREENSHOT/SQL%20INJECTION.png)

- **Lokasi Kode:** `controllers/search.unsafe.controller.js` (Baris 40)
- **Penjelasan:** Celah SQL Injection terjadi karena parameter input pengguna (`q`) digabungkan secara langsung ke dalam string query SQL menggunakan *template literal* (`${q}`) tanpa *parameterized query*. Hal ini memungkinkan penyerang menyisipkan perintah SQL buatan yang dapat memanipulasi atau merusak logika query database.

---

## 2. XSS Reflected (Cross-Site Scripting)

![XSS Reflected](./SCREENSHOT/XSS%20INJECTION.png)

- **Lokasi Kode:** `views/search-unsafe.ejs` (Baris 53)
- **Penjelasan:** Celah Reflected XSS terjadi akibat penggunaan sintaks EJS `<%- query %>` yang merender input parameter pencarian secara *unescaped*. Akibatnya, script JavaScript yang disisipkan melalui input pencarian akan langsung diinterpretasikan dan dieksekusi oleh browser korban.

---

## 3. XSS Stored (Cross-Site Scripting)

![XSS Stored](./SCREENSHOT/XSS%20STORED%20.png)

- **Lokasi Kode:** `views/search-unsafe.ejs` (Baris 62–63)
- **Penjelasan:** Celah Stored XSS terjadi karena atribut produk (`product.name` dan `product.description`) dirender tanpa proses *escaping* HTML (`<%- %>`). Jika data bernilai script berbahaya tersimpan di database, script tersebut akan terus dieksekusi setiap kali halaman pencarian dimuat oleh pengguna.

---

## 4. Escape HTML

![Escape HTML](./SCREENSHOT/ESCAPE%20HTML.png)

- **Lokasi Kode:** `views/demo/escape-html.ejs` (Baris 39 & 47)
- **Penjelasan:** Perbedaan penanganan HTML terletak pada sintaks EJS; sintaks `<%= %>` melakukan *escaping* otomatis pada karakter khusus HTML sehingga aman dari eksekusi script. Sebaliknya, sintaks `<%- %>` merender HTML mentah sehingga tag HTML dan JavaScript input akan langsung dijalankan oleh browser.

---

## 5. Penolakan Payload (Payload Ditolak)

![Payload Ditolak](./SCREENSHOT/PAYLOAD%20DI%20TOLAK.png)

- **Lokasi Kode:** `middlewares/validators.js` & `views/feedback.ejs`
- **Penjelasan:** Penolakan payload terjadi ketika pengguna mencoba menginputkan script atau karakter berbahaya ke dalam form. Server memvalidasi dan menolak input tersebut secara langsung serta memunculkan alert/popup yang menginfokan bahwa payload ditolak.

---

# Bagian 2 — Implementasi Mandiri (Form Feedback / Komentar Aman)

Halaman baru **Form Feedback / Komentar** telah dibuat pada rute `/feedback`. Implementasi ini secara khusus dirancang untuk memenuhi 4 pilar keamanan web yang diwajibkan:

---

### 1. Validasi Input Server-Side & Penolakan Payload (Alert/Popup)
- **Deskripsi:** Seluruh input form divalidasi penuh di server menggunakan middleware `express-validator` di [middlewares/validators.js]. Jika pengguna mengirimkan payload berbahaya (misal: `<script>alert(1)</script>`, HTML tags, `javascript:`, atau SQL injection pattern), server akan **menolak input tersebut**, memunculkan **Browser Alert Modal (`alert()`)** serta **Popup Modal Overlay UI**, dan menampilkan pesan error bahwa input/payload ditolak.
- **Potongan Kode Validasi & Penolakan Payload:**
```javascript
function detectPayload(value, fieldName) {
  if (!value) return true;
  const xssPattern = /<[^>]+>|javascript:|on\w+\s*=|alert\s*\(|prompt\s*\(|eval\s*\(/i;
  const sqliPattern = /('|--|;|\/\*|\*\/|UNION\s+SELECT|' OR '|" OR "|' OR 1=1|" OR 1=1|;\s*(DROP|DELETE|UPDATE|INSERT|SELECT))/i;

  if (xssPattern.test(value) || sqliPattern.test(value)) {
    throw new Error(`Input ditolak! Terdeteksi payload berbahaya (Script/HTML/SQLi) pada field ${fieldName}.`);
  }
  return true;
}

const feedbackValidationRules = [
  body('name')
    .trim()
    .notEmpty().withMessage('Nama wajib diisi')
    .isLength({ min: 3, max: 50 }).withMessage('Nama harus antara 3 - 50 karakter')
    .custom((val) => detectPayload(val, 'Nama'))
    .escape(),
  body('email')
    .trim()
    .notEmpty().withMessage('Email wajib diisi')
    .custom((val) => detectPayload(val, 'Email'))
    .isEmail().withMessage('Format email tidak valid')
    .normalizeEmail(),
  body('message')
    .trim()
    .notEmpty().withMessage('Pesan/Komentar wajib diisi')
    .isLength({ min: 5, max: 500 }).withMessage('Pesan/Komentar harus antara 5 - 500 karakter')
    .custom((val) => detectPayload(val, 'Pesan/Komentar'))
    .escape(),
];
```

SCREENSHOT: 

![Payload Ditolak](./SCREENSHOT/PAYLOAD%20DI%20TOLAK.png)

---

### 2. Sanitasi Input (Trim, Escape, & Normalize Email)
- **Deskripsi:** Sebelum data diproses atau disimpan ke database, input pengguna disanitasi secara otomatis:
  - `.trim()` menghapus spasi tak berwujud di awal dan akhir input.
  - `.escape()` mengonversi karakter HTML sensitif (`<`, `>`, `&`, `"`, `'`) menjadi HTML entities.
  - `.normalizeEmail()` menyetarakan format alamat email (misal: merender ke lowercase).
- **Contoh Perbandingan Before vs After Sanitasi:**
  - **Raw Input (Before):**
    - `name`: `"   Budi Santoso   "`
    - `email`: `"User.Test@GMAIL.COM"`
    - `message`: `"<script>alert('XSS')</script> Halo  "`
  - **Sanitized Output (After):**
    - `name`: `"Budi Santoso"`
    - `email`: `"usertest@gmail.com"`
    - `message`: `"&lt;script&gt;alert(&#x27;XSS&#x27;)&lt;/script&gt; Halo"`

---

### 3. Escape HTML pada Render Data User (Pencegahan XSS)
- **Deskripsi:** Pada view [views/feedback.ejs](file:///Users/rafierasydan/Documents/Sem%20ANTARA/PAW/PRAKTIKUM/PAW-ANTARA-WEEK12-20240140074/views/feedback.ejs#L110-L125), seluruh data pengguna yang ditampilkan kembali menggunakan sintaks EJS `<%= %>` (bukan `<%- %>`). Ketika dicoba memasukkan payload script seperti `<script>alert(1)</script>`, script tersebut **tidak akan tereksekusi oleh browser**, melainkan ditampilkan sebagai teks biasa.
- **Potongan Kode EJS Escaped Render:**
```ejs
<!-- Menggunakan <%= %> untuk auto-escape karakter HTML -->
<span class="font-semibold text-gray-800 text-sm"><%= fb.name %></span>
<p class="text-xs text-gray-500 mb-2">Email: <%= fb.email %></p>
<div class="bg-gray-50 border border-gray-200 rounded p-3 text-sm text-gray-700 break-all">
  <%= fb.message %>
</div>
```

---

### 4. Query Database Menggunakan ORM (Parameterized Query)
- **Deskripsi:** Pembuatan dan pencarian record pada database dilakukan melalui ORM Sequelize di [controllers/feedback.controller.js](file:///Users/rafierasydan/Documents/Sem%20ANTARA/PAW/PRAKTIKUM/PAW-ANTARA-WEEK12-20240140074/controllers/feedback.controller.js#L5-L45) yang secara otomatis menggunakan *parameterized queries*, sehingga kebal terhadap serangan SQL Injection.
- **Potongan Kode Query Database (ORM):**
```javascript
// Parameterized Query untuk mengambil seluruh data komentar
const feedbacks = await Feedback.findAll({
  order: [['createdAt', 'DESC']],
});

// Parameterized Query untuk membuat record baru secara aman
await Feedback.create({
  name: req.body.name,
  email: req.body.email,
  message: req.body.message,
});
```


