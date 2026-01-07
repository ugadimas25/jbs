import { useParams, Link, useLocation } from "wouter";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Clock, Award, CheckCircle, Calendar, BookOpen, ShoppingCart } from "lucide-react";
import { CLASS_TYPES } from "@/lib/constants";
import { useAuth } from "@/lib/auth-context";

// Detail tambahan untuk setiap kursus
const COURSE_DETAILS: Record<string, {
  duration: string;
  sessions: number;
  includes: string[];
  outline: string[];
  requirements: string[];
}> = {
  makeup: {
    duration: "2 sesi @ 2.5 jam",
    sessions: 2,
    includes: [
      "Sertifikat kelulusan",
      "Makeup kit starter (untuk level Beginner)",
      "Akses materi online selama 3 bulan",
      "Konsultasi pasca pelatihan"
    ],
    outline: [
      "Pengenalan alat dan produk makeup profesional",
      "Teknik dasar: foundation, contouring, highlighting",
      "Eye makeup: eyeshadow, eyeliner, mascara",
      "Lip makeup dan teknik ombre",
      "Hair styling dasar: blow dry, curling, updos",
      "Praktik langsung dengan model"
    ],
    requirements: [
      "Tidak ada pengalaman sebelumnya yang dibutuhkan",
      "Usia minimal 17 tahun",
      "Membawa model untuk sesi praktik (opsional)"
    ]
  },
  nail: {
    duration: "2 sesi @ 2.5 jam",
    sessions: 2,
    includes: [
      "Sertifikat kelulusan",
      "Nail art kit dasar (untuk level Beginner)",
      "Akses video tutorial",
      "Diskon 20% untuk pembelian produk"
    ],
    outline: [
      "Pengenalan anatomi kuku dan perawatan dasar",
      "Manicure dan pedicure profesional",
      "Teknik aplikasi gel polish dan akrilik",
      "Nail art design: marble, french, ombre",
      "3D nail art dan embellishments",
      "Tips bisnis salon kuku"
    ],
    requirements: [
      "Tidak ada pengalaman sebelumnya yang dibutuhkan",
      "Usia minimal 17 tahun",
      "Kuku dalam kondisi sehat"
    ]
  },
  eyelash: {
    duration: "2 sesi @ 2.5 jam",
    sessions: 2,
    includes: [
      "Sertifikat kelulusan",
      "Lash extension starter kit (untuk level Beginner)",
      "Akses komunitas alumni",
      "Garansi pelatihan ulang jika belum mahir"
    ],
    outline: [
      "Pengenalan jenis-jenis bulu mata extension",
      "Teknik shaping alis: waxing, threading, microblading intro",
      "Classic lash extension application",
      "Volume lash techniques",
      "Lip blushing dan teknik pewarnaan bibir",
      "Aftercare dan maintenance tips"
    ],
    requirements: [
      "Tidak ada pengalaman sebelumnya yang dibutuhkan",
      "Usia minimal 17 tahun",
      "Membawa model untuk praktik extension"
    ]
  }
};

export default function CourseDetailPage() {
  const { id } = useParams<{ id: string }>();
  const { isAuthenticated } = useAuth();
  const [, navigate] = useLocation();
  
  const course = CLASS_TYPES.find(c => c.id === id);
  const details = id ? COURSE_DETAILS[id] : null;

  const handleCheckout = () => {
    if (course) {
      navigate(`/booking?class=${course.id}`);
    }
  };
  
  if (!course || !details) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#fff7ed] to-[#fef3c7]">
        <Card className="max-w-md">
          <CardContent className="p-8 text-center">
            <h2 className="text-2xl font-bold text-[#662506] mb-4">Kursus Tidak Ditemukan</h2>
            <p className="text-gray-600 mb-6">Maaf, kursus yang Anda cari tidak tersedia.</p>
            <Link href="/">
              <Button className="bg-[#ec7014] hover:bg-[#cc4c02]">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Kembali ke Beranda
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  const IconComponent = course.icon;

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#fff7ed] to-[#fef3c7]">
      {/* Hero Section */}
      <div className="relative h-[40vh] overflow-hidden">
        <img 
          src={course.image} 
          alt={course.title}
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent" />
        <div className="absolute bottom-0 left-0 right-0 p-8">
          <div className="max-w-4xl mx-auto">
            <Link href="/#classes">
              <Button variant="ghost" className="text-white hover:bg-white/20 mb-4">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Kembali
              </Button>
            </Link>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              <div className="flex items-center gap-3 mb-2">
                <div className="p-2 bg-[#ec7014] rounded-lg">
                  <IconComponent className="w-6 h-6 text-white" />
                </div>
                <Badge className="bg-[#fee391] text-[#662506]">Kursus Profesional</Badge>
              </div>
              <h1 className="text-4xl md:text-5xl font-bold text-white mb-2">{course.title}</h1>
              <p className="text-lg text-gray-200">{course.description}</p>
            </motion.div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-4xl mx-auto px-4 py-12">
        <div className="grid md:grid-cols-3 gap-6 mb-12">
          {/* Quick Info Cards */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            <Card className="border-[#fec44f] bg-white/80 backdrop-blur">
              <CardContent className="p-6 text-center">
                <Clock className="w-8 h-8 text-[#ec7014] mx-auto mb-2" />
                <p className="text-sm text-gray-500">Durasi</p>
                <p className="font-semibold text-[#662506]">{details.duration}</p>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <Card className="border-[#fec44f] bg-white/80 backdrop-blur">
              <CardContent className="p-6 text-center">
                <Calendar className="w-8 h-8 text-[#ec7014] mx-auto mb-2" />
                <p className="text-sm text-gray-500">Jumlah Sesi</p>
                <p className="font-semibold text-[#662506]">{details.sessions} sesi</p>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            <Card className="border-[#fec44f] bg-white/80 backdrop-blur">
              <CardContent className="p-6 text-center">
                <Award className="w-8 h-8 text-[#ec7014] mx-auto mb-2" />
                <p className="text-sm text-gray-500">Sertifikat</p>
                <p className="font-semibold text-[#662506]">Ya, Resmi</p>
              </CardContent>
            </Card>
          </motion.div>
        </div>

        {/* What's Included */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="mb-12"
        >
          <Card className="border-[#fec44f] bg-white/90 backdrop-blur">
            <CardHeader>
              <CardTitle className="text-[#662506] flex items-center gap-2">
                <CheckCircle className="w-5 h-5 text-[#ec7014]" />
                Yang Termasuk
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="grid md:grid-cols-2 gap-3">
                {details.includes.map((item, idx) => (
                  <li key={idx} className="flex items-start gap-2">
                    <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                    <span className="text-gray-700">{item}</span>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        </motion.div>

        {/* Course Outline */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="mb-12"
        >
          <Card className="border-[#fec44f] bg-white/90 backdrop-blur">
            <CardHeader>
              <CardTitle className="text-[#662506] flex items-center gap-2">
                <BookOpen className="w-5 h-5 text-[#ec7014]" />
                Materi Pembelajaran
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ol className="space-y-3">
                {details.outline.map((item, idx) => (
                  <li key={idx} className="flex items-start gap-3">
                    <span className="flex-shrink-0 w-6 h-6 bg-[#ec7014] text-white rounded-full flex items-center justify-center text-sm font-bold">
                      {idx + 1}
                    </span>
                    <span className="text-gray-700">{item}</span>
                  </li>
                ))}
              </ol>
            </CardContent>
          </Card>
        </motion.div>

        {/* Requirements */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7 }}
          className="mb-12"
        >
          <Card className="border-[#fec44f] bg-white/90 backdrop-blur">
            <CardHeader>
              <CardTitle className="text-[#662506]">Persyaratan</CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2">
                {details.requirements.map((item, idx) => (
                  <li key={idx} className="flex items-start gap-2 text-gray-700">
                    <span className="text-[#ec7014]">•</span>
                    {item}
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        </motion.div>

        {/* CTA */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8 }}
          className="text-center"
        >
          {isAuthenticated ? (
            <Card className="border-[#ec7014] bg-gradient-to-r from-[#ec7014] to-[#cc4c02] text-white">
              <CardContent className="p-8">
                <h3 className="text-2xl font-bold mb-4">Siap Memulai Perjalanan Anda?</h3>
                <p className="mb-6 text-white/90">
                  Daftar sekarang dan mulai belajar bersama instruktur profesional kami!
                </p>
                <Button 
                  size="lg" 
                  onClick={handleCheckout}
                  className="bg-white text-[#ec7014] hover:bg-[#fee391] font-bold"
                >
                  <ShoppingCart className="w-5 h-5 mr-2" />
                  Checkout
                </Button>
              </CardContent>
            </Card>
          ) : (
            <Card className="border-[#ec7014] bg-gradient-to-r from-[#ec7014] to-[#cc4c02] text-white">
              <CardContent className="p-8">
                <h3 className="text-2xl font-bold mb-4">Siap Memulai Perjalanan Anda?</h3>
                <p className="mb-6 text-white/90">
                  Masuk atau daftar untuk memulai proses pendaftaran kursus ini.
                </p>
                <Link href="/auth">
                  <Button size="lg" className="bg-white text-[#ec7014] hover:bg-[#fee391] font-bold">
                    Masuk untuk Mendaftar
                  </Button>
                </Link>
              </CardContent>
            </Card>
          )}
        </motion.div>
      </div>
    </div>
  );
}
