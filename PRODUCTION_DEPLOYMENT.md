# Production Deployment Guide

## ✅ Mekanisme Login Sudah Production-Ready

Sistem login sekarang **siap untuk production** dengan fitur:

### 🔐 Session Management
- ✅ **PostgreSQL Session Store** - Session disimpan di database (tidak hilang saat restart)
- ✅ **Persistent Login** - User tetap login setelah server restart/deploy
- ✅ **Secure Cookies** - HTTPS only di production
- ✅ **7 Days Session** - User tetap login selama 7 hari
- ✅ **HttpOnly** - Cookies tidak bisa diakses JavaScript (XSS protection)
- ✅ **SameSite Strict** - CSRF protection

---

## 📋 Checklist Before Deployment

### 1. Environment Variables

Copy `.env.example` ke `.env` di server production dan isi:

```bash
# 1. Database - Pastikan PostgreSQL sudah running
DATABASE_URL=postgresql://jbs_user:password@host:5432/jbs_app

# 2. Session Secret - Generate unique secret!
# Run: node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
SESSION_SECRET=your-unique-128-character-random-string-here

# 3. Node Environment
NODE_ENV=production

# 4. Server Port
PORT=5001

# 5. Email Configuration (Brevo/Sendinblue)
BREVO_SMTP_HOST=smtp-relay.brevo.com
BREVO_SMTP_PORT=587
BREVO_SMTP_USER=your-user@smtp-brevo.com
BREVO_SMTP_PASS=your-api-key
BREVO_FROM_EMAIL=noreply@yourdomain.com
BREVO_FROM_NAME=Jakarta Beauty School

# 6. Application URL
APP_URL=https://yourdomain.com
```

### 2. Database Setup

```bash
# Run migrations to create tables
npm run db:push

# Tables yang akan dibuat:
# - users
# - bookings
# - teachers
# - notifications
# - reschedule_requests
# - session (for login persistence)
```

### 3. Build & Start

```bash
# Install dependencies
npm install

# Build production
npm run build

# Start production server
npm start
```

---

## 🚀 Deployment Options

### Option 1: VPS (Hostinger/DigitalOcean/AWS)

```bash
# 1. Clone repository
git clone <your-repo>
cd jbs_app

# 2. Setup .env
cp .env.example .env
nano .env  # Edit with your values

# 3. Install & Build
npm install
npm run build

# 4. Run with PM2 (recommended)
npm install -g pm2
pm2 start npm --name "jbs-app" -- start
pm2 save
pm2 startup
```

### Option 2: Using PM2 Ecosystem File

```bash
# Use existing ecosystem.config.cjs
pm2 start ecosystem.config.cjs
```

### Option 3: Docker (Optional)

```dockerfile
# Create Dockerfile
FROM node:20-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .
RUN npm run build
EXPOSE 5001
CMD ["npm", "start"]
```

---

## 🔒 Security Checklist

### ✅ Already Implemented
- [x] PostgreSQL session store (persistent login)
- [x] Secure session secret from environment
- [x] HTTPS-only cookies in production
- [x] HttpOnly cookies (XSS protection)
- [x] SameSite strict (CSRF protection)
- [x] Password hashing with bcrypt
- [x] Email verification
- [x] Input validation with Zod

### ⚠️ Additional Recommendations

1. **SSL/TLS Certificate**
   ```bash
   # Use Let's Encrypt with Certbot
   sudo certbot --nginx -d yourdomain.com
   ```

2. **Nginx Reverse Proxy**
   ```nginx
   server {
       listen 80;
       server_name yourdomain.com;
       return 301 https://$server_name$request_uri;
   }

   server {
       listen 443 ssl http2;
       server_name yourdomain.com;

       ssl_certificate /etc/letsencrypt/live/yourdomain.com/fullchain.pem;
       ssl_certificate_key /etc/letsencrypt/live/yourdomain.com/privkey.pem;

       location / {
           proxy_pass http://localhost:5001;
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

3. **Firewall**
   ```bash
   # Only allow HTTP/HTTPS/SSH
   sudo ufw allow 22/tcp
   sudo ufw allow 80/tcp
   sudo ufw allow 443/tcp
   sudo ufw enable
   ```

4. **Rate Limiting** (Add to server/index.ts)
   ```typescript
   import rateLimit from 'express-rate-limit';
   
   const limiter = rateLimit({
     windowMs: 15 * 60 * 1000, // 15 minutes
     max: 100 // limit each IP to 100 requests per windowMs
   });
   
   app.use('/api/', limiter);
   ```

---

## 📊 Monitoring

### Check Server Status
```bash
pm2 status
pm2 logs jbs-app
pm2 monit
```

### Database Monitoring
```bash
# Connect to PostgreSQL
psql -U jbs_user -d jbs_app

# Check session table
SELECT * FROM session LIMIT 10;

# Check user count
SELECT COUNT(*) FROM users;
```

---

## 🔄 Updating After Deployment

```bash
# Pull latest changes
git pull origin main

# Install dependencies if package.json changed
npm install

# Run migrations if schema changed
npm run db:push

# Rebuild
npm run build

# Restart with PM2
pm2 restart jbs-app
```

---

## ❓ FAQ

### Q: Apakah user akan logout setelah deploy?
**A: TIDAK.** Session disimpan di PostgreSQL, jadi user tetap login.

### Q: Apakah bisa pakai load balancer?
**A: YA.** Session di PostgreSQL bisa di-share antar multiple instances.

### Q: Berapa lama session bertahan?
**A: 7 hari.** Setelah itu user harus login ulang.

### Q: Apakah aman untuk production?
**A: YA.** Sudah implement:
- Session di database
- HTTPS-only cookies
- Password hashing
- CSRF protection
- XSS protection

---

## 📞 Support

Jika ada masalah saat deployment, check:
1. `.env` file sudah diisi dengan benar
2. PostgreSQL sudah running dan accessible
3. Port 5001 tidak digunakan aplikasi lain
4. PM2 logs: `pm2 logs jbs-app`
5. Database connection: `psql $DATABASE_URL`
