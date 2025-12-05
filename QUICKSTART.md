# 🚀 Quick Start Guide - JBS App

## Untuk Local Development (Windows)

### Step 1: Install PostgreSQL

**Pilihan A: Install PostgreSQL Native**
1. Download dari: https://www.postgresql.org/download/windows/
2. Install dengan default settings
3. Catat password untuk user `postgres`
4. PostgreSQL akan berjalan di `localhost:5432`

**Pilihan B: Menggunakan Docker (Recommended jika sudah punya Docker)**
```powershell
docker run --name jbs-postgres -e POSTGRES_PASSWORD=password -e POSTGRES_DB=jbs_app -p 5432:5432 -d postgres:14
```

### Step 2: Buat Database (Skip jika pakai Docker dengan env var di atas)

```powershell
# Buka psql (dari Start Menu atau command line)
psql -U postgres

# Di dalam psql, jalankan:
CREATE DATABASE jbs_app;
\q
```

### Step 3: Edit File .env

File `.env` sudah dibuat. Edit sesuai setup Anda:

```env
DATABASE_URL=postgresql://postgres:password@localhost:5432/jbs_app
SESSION_SECRET=your-secret-key-change-this
NODE_ENV=development
PORT=3000
```

Ganti:
- `password` → password PostgreSQL Anda
- `your-secret-key-change-this` → string random (untuk development bisa tetap)

### Step 4: Push Database Schema

```powershell
npm run db:push
```

Jika berhasil, Anda akan melihat:
```
✅ Schema pushed to database
```

### Step 5: Jalankan Aplikasi

```powershell
# Development mode (dengan hot reload)
npm run dev
```

Atau jalankan client dan server terpisah di 2 terminal:

**Terminal 1 (Client):**
```powershell
npm run dev:client
```

**Terminal 2 (Server):**
```powershell
npm run dev
```

### Step 6: Buka Browser

- Client: http://localhost:5000
- API: http://localhost:3000

---

## ✅ Checklist Testing

- [ ] PostgreSQL berjalan (`psql -U postgres` works)
- [ ] Database `jbs_app` sudah dibuat
- [ ] File `.env` sudah dikonfigurasi dengan benar
- [ ] `npm install` berhasil
- [ ] `npm run db:push` berhasil (tabel users terbuat)
- [ ] `npm run dev` atau `npm start` berjalan tanpa error
- [ ] Bisa akses http://localhost:5000 di browser

---

## 🐛 Troubleshooting

### Error: "DATABASE_URL not found"
- Pastikan file `.env` ada di root folder project
- Cek format DATABASE_URL benar

### Error: "Connection refused" atau "ECONNREFUSED"
- Pastikan PostgreSQL sudah berjalan
- Windows: Check di Services (services.msc) → postgresql-x64-14 running
- Docker: `docker ps` untuk cek container berjalan

### Error: "password authentication failed"
- Cek password di DATABASE_URL sesuai dengan password PostgreSQL
- Format: `postgresql://username:password@localhost:5432/database_name`

### Error: Port already in use
- Port 3000 atau 5000 sudah digunakan
- Ganti PORT di `.env` atau stop aplikasi lain yang menggunakan port tersebut

### PostgreSQL Command Not Found
- Add PostgreSQL bin ke PATH:
  - Default location: `C:\Program Files\PostgreSQL\14\bin`
  - Add ke System Environment Variables

---

## 📦 Quick Commands Reference

```powershell
# Install dependencies
npm install

# Push database schema
npm run db:push

# Development
npm run dev

# Build for production
npm run build

# Start production server
npm start

# TypeScript check
npm run check
```

---

## 🌐 Ready untuk Deployment ke VPS?

Setelah aplikasi berjalan di local, lihat file **DEPLOYMENT.md** untuk panduan lengkap deployment ke VPS Hostinger.

Quick preview deployment steps:
1. Setup VPS (Node.js, PostgreSQL, PM2, Nginx)
2. Upload project files
3. Configure `.env` production
4. Run `bash setup.sh`
5. Configure Nginx reverse proxy
6. Setup SSL (optional)

---

**Selamat coding! 🎉**
