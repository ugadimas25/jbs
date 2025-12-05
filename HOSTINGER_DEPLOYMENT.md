# 🔥 Hostinger VPS Deployment - Step by Step

## 🎯 Cara Deploy ke VPS Hostinger

### Informasi yang Anda Butuhkan dari Hostinger:

1. **IP Address VPS** - dari Hostinger VPS Dashboard
2. **SSH Username** - biasanya `root` atau username yang dibuat
3. **SSH Password/Key** - dari Hostinger
4. **Domain** (opsional) - jika punya, pointing A record ke IP VPS

---

## 📝 Step-by-Step Deployment

### Part 1: Koneksi ke VPS

**1. Login ke VPS via SSH**

Windows (menggunakan PowerShell atau CMD):
```powershell
ssh root@YOUR_VPS_IP
# Masukkan password saat diminta
```

Atau gunakan PuTTY jika prefer GUI.

**2. Update System**
```bash
apt update && apt upgrade -y
```

---

### Part 2: Install Required Software

**3. Install Node.js 20.x**
```bash
# Install Node.js dari NodeSource
curl -fsSL https://deb.nodesource.com/setup_20.x | bash -
apt-get install -y nodejs

# Verify installation
node --version
npm --version
```

**4. Install PostgreSQL**
```bash
apt install postgresql postgresql-contrib -y

# Start PostgreSQL service
systemctl start postgresql
systemctl enable postgresql

# Check status
systemctl status postgresql
```

**5. Install PM2 (Process Manager)**
```bash
npm install -g pm2
pm2 --version
```

**6. Install Nginx**
```bash
apt install nginx -y
systemctl start nginx
systemctl enable nginx
```

**7. Install Git** (jika belum ada)
```bash
apt install git -y
```

---

### Part 3: Setup PostgreSQL Database

**8. Create Database and User**
```bash
# Switch to postgres user
sudo -u postgres psql

# Di dalam PostgreSQL prompt, jalankan:
CREATE DATABASE jbs_app;
CREATE USER jbs_user WITH PASSWORD 'YOUR_SECURE_PASSWORD_HERE';
GRANT ALL PRIVILEGES ON DATABASE jbs_app TO jbs_user;

# Grant schema privileges
\c jbs_app
GRANT ALL ON SCHEMA public TO jbs_user;

# Exit psql
\q
```

**Catatan:** Ganti `YOUR_SECURE_PASSWORD_HERE` dengan password yang kuat!

---

### Part 4: Upload & Setup Aplikasi

**9. Buat Direktori Aplikasi**
```bash
mkdir -p /var/www/jbs_app
cd /var/www/jbs_app
```

**10. Upload Files ke VPS**

**Opsi A: Menggunakan Git (Recommended)**

Jika project Anda di GitHub/GitLab:
```bash
git clone https://github.com/YOUR_USERNAME/YOUR_REPO.git .
```

**Opsi B: Upload via SFTP**

Dari Windows, gunakan **WinSCP** atau **FileZilla**:
- Host: YOUR_VPS_IP
- Port: 22
- Username: root
- Password: YOUR_PASSWORD
- Upload semua file project ke `/var/www/jbs_app/`

**Opsi C: Menggunakan SCP dari PowerShell**
```powershell
# Dari folder project di Windows
scp -r * root@YOUR_VPS_IP:/var/www/jbs_app/
```

**11. Set Permission**
```bash
cd /var/www/jbs_app
chown -R www-data:www-data /var/www/jbs_app
chmod -R 755 /var/www/jbs_app
```

**12. Install Dependencies**
```bash
cd /var/www/jbs_app
npm install --production
```

---

### Part 5: Configure Environment

**13. Create .env File**
```bash
cd /var/www/jbs_app
nano .env
```

Isi dengan configuration production:
```env
# Database Configuration
DATABASE_URL=postgresql://jbs_user:YOUR_SECURE_PASSWORD_HERE@localhost:5432/jbs_app

# Session Secret - WAJIB GANTI!
SESSION_SECRET=generate_random_secure_secret_key_here

# Node Environment
NODE_ENV=production

# Server Port
PORT=3000
```

**Generate SESSION_SECRET yang aman:**
```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

Copy output dan paste ke SESSION_SECRET.

**Simpan file:**
- Press `Ctrl + O` (save)
- Press `Enter`
- Press `Ctrl + X` (exit)

---

### Part 6: Setup Database & Build

**14. Push Database Schema**
```bash
cd /var/www/jbs_app
npm run db:push
```

Anda harus melihat:
```
✅ Changes applied
```

**15. Build Aplikasi**
```bash
npm run build
```

Wait sampai build selesai (biasanya 1-2 menit).

---

### Part 7: Start Aplikasi dengan PM2

**16. Start dengan PM2**
```bash
cd /var/www/jbs_app

# Start aplikasi
pm2 start npm --name "jbs_app" -- start

# Check status
pm2 status

# Save PM2 config
pm2 save

# Setup PM2 auto-start on reboot
pm2 startup
# PENTING: Copy dan jalankan command yang muncul!
```

**17. Verify Aplikasi Berjalan**
```bash
# Check PM2 logs
pm2 logs jbs_app

# Test dengan curl
curl http://localhost:3000
```

Jika ada response HTML, berarti aplikasi berjalan!

---

### Part 8: Setup Nginx Reverse Proxy

**18. Create Nginx Configuration**
```bash
nano /etc/nginx/sites-available/jbs_app
```

Paste konfigurasi ini (ganti `your-domain.com` dengan domain/IP Anda):
```nginx
server {
    listen 80;
    server_name your-domain.com www.your-domain.com;
    
    access_log /var/log/nginx/jbs_app_access.log;
    error_log /var/log/nginx/jbs_app_error.log;
    
    client_max_body_size 10M;
    
    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }
}
```

**19. Enable Site**
```bash
# Create symbolic link
ln -s /etc/nginx/sites-available/jbs_app /etc/nginx/sites-enabled/

# Remove default site (opsional)
rm /etc/nginx/sites-enabled/default

# Test nginx configuration
nginx -t

# Restart nginx
systemctl restart nginx
```

---

### Part 9: Setup Firewall

**20. Configure UFW Firewall**
```bash
# Allow SSH (PENTING! Jangan skip ini)
ufw allow 22/tcp

# Allow HTTP & HTTPS
ufw allow 80/tcp
ufw allow 443/tcp

# Enable firewall
ufw enable

# Check status
ufw status
```

---

### Part 10: Test Deployment

**21. Test Akses dari Browser**

Buka browser dan akses:
```
http://YOUR_VPS_IP
```

atau jika sudah setup domain:
```
http://your-domain.com
```

Aplikasi JBS harus muncul! 🎉

---

### Part 11: Setup SSL (HTTPS) - RECOMMENDED

**22. Install Certbot**
```bash
apt install certbot python3-certbot-nginx -y
```

**23. Obtain SSL Certificate**

**PENTING:** Domain Anda harus sudah pointing ke IP VPS!

```bash
# Ganti your-domain.com dengan domain Anda
certbot --nginx -d your-domain.com -d www.your-domain.com

# Ikuti prompt:
# - Enter email
# - Agree to terms
# - Choose redirect HTTP to HTTPS (recommended: Yes)
```

**24. Test Auto-Renewal**
```bash
certbot renew --dry-run
```

Certificate akan auto-renew sebelum expire.

**25. Access via HTTPS**
```
https://your-domain.com
```

---

## ✅ Post-Deployment Checklist

- [ ] Aplikasi berjalan: `pm2 status`
- [ ] Nginx berjalan: `systemctl status nginx`
- [ ] PostgreSQL berjalan: `systemctl status postgresql`
- [ ] Firewall aktif: `ufw status`
- [ ] SSL certificate installed (jika pakai domain)
- [ ] Bisa akses dari browser
- [ ] Test login/register user
- [ ] Backup database setup

---

## 🔧 Useful Commands

### PM2 Management
```bash
pm2 status              # Check status
pm2 logs jbs_app        # View logs
pm2 restart jbs_app     # Restart app
pm2 stop jbs_app        # Stop app
pm2 monit               # Monitor resources
```

### Nginx Commands
```bash
systemctl status nginx          # Check status
systemctl restart nginx         # Restart
nginx -t                        # Test config
tail -f /var/log/nginx/error.log  # View errors
```

### Database Management
```bash
# Backup database
sudo -u postgres pg_dump jbs_app > backup.sql

# Restore database
sudo -u postgres psql jbs_app < backup.sql
```

### Update Aplikasi
```bash
cd /var/www/jbs_app
git pull origin main      # Pull changes
npm install --production  # Install new deps
npm run db:push          # Update schema
npm run build            # Rebuild
pm2 restart jbs_app      # Restart
```

---

## 🐛 Troubleshooting

### Aplikasi tidak bisa diakses
```bash
# Check PM2
pm2 logs jbs_app

# Check nginx
systemctl status nginx
tail -f /var/log/nginx/error.log

# Check port
netstat -tlnp | grep :3000
```

### Database connection error
```bash
# Check PostgreSQL
systemctl status postgresql

# Test connection
psql -U jbs_user -d jbs_app -h localhost

# Check .env file
cat /var/www/jbs_app/.env
```

### Nginx 502 Bad Gateway
```bash
# Check if app is running
pm2 status

# Check logs
pm2 logs jbs_app

# Restart app
pm2 restart jbs_app
```

### Permission denied errors
```bash
# Fix permissions
chown -R www-data:www-data /var/www/jbs_app
chmod -R 755 /var/www/jbs_app
```

---

## 📞 Need Help?

1. Check PM2 logs: `pm2 logs jbs_app`
2. Check Nginx logs: `tail -f /var/log/nginx/error.log`
3. Check system logs: `journalctl -xe`

---

## 🎉 Congratulations!

Aplikasi JBS Anda sekarang sudah live di VPS Hostinger!

**Access di:**
- HTTP: http://your-domain.com
- HTTPS: https://your-domain.com (jika SSL sudah setup)

---

**Last updated:** December 2025
