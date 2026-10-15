
export type MediaFocus = "center" | "top" | "bottom" | "left" | "right";

export type HeroMedia = {
  type: "image" | "video";
  url: string;
  focus?: MediaFocus | null;
};

export type HeroSettings = {
  image: string | null;
  media_desktop: HeroMedia | null;
  media_mobile: HeroMedia | null;
  title: string;
  accent: string | null;
  subtitle: string | null;
};

export type ContactSettings = {
  heading: string | null;
  intro: string | null;
  owner_name: string | null;
  phone: string | null;
  whatsapp: string | null;
  email: string | null;
  hours: string | null;
  facebook: string | null;
  instagram: string | null;
  tiktok: string | null;
};

export type AboutSettings = {
  eyebrow: string | null;
  title: string;
  body: string | null;
  image: string | null;
};

export const TRUST_ICON_OPTIONS = [
  { value: "shield", label: "Shield" },
  { value: "trending", label: "Trending up" },
  { value: "users", label: "People" },
  { value: "star", label: "Star" },
  { value: "award", label: "Award" },
  { value: "thumbs", label: "Thumbs up" },
] as const;

export type TrustIcon = (typeof TRUST_ICON_OPTIONS)[number]["value"];

export type TrustPoint = { icon: TrustIcon; title: string; desc: string };

export type TrustSettings = {
  eyebrow: string | null;
  title: string;
  subtitle: string | null;
  points: TrustPoint[];
};

export type LocationSettings = {
  name: string | null;
  address: string | null;
  map_url: string | null;
  map_query: string | null;
  directions_url: string | null;
  latitude: number | null;
  longitude: number | null;
};

export type PopupSettings = {
  enabled: boolean;
  image: string | null;
  link: string | null;
  alt: string | null;
  version: number;
};

export type FinanceSettings = {
  default_rate: number;
  rate_type: "reducing" | "flat";
  default_years: number;
  max_years: number;
  ltv_used: number;
  ltv_new: number;
  note: string | null;
};

export type SiteSettings = {
  hero: HeroSettings;
  contact: ContactSettings;
  about: AboutSettings;
  trust: TrustSettings;
  location: LocationSettings;
  popup: PopupSettings;
  finance: FinanceSettings;
};

export type SettingsGroup = keyof SiteSettings;
export const SETTINGS_GROUPS: SettingsGroup[] = ["hero", "contact", "about", "trust", "location", "popup", "finance"];

export const DEFAULT_SETTINGS: SiteSettings = {
  hero: {
    image: null, // null = use /hero-car.jpg
    media_desktop: null,
    media_mobile: null,
    title: "Find the car you'll love.",
    accent: "Drive it home with confidence.",
    subtitle:
      "Browse carefully checked cars across Sri Lanka, see honest prices and real photos, and talk straight to the seller.",
  },
  contact: {
    heading: "Let's talk cars",
    intro: "Questions about a car, or want to sell yours? Message us or call you'll get a real person.",
    owner_name: null,
    phone: "+94 77 123 4567",
    whatsapp: "94771234567",
    email: "tharindudeshanhimahansa43@gmail.com",
    hours: null,
    facebook: null,
    instagram: null,
    tiktok: null,
  },
  about: {
    eyebrow: "Our story",
    title: "About Halcyon Auto",
    body:
      "Halcyon Auto is a car marketplace built around one idea: buying a car in Sri Lanka should feel calm, clear and fair.\n\nEvery car on the site is checked before it goes live, priced openly, and shown with real photos. When you find one you like, you talk directly to the seller no middlemen, no pressure.",
    image: null,
  },
  trust: {
    eyebrow: "Our promise",
    title: "Why buyers trust Halcyon Auto",
    subtitle:
      "We built Halcyon Auto so that buying or selling a car feels safe, transparent and straightforward.",
    points: [
      { icon: "shield", title: "Verified listings", desc: "Every listing is reviewed for authenticity and accuracy before it goes live." },
      { icon: "trending", title: "Fair, open pricing", desc: "Clear prices and clear discounts help buyers and sellers get a good deal." },
      { icon: "users", title: "Real people", desc: "Message the seller directly on WhatsApp or call. No middlemen." },
    ],
  },
  location: {
    name: "Halcyon Auto",
    address: "Kurunagala, Sri Lanka",
    map_url: null,
    map_query: null,
    directions_url: null,
    latitude: null,
    longitude: null,
  },
  popup: {
    enabled: false,
    image: null,
    link: null,
    alt: null,
    version: 0,
  },
  finance: {
    default_rate: 14,
    rate_type: "reducing",
    default_years: 5,
    max_years: 7,
    ltv_used: 60,
    ltv_new: 40,
    note: null,
  },
};
