import { useState } from "react";
import { ChevronLeft, ChevronRight, Image, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { useI18n } from "@/lib/i18n";
import { useQuery } from "@tanstack/react-query";

interface GalleryItem {
  id: string;
  titleId: string;
  titleEn: string;
  descriptionId: string | null;
  descriptionEn: string | null;
  imageUrl: string;
  sortOrder: number;
  isActive: boolean;
}

export default function Gallery() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [lightboxImage, setLightboxImage] = useState<GalleryItem | null>(null);
  const { t, lang } = useI18n();

  // Fetch gallery items from API
  const { data: galleryData, isLoading } = useQuery({
    queryKey: ["gallery"],
    queryFn: async () => {
      const res = await fetch("/api/gallery");
      if (!res.ok) throw new Error("Failed to fetch gallery");
      return res.json();
    },
    staleTime: 1000 * 60 * 5, // 5 minutes
  });

  // Use API data only (no fallback)
  const galleryItems: GalleryItem[] = galleryData?.items || [];

  const next = () => {
    setCurrentIndex((prev) => (prev + 1) % galleryItems.length);
  };

  const prev = () => {
    setCurrentIndex((prev) => (prev - 1 + galleryItems.length) % galleryItems.length);
  };

  const openLightbox = (item: GalleryItem) => {
    setLightboxImage(item);
    setLightboxOpen(true);
  };

  const closeLightbox = () => {
    setLightboxOpen(false);
    setLightboxImage(null);
  };

  // Show 3 items at a time on desktop, 1 on mobile
  const visibleItems = galleryItems.length >= 3 
    ? [
        galleryItems[currentIndex],
        galleryItems[(currentIndex + 1) % galleryItems.length],
        galleryItems[(currentIndex + 2) % galleryItems.length],
      ]
    : galleryItems;

  if (isLoading) {
    return (
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="font-serif text-4xl md:text-5xl font-bold text-[#662506] mb-4">
              {t("home.gallery.title")}
            </h2>
            <p className="text-lg text-[#993404] max-w-2xl mx-auto">
              {t("home.gallery.subtitle")}
            </p>
          </div>
          <div className="flex justify-center items-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-[#ec7014]"></div>
          </div>
        </div>
      </section>
    );
  }

  if (galleryItems.length === 0) {
    return (
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="font-serif text-4xl md:text-5xl font-bold text-[#662506] mb-4">
              {t("home.gallery.title")}
            </h2>
            <p className="text-lg text-[#993404] max-w-2xl mx-auto">
              {t("home.gallery.subtitle")}
            </p>
          </div>
          <div className="flex flex-col items-center justify-center py-12 text-gray-400">
            <Image className="w-16 h-16 mb-4" />
            <p>Gallery coming soon</p>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="py-16">
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
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 px-8">
            {visibleItems.map((item, idx) => (
              <div
                key={item.id}
                className={`bg-white rounded-2xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-300 ${
                  idx === 0 ? "block" : idx === 1 ? "hidden sm:block" : "hidden lg:block"
                }`}
              >
                <div 
                  className="aspect-[4/3] overflow-hidden cursor-pointer relative group"
                  onClick={() => openLightbox(item)}
                >
                  <img 
                    src={item.imageUrl} 
                    alt={lang === "id" ? item.titleId : item.titleEn}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                  />
                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors duration-300 flex items-center justify-center">
                    <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-300 bg-white/90 rounded-full p-2">
                      <Image className="w-6 h-6 text-[#993404]" />
                    </div>
                  </div>
                </div>
                <div className="p-6">
                  <h3 className="font-serif text-xl font-bold text-[#662506] mb-2">
                    {lang === "id" ? item.titleId : item.titleEn}
                  </h3>
                  <p className="text-[#993404] text-sm">
                    {lang === "id" ? (item.descriptionId || "") : (item.descriptionEn || "")}
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

      {/* Lightbox Dialog */}
      <Dialog open={lightboxOpen} onOpenChange={setLightboxOpen}>
        <DialogContent className="max-w-[95vw] max-h-[95vh] p-0 border-0 bg-transparent">
          <div className="relative w-full h-full flex items-center justify-center">
            {/* Close Button */}
            <button
              onClick={closeLightbox}
              className="absolute top-4 right-4 z-50 bg-black/50 hover:bg-black/70 text-white rounded-full p-2 transition-colors"
            >
              <X className="w-6 h-6" />
            </button>

            {/* Image Container */}
            {lightboxImage && (
              <div className="flex flex-col items-center justify-center max-w-full max-h-full p-8">
                <img
                  src={lightboxImage.imageUrl}
                  alt={lang === "id" ? lightboxImage.titleId : lightboxImage.titleEn}
                  className="max-w-full max-h-[85vh] object-contain rounded-lg shadow-2xl"
                />
                <div className="mt-4 text-center bg-black/70 rounded-lg px-6 py-3">
                  <h3 className="font-serif text-xl font-bold text-white mb-1">
                    {lang === "id" ? lightboxImage.titleId : lightboxImage.titleEn}
                  </h3>
                  {(lang === "id" ? lightboxImage.descriptionId : lightboxImage.descriptionEn) && (
                    <p className="text-gray-200 text-sm">
                      {lang === "id" ? lightboxImage.descriptionId : lightboxImage.descriptionEn}
                    </p>
                  )}
                </div>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </section>
  );
}
