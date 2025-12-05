# 💄 JBS App - Beauty Salon Booking System

Full-stack web application untuk booking appointment di salon kecantikan, dibangun dengan React, Express, dan PostgreSQL.

## 🎨 Features

- 🔐 User Authentication (Register/Login)
- 📅 Booking System
- 📜 Booking History
- 💅 Modern UI with Radix UI components
- 📱 Responsive Design
- 🚀 PWA Support

## 🛠️ Tech Stack

**Frontend:**
- React 19
- TypeScript
- Wouter (routing)
- TanStack Query
- Radix UI
- Tailwind CSS
- Vite

**Backend:**
- Node.js
- Express
- TypeScript
- PostgreSQL
- Drizzle ORM
- Passport.js (authentication)

## 📋 Prerequisites

- Node.js 20.x or higher
- PostgreSQL 14+
- npm or yarn

## 🚀 Quick Start

### 1. Clone & Install

```bash
git clone <repository-url>
cd jbs_app
npm install
```

### 2. Setup Database

**Install PostgreSQL** (if not installed):
- Windows: Download from https://www.postgresql.org/download/windows/
- macOS: `brew install postgresql`
- Linux: `sudo apt install postgresql`

**Create Database:**
```bash
psql -U postgres
CREATE DATABASE jbs_app;
\q
```

### 3. Configure Environment

Create `.env` file (or copy from `.env.example`):

```env
DATABASE_URL=postgresql://postgres:password@localhost:5432/jbs_app
SESSION_SECRET=your-secret-key-change-in-production
NODE_ENV=development
PORT=3000
```

### 4. Initialize Database

```bash
npm run db:push
```

### 5. Run Development Server

```bash
npm run dev
```

Or run client and server separately:

```bash
# Terminal 1 - Client
npm run dev:client

# Terminal 2 - Server
npm run dev
```

### 6. Open Browser

Visit: http://localhost:5000

## 📦 Available Scripts

```bash
npm run dev          # Start development server
npm run dev:client   # Start client only (Vite dev server)
npm run build        # Build for production
npm start            # Start production server
npm run db:push      # Push database schema
npm run check        # TypeScript type check
```

## 📁 Project Structure

```
jbs_app/
├── client/              # Frontend React app
│   ├── public/         # Static assets
│   └── src/
│       ├── components/ # React components
│       ├── pages/      # Page components
│       ├── lib/        # Utilities & configs
│       └── hooks/      # Custom hooks
├── server/             # Backend Express server
│   ├── index.ts       # Main server file
│   ├── routes.ts      # API routes
│   └── vite.ts        # Vite dev server integration
├── shared/            # Shared code (schema, types)
│   └── schema.ts      # Database schema
└── migrations/        # Database migrations
```

## 🌐 Deployment

### Deploy to VPS (Hostinger)

Lihat panduan lengkap di:
- **[HOSTINGER_DEPLOYMENT.md](./HOSTINGER_DEPLOYMENT.md)** - Step-by-step guide untuk Hostinger VPS
- **[DEPLOYMENT.md](./DEPLOYMENT.md)** - General deployment guide

Quick deployment steps:
1. Setup VPS (Node.js, PostgreSQL, PM2, Nginx)
2. Upload project files
3. Configure environment
4. Build & start with PM2
5. Setup Nginx reverse proxy
6. Configure SSL with Let's Encrypt

### Helper Scripts

**For Windows:**
```powershell
# Prepare files for deployment
.\prepare-deploy.ps1

# Setup local database
.\setup-db.ps1
```

**For Linux/VPS:**
```bash
# First-time setup
bash setup.sh

# Update deployment
bash deploy.sh
```

## 🔧 Database Management

### Backup Database
```bash
pg_dump -U postgres jbs_app > backup.sql
```

### Restore Database
```bash
psql -U postgres jbs_app < backup.sql
```

### Reset Database
```bash
# Drop and recreate
psql -U postgres -c "DROP DATABASE jbs_app;"
psql -U postgres -c "CREATE DATABASE jbs_app;"
npm run db:push
```

## 🔐 Environment Variables

| Variable | Description | Example |
|----------|-------------|---------|
| `DATABASE_URL` | PostgreSQL connection string | `postgresql://user:pass@localhost:5432/dbname` |
| `SESSION_SECRET` | Secret for session encryption | Random string (32+ characters) |
| `NODE_ENV` | Environment mode | `development` or `production` |
| `PORT` | Server port | `3000` or `5000` |

## 📚 Documentation

- [Quick Start Guide](./QUICKSTART.md) - Getting started locally
- [Deployment Guide](./DEPLOYMENT.md) - General deployment guide
- [Hostinger VPS Guide](./HOSTINGER_DEPLOYMENT.md) - Specific to Hostinger

## 🐛 Troubleshooting

### Database Connection Issues

**Error: "database does not exist"**
```bash
# Create database
psql -U postgres -c "CREATE DATABASE jbs_app;"
```

**Error: "password authentication failed"**
- Check DATABASE_URL in `.env`
- Verify PostgreSQL password

### Port Already in Use

```bash
# Windows - Find process using port
netstat -ano | findstr :5000

# Kill process
taskkill /PID <PID> /F
```

### Build Errors

```bash
# Clean install
rm -rf node_modules package-lock.json
npm install
```

## 🤝 Contributing

1. Fork the repository
2. Create feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit changes (`git commit -m 'Add AmazingFeature'`)
4. Push to branch (`git push origin feature/AmazingFeature`)
5. Open Pull Request

## 📄 License

This project is licensed under the MIT License.

## 👥 Support

For issues and questions:
- Check [Troubleshooting](#-troubleshooting) section
- Review deployment guides
- Check application logs: `pm2 logs jbs_app` (production)

## 🎉 Acknowledgments

- Built with [Replit](https://replit.com)
- UI components from [Radix UI](https://www.radix-ui.com/)
- Styled with [Tailwind CSS](https://tailwindcss.com/)

---

**Made with ❤️ for JBS Beauty Salon**
