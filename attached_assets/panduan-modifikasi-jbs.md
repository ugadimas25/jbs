# Panduan Teknis: Modifikasi Web App Jakarta Beauty School

Panduan ini menjelaskan langkah-langkah modifikasi aplikasi web Jakarta Beauty School (JBS) sesuai dokumentasi sistem yang ada. Setiap fitur yang ditambahkan atau diubah akan dijelaskan secara teknis, mencakup perubahan di frontend (React + TypeScript) maupun backend (Express + Drizzle ORM). Contoh potongan kode diberikan untuk memperjelas implementasi. Pastikan melakukan perubahan sesuai struktur proyek JBS yang sudah ada.

## 1. Tampilan Sebelum dan Sesudah Sign-in

Pada kondisi belum sign-in, beberapa elemen UI harus disembunyikan. Khususnya, teks sapaan pengguna ("Hello, Test User") dan menu "My Classes" tidak boleh muncul sebelum pengguna login. Setelah sign-in (autentikasi berhasil), barulah elemen tersebut ditampilkan dengan informasi pengguna sebenarnya.

Implementasi Frontend:

Gunakan Authentication Context global untuk mengecek status login. Proyek JBS sudah memiliki AuthContext yang menyediakan user dan isAuthenticated[1]. Kita dapat mengakses context ini di komponen layout atau header.

Ubah komponen header/navigation (misal di components/layout.tsx yang mengandung header) agar conditional rendering berdasarkan isAuthenticated. Ketika isAuthenticated === false, jangan render teks sapaan maupun link dashboard pribadi pengguna. Ketika true, tampilkan sapaan "Hello, {NamaUser}" dan menu "My Classes" (menu ini mengarah ke halaman histori kelas pengguna).

Contoh modifikasi di JSX (React + TypeScript):

```tsx

// Di dalam components/layout.tsx (pseudo-code)
import { useAuth } from "@/lib/auth-context";  // asumsi hook context disediakan

function Header() {
  const { user, isAuthenticated } = useAuth();

  return (
    <header className="flex items-center justify-between px-4 py-2 bg-white shadow">
      <nav className="flex items-center gap-4">
        {/* ... menu publik ... */}
        {isAuthenticated && user ? (
          <>
            <span className="text-sm text-gray-700">Hello, {user.name}</span>
            <a href="/history" className="text-sm font-medium">My Classes</a>
          </>
        ) : (
          // Jika belum login, bisa tampilkan tombol Login/Register atau tidak sama sekali
          <a href="/auth" className="text-sm font-medium">Sign In</a>
        )}
      </nav>
    </header>
  );
}

```

Dalam potongan kode di atas, elemen sapaan dan link My Classes hanya dirender jika isAuthenticated true. Saat belum login, yang ditampilkan bisa berupa tautan ke halaman sign-in/signup atau bahkan tidak ada sama sekali tergantung desain yang diinginkan. Setelah perubahan ini, "Hello, Test User" dan "My Classes" tidak akan muncul sebelum pengguna login, sesuai spesifikasi.

## 2. Mekanisme Sign-up dan Email Verifikasi

Fitur sign-up (pendaftaran pengguna) harus menggunakan verifikasi email melalui layanan Brevo SMTP sesuai konfigurasi .env. Alur yang diharapkan:

Registrasi: Pengguna mengisi form sign-up (nama, email, password, dll). Setelah form disubmit, backend membuat akun baru dengan status belum terverifikasi.

Kirim Email Verifikasi: Server menghasilkan token verifikasi unik dan mengirim email berisi tautan verifikasi ke alamat email pengguna. Pengiriman email dilakukan via SMTP Brevo menggunakan kredensial yang sudah disetel di .env[2].

User Klik Link: Pengguna membuka email dan klik link verifikasi yang diberikan. Link tersebut mengarah ke endpoint front-end kita (misalnya http://.../verify-email?token=...).

Aktivasi Akun: Frontend akan memanggil API verifikasi ke server dengan token tersebut. Jika token valid dan belum kedaluwarsa, server menandai akun sebagai terverifikasi (isVerified = true), sehingga akun aktif dan bisa login.

Konfigurasi .env untuk Brevo SMTP:

Pastikan file .env berisi konfigurasi SMTP Brevo yang benar. Contoh variabel environment yang diperlukan[3]:

```tsx

BREVO_SMTP_HOST=smtp-relay.brevo.com
BREVO_SMTP_PORT=587
BREVO_SMTP_USER=your-smtp-user@smtp-brevo.com
BREVO_SMTP_PASS=xsmtpsib-your-api-key
BREVO_FROM_EMAIL=admin@jakartabeautyschool.com
BREVO_FROM_NAME=Jakarta Beauty School
APP_URL=http://localhost:5001    # Base URL aplikasi, digunakan untuk link verifikasi

```

Variabel-variabel di atas digunakan oleh modul email di server untuk mengirim pesan verifikasi.

Implementasi Backend (Sign-up):

Pada server Express, terdapat route POST /api/auth/signup untuk registrasi[4]. Kita perlu memastikan logika berikut terjadi di route ini:

Validasi Input: Validasi data pendaftaran (gunakan Zod schema yang sudah didefinisikan, misal insertUserSchema). Pastikan email belum terdaftar; jika sudah, return error 400.

Hash Password: Gunakan bcrypt untuk meng-hash password sebelum disimpan[5].

Generate Token: Buat token verifikasi unik (bisa pakai crypto.randomBytes atau UUID) dan tentukan expiry 24 jam dari sekarang.

Simpan User: Simpan user baru ke database lewat Drizzle ORM (misal method storage.createUser). Field isVerified default false, simpan verificationToken dan verificationTokenExpiry di kolom yang tersedia[6][7].

Kirim Email: Gunakan Nodemailer + SMTP Brevo untuk mengirim email. Template email verifikasi sudah tersedia (lihat server/email.ts fungsi generateVerificationEmail)[8]. Isi email berisi tautan: <APP_URL>/verify-email?token=<token>. Kirim ke alamat email user[2].

Response: Berikan respons JSON sukses. Contoh, API saat sukses mengirim pesan seperti: "Account created! Please check your email to verify your account."[9].

Contoh pseudocode Express untuk signup:

```tsx

// server/routes.ts
import crypto from "crypto";
import { storage } from "./storage";
import { sendEmail, generateVerificationEmail } from "./email";

app.post("/api/auth/signup", async (req, res) => {
  try {
    // Validasi input (misal dengan Zod)
    const { name, email, password } = req.body; 
    // (Validasi unik email dan strength password juga dilakukan)

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Generate token verifikasi dan expiry 24 jam
    const token = crypto.randomBytes(32).toString("hex");
    const expiry = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 jam

    // Simpan user baru ke DB (isVerified default false)
    const newUser = await storage.createUser({
      name,
      email,
      password: hashedPassword,
      isVerified: false,
      verificationToken: token,
      verificationTokenExpiry: expiry
    });

    // Siapkan link verifikasi
    const verifyUrl = `${process.env.APP_URL}/verify-email?token=${token}`;
    // Kirim email verifikasi via Brevo
    await sendEmail({
      to: email,
      subject: "Verify Your Jakarta Beauty School Account",
      html: generateVerificationEmail(name, verifyUrl)
    });

    return res.status(201).json({
      message: "Account created! Please check your email to verify your account.",
      userId: newUser.id
    });
  } catch (err: any) {
    return res.status(400).json({ error: err.message });
  }
});

```

Pada kode di atas, setelah pendaftaran berhasil, email verifikasi dikirim. Credensial Brevo digunakan oleh sendEmail() sesuai konfigurasi SMTP[2]. Link berisi token unik yang disimpan di DB.

Implementasi Frontend (Sign-up & Verifikasi Email):

Halaman Sign-up (komponen AuthPage dengan tab Signup/Login) perlu mengirim data ke endpoint /api/auth/signup. Gunakan TanStack Query atau fetch biasa untuk melakukan POST. Misalnya, dengan React Hook Form, ambil data input lalu:

```tsx

const signupMutation = useMutation({
  mutationFn: async (formData: { name: string; email: string; password: string }) => {
    const res = await fetch("/api/auth/signup", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(formData)
    });
    if (!res.ok) {
      throw new Error("Sign-up failed");
    }
    return res.json();
  },
  onSuccess: (data) => {
    toast.success(data.message); // "Account created! Please check your email..."
  },
  onError: (error: any) => {
    toast.error(error.message || "Sign-up error");
  }
});

// Di JSX form signup:
<form onSubmit={handleSubmit(values => signupMutation.mutate(values))}>
  {/* input nama, email, password */}
  <button type="submit" disabled={signupMutation.isLoading}>Sign Up</button>
</form>

```

Setelah sukses, kita tampilkan notifikasi (misal toast) bahwa akun berhasil dibuat dan meminta verifikasi email. Tidak langsung login sebelum verifikasi selesai.

Halaman Verifikasi Email: Buat route /verify-email di frontend (misal komponen VerifyEmailPage). Halaman ini akan diakses ketika pengguna klik link di email verifikasi. Implementasi komponen:

Ambil token dari URL (window.location.search atau menggunakan hook router untuk query params).

Panggil endpoint GET /api/auth/verify-email?token=<token>.

Tampilkan status ke pengguna: sukses atau gagal.

Contoh implementasi VerifyEmailPage:

```tsx

import { useLocation } from "wouter";  // jika pakai wouter
import { useEffect, useState } from "react";

export default function VerifyEmailPage() {
  const [status, setStatus] = useState<"loading"|"success"|"error">("loading");
  const [message, setMessage] = useState("");
  const location = useLocation();  // mendapatkan current location dengan query
  const token = new URLSearchParams(location.search).get("token");

  useEffect(() => {
    if (!token) return;
    fetch(`/api/auth/verify-email?token=${token}`)
      .then(res => res.json())
      .then(data => {
        if (data.user) {
          setStatus("success");
          setMessage("Email verified successfully! You can now sign in.");
        } else {
          setStatus("error");
          setMessage(data.message || "Verification failed.");
        }
      })
      .catch(err => {
        setStatus("error");
        setMessage("Verification failed.");
      });
  }, [token]);

  if (status === "loading") {
    return <p>Verifying your email...</p>;
  }
  return (
    <div className="verification-result">
      {status === "success" ? (
        <div className="success-msg">
          <h2>Verification Success</h2>
          <p>{message}</p>
          <a href="/auth">Go to Login</a>
        </div>
      ) : (
        <div className="error-msg">
          <h2>Verification Failed</h2>
          <p>{message}</p>
          <a href="/auth">Back to Login</a>
        </div>
      )}
    </div>
  );
}

```

Kode di atas akan menghubungi API verifikasi. Sekarang, pastikan endpoint backend /api/auth/verify-email sudah mengaktifkan akun:

Implementasi Backend (Verifikasi Email):

Route GET /api/auth/verify-email harus menangani token verifikasi:

Cari user dengan verificationToken = token yang diberikan, dan pastikan token belum expired (verificationTokenExpiry > now).

Jika valid, update user: set isVerified = true, hapus/clear token dan expiry (atau set null).

(Opsional: Log in user otomatis dengan menyetup sesi di sini, tapi bisa juga tidak. Dalam contoh ini, kita hanya verifikasi lalu user disuruh login manual.)

Return response sukses, misalnya JSON dengan pesan dan mungkin data user[10][11].

Contoh pseudocode:

```tsx

app.get("/api/auth/verify-email", async (req, res) => {
  const token = req.query.token;
  if (!token) {
    return res.status(400).json({ message: "Verification token is required" });
  }
  try {
    const user = await storage.verifyUser(token); 
    // storage.verifyUser seharusnya: 
    //  - menemukan user dgn token cocok & belum expired
    //  - kalau ada, update user (isVerified=true, hapus token) dan return user
    if (!user) {
      return res.status(400).json({ message: "Invalid or expired verification token" });
    }
    // (Opsional) req.session.userId = user.id; // jika mau langsung login
    return res.json({
      message: "Email verified successfully! You can now login.",
      user: {
        id: user.id, email: user.email, name: user.name, isVerified: true
      }
    });
  } catch (err) {
    return res.status(500).json({ message: "Server error" });
  }
});

```

Dengan ini, mekanisme sign-up dengan email verifikasi berjalan: pengguna mendaftar, mendapat email, dan harus klik link untuk mengaktifkan akun sebelum bisa login (kalau mencoba login sebelum verifikasi, API login mengembalikan error 403 "Please verify your email"[12]).

## 3. Perbedaan Tampilan "Our Signature Courses" (Sebelum vs Sesudah Login)

Pada halaman homepage atau section Our Signature Courses, perlu dibedakan tampilan untuk pengguna yang belum login dan yang sudah login:

Sebelum login: Setiap kartu kursus hanya menampilkan tombol "View Details". Tombol ini cukup menampilkan penjelasan kelas (detail kursus) tanpa opsi pendaftaran/booking. Intinya, pengunjung yang belum sign-in dapat melihat informasi kursus tetapi tidak bisa langsung melakukan pemesanan.

Sesudah login: Pada kartu kursus, tampilkan tombol "View Details & Checkout". Ini mengindikasikan pengguna bisa melihat detail kursus dan melanjutkan ke proses checkout/booking kelas tersebut.

Penggunaan dua label berbeda ini mencegah user tidak login langsung mencoba checkout. Implementasinya memanfaatkan status auth serupa dengan poin #1.

Implementasi Frontend (Homepage Courses Section):

Diasumsikan di homepage (pages/home.tsx) terdapat daftar kursus (Makeup, Nail Art, Eyelash) yang ditampilkan mungkin berdasarkan konstanta CLASS_TYPES[13]. Tiap kursus memiliki informasi nama, deskripsi, ikon, gambar, dsb. Kita akan menambahkan conditional rendering pada tombol aksi:

Import useAuth untuk mendapatkan isAuthenticated.

Untuk setiap item kursus, render tombol berbeda tergantung status login:

Jika belum login: render tombol "View Details" yang ketika diklik menampilkan detail kursus. Detail bisa berupa navigasi ke halaman khusus detail kursus atau membuka modal dengan deskripsi lengkap. Pastikan tidak langsung mengarahkan ke proses checkout. Jika pengguna mencoba booking, alihkan ke halaman login.

Jika sudah login: render tombol "View Details & Checkout". Ketika diklik, pengguna bisa diarahkan ke alur booking/checkout untuk kursus tersebut (misalnya menuju halaman booking step 1 dengan kursus terpilih, atau langsung ke detail kursus dengan opsi daftar).

Sebagai contoh, kita bisa membuat halaman detail kursus terpisah, misalnya route /courses/:courseId, yang menampilkan info lengkap (outline kelas, harga, durasi, dsb.). Tombol "View Details" untuk user belum login bisa mengarah ke halaman ini. Sementara "View Details & Checkout" untuk user login bisa mengarah ke halaman detail yang sama namun dengan tombol "Checkout" di dalamnya, atau langsung memulai proses booking.

Untuk kesederhanaan, kita dapat langsung memulai proses booking ketika user login menekan tombol tersebut, misalnya dengan mengarahkan ke halaman /booking dan otomatis memilih kursus yang diklik.

Contoh kode pada komponen daftar kursus:

```tsx

import { useAuth } from "@/lib/auth-context";
import { useNavigate } from "wouter";  // asumsi pakai wouter useNavigate

const courses = CLASS_TYPES; // array of course objects {id, title, description, ...}

function CoursesSection() {
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();

  const handleViewDetails = (courseId: string) => {
    navigate(`/courses/${courseId}`);  // navigasi ke halaman detail kursus
  };
  const handleCheckout = (courseId: string) => {
    // Misal langsung ke wizard booking dengan query param course
    navigate(`/booking?course=${courseId}`);
  };

  return (
    <div className="courses-grid">
      {courses.map(course => (
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

Pada kode di atas: - handleViewDetails akan membawa user ke halaman detail kursus (yang bisa dibuat sebagai halaman statis menampilkan info kursus saja). - handleCheckout membawa user login ke halaman booking. Di halaman booking, kita bisa menangkap parameter course dari URL untuk langsung mengisi pilihan kursus (skip step pemilihan kursus). Misalnya, di wizard booking step 1, jika ada query course, otomatis set pilihan tersebut. - Tombol hanya berganti label & perilaku jika isAuthenticated true.

Implementasi Halaman Detail Kursus (Opsional):

Jika memutuskan membuat halaman detail kursus (/courses/:id): 1. Buat komponen baru misal pages/course-detail.tsx yang mengambil :id dari route. 2. Dapat menggunakan data dari CLASS_TYPES atau mem-fetch detail kalau disimpan di DB (saat ini detail bisa hardcode dari constant). 3. Tampilkan info lengkap. Jika user belum login, sertakan ajakan untuk login supaya bisa mendaftar. 4. Jika user sudah login, sediakan tombol "Checkout" di halaman ini yang mengarahkan ke /booking?course=id atau memulai proses booking.

Menambahkan route baru di React dapat mengikuti pola yang ada di App.tsx. Misal:

```tsx

// App.tsx (menggunakan router, pseudo-code)
import CourseDetail from "@/pages/course-detail";

// ...
<Route path="/courses/:id">
  <Layout>
    <CourseDetail />
  </Layout>
</Route>

```

Ini mirip dengan contoh penambahan halaman baru[14]. Pastikan integrasi dengan layout agar header/footer konsisten.

Dengan demikian, perbedaan tampilan Our Signature Courses sesuai yang diminta sudah diterapkan: pengguna tidak login hanya bisa melihat info kursus, sedangkan yang login bisa lanjut hingga checkout.

## 4. Mekanisme Checkout (Pendaftaran Kelas & Pembayaran)

Setelah user memilih kursus (dan level, jika ada) dan menekan Checkout, aplikasi harus membawa user ke proses checkout untuk menyelesaikan pendaftaran kelas. Berikut fitur-fitur yang harus ada dalam mekanisme checkout:

Form Pilihan Metode Transfer Bank: User harus memilih metode pembayaran via transfer bank. Misalnya pilihan bank (BCA, Mandiri, BNI, dll). Desain form harus modern & profesional, bisa menggunakan radio button atau kartu pilihan bank dengan logo.

Informasi Pembayaran & Countdown 1 Jam: Setelah memilih bank, tampilkan informasi no. rekening tujuan dan instruksi pembayaran. Mulai timer countdown 1 jam yang terlihat di UI, mengingatkan user untuk segera transfer dalam waktu tersebut.

Konfirmasi & Notifikasi: Ketika user mengklik tombol "OK" atau "Confirm" setelah memilih metode, sistem akan mencatat transaksi pending. User kemudian mendapat notifikasi (via ikon bell di header) yang berisi link ke form upload bukti pembayaran.

Berikut langkah implementasinya:

Database (Tabel Booking/Pemesanan):

Kita perlu mencatat transaksi pendaftaran kelas. Buat tabel baru bookings (atau registrations) untuk menyimpan data pendaftaran/pembayaran. Tabel ini akan terhubung ke users (relasi many-to-one). Contoh skema dengan Drizzle ORM:

```tsx

// shared/schema.ts
export const bookings = pgTable("bookings", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id),
  classType: text("class_type").notNull(),    // jenis kursus (makeup/nail/eyelash)
  level: text("level").notNull(),             // level kelas (beginner/intermediate/high)
  status: text("status").notNull().default('pending_payment'), 
  paymentMethod: text("payment_method"),      // bank yg dipilih (misal "BCA")
  paymentDue: timestamp("payment_due"),       // batas waktu pembayaran
  paymentProof: text("payment_proof"),        // path/filename bukti pembayaran (jika sudah upload)
  preferredSlot1: text("preferred_slot1"),    // pilihan jadwal 1 (akan diisi nanti)
  preferredSlot2: text("preferred_slot2"),    // pilihan jadwal 2
  scheduledDate1: date("scheduled_date1"),    // jadwal final sesi 1 (jika kursus mencakup 2 sesi, optional)
  scheduledDate2: date("scheduled_date2"),    // jadwal final sesi 2 (optional)
  teacherId: varchar("teacher_id"),           // pengajar yang ditugaskan (nullable, referensi teachers.id)
  createdAt: timestamp("created_at").defaultNow()
});

```

Catatan: Kolom scheduledDate1/2 dipakai jika kursus terdiri dari 2 sesi (lihat poin jadwal). Jika kursus hanya 1 kali per peserta, cukup 1 tanggal. Kolom teacherId menghubungkan ke tabel pengajar (lihat Tab Pengajar). Struktur ini bisa disesuaikan dengan kebutuhan sebenarnya.

Setelah menambahkan schema di atas, jalankan migrasi Drizzle (misal npx drizzle-kit generate && npx drizzle-kit migrate) untuk membuat tabel di database.

Frontend (Komponen Checkout):

Flow checkout kemungkinan merupakan Step 4 dari wizard booking (Confirmation & Payment)[15]. Kita modifikasi step ini agar mencakup: - Pilih metode pembayaran (komponen form). - Tampilkan detail pembayaran (rekening, nominal, dll). - Timer countdown 1 jam. - Tombol konfirmasi.

Contoh komponen Checkout (misal bagian dari pages/booking.tsx step 4):

```tsx

import { useEffect, useState } from "react";
import { useMutation } from "@tanstack/react-query";

function PaymentStep({ selectedClass, selectedLevel }) {
  const [bank, setBank] = useState<string>("");         // pilihan bank
  const [timeLeft, setTimeLeft] = useState(3600);       // 1 jam dalam detik (3600 detik)

  // Mulai countdown ketika komponen mount
  useEffect(() => {
    if (!timeLeft) return;
    const timer = setInterval(() => {
      setTimeLeft(prev => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(timer);
  }, [timeLeft]);

  // Format detik ke menit:detik
  const formatTime = (sec: number) => {
    const m = Math.floor(sec / 60);
    const s = sec % 60;
    return `${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
  };

  // Mutation untuk membuat booking (pending payment)
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
      // Booking tercatat, mungkin kembalikan bookingId
      console.log("Booking created", data.bookingId);
      toast.success("Booking created! Please complete payment within 1 hour.");
      // TODO: trigger fetch notifications to show the new notification
    },
    onError: () => {
      toast.error("Unable to create booking.");
    }
  });

  const handleConfirm = () => {
    if (!bank) {
      toast.error("Please select a payment method.");
      return;
    }
    createBookingMutation.mutate();
  };

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
          <p>Please transfer the total amount to the following {bank} account:</p>
          <p><strong>{bank} 1234567890</strong> a.n. Jakarta Beauty School</p>
          <p className="text-sm text-gray-600">*Complete payment within <strong>{formatTime(timeLeft)}</strong> (hh:mm) or your registration may be canceled.</p>
        </div>
      )}
      <button onClick={handleConfirm} className="btn-primary">
        OK
      </button>
    </div>
  );
}

```

Penjelasan: - bank state menyimpan pilihan bank. User harus memilih salah satu sebelum menekan OK. - Ketika bank terpilih, kami menampilkan informasi nomor rekening dan timer countdown. Timer timeLeft berkurang tiap detik menggunakan setInterval. Format ditampilkan mm:ss. - Tombol OK akan memicu createBookingMutation untuk mengirim data ke server: - Endpoint POST /api/bookings akan membuat entry baru di tabel bookings dengan status awal pending_payment, menyimpan jenis kursus, level, metode pembayaran, userId, dll. Juga mengisi paymentDue (server-side) = sekarang + 1 jam. - Setelah sukses, kita menampilkan toast konfirmasi dan perlu memberikan notifikasi ke user (di ikon bell). Catatan: Pada contoh di atas, notifikasi bell bisa di-refresh manual (misal dengan memanggil kembali query TanStack Query untuk notifikasi atau context update). Untuk sementara, kita hanya logging dan toast.

Implementasi Backend (Membuat Booking & Notifikasi):

Tambahkan route baru di Express untuk membuat booking. Contoh:

```tsx

// server/routes.ts (lanjutan)
import { authMiddleware } from "./middleware";  // middleware yg memastikan user sudah login

app.post("/api/bookings", authMiddleware, async (req, res) => {
  try {
    const userId = req.session.userId;
    if (!userId) {
      return res.status(401).json({ error: "Not authenticated" });
    }
    const { classType, level, paymentMethod } = req.body;
    // Tentukan due time 1 jam dari sekarang
    const paymentDue = new Date(Date.now() + 60 * 60 * 1000);
    // Simpan ke DB
    const booking = await storage.createBooking({
      userId,
      classType,
      level,
      paymentMethod,
      status: "pending_payment",
      paymentDue
    });
    // Buat notifikasi untuk user: upload bukti
    await storage.createNotification({
      userId,
      message: "Complete your payment within 1 hour by uploading the proof.",
      link: `/upload-proof?bookingId=${booking.id}`
    });
    return res.status(201).json({ bookingId: booking.id });
  } catch (error: any) {
    console.error(error);
    return res.status(400).json({ error: error.message });
  }
});

```

Penjelasan: - authMiddleware digunakan agar hanya user login bisa membuat booking[16]. - Data classType, level, paymentMethod diambil dari request body. - paymentDue diset 1 jam ke depan. - storage.createBooking adalah fungsi abstraksi yang sebaiknya menulis ke tabel bookings (menggunakan Drizzle). Pastikan fungsi ini menyimpan sesuai skema (termasuk status dan paymentDue). - Setelah booking tercipta, kita langsung membuat sebuah entri notifikasi menggunakan storage.createNotification. Ini menambah notifikasi untuk user tersebut berisi pesan agar mengupload bukti pembayaran, dengan link yang mengarahkan ke form upload (route /upload-proof dengan query bookingId). - Response mengirim bookingId (bisa digunakan front-end jika diperlukan).

Catatan: Pembuatan notifikasi di server memastikan notifikasi tersimpan di database (tabel notifikasi). Nanti, komponen bell di frontend akan mengambil notifikasi ini.

Notifikasi Bell Icon (Frontend):

Tambahkan komponen ikon bell di header (mungkin sudah ada placeholder). Implementasinya: - Buat state atau TanStack Query untuk fetch notifikasi user. Contoh, endpoint GET /api/notifications mengembalikan list notifikasi [{id, message, link, isRead}, ...] untuk user login. - Tampilkan ikon bell (misal menggunakan lucide-react Bell icon). Jika ada notifikasi belum dibaca, tampilkan badge angka. - Saat diklik, munculkan dropdown atau popup list notifikasi. Setiap item menampilkan pesan dan dapat diklik (link) menuju tindakan yang dimaksud (contoh: "Upload bukti pembayaran" ketika di-klik, link ke halaman upload form). - Tandai notifikasi sebagai read jika sudah dilihat (bisa dengan memanggil API update, atau hapus notifikasi setelah di-click).

Contoh ringkas di layout header:

```tsx

import { Bell } from "lucide-react";  // icon bell dari lucide
import { useQuery } from "@tanstack/react-query";

function NotificationsBell() {
  const { data: notifications = [] } = useQuery(['notifications'], async () => {
    const res = await fetch('/api/notifications');
    return res.ok ? res.json() : [];
  }, { refetchInterval: 30000 }); // polling tiap 30 detik misal

  // Hitung berapa notifikasi belum dibaca
  const unreadCount = notifications.filter(n => !n.isRead).length;

  return (
    <div className="relative">
      <button className="bell-button">
        <Bell />
        {unreadCount > 0 && <span className="badge">{unreadCount}</span>}
      </button>
      {/* Dropdown notifikasi */}
      <div className="notification-dropdown">
        {notifications.length === 0 ? (
          <p>No notifications</p>
        ) : (
          <ul>
            {notifications.map(note => (
              <li key={note.id} className={note.isRead ? '' : 'font-bold'}>
                <a href={note.link || '#'} onClick={() => {/* mark as read logic */}}>
                  {note.message}
                </a>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}

```

Kode di atas sebaiknya disesuaikan styling-nya (misal gunakan Radix Popover atau Dropdown untuk tampilan profesional). Intinya, setelah user klik OK di checkout, notifikasi "Complete your payment..." akan muncul di dropdown ini dengan link ke /upload-proof?bookingId=.... User bisa mengklik notifikasi tersebut untuk menuju ke halaman upload bukti pembayaran.

## 5. Form Upload Bukti Pembayaran

Setelah melakukan transfer, user harus mengupload bukti pembayaran (misal foto struk atau screenshot e-banking). Kita perlu menyediakan form upload yang modern dan mudah digunakan:

Form ini diakses melalui link notifikasi (misal route /upload-proof?bookingId=...).

Hanya bisa diakses oleh user yang memang punya booking pending (supaya user lain tidak bisa sembarang akses).

Form berisi input untuk file (accept image/pdf), bisa ditambah keterangan jika perlu, dan tombol Submit.

Tampilannya dibuat profesional, menggunakan komponen form library (React Hook Form + Tailwind untuk styling, misal).

Saat user submit, file akan diupload ke server, disimpan, lalu status booking berubah sehingga admin tahu sudah ada bukti menunggu approval.

Setelah upload berhasil, user mendapat konfirmasi (misal toast "Upload successful, waiting for approval") dan mungkin diarahkan kembali ke halaman utama atau dashboard.

Implementasi Frontend (Halaman Upload Proof):

Buat komponen page baru, misal pages/upload-proof.tsx. Route-nya bisa /upload-proof dengan query bookingId, atau untuk keamanan bisa dijadikan path parameter seperti /bookings/:id/upload-proof. Dalam contoh ini kita pakai query param:

```tsx

import { useLocation } from "wouter";
import { useState } from "react";
import { useMutation } from "@tanstack/react-query";

function UploadProofPage() {
  const [file, setFile] = useState<File | null>(null);
  const [message, setMessage] = useState("");
  const location = useLocation();
  const bookingId = new URLSearchParams(location.search).get("bookingId");

  const uploadMutation = useMutation({
    mutationFn: async () => {
      if (!file || !bookingId) throw new Error("No file or bookingId");
      const formData = new FormData();
      formData.append("proof", file);
      const res = await fetch(`/api/bookings/${bookingId}/upload-proof`, {
        method: "POST",
        body: formData
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || "Upload failed");
      }
      return res.json();
    },
    onSuccess: () => {
      setMessage("Upload successful! Please wait for admin approval.");
      // Mungkin redirect user setelah beberapa detik atau tampilkan pesan saja
    },
    onError: (error: any) => {
      setMessage(error.message);
    }
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!file) {
      setMessage("Please select a file to upload.");
      return;
    }
    uploadMutation.mutate();
  };

  return (
    <div className="upload-proof-form">
      <h2>Upload Payment Proof</h2>
      {message && <p>{message}</p>}
      <form onSubmit={handleSubmit}>
        <input 
          type="file" 
          accept="image/*,application/pdf" 
          onChange={(e) => setFile(e.target.files?.[0] || null)} 
        />
        <button type="submit" disabled={uploadMutation.isLoading}>
          Submit
        </button>
      </form>
    </div>
  );
}

```

Penjelasan: - Komponen mengambil bookingId dari URL. - User memilih file, disimpan di state file. - Ketika submit, kita gunakan FormData agar bisa kirim file via fetch. Endpoint POST /api/bookings/:id/upload-proof akan menangani. - Menampilkan pesan sukses/gagal di message. - (Opsional: Bisa menambahkan preview thumbnail file gambar sebelum upload, validasi ukuran file, dll untuk UX.)

Implementasi Backend (Upload Proof):

Tambahkan route di Express untuk menerima upload file. Kita dapat menggunakan multer sebagai middleware untuk handling file upload.

Pertama, setup multer di server/index.ts atau routes file:

```tsx

import multer from "multer";
const upload = multer({ dest: "attached_assets/uploads/" }); 
// dest folder di server untuk menyimpan file upload (pastikan folder ada dan static-served or accessible if needed)

```

Lalu definisikan route:

```tsx

app.post("/api/bookings/:id/upload-proof", authMiddleware, upload.single("proof"), async (req, res) => {
  try {
    const bookingId = req.params.id;
    const userId = req.session.userId;
    if (!userId) return res.status(401).json({ error: "Not authenticated" });
    // Pastikan booking ada dan milik user ini
    const booking = await storage.getBooking(bookingId);
    if (!booking || booking.userId !== userId) {
      return res.status(403).json({ error: "Unauthorized or invalid booking" });
    }
    // Simpan path/file name bukti di DB, update status -> waiting_approval (menunggu approval admin)
    const filePath = req.file ? req.file.path : null;
    await storage.updateBooking(bookingId, {
      paymentProof: filePath,
      status: "waiting_approval"
    });
    // (Opsional) Bisa tambahkan notifikasi untuk admin di sini kalau real-time notifikasi admin diperlukan.
    return res.json({ message: "Proof uploaded, waiting for approval" });
  } catch (err: any) {
    console.error(err);
    return res.status(500).json({ error: "Upload failed" });
  }
});

```

Penjelasan: - authMiddleware memastikan hanya user login bisa upload (tidak bisa diakses publik). - upload.single("proof") memproses file upload field "proof". File disimpan di folder attached_assets/uploads/ dengan nama file random (multer default). - Kita cek apakah bookingId valid dan milik user yang sedang login; ini penting agar user tidak bisa upload untuk booking user lain. - Update booking di DB: simpan lokasi file (path di server atau nama file) ke kolom paymentProof, serta ubah status menjadi "waiting_approval". - Balas respon sukses.

Keamanan & Akses File: File bukti tersimpan di server. Supaya admin bisa melihat filenya, folder attached_assets/uploads sebaiknya diserve statis (misal di Express tambahkan static serve untuk folder ini jika belum, atau menyediakan endpoint untuk admin download file). Pastikan hanya admin yang dapat mengakses file sensitif ini (bisa dengan meletakkan di folder non-public dan menggunakan route auth untuk melihatnya). Untuk kesederhanaan, asumsi kita admin dapat akses file melalui path yang diketahui.

Setelah tahap ini, user telah mengupload bukti. Status booking sekarang "waiting_approval" (menunggu persetujuan admin). User tinggal menunggu admin meninjau. Sisi user, notifikasi bisa diperbarui (misal notifikasi "Payment proof uploaded. Awaiting approval."). Sementara itu, admin akan melihat entri baru di Tab Approval - Pembayaran.

## 6. Dashboard Admin (/admin) – Akses dan Struktur Umum

Kita akan membuat Dashboard Admin yang hanya dapat diakses oleh admin (dalam hal ini, hanya Super Admin yang ada). Dashboard ini akan berisi tab-tab untuk mengelola persetujuan, jadwal kelas, data pengajar, dan data murid.

Keamanan Akses Admin: - Hanya user dengan role admin yang boleh mengakses route /admin. - Dalam implementasi sederhana, kita bisa menambahkan flag isAdmin pada tabel users (boolean atau field role). Anda mungkin perlu menambahkan kolom role atau isAdmin ke users. Misal:

```tsx

// Tambahkan ke schema users
role: text("role").notNull().default("user")
// atau
isAdmin: boolean("is_admin").notNull().default(false)

```

Dan tandai secara manual akun admin (misal lewat seeding database atau SQL update) untuk memiliki isAdmin = true. - Frontend: Cek status admin pada AuthContext. Misal context user objek bisa memiliki property isAdmin atau role. Kita perlu memanfaatkan itu untuk melindungi route admin. - Backend: Buat middleware adminOnly untuk melindungi endpoint admin. Contoh:

```tsx

function adminOnly(req: Request, res: Response, next: NextFunction) {
  const userId = req.session.userId;
  const user = userId ? storage.getUser(userId) : null;
  if (!userId || !user || !user.isAdmin) {
    return res.status(403).json({ error: "Forbidden" });
  }
  next();
}

```

Gunakan adminOnly pada semua route yang prefiks /api/admin/*.

Routing Frontend untuk Admin:

Tambahkan route baru pada router React, misalnya di App.tsx:

```tsx

import AdminDashboard from "@/pages/admin-dashboard";

// ...
<Route path="/admin">
  {user && user.isAdmin ? (
    <AdminDashboard />
  ) : (
    <Layout>
      <NotFound /> {/* atau redirect ke home */}
    </Layout>
  )}
</Route>

```

Di snippet di atas, kita render komponen AdminDashboard hanya jika user.isAdmin true. Jika tidak (misal pengguna non-admin mencoba akses), kita bisa render 404 atau redirect ke beranda.

Pastikan setelah login, informasi user (termasuk isAdmin) tersedia di AuthContext. Jika perlu, modifikasi response login (/api/auth/login) untuk mengirim flag isAdmin, dan simpan di state.

Struktur UI AdminDashboard:

Dashboard admin terdiri dari 4 tab utama: Approval, Jadwal Kelas, Pengajar, Murid. Kita bisa menggunakan komponen Tabs (misal Radix UI Tabs) untuk membuat interface tab.

Misalnya, komponen AdminDashboard:

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

Pada kode di atas: - Kita menggunakan komponen Tabs (diasumsikan sudah tersedia, entah via Radix UI atau custom). - ApprovalTab, ScheduleTab, TeachersTab, StudentsTab adalah komponen terpisah untuk konten masing-masing tab, yang akan kita implementasikan. - Default tab saat membuka dashboard adalah "approval".

Dengan struktur ini, admin dapat berpindah tab tanpa meninggalkan halaman /admin.

Ringkasan Fungsi Tiap Tab:

Tab Approval: Untuk persetujuan pembayaran dan jadwal. Admin akan melihat daftar pembayaran yang perlu di-approve (bukti transfer) dan permintaan jadwal yang perlu di-approve. Terdapat filter untuk memilih antara dua kategori tersebut.

Tab Jadwal Kelas: Menampilkan kalender jadwal kelas secara keseluruhan. Admin bisa melihat kelas-kelas yang sudah dijadwalkan (termasuk status penuh atau tidak). Bisa klik tanggal untuk rincian murid & pengajar di hari itu.

Tab Pengajar: Menampilkan daftar pengajar dan memungkinkan admin menambah/edit data pengajar (nama pengajar, dll). Karena sistem role belum multi-level, pengajar di sini tidak login ke sistem, namun data mereka disimpan untuk penjadwalan.

Tab Murid: Menampilkan daftar murid (siswa) beserta informasi kontak dan status pendaftaran mereka (aktif, belum bayar, menunggu approval).

Selanjutnya, kita bahas detail implementasi tiap tab.

## 7. Tab Approval (Persetujuan Pembayaran & Jadwal)

Tab Approval berfungsi untuk mengelola dua jenis persetujuan: - Persetujuan Pembayaran: Admin meninjau bukti transfer yang diupload murid dan memutuskan approve (terima) atau reject (tolak). - Persetujuan Jadwal: Setelah pembayaran diterima, murid memilih jadwal kelas (dua opsi waktu). Admin meninjau pilihan jadwal tersebut dan menyetujuinya (atau menolak jika tidak bisa dijadwalkan).

Kita perlu menyediakan UI untuk beralih antara dua kategori ini, misalnya dengan toggle atau tab kecil di dalam Approval.

Implementasi Frontend (ApprovalTab Component):

Buat state filter dengan nilai "payments" atau "schedule" untuk menentukan daftar mana yang ditampilkan.

Tampilkan tombol toggle atau tab: "Pembayaran" dan "Schedule". Ketika diklik, atur state filter.

Berdasarkan filter, render tabel daftar item pending:

Jika filter "payments": Tabel daftar bukti pembayaran menunggu approval.

Jika filter "schedule": Tabel daftar permintaan jadwal menunggu approval.

Contoh komponen ApprovalTab:

```tsx

import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";

function ApprovalTab() {
  const [filter, setFilter] = useState<"payments"|"schedule">("payments");

  // Fetch data pending approvals
  const { data: paymentApprovals = [] } = useQuery(['pendingPayments'], async () => {
    const res = await fetch('/api/admin/approvals?type=payment');
    return res.ok ? res.json() : [];
  }, { enabled: filter === "payments" });

  const { data: scheduleApprovals = [] } = useQuery(['pendingSchedules'], async () => {
    const res = await fetch('/api/admin/approvals?type=schedule');
    return res.ok ? res.json() : [];
  }, { enabled: filter === "schedule" });

  // Mutations for approve/reject actions
  const approvePayment = useMutation({
    mutationFn: (bookingId: string) => fetch(`/api/admin/payments/${bookingId}/approve`, { method: "POST" }),
    onSuccess: () => {
      queryClient.invalidateQueries(['pendingPayments']);
      queryClient.invalidateQueries(['students']); // update student status
      // possibly trigger notification to user (done server-side)
    }
  });
  const rejectPayment = useMutation({
    mutationFn: (bookingId: string) => fetch(`/api/admin/payments/${bookingId}/reject`, { method: "POST" }),
    onSuccess: () => {
      queryClient.invalidateQueries(['pendingPayments']);
      queryClient.invalidateQueries(['students']);
    }
  });
  const approveSchedule = useMutation({
    mutationFn: (bookingId: string) => fetch(`/api/admin/schedules/${bookingId}/approve`, { method: "POST" }),
    onSuccess: () => {
      queryClient.invalidateQueries(['pendingSchedules']);
      queryClient.invalidateQueries(['scheduleEvents']); // update calendar events
      queryClient.invalidateQueries(['students']);
    }
  });
  const rejectSchedule = useMutation({
    mutationFn: (bookingId: string) => fetch(`/api/admin/schedules/${bookingId}/reject`, { method: "POST" }),
    onSuccess: () => {
      queryClient.invalidateQueries(['pendingSchedules']);
      queryClient.invalidateQueries(['students']);
    }
  });

  return (
    <div>
      {/* Filter Toggle Buttons */}
      <div className="mb-4 space-x-2">
        <button 
          onClick={() => setFilter("payments")} 
          className={filter==="payments" ? "btn-tab-active" : "btn-tab"}>
          Pembayaran
        </button>
        <button 
          onClick={() => setFilter("schedule")} 
          className={filter==="schedule" ? "btn-tab-active" : "btn-tab"}>
          Schedule
        </button>
      </div>

      {filter === "payments" ? (
        <table className="w-full text-sm">
          <thead>
            <tr><th>Nama Murid</th><th>Kelas</th><th>Bukti Transfer</th><th>Aksi</th></tr>
          </thead>
          <tbody>
            {paymentApprovals.map((item: any) => (
              <tr key={item.bookingId}>
                <td>{item.studentName}</td>
                <td>{item.classType} - {item.level}</td>
                <td>
                  <a href={`/uploads/${item.proofFilename}`} target="_blank" rel="noopener noreferrer" className="text-blue-600 underline">
                    Lihat Bukti
                  </a>
                </td>
                <td>
                  <button onClick={() => approvePayment.mutate(item.bookingId)} className="btn-sm btn-success">Approve</button>
                  <button onClick={() => rejectPayment.mutate(item.bookingId)} className="btn-sm btn-danger ml-2">Reject</button>
                </td>
              </tr>
            ))}
            {paymentApprovals.length === 0 && (
              <tr><td colSpan={4} className="text-center py-2">No pending payments</td></tr>
            )}
          </tbody>
        </table>
      ) : (
        <table className="w-full text-sm">
          <thead>
            <tr><th>Nama Murid</th><th>Pilihan Jadwal</th><th>Aksi</th></tr>
          </thead>
          <tbody>
            {scheduleApprovals.map((req: any) => (
              <tr key={req.bookingId}>
                <td>{req.studentName}</td>
                <td>{req.preferredSlot1} & {req.preferredSlot2}</td>
                <td>
                  <button onClick={() => approveSchedule.mutate(req.bookingId)} className="btn-sm btn-success">Approve</button>
                  <button onClick={() => rejectSchedule.mutate(req.bookingId)} className="btn-sm btn-danger ml-2">Reject</button>
                </td>
              </tr>
            ))}
            {scheduleApprovals.length === 0 && (
              <tr><td colSpan={3} className="text-center py-2">No pending schedule requests</td></tr>
            )}
          </tbody>
        </table>
      )}
    </div>
  );
}

```

Penjelasan: - Menggunakan React Query untuk fetch data: - pendingPayments: daftar booking dengan status waiting_approval (pembayaran). - pendingSchedules: daftar booking dengan status waiting_schedule. - Endpoint yang dipanggil /api/admin/approvals?type=payment dan ?type=schedule diimplementasi di backend untuk mengembalikan data relevan. - Tabel Pembayaran: kolom Nama murid, Kelas, Bukti Transfer (link file), Aksi (Approve/Reject). - Tabel Schedule: kolom Nama murid, Pilihan Jadwal (dua slot yang dipilih murid), Aksi (Approve/Reject). - Tombol Approve/Reject terhubung ke mutation yang memanggil endpoint admin: - /api/admin/payments/:bookingId/approve atau /reject - /api/admin/schedules/:bookingId/approve atau /reject - Setelah sukses, kita invalidasi query terkait agar UI refresh (misal daftar pending & data lain seperti list murid atau jadwal). - Kelas CSS btn-sm btn-success/btn-danger diasumsikan didefinisikan (Tailwind utility atau styling custom untuk tombol kecil).

Implementasi Backend (Endpoint Approval):

GET /api/admin/approvals?type=payment: kembalikan daftar pembayaran pending:

Query database bookings dengan status = 'waiting_approval'.

Join dengan users untuk nama murid.

Return data array. Misal format:

[
  { "bookingId": "...", "studentName": "Alice", "classType": "Makeup", "level": "Beginner", "proofFilename": "123abc.jpg" },
  ...
]

GET /api/admin/approvals?type=schedule: kembalikan daftar request jadwal pending:

Query bookings dengan status = 'waiting_schedule'.

Join users untuk nama.

Return data, misal:

[
  { "bookingId": "...", "studentName": "Alice", "preferredSlot1": "Mon 09:30", "preferredSlot2": "Wed 13:30" },
  ...
]

Implementasi query dengan Drizzle ORM bisa menggunakan db.select().from(bookings).where(eq(bookings.status, 'waiting_approval')) ditambah join ke tabel users untuk dapat nama[16]. Atau kita bisa gunakan method di storage semisal getPendingPayments().

POST /api/admin/payments/:id/approve: logic:

Gunakan adminOnly middleware.

Ambil bookingId, cari booking terkait.

Update booking: status = 'paid' (atau bisa langsung 'waiting_schedule' jika kita ingin user segera pilih jadwal, tapi sesuai flow, user baru pilih jadwal setelah payment approved, jadi di sini kita set 'paid' atau 'awaiting_schedule'? Kita akan set 'paid' lalu segera buat notifikasi ke user untuk pilih jadwal, dan update status ke 'waiting_schedule').

Buat notifikasi untuk user: "Registrasi Selesai, silakan pilih waktu kelas." dengan link ke halaman pemilihan jadwal.

(Opsional: bisa juga kirim email konfirmasi pembayaran ke user, tapi cukup notifikasi in-app sesuai spesifikasi).

Response sukses.

POST /api/admin/payments/:id/reject:

Update booking: misal status = 'payment_rejected' atau kembali ke 'pending_payment'.

Opsi: bisa hapus paymentProof atau simpan untuk audit.

Notifikasi user: "Pembayaran ditolak, silakan upload ulang bukti yang valid." (Ini tidak diminta eksplisit, tapi sebaiknya ada).

Response sukses.

POST /api/admin/schedules/:id/approve:

Update booking: status = 'scheduled' (final, sudah dijadwalkan).

Juga tetapkan jadwal final:

Karena murid memberikan dua pilihan slot (misal Senin pagi & Rabu siang), admin pada fase ini memutuskan jadwal final. Jika keduanya bisa dijalankan (karena mungkin kursus butuh 2 sesi), admin cukup menyetujui tanpa perubahan. Jika ternyata hanya butuh 1 slot (bila interpretasi berbeda), admin bisa pilih salah satu. Namun asumsi kita: kursus ini terdiri dari 2 sesi, jadi kedua slot akan dijadwalkan.

Untuk menentukan tanggal konkret: kita dapat secara otomatis memilih tanggal terdekat untuk masing-masing slot. Misal slot "Mon 09:30" berarti Senin jam 09:30 terdekat. Namun, menentukan tanggal aktual mungkin memerlukan penjadwalan manual. Simpelnya, kita lewati detail tanggal dalam implementasi dan hanya simpan slot pilihan (atau admin secara terpisah akan mengatur tanggal).

Assign teacher: admin perlu menetapkan pengajar untuk kelas tersebut. Jika pada sistem kita sudah ada daftar pengajar, sebaiknya pada saat approve jadwal, admin memilih pengajar. Untuk kesederhanaan, bisa saja setiap slot sudah punya pengajar tetap, atau admin edit nanti di Tab Jadwal. Dalam implementasi minimal, kita bisa abaikan atau set teacher kalau misal satu teacher per slot fix.

Buat notifikasi ke user: "Jadwal kelas Anda sudah dikonfirmasi. Lihat jadwal di halaman My Classes." (tidak disebut di spek, tapi baik untuk user).

Response sukses.

POST /api/admin/schedules/:id/reject:

Update booking: mungkin kembali ke status 'paid' agar user bisa pilih jadwal lagi, atau buat status 'schedule_rejected'.

Notifikasi user: misal "Pilihan jadwal tidak tersedia, silakan ajukan jadwal lain." (tidak disebut, tapi logis).

Response sukses.

Contoh implementasi salah satu endpoint (approve payment):

```tsx

app.post("/api/admin/payments/:bookingId/approve", adminOnly, async (req, res) => {
  try {
    const bookingId = req.params.bookingId;
    const booking = await storage.getBooking(bookingId);
    if (!booking) return res.status(404).json({ error: "Booking not found" });
    // Update status to paid
    await storage.updateBooking(bookingId, { status: "paid" });
    // Create notification for user to select schedule
    await storage.createNotification({
      userId: booking.userId,
      message: "Registrasi selesai! Silakan pilih jadwal kelas Anda.",
      link: `/schedule-select?bookingId=${bookingId}`
    });
    // (Opsional: bisa juga langsung mengaktifkan user status, tapi di Students tab ini akan terlihat sbg "aktif" 
    //  meski status booking masih perlu jadwal. Kita anggap itu aktif.)
    return res.json({ message: "Payment approved" });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "Failed to approve payment" });
  }
});

```

Endpoint lainnya serupa pola: - Pastikan pakai adminOnly untuk keamanan[17]. - Gunakan storage.updateBooking untuk ubah status. - Gunakan storage.createNotification untuk beri tahu user.

Dengan Tab Approval ini, admin dapat melakukan tugas: - Melihat bukti transfer dan men-Approve (yang akan mengirim notifikasi ke user untuk pilih jadwal) atau Reject (notifikasi user untuk upload ulang). - Melihat daftar pilihan jadwal user dan men-Approve (menjadwalkan kelas, update status aktif) atau Reject (mungkin meminta user pilih ulang).

## 8. Pemilihan Waktu Kelas oleh Peserta (Setelah Payment Approved)

Setelah admin menyetujui pembayaran, sesuai flow, user akan mendapat notifikasi "Registrasi Selesai" dengan link untuk memilih waktu kelas. Pada tahap ini: - User membuka halaman pemilihan jadwal (misal route /schedule-select?bookingId=...). - User diberikan pilihan jadwal (hari dan jam) yang tersedia. Sesuai ketentuan: Senin, Rabu, Jumat, Minggu pada jam 09:30–11:30 atau 13:30–15:30. - User harus memilih dua waktu di antara opsi tersebut.

Interpretasi: Tampaknya setiap kursus terdiri dari dua sesi kelas, sehingga murid perlu memilih 2 slot waktu yang diinginkan (misal: Senin pagi dan Rabu pagi). Admin kemudian akan menjadwalkan kelas murid pada dua slot tersebut. Jika kelas di slot tertentu sudah penuh, slot itu ditandai warna merah muda (pink) dan tidak dapat dipilih. Slot yang masih tersedia ditandai hijau.

Implementasi Frontend (Halaman Pilih Jadwal):

Buat komponen page ScheduleSelectPage (dirender saat user klik link notifikasi, dengan query bookingId):

Fetch data ketersediaan slot dari server: misal endpoint GET /api/schedule/availability yang mengembalikan daftar slot (Mon AM, Mon PM, Wed AM, Wed PM, Fri AM, Fri PM, Sun AM, Sun PM) beserta status penuh/tidak.

Tampilkan grid pilihan slot:

Bisa berbentuk grid 4 baris (hari) x 2 kolom (pagi & siang), atau simpel list 8 checkbox.

Gunakan warna latar atau indikator: misal pakai Tailwind classes:

Hijau (bg-green-100 atau border-green-500) untuk slot tersedia,

Merah muda (bg-pink-100 atau line-through) untuk slot penuh (disabled).

Gunakan checkbox atau toggle button untuk pemilihan. Batasi agar tepat 2 slot bisa dipilih:

Bisa handle manual di state: ketika user mencoba pilih slot ketiga, abaikan atau otomatis uncheck yang lain.

Tombol Submit: aktif jika tepat 2 slot dipilih. Saat klik Submit, kirim pilihan ke server untuk disimpan.

Contoh implementasi UI sederhana:

```tsx

import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";

function ScheduleSelectPage() {
  const params = new URLSearchParams(window.location.search);
  const bookingId = params.get("bookingId");

  // Dapatkan info ketersediaan slot
  const { data: slotAvailability = [] } = useQuery(['slotAvailability'], async () => {
    const res = await fetch('/api/schedule/availability');
    return res.ok ? res.json() : [];
  });

  // State untuk slot terpilih
  const [selectedSlots, setSelectedSlots] = useState<string[]>([]);

  const toggleSlot = (slotId: string) => {
    setSelectedSlots(prev => {
      if (prev.includes(slotId)) {
        // jika sudah ada, unselect
        return prev.filter(id => id !== slotId);
      } else {
        // jika belum ada dan kurang dari 2, select
        if (prev.length < 2) {
          return [...prev, slotId];
        } else {
          // jika sudah 2 terpilih, bisa beri pesan atau tidak mengizinkan
          return prev;
        }
      }
    });
  };

  const submitMutation = useMutation({
    mutationFn: async () => {
      if (!bookingId) throw new Error("No bookingId");
      const res = await fetch(`/api/bookings/${bookingId}/schedule-preferences`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ slot1: selectedSlots[0], slot2: selectedSlots[1] })
      });
      if (!res.ok) throw new Error("Failed to submit schedule");
      return res.json();
    },
    onSuccess: () => {
      alert("Schedule preferences submitted! Please wait for admin confirmation.");
      window.location.href = "/";  // redirect ke homepage atau dashboard
    },
    onError: (err: any) => {
      alert(err.message);
    }
  });

  // Susun slot menjadi struktur grid (4 hari x 2 sesi)
  const slotsByDay: Record<string, any[]> = { "Mon": [], "Wed": [], "Fri": [], "Sun": [] };
  slotAvailability.forEach((slot: any) => {
    // misal slot.id format "Mon-09:30" atau ada fields day & time
    const [dayLabel] = slot.id.split("-"); 
    if (slotsByDay[dayLabel] !== undefined) {
      slotsByDay[dayLabel].push(slot);
    }
  });

  return (
    <div className="schedule-select">
      <h2>Pilih 2 Jadwal Kelas</h2>
      <div className="slots-grid">
        {Object.entries(slotsByDay).map(([day, slots]) => (
          <div key={day} className="day-group mb-2">
            <h3 className="font-medium">{day}</h3>
            <div className="slot-buttons flex gap-2">
              {slots.map(slot => {
                const isFull = slot.isFull; 
                const isSelected = selectedSlots.includes(slot.id);
                return (
                  <button 
                    key={slot.id}
                    disabled={isFull || (selectedSlots.length >= 2 && !isSelected)} 
                    onClick={() => toggleSlot(slot.id)}
                    className={`px-2 py-1 border rounded 
                      ${isFull ? 'bg-pink-200 cursor-not-allowed' : isSelected ? 'bg-green-500 text-white' : 'bg-green-100'}`
                    }
                  >
                    {slot.label}
                  </button>
                );
              })}
            </div>
          </div>
        ))}
      </div>
      <button 
        onClick={() => submitMutation.mutate()} 
        className="btn-primary mt-4"
        disabled={selectedSlots.length !== 2 || submitMutation.isLoading}
      >
        Submit
      </button>
    </div>
  );
}

```

Penjelasan: - slotAvailability di-fetch dari server, yang mengembalikan array slot dengan info apakah full atau tidak. Misal:

[
  {"id":"Mon-09:30","label":"Senin 09:30","isFull":false},
  {"id":"Mon-13:30","label":"Senin 13:30","isFull":true},
  ...
]

- Kita kelompokkan slot per hari (Mon, Wed, Fri, Sun) untuk tampilan. - Tombol slot: - Disabled jika slot penuh (isFull) atau jika user sudah memilih 2 slot dan mencoba memilih slot ketiga (dibuat logic: jika sudah 2 terpilih dan slot ini belum terpilih => disabled). - ClassName: jika penuh, latar pink; jika dipilih, latar hijau gelap; jika tersedia, hijau muda. - toggleSlot mengatur array selectedSlots max 2 items. - Tombol Submit memanggil /api/bookings/{id}/schedule-preferences mengirim dua slot terpilih. (Pastikan hanya terpanggil jika 2 slot). - Setelah submit sukses, kita beri alert dan redirect atau memberi tahu user untuk menunggu approval admin.

Implementasi Backend (Simpan Pilihan Jadwal):

Tambahkan route:

```tsx

app.post("/api/bookings/:id/schedule-preferences", authMiddleware, async (req, res) => {
  try {
    const bookingId = req.params.id;
    const userId = req.session.userId;
    const { slot1, slot2 } = req.body;
    // Pastikan booking milik user dan status = paid (telah bayar, menunggu jadwal)
    const booking = await storage.getBooking(bookingId);
    if (!booking || booking.userId !== userId) {
      return res.status(403).json({ error: "Unauthorized or invalid booking" });
    }
    if (booking.status !== "paid") {
      return res.status(400).json({ error: "Booking is not awaiting schedule selection" });
    }
    // Update booking dengan pilihan jadwal user
    await storage.updateBooking(bookingId, {
      preferredSlot1: slot1,
      preferredSlot2: slot2,
      status: "waiting_schedule"
    });
    // (Opsional: notifikasi admin bisa dibuat di sini, tapi admin akan melihat di tab approval)
    return res.json({ message: "Schedule preferences saved" });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "Failed to save schedule preferences" });
  }
});

```

Penjelasan: - Cek otorisasi user dan validasi status booking. - Simpan preferredSlot1 dan preferredSlot2 di DB, ubah status jadi waiting_schedule (supaya muncul di Approval tab filter schedule). - Admin akan melihat entry ini di Tab Approval (Schedule). - Tidak perlu notifikasi ke admin di sini karena admin akan memantau tab, namun bisa juga menambah notifikasi jika sistem notifikasi diperluas ke admin (tidak diminta spesifik).

Endpoint Ketersediaan Slot:

Untuk mendukung UI, implementasi GET /api/schedule/availability: - Kita perlu menentukan slot mana yang "penuh". - Definisikan kapasitas kelas per slot (misal kapasitas max N siswa per slot). Ini bisa di-hardcode (misal 5 siswa per slot) atau disimpan di database. - Hitung jumlah siswa yang sudah terjadwal di tiap slot: - Jika kita sudah memiliki data booking dengan jadwal final (slot final), atau bisa sementara gunakan juga yang waiting_schedule/ scheduled untuk hitung occupancy. - Misal, hitung semua booking yang slot pilihannya termasuk slot tersebut dan sudah diapprove jadwalnya (status scheduled) atau sedang menunggu (kalau kita mau menandai full walaupun belum final? Mungkin tidak, full seharusnya dihitung dari konfirmasi). - Atau definisikan terpisah: kelas dianggap penuh jika sudah kumulatif ada N siswa yang memilih slot itu (dan disetujui admin). - Untuk awal, kita bisa asumsikan kapasitas misal 5 per slot. - Query bookings yang status scheduled (atau active) group by slot: - Jika kita assign final slot, misal kita menetapkan slot final ke scheduledDate1/2 di DB, tapi di code kita belum. Simpler: mark slot as full jika ada >=5 bookings scheduled yang mencantumkan slot tsb. - Karena kita belum simpan slot final, kita bisa gunakan preferredSlot untuk indikasi. Tapi preferredSlot milik user masih bisa bentrok. Sebenarnya full seharusnya dihitung saat admin menyetujui schedule (pada saat itu admin tahu slot mana yang diisi). - Mungkin pendekatan: - Ketika admin approve schedule, admin seharusnya menandai slot-slot tersebut terisi oleh user ini. - Jika admin memasukkan data ke calendar (nanti dijelaskan), maka availability bisa dihitung dari data calendar (class sessions). - Namun, untuk kesederhanaan, kita bisa menandai full berdasarkan jumlah scheduled bookings yang punya slot tertentu.

Sebagai ilustrasi mudah:

```tsx

app.get("/api/schedule/availability", adminOnly /* atau authMiddleware (bisa keduanya) */, async (req, res) => {
  try {
    const slots = [
      "Mon-09:30", "Mon-13:30",
      "Wed-09:30", "Wed-13:30",
      "Fri-09:30", "Fri-13:30",
      "Sun-09:30", "Sun-13:30"
    ];
    const capacity = 5;
    // Ambil semua booking status 'scheduled' (sudah dijadwalkan) 
    const scheduledBookings = await storage.getBookingsByStatus("scheduled");
    // Hitung jumlah per slot (asumsikan kita simpan final slots in booking as well for simplicity, 
    // misal kita akhirnya simpan final slot di col scheduledSlot1/2).
    const slotCount: Record<string, number> = {};
    for (const slot of slots) slotCount[slot] = 0;
    for (const b of scheduledBookings) {
      if (b.preferredSlot1 && slotCount[b.preferredSlot1] !== undefined) slotCount[b.preferredSlot1] += 1;
      if (b.preferredSlot2 && slotCount[b.preferredSlot2] !== undefined) slotCount[b.preferredSlot2] += 1;
    }
    // Bentuk response
    const result = slots.map(slot => ({
      id: slot,
      label: formatSlotLabel(slot), // misal "Senin 09:30"
      isFull: slotCount[slot] >= capacity
    }));
    return res.json(result);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "Failed to get availability" });
  }
});

```

Catatan: Fungsi formatSlotLabel bisa mapping "Mon"->"Senin", dsb, dan jam.

Kode di atas sangat simplifikasi: - Menganggap slot "full" jika dalam booking yang sudah dijadwalkan (status scheduled) ada >=5 murid di slot itu. - Ini tidak sempurna, karena misal kelas yang sedang menunggu schedule (belum scheduled) tidak dihitung. Namun, sebaiknya memang dihitung hanya confirmed. Admin seharusnya tidak meng-approve dua murid ke slot yang sama melebihi kapasitas. - Jadi approach ini workable: slot penuh ditentukan dari data kelas terkonfirmasi. - Kita memerlukan adminOnly atau authMiddleware karena data ini sensitif (tapi user juga perlu tahu slot mana penuh, jadi bisa saja allow authMiddleware agar user login bisa fetch. Tidak masalah user tahu slot mana penuh).

Setelah user submit dua slot, admin nanti approve jadwal, memicu update kalender.

## 9. Tab Jadwal Kelas (Calendar View untuk Admin)

Tab Jadwal Kelas menampilkan kalender kelas secara keseluruhan dengan kode warna: - Merah: tanggal di mana slot kelas sudah penuh semua. - Hijau: tanggal di mana ada kelas terisi tapi belum penuh (masih ada slot). - Abu-abu: tidak ada jadwal kelas pada tanggal tersebut.

Ketika admin mengklik suatu tanggal, akan muncul popup/modal menampilkan detail kelas pada tanggal itu: daftar murid dan pengajar untuk setiap sesi waktu.

Implementasi Frontend (ScheduleTab Component):

Untuk menampilkan kalender, ada dua pendekatan: 1. Menggunakan library: seperti FullCalendar (React) untuk kalender interaktif. Ini mempermudah event management dan tampilan modern. 2. Manual: membangun grid kalender secara manual.

Agar panduan tetap fokus, kita jelaskan konsep implementasi manual sederhana: - Tentukan bulan yang ditampilkan (misal bulan ini). Dapat menambahkan navigasi bulan sebelumnya/berikutnya jika perlu. - Ambil data jadwal kelas (events) dari server: - Endpoint misal GET /api/admin/schedule-events?month=... yang mengembalikan list kelas terjadwal (sudah confirmed) dalam rentang bulan itu. Tiap item mencakup: tanggal, slot waktu, course, nama pengajar, daftar murid. - Proses data untuk mengetahui status tiap tanggal: - Buat mapping tanggal -> list kelas. - Untuk setiap tanggal dalam bulan: - Jika tidak ada kelas (tidak ada entry), tandai abu-abu. - Jika ada kelas: - Cek apakah semua slot yang ada hari itu penuh: - Misal per hari bisa ada dua slot (pagi & siang). Jika dua-duanya ada kelas dan keduanya kapasitas penuh, tanggal = merah. - Jika ada kelas tapi setidaknya salah satu slot belum penuh, tanggal = hijau. - Note: Jika satu slot tidak diadakan sama sekali (tidak ada kelas terjadwal di slot tersebut), apakah dihitung abu-abu atau hijau? Kemungkinan: "tidak ada jadwal" merujuk ke hari tanpa kelas sama sekali. Jadi: - Abu-abu: hari itu seharusnya ada slot kelas (Mon, Wed, Fri, Sun) tapi ternyata kosong (tidak ada kelas dijadwalkan), atau hari di luar itu. - Untuk kesederhanaan: Warna: - Abu-abu untuk hari yang bukan Mon/Wed/Fri/Sun (memang tidak ada kelas terjadwal rutin) atau hari yang seharusnya ada kelas tapi sedang tidak ada yang dijadwalkan. - Hijau jika ada kelas tapi belum mencapai kapasitas pada salah satu slot. - Merah jika semua slot yang ada terisi penuh.

Tampilkan grid kalender:

7 kolom (Senin s.d. Minggu).

5-6 baris sesuai minggu dalam bulan.

Setiap sel menampilkan tanggal (angka) dengan background sesuai status:

Merah (misal class bg-red-300),

Hijau (bg-green-300),

Abu-abu (bg-gray-200).

Bisa gunakan Tailwind utility untuk warna latar.

Ketika cell diklik:

Jika ada kelas (hijau/merah), buka modal berisi detail:

Tanggal tersebut, dan untuk tiap slot (pagi/siang) yang ada:

Waktu, Course, Pengajar, Murid-murid.

Gunakan komponen modal (Radix Dialog atau custom).

Jika tidak ada kelas (abu-abu), bisa tidak ada aksi atau mungkin opsi menambah kelas manual (tidak dalam scope sekarang).

Contoh (pseudo-code) komponen ScheduleTab:

```tsx

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";

function ScheduleTab() {
  const [currentDate, setCurrentDate] = useState(new Date());  // bulan saat ini
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth(); // 0-based
  // Ambil events jadwal untuk bulan (year, month)
  const { data: events = [] } = useQuery(['scheduleEvents', year, month], async () => {
    const res = await fetch(`/api/admin/schedule-events?year=${year}&month=${month+1}`);
    return res.ok ? res.json() : [];
  });

  // Struktur events: [{ date: '2025-01-07', classes: [ { time: '09:30', course: 'Makeup', teacher: 'Ibu A', students: ['X','Y'], isFull: false }, ... ] }, ...]

  // Buat map tanggal -> classes
  const eventsByDate: Record<string, any[]> = {};
  events.forEach((day: any) => {
    eventsByDate[day.date] = day.classes;
  });

  // Generate kalender bulan
  const firstDayOfMonth = new Date(year, month, 1);
  const startDayOfWeek = firstDayOfMonth.getDay(); // 0=Sunday, 1=Monday,... 
  const daysInMonth = new Date(year, month+1, 0).getDate();

  // Kalender mulai dari Senin (asumsi Monday = 1)
  // Hitung offset jika ingin mulai Senin (jika Sunday=0, kita perlu offset)
  const offset = (startDayOfWeek === 0 ? 6 : startDayOfWeek - 1); // jarak dari Senin
  const totalCells = Math.ceil((offset + daysInMonth) / 7) * 7;
  const dates: (Date|null)[] = [];
  for (let i = 0; i < totalCells; i++) {
    const dateNum = i - offset + 1;
    if (dateNum < 1 || dateNum > daysInMonth) {
      dates.push(null);
    } else {
      dates.push(new Date(year, month, dateNum));
    }
  }

  const getDayColor = (date: Date): string => {
    const dateStr = date.toISOString().slice(0, 10); // format YYYY-MM-DD
    const classes = eventsByDate[dateStr];
    const dayName = date.toLocaleDateString('en-US', { weekday: 'short' }); // e.g., Mon, Tue
    // Tentukan warna
    if (!classes || classes.length === 0) {
      // Tidak ada kelas terjadwal pada hari tsb
      // Jika hari bukan salah satu dari jadwal rutin (Mon, Wed, Fri, Sun), tetap abu2
      return "bg-gray-200";
    } else {
      // Ada minimal 1 class
      const allFull = classes.every(c => c.isFull);
      return allFull ? "bg-red-300" : "bg-green-300";
    }
  };

  return (
    <div>
      <h2 className="text-lg font-semibold mb-2">Jadwal Kelas - {currentDate.toLocaleDateString('id-ID', { month: 'long', year: 'numeric'})}</h2>
      {/* (Opsional) Tombol navigasi bulan prev/next */}
      <div className="calendar-grid grid grid-cols-7 gap-1 text-center text-sm">
        {/* Header hari Senin-Minggu */}
        {["Sen","Sel","Rab","Kam","Jum","Sab","Min"].map(d => <div key={d} className="font-medium">{d}</div>)}
        {dates.map((date, idx) => (
          <div 
            key={idx} 
            className={`h-16 border ${date ? getDayColor(date) : ''}`} 
            onClick={() => date && eventsByDate[date.toISOString().slice(0,10)] ? setSelectedDate(date) : null}
          >
            {date && <div className="date-num">{date.getDate()}</div>}
          </div>
        ))}
      </div>

      {/* Modal detail jadwal */}
      {selectedDate && (
        <div className="modal-backdrop">
          <div className="modal">
            <h3 className="text-md font-bold mb-2">Detail Kelas - {selectedDate.toLocaleDateString('id-ID')}</h3>
            {(() => {
              const dateStr = selectedDate.toISOString().slice(0,10);
              const classes = eventsByDate[dateStr] || [];
              return classes.map(cls => (
                <div key={cls.time} className="mb-3 p-2 border-b">
                  <p><strong>{cls.time}</strong> - {cls.course} (Pengajar: {cls.teacher})</p>
                  <p>Murid: {cls.students.join(", ")}</p>
                </div>
              ));
            })()}
            <button onClick={() => setSelectedDate(null)} className="btn">Close</button>
          </div>
        </div>
      )}
    </div>
  );
}

```

Penjelasan: - dates array mewakili grid kalender dengan penempatan tanggal pada posisi yang tepat (dengan null untuk leading/trailing days). - getDayColor menentukan warna background cell: - Abu-abu jika tidak ada kelas (classes undefined atau empty). - Merah jika semua kelas di hari itu penuh. - Hijau jika ada kelas dan setidaknya satu belum penuh. - onClick cell: jika cell ada tanggal dan eventsByDate[date] ada (meaning at least one class scheduled), maka set modal open. - Modal detail: ambil classes dari eventsByDate[selectedDate] dan tampilkan masing-masing.

Implementasi Backend (Schedule Events Endpoint):

Endpoint GET /api/admin/schedule-events?year=YYYY&month=MM: - Query database untuk bookings berstatus scheduled (kelas terkonfirmasi) dalam rentang bulan tersebut. - Output per tanggal: - date (YYYY-MM-DD), - classes: array of classes on that date, each with: - time: e.g. "09:30", - course: type of class, - teacher: name, - students: list of student names, - isFull: boolean if class capacity reached. - Ini membutuhkan join antara bookings dan users, serta teacher: - Jika kita pakai scheduledDate1 dan scheduledDate2 fields di DB: - Jika suatu booking punya 2 sesi, berarti akan muncul di dua tanggal. - Kita bisa memecah menjadi dua event (per date per slot). - Namun, kita belum menulis bagaimana admin menetapkan scheduledDate1/2. Mungkin bisa di-otomatis, tapi mari asumsikan: - Saat admin approve schedule, sistem mengambil slot (day/time) yang dipilih murid dan langsung menentukan tanggal terdekat (untuk simplicity). - Misal user pilih "Mon-09:30" dan "Wed-09:30" pada request. Admin approve pada 1 Jan 2025, maka: - scheduledDate1 = tanggal Senin terdekat (misal 5 Jan 2025) jam 09:30, - scheduledDate2 = Rabu terdekat (7 Jan 2025) jam 09:30, - teacherId ditentukan (misal setiap slot punya teacher tetap, atau admin input). - Lalu booking status = scheduled. - Data inilah yang digunakan di calendar. - Implementasi penentuan tanggal tidak dijelaskan detail, tapi asumsikan storage.updateBooking waktu approve schedule mengisi scheduledDate1/2. - Juga assign teacher, bisa misal: pilih teacher acak atau sesuai slot (Anda bisa bikin aturan misal: Senin&Rabu: Teacher A, Jumat&Minggu: Teacher B).

Query:

SELECT bookings where status='scheduled' and (scheduledDate1 or scheduledDate2 in that month).

For each such booking, produce one or two class events:

Example: booking with scheduledDate1 = 2025-01-05 09:30, scheduledDate2 = 2025-01-07 09:30.

That yields:

date '2025-01-05', time '09:30', course, teacher, student name(s).

date '2025-01-07', time '09:30', same course/teacher maybe or could be different teacher if one teacher per session? But likely same course's teacher.

If multiple bookings share same date/time (group class), ideally they have same teacher.

We can group by date+time:

e.g. if 3 bookings all have scheduledDate1 = 5 Jan 09:30 (meaning 3 students in class Monday morning that date), and teacherId same, we should produce one class event on 5 Jan 09:30 with 3 students (instead of listing 3 separate events).

Jadi, perlu agregasi: Group bookings by scheduledDate+time+teacher.

Ambil course (should be same if they are in same class).

Combine student names array.

Check count vs capacity for isFull.

Dengan Drizzle, kita bisa fetch raw and group di JS:

Query all scheduled bookings join users and teacher (for names).

Then group by date+time (two passes if needed).

Pseudo-code server:

```tsx

app.get("/api/admin/schedule-events", adminOnly, async (req, res) => {
  const year = parseInt(req.query.year);
  const month = parseInt(req.query.month);
  if (!year || !month) {
    return res.status(400).json({ error: "year and month required" });
  }
  try {
    const startDate = new Date(year, month - 1, 1);
    const endDate = new Date(year, month, 0); // last day of month
    // Fetch all bookings scheduled in this month
    const bookings = await storage.getBookingsInRange(startDate, endDate);
    // bookings including user name & teacher name
    // storage.getBookingsInRange bisa implement pakai db.select... join

    // Group by date+time
    const eventsMap: Record<string, {time: string, course: string, teacher: string, students: string[], isFull: boolean}[]> = {};
    const capacity = 5;
    for (const b of bookings) {
      // check scheduledDate1 and scheduledDate2
      const sessions = [];
      if (b.scheduledDate1) sessions.push({ date: b.scheduledDate1, time: b.scheduledTime1, ... });
      if (b.scheduledDate2) sessions.push({ date: b.scheduledDate2, time: b.scheduledTime2, ... });
      sessions.forEach(sess => {
        const dateStr = sess.date.toISOString().slice(0,10);
        const key = dateStr + "|" + sess.time;
        if (!eventsMap[dateStr]) eventsMap[dateStr] = [];
        let event = eventsMap[dateStr].find(ev => ev.time === sess.time);
        if (!event) {
          event = { time: sess.time, course: b.classType, teacher: b.teacherName, students: [], isFull: false };
          eventsMap[dateStr].push(event);
        }
        event.students.push(b.userName);
        // ensure teacher and course are consistent or could override if needed
      });
    }
    // Determine isFull for each event
    for (const dateStr in eventsMap) {
      eventsMap[dateStr].forEach(ev => {
        if (ev.students.length >= capacity) {
          ev.isFull = true;
        }
      });
    }
    // Convert map to array
    const responseData = Object.entries(eventsMap).map(([date, classes]) => ({
      date, classes
    }));
    return res.json(responseData);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "Failed to fetch schedule events" });
  }
});

```

Catatan: - Kita mengandaikan storage.getBookingsInRange mengembalikan bookings dengan fields: userName, classType, teacherName, scheduledDate1, scheduledTime1, etc. Mungkin kita simpan time terpisah atau bisa simpan DateTime full. Simpan jam bisa dari slot info. Tergantung implementasi, tapi di schedule events perlu time string.

Penggunaan teacherName: join dengan tabel teachers (kalau ada). Jika teacher di user, join user dengan role teacher. Simplifikasi: teacherName bisa disimpan langsung di bookings saat assign (tidak ideal, tapi cepat). Lebih baik join.

Warna merah/hijau:

Merah jika ev.isFull === true untuk semua events di hari itu.

Hijau jika at least one event isFull === false.

Abu-abu jika eventsMap[date] tidak ada.

Kode front getDayColor di atas menggunakan classes.every(c => c.isFull) untuk menentukan merah/hijau.

Dengan implementasi ini, Admin Tab Jadwal akan menampilkan kalender dengan warna sesuai occupancy, dan bisa melihat detail siapa dan guru mana di kelas tersebut.

## 10. Tab Murid di Admin

Tab Murid menampilkan daftar murid (siswa) beserta informasi kontak dan status pendaftaran mereka. Kolom yang diminta: - Nama Murid - Email - No HP - Status: Aktif, Belum Bayar, Menunggu Approval

Definisi status: - Belum Bayar: Murid sudah registrasi kelas tetapi belum menyelesaikan pembayaran (booking status pending_payment). Termasuk jika pembayaran ditolak, bisa dianggap belum bayar lagi. - Menunggu Approval: Murid sudah upload bukti dan menunggu admin menyetujui (booking status waiting_approval). - Aktif: Murid sudah menyelesaikan pembayaran (disetujui) – dengan kata lain status booking paid atau sudah dijadwalkan (waiting_schedule atau scheduled). Kita anggap murid "aktif" setelah pembayaran diterima meskipun jadwal mungkin belum final. - Setelah admin approve pembayaran, user masuk kategori aktif meski masih menunggu jadwal. - Kita bisa memperlakukan waiting_schedule dan scheduled keduanya sebagai "Aktif".

Untuk menampilkan data ini: - Dapatkan list semua user yang perannya murid (non-admin, non-teacher). - Untuk setiap user, tentukan status terbarunya: - Jika user tidak punya booking sama sekali, bisa tidak ditampilkan atau tampil dengan status "N/A" (atau skip karena bukan murid aktif). - Jika user punya booking, kemungkinan satu booking aktif. Jika punya beberapa, mungkin pilih yang terbaru atau status tertinggi (misal kalau ada booking lama selesai dan booking baru pending, mana yang dipilih? Untuk scope sederhana, asumsikan satu booking per user pada satu waktu). - Bisa query terakhir/terbaru booking user atau booking dengan status tidak completed. - Bisa juga lakukan dengan join langsung: - SELECT dari users (where isAdmin false) left join bookings (mungkin subquery memilih booking terbaru). - Atau fetch users and then assign status in logic.

Perlu juga No HP: - Pastikan kolom phone sudah ditambahkan di tabel users (tidak ada di original schema[6]). Tambahkan:

phone: text("phone")

dan modifikasi form sign-up agar meminta no HP jika diinginkan. Jika data no HP tidak ada, bisa diisi null atau kosong, tapi di tabel murid lebih baik ada. Kita asumsikan sudah ditambahkan atau minimal diisi nanti via admin.

Implementasi Frontend (StudentsTab Component):

Gunakan useQuery untuk fetch data murid:

Endpoint /api/admin/students mengembalikan array murid dengan field: name, email, phone, status.

Tampilkan dalam tabel.

Contoh StudentsTab:

```tsx

function StudentsTab() {
  const { data: students = [] } = useQuery(['students'], async () => {
    const res = await fetch('/api/admin/students');
    return res.ok ? res.json() : [];
  });

  return (
    <div>
      <table className="w-full text-sm">
        <thead>
          <tr><th>Nama</th><th>Email</th><th>No HP</th><th>Status</th></tr>
        </thead>
        <tbody>
          {students.map((stu: any) => (
            <tr key={stu.userId}>
              <td>{stu.name}</td>
              <td>{stu.email}</td>
              <td>{stu.phone || '-'}</td>
              <td>
                {stu.status === 'pending_payment' && 'Belum Bayar'}
                {stu.status === 'waiting_approval' && 'Menunggu Approval'}
                {(stu.status === 'paid' || stu.status === 'waiting_schedule' || stu.status === 'scheduled') && 'Aktif'}
                {stu.status === 'payment_rejected' && 'Menunggu Pembayaran'} 
                {/* misal status reject disamakan dg belum bayar */}
              </td>
            </tr>
          ))}
          {students.length === 0 && (
            <tr><td colSpan={4} className="text-center py-2">No student data</td></tr>
          )}
        </tbody>
      </table>
    </div>
  );
}

```

Penjelasan: - Data students diasumsikan sudah sorted atau aggregated per user. - Kita mapping status code ke label: - pending_payment -> Belum Bayar - waiting_approval -> Menunggu Approval - paid / waiting_schedule / scheduled -> Aktif (semua dianggap aktif karena sudah bayar) - (Jika ada status payment_rejected, kita bisa tampilkan sebagai "Menunggu Pembayaran" atau digabung ke "Belum Bayar". Di atas, kita contohkan ditampilkan sebagai 'Menunggu Pembayaran' agar admin tahu pernah ditolak). - No HP jika tidak tersedia ditampilkan -.

Implementasi Backend (Students Endpoint):

Endpoint GET /api/admin/students: - Ambil semua user (kecuali admin, dan kecuali mungkin teacher jika dicampur di user). - Untuk tiap user, tentukan status terbaru: - Bisa dengan subquery atau join: - misal SELECT user., booking.status FROM users LEFT JOIN bookings ON bookings.user_id = users.id AND (some condition to pick the relevant booking). - Condition bisa: booking.status in (pending_payment, waiting_approval, waiting_schedule, scheduled, paid) (tidak termasuk kalau booking sudah selesai, tapi belum ada definisi selesai. Jika ada, exclude completed). - Juga bisa pilih booking dengan prioritas: if any waiting_approval then that's status, else if waiting_schedule then active, etc. Simpler: pilih booking dengan status order by* severity. - Atau ambil booking dengan max createdAt if multiple (assuming the latest attempt). - Atau hitung manual: - Ambil bookings per user di code, pilih yang status bukan completed dan terbaru.

Untuk pendekatan mudah: - Query users (role = user), lalu dalam code: - For each user, find booking: - const booking = await storage.getLatestBooking(user.id). - getLatestBooking bisa: select from bookings where userId = id and status != 'completed' order by createdAt desc limit 1. - Determine status = booking?.status or null. - Build array of { userId, name, email, phone, status }.

Atau lakukan dalam SQL dengan subselect: - One approach:

SELECT u.id as userId, u.name, u.email, u.phone,
       COALESCE(b.status, 'no_booking') as status
FROM users u
LEFT JOIN LATERAL (
    SELECT status 
    FROM bookings 
    WHERE bookings.user_id = u.id AND bookings.status != 'completed'
    ORDER BY created_at DESC
    LIMIT 1
) b ON true
WHERE u.is_admin = false;

Ini mengembalikan status terbaru (atau null if none).

Atau lakukan 2 queries: - get all users (non-admin), - get all bookings (non-completed) grouped or sorted by user, - then merge.

Setelah dapat data, kirim sebagai JSON array.

Tambahan: - Jika user belum pernah booking (no_booking), mungkin tidak perlu ditampilkan, atau bisa ditampilkan dengan status "Tidak ada" atau skip. - Spek tidak menyebut menampilkan user yang belum daftar kelas. Mungkin yang diinginkan adalah daftar "murid" = mereka yang sudah mendaftar (sedang dalam proses atau aktif). - Jadi kita bisa filter hanya user yang memiliki booking. - Namun disebut "Tab Murid", kemungkinan admin ingin melihat semua akun murid, bahkan yang baru mendaftar tapi belum daftar kelas pun? Hard to guess. - Tetapi karena status definisi semua terkait pembayaran, kemungkinan list ini memang untuk yang punya pendaftaran kelas. - Maka kita bisa filter out those with no booking.

Asumsi: hanya tampilkan user yang punya minimal 1 booking (dalam proses/aktif). Implementasi: Query hanya users yang ada di tabel bookings (JOIN bookings).

Misal:

SELECT DISTINCT u.id, u.name, u.email, u.phone,
       CASE 
         WHEN b.status = 'pending_payment' THEN 'pending_payment'
         WHEN b.status = 'waiting_approval' THEN 'waiting_approval'
         WHEN b.status IN ('paid','waiting_schedule','scheduled') THEN 'active'
       END as status
FROM users u
JOIN bookings b ON b.user_id = u.id
WHERE u.is_admin = false;

Namun jika multiple bookings, join tanpa GROUP akan duplikat. DISTINCT menggabungkan tapi data status jadi tidak tentu.

Lebih baik ambil latest per user: Seperti subquery di atas atau user->booking mapping.

Given complexity, code approach is fine.

Pseudo-code server:

```tsx

app.get("/api/admin/students", adminOnly, async (req, res) => {
  try {
    const users = await storage.getAllUsers(); // excluding admin
    const result = [];
    for (const u of users) {
      if (u.isAdmin) continue;
      // skip teacher accounts if any
      if (u.role && u.role !== 'user') continue;
      const booking = await storage.getLatestBooking(u.id);
      if (!booking) {
        continue; // user belum pernah booking, skip agar hanya yg terkait kelas
      }
      let status = booking.status;
      // Map status if needed (or do mapping on client as done)
      result.push({
        userId: u.id,
        name: u.name,
        email: u.email,
        phone: u.phone,
        status
      });
    }
    return res.json(result);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "Failed to fetch students" });
  }
});

```

Fungsi getLatestBooking(userId) di storage kira-kira:

async getLatestBooking(userId: string): Promise<Booking | undefined> {
  return await db.select().from(bookings)
    .where(eq(bookings.userId, userId))
    .orderBy(desc(bookings.createdAt))
    .limit(1);
}

It will return the most recent booking.

Catatan: - Kriteria status != completed jika ada konsep completed, namun karena belum ada implementasi selesai (kursus selesai mungkin ditandai selesai di history), kita asumsikan sepanjang belum ada, semua booking dianggap aktif sampai mana pun, tidak perlu exclude. Jika pun kursus selesai, mungkin ditandai scheduled vs completed (tidak disebut). Untuk lingkup ini skip.

Memperhatikan "Menunggu approval" hanya terkait pembayaran approval (bukan jadwal). Jadi di logic:

waiting_approval -> Menunggu Approval (pembayaran)

waiting_schedule -> kita masukkan ke Active.

scheduled -> Active.

payment_rejected -> treat as pending_payment for display? Atau bisa distinct "Belum Bayar" (karena intinya belum ada pembayaran valid).

Kita bisa map di front seperti sudah dilakukan atau di server map ke 'pending_payment' if rejected.

Pastikan kolom phone ada. Jika belum, admin harus input phone di DB langsung, atau user profile. Mungkin sign-up extended.

Menambah Field No HP di Sign-up: Jika ingin lengkap, modifikasi form signup untuk input phone: - Update insertUserSchema Drizzle dan Zod untuk include phone (optional/required). - Save phone in storage.createUser. - Then user phone akan tampil di list.

Jika tidak, admin mungkin memasukkan manual di database.

Bagian ini mungkin tidak perlu detail di panduan, cukup memastikan phone ada di DB dan tampil.

Dengan seluruh langkah di atas, kita telah: - Menghilangkan elemen user sebelum login (Hello, Test User & My Classes). - Menggunakan mekanisme signup dengan email verifikasi via Brevo SMTP sesuai .env. - Menyesuaikan tombol "Our Signature Courses" sebelum/sesudah login. - Membangun flow checkout dengan pilihan bank, timer, dan notifikasi upload bukti. - Menyediakan form upload bukti pembayaran dan mengirim notifikasi ke admin (melalui data di Approval tab). - Membuat Admin Dashboard dengan proteksi akses hanya super admin[17]. - Tab Approval untuk approve pembayaran dan jadwal dengan filter. - Flow pemilihan jadwal oleh murid setelah pembayaran (beserta UI warna). - Tab Jadwal Kelas berupa kalender berwarna dengan detail pada klik. - Tab Murid menampilkan tabel murid dengan status (aktif/belum bayar/menunggu approval).

Semua perubahan di atas mengikuti struktur proyek JBS yang ada, menggunakan React + TS di frontend dan Express + Drizzle di backend. Pastikan untuk menguji setiap alur secara terpadu: 1. Registrasi & verifikasi email. 2. Login sebagai murid, pilih kursus, checkout (pending). 3. Cek notifikasi bell untuk upload bukti, upload. 4. Login sebagai admin, cek tab Approval (Pembayaran), approve pembayaran. 5. Login kembali sebagai murid (atau tetap login), dapat notifikasi pilih jadwal, pilih dua jadwal. 6. Admin cek tab Approval (Schedule), approve jadwal. 7. Lihat tab Jadwal Kelas untuk memastikan kelas muncul, dan tab Murid untuk status murid menjadi aktif. 8. Pastikan notifikasi telah dikirim sesuai setiap tahap (bisa cek manual tabel notifikasi atau implement notifikasi admin jika perlu).

Dengan demikian, panduan ini diharapkan dapat membantu dalam implementasi step-by-step modifikasi sistem Jakarta Beauty School sesuai kebutuhan yang diuraikan. Semua kode di atas perlu disesuaikan dan diuji dalam kode basis proyek sebenarnya, tetapi memberikan gambaran rinci mengenai apa yang harus dilakukan. Good luck!

[1] [2] [3] [4] [5] [6] [7] [8] [9] [10] [11] [12] [13] [14] [15] [16] [17] DOCUMENTATION.md

file://file_000000004a1c720694f87f44eb74fa7b
