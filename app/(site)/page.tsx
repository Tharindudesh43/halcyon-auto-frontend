import Link from "next/link";
import { ArrowRight, BadgeCheck, Calculator, Droplets, Fuel, Leaf, MessageCircle, Search, Zap, KeyRound, type LucideIcon } from "lucide-react";
import { listCars } from "@/lib/cars";
import { listArticles } from "@/lib/articles";
import { listFaqs } from "@/lib/faqs";
import { calculate, categoryForYear, minDownPayment } from "@/lib/finance";
import { getSettings } from "@/lib/settings";
import { compactLkr, digitsOnly, finalPrice, lkr } from "@/lib/format";
import { CarCard } from "@/components/car-card";
import { HeroSearch } from "@/components/site/hero-search";
import { HeroMedia } from "@/components/site/hero-media";
import { ArticleCard } from "@/components/site/article-card";
import { FaqItem } from "@/components/site/faq-item";
import { LocationCard } from "@/components/site/location-card";
import { SectionHeading } from "@/components/site/section-heading";
import { TRUST_ICONS } from "@/components/site/trust-icons";
import { buttonVariants } from "@/components/ui/button";

const FUELS: { name: string; icon: LucideIcon; tint: string }[] = [
  { name: "Petrol", icon: Fuel, tint: "bg-amber-100 text-amber-700" },
  { name: "Diesel", icon: Droplets, tint: "bg-sky-100 text-sky-700" },
  { name: "Hybrid", icon: Leaf, tint: "bg-emerald-100 text-emerald-700" },
  { name: "Electric", icon: Zap, tint: "bg-violet-100 text-violet-700" },
];

const STEPS = [
  { icon: Search, title: "Browse the cars", desc: "Filter by brand, fuel and budget. Every listing shows real photos, the full price and the specs that matter." },
  { icon: MessageCircle, title: "Ask the seller", desc: "Message on WhatsApp or give a call. Get straight answers from the person who knows the car." },
  { icon: KeyRound, title: "See it, then drive it home", desc: "Visit the car in person, agree on a price that feels right, and take it home." },
];

export default async function HomePage() {
  const [catalogue, settings, articles, faqs] = await Promise.all([
    listCars({ per_page: "100", sort: "latest" }).catch(() => null),
    getSettings(),
    listArticles({ per_page: "3" }),
    listFaqs(),
  ]);
  const { hero, contact, trust, location, finance } = settings;

  const cars = catalogue?.data ?? [];
  const available = cars.filter((c) => c.status !== "sold");
  const featured = (available.length ? available : cars).slice(0, 6);
  const brands = [...new Set(cars.map((c) => c.brand.trim()).filter(Boolean))].sort((a, b) => a.localeCompare(b));
  const lowest = available.length ? Math.min(...available.map(finalPrice)) : null;
  const complete = (catalogue?.last_page ?? 1) === 1; // counts are exact only when everything fit on one page

  const whatsapp = digitsOnly(contact.whatsapp ?? "");

  // A real example for the finance teaser: the cheapest car still for sale, at the lender-minimum down payment
  const cheapest = available.length ? available.reduce((a, b) => (finalPrice(a) <= finalPrice(b) ? a : b)) : null;
  const example = (() => {
    const price = cheapest ? finalPrice(cheapest) : 6_000_000;
    const category = cheapest ? categoryForYear(cheapest.year) : "used";
    const down = minDownPayment(price, category === "used" ? finance.ltv_used : finance.ltv_new);
    const months = finance.default_years * 12;
    const r = calculate({ price, down, fees: 0, ratePct: finance.default_rate, months, type: finance.rate_type });
    return { price, down, months, payment: r.payment, title: cheapest?.title ?? null };
  })();

  return (
    <>
      <section className="relative isolate overflow-hidden bg-lagoon-deep">
        <HeroMedia
          desktop={hero.media_desktop ?? (hero.image ? { type: "image", url: hero.image } : null)}
          mobile={hero.media_mobile}
          fallback="/hero-car.jpg"
        />
        <div className="absolute inset-0 -z-10 bg-gradient-to-r from-lagoon-deep/95 via-lagoon-deep/70 to-lagoon-deep/20" />
        <div className="absolute inset-x-0 bottom-0 -z-10 h-40 bg-gradient-to-t from-lagoon-deep/80 to-transparent" />

        <div className="container-page flex min-h-[88svh] flex-col justify-center pb-40 pt-32 md:pb-44">
          <div className="max-w-3xl">
            <h1 className="animate-rise font-heading text-[2.6rem] font-extrabold leading-[1.02] text-white sm:text-6xl lg:text-7xl">
              {hero.title}
              {hero.accent && <span className="mt-2 block text-white/65">{hero.accent}</span>}
            </h1>

            {hero.subtitle && (
              <p className="rise-1 mt-6 max-w-xl animate-rise text-lg text-white/80 md:text-xl">{hero.subtitle}</p>
            )}

            <div className="rise-2 mt-9 flex animate-rise flex-wrap gap-3">
              <Link href="/cars" className={buttonVariants({ variant: "accent", size: "lg" })}>
                Browse cars <ArrowRight className="h-5 w-5" />
              </Link>
              <Link href="/contact" className={buttonVariants({ variant: "glass", size: "lg" })}>
                Talk to us
              </Link>
            </div>

            {catalogue && (
              <dl className="rise-3 mt-10 flex max-w-xl animate-rise flex-wrap gap-x-6 gap-y-4 border-t border-white/20 pt-6 sm:mt-12 sm:gap-x-12">
                <div>
                  <dt className="text-sm text-white/60">Cars listed</dt>
                  <dd className="font-heading text-3xl font-extrabold text-white">{catalogue.total}</dd>
                </div>
                {brands.length > 0 && (
                  <div>
                    <dt className="text-sm text-white/60">Brands</dt>
                    <dd className="font-heading text-3xl font-extrabold text-white">{brands.length}</dd>
                  </div>
                )}
                {lowest !== null && (
                  <div>
                    <dt className="text-sm text-white/60">Prices from</dt>
                    <dd className="font-heading text-3xl font-extrabold text-white">{compactLkr(lowest)}</dd>
                  </div>
                )}
              </dl>
            )}
          </div>
        </div>
      </section>

      <div className="container-page relative z-10 -mt-28 md:-mt-32">
        <div className="animate-rise rise-4">
          <HeroSearch brands={brands} />
        </div>
      </div>

      <section className="container-page pt-20 md:pt-28">
        <SectionHeading
          title="Fresh on the lot"
          subtitle="The newest cars to join Halcyon Auto."
          action={{ href: "/cars", label: "See all cars" }}
        />
        {featured.length === 0 ? (
          <div className="rounded-3xl border-2 border-dashed border-border bg-card px-6 py-16 text-center">
            <p className="font-heading text-xl font-bold">New cars are on their way</p>
            <p className="mt-2 text-muted-foreground">Check back soon, or message us and we&apos;ll help you find one.</p>
          </div>
        ) : (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {featured.map((car, i) => (
              <div key={car.id} className="reveal">
                <CarCard car={car} priority={i < 3} />
              </div>
            ))}
          </div>
        )}
      </section>

      <section className="container-page pt-20 md:pt-28">
        <SectionHeading title="Shop by fuel type" subtitle="Know what you want to run it on? Start here." />
        <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
          {FUELS.map(({ name, icon: Icon, tint }) => {
            const count = available.filter((c) => c.power_source?.toLowerCase() === name.toLowerCase()).length;
            return (
              <Link
                key={name}
                href={`/cars?power_source=${name}`}
                className="reveal group flex flex-col gap-4 rounded-3xl bg-card p-5 ring-1 ring-border transition-all duration-300 hover:-translate-y-1 hover:shadow-xl hover:shadow-primary/10 hover:ring-primary/30 md:p-6"
              >
                <span className={`flex h-12 w-12 items-center justify-center rounded-2xl transition-transform duration-300 group-hover:scale-110 ${tint}`}>
                  <Icon className="h-6 w-6" />
                </span>
                <span>
                  <span className="block font-heading text-xl font-bold text-ink">{name}</span>
                  {complete && (
                    <span className="text-sm text-muted-foreground">
                      {count} {count === 1 ? "car" : "cars"} available
                    </span>
                  )}
                </span>
              </Link>
            );
          })}
        </div>
      </section>

      <section className="container-page pt-20 md:pt-28">
        <SectionHeading title="Buying a car, made simple" subtitle="Three steps from first look to the keys in your hand." />
        <ol className="grid gap-6 md:grid-cols-3">
          {STEPS.map((step, i) => (
            <li key={step.title} className="reveal relative rounded-3xl bg-card p-7 ring-1 ring-border">
              <span className="absolute right-6 top-5 font-heading text-6xl font-extrabold text-muted">{i + 1}</span>
              <span className="relative flex h-12 w-12 items-center justify-center rounded-2xl bg-primary text-white">
                <step.icon className="h-6 w-6" />
              </span>
              <h3 className="relative mt-5 font-heading text-xl font-bold text-ink">{step.title}</h3>
              <p className="relative mt-2 text-muted-foreground">{step.desc}</p>
            </li>
          ))}
        </ol>
      </section>

      <section className="mt-20 bg-lagoon py-20 text-white md:mt-28 md:py-28">
        <div className="container-page grid gap-12 lg:grid-cols-[1fr_1.2fr] lg:items-center">
          <div>
            <h2 className="font-heading text-3xl font-extrabold leading-tight md:text-5xl">{trust.title}</h2>
            {trust.subtitle && <p className="mt-5 max-w-md text-lg text-white/70">{trust.subtitle}</p>}
            <Link href="/our-trust" className={`${buttonVariants({ variant: "accent" })} mt-8`}>
              How we keep it honest <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
          <ul className="space-y-4">
            {trust.points.slice(0, 3).map((p, i) => {
              const Icon = TRUST_ICONS[p.icon] ?? BadgeCheck;
              return (
                <li key={`${p.title}-${i}`} className="reveal flex gap-5 rounded-3xl bg-white/[0.07] p-6 ring-1 ring-white/10 transition-colors duration-300 hover:bg-white/[0.12]">
                  <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-accent text-accent-foreground">
                    <Icon className="h-6 w-6" />
                  </span>
                  <div>
                    <h3 className="font-heading text-lg font-bold">{p.title}</h3>
                    <p className="mt-1 text-white/70">{p.desc}</p>
                  </div>
                </li>
              );
            })}
          </ul>
        </div>
      </section>

      <section className="container-page pt-20 md:pt-28">
        <div className="reveal grid gap-10 overflow-hidden rounded-[2rem] bg-card p-6 ring-1 ring-border md:p-12 lg:grid-cols-2 lg:items-center">
          <div>
            <h2 className="font-heading text-3xl font-extrabold leading-tight text-ink md:text-4xl">
              Plan your payments before you visit
            </h2>
            <p className="mt-4 text-lg text-muted-foreground">
              Try different down payments, rates and durations, and see what a lease or loan really costs.
            </p>
            <ul className="mt-6 space-y-3 text-ink">
              {["Reducing-balance and flat rates", `Terms from 1 to ${finance.max_years} years`, "Built around today's Central Bank down-payment rules"].map((t) => (
                <li key={t} className="flex items-center gap-3">
                  <BadgeCheck className="h-5 w-5 shrink-0 text-primary" /> {t}
                </li>
              ))}
            </ul>
            <Link href="/finance" className={`${buttonVariants({ variant: "default", size: "lg" })} mt-8`}>
              <Calculator className="h-5 w-5" /> Open the calculator
            </Link>
          </div>

          <div className="rounded-3xl bg-gradient-to-br from-lagoon to-primary p-7 text-white md:p-9">
            <p className="text-sm text-white/70">{example.title ? `Example: ${example.title}` : "Example"}</p>
            <p className="mt-1 font-heading text-lg font-bold text-white/90">{lkr(example.price)}</p>
            <p className="mt-6 text-sm text-white/70">Estimated monthly payment</p>
            <p className="font-heading text-5xl font-extrabold tracking-tight">{lkr(example.payment)}</p>
            <p className="mt-3 text-sm text-white/70">
              with {lkr(example.down)} down · {example.months / 12} years · {finance.default_rate}% {finance.rate_type === "flat" ? "flat" : "reducing"}
            </p>
          </div>
        </div>
      </section>

      {articles && articles.data.length > 0 && (
        <section className="container-page pt-20 md:pt-28">
          <SectionHeading
            title="From the garage"
            subtitle="Buying advice, maintenance tips and news from the automobile world."
            action={{ href: "/articles", label: "All articles" }}
          />
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {articles.data.map((a) => (
              <div key={a.id} className="reveal">
                <ArticleCard article={a} />
              </div>
            ))}
          </div>
        </section>
      )}

      {faqs.length > 0 && (
        <section className="container-page pt-20 md:pt-28">
          <div className="grid gap-10 lg:grid-cols-[1fr_1.4fr]">
            <div>
              <h2 className="font-heading text-3xl font-extrabold leading-tight text-ink md:text-4xl">Quick answers</h2>
              <p className="mt-4 text-lg text-muted-foreground">The questions we hear most. Something else? Just ask.</p>
              <Link href="/faq" className="group mt-6 inline-flex items-center gap-2 font-semibold text-primary">
                See all questions
                <ArrowRight className="h-4 w-4 transition-transform duration-200 group-hover:translate-x-1" />
              </Link>
            </div>
            <div className="space-y-3">
              {faqs.slice(0, 5).map((f) => (
                <FaqItem key={f.id} question={f.question} answer={f.answer} />
              ))}
            </div>
          </div>
        </section>
      )}

      <section className="container-page pt-20 md:pt-28">
        <SectionHeading title="Come and see the cars" subtitle="Visit us, take a seat and take one for a spin." />
        <div className="reveal">
          <LocationCard location={location} hours={contact.hours} />
        </div>
      </section>

      <section className="container-page pt-20 md:pt-28">
        <div className="reveal relative overflow-hidden rounded-[2rem] bg-gradient-to-br from-primary to-lagoon px-6 py-14 text-white md:px-14 md:py-16">
          <div className="absolute -right-16 -top-16 h-64 w-64 rounded-full bg-accent/20 blur-3xl" />
          <div className="absolute -bottom-20 left-1/3 h-56 w-56 rounded-full bg-white/10 blur-3xl" />
          <div className="relative flex flex-wrap items-center justify-between gap-8">
            <div className="max-w-xl">
              <h2 className="font-heading text-3xl font-extrabold leading-tight md:text-4xl">Have a car to sell?</h2>
              <p className="mt-3 text-lg text-white/80">
                Tell us about it and we&apos;ll help you list it in front of the right buyers.
              </p>
            </div>
            <div className="flex flex-wrap gap-3">
              <Link href="/contact" className={buttonVariants({ variant: "accent", size: "lg" })}>
                Contact us
              </Link>
              {whatsapp && (
                <a
                  href={`https://wa.me/${whatsapp}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={buttonVariants({ variant: "glass", size: "lg" })}
                >
                  <MessageCircle className="h-5 w-5" /> WhatsApp
                </a>
              )}
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
