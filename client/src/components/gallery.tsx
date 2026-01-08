import { useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useI18n } from "@/lib/i18n";

interface GalleryItem {
  id: number;
  titleId: string;
  titleEn: string;
  descriptionId: string;
  descriptionEn: string;
  image: string;
}

const galleryItems: GalleryItem[] = [
  {
    id: 1,
    titleId: "Workshop Makeup",
    titleEn: "Makeup Workshop",
    descriptionId: "Siswa mempraktikkan teknik makeup profesional dengan produk standar industri",
    descriptionEn: "Students practicing professional makeup techniques with industry-standard products",
    image: "/api/placeholder/800/600",
  },
  {
    id: 2,
    titleId: "Kelas Nail Art",
    titleEn: "Nail Art Class",
    descriptionId: "Belajar desain nail art rumit dan aplikasi gel polish",
    descriptionEn: "Learning intricate nail art designs and gel polish application",
    image: "/api/placeholder/800/600",
  },
  {
    id: 3,
    titleId: "Pelatihan Eyelash Extension",
    titleEn: "Eyelash Extension Training",
    descriptionId: "Praktik langsung untuk ekstensi bulu mata klasik dan volume",
    descriptionEn: "Hands-on practice for classic and volume lash extensions",
    image: "/api/placeholder/800/600",
  },
  {
    id: 4,
    titleId: "Upacara Wisuda",
    titleEn: "Graduation Ceremony",
    descriptionId: "Merayakan lulusan kami dengan sertifikasi profesional",
    descriptionEn: "Celebrating our graduates with professional certification",
    image: "/api/placeholder/800/600",
  },
  {
    id: 5,
    titleId: "Kompetisi Kecantikan",
    titleEn: "Beauty Competition",
    descriptionId: "Siswa menampilkan keahlian mereka di kompetisi kecantikan tahunan",
    descriptionEn: "Students showcasing their skills in annual beauty competition",
    image: "/api/placeholder/800/600",
  },
  {
    id: 6,
    titleId: "Sesi Makeup Pengantin",
    titleEn: "Bridal Makeup Session",
    descriptionId: "Teknik makeup pengantin tingkat lanjut dan penataan gaya",
    descriptionEn: "Advanced bridal makeup techniques and styling",
    image: "/api/placeholder/800/600",
  },
  {
    id: 7,
    titleId: "Pemotretan Profesional",
    titleEn: "Professional Photoshoot",
    descriptionId: "Karya siswa ditampilkan dalam pemotretan kecantikan profesional",
    descriptionEn: "Students' work featured in professional beauty photoshoots",
    image: "/api/placeholder/800/600",
  },
  {
    id: 8,
    titleId: "Workshop Hairdo",
    titleEn: "Hairdo Workshop",
    descriptionId: "Belajar penataan rambut profesional dan teknik updo",
    descriptionEn: "Learning professional hairstyling and updo techniques",
    image: "/api/placeholder/800/600",
  },
  {
    id: 9,
    titleId: "Masterclass Industri",
    titleEn: "Industry Masterclass",
    descriptionId: "Pembicara tamu dari brand kecantikan terkemuka berbagi wawasan industri",
    descriptionEn: "Guest speaker from leading beauty brand sharing industry insights",
    image: "/api/placeholder/800/600",
  },
  {
    id: 10,
    titleId: "Sesi Portfolio Siswa",
    titleEn: "Student Portfolio Session",
    descriptionId: "Membangun portfolio profesional dengan sesi model",
    descriptionEn: "Building professional portfolios with model sessions",
    image: "/api/placeholder/800/600",
  },
];

export default function Gallery() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const { t, lang } = useI18n();

  const next = () => {
    setCurrentIndex((prev) => (prev + 1) % galleryItems.length);
  };

  const prev = () => {
    setCurrentIndex((prev) => (prev - 1 + galleryItems.length) % galleryItems.length);
  };

  // Show 3 items at a time on desktop, 1 on mobile
  const visibleItems = [
    galleryItems[currentIndex],
    galleryItems[(currentIndex + 1) % galleryItems.length],
    galleryItems[(currentIndex + 2) % galleryItems.length],
  ];

  return (
    <section className="bg-gradient-to-b from-[#ffffe5] to-white py-16">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="font-serif text-4xl md:text-5xl font-bold text-[#662506] mb-4">
            {t("home.gallery.title")}
          </h2>
          <p className="text-lg text-[#993404] max-w-2xl mx-auto">
            {t("home.gallery.subtitle")}
          </p>
        </div>

        <div className="relative">
          {/* Navigation Buttons */}
          <Button
            onClick={prev}
            className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-4 z-10 bg-white/90 hover:bg-white text-[#993404] rounded-full p-3 shadow-lg"
            size="icon"
          >
            <ChevronLeft className="w-6 h-6" />
          </Button>

          <Button
            onClick={next}
            className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-4 z-10 bg-white/90 hover:bg-white text-[#993404] rounded-full p-3 shadow-lg"
            size="icon"
          >
            <ChevronRight className="w-6 h-6" />
          </Button>

          {/* Gallery Items */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 px-8">
            {visibleItems.map((item, idx) => (
              <div
                key={item.id}
                className={`bg-white rounded-2xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-300 ${
                  idx === 0 ? "block" : "hidden md:block"
                }`}
              >
                <div className="aspect-[4/3] bg-gradient-to-br from-[#fec44f] to-[#fee391] flex items-center justify-center">
                  <div className="text-center p-8">
                    <div className="text-6xl mb-4">🎨</div>
                    <p className="text-[#662506] font-medium">Gallery Image {item.id}</p>
                    <p className="text-sm text-[#993404] mt-2">1200x900px recommended</p>
                  </div>
                </div>
                <div className="p-6">
                  <h3 className="font-serif text-xl font-bold text-[#662506] mb-2">
                    {lang === "id" ? item.titleId : item.titleEn}
                  </h3>
                  <p className="text-[#993404] text-sm">
                    {lang === "id" ? item.descriptionId : item.descriptionEn}
                  </p>
                </div>
              </div>
            ))}
          </div>

          {/* Dots Indicator */}
          <div className="flex justify-center gap-2 mt-8">
            {galleryItems.map((_, idx) => (
              <button
                key={idx}
                onClick={() => setCurrentIndex(idx)}
                className={`w-2 h-2 rounded-full transition-all ${
                  idx === currentIndex
                    ? "bg-[#993404] w-6"
                    : "bg-[#993404]/30 hover:bg-[#993404]/50"
                }`}
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
