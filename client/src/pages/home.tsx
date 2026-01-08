import { Link } from "wouter";
import { motion } from "framer-motion";
import { ArrowRight, Star, CheckCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { CLASS_TYPES } from "@/lib/constants";
import { useAuth } from "@/lib/auth-context";
import { useI18n } from "@/lib/i18n";
import Gallery from "@/components/gallery";

export default function Home() {
  const { isAuthenticated } = useAuth();
  const { t, lang } = useI18n();

  return (
    <div className="flex flex-col gap-20">
      {/* Hero Section */}
      <section className="relative h-[90vh] flex items-center overflow-hidden">
        <div className="absolute inset-0 z-0">
          <video 
            autoPlay 
            loop 
            muted 
            playsInline
            className="w-full h-full object-cover"
          >
            <source src="/luxury_beauty_salon_interior_atmosphere.mp4" type="video/mp4" />
          </video>
          <div className="absolute inset-0 bg-gradient-to-r from-[#662506]/90 via-[#662506]/50 to-transparent" />
        </div>
        
        <div className="container mx-auto px-4 relative z-10">
          <motion.div 
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="max-w-2xl"
          >
            <div className="inline-block bg-[#fec44f] text-[#662506] px-4 py-1.5 rounded-full font-bold text-sm mb-6 tracking-wide uppercase">
              {lang === "id" ? "Pendaftaran Dibuka 2026" : "Enrollment Open for 2026"}
            </div>
            <h1 className="font-serif text-5xl md:text-7xl font-bold text-[#ffffe5] mb-6 leading-tight">
              {lang === "id" ? (
                <>Kuasai Seni <span className="text-[#fec44f] italic">Kecantikan</span></>
              ) : (
                <>Master the Art of <span className="text-[#fec44f] italic">Beauty</span></>
              )}
            </h1>
            <p className="text-[#fff7bc] text-xl mb-10 max-w-lg leading-relaxed">
              {lang === "id" 
                ? "Bergabunglah dengan akademi terkemuka di Indonesia untuk makeup, nail art, dan eyelash extension. Sertifikasi profesional untuk karir Anda."
                : "Join Indonesia's premier academy for makeup, nail art, and eyelash extensions. Professional certification for your career."}
            </p>
            <div className="flex flex-wrap gap-4">
              <Link href={isAuthenticated ? "/booking" : "/auth"}>
                <Button className="h-14 px-8 bg-[#ec7014] hover:bg-[#cc4c02] text-white text-lg rounded-full shadow-[0_0_20px_rgba(236,112,20,0.4)] transition-all transform hover:scale-105">
                  {isAuthenticated 
                    ? (lang === "id" ? "Booking Kelas Sekarang" : "Book a Class Now") 
                    : (lang === "id" ? "Daftar untuk Booking" : "Sign Up to Book")} <ArrowRight className="ml-2 w-5 h-5" />
                </Button>
              </Link>
              <Button 
                onClick={() => {
                  const element = document.getElementById('classes');
                  element?.scrollIntoView({ behavior: 'smooth' });
                }}
                variant="outline" 
                className="h-14 px-8 border-[#fff7bc] text-[#fff7bc] hover:bg-[#fff7bc] hover:text-[#662506] text-lg rounded-full bg-transparent backdrop-blur-sm transition-all"
              >
                {t("home.hero.exploreCourses")}
              </Button>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Classes Section */}
      <section id="classes" className="container mx-auto px-4 py-10">
        <div className="text-center mb-16">
          <h2 className="font-serif text-4xl font-bold text-[#662506] mb-4">
            {lang === "id" ? "Kursus Unggulan Kami" : "Our Signature Courses"}
          </h2>
          <p className="text-[#993404] text-lg max-w-2xl mx-auto">
            {lang === "id" 
              ? "Pilih spesialisasi Anda dan mulai perjalanan menjadi profesional kecantikan bersertifikat."
              : "Choose your specialization and start your journey to becoming a certified beauty professional."}
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          {CLASS_TYPES.map((item, index) => (
            <motion.div
              key={item.id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
              className="group relative rounded-2xl overflow-hidden bg-white shadow-lg border border-[#fec44f]/30 hover:shadow-2xl transition-all duration-300 hover:-translate-y-2"
            >
              <div className="h-64 overflow-hidden">
                <img 
                  src={item.image} 
                  alt={item.title} 
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                />
              </div>
              <div className="p-8 relative">
                <div className="absolute -top-10 right-6 bg-[#ec7014] text-white p-3 rounded-xl shadow-lg">
                  <item.icon className="w-8 h-8" />
                </div>
                <h3 className="font-serif text-2xl font-bold text-[#662506] mb-3">{item.title}</h3>
                <p className="text-[#993404] mb-6">{item.description}</p>
                <Link href={`/courses/${item.id}`}>
                  <Button className="w-full bg-[#ec7014] hover:bg-[#cc4c02] text-white font-bold">
                    {lang === "id" ? "Lihat Detail" : "View Details"}
                  </Button>
                </Link>
              </div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Stats/Trust Section */}
      <section className="bg-[#662506] text-[#ffffe5] py-20">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            {[
              { num: "5000+", label: lang === "id" ? "Lulusan" : "Graduates" },
              { num: "10+", label: lang === "id" ? "Tahun Pengalaman" : "Years Experience" },
              { num: "100%", label: lang === "id" ? "Bersertifikat" : "Certified" },
              { num: "4.9/5", label: lang === "id" ? "Rating Siswa" : "Student Rating" },
            ].map((stat, i) => (
              <div key={i}>
                <div className="font-serif text-4xl md:text-5xl font-bold text-[#fec44f] mb-2">{stat.num}</div>
                <div className="text-[#fff7bc]/80 font-medium uppercase tracking-wider text-sm">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="container mx-auto px-4 pb-20">
        <div className="grid md:grid-cols-2 gap-16 items-center">
          <div className="relative">
             <div className="absolute inset-0 bg-[#fec44f] rounded-3xl transform rotate-3"></div>
             <img 
               src="https://images.unsplash.com/photo-1522337660859-02fbefca4702?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80" 
               alt="Academy Workshop" 
               className="relative rounded-3xl shadow-2xl transform -rotate-2 border-4 border-white"
             />
          </div>
          <div>
            <h2 className="font-serif text-4xl font-bold text-[#662506] mb-6">
              {lang === "id" ? "Mengapa Memilih Jakarta Beauty School?" : "Why Choose Jakarta Beauty School?"}
            </h2>
            <div className="space-y-6">
              {(lang === "id" ? [
                "Sertifikasi yang diakui industri setelah selesai",
                "Pelatihan langsung dengan produk premium",
                "Bimbingan karir dan bantuan penempatan kerja",
                "Jadwal fleksibel dengan opsi akhir pekan",
                "Kelas kecil untuk perhatian personal"
              ] : [
                "Industry-recognized certification upon completion",
                "Hands-on training with premium products",
                "Career guidance and job placement assistance",
                "Flexible scheduling with weekend options",
                "Small class sizes for personalized attention"
              ]).map((feature, i) => (
                <div key={i} className="flex items-start gap-4">
                  <CheckCircle className="w-6 h-6 text-[#ec7014] mt-1 shrink-0" />
                  <p className="text-[#993404] text-lg">{feature}</p>
                </div>
              ))}
            </div>
            <Button className="mt-10 h-12 px-8 bg-[#662506] text-white hover:bg-[#993404]">
              {lang === "id" ? "Pelajari Lebih Lanjut" : "Learn More About Us"}
            </Button>
          </div>
        </div>
      </section>

      {/* Gallery Section */}
      <Gallery />
    </div>
  );
}
