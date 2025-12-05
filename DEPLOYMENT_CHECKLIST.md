# ✅ JBS App Deployment Checklist

Use this checklist to ensure successful deployment.

## 📋 Pre-Deployment (Local)

### Local Development Setup
- [ ] PostgreSQL installed and running
- [ ] Database `jbs_app` created
- [ ] `.env` file configured correctly
- [ ] Dependencies installed (`npm install`)
- [ ] Database schema pushed (`npm run db:push`)
- [ ] Application runs locally (`npm run dev`)
- [ ] Application builds successfully (`npm run build`)
- [ ] No TypeScript errors (`npm run check`)

### Code Preparation
- [ ] All changes committed to Git
- [ ] `.gitignore` configured (node_modules, .env, dist)
- [ ] Environment variables documented in `.env.example`
- [ ] README.md updated with latest info

---

## 🌐 VPS Setup (First Time)

### Access & Initial Setup
- [ ] VPS purchased from Hostinger
- [ ] IP Address noted
- [ ] SSH credentials received
- [ ] Successful SSH login to VPS
- [ ] System updated (`apt update && apt upgrade`)

### Software Installation
- [ ] Node.js 20.x installed
- [ ] PostgreSQL installed and running
- [ ] PM2 installed globally
- [ ] Nginx installed and running
- [ ] Git installed (if using Git deployment)

### Security Setup
- [ ] UFW firewall enabled
- [ ] SSH port allowed (22)
- [ ] HTTP port allowed (80)
- [ ] HTTPS port allowed (443)
- [ ] PostgreSQL secured (password set)
- [ ] Root login considered to be disabled (optional but recommended)

---

## 🗄️ Database Setup (VPS)

### PostgreSQL Configuration
- [ ] Database `jbs_app` created
- [ ] Database user created with secure password
- [ ] User granted all privileges
- [ ] Schema privileges granted
- [ ] Connection tested locally on VPS

---

## 📦 Application Deployment

### File Upload
- [ ] Application directory created (`/var/www/jbs_app`)
- [ ] Files uploaded to VPS (Git clone or SFTP/SCP)
- [ ] Correct ownership set (`chown www-data:www-data`)
- [ ] Correct permissions set (`chmod 755`)

### Application Configuration
- [ ] `.env` file created on VPS
- [ ] `DATABASE_URL` configured correctly
- [ ] `SESSION_SECRET` generated and set (use `node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"`)
- [ ] `NODE_ENV=production` set
- [ ] `PORT=3000` set (or your preferred port)

### Build & Deploy
- [ ] Dependencies installed (`npm install --production`)
- [ ] Database schema pushed (`npm run db:push`)
- [ ] Application built (`npm run build`)
- [ ] Build files exist in `dist/` directory

---

## 🚀 Process Management (PM2)

### PM2 Setup
- [ ] Application started with PM2 (`pm2 start`)
- [ ] Application status checked (`pm2 status`)
- [ ] No errors in PM2 logs (`pm2 logs jbs_app`)
- [ ] PM2 configuration saved (`pm2 save`)
- [ ] PM2 startup configured (`pm2 startup`)
- [ ] Startup command executed (from `pm2 startup` output)

### PM2 Verification
- [ ] Application restarts automatically after PM2 restart
- [ ] Application accessible on `localhost:3000` (test with `curl`)

---

## 🔧 Nginx Configuration

### Nginx Setup
- [ ] Nginx config file created (`/etc/nginx/sites-available/jbs_app`)
- [ ] Server name configured (domain or IP)
- [ ] Proxy pass configured to `localhost:3000`
- [ ] WebSocket headers configured
- [ ] Config file linked to sites-enabled
- [ ] Nginx config tested (`nginx -t`)
- [ ] Nginx restarted (`systemctl restart nginx`)

### Nginx Verification
- [ ] No errors in Nginx error log
- [ ] Application accessible via HTTP (browser test)
- [ ] Static files loading correctly

---

## 🔒 SSL/HTTPS Setup (Optional but Recommended)

### Domain Setup
- [ ] Domain purchased (if not using IP only)
- [ ] A record pointing to VPS IP
- [ ] DNS propagated (test with `nslookup your-domain.com`)

### SSL Certificate
- [ ] Certbot installed
- [ ] SSL certificate obtained (`certbot --nginx`)
- [ ] HTTPS redirect configured
- [ ] Certificate auto-renewal tested (`certbot renew --dry-run`)
- [ ] Application accessible via HTTPS

---

## 🎯 Final Testing

### Functionality Tests
- [ ] Homepage loads correctly
- [ ] User registration works
- [ ] User login works
- [ ] Booking creation works
- [ ] Booking history displays
- [ ] All API endpoints functional
- [ ] Static assets (images, CSS) loading
- [ ] No console errors in browser

### Performance & Monitoring
- [ ] Application responsive
- [ ] No memory leaks (`pm2 monit`)
- [ ] Logs rotating properly
- [ ] Database connections stable

---

## 📊 Post-Deployment

### Monitoring Setup
- [ ] PM2 monitoring enabled
- [ ] Log rotation configured
- [ ] Error alerting setup (optional)
- [ ] Uptime monitoring (optional: UptimeRobot, etc.)

### Backup & Maintenance
- [ ] Database backup script created
- [ ] Backup schedule configured (cron job)
- [ ] Update procedure documented
- [ ] Rollback plan prepared

### Documentation
- [ ] Production URL documented
- [ ] Admin credentials stored securely
- [ ] Database credentials stored securely
- [ ] SSH access documented
- [ ] Team members notified

---

## 🐛 Troubleshooting Checklist

If something goes wrong, check:

### Application Issues
- [ ] PM2 status: `pm2 status`
- [ ] PM2 logs: `pm2 logs jbs_app`
- [ ] Application port: `netstat -tlnp | grep :3000`
- [ ] Environment variables: `cat /var/www/jbs_app/.env`

### Nginx Issues
- [ ] Nginx status: `systemctl status nginx`
- [ ] Nginx config: `nginx -t`
- [ ] Nginx error log: `tail -f /var/log/nginx/error.log`
- [ ] Nginx access log: `tail -f /var/log/nginx/access.log`

### Database Issues
- [ ] PostgreSQL status: `systemctl status postgresql`
- [ ] Database connection: `psql -U jbs_user -d jbs_app -h localhost`
- [ ] Database exists: `psql -U postgres -c "\l"`

### Network Issues
- [ ] Firewall status: `ufw status`
- [ ] Port accessibility: `telnet localhost 3000`
- [ ] DNS resolution: `nslookup your-domain.com`

---

## 📝 Common Commands Reference

### PM2
```bash
pm2 status              # Check status
pm2 logs jbs_app        # View logs
pm2 restart jbs_app     # Restart
pm2 stop jbs_app        # Stop
pm2 delete jbs_app      # Remove from PM2
```

### Nginx
```bash
nginx -t                        # Test config
systemctl restart nginx         # Restart
systemctl status nginx          # Status
tail -f /var/log/nginx/error.log  # Error log
```

### Database
```bash
# Backup
pg_dump -U jbs_user jbs_app > backup_$(date +%Y%m%d).sql

# Restore
psql -U jbs_user jbs_app < backup_20231205.sql
```

### System
```bash
# Check disk space
df -h

# Check memory
free -m

# Check running processes
top

# Check system logs
journalctl -xe
```

---

## 🎉 Success Criteria

Your deployment is successful when:

✅ Application accessible via browser (HTTP/HTTPS)  
✅ User can register and login  
✅ Bookings can be created and viewed  
✅ No errors in logs  
✅ PM2 shows status as "online"  
✅ Nginx serving requests without 502/504 errors  
✅ Database operations working  
✅ SSL certificate active (if configured)  
✅ Application restarts after server reboot  

---

## 📞 Need Help?

If stuck at any step:

1. **Check logs first:**
   - PM2: `pm2 logs jbs_app`
   - Nginx: `tail -f /var/log/nginx/error.log`
   - System: `journalctl -xe`

2. **Review documentation:**
   - [HOSTINGER_DEPLOYMENT.md](./HOSTINGER_DEPLOYMENT.md)
   - [DEPLOYMENT.md](./DEPLOYMENT.md)

3. **Common solutions:**
   - Restart services: `pm2 restart jbs_app && systemctl restart nginx`
   - Check permissions: `ls -la /var/www/jbs_app`
   - Verify environment: `cat /var/www/jbs_app/.env`

---

**Last updated:** December 2025  
**Version:** 1.0.0
