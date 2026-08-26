# Penjelasan Celah Keamanan (Security Vulnerabilities)

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
