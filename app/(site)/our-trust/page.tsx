import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, ShieldCheck } from "lucide-react";
import { getSettings } from "@/lib/settings";
import { TRUST_ICONS } from "@/components/site/trust-icons";
import { buttonVariants } from "@/components/ui/button";

export const metadata: Metadata = { title: "Our trust" };

export default async function OurTrustPage() {
  const { trust } = await getSettings();

  return (
    <div className="container-page page-top pb-8">
      <header className="max-w-3xl animate-rise">
        {trust.eyebrow && (
          <span className="inline-block rounded-full bg-accent/25 px-4 py-1.5 text-sm font-semibold text-ink">
            {trust.eyebrow}
          </span>
        )}
        <h1 className="mt-5 font-heading text-4xl font-extrabold leading-[1.05] text-ink md:text-6xl">{trust.title}</h1>
        {trust.subtitle && <p className="mt-5 text-xl text-muted-foreground">{trust.subtitle}</p>}
      </header>

      <ul className="mt-14 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {trust.points.map((p, i) => {
          const Icon = TRUST_ICONS[p.icon] ?? ShieldCheck;
          return (
            <li
              key={`${p.title}-${i}`}
              className="reveal group rounded-3xl bg-card p-8 ring-1 ring-border transition-all duration-300 hover:-translate-y-1 hover:shadow-xl hover:shadow-primary/10 hover:ring-primary/30"
            >
              <span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-primary text-white transition-transform duration-300 group-hover:-rotate-6 group-hover:scale-110">
                <Icon className="h-7 w-7" />
              </span>
              <h2 className="mt-6 font-heading text-xl font-bold text-ink">{p.title}</h2>
              <p className="mt-2 text-muted-foreground">{p.desc}</p>
            </li>
          );
        })}
      </ul>

      <div className="mt-14">
        <Link href="/cars" className={buttonVariants({ variant: "accent", size: "lg" })}>
          See the cars <ArrowRight className="h-5 w-5" />
        </Link>
      </div>
    </div>
  );
}
