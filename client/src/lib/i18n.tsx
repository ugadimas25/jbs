import { createContext, useContext, useState, useEffect, ReactNode } from "react";

type Language = "id" | "en";

interface I18nContextType {
  lang: Language;
  setLang: (lang: Language) => void;
  t: (key: string) => string;
}

const translations: Record<Language, Record<string, string>> = {
  id: {
    // Navigation
    "nav.home": "Beranda",
    "nav.booking": "Booking",
    "nav.myClasses": "Kelas Saya",
    "nav.admin": "Admin",
    "nav.login": "Masuk",
    "nav.logout": "Keluar",
    
    // Home Page
    "home.hero.title": "Raih Impian Karir Kecantikanmu",
    "home.hero.subtitle": "Bergabunglah dengan akademi kecantikan terkemuka di Indonesia. Kelas makeup profesional, perawatan kulit, dan banyak lagi.",
    "home.hero.cta": "Mulai Perjalananmu",
    "home.hero.exploreCourses": "Lihat Kursus",
    
    "home.features.title": "Kenapa Memilih Kami",
    "home.features.subtitle": "Kami menyediakan pendidikan kecantikan terbaik dengan fasilitas modern dan instruktur berpengalaman",
    "home.features.expert.title": "Instruktur Ahli",
    "home.features.expert.desc": "Belajar dari profesional industri dengan pengalaman bertahun-tahun di bidang makeup, skincare, dan spa.",
    "home.features.certificate.title": "Sertifikat Resmi",
    "home.features.certificate.desc": "Terima sertifikat terakreditasi setelah menyelesaikan kursus untuk meningkatkan prospek karir Anda.",
    "home.features.flexible.title": "Jadwal Fleksibel",
    "home.features.flexible.desc": "Pilih jadwal kelas yang sesuai dengan rutinitas Anda. Tersedia kelas pagi, siang, dan malam.",
    "home.features.practice.title": "Praktik Langsung",
    "home.features.practice.desc": "Dapatkan pengalaman praktik langsung dengan peralatan dan produk profesional.",
    
    "home.courses.title": "Kursus Populer Kami",
    "home.courses.subtitle": "Temukan berbagai kursus kecantikan yang dirancang untuk mengembangkan keterampilan dan karir Anda",
    "home.courses.viewAll": "Lihat Semua Kursus",
    "home.courses.learnMore": "Pelajari Lebih Lanjut",
    "home.courses.bookNow": "Booking Sekarang",
    "home.courses.sessions": "sesi",
    "home.courses.hours": "jam",
    
    "home.gallery.title": "Galeri Kegiatan",
    "home.gallery.subtitle": "Lihat momen-momen berharga dari kegiatan belajar mengajar di Jakarta Beauty School",
    
    "home.cta.title": "Siap Memulai Perjalanan Kecantikanmu?",
    "home.cta.subtitle": "Bergabunglah dengan ribuan siswa sukses yang telah mengubah passion mereka menjadi karir.",
    "home.cta.button": "Daftar Sekarang",
    
    "home.contact.title": "Hubungi Kami",
    "home.contact.subtitle": "Ada pertanyaan? Tim kami siap membantu Anda",
    "home.contact.address": "Alamat",
    "home.contact.phone": "Telepon",
    "home.contact.email": "Email",
    "home.contact.hours": "Jam Operasional",
    "home.contact.hoursValue": "Senin - Sabtu: 09:00 - 18:00",
    
    // Auth Page
    "auth.signup": "Daftar",
    "auth.login": "Masuk",
    "auth.createAccount": "Buat Akun",
    "auth.createAccountDesc": "Mulai perjalananmu bersama kami hari ini.",
    "auth.welcomeBack": "Selamat Datang Kembali",
    "auth.welcomeBackDesc": "Masuk untuk mengatur booking Anda.",
    "auth.fullName": "Nama Lengkap",
    "auth.email": "Email",
    "auth.phone": "Nomor Telepon (Opsional)",
    "auth.password": "Password",
    "auth.confirmPassword": "Konfirmasi Password",
    "auth.creatingAccount": "Membuat akun...",
    "auth.loggingIn": "Masuk...",
    "auth.forgotPassword": "Lupa Password?",
    "auth.tagline": "Bergabunglah dengan komunitas profesional kecantikan kami",
    
    // Forgot Password
    "forgot.title": "Lupa Password?",
    "forgot.subtitle": "Masukkan email Anda dan kami akan mengirimkan link untuk reset password",
    "forgot.success": "Email telah dikirim! Silakan cek inbox Anda (termasuk folder spam) untuk link reset password. Link akan kadaluarsa dalam 1 jam.",
    "forgot.backToLogin": "Kembali ke Login",
    "forgot.sendLink": "Kirim Link Reset",
    "forgot.sending": "Mengirim...",
    
    // Reset Password
    "reset.title": "Reset Password",
    "reset.subtitle": "Masukkan password baru Anda",
    "reset.newPassword": "Password Baru",
    "reset.confirmPassword": "Konfirmasi Password",
    "reset.success": "Password berhasil direset! Anda akan dialihkan ke halaman login...",
    "reset.invalidLink": "Link Tidak Valid",
    "reset.invalidLinkDesc": "Token reset password tidak ditemukan atau tidak valid",
    "reset.invalidLinkError": "Link reset password tidak valid. Silakan request link baru.",
    "reset.requestNew": "Request Link Baru",
    "reset.button": "Reset Password",
    "reset.resetting": "Mereset...",
    "reset.minChars": "Minimal 6 karakter",
    "reset.retypePassword": "Ketik ulang password",
    
    // Booking Page
    "booking.title": "Booking Kursus",
    "booking.subtitle": "Pilih kursus yang ingin Anda ikuti",
    "booking.selectCourse": "Pilih Kursus",
    "booking.selectedCourse": "Kursus Dipilih",
    "booking.duration": "Durasi",
    "booking.price": "Harga",
    "booking.description": "Deskripsi",
    "booking.schedule": "Jadwal Tersedia",
    "booking.selectSchedule": "Pilih Jadwal",
    "booking.notes": "Catatan (Opsional)",
    "booking.notesPlaceholder": "Tulis catatan tambahan jika ada...",
    "booking.submit": "Booking Sekarang",
    "booking.submitting": "Memproses...",
    "booking.loginRequired": "Silakan login terlebih dahulu untuk melakukan booking",
    "booking.success": "Booking berhasil! Silakan lakukan pembayaran.",
    
    // History Page
    "history.title": "Kelas Saya",
    "history.subtitle": "Riwayat booking dan kelas Anda",
    "history.noBookings": "Belum ada booking",
    "history.noBookingsDesc": "Anda belum memiliki booking. Mulai booking kursus sekarang!",
    "history.startBooking": "Mulai Booking",
    "history.status": "Status",
    "history.date": "Tanggal",
    "history.time": "Waktu",
    "history.teacher": "Pengajar",
    "history.uploadProof": "Upload Bukti Bayar",
    "history.viewDetails": "Lihat Detail",
    "history.pending": "Menunggu Pembayaran",
    "history.paid": "Sudah Dibayar",
    "history.confirmed": "Dikonfirmasi",
    "history.completed": "Selesai",
    "history.cancelled": "Dibatalkan",
    
    // Upload Proof
    "upload.title": "Upload Bukti Pembayaran",
    "upload.subtitle": "Upload bukti transfer untuk konfirmasi pembayaran",
    "upload.dragDrop": "Drag & drop gambar atau klik untuk memilih",
    "upload.maxSize": "Maksimal 5MB (JPG, PNG)",
    "upload.submit": "Upload",
    "upload.uploading": "Mengupload...",
    "upload.success": "Bukti pembayaran berhasil diupload!",
    "upload.paymentInfo": "Informasi Pembayaran",
    "upload.bankName": "Nama Bank",
    "upload.accountNumber": "Nomor Rekening",
    "upload.accountName": "Atas Nama",
    "upload.amount": "Jumlah Transfer",
    
    // Admin Dashboard
    "admin.title": "Dashboard Admin",
    "admin.bookings": "Kelola Booking",
    "admin.courses": "Kelola Kursus",
    "admin.teachers": "Kelola Pengajar",
    "admin.users": "Kelola Pengguna",
    "admin.schedules": "Kelola Jadwal",
    "admin.notifications": "Notifikasi",
    "admin.approve": "Setujui",
    "admin.reject": "Tolak",
    "admin.edit": "Edit",
    "admin.delete": "Hapus",
    "admin.add": "Tambah",
    "admin.save": "Simpan",
    "admin.cancel": "Batal",
    "admin.search": "Cari...",
    "admin.filter": "Filter",
    "admin.all": "Semua",
    "admin.noData": "Tidak ada data",
    
    // Course Detail
    "course.about": "Tentang Kursus",
    "course.whatYouLearn": "Yang Akan Anda Pelajari",
    "course.requirements": "Persyaratan",
    "course.instructor": "Instruktur",
    "course.reviews": "Ulasan",
    "course.noReviews": "Belum ada ulasan",
    "course.bookThisCourse": "Booking Kursus Ini",
    
    // Common
    "common.loading": "Memuat...",
    "common.error": "Terjadi kesalahan",
    "common.retry": "Coba Lagi",
    "common.close": "Tutup",
    "common.confirm": "Konfirmasi",
    "common.yes": "Ya",
    "common.no": "Tidak",
    "common.back": "Kembali",
    "common.next": "Selanjutnya",
    "common.previous": "Sebelumnya",
    "common.seeAll": "Lihat Semua",
    "common.readMore": "Baca Selengkapnya",
    
    // Footer
    "footer.rights": "Hak Cipta",
    "footer.privacy": "Kebijakan Privasi",
    "footer.terms": "Syarat & Ketentuan",
    
    // Verify Email
    "verify.title": "Verifikasi Email",
    "verify.checking": "Memverifikasi email Anda...",
    "verify.success": "Email berhasil diverifikasi!",
    "verify.successDesc": "Akun Anda telah aktif. Silakan login untuk melanjutkan.",
    "verify.failed": "Verifikasi Gagal",
    "verify.failedDesc": "Link verifikasi tidak valid atau sudah kadaluarsa.",
    "verify.goToLogin": "Ke Halaman Login",
    
    // Not Found
    "notFound.title": "Halaman Tidak Ditemukan",
    "notFound.desc": "Maaf, halaman yang Anda cari tidak ada.",
    "notFound.backHome": "Kembali ke Beranda",
  },
  en: {
    // Navigation
    "nav.home": "Home",
    "nav.booking": "Booking",
    "nav.myClasses": "My Classes",
    "nav.admin": "Admin",
    "nav.login": "Login",
    "nav.logout": "Logout",
    
    // Home Page
    "home.hero.title": "Achieve Your Beauty Career Dreams",
    "home.hero.subtitle": "Join Indonesia's leading beauty academy. Professional makeup classes, skincare, and more.",
    "home.hero.cta": "Start Your Journey",
    "home.hero.exploreCourses": "Explore Courses",
    
    "home.features.title": "Why Choose Us",
    "home.features.subtitle": "We provide the best beauty education with modern facilities and experienced instructors",
    "home.features.expert.title": "Expert Instructors",
    "home.features.expert.desc": "Learn from industry professionals with years of experience in makeup, skincare, and spa.",
    "home.features.certificate.title": "Official Certificate",
    "home.features.certificate.desc": "Receive accredited certificates upon course completion to enhance your career prospects.",
    "home.features.flexible.title": "Flexible Schedule",
    "home.features.flexible.desc": "Choose class schedules that fit your routine. Morning, afternoon, and evening classes available.",
    "home.features.practice.title": "Hands-on Practice",
    "home.features.practice.desc": "Get hands-on experience with professional equipment and products.",
    
    "home.courses.title": "Our Popular Courses",
    "home.courses.subtitle": "Discover various beauty courses designed to develop your skills and career",
    "home.courses.viewAll": "View All Courses",
    "home.courses.learnMore": "Learn More",
    "home.courses.bookNow": "Book Now",
    "home.courses.sessions": "sessions",
    "home.courses.hours": "hours",
    
    "home.gallery.title": "Activity Gallery",
    "home.gallery.subtitle": "See precious moments from teaching and learning activities at Jakarta Beauty School",
    
    "home.cta.title": "Ready to Start Your Beauty Journey?",
    "home.cta.subtitle": "Join thousands of successful students who have transformed their passion into careers.",
    "home.cta.button": "Register Now",
    
    "home.contact.title": "Contact Us",
    "home.contact.subtitle": "Have questions? Our team is ready to help you",
    "home.contact.address": "Address",
    "home.contact.phone": "Phone",
    "home.contact.email": "Email",
    "home.contact.hours": "Operating Hours",
    "home.contact.hoursValue": "Monday - Saturday: 09:00 - 18:00",
    
    // Auth Page
    "auth.signup": "Sign Up",
    "auth.login": "Login",
    "auth.createAccount": "Create Account",
    "auth.createAccountDesc": "Start your journey with us today.",
    "auth.welcomeBack": "Welcome Back",
    "auth.welcomeBackDesc": "Sign in to manage your bookings.",
    "auth.fullName": "Full Name",
    "auth.email": "Email",
    "auth.phone": "Phone Number (Optional)",
    "auth.password": "Password",
    "auth.confirmPassword": "Confirm Password",
    "auth.creatingAccount": "Creating account...",
    "auth.loggingIn": "Logging in...",
    "auth.forgotPassword": "Forgot Password?",
    "auth.tagline": "Join our community of beauty professionals",
    
    // Forgot Password
    "forgot.title": "Forgot Password?",
    "forgot.subtitle": "Enter your email and we'll send you a link to reset your password",
    "forgot.success": "Email sent! Please check your inbox (including spam folder) for the reset password link. The link will expire in 1 hour.",
    "forgot.backToLogin": "Back to Login",
    "forgot.sendLink": "Send Reset Link",
    "forgot.sending": "Sending...",
    
    // Reset Password
    "reset.title": "Reset Password",
    "reset.subtitle": "Enter your new password",
    "reset.newPassword": "New Password",
    "reset.confirmPassword": "Confirm Password",
    "reset.success": "Password successfully reset! You will be redirected to login page...",
    "reset.invalidLink": "Invalid Link",
    "reset.invalidLinkDesc": "Reset password token not found or invalid",
    "reset.invalidLinkError": "Reset password link is invalid. Please request a new link.",
    "reset.requestNew": "Request New Link",
    "reset.button": "Reset Password",
    "reset.resetting": "Resetting...",
    "reset.minChars": "Minimum 6 characters",
    "reset.retypePassword": "Retype password",
    
    // Booking Page
    "booking.title": "Book a Course",
    "booking.subtitle": "Select the course you want to join",
    "booking.selectCourse": "Select Course",
    "booking.selectedCourse": "Selected Course",
    "booking.duration": "Duration",
    "booking.price": "Price",
    "booking.description": "Description",
    "booking.schedule": "Available Schedule",
    "booking.selectSchedule": "Select Schedule",
    "booking.notes": "Notes (Optional)",
    "booking.notesPlaceholder": "Write additional notes if any...",
    "booking.submit": "Book Now",
    "booking.submitting": "Processing...",
    "booking.loginRequired": "Please login first to make a booking",
    "booking.success": "Booking successful! Please proceed with payment.",
    
    // History Page
    "history.title": "My Classes",
    "history.subtitle": "Your booking and class history",
    "history.noBookings": "No bookings yet",
    "history.noBookingsDesc": "You don't have any bookings. Start booking a course now!",
    "history.startBooking": "Start Booking",
    "history.status": "Status",
    "history.date": "Date",
    "history.time": "Time",
    "history.teacher": "Teacher",
    "history.uploadProof": "Upload Payment Proof",
    "history.viewDetails": "View Details",
    "history.pending": "Pending Payment",
    "history.paid": "Paid",
    "history.confirmed": "Confirmed",
    "history.completed": "Completed",
    "history.cancelled": "Cancelled",
    
    // Upload Proof
    "upload.title": "Upload Payment Proof",
    "upload.subtitle": "Upload transfer proof to confirm payment",
    "upload.dragDrop": "Drag & drop image or click to select",
    "upload.maxSize": "Maximum 5MB (JPG, PNG)",
    "upload.submit": "Upload",
    "upload.uploading": "Uploading...",
    "upload.success": "Payment proof uploaded successfully!",
    "upload.paymentInfo": "Payment Information",
    "upload.bankName": "Bank Name",
    "upload.accountNumber": "Account Number",
    "upload.accountName": "Account Name",
    "upload.amount": "Transfer Amount",
    
    // Admin Dashboard
    "admin.title": "Admin Dashboard",
    "admin.bookings": "Manage Bookings",
    "admin.courses": "Manage Courses",
    "admin.teachers": "Manage Teachers",
    "admin.users": "Manage Users",
    "admin.schedules": "Manage Schedules",
    "admin.notifications": "Notifications",
    "admin.approve": "Approve",
    "admin.reject": "Reject",
    "admin.edit": "Edit",
    "admin.delete": "Delete",
    "admin.add": "Add",
    "admin.save": "Save",
    "admin.cancel": "Cancel",
    "admin.search": "Search...",
    "admin.filter": "Filter",
    "admin.all": "All",
    "admin.noData": "No data",
    
    // Course Detail
    "course.about": "About This Course",
    "course.whatYouLearn": "What You'll Learn",
    "course.requirements": "Requirements",
    "course.instructor": "Instructor",
    "course.reviews": "Reviews",
    "course.noReviews": "No reviews yet",
    "course.bookThisCourse": "Book This Course",
    
    // Common
    "common.loading": "Loading...",
    "common.error": "An error occurred",
    "common.retry": "Retry",
    "common.close": "Close",
    "common.confirm": "Confirm",
    "common.yes": "Yes",
    "common.no": "No",
    "common.back": "Back",
    "common.next": "Next",
    "common.previous": "Previous",
    "common.seeAll": "See All",
    "common.readMore": "Read More",
    
    // Footer
    "footer.rights": "All Rights Reserved",
    "footer.privacy": "Privacy Policy",
    "footer.terms": "Terms & Conditions",
    
    // Verify Email
    "verify.title": "Email Verification",
    "verify.checking": "Verifying your email...",
    "verify.success": "Email successfully verified!",
    "verify.successDesc": "Your account is now active. Please login to continue.",
    "verify.failed": "Verification Failed",
    "verify.failedDesc": "Verification link is invalid or expired.",
    "verify.goToLogin": "Go to Login",
    
    // Not Found
    "notFound.title": "Page Not Found",
    "notFound.desc": "Sorry, the page you're looking for doesn't exist.",
    "notFound.backHome": "Back to Home",
  },
};

const I18nContext = createContext<I18nContextType | undefined>(undefined);

export function I18nProvider({ children }: { children: ReactNode }) {
  const [lang, setLangState] = useState<Language>(() => {
    const saved = localStorage.getItem("lang");
    return (saved as Language) || "id";
  });

  useEffect(() => {
    localStorage.setItem("lang", lang);
    document.documentElement.lang = lang;
  }, [lang]);

  const setLang = (newLang: Language) => {
    setLangState(newLang);
  };

  const t = (key: string): string => {
    return translations[lang][key] || key;
  };

  return (
    <I18nContext.Provider value={{ lang, setLang, t }}>
      {children}
    </I18nContext.Provider>
  );
}

export function useI18n() {
  const context = useContext(I18nContext);
  if (!context) {
    throw new Error("useI18n must be used within I18nProvider");
  }
  return context;
}

export function LanguageSwitcher() {
  const { lang, setLang } = useI18n();

  return (
    <button
      onClick={() => setLang(lang === "id" ? "en" : "id")}
      className="flex items-center gap-1 px-3 py-1.5 text-sm font-medium rounded-md border border-[#fec44f] bg-white hover:bg-[#ffffe5] text-[#662506] transition-colors"
      title={lang === "id" ? "Switch to English" : "Ganti ke Bahasa Indonesia"}
    >
      {lang === "id" ? "EN" : "ID"}
    </button>
  );
}
