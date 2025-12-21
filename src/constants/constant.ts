import { computed } from "vue";
import type { Platform } from "@/types/social";
import facebook from "@/assets/images/facebook.svg";
import x from "@/assets/images/x.svg";
import whatsapp from "@/assets/images/whatsapp.svg";
import linkedin from "@/assets/images/linkedin.svg";

interface NavItem {
  name: string;
  href?: string;
  path?: string;
}

export const NavPaths = computed<NavItem[]>(() => [
  { name: "How it works", href: "howItWorks" },
  { name: "Benefits", href: "benefits" },
  { name: "About", href: "about" },
  { name: "Pricing", href: "pricing" },
  { name: "FAQs", href: "faqs" },
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

interface Feature {
  icon: string;
  title: string;
  description: string;
  gradientText?: string;
}

export const features: Feature[] = [
  {
    icon: "✨",
    title: "Trip Planning",
    description:
      "Create stunning visual itineraries with interactive maps that bring your travel dreams to life.",
    gradientText: "Visual",
  },
  {
    icon: "🧠",
    title: "Organization",
    description:
      "Keep all your travel details in one organized, accessible place.",
    gradientText: "Smart",
  },
  {
    icon: "🌍",
    title: "Discovery",
    description: "Move beyond tourist traps with personalized recommendations.",
    gradientText: "Real",
  },
  {
    icon: "🤝",
    title: "the Journey",
    description:
      "Easily collaborate with travel companions or share your perfect itinerary.",
    gradientText: "Share",
  },
];

interface TechFeature {
  icon: string;
  title: string;
  description: string;
}

export const techFeatures: TechFeature[] = [
  {
    icon: "🚀",
    title: "Performance You Can Feel",
    description:
      "Vue's reactivity system ensures Zende responds instantly to your every interaction.",
  },
  {
    icon: "💎",
    title: "Reliability That Matters",
    description:
      "TypeScript helps us catch errors early, giving you a stable app.",
  },
  {
    icon: "📱",
    title: "Consistent Experience",
    description:
      "Works beautifully on phone, tablet, or computer with synchronized data.",
  },
  {
    icon: "🛡️",
    title: "Your Data, Protected",
    description:
      "Modern tech stack with robust security for your travel plans.",
  },
];

export const faqs = [
  {
    question: "Can I switch plans later?",
    answer:
      "Yes, you can upgrade or downgrade your plan at any time. Changes will be reflected in your next billing cycle.",
  },
  {
    question: "What happens if I downgrade from Premium to Free?",
    answer:
      "You'll keep access to Premium features until the end of your current billing period. After that, your account will revert to Free plan limitations.",
  },

  {
    question: "What payment methods do you accept?",
    answer:
      "We accept all major credit cards (Visa, Mastercard, American Express) and PayPal for your convenience.",
  },
  {
    question: "How can I cancel my subscription?",
    answer:
      "You can cancel anytime from your account settings. Your access will continue until the end of your current billing period, with no penalty or hidden fees.",
  },
  // {
  //   question: "Is there a free trial for Premium?",
  //   answer:
  //     "New users get a 14-day free trial of Premium features when they sign up. No credit card required to start!",
  // },
];
