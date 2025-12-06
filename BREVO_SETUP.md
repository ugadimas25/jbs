# Setup Brevo Email Integration

## Langkah-langkah Setup Brevo:

### 1. Dapatkan SMTP Credentials dari Brevo

1. Login ke dashboard Brevo: https://app.brevo.com
2. Klik nama Anda di pojok kanan atas
3. Pilih **"SMTP & API"**
4. Di tab **SMTP**, Anda akan melihat:
   - **SMTP Server**: `smtp-relay.brevo.com`
   - **Port**: `587`
   - **Login**: Email Anda yang terdaftar di Brevo
   - **Password**: Klik "Generate SMTP Key" untuk membuat password SMTP baru

### 2. Update File `.env`

Buka file `.env` di root project dan update nilai-nilai berikut:

```env
BREVO_SMTP_HOST=smtp-relay.brevo.com
BREVO_SMTP_PORT=587
BREVO_SMTP_USER=your-email@example.com  # Email yang Anda gunakan untuk daftar Brevo
BREVO_SMTP_PASS=xsmtpsib-xxxxxxxxxxxxx  # SMTP key yang Anda generate
BREVO_FROM_EMAIL=noreply@jakartabeautyschool.com  # Email pengirim (bisa custom)
BREVO_FROM_NAME=Jakarta Beauty School  # Nama pengirim
APP_URL=http://localhost:5000  # URL aplikasi (ubah saat production)
```

### 3. Verifikasi Domain Sender (Opsional tapi Direkomendasikan)

Untuk production, sebaiknya verifikasi domain Anda:

1. Di dashboard Brevo, pilih **"Senders, Domains & Dedicated IPs"**
2. Klik **"Add a Domain"**
3. Masukkan domain Anda (contoh: `jakartabeautyschool.com`)
4. Ikuti instruksi untuk menambahkan DNS records (SPF, DKIM, DMARC)
5. Tunggu verifikasi (biasanya beberapa menit hingga beberapa jam)

### 4. Test Email di Development

Setelah setup, jalankan aplikasi dan test:

```bash
npm run dev
```

1. Buka http://localhost:5000/auth
2. Klik tab **"Sign Up"**
3. Isi form dengan email valid
4. Klik **"Sign Up"**
5. Cek inbox email Anda untuk link verifikasi

### 5. Database Setup

Jika belum setup database, jalankan:

```bash
npm run db:push
```

Ini akan membuat tabel `users` dengan schema yang sudah diupdate.

## Troubleshooting

### Email tidak terkirim?

1. **Cek SMTP credentials**: Pastikan SMTP_USER dan SMTP_PASS benar
2. **Cek logs**: Lihat console untuk error messages
3. **Cek quota Brevo**: Free plan Brevo limit 300 email/hari
4. **Cek spam folder**: Email mungkin masuk ke spam

### Error "Authentication failed"?

- Pastikan Anda menggunakan SMTP key, bukan password akun Brevo
- Generate SMTP key baru di dashboard Brevo

### Email masuk spam?

- Verifikasi domain sender Anda di Brevo
- Tambahkan SPF dan DKIM records
- Gunakan domain yang sama dengan email pengirim

## API Endpoints yang Tersedia

### POST `/api/auth/signup`
Daftar akun baru dan kirim verification email

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "password123",
  "name": "John Doe"
}
```

### POST `/api/auth/login`
Login dengan email dan password

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "password123"
}
```

### GET `/api/auth/verify-email?token=xxx`
Verify email dengan token

### POST `/api/auth/logout`
Logout user

### GET `/api/auth/me`
Get current authenticated user

## Flow Autentikasi

1. User signup → Email verification dikirim
2. User klik link di email → Email terverifikasi
3. User login → Session dibuat
4. User bisa akses halaman yang memerlukan autentikasi

## Notes

- Token verifikasi expire dalam 24 jam
- Password di-hash menggunakan bcryptjs (10 rounds)
- Session disimpan di memory (gunakan Redis untuk production)
- Free plan Brevo: 300 email/hari, unlimited contacts
