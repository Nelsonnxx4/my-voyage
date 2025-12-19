import { computed } from "vue";
// import type { VoyageTypeInfo } from "@/types/voyage";
import type { Platform } from "@/types/social";
import facebook from "@/assets/images/facebook.svg";
import x from "@/assets/images/x.svg";
import whatsapp from "@/assets/images/whatsapp.svg";
import linkedin from "@/assets/images/linkedin.svg";

interface NavItem {
  name: string;
  path: string;
  icon?: string;
}

export const NavPaths = computed<NavItem[]>(() => [
  { name: "About", path: "/about", icon: "InfoIcon" },
  { name: "Pricing", path: "/pricing" },
  { name: "Contact", path: "/contact" },
]);

export const platforms: Platform[] = [
  {
    socialMedia: "facebook",
    icon: facebook,
  },
  {
    socialMedia: "x",
    icon: x,
  },
  {
    socialMedia: "linkedin",
    icon: linkedin,
  },
  {
    socialMedia: "whatsapp",
    icon: whatsapp,
  },
];
