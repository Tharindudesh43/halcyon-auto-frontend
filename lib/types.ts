export type CarStatus = "pending" | "sold";

export type CarListing = {
  id: number;
  slug: string;
  title: string;
  brand: string;
  model: string;
  year: number;
  price: string;
  discount_percent: number | null;
  down_payment: string | null;
  mileage: string | null;
  cc: string | null;
  power_source: string | null;
  transmission: string | null;
  location: string | null;
  description: string | null;
  whatsapp: string | null;
  images: string[] | null;
  status: CarStatus;
  created_at: string;
  updated_at: string;
};

export type Paginated<T> = {
  data: T[];
  current_page: number;
  last_page: number;
  total: number;
  per_page: number;
};

export type CarListingInput = {
  title: string;
  brand: string;
  model: string;
  year: number;
  price: number;
  discount_percent?: number | null;
  down_payment?: number | null;
  mileage?: string;
  cc?: string;
  power_source?: string;
  transmission?: string;
  location?: string;
  description?: string;
  whatsapp?: string;
  images?: string[];
  status?: CarStatus;
};

export const CAREER_TYPES = ["Full-time", "Part-time", "Contract", "Internship"] as const;
export type CareerType = (typeof CAREER_TYPES)[number];

export type CareerOpening = {
  id: number;
  title: string;
  department: string | null;
  location: string | null;
  type: CareerType | null;
  salary: string | null;
  closing_date: string | null; // YYYY-MM-DD
  description: string | null;
  requirements: string | null; // one per line
  is_open: boolean;
  created_at: string;
  updated_at: string;
};

export type CareerInput = {
  title: string;
  department?: string | null;
  location?: string | null;
  type?: CareerType | null;
  salary?: string | null;
  closing_date?: string | null;
  description?: string | null;
  requirements?: string | null;
  is_open: boolean;
};

export type Faq = {
  id: number;
  question: string;
  answer: string;
  category: string | null;
  sort_order: number;
  is_published: boolean;
};

export type FaqInput = {
  question: string;
  answer: string;
  category?: string | null;
  is_published: boolean;
};

export const ARTICLE_CATEGORIES = [
  "Buying guides",
  "Maintenance & care",
  "Spare parts",
  "Car news",
  "Auto technology",
  "Finance & insurance",
] as const;
export type ArticleCategory = (typeof ARTICLE_CATEGORIES)[number];

export type ArticleSummary = {
  id: number;
  title: string;
  slug: string;
  category: ArticleCategory;
  excerpt: string | null;
  cover_image: string | null;
  author: string | null;
  is_published: boolean;
  published_at: string | null;
  created_at: string;
  updated_at: string;
};

export type Article = ArticleSummary & { content: string };

export type ArticleInput = {
  title: string;
  slug?: string | null;
  category: ArticleCategory;
  excerpt?: string | null;
  content: string;
  cover_image?: string | null;
  author?: string | null;
  is_published: boolean;
};

export type EnquiryType = "whatsapp" | "call" | "test_drive";

export type Enquiry = {
  id: number;
  type: EnquiryType;
  car_listing_id: number | null;
  car_title: string | null;
  car: { id: number; slug: string; title: string; images: string[] | null } | null;
  name: string | null;
  phone: string | null;
  email: string | null;
  preferred_date: string | null;
  message: string | null;
  handled_at: string | null;
  created_at: string;
};

export type EnquirySummary = {
  days: number;
  top: {
    car_listing_id: number;
    title: string;
    slug: string | null;
    image: string | null;
    status: CarStatus | null;
    total: number;
    whatsapp: number;
    calls: number;
    test_drives: number;
  }[];
  totals: { whatsapp: number; calls: number; test_drives: number; open_test_drives: number };
};
