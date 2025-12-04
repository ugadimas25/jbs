import { Clock, Sparkles, Eye, Palette } from "lucide-react";
import makeupImg from "@assets/generated_images/close_up_of_professional_makeup_application.png";
import nailImg from "@assets/generated_images/close_up_of_artistic_nail_art.png";
import eyelashImg from "@assets/generated_images/close_up_of_eyelash_extension_procedure.png";

export const CLASS_TYPES = [
  {
    id: "makeup",
    title: "Professional Makeup",
    description: "Master the art of beauty and creative makeup.",
    icon: Palette,
    image: makeupImg
  },
  {
    id: "nail",
    title: "Nail Artistry",
    description: "Create stunning nail designs and care techniques.",
    icon: Sparkles,
    image: nailImg
  },
  {
    id: "eyelash",
    title: "Eyelash Extensions",
    description: "Learn precision lash application and styling.",
    icon: Eye,
    image: eyelashImg
  }
];

export const LEVELS = [
  { id: "low", label: "Beginner (Low)", price: "IDR 1.500.000", description: "Perfect for starters. Learn the basics and fundamentals." },
  { id: "intermediate", label: "Intermediate", price: "IDR 2.500.000", description: "For those with some experience. Advanced techniques." },
  { id: "high", label: "Advanced (High)", price: "IDR 4.000.000", description: "Master class level. Portfolio building and pro tips." }
];

export const SLOTS = [
  { id: "slot1", label: "12:30 - 15:00", time: "12:30 PM" },
  { id: "slot2", label: "13:30 - 16:00", time: "01:30 PM" }
];
