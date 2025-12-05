import { Clock, Sparkles, Eye, Palette } from "lucide-react";
import makeupImg from "@assets/generated_images/close_up_of_professional_makeup_application.png";
import nailImg from "@assets/generated_images/close_up_of_artistic_nail_art.png";
import eyelashImg from "@assets/generated_images/close_up_of_eyelash_extension_procedure.png";

export const CLASS_TYPES = [
  {
    id: "makeup",
    title: "Make up and Hair do",
    description: "Master the art of beauty makeup and professional hair styling.",
    icon: Palette,
    image: makeupImg
  },
  {
    id: "nail",
    title: "Nails",
    description: "Create stunning nail designs and care techniques.",
    icon: Sparkles,
    image: nailImg
  },
  {
    id: "eyelash",
    title: "Brow, lips and lash",
    description: "Learn precision eyebrow shaping, lip techniques, and lash application.",
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
