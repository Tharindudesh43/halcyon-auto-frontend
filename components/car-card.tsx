import Link from "next/link";
import { ArrowUpRight, Calendar, Camera, Fuel, Gauge, Settings2, Wallet } from "lucide-react";
import type { CarListing } from "@/lib/types";
import { finalPrice, isNewListing, lkr } from "@/lib/format";
import { carHref } from "@/lib/cars";
import { cld, cldSrcSet } from "@/lib/cloudinary";
import { cn } from "@/lib/utils";

export function CarCard({ car, priority = false }: { car: CarListing; priority?: boolean }) {
  const photos = car.images?.filter(Boolean) ?? [];
  const sold = car.status === "sold";
  const off = sold ? 0 : car.discount_percent ?? 0;
  const original = Number(car.price);
  const price = finalPrice(car);
  const fresh = !sold && isNewListing(car.created_at);
  const down = !sold && car.down_payment && Number(car.down_payment) > 0 ? Number(car.down_payment) : null;

  const specs = [
    { icon: Calendar, value: car.year },
    { icon: Fuel, value: car.power_source },
    { icon: Settings2, value: car.transmission },
    { icon: Gauge, value: car.mileage },
  ].filter((s) => s.value) as { icon: typeof Calendar; value: string | number }[];

  return (
    <Link
      href={carHref(car)}
      className="group flex h-full flex-col overflow-hidden rounded-3xl bg-card ring-1 ring-border transition-all duration-300 hover:-translate-y-1.5 hover:shadow-2xl hover:shadow-primary/15 hover:ring-primary/30"
    >
      <div className="relative aspect-[4/3] overflow-hidden bg-muted">
        {photos[0] ? (
          <img
            src={cld(photos[0], 640)}
            srcSet={cldSrcSet(photos[0], [400, 640, 800])}
            sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
            alt={car.title}
            loading={priority ? "eager" : "lazy"}
            decoding="async"
            className={cn(
              "h-full w-full object-cover transition-transform duration-700 ease-out group-hover:scale-[1.06]",
              sold && "grayscale-[55%]"
            )}
          />
        ) : (
          <div className="flex h-full items-center justify-center text-sm text-muted-foreground">No photo yet</div>
        )}

        <div className="pointer-events-none absolute inset-x-0 bottom-0 h-1/3 bg-gradient-to-t from-black/40 to-transparent" />

        <div className="absolute left-3 top-3 flex flex-wrap gap-2">
          {sold && (
            <span className="rounded-full bg-ink px-3 py-1 text-xs font-bold text-white">Sold</span>
          )}
          {fresh && (
            <span className="rounded-full bg-accent px-3 py-1 text-xs font-bold text-accent-foreground">Just listed</span>
          )}
        </div>
        {off > 0 && (
          <span className="absolute right-3 top-3 rounded-full bg-destructive px-3 py-1 text-xs font-bold text-white shadow-lg">
            {off}% off
          </span>
        )}
        {photos.length > 1 && (
          <span className="absolute bottom-3 right-3 inline-flex items-center gap-1.5 rounded-full bg-black/55 px-2.5 py-1 text-xs font-medium text-white backdrop-blur">
            <Camera className="h-3.5 w-3.5" /> {photos.length}
          </span>
        )}
      </div>

      <div className="flex flex-1 flex-col p-4 sm:p-5">
        <h3 className="line-clamp-1 font-heading text-lg font-bold text-ink transition-colors group-hover:text-primary">
          {car.title}
        </h3>
        <p className="text-sm text-muted-foreground">
          {car.brand} {car.model}
        </p>

        {specs.length > 0 && (
          <ul className="mt-4 grid grid-cols-2 gap-x-3 gap-y-2 text-sm text-muted-foreground">
            {specs.map((s, i) => (
              <li key={i} className="flex items-center gap-2">
                <s.icon className="h-4 w-4 shrink-0 text-primary" />
                <span className="truncate">{s.value}</span>
              </li>
            ))}
          </ul>
        )}

        <div className="mt-auto flex items-end justify-between gap-3 pt-5">
          <div>
            {off > 0 && <p className="text-sm text-muted-foreground line-through">{lkr(original)}</p>}
            <p className={cn("font-heading text-2xl font-extrabold", sold ? "text-muted-foreground" : "text-ink")}>
              {lkr(price)}
            </p>
            {down && (
              <p className="mt-1 inline-flex items-center gap-1.5 rounded-full bg-accent/25 px-2.5 py-1 text-xs font-semibold text-ink">
                <Wallet className="h-3.5 w-3.5" /> Down payment {lkr(down)}
              </p>
            )}
          </div>
          <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-muted text-ink transition-all duration-300 group-hover:bg-accent group-hover:text-accent-foreground">
            <ArrowUpRight className="h-5 w-5 transition-transform duration-300 group-hover:rotate-12" />
          </span>
        </div>
      </div>
    </Link>
  );
}
