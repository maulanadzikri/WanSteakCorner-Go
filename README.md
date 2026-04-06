# 🥩 Wan Steak Corner - Kiosk & POS System

Wan Steak Corner adalah aplikasi sistem pemesanan bergaya Kiosk dan *Point of Sales* (POS) berbasis Web. Aplikasi ini memungkinkan pelanggan untuk menelusuri menu, memfilter kategori, mencari makanan, dan melakukan pemesanan (Checkout). Selain itu, terdapat sisi Admin untuk mengelola data menu secara dinamis.

## 🚀 Tech Stack

**Frontend:**
* React.js (Vite)
* Tailwind CSS (Styling)
* React Router DOM (Navigasi)
* React Icons & React Hot Toast (UI/UX)

**Backend:**
* Golang (Go)
* GORM (ORM Library)
* PostgreSQL (Database)

---

## 📂 Struktur Folder Proyek

Aplikasi ini dipisahkan secara tegas antara sisi *Client* (Frontend) dan *Server* (Backend) untuk memudahkan skalabilitas dan *maintenance*.

```text
wansteakcorner/
│
├── server/                 # API Server (Golang)
│   ├── config/              # Konfigurasi koneksi Database (PostgreSQL)
│   ├── controllers/         # Logika penanganan request & response API
│   ├── models/              # Struktur data GORM (Entity/Tabel Database)
│   ├── routes/              # Pendaftaran endpoint URL API
│   ├── .env                 # Variabel environment (Database & JWT)
│   ├── go.mod               # Manajemen dependensi Go
│   └── main.go              # Entry point server Golang
│
└── client/                # Client Application (React + Vite)
    ├── public/              # Aset statis (seperti favicon atau gambar default)
    ├── src/
    │   ├── components/      # Komponen UI independen (Navbar, MenuCard, CartSidebar)
    │   ├── pages/           # Komponen level halaman (Home, AdminMenu, Transactions)
    │   ├── services/        # Konfigurasi Axios untuk memanggil endpoint API/Ngrok
    │   ├── App.jsx          # Konfigurasi routing utama dengan React Router
    │   ├── main.jsx         # Entry point aplikasi React
    │   └── index.css        # File CSS utama (Konfigurasi Tailwind)
    ├── package.json         # Manajemen dependensi NPM (Node.js)
    ├── tailwind.config.js   # Konfigurasi styling, warna, dan tema Tailwind
    └── vite.config.js       # Konfigurasi bundler Vite

```
---

## ✨ Fitur Utama

### 🧑‍🍳 Sisi Pelanggan (Customer)
* **Landing Page Premium:** Sambutan visual bergaya Kiosk modern.
* **Katalog Menu Interaktif:** Dilengkapi *Search Bar* ganda dan *Pill Tabs* untuk filter kategori (Makanan Utama, Minuman, Snack).
* **Keranjang Pintar (Smart Cart):** Manajemen *quantity* (`+`/`-`) dengan auto-hapus jika *quantity* mencapai nol.
* **Checkout & Riwayat Pesanan:** Melacak pesanan pelanggan dengan UI *Accordion* untuk pesanan berjumlah besar.

### 🔐 Sisi Admin
* **Manajemen Menu (CRUD):** Tambah, Edit, dan Hapus menu beserta stok dan kategori.
* **Keamanan:** Autentikasi berbasis token (JWT) untuk akses *Dashboard*.
* *(Upcoming)*: Dashboard Statistik & Export CSV.

---

## 🛠️ Cara Menjalankan di Local (Local Development)

Pastikan Anda sudah menginstal **Node.js**, **Golang**, dan **PostgreSQL** di komputer Anda.

### 1. Setup Database
1. Buka PostgreSQL (via pgAdmin / psql / TablePlus).
2. Buat database baru bernama `wansteak_db`.

### 2. Setup Backend (Go)
1. Buka terminal, masuk ke folder backend.
2. Buat file `.env` di *root* folder backend dan isi dengan konfigurasi database dan Midrans Sandbox Anda:
   ```env
        DB_HOST=localhost
        DB_USER=postgres
        DB_PASSWORD=password_db_anda
        DB_NAME=wansteak_db
        DB_PORT=5432
        JWT_SECRET=rahasia_super_aman

        MIDTRANS_SERVER_KEY=
        MIDTRANS_CLIENT_KEY=
        MIDTRANS_ENVIRONMENT=sandbox
   ```
1. Jalankan perintah instalasi dan jalankan server:
    ```bash
        # Windows & macOS sama  
        go mod tidy
        go run main.go
    ```
   Catatan: GORM akan otomatis melakukan migrasi tabel ke database Anda.
2. Ekspos API dengan Ngrok .
   Agar Midtrans dan frontend bisa berkomunikasi dengan backend secara online tanpa kendala IP, gunakan domain statis Ngrok yang sudah dikonfigurasi. Buka terminal baru dan jalankan:
   ```bash
   ngrok http --domain=domain-statis-anda.ngrok-free.app 8080
   ```
   (Pastikan Anda mengganti domain-statis-anda dengan domain yang terdaftar di akun Ngrok Anda, dan pastikan port 8080 sesuai dengan port server Go).
   
### 3. Setup Frontend (React)
1. Buka terminal baru, masuk ke folder frontend
2. Install dependencies:
   ```bash
   npm install
3. (Opsional) Jika endpoint API backend bukan di `http://localhost:8080`, sesuaikan di file `src/services/api.js`.
4. Jalankan development server:
   ```bash
   npm run dev