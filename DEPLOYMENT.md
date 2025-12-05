# JBS App - Setup & Deployment Guide

## 📋 Prerequisites

### Local Development
- Node.js v20.19.0 atau lebih tinggi
- PostgreSQL 14+ terinstall
- npm atau yarn package manager

### VPS Hostinger
- VPS dengan akses SSH
- Domain (opsional, bisa pakai IP)
- PostgreSQL database (bisa menggunakan Hostinger Database atau install sendiri)

---

## 🚀 Setup Local Development

### 1. Install PostgreSQL (jika belum terinstall)

**Windows:**
1. Download PostgreSQL dari https://www.postgresql.org/download/windows/
2. Install dengan PostgreSQL Installer
3. Catat username dan password yang dibuat (default: postgres)
4. PostgreSQL akan berjalan di port 5432

**Atau menggunakan Docker:**
```powershell
docker run --name jbs-postgres -e POSTGRES_PASSWORD=password -p 5432:5432 -d postgres:14
```

### 2. Buat Database

Buka PowerShell atau Terminal dan jalankan:

```powershell
# Masuk ke PostgreSQL
psql -U postgres

# Di dalam PostgreSQL prompt:
CREATE DATABASE jbs_app;
\q
```

Atau menggunakan pgAdmin (GUI tool yang terinstall bersama PostgreSQL).

### 3. Clone & Setup Project

```powershell
# Navigasi ke folder project (sudah dilakukan)
cd d:\b_outside\JBS\jbs_app\jbs_app

# Install dependencies (sudah dilakukan)
npm install

# Copy environment file
# File .env sudah dibuat, edit sesuai konfigurasi database Anda
```

### 4. Konfigurasi Environment (.env)

Edit file `.env` di root project:

```env
# Database Configuration
DATABASE_URL=postgresql://postgres:password@localhost:5432/jbs_app

# Session Secret (ganti dengan string random yang aman)
SESSION_SECRET=your-secret-key-change-this-in-production

# Node Environment
NODE_ENV=development

# Server Port
PORT=3000
```

**Catatan:** Ganti `password` dengan password PostgreSQL Anda.

### 5. Push Database Schema

```powershell
npm run db:push
```

Perintah ini akan membuat tabel-tabel di database sesuai schema yang didefinisikan.

### 6. Jalankan Development Server

```powershell
# Development mode (hot reload)
npm run dev

# Atau jalankan client dan server terpisah:
# Terminal 1:
npm run dev:client

# Terminal 2:
npm run dev
```

Aplikasi akan berjalan di:
- Client: http://localhost:5000
- Server API: http://localhost:3000

---

## 🌐 Deployment ke VPS Hostinger

### Persiapan VPS

#### 1. Login ke VPS via SSH

```bash
ssh root@your-vps-ip
# atau
ssh username@your-vps-ip
```

#### 2. Update System & Install Dependencies

```bash
# Update package list
sudo apt update && sudo apt upgrade -y

# Install Node.js 20.x
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt-get install -y nodejs

# Install PostgreSQL
sudo apt install postgresql postgresql-contrib -y

# Install PM2 untuk process management
sudo npm install -g pm2

# Install Nginx (reverse proxy)
sudo apt install nginx -y

# Install Git (jika belum ada)
sudo apt install git -y
```

#### 3. Setup PostgreSQL di VPS

```bash
# Switch ke user postgres
sudo -u postgres psql

# Di dalam PostgreSQL prompt:
CREATE DATABASE jbs_app;
CREATE USER jbs_user WITH PASSWORD 'your_secure_password';
GRANT ALL PRIVILEGES ON DATABASE jbs_app TO jbs_user;
\q
```

**Atau gunakan Hostinger Managed Database:**
- Login ke Hostinger Panel
- Buat database PostgreSQL baru
- Catat connection string yang diberikan

#### 4. Clone/Upload Project ke VPS

**Opsi A: Menggunakan Git (Recommended)**

```bash
# Buat direktori untuk aplikasi
sudo mkdir -p /var/www/jbs_app
sudo chown -R $USER:$USER /var/www/jbs_app
cd /var/www/jbs_app

# Clone repository (jika menggunakan Git)
git clone <your-repository-url> .

# Atau upload via SFTP/SCP
```

**Opsi B: Upload via SFTP**

Gunakan tools seperti FileZilla atau WinSCP:
- Host: your-vps-ip
- Username: your-ssh-username
- Port: 22
- Upload semua file project ke `/var/www/jbs_app`

#### 5. Install Dependencies di VPS

```bash
cd /var/www/jbs_app
npm install --production
```

#### 6. Setup Environment Production (.env)

```bash
nano .env
```

Isi dengan konfigurasi production:

```env
# Database Configuration (ganti dengan kredensial VPS Anda)
DATABASE_URL=postgresql://jbs_user:your_secure_password@localhost:5432/jbs_app

# Session Secret (WAJIB ganti dengan string random yang kuat)
SESSION_SECRET=your-very-secure-random-secret-key-here

# Node Environment
NODE_ENV=production

# Server Port
PORT=3000
```

**Generate SESSION_SECRET yang aman:**

```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

#### 7. Push Database Schema

```bash
npm run db:push
```

#### 8. Build Aplikasi

```bash
npm run build
```

#### 9. Setup PM2 (Process Manager)

```bash
# Start aplikasi dengan PM2
pm2 start npm --name "jbs_app" -- start

# Save PM2 configuration
pm2 save

# Setup PM2 untuk auto-start saat reboot
pm2 startup
# Ikuti instruksi yang muncul

# Check status
pm2 status

# Lihat logs
pm2 logs jbs_app
```

#### 10. Setup Nginx Reverse Proxy

```bash
# Buat konfigurasi Nginx
sudo nano /etc/nginx/sites-available/jbs_app
```

Isi dengan konfigurasi berikut:

```nginx
server {
    listen 80;
    server_name your-domain.com;  # Ganti dengan domain Anda atau IP VPS

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

**Aktifkan konfigurasi:**

```bash
# Buat symbolic link
sudo ln -s /etc/nginx/sites-available/jbs_app /etc/nginx/sites-enabled/

# Test konfigurasi Nginx
sudo nginx -t

# Restart Nginx
sudo systemctl restart nginx

# Enable Nginx auto-start
sudo systemctl enable nginx
```

#### 11. Setup Firewall

```bash
# Allow SSH, HTTP, HTTPS
sudo ufw allow 22/tcp
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp

# Enable firewall
sudo ufw enable

# Check status
sudo ufw status
```

#### 12. Setup SSL dengan Let's Encrypt (Opsional tapi Recommended)

```bash
# Install Certbot
sudo apt install certbot python3-certbot-nginx -y

# Obtain SSL certificate
sudo certbot --nginx -d your-domain.com

# Certificate akan auto-renew
```

---

## 🔧 Management & Maintenance

### PM2 Commands

```bash
# Start aplikasi
pm2 start jbs_app

# Stop aplikasi
pm2 stop jbs_app

# Restart aplikasi
pm2 restart jbs_app

# Reload aplikasi (zero downtime)
pm2 reload jbs_app

# Lihat logs
pm2 logs jbs_app

# Lihat logs realtime
pm2 logs jbs_app --lines 100

# Monitor resource usage
pm2 monit

# List semua aplikasi
pm2 list
```

### Update Aplikasi di VPS

```bash
cd /var/www/jbs_app

# Pull perubahan terbaru (jika menggunakan Git)
git pull origin main

# Install dependencies baru (jika ada)
npm install --production

# Build ulang
npm run build

# Update database schema (jika ada perubahan)
npm run db:push

# Restart dengan PM2
pm2 restart jbs_app
```

### Database Backup

```bash
# Backup database
pg_dump -U jbs_user -h localhost jbs_app > backup_$(date +%Y%m%d).sql

# Restore database
psql -U jbs_user -h localhost jbs_app < backup_20231205.sql
```

### Nginx Commands

```bash
# Test konfigurasi
sudo nginx -t

# Restart Nginx
sudo systemctl restart nginx

# Reload Nginx (tanpa downtime)
sudo systemctl reload nginx

# Check status
sudo systemctl status nginx

# Lihat error log
sudo tail -f /var/log/nginx/error.log
```

---

## 📊 Monitoring & Troubleshooting

### Check Aplikasi Berjalan

```bash
# PM2 status
pm2 status

# Check port
sudo netstat -tulpn | grep :3000

# Check Nginx
sudo systemctl status nginx

# Check PostgreSQL
sudo systemctl status postgresql
```

### Lihat Logs

```bash
# PM2 logs
pm2 logs jbs_app

# Nginx access log
sudo tail -f /var/log/nginx/access.log

# Nginx error log
sudo tail -f /var/log/nginx/error.log

# PostgreSQL log
sudo tail -f /var/log/postgresql/postgresql-*.log
```

### Common Issues

#### Port sudah digunakan
```bash
# Cek proses yang menggunakan port 3000
sudo lsof -i :3000

# Kill process
sudo kill -9 <PID>
```

#### Database connection error
- Cek DATABASE_URL di `.env`
- Cek PostgreSQL service: `sudo systemctl status postgresql`
- Cek PostgreSQL user permission

#### Nginx 502 Bad Gateway
- Cek aplikasi berjalan: `pm2 status`
- Cek logs: `pm2 logs jbs_app`
- Restart aplikasi: `pm2 restart jbs_app`

---

## 🔐 Security Checklist

- [ ] Ganti SESSION_SECRET dengan string random yang kuat
- [ ] Setup SSL/HTTPS dengan Let's Encrypt
- [ ] Gunakan password database yang kuat
- [ ] Enable firewall (UFW)
- [ ] Update system secara berkala
- [ ] Backup database secara rutin
- [ ] Batasi akses SSH (gunakan SSH key, disable root login)
- [ ] Setup monitoring (optional: Datadog, New Relic, dll)

---

## 📱 Access Aplikasi

### Local Development
- http://localhost:5000

### Production (VPS)
- http://your-domain.com (atau IP VPS)
- https://your-domain.com (jika SSL sudah disetup)

---

## 💡 Tips

1. **Gunakan Git untuk deployment** - Lebih mudah untuk update aplikasi
2. **Setup CI/CD** - Automasi deployment dengan GitHub Actions
3. **Monitor resource usage** - Gunakan `pm2 monit` atau tools lain
4. **Regular backup** - Backup database dan aplikasi secara berkala
5. **Use environment variables** - Jangan hardcode credentials
6. **Log rotation** - Setup log rotation untuk PM2 dan Nginx
7. **Security updates** - Jalankan `sudo apt update && sudo apt upgrade` secara berkala

---

## 📞 Support

Jika ada masalah saat deployment, check:
1. PM2 logs: `pm2 logs jbs_app`
2. Nginx logs: `sudo tail -f /var/log/nginx/error.log`
3. System logs: `journalctl -xe`

---

**Good luck with your deployment! 🚀**
