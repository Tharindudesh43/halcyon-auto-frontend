import type { Metadata } from "next";
import Link from "next/link";
import { notFound, permanentRedirect } from "next/navigation";
import {
  Calendar, ChevronRight, CircleAlert, Cog, Fuel, Gauge, MapPin, MessageCircle, Phone, Settings2, Tag, Wallet, type LucideIcon,
} from "lucide-react";
import { carHref, getCar, listCars } from "@/lib/cars";
import { ApiError } from "@/lib/api";
import { getSettings } from "@/lib/settings";
import { digitsOnly, finalPrice, lkr } from "@/lib/format";
import { ImageGallery } from "@/components/image-gallery";
import { FinanceCalculator } from "@/components/site/finance-calculator";
import { categoryForYear } from "@/lib/finance";
import { CarCard } from "@/components/car-card";
import { SectionHeading } from "@/components/site/section-heading";
import { buttonVariants } from "@/components/ui/button";
import { TrackLink } from "@/components/site/track-link";
import { TestDriveForm } from "@/components/site/test-drive-form";
import { cld } from "@/lib/cloudinary";
import { SITE_URL } from "@/lib/site";

type Props = { params: Promise<{ slug: string }> };

async function loadCar(key: string) {
  try {
    return await getCar(key);
  } catch (err) {
    if (err instanceof ApiError && err.status === 404) notFound();
    throw err;
  }
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  try {
    const car = await getCar(slug);
    const description = `${car.year} ${car.brand} ${car.model} for ${lkr(finalPrice(car))}${car.location ? ` in ${car.location}` : ""}.`;
    return {
      title: car.title,
      description,
      alternates: { canonical: carHref(car) },
      openGraph: {
        title: car.title,
        description,
        url: carHref(car),
        images: car.images?.[0] ? [cld(car.images[0], 1200, { h: 630, fill: true })] : undefined,
      },
    };
  } catch {
    return { title: "Car details" };
  }
}

export default async function CarDetailPage({ params }: Props) {
  const { slug } = await params;
  const [car, { contact, finance }] = await Promise.all([loadCar(slug), getSettings()]);

  if (car.slug && slug !== car.slug) permanentRedirect(carHref(car));

  const sold = car.status === "sold";
  const off = sold ? 0 : car.discount_percent ?? 0;
  const original = Number(car.price);
  const price = finalPrice(car);
  const down = !sold && car.down_payment && Number(car.down_payment) > 0 ? Number(car.down_payment) : null;

  const whatsappNumber = digitsOnly(car.whatsapp ?? contact.whatsapp ?? "");
  const whatsappHref = whatsappNumber
    ? `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(`Hi, I'm interested in the ${car.title} listed on Halcyon Auto`)}`
    : null;
  const telHref = contact.phone ? `tel:+${digitsOnly(contact.phone)}` : null;

  const facts: { icon: LucideIcon; label: string; value: string | number | null }[] = [
    { icon: Calendar, label: "Year", value: car.year },
    { icon: Gauge, label: "Mileage", value: car.mileage },
    { icon: Fuel, label: "Fuel", value: car.power_source },
    { icon: Settings2, label: "Gearbox", value: car.transmission },
    { icon: Cog, label: "Engine", value: car.cc },
    { icon: MapPin, label: "Location", value: car.location },
  ];

  // More from the same brand (skip this car and sold ones)
  const related = await listCars({ brand: car.brand, per_page: "8" })
    .then((r) => r.data.filter((c) => c.id !== car.id && c.status !== "sold").slice(0, 3))
    .catch(() => []);

  // Structured data so Google can show price, photo and availability in search results
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": ["Car", "Product"],
    name: car.title,
    url: `${SITE_URL}${carHref(car)}`,
    description: car.description || `${car.year} ${car.brand} ${car.model}`,
    image: (car.images ?? []).slice(0, 5).map((u) => cld(u, 1200)),
    brand: { "@type": "Brand", name: car.brand },
    model: car.model,
    vehicleModelDate: String(car.year),
    ...(car.mileage && Number(digitsOnly(car.mileage)) > 0
      ? { mileageFromOdometer: { "@type": "QuantitativeValue", value: Number(digitsOnly(car.mileage)), unitCode: "KMT" } }
      : {}),
    ...(car.power_source ? { fuelType: car.power_source } : {}),
    ...(car.transmission ? { vehicleTransmission: car.transmission } : {}),
    offers: {
      "@type": "Offer",
      url: `${SITE_URL}${carHref(car)}`,
      price: String(price),
      priceCurrency: "LKR",
      availability: sold ? "https://schema.org/SoldOut" : "https://schema.org/InStock",
      itemCondition: "https://schema.org/UsedCondition",
      seller: { "@type": "AutoDealer", name: "Halcyon Auto" },
    },
  };

  return (
    <div className="container-page page-top pb-8">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd).replace(/</g, "\\u003c") }}
      />
      <nav aria-label="Breadcrumb" className="mb-6 flex flex-wrap items-center gap-1.5 text-sm text-muted-foreground">
        <Link href="/cars" className="font-medium hover:text-primary">Cars</Link>
        <ChevronRight className="h-4 w-4" />
        <Link href={`/cars?brand=${encodeURIComponent(car.brand)}`} className="font-medium hover:text-primary">{car.brand}</Link>
        <ChevronRight className="h-4 w-4" />
        <span className="line-clamp-1 text-ink">{car.title}</span>
      </nav>

      <div className="grid gap-8 lg:grid-cols-[1.5fr_1fr] lg:gap-12">
        <div className="min-w-0 animate-rise">
          <ImageGallery images={car.images ?? []} alt={car.title} sold={sold} />

          {car.description && (
            <section className="mt-10">
              <h2 className="font-heading text-2xl font-bold text-ink">About this car</h2>
              <p className="mt-3 whitespace-pre-line text-lg leading-relaxed text-muted-foreground">{car.description}</p>
            </section>
          )}

          {!sold && (
            <section id="finance" className="mt-12 scroll-mt-28">
              <h2 className="font-heading text-2xl font-bold text-ink">Estimate your monthly payment</h2>
              <p className="mt-1 text-muted-foreground">See what leasing or financing this car could cost.</p>
              <div className="mt-5">
                <FinanceCalculator
                  compact
                  settings={finance}
                  whatsapp={whatsappNumber || undefined}
                  start={{ price, down: down ?? undefined, category: categoryForYear(car.year), title: car.title }}
                />
              </div>
            </section>
          )}

          <section className="mt-10">
            <h2 className="font-heading text-2xl font-bold text-ink">Specifications</h2>
            <dl className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3">
              {[{ icon: Tag, label: "Brand", value: car.brand }, { icon: Tag, label: "Model", value: car.model }, ...facts]
                .filter((f) => f.value)
                .map((f) => (
                  <div key={f.label} className="flex items-start gap-3 rounded-2xl bg-card p-4 ring-1 ring-border">
                    <f.icon className="mt-0.5 h-5 w-5 shrink-0 text-primary" />
                    <div className="min-w-0">
                      <dt className="text-sm text-muted-foreground">{f.label}</dt>
                      <dd className="truncate font-semibold text-ink">{f.value}</dd>
                    </div>
                  </div>
                ))}
            </dl>
          </section>
        </div>

        <aside className="animate-rise rise-2 lg:sticky lg:top-28 lg:self-start">
          <div className="rounded-3xl bg-card p-6 shadow-xl shadow-primary/10 ring-1 ring-border md:p-7">
            <div className="flex flex-wrap items-center gap-2">
              <span className="rounded-full bg-muted px-3 py-1 text-sm font-semibold text-muted-foreground">
                {car.year} · {car.brand}
              </span>
              {off > 0 && (
                <span className="rounded-full bg-destructive px-3 py-1 text-sm font-bold text-white">{off}% off</span>
              )}
              {sold && <span className="rounded-full bg-ink px-3 py-1 text-sm font-bold text-white">Sold</span>}
            </div>

            <h1 className="mt-4 font-heading text-3xl font-extrabold leading-tight text-ink">{car.title}</h1>

            <div className="mt-5">
              {off > 0 && (
                <p className="text-base text-muted-foreground">
                  <span className="line-through">{lkr(original)}</span>{" "}
                  <span className="font-semibold text-destructive">Save {lkr(original - price)}</span>
                </p>
              )}
              <p className={`font-heading text-4xl font-extrabold ${sold ? "text-muted-foreground" : "text-primary"}`}>
                {lkr(price)}
              </p>
              {down && (
                <p className="mt-3 flex items-center gap-3 rounded-2xl bg-accent/25 px-4 py-3 text-ink">
                  <Wallet className="h-5 w-5 shrink-0" />
                  <span className="text-sm">
                    Down payment
                    <span className="block font-heading text-lg font-extrabold">{lkr(down)}</span>
                  </span>
                </p>
              )}
            </div>

            {sold ? (
              <div className="mt-6 rounded-2xl bg-muted p-4">
                <p className="flex items-center gap-2 font-semibold text-ink">
                  <CircleAlert className="h-5 w-5 text-muted-foreground" /> This car has been sold
                </p>
                <p className="mt-1 text-sm text-muted-foreground">Looking for something similar? We have more.</p>
                <Link href={`/cars?brand=${encodeURIComponent(car.brand)}`} className={`${buttonVariants({ variant: "default" })} mt-4 w-full`}>
                  More {car.brand} cars
                </Link>
              </div>
            ) : (
              <div className="mt-6 grid gap-3">
                {whatsappHref && (
                  <TrackLink
                    carId={car.id}
                    type="whatsapp"
                    href={whatsappHref}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex h-12 items-center justify-center gap-2 rounded-full bg-green-700 px-6 text-base font-semibold text-white transition-all duration-200 hover:bg-green-800 hover:shadow-lg hover:shadow-green-900/20 active:scale-[0.98]"
                  >
                    <MessageCircle className="h-5 w-5" /> Chat on WhatsApp
                  </TrackLink>
                )}
                {telHref && (
                  <TrackLink carId={car.id} type="call" href={telHref} className={buttonVariants({ variant: "outline", size: "lg" })}>
                    <Phone className="h-5 w-5" /> Call {contact.phone}
                  </TrackLink>
                )}
                {!whatsappHref && !telHref && (
                  <Link href="/contact" className={buttonVariants({ variant: "accent", size: "lg" })}>Enquire about this car</Link>
                )}
              </div>
            )}

            {!sold && (
              <div>
                <TestDriveForm carId={car.id} carTitle={car.title} />
              </div>
            )}

            {!sold && (
              <a href="#finance" className="mt-4 block text-center text-sm font-semibold text-primary underline-offset-4 hover:underline">
                Estimate monthly payment
              </a>
            )}
            <p className="mt-3 text-center text-sm text-muted-foreground">
              Mention the listing title when you get in touch.
            </p>
          </div>
        </aside>
      </div>

      {related.length > 0 && (
        <section className="pt-20">
          <SectionHeading
            title={`More ${car.brand} cars`}
            action={{ href: `/cars?brand=${encodeURIComponent(car.brand)}`, label: `All ${car.brand}` }}
          />
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {related.map((c) => (
              <CarCard key={c.id} car={c} />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
