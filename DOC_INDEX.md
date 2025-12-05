# 📚 JBS App - Complete Documentation Index

Selamat datang di dokumentasi lengkap JBS App (Beauty Salon Booking System). Pilih panduan yang sesuai dengan kebutuhan Anda:

---

## 🚀 Getting Started

### Untuk Development Local (Windows)
👉 **[QUICKSTART.md](./QUICKSTART.md)**
- Setup PostgreSQL
- Install dependencies
- Configure environment
- Run aplikasi di local
- Troubleshooting local development

**Waktu setup:** ~15-30 menit

---

## 📖 Main Documentation

### General Information
👉 **[README.md](./README.md)**
- Project overview
- Tech stack
- Features
- Project structure
- Available scripts
- Contributing guidelines

---

## 🌐 Deployment Guides

### 1. General Deployment (Semua VPS)
👉 **[DEPLOYMENT.md](./DEPLOYMENT.md)**
- Comprehensive deployment guide
- Works for any VPS/Cloud provider
- Detailed step-by-step instructions
- Configuration examples
- Monitoring & maintenance
- Security best practices

**Best for:** General understanding, any VPS provider

---

### 2. Hostinger VPS Specific
👉 **[HOSTINGER_DEPLOYMENT.md](./HOSTINGER_DEPLOYMENT.md)**
- Step-by-step untuk Hostinger VPS
- Specific commands untuk Hostinger
- Troubleshooting Hostinger-specific issues
- Optimized untuk Hostinger environment

**Best for:** Deployment ke Hostinger VPS

**Waktu deployment:** ~1-2 jam (first time)

---

### 3. Deployment Checklist
👉 **[DEPLOYMENT_CHECKLIST.md](./DEPLOYMENT_CHECKLIST.md)**
- Complete checklist untuk deployment
- Pre-deployment preparation
- Step-by-step verification
- Post-deployment testing
- Troubleshooting guide

**Best for:** Ensure tidak ada yang terlewat

---

## 🛠️ Configuration Files

### Environment Configuration
- **`.env.example`** - Template untuk environment variables
- **`.env`** - Your actual environment file (not in Git)

### Deployment Scripts

**Windows (PowerShell):**
- **`setup-db.ps1`** - Setup database PostgreSQL di Windows
- **`prepare-deploy.ps1`** - Prepare files untuk upload ke VPS

**Linux/VPS (Bash):**
- **`setup.sh`** - First-time setup di VPS
- **`deploy.sh`** - Update/redeploy aplikasi

### Server Configuration
- **`ecosystem.config.cjs`** - PM2 configuration
- **`nginx.conf.template`** - Nginx configuration template

---

## 📋 Quick Navigation

### I want to...

**...run the app locally for development**
1. Read [QUICKSTART.md](./QUICKSTART.md)
2. Setup PostgreSQL
3. Run `npm install`
4. Run `npm run db:push`
5. Run `npm run dev`

**...deploy to VPS for the first time**
1. Read [HOSTINGER_DEPLOYMENT.md](./HOSTINGER_DEPLOYMENT.md) or [DEPLOYMENT.md](./DEPLOYMENT.md)
2. Follow [DEPLOYMENT_CHECKLIST.md](./DEPLOYMENT_CHECKLIST.md)
3. Setup VPS dengan required software
4. Upload files & configure
5. Start dengan PM2 & Nginx

**...update existing deployment**
1. SSH ke VPS
2. `cd /var/www/jbs_app`
3. `git pull` (or upload new files)
4. `npm install --production`
5. `npm run build`
6. `pm2 restart jbs_app`

**...troubleshoot issues**
1. Check logs: `pm2 logs jbs_app`
2. Check Nginx: `tail -f /var/log/nginx/error.log`
3. Review [DEPLOYMENT_CHECKLIST.md](./DEPLOYMENT_CHECKLIST.md) troubleshooting section
4. Check [DEPLOYMENT.md](./DEPLOYMENT.md) common issues

**...backup database**
```bash
# VPS
pg_dump -U jbs_user jbs_app > backup_$(date +%Y%m%d).sql

# Local Windows
psql -U postgres -c "\copy (SELECT * FROM users) TO 'backup.csv' CSV HEADER"
```

**...restore database**
```bash
psql -U jbs_user jbs_app < backup_20231205.sql
```

---

## 🎯 Recommended Reading Order

### First Time Setup (Local Development)
1. [README.md](./README.md) - Understand the project
2. [QUICKSTART.md](./QUICKSTART.md) - Get it running locally
3. Test & develop

### First Time Deployment (VPS)
1. [README.md](./README.md) - Understand the project
2. [DEPLOYMENT_CHECKLIST.md](./DEPLOYMENT_CHECKLIST.md) - Know what you need
3. [HOSTINGER_DEPLOYMENT.md](./HOSTINGER_DEPLOYMENT.md) - Follow step-by-step
4. Test deployment

### Maintenance & Updates
1. [DEPLOYMENT.md](./DEPLOYMENT.md) - Management commands
2. [DEPLOYMENT_CHECKLIST.md](./DEPLOYMENT_CHECKLIST.md) - Verify everything works

---

## 📞 Support & Resources

### Documentation Files
- `README.md` - Main project documentation
- `QUICKSTART.md` - Quick start guide for local development
- `DEPLOYMENT.md` - Complete deployment guide
- `HOSTINGER_DEPLOYMENT.md` - Hostinger-specific deployment
- `DEPLOYMENT_CHECKLIST.md` - Deployment checklist
- `DOC_INDEX.md` - This file

### Configuration Templates
- `.env.example` - Environment variables template
- `nginx.conf.template` - Nginx configuration template
- `ecosystem.config.cjs` - PM2 configuration

### Helper Scripts
- `setup-db.ps1` - Windows database setup
- `prepare-deploy.ps1` - Windows deployment preparation
- `setup.sh` - Linux first-time setup
- `deploy.sh` - Linux deployment/update

---

## 🔍 Quick Search

**Local Development Issues:**
→ [QUICKSTART.md](./QUICKSTART.md) - Troubleshooting section

**Deployment Issues:**
→ [DEPLOYMENT.md](./DEPLOYMENT.md) - Troubleshooting section  
→ [DEPLOYMENT_CHECKLIST.md](./DEPLOYMENT_CHECKLIST.md) - Troubleshooting checklist

**Configuration Questions:**
→ [README.md](./README.md) - Environment variables section  
→ `.env.example` - All available variables

**Update/Maintenance:**
→ [DEPLOYMENT.md](./DEPLOYMENT.md) - Maintenance section  
→ `deploy.sh` - Automated update script

---

## ✅ Status Check

### Local Development Ready?
- [ ] PostgreSQL installed
- [ ] Dependencies installed (`npm install`)
- [ ] Database created and schema pushed
- [ ] Application runs (`npm run dev`)
- [ ] ✅ Read [QUICKSTART.md](./QUICKSTART.md)

### Deployment Ready?
- [ ] VPS access obtained
- [ ] Required software list noted
- [ ] `.env.example` reviewed
- [ ] ✅ Read [DEPLOYMENT_CHECKLIST.md](./DEPLOYMENT_CHECKLIST.md)
- [ ] ✅ Read [HOSTINGER_DEPLOYMENT.md](./HOSTINGER_DEPLOYMENT.md)

---

## 🎉 You're All Set!

Semua dokumentasi sudah tersedia untuk membantu Anda dari development hingga production deployment.

**Happy Coding & Deploying! 🚀**

---

**Project:** JBS App (Beauty Salon Booking System)  
**Version:** 1.0.0  
**Last Updated:** December 2025
