# ⚡ JBS App - Quick Reference Card

Quick commands and info untuk JBS App development & deployment.

---

## 🏠 Local Development

### Setup (One Time)
```powershell
# 1. Create database
psql -U postgres -c "CREATE DATABASE jbs_app;"

# 2. Install dependencies
npm install

# 3. Configure .env file
# Edit .env with your database credentials

# 4. Push schema
npm run db:push
```

### Development Commands
```powershell
# Run dev server (hot reload)
npm run dev

# Run client only
npm run dev:client

# Build for production
npm run build

# Start production build
npm start

# Type check
npm run check

# Update database schema
npm run db:push
```

### Access
- **Client:** http://localhost:5000
- **API:** http://localhost:3000

---

## 🌐 VPS Deployment (Quick)

### First Time Setup
```bash
# Install software
curl -fsSL https://deb.nodesource.com/setup_20.x | bash -
apt-get install -y nodejs postgresql nginx
npm install -g pm2

# Setup database
sudo -u postgres psql
CREATE DATABASE jbs_app;
CREATE USER jbs_user WITH PASSWORD 'PASSWORD';
GRANT ALL PRIVILEGES ON DATABASE jbs_app TO jbs_user;
\q

# Deploy app
cd /var/www/jbs_app
npm install --production
npm run db:push
npm run build
pm2 start npm --name "jbs_app" -- start
pm2 save
pm2 startup

# Setup Nginx (create config, then:)
nginx -t
systemctl restart nginx

# Setup firewall
ufw allow 22/tcp
ufw allow 80/tcp
ufw allow 443/tcp
ufw enable
```

### Update Deployment
```bash
cd /var/www/jbs_app
git pull origin main
npm install --production
npm run build
pm2 restart jbs_app
```

---

## 📋 PM2 Commands

```bash
pm2 status              # Check status
pm2 logs jbs_app        # View logs (Ctrl+C to exit)
pm2 logs jbs_app --lines 100  # Last 100 lines
pm2 restart jbs_app     # Restart app
pm2 reload jbs_app      # Zero-downtime reload
pm2 stop jbs_app        # Stop app
pm2 start jbs_app       # Start app
pm2 delete jbs_app      # Remove from PM2
pm2 monit               # Monitor CPU/Memory
pm2 save                # Save current config
```

---

## 🔧 Nginx Commands

```bash
nginx -t                # Test configuration
systemctl status nginx  # Check status
systemctl start nginx   # Start
systemctl stop nginx    # Stop
systemctl restart nginx # Restart
systemctl reload nginx  # Reload config (no downtime)

# View logs
tail -f /var/log/nginx/access.log
tail -f /var/log/nginx/error.log
```

---

## 🗄️ Database Commands

### PostgreSQL
```bash
# Connect to database
psql -U jbs_user -d jbs_app -h localhost

# List databases
psql -U postgres -c "\l"

# Backup
pg_dump -U jbs_user jbs_app > backup_$(date +%Y%m%d).sql

# Restore
psql -U jbs_user jbs_app < backup_20231205.sql
```

### In psql
```sql
\l              -- List databases
\c jbs_app      -- Connect to database
\dt             -- List tables
\d users        -- Describe table
\q              -- Quit
```

---

## 🔐 SSL Setup (Let's Encrypt)

```bash
# Install certbot
apt install certbot python3-certbot-nginx -y

# Get certificate
certbot --nginx -d yourdomain.com -d www.yourdomain.com

# Test renewal
certbot renew --dry-run

# Force renewal
certbot renew --force-renewal
```

---

## 🐛 Troubleshooting Quick Fixes

### App not starting
```bash
pm2 logs jbs_app        # Check logs
pm2 delete jbs_app      # Remove from PM2
pm2 start npm --name "jbs_app" -- start  # Restart
```

### Port in use
```bash
# Linux
lsof -i :3000
kill -9 <PID>

# Windows
netstat -ano | findstr :3000
taskkill /PID <PID> /F
```

### Database connection failed
```bash
systemctl status postgresql  # Check PostgreSQL running
cat /var/www/jbs_app/.env   # Verify DATABASE_URL
psql -U jbs_user -d jbs_app -h localhost  # Test connection
```

### Nginx 502 Error
```bash
pm2 status              # Check app is running
pm2 restart jbs_app     # Restart app
tail -f /var/log/nginx/error.log  # Check logs
```

### Permission errors
```bash
chown -R www-data:www-data /var/www/jbs_app
chmod -R 755 /var/www/jbs_app
```

---

## 📁 Important Paths

### VPS
- **App:** `/var/www/jbs_app`
- **Nginx config:** `/etc/nginx/sites-available/jbs_app`
- **Nginx enabled:** `/etc/nginx/sites-enabled/jbs_app`
- **Nginx logs:** `/var/log/nginx/`
- **SSL certs:** `/etc/letsencrypt/live/yourdomain.com/`

### Local
- **Project root:** `d:\b_outside\JBS\jbs_app\jbs_app`
- **Build output:** `dist/`
- **Client:** `client/src/`
- **Server:** `server/`

---

## 🔑 Environment Variables

```env
DATABASE_URL=postgresql://user:pass@host:5432/dbname
SESSION_SECRET=random-32-character-string
NODE_ENV=development|production
PORT=3000|5000
```

**Generate SESSION_SECRET:**
```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

---

## 📊 System Monitoring

```bash
# Disk space
df -h

# Memory usage
free -m

# CPU & processes
top
htop

# PM2 monitoring
pm2 monit

# Nginx status
systemctl status nginx

# PostgreSQL status
systemctl status postgresql
```

---

## 🔄 Common Workflows

### Local → Git → VPS
```bash
# Local (commit changes)
git add .
git commit -m "Update feature"
git push origin main

# VPS (pull & deploy)
cd /var/www/jbs_app
git pull origin main
npm install --production
npm run build
pm2 restart jbs_app
```

### Database Migration
```bash
# Local: test migration
npm run db:push

# VPS: apply migration
cd /var/www/jbs_app
npm run db:push
pm2 restart jbs_app
```

---

## 📖 Documentation Files

- **README.md** - Main documentation
- **QUICKSTART.md** - Local development setup
- **DEPLOYMENT.md** - General deployment guide
- **HOSTINGER_DEPLOYMENT.md** - Hostinger-specific guide
- **DEPLOYMENT_CHECKLIST.md** - Deployment checklist
- **DOC_INDEX.md** - Documentation index

---

## 🆘 Emergency Commands

### Stop everything
```bash
pm2 stop all
systemctl stop nginx
```

### Start everything
```bash
systemctl start nginx
pm2 start all
```

### Restart everything
```bash
systemctl restart nginx
systemctl restart postgresql
pm2 restart all
```

### Check all logs
```bash
pm2 logs
tail -f /var/log/nginx/error.log
journalctl -xe
```

---

## 📞 Get Help

1. **Check logs first!**
2. Review documentation
3. Search error messages
4. Check system status

---

**Keep this card handy for quick reference! 💡**

**Last Updated:** December 2025
