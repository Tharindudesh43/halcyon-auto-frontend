import { Award, ShieldCheck, Star, ThumbsUp, TrendingUp, Users, type LucideIcon } from "lucide-react";
import type { TrustIcon } from "@/lib/settings-types";

export const TRUST_ICONS: Record<TrustIcon, LucideIcon> = {
  shield: ShieldCheck,
  trending: TrendingUp,
  users: Users,
  star: Star,
  award: Award,
  thumbs: ThumbsUp,
};
