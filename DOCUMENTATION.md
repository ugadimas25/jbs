# 📚 Dokumentasi Lengkap - Jakarta Beauty School Web Application

## 📋 Daftar Isi

1. [Gambaran Umum](#1-gambaran-umum)
2. [Arsitektur Sistem](#2-arsitektur-sistem)
3. [Tech Stack](#3-tech-stack)
4. [Struktur Proyek](#4-struktur-proyek)
5. [Database Schema](#5-database-schema)
6. [Backend (Server)](#6-backend-server)
7. [Frontend (Client)](#7-frontend-client)
8. [API Endpoints](#8-api-endpoints)
9. [Autentikasi & Keamanan](#9-autentikasi--keamanan)
10. [Email System](#10-email-system)
11. [Konfigurasi & Environment](#11-konfigurasi--environment)
12. [Deployment](#12-deployment)
13. [Troubleshooting](#13-troubleshooting)
14. [Pengembangan Lanjutan](#14-pengembangan-lanjutan)
15. [Panduan Modifikasi Sistem (Planned Features)](#15-panduan-modifikasi-sistem-planned-features)
16. [Referensi Implementasi Lengkap](#16-referensi-implementasi-lengkap)

---

## 1. Gambaran Umum

### 1.1 Deskripsi Aplikasi

**Jakarta Beauty School (JBS) App** adalah aplikasi web full-stack untuk sistem booking kelas/appointment di sekolah kecantikan. Aplikasi ini memungkinkan pengguna untuk:

- 🔐 Mendaftar dan login dengan verifikasi email
- 📅 Memesan kelas kecantikan (makeup, nail art, eyelash)
- 📜 Melihat riwayat booking
- 🔄 Reschedule booking yang sudah ada
- 📱 Akses mobile-friendly dengan dukungan PWA

### 1.2 Target Pengguna

- **Calon Siswa**: Orang yang ingin belajar makeup, nail art, atau eyelash extension
- **Siswa Terdaftar**: Pengguna yang sudah memiliki akun untuk manage booking
- **Admin** (future): Untuk mengelola kelas dan siswa

### 1.3 Fitur Utama

| Fitur | Status | Deskripsi |
|-------|--------|-----------|
| User Registration | ✅ Aktif | Pendaftaran dengan email verification |
| User Login | ✅ Aktif | Session-based authentication |
| Email Verification | ✅ Aktif | Menggunakan Brevo SMTP |
| Class Booking | ✅ Aktif | 4-step booking wizard |
| Booking History | ✅ Aktif | View & manage bookings |
| Reschedule | ✅ Aktif | Ubah jadwal booking |
| PWA Support | ✅ Aktif | Installable di mobile |
| Responsive Design | ✅ Aktif | Mobile-first design |

---

## 2. Arsitektur Sistem

### 2.1 High-Level Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                         CLIENT (Browser)                         │
│  ┌─────────────────────────────────────────────────────────┐    │
│  │                    React Application                      │    │
│  │  • React 19 + TypeScript                                 │    │
│  │  • TanStack Query (data fetching)                        │    │
│  │  • Wouter (routing)                                       │    │
│  │  • Radix UI + Tailwind CSS                               │    │
│  └─────────────────────────────────────────────────────────┘    │
└─────────────────────────────────────────────────────────────────┘
                              │
                              │ HTTP/HTTPS
                              │ REST API
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                       SERVER (Node.js)                           │
│  ┌─────────────────────────────────────────────────────────┐    │
│  │                    Express.js Server                      │    │
│  │  • REST API Endpoints                                     │    │
│  │  • Session Management                                     │    │
│  │  • Static File Serving (production)                       │    │
│  │  • Vite Dev Server Integration (development)              │    │
│  └─────────────────────────────────────────────────────────┘    │
│                              │                                    │
│                              ▼                                    │
│  ┌─────────────────────────────────────────────────────────┐    │
│  │                    Data Layer                             │    │
│  │  • Drizzle ORM                                           │    │
│  │  • PostgreSQL Database                                    │    │
│  └─────────────────────────────────────────────────────────┘    │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                    External Services                             │
│  • Brevo SMTP (Email Service)                                   │
│  • PostgreSQL Database Server                                    │
└─────────────────────────────────────────────────────────────────┘
```

### 2.2 Request Flow

```
User Action → React Component → TanStack Query → 
→ Fetch API → Express Router → Controller Logic → 
→ Drizzle ORM → PostgreSQL → Response
```

### 2.3 Development vs Production

| Aspek | Development | Production |
|-------|-------------|------------|
| Frontend Serving | Vite Dev Server (HMR) | Express Static Files |
| Port | 5001 (configurable) | 3000 or custom |
| Database | Local PostgreSQL | Remote PostgreSQL |
| Email | Brevo SMTP | Brevo SMTP |
| Cookies | `secure: false` | `secure: true` |

---

## 3. Tech Stack

### 3.1 Frontend

| Technology | Version | Kegunaan |
|------------|---------|----------|
| React | 19.2.0 | UI Library |
| TypeScript | 5.6.3 | Type Safety |
| Vite | 7.1.9 | Build Tool & Dev Server |
| TanStack Query | 5.60.5 | Server State Management |
| Wouter | 3.3.5 | Client-side Routing |
| Tailwind CSS | 4.1.14 | Utility-first CSS |
| Radix UI | Various | Accessible UI Components |
| Framer Motion | 12.23.24 | Animations |
| React Hook Form | 7.66.0 | Form Management |
| Zod | 3.25.76 | Schema Validation |
| Lucide React | 0.545.0 | Icons |
| Recharts | 2.15.4 | Charts (future) |

### 3.2 Backend

| Technology | Version | Kegunaan |
|------------|---------|----------|
| Node.js | 20.x+ | Runtime |
| Express | 4.21.2 | Web Framework |
| TypeScript | 5.6.3 | Type Safety |
| Drizzle ORM | 0.39.3 | Database ORM |
| PostgreSQL | 14+ | Database |
| bcryptjs | 3.0.3 | Password Hashing |
| express-session | 1.18.2 | Session Management |
| nodemailer | 7.0.11 | Email Sending |

### 3.3 Development Tools

| Tool | Kegunaan |
|------|----------|
| tsx | TypeScript Execution |
| esbuild | Fast JavaScript Bundler |
| drizzle-kit | Database Migration Tools |
| ESLint | Code Linting |
| PostCSS | CSS Processing |

---

## 4. Struktur Proyek

```
jbs_app/
├── 📁 client/                    # Frontend React Application
│   ├── index.html                # HTML entry point
│   ├── 📁 public/                # Static public assets
│   │   ├── manifest.json         # PWA manifest
│   │   ├── sw.js                 # Service Worker
│   │   ├── logo.png              # Logo image
│   │   └── favicon.png           # Favicon
│   └── 📁 src/                   # Source code
│       ├── App.tsx               # Root component & routing
│       ├── main.tsx              # Entry point
│       ├── index.css             # Global styles
│       ├── 📁 components/        # Reusable components
│       │   ├── layout.tsx        # Main layout wrapper
│       │   └── 📁 ui/            # UI component library
│       │       ├── button.tsx
│       │       ├── card.tsx
│       │       ├── dialog.tsx
│       │       ├── form.tsx
│       │       ├── input.tsx
│       │       ├── toast.tsx
│       │       └── ... (50+ components)
│       ├── 📁 pages/             # Page components
│       │   ├── home.tsx          # Landing page
│       │   ├── auth.tsx          # Login/Signup
│       │   ├── booking.tsx       # Booking wizard
│       │   ├── history.tsx       # Booking history
│       │   ├── verify-email.tsx  # Email verification
│       │   └── not-found.tsx     # 404 page
│       ├── 📁 hooks/             # Custom React hooks
│       │   ├── use-mobile.tsx    # Mobile detection
│       │   └── use-toast.ts      # Toast notifications
│       └── 📁 lib/               # Utilities & configs
│           ├── auth-context.tsx  # Authentication context
│           ├── constants.ts      # App constants
│           ├── queryClient.ts    # TanStack Query config
│           └── utils.ts          # Helper functions
│
├── 📁 server/                    # Backend Express Server
│   ├── index.ts                  # Server entry point
│   ├── routes.ts                 # API route definitions
│   ├── storage.ts                # Data storage layer
│   ├── email.ts                  # Email service
│   ├── static.ts                 # Static file serving
│   └── vite.ts                   # Vite dev server integration
│
├── 📁 shared/                    # Shared code (frontend & backend)
│   └── schema.ts                 # Database schema & types
│
├── 📁 script/                    # Build scripts
│   └── build.ts                  # Production build script
│
├── 📁 attached_assets/           # Asset files
│   └── 📁 generated_images/      # Generated images
│
├── 📁 migrations/                # Database migrations (generated)
│
├── 📄 Configuration Files
│   ├── .env                      # Environment variables
│   ├── package.json              # Dependencies & scripts
│   ├── tsconfig.json             # TypeScript config
│   ├── vite.config.ts            # Vite config
│   ├── drizzle.config.ts         # Drizzle ORM config
│   ├── postcss.config.js         # PostCSS config
│   └── tailwind.config.ts        # Tailwind config (if exists)
│
└── 📄 Documentation & Scripts
    ├── README.md                 # Project readme
    ├── DOCUMENTATION.md          # This file
    ├── DEPLOYMENT.md             # Deployment guide
    ├── HOSTINGER_DEPLOYMENT.md   # Hostinger VPS guide
    ├── deploy.sh                 # Linux deploy script
    ├── setup.sh                  # Linux setup script
    └── prepare-deploy.ps1        # Windows deploy prep script
```

---

## 5. Database Schema

### 5.1 Users Table

```typescript
// shared/schema.ts

export const users = pgTable("users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  email: text("email").notNull().unique(),
  password: text("password").notNull(),
  name: text("name").notNull(),
  isVerified: boolean("is_verified").notNull().default(false),
  verificationToken: text("verification_token"),
  verificationTokenExpiry: timestamp("verification_token_expiry"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});
```

### 5.2 Field Descriptions

| Field | Type | Description |
|-------|------|-------------|
| `id` | VARCHAR (UUID) | Primary key, auto-generated UUID |
| `email` | TEXT | User email (unique) |
| `password` | TEXT | Bcrypt hashed password |
| `name` | TEXT | User's full name |
| `isVerified` | BOOLEAN | Email verification status |
| `verificationToken` | TEXT | Token for email verification |
| `verificationTokenExpiry` | TIMESTAMP | Token expiry time (24 hours) |
| `createdAt` | TIMESTAMP | Account creation time |
| `updatedAt` | TIMESTAMP | Last update time |

### 5.3 Validation Schemas

```typescript
// Insert user schema (for registration)
export const insertUserSchema = createInsertSchema(users).pick({
  email: true,
  password: true,
  name: true,
});

// Login schema
export const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
});
```

### 5.4 Database Commands

```bash
# Push schema ke database
npm run db:push

# Generate migrations
npx drizzle-kit generate

# Apply migrations
npx drizzle-kit migrate

# Open Drizzle Studio (DB GUI)
npx drizzle-kit studio
```

---

## 6. Backend (Server)

### 6.1 Server Entry Point

**File:** `server/index.ts`

```typescript
// Key configurations:
- Express app initialization
- HTTP server creation
- JSON body parsing
- Session middleware setup
- Request logging middleware
- Route registration
- Error handling middleware
- Static file serving (production) or Vite dev server (development)
```

#### Session Configuration

```typescript
app.use(
  session({
    secret: process.env.SESSION_SECRET || "your-secret-key",
    resave: false,
    saveUninitialized: false,
    cookie: {
      secure: process.env.NODE_ENV === "production",
      httpOnly: true,
      maxAge: 1000 * 60 * 60 * 24 * 7, // 7 days
    },
  })
);
```

### 6.2 Storage Layer

**File:** `server/storage.ts`

Interface untuk data persistence:

```typescript
export interface IStorage {
  getUser(id: string): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  createUser(user: InsertUser & { 
    verificationToken: string; 
    verificationTokenExpiry: Date 
  }): Promise<User>;
  verifyUser(token: string): Promise<User | undefined>;
  updateUser(id: string, data: Partial<User>): Promise<User | undefined>;
}
```

**Current Implementation:** `MemStorage` (in-memory storage)

> ⚠️ **Note:** Current implementation uses in-memory storage. Untuk production, implementasikan dengan PostgreSQL menggunakan Drizzle ORM.

### 6.3 Email Service

**File:** `server/email.ts`

```typescript
// Brevo SMTP Configuration
const transporter = nodemailer.createTransport({
  host: process.env.BREVO_SMTP_HOST || 'smtp-relay.brevo.com',
  port: parseInt(process.env.BREVO_SMTP_PORT || '587'),
  secure: false,
  auth: {
    user: process.env.BREVO_SMTP_USER,
    pass: process.env.BREVO_SMTP_PASS,
  },
});
```

**Functions:**

| Function | Description |
|----------|-------------|
| `sendEmail(options)` | Send email via Brevo SMTP |
| `generateVerificationEmail(name, url)` | Generate verification email HTML |

---

## 7. Frontend (Client)

### 7.1 Application Entry

**File:** `client/src/App.tsx`

```tsx
function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <Router />
        <Toaster />
      </AuthProvider>
    </QueryClientProvider>
  );
}
```

### 7.2 Routing Structure

| Route | Component | Description | Auth Required |
|-------|-----------|-------------|---------------|
| `/` | `Home` | Landing page | ❌ |
| `/auth` | `AuthPage` | Login/Signup | ❌ |
| `/booking` | `Booking` | Booking wizard | ✅ |
| `/history` | `History` | Booking history | ✅ |
| `/verify-email` | `VerifyEmailPage` | Email verification | ❌ |
| `*` | `NotFound` | 404 page | ❌ |

### 7.3 Pages Overview

#### 7.3.1 Home Page (`pages/home.tsx`)

- Hero section dengan video background
- Kelas yang tersedia (Makeup, Nail, Eyelash)
- Statistics section
- Why choose us section

#### 7.3.2 Auth Page (`pages/auth.tsx`)

- Tab-based UI (Signup/Login)
- Form validation dengan Zod
- TanStack Query mutations
- Toast notifications

#### 7.3.3 Booking Page (`pages/booking.tsx`)

**4-Step Wizard:**

| Step | Deskripsi | Data |
|------|-----------|------|
| 1 | Select Class | makeup, nail, eyelash |
| 2 | Choose Level | low, intermediate, high |
| 3 | Select Date & Time | date picker + time slots |
| 4 | Confirmation | Summary & payment |

#### 7.3.4 History Page (`pages/history.tsx`)

- List booking dengan status (upcoming/completed)
- Detail modal
- Reschedule functionality
- Certificate download (completed bookings)

### 7.4 Layout Component

**File:** `client/src/components/layout.tsx`

- Sticky header dengan navigation
- Mobile hamburger menu (Sheet component)
- Footer dengan contact info
- User authentication state display

### 7.5 Constants

**File:** `client/src/lib/constants.ts`

```typescript
export const CLASS_TYPES = [
  {
    id: "makeup",
    title: "Make up and Hair do",
    description: "Master the art of beauty makeup and professional hair styling.",
    icon: Palette,
    image: makeupImg
  },
  // ...
];

export const LEVELS = [
  { id: "low", label: "Beginner (Low)", price: "IDR 1.500.000", ... },
  { id: "intermediate", label: "Intermediate", price: "IDR 2.500.000", ... },
  { id: "high", label: "Advanced (High)", price: "IDR 4.000.000", ... }
];

export const SLOTS = [
  { id: "slot1", label: "12:30 - 15:00", time: "12:30 PM" },
  { id: "slot2", label: "13:30 - 16:00", time: "01:30 PM" }
];
```

### 7.6 Authentication Context

**File:** `client/src/lib/auth-context.tsx`

```typescript
interface AuthContextType {
  user: User | null;
  login: (email: string, name: string) => void;
  logout: () => void;
  isAuthenticated: boolean;
}
```

### 7.7 UI Component Library

Aplikasi menggunakan **50+ UI components** berbasis Radix UI:

| Category | Components |
|----------|------------|
| **Layout** | Card, Separator, Tabs, Accordion, Collapsible |
| **Forms** | Input, Button, Checkbox, Radio, Select, Switch, Textarea |
| **Feedback** | Toast, Alert, Dialog, Progress, Spinner |
| **Navigation** | Navigation Menu, Breadcrumb, Pagination |
| **Overlay** | Dialog, Drawer, Sheet, Popover, Tooltip |
| **Data Display** | Table, Avatar, Badge, Chart |

---

## 8. API Endpoints

### 8.1 Authentication Endpoints

#### POST `/api/auth/signup`

Register new user.

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "password123",
  "name": "John Doe"
}
```

**Success Response (201):**
```json
{
  "message": "Account created! Please check your email to verify your account.",
  "userId": "uuid-string"
}
```

**Error Responses:**
| Code | Message |
|------|---------|
| 400 | Email already registered |
| 400 | Validation error |

---

#### POST `/api/auth/login`

Login user.

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "password123"
}
```

**Success Response (200):**
```json
{
  "message": "Login successful",
  "user": {
    "id": "uuid-string",
    "email": "user@example.com",
    "name": "John Doe"
  }
}
```

**Error Responses:**
| Code | Message |
|------|---------|
| 401 | Invalid email or password |
| 403 | Please verify your email before logging in |

---

#### GET `/api/auth/verify-email`

Verify user email.

**Query Parameters:**
| Parameter | Type | Required |
|-----------|------|----------|
| token | string | Yes |

**Success Response (200):**
```json
{
  "message": "Email verified successfully! You can now login.",
  "user": {
    "id": "uuid-string",
    "email": "user@example.com",
    "name": "John Doe"
  }
}
```

**Error Responses:**
| Code | Message |
|------|---------|
| 400 | Invalid verification token |
| 400 | Invalid or expired verification token |

---

#### POST `/api/auth/logout`

Logout current user.

**Success Response (200):**
```json
{
  "message": "Logout successful"
}
```

---

#### GET `/api/auth/me`

Get current authenticated user.

**Success Response (200):**
```json
{
  "user": {
    "id": "uuid-string",
    "email": "user@example.com",
    "name": "John Doe",
    "isVerified": true
  }
}
```

**Error Responses:**
| Code | Message |
|------|---------|
| 401 | Not authenticated |
| 404 | User not found |

---

## 9. Autentikasi & Keamanan

### 9.1 Password Security

```typescript
// Password hashing (registration)
const hashedPassword = await bcrypt.hash(validatedData.password, 10);

// Password verification (login)
const isValidPassword = await bcrypt.compare(password, user.password);
```

**Bcrypt Configuration:**
- Salt rounds: 10
- Algorithm: bcrypt

### 9.2 Session Management

```typescript
// Session configuration
{
  secret: process.env.SESSION_SECRET,
  resave: false,
  saveUninitialized: false,
  cookie: {
    secure: true,        // HTTPS only (production)
    httpOnly: true,      // Prevent XSS
    maxAge: 604800000    // 7 days
  }
}
```

### 9.3 Email Verification Flow

```
1. User registers → 
2. Generate random token (32 bytes hex) →
3. Store token with 24-hour expiry →
4. Send verification email →
5. User clicks link →
6. Validate token & check expiry →
7. Mark user as verified →
8. Clear token
```

### 9.4 Security Headers (Recommended)

```typescript
// Add to production:
app.use(helmet());
app.use(cors({
  origin: process.env.APP_URL,
  credentials: true
}));
app.use(rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100
}));
```

---

## 10. Email System

### 10.1 Brevo SMTP Configuration

```env
BREVO_SMTP_HOST=smtp-relay.brevo.com
BREVO_SMTP_PORT=587
BREVO_SMTP_USER=your-smtp-login@smtp-brevo.com
BREVO_SMTP_PASS=xsmtpsib-xxxxx
BREVO_FROM_EMAIL=your-verified@email.com
BREVO_FROM_NAME=Jakarta Beauty School
```

### 10.2 Email Templates

#### Verification Email

```html
<!DOCTYPE html>
<html>
<head>
  <style>
    /* Inline styles for email compatibility */
    .header { 
      background: linear-gradient(135deg, #662506 0%, #993404 100%); 
      /* ... */
    }
    .button { 
      background: #ec7014; 
      /* ... */
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>Welcome to Jakarta Beauty School!</h1>
    </div>
    <div class="content">
      <p>Hi ${name},</p>
      <p>Thank you for signing up...</p>
      <a href="${verificationUrl}" class="button">Verify Email Address</a>
      <p>This link will expire in 24 hours.</p>
    </div>
  </div>
</body>
</html>
```

### 10.3 Setting Up Brevo

1. Daftar di [Brevo.com](https://www.brevo.com)
2. Verify domain/email pengirim
3. Dapatkan SMTP credentials dari dashboard
4. Update `.env` dengan credentials

---

## 11. Konfigurasi & Environment

### 11.1 Environment Variables

**File:** `.env`

```env
# Database Configuration
DATABASE_URL=postgresql://user:password@localhost:5432/jbs_app

# Session Secret (min 32 characters, random)
SESSION_SECRET=your-super-secret-random-string-here

# Node Environment
NODE_ENV=development  # atau "production"

# Server Port
PORT=5001

# Brevo SMTP Configuration
BREVO_SMTP_HOST=smtp-relay.brevo.com
BREVO_SMTP_PORT=587
BREVO_SMTP_USER=your-smtp-user@smtp-brevo.com
BREVO_SMTP_PASS=xsmtpsib-your-api-key
BREVO_FROM_EMAIL=your-verified@email.com
BREVO_FROM_NAME=Jakarta Beauty School

# Application URL
APP_URL=http://localhost:5001
```

### 11.2 TypeScript Configuration

**File:** `tsconfig.json`

```json
{
  "compilerOptions": {
    "target": "ES2022",
    "module": "ESNext",
    "moduleResolution": "bundler",
    "strict": true,
    "esModuleInterop": true,
    "skipLibCheck": true,
    "paths": {
      "@/*": ["./client/src/*"],
      "@shared/*": ["./shared/*"],
      "@assets/*": ["./attached_assets/*"]
    }
  }
}
```

### 11.3 Vite Configuration

**File:** `vite.config.ts`

```typescript
export default defineConfig({
  plugins: [react(), tailwindcss(), ...],
  resolve: {
    alias: {
      "@": path.resolve("client", "src"),
      "@shared": path.resolve("shared"),
      "@assets": path.resolve("attached_assets"),
    },
  },
  root: "client",
  build: {
    outDir: "dist/public",
  },
});
```

### 11.4 Drizzle Configuration

**File:** `drizzle.config.ts`

```typescript
export default defineConfig({
  out: "./migrations",
  schema: "./shared/schema.ts",
  dialect: "postgresql",
  dbCredentials: {
    url: process.env.DATABASE_URL,
  },
});
```

---

## 12. Deployment

### 12.1 NPM Scripts

```bash
# Development
npm run dev          # Start dev server (backend + Vite)
npm run dev:client   # Start Vite dev server only

# Production
npm run build        # Build for production
npm start            # Start production server

# Database
npm run db:push      # Push schema to database

# Type checking
npm run check        # TypeScript type check
```

### 12.2 Build Process

```bash
# 1. Install dependencies
npm install

# 2. Setup database
npm run db:push

# 3. Build production
npm run build

# 4. Start server
npm start
```

### 12.3 Production Deployment Checklist

- [ ] Set `NODE_ENV=production`
- [ ] Generate strong `SESSION_SECRET`
- [ ] Configure production `DATABASE_URL`
- [ ] Setup SSL/HTTPS
- [ ] Configure Nginx reverse proxy
- [ ] Setup PM2 for process management
- [ ] Configure proper CORS settings
- [ ] Enable security headers
- [ ] Setup log rotation
- [ ] Configure backup strategy

### 12.4 PM2 Configuration

**File:** `ecosystem.config.cjs`

```javascript
module.exports = {
  apps: [{
    name: "jbs_app",
    script: "./dist/index.cjs",
    instances: "max",
    exec_mode: "cluster",
    env: {
      NODE_ENV: "production",
      PORT: 3000
    }
  }]
};
```

### 12.5 Nginx Configuration Template

**File:** `nginx.conf.template`

```nginx
server {
    listen 80;
    server_name yourdomain.com;
    
    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

---

## 13. Troubleshooting

### 13.1 Common Issues

#### Database Connection Failed

```
Error: database "jbs_app" does not exist
```

**Solution:**
```bash
# Create database
psql -U postgres -c "CREATE DATABASE jbs_app;"

# Atau via psql console
psql -U postgres
CREATE DATABASE jbs_app;
\q
```

#### Port Already in Use

```
Error: listen EADDRINUSE: address already in use :::5001
```

**Solution (Windows):**
```powershell
# Find process
netstat -ano | findstr :5001

# Kill process
taskkill /PID <PID> /F
```

**Solution (Linux/Mac):**
```bash
# Find and kill
lsof -ti:5001 | xargs kill -9
```

#### Email Not Sending

**Checklist:**
1. Verify Brevo credentials di `.env`
2. Check sender email sudah verified di Brevo
3. Check spam folder
4. Lihat console logs untuk error details

#### Build Errors

```bash
# Clean install
rm -rf node_modules
rm package-lock.json
npm install

# Clear Vite cache
rm -rf node_modules/.vite
npm run dev
```

### 13.2 Logging

```typescript
// Server logs format
"HH:MM:SS [express] METHOD /path STATUS in XXXms :: {response}"

// Example
"10:30:45 [express] POST /api/auth/login 200 in 125ms :: {"message":"Login successful"}"
```

### 13.3 Debug Mode

```bash
# Enable debug logging
DEBUG=* npm run dev
```

---

## 14. Pengembangan Lanjutan

### 14.1 TODO / Planned Features

| Feature | Priority | Status |
|---------|----------|--------|
| PostgreSQL Storage Implementation | High | 🔄 Pending |
| Conditional UI (Before/After Login) | High | 📋 Planned |
| Bank Transfer Checkout System | High | 📋 Planned |
| Payment Proof Upload | High | 📋 Planned |
| Admin Dashboard | High | 📋 Planned |
| Notification Bell System | High | 📋 Planned |
| Class Schedule Calendar | Medium | 📋 Planned |
| Teacher Management | Medium | 📋 Planned |
| Student Management | Medium | 📋 Planned |
| Password Reset | Medium | 📋 Planned |
| Multi-language Support | Low | 📋 Planned |
| Analytics Dashboard | Low | 📋 Planned |

### 14.2 Implementing PostgreSQL Storage

```typescript
// server/db.ts
import { drizzle } from 'drizzle-orm/node-postgres';
import { Pool } from 'pg';
import * as schema from '@shared/schema';

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

export const db = drizzle(pool, { schema });

// server/storage.ts
export class PgStorage implements IStorage {
  async getUser(id: string): Promise<User | undefined> {
    const result = await db.select()
      .from(users)
      .where(eq(users.id, id))
      .limit(1);
    return result[0];
  }
  // ... implement other methods
}
```

---

## 15. Panduan Modifikasi Sistem (Planned Features)

Bagian ini menjelaskan rencana pengembangan fitur-fitur baru untuk aplikasi Jakarta Beauty School berdasarkan dokumen panduan modifikasi teknis.

---

### 15.1 Modifikasi Tampilan Sebelum dan Sesudah Sign-in

#### Deskripsi

Pada kondisi belum sign-in, beberapa elemen UI harus disembunyikan:
- Teks sapaan pengguna ("Hello, Test User")
- Menu "My Classes"

Setelah sign-in, elemen tersebut ditampilkan dengan informasi pengguna sebenarnya.

#### Implementasi Frontend

```tsx
// Di dalam components/layout.tsx
import { useAuth } from "@/lib/auth-context";

function Header() {
  const { user, isAuthenticated } = useAuth();

  return (
    <header className="flex items-center justify-between px-4 py-2 bg-white shadow">
      <nav className="flex items-center gap-4">
        {/* Menu publik */}
        {isAuthenticated && user ? (
          <>
            <span className="text-sm text-gray-700">Hello, {user.name}</span>
            <a href="/history" className="text-sm font-medium">My Classes</a>
          </>
        ) : (
          <a href="/auth" className="text-sm font-medium">Sign In</a>
        )}
      </nav>
    </header>
  );
}
```

---

### 15.2 Perbedaan Tombol "Our Signature Courses" 

#### Sebelum Login
- Tombol: **"View Details"**
- Fungsi: Menampilkan penjelasan kelas tanpa opsi booking

#### Sesudah Login
- Tombol: **"View Details & Checkout"**
- Fungsi: Melihat detail kursus dan melanjutkan ke proses checkout

#### Implementasi

```tsx
import { useAuth } from "@/lib/auth-context";

function CoursesSection() {
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();

  const handleViewDetails = (courseId: string) => {
    navigate(`/courses/${courseId}`);
  };
  
  const handleCheckout = (courseId: string) => {
    navigate(`/booking?course=${courseId}`);
  };

  return (
    <div className="courses-grid">
      {CLASS_TYPES.map(course => (
        <div key={course.id} className="course-card">
          <h3>{course.title}</h3>
          <p>{course.description}</p>
          {isAuthenticated ? (
            <button onClick={() => handleCheckout(course.id)} className="btn-primary">
              View Details & Checkout
            </button>
          ) : (
            <button onClick={() => handleViewDetails(course.id)} className="btn-primary">
              View Details
            </button>
          )}
        </div>
      ))}
    </div>
  );
}
```

---

### 15.3 Database Schema Baru

#### Tabel Bookings (Pemesanan Kelas)

```typescript
// shared/schema.ts
export const bookings = pgTable("bookings", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id),
  classType: text("class_type").notNull(),        // jenis kursus (makeup/nail/eyelash)
  level: text("level").notNull(),                 // level kelas (beginner/intermediate/high)
  status: text("status").notNull().default('pending_payment'), 
  paymentMethod: text("payment_method"),          // bank yg dipilih (misal "BCA")
  paymentDue: timestamp("payment_due"),           // batas waktu pembayaran
  paymentProof: text("payment_proof"),            // path bukti pembayaran
  preferredSlot1: text("preferred_slot1"),        // pilihan jadwal 1
  preferredSlot2: text("preferred_slot2"),        // pilihan jadwal 2
  scheduledDate1: date("scheduled_date1"),        // jadwal final sesi 1
  scheduledDate2: date("scheduled_date2"),        // jadwal final sesi 2
  teacherId: varchar("teacher_id"),               // pengajar yang ditugaskan
  createdAt: timestamp("created_at").defaultNow()
});
```

#### Tabel Teachers (Pengajar)

```typescript
export const teachers = pgTable("teachers", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: text("name").notNull(),
  email: text("email"),
  phone: text("phone"),
  specialization: text("specialization"),         // makeup/nail/eyelash
  isActive: boolean("is_active").notNull().default(true),
  createdAt: timestamp("created_at").defaultNow()
});
```

#### Tabel Notifications (Notifikasi)

```typescript
export const notifications = pgTable("notifications", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id),
  message: text("message").notNull(),
  link: text("link"),
  isRead: boolean("is_read").notNull().default(false),
  createdAt: timestamp("created_at").defaultNow()
});
```

#### Update Tabel Users

```typescript
// Tambahan kolom di users
role: text("role").notNull().default("user"),     // user/admin
phone: text("phone"),                              // nomor HP
```

#### Booking Status Flow

| Status | Deskripsi |
|--------|-----------|
| `pending_payment` | Menunggu pembayaran |
| `waiting_approval` | Bukti sudah upload, menunggu admin approve |
| `payment_rejected` | Pembayaran ditolak |
| `paid` | Pembayaran diterima |
| `waiting_schedule` | Menunggu pilihan jadwal user |
| `scheduled` | Jadwal sudah dikonfirmasi |
| `completed` | Kelas selesai |

---

### 15.4 Mekanisme Checkout (Transfer Bank)

#### Flow Checkout

```
1. User pilih kursus & level
2. User pilih metode pembayaran (bank: BCA/Mandiri/BNI)
3. Tampilkan informasi transfer & countdown 1 jam
4. User klik "OK" → booking dibuat dengan status pending_payment
5. Notifikasi bell muncul dengan link upload bukti
6. User upload bukti → status berubah ke waiting_approval
7. Admin approve → status berubah ke paid
```

#### Implementasi Frontend (Payment Step)

```tsx
import { useEffect, useState } from "react";
import { useMutation } from "@tanstack/react-query";

function PaymentStep({ selectedClass, selectedLevel }) {
  const [bank, setBank] = useState<string>("");
  const [timeLeft, setTimeLeft] = useState(3600); // 1 jam

  // Countdown timer
  useEffect(() => {
    if (!timeLeft) return;
    const timer = setInterval(() => {
      setTimeLeft(prev => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(timer);
  }, [timeLeft]);

  const formatTime = (sec: number) => {
    const m = Math.floor(sec / 60);
    const s = sec % 60;
    return `${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
  };

  const createBookingMutation = useMutation({
    mutationFn: async () => {
      const res = await fetch("/api/bookings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          classType: selectedClass.id,
          level: selectedLevel.id,
          paymentMethod: bank
        })
      });
      if (!res.ok) throw new Error("Failed to create booking");
      return res.json();
    },
    onSuccess: (data) => {
      toast.success("Booking created! Please complete payment within 1 hour.");
    }
  });

  return (
    <div className="payment-step">
      <h2>Payment</h2>
      
      {/* Pilihan bank transfer */}
      <div className="bank-options">
        {["BCA", "Mandiri", "BNI"].map(bankName => (
          <label key={bankName} className="bank-option">
            <input 
              type="radio" 
              name="bank" 
              value={bankName} 
              onChange={() => setBank(bankName)} 
            />
            {bankName}
          </label>
        ))}
      </div>
      
      {bank && (
        <div className="payment-info">
          <p>Transfer ke rekening {bank}:</p>
          <p><strong>{bank} 1234567890</strong> a.n. Jakarta Beauty School</p>
          <p className="text-red-500">
            Selesaikan dalam <strong>{formatTime(timeLeft)}</strong>
          </p>
        </div>
      )}
      
      <button onClick={() => createBookingMutation.mutate()} className="btn-primary">
        OK
      </button>
    </div>
  );
}
```

#### Implementasi Backend (Create Booking)

```typescript
app.post("/api/bookings", authMiddleware, async (req, res) => {
  try {
    const userId = req.session.userId;
    const { classType, level, paymentMethod } = req.body;
    
    const paymentDue = new Date(Date.now() + 60 * 60 * 1000); // 1 jam
    
    const booking = await storage.createBooking({
      userId,
      classType,
      level,
      paymentMethod,
      status: "pending_payment",
      paymentDue
    });
    
    // Buat notifikasi untuk user
    await storage.createNotification({
      userId,
      message: "Complete your payment within 1 hour by uploading the proof.",
      link: `/upload-proof?bookingId=${booking.id}`
    });
    
    return res.status(201).json({ bookingId: booking.id });
  } catch (error: any) {
    return res.status(400).json({ error: error.message });
  }
});
```

---

### 15.5 Form Upload Bukti Pembayaran

#### Implementasi Frontend

```tsx
function UploadProofPage() {
  const [file, setFile] = useState<File | null>(null);
  const bookingId = new URLSearchParams(window.location.search).get("bookingId");

  const uploadMutation = useMutation({
    mutationFn: async () => {
      const formData = new FormData();
      formData.append("proof", file!);
      const res = await fetch(`/api/bookings/${bookingId}/upload-proof`, {
        method: "POST",
        body: formData
      });
      if (!res.ok) throw new Error("Upload failed");
      return res.json();
    },
    onSuccess: () => {
      toast.success("Upload successful! Please wait for admin approval.");
    }
  });

  return (
    <div className="upload-proof-form">
      <h2>Upload Payment Proof</h2>
      <form onSubmit={(e) => { e.preventDefault(); uploadMutation.mutate(); }}>
        <input 
          type="file" 
          accept="image/*,application/pdf" 
          onChange={(e) => setFile(e.target.files?.[0] || null)} 
        />
        <button type="submit" disabled={!file || uploadMutation.isPending}>
          Submit
        </button>
      </form>
    </div>
  );
}
```

#### Implementasi Backend

```typescript
import multer from "multer";
const upload = multer({ dest: "attached_assets/uploads/" });

app.post("/api/bookings/:id/upload-proof", authMiddleware, upload.single("proof"), async (req, res) => {
  try {
    const bookingId = req.params.id;
    const userId = req.session.userId;
    
    const booking = await storage.getBooking(bookingId);
    if (!booking || booking.userId !== userId) {
      return res.status(403).json({ error: "Unauthorized" });
    }
    
    await storage.updateBooking(bookingId, {
      paymentProof: req.file?.path,
      status: "waiting_approval"
    });
    
    return res.json({ message: "Proof uploaded, waiting for approval" });
  } catch (err) {
    return res.status(500).json({ error: "Upload failed" });
  }
});
```

---

### 15.6 Notification Bell System

#### Implementasi Frontend

```tsx
import { Bell } from "lucide-react";
import { useQuery } from "@tanstack/react-query";

function NotificationsBell() {
  const { data: notifications = [] } = useQuery({
    queryKey: ['notifications'],
    queryFn: async () => {
      const res = await fetch('/api/notifications');
      return res.ok ? res.json() : [];
    },
    refetchInterval: 30000 // polling tiap 30 detik
  });

  const unreadCount = notifications.filter((n: any) => !n.isRead).length;

  return (
    <div className="relative">
      <button className="bell-button">
        <Bell />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
            {unreadCount}
          </span>
        )}
      </button>
      
      {/* Dropdown notifikasi */}
      <div className="notification-dropdown">
        {notifications.length === 0 ? (
          <p>No notifications</p>
        ) : (
          <ul>
            {notifications.map((note: any) => (
              <li key={note.id} className={note.isRead ? '' : 'font-bold'}>
                <a href={note.link || '#'}>{note.message}</a>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
```

---

### 15.7 Admin Dashboard

#### Struktur Dashboard

```
/admin
├── Tab: Approval (Pembayaran & Jadwal)
├── Tab: Jadwal Kelas (Calendar View)
├── Tab: Pengajar
└── Tab: Murid
```

#### Keamanan Akses Admin

```typescript
// Middleware adminOnly
function adminOnly(req: Request, res: Response, next: NextFunction) {
  const userId = req.session.userId;
  if (!userId) {
    return res.status(401).json({ error: "Not authenticated" });
  }
  
  const user = await storage.getUser(userId);
  if (!user || user.role !== 'admin') {
    return res.status(403).json({ error: "Forbidden" });
  }
  
  next();
}
```

#### Implementasi Frontend (AdminDashboard)

```tsx
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";

export default function AdminDashboard() {
  return (
    <div className="admin-dashboard p-4">
      <h1 className="text-xl font-bold mb-4">Admin Dashboard</h1>
      <Tabs defaultValue="approval">
        <TabsList className="mb-4">
          <TabsTrigger value="approval">Approval</TabsTrigger>
          <TabsTrigger value="schedule">Jadwal Kelas</TabsTrigger>
          <TabsTrigger value="teachers">Pengajar</TabsTrigger>
          <TabsTrigger value="students">Murid</TabsTrigger>
        </TabsList>
        <TabsContent value="approval">
          <ApprovalTab />
        </TabsContent>
        <TabsContent value="schedule">
          <ScheduleTab />
        </TabsContent>
        <TabsContent value="teachers">
          <TeachersTab />
        </TabsContent>
        <TabsContent value="students">
          <StudentsTab />
        </TabsContent>
      </Tabs>
    </div>
  );
}
```

---

### 15.8 Tab Approval (Persetujuan Pembayaran & Jadwal)

#### Fitur

| Filter | Deskripsi |
|--------|-----------|
| Pembayaran | Daftar bukti transfer menunggu approval |
| Schedule | Daftar permintaan jadwal menunggu approval |

#### Implementasi

```tsx
function ApprovalTab() {
  const [filter, setFilter] = useState<"payments"|"schedule">("payments");

  const { data: paymentApprovals = [] } = useQuery({
    queryKey: ['pendingPayments'],
    queryFn: () => fetch('/api/admin/approvals?type=payment').then(r => r.json()),
    enabled: filter === "payments"
  });

  const { data: scheduleApprovals = [] } = useQuery({
    queryKey: ['pendingSchedules'],
    queryFn: () => fetch('/api/admin/approvals?type=schedule').then(r => r.json()),
    enabled: filter === "schedule"
  });

  const approvePayment = useMutation({
    mutationFn: (bookingId: string) => 
      fetch(`/api/admin/payments/${bookingId}/approve`, { method: "POST" }),
    onSuccess: () => queryClient.invalidateQueries(['pendingPayments'])
  });

  return (
    <div>
      <div className="mb-4 space-x-2">
        <button onClick={() => setFilter("payments")} 
          className={filter==="payments" ? "btn-active" : "btn"}>
          Pembayaran
        </button>
        <button onClick={() => setFilter("schedule")} 
          className={filter==="schedule" ? "btn-active" : "btn"}>
          Schedule
        </button>
      </div>

      {filter === "payments" ? (
        <table className="w-full">
          <thead>
            <tr><th>Nama</th><th>Kelas</th><th>Bukti</th><th>Aksi</th></tr>
          </thead>
          <tbody>
            {paymentApprovals.map((item: any) => (
              <tr key={item.bookingId}>
                <td>{item.studentName}</td>
                <td>{item.classType} - {item.level}</td>
                <td>
                  <a href={`/uploads/${item.proofFilename}`} target="_blank">
                    Lihat Bukti
                  </a>
                </td>
                <td>
                  <button onClick={() => approvePayment.mutate(item.bookingId)}>
                    Approve
                  </button>
                  <button>Reject</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      ) : (
        /* Schedule approvals table */
      )}
    </div>
  );
}
```

#### Backend Endpoints

```typescript
// GET /api/admin/approvals?type=payment
// GET /api/admin/approvals?type=schedule
// POST /api/admin/payments/:id/approve
// POST /api/admin/payments/:id/reject
// POST /api/admin/schedules/:id/approve
// POST /api/admin/schedules/:id/reject
```

---

### 15.9 Pemilihan Jadwal oleh Peserta

#### Slot Waktu Tersedia

| Hari | Slot Pagi | Slot Siang |
|------|-----------|------------|
| Senin | 09:30-11:30 | 13:30-15:30 |
| Rabu | 09:30-11:30 | 13:30-15:30 |
| Jumat | 09:30-11:30 | 13:30-15:30 |
| Minggu | 09:30-11:30 | 13:30-15:30 |

#### Warna Indikator Slot

| Warna | Status |
|-------|--------|
| 🟢 Hijau | Slot tersedia |
| 🔴 Pink/Merah | Slot penuh (disabled) |

#### Implementasi Frontend

```tsx
function ScheduleSelectPage() {
  const bookingId = new URLSearchParams(window.location.search).get("bookingId");
  const [selectedSlots, setSelectedSlots] = useState<string[]>([]);

  const { data: slots = [] } = useQuery({
    queryKey: ['slotAvailability'],
    queryFn: () => fetch('/api/schedule/availability').then(r => r.json())
  });

  const toggleSlot = (slotId: string) => {
    setSelectedSlots(prev => {
      if (prev.includes(slotId)) return prev.filter(id => id !== slotId);
      if (prev.length < 2) return [...prev, slotId];
      return prev; // max 2 slots
    });
  };

  const submitMutation = useMutation({
    mutationFn: () => fetch(`/api/bookings/${bookingId}/schedule-preferences`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ slot1: selectedSlots[0], slot2: selectedSlots[1] })
    }).then(r => r.json()),
    onSuccess: () => {
      alert("Schedule submitted! Waiting for admin confirmation.");
    }
  });

  return (
    <div className="schedule-select">
      <h2>Pilih 2 Jadwal Kelas</h2>
      <div className="slots-grid">
        {slots.map((slot: any) => (
          <button
            key={slot.id}
            disabled={slot.isFull || (selectedSlots.length >= 2 && !selectedSlots.includes(slot.id))}
            onClick={() => toggleSlot(slot.id)}
            className={`
              ${slot.isFull ? 'bg-pink-200 cursor-not-allowed' : ''}
              ${selectedSlots.includes(slot.id) ? 'bg-green-500 text-white' : 'bg-green-100'}
            `}
          >
            {slot.label}
          </button>
        ))}
      </div>
      <button 
        onClick={() => submitMutation.mutate()} 
        disabled={selectedSlots.length !== 2}
      >
        Submit
      </button>
    </div>
  );
}
```

---

### 15.10 Tab Jadwal Kelas (Calendar View)

#### Warna Kalender

| Warna | Status |
|-------|--------|
| 🔴 Merah | Semua slot penuh |
| 🟢 Hijau | Ada kelas, belum penuh |
| ⚫ Abu-abu | Tidak ada jadwal kelas |

#### Fitur

- Klik tanggal → Modal detail (murid & pengajar)
- Navigasi bulan sebelumnya/berikutnya
- View per bulan

---

### 15.11 Tab Murid

#### Kolom Data

| Kolom | Deskripsi |
|-------|-----------|
| Nama | Nama lengkap murid |
| Email | Email murid |
| No HP | Nomor handphone |
| Status | Aktif / Belum Bayar / Menunggu Approval |

#### Status Definisi

| Status | Kondisi |
|--------|---------|
| **Belum Bayar** | `pending_payment` atau `payment_rejected` |
| **Menunggu Approval** | `waiting_approval` |
| **Aktif** | `paid`, `waiting_schedule`, atau `scheduled` |

---

### 15.12 Tab Pengajar

#### Fitur

- Daftar pengajar
- Tambah/Edit data pengajar
- Informasi: Nama, Spesialisasi, Kontak

---

### 15.13 API Endpoints Baru (Planned)

#### Bookings

| Method | Endpoint | Deskripsi |
|--------|----------|-----------|
| POST | `/api/bookings` | Buat booking baru |
| GET | `/api/bookings/:id` | Get booking detail |
| POST | `/api/bookings/:id/upload-proof` | Upload bukti pembayaran |
| POST | `/api/bookings/:id/schedule-preferences` | Submit pilihan jadwal |

#### Notifications

| Method | Endpoint | Deskripsi |
|--------|----------|-----------|
| GET | `/api/notifications` | Get user notifications |
| POST | `/api/notifications/:id/read` | Mark as read |

#### Admin

| Method | Endpoint | Deskripsi |
|--------|----------|-----------|
| GET | `/api/admin/approvals` | Get pending approvals |
| POST | `/api/admin/payments/:id/approve` | Approve payment |
| POST | `/api/admin/payments/:id/reject` | Reject payment |
| POST | `/api/admin/schedules/:id/approve` | Approve schedule |
| POST | `/api/admin/schedules/:id/reject` | Reject schedule |
| GET | `/api/admin/schedule-events` | Get calendar events |
| GET | `/api/admin/students` | Get all students |
| GET | `/api/admin/teachers` | Get all teachers |
| POST | `/api/admin/teachers` | Create teacher |
| PUT | `/api/admin/teachers/:id` | Update teacher |

#### Schedule

| Method | Endpoint | Deskripsi |
|--------|----------|-----------|
| GET | `/api/schedule/availability` | Get slot availability |

---

### 15.14 Flow Diagram Lengkap

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                            USER FLOW                                         │
└─────────────────────────────────────────────────────────────────────────────┘

1. REGISTRASI & VERIFIKASI
   ┌─────────┐    ┌──────────┐    ┌───────────┐    ┌─────────┐
   │ Sign Up │───▶│ Email    │───▶│ Klik Link │───▶│ Account │
   │ Form    │    │ Terkirim │    │ Verifikasi│    │ Aktif   │
   └─────────┘    └──────────┘    └───────────┘    └─────────┘

2. BOOKING & PAYMENT
   ┌─────────┐    ┌──────────┐    ┌───────────┐    ┌─────────┐
   │ Pilih   │───▶│ Checkout │───▶│ Timer 1   │───▶│ Upload  │
   │ Kelas   │    │ Bank     │    │ Jam       │    │ Bukti   │
   └─────────┘    └──────────┘    └───────────┘    └─────────┘
                                                        │
                                                        ▼
   ┌─────────┐    ┌──────────┐    ┌───────────┐    ┌─────────┐
   │ Kelas   │◀───│ Jadwal   │◀───│ Pilih 2   │◀───│ Admin   │
   │ Aktif   │    │ Approved │    │ Slot      │    │ Approve │
   └─────────┘    └──────────┘    └───────────┘    └─────────┘

┌─────────────────────────────────────────────────────────────────────────────┐
│                            ADMIN FLOW                                        │
└─────────────────────────────────────────────────────────────────────────────┘

1. APPROVAL PEMBAYARAN
   ┌─────────────┐    ┌─────────────┐    ┌─────────────┐
   │ Lihat Bukti │───▶│ Approve/    │───▶│ Notifikasi  │
   │ Transfer    │    │ Reject      │    │ ke User     │
   └─────────────┘    └─────────────┘    └─────────────┘

2. APPROVAL JADWAL
   ┌─────────────┐    ┌─────────────┐    ┌─────────────┐
   │ Lihat Slot  │───▶│ Approve/    │───▶│ Update      │
   │ Pilihan     │    │ Reject      │    │ Kalender    │
   └─────────────┘    └─────────────┘    └─────────────┘
```

### 14.3 Adding New API Endpoints

```typescript
// server/routes.ts
app.post("/api/bookings", authMiddleware, async (req, res) => {
  try {
    const booking = await storage.createBooking({
      userId: req.session.userId,
      ...req.body
    });
    res.status(201).json(booking);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});
```

### 14.4 Adding New Pages

```tsx
// 1. Create page component
// client/src/pages/new-page.tsx
export default function NewPage() {
  return <div>New Page Content</div>;
}

// 2. Add route in App.tsx
<Route path="/new-page">
  <Layout>
    <NewPage />
  </Layout>
</Route>
```

### 14.5 Code Style Guidelines

- Use TypeScript strict mode
- Follow React hooks best practices
- Use Zod for all input validation
- Implement error boundaries
- Write meaningful commit messages
- Document complex functions

---

## 16. Referensi Implementasi Lengkap

### 16.1 Contoh Middleware Auth

```typescript
// server/middleware.ts
import { Request, Response, NextFunction } from "express";

export function authMiddleware(req: Request, res: Response, next: NextFunction) {
  if (!req.session?.userId) {
    return res.status(401).json({ error: "Not authenticated" });
  }
  next();
}

export async function adminOnly(req: Request, res: Response, next: NextFunction) {
  if (!req.session?.userId) {
    return res.status(401).json({ error: "Not authenticated" });
  }
  
  const user = await storage.getUser(req.session.userId);
  if (!user || user.role !== 'admin') {
    return res.status(403).json({ error: "Forbidden - Admin access required" });
  }
  
  next();
}
```

### 16.2 Contoh Storage Methods Baru

```typescript
// server/storage.ts

export interface IStorage {
  // Existing methods
  getUser(id: string): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  createUser(user: InsertUser & { 
    verificationToken: string; 
    verificationTokenExpiry: Date 
  }): Promise<User>;
  verifyUser(token: string): Promise<User | undefined>;
  
  // New booking methods
  createBooking(booking: InsertBooking): Promise<Booking>;
  getBooking(id: string): Promise<Booking | undefined>;
  getBookingsByUserId(userId: string): Promise<Booking[]>;
  getBookingsByStatus(status: string): Promise<Booking[]>;
  getBookingsInRange(start: Date, end: Date): Promise<Booking[]>;
  updateBooking(id: string, data: Partial<Booking>): Promise<Booking | undefined>;
  getLatestBooking(userId: string): Promise<Booking | undefined>;
  
  // Notification methods
  createNotification(notification: InsertNotification): Promise<Notification>;
  getNotificationsByUserId(userId: string): Promise<Notification[]>;
  markNotificationAsRead(id: string): Promise<void>;
  
  // Teacher methods
  createTeacher(teacher: InsertTeacher): Promise<Teacher>;
  getTeachers(): Promise<Teacher[]>;
  updateTeacher(id: string, data: Partial<Teacher>): Promise<Teacher | undefined>;
  
  // Admin methods
  getPendingPayments(): Promise<BookingWithUser[]>;
  getPendingSchedules(): Promise<BookingWithUser[]>;
  getAllStudents(): Promise<StudentWithStatus[]>;
}
```

### 16.3 Contoh Form dengan React Hook Form + Zod

```tsx
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";

const uploadProofSchema = z.object({
  file: z.instanceof(File).refine(
    (file) => file.size <= 5 * 1024 * 1024, 
    "File size must be less than 5MB"
  ),
  notes: z.string().optional()
});

type UploadProofForm = z.infer<typeof uploadProofSchema>;

function UploadProofFormComponent() {
  const form = useForm<UploadProofForm>({
    resolver: zodResolver(uploadProofSchema)
  });

  const onSubmit = async (data: UploadProofForm) => {
    const formData = new FormData();
    formData.append("proof", data.file);
    if (data.notes) formData.append("notes", data.notes);
    
    // Submit logic
  };

  return (
    <form onSubmit={form.handleSubmit(onSubmit)}>
      {/* Form fields */}
    </form>
  );
}
```

---

## 📞 Support & Contact

- **Documentation Issues:** Check this file first
- **Bug Reports:** Create GitHub issue
- **General Questions:** Contact development team
- **Technical Reference:** Lihat [panduan-modifikasi-jbs.md](attached_assets/panduan-modifikasi-jbs.md)

---

## 📝 Version History

| Version | Date | Changes |
|---------|------|---------|
| 1.0.0 | 2025-01-06 | Initial documentation |
| 1.1.0 | 2025-01-06 | Added planned features documentation (Sections 15-16) |

---

## 📎 Lampiran

### A. File Referensi Penting

| File | Deskripsi |
|------|-----------|
| [DOCUMENTATION.md](DOCUMENTATION.md) | Dokumentasi utama (file ini) |
| [README.md](README.md) | Quick start guide |
| [panduan-modifikasi-jbs.md](attached_assets/panduan-modifikasi-jbs.md) | Panduan teknis modifikasi lengkap |
| [DEPLOYMENT.md](DEPLOYMENT.md) | General deployment guide |
| [HOSTINGER_DEPLOYMENT.md](HOSTINGER_DEPLOYMENT.md) | Hostinger VPS deployment |

### B. Environment Variables Lengkap (Planned)

```env
# Database Configuration
DATABASE_URL=postgresql://user:password@localhost:5432/jbs_app

# Session Secret
SESSION_SECRET=your-super-secret-random-string-here

# Node Environment
NODE_ENV=development

# Server Port
PORT=5001

# Brevo SMTP Configuration
BREVO_SMTP_HOST=smtp-relay.brevo.com
BREVO_SMTP_PORT=587
BREVO_SMTP_USER=your-smtp-user@smtp-brevo.com
BREVO_SMTP_PASS=xsmtpsib-your-api-key
BREVO_FROM_EMAIL=your-verified@email.com
BREVO_FROM_NAME=Jakarta Beauty School

# Application URL
APP_URL=http://localhost:5001

# Admin Configuration (Planned)
ADMIN_EMAIL=admin@jakartabeautyschool.com

# File Upload (Planned)
UPLOAD_MAX_SIZE=5242880
UPLOAD_ALLOWED_TYPES=image/jpeg,image/png,application/pdf
```

---

**© 2025 Jakarta Beauty School. All Rights Reserved.**
