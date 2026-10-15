import { ArrowUpRight, Clock, MapPin } from "lucide-react";
import type { LocationSettings } from "@/lib/settings-types";
import { directionsUrl, mapEmbedUrl, mapQuery } from "@/lib/location";
import { ConsentMap } from "./consent-map";
import { cn } from "@/lib/utils";

export function LocationCard({
  location,
  hours,
  className,
}: {
  location: LocationSettings;
  hours?: string | null;
  className?: string;
}) {
  if (!mapQuery(location)) return null;

  return (
    <div className={cn("grid gap-4 lg:grid-cols-[1.7fr_1fr]", className)}>
      <div className="h-64 overflow-hidden rounded-3xl bg-muted ring-1 ring-border sm:h-80 lg:h-full lg:min-h-[18rem]">
        <ConsentMap src={mapEmbedUrl(location)} title={`Map: ${location.name ?? "our location"}`} />
      </div>

      <div className="flex flex-col justify-center rounded-3xl bg-card p-6 ring-1 ring-border md:p-8">
        <span className="flex h-14 w-14 items-center justify-center rounded-full bg-accent/25 text-ink">
          <MapPin className="h-6 w-6" />
        </span>
        {location.name && <h3 className="mt-5 font-heading text-xl font-bold text-ink md:text-2xl">{location.name}</h3>}
        {location.address && <p className="mt-1.5 text-lg text-muted-foreground">{location.address}</p>}
        {hours && (
          <p className="mt-3 flex items-start gap-2 text-sm text-muted-foreground">
            <Clock className="mt-0.5 h-4 w-4 shrink-0 text-primary" /> {hours}
          </p>
        )}
        <a
          href={directionsUrl(location)}
          target="_blank"
          rel="noopener noreferrer"
          className="group mt-5 inline-flex items-center gap-1.5 text-base font-semibold text-primary"
        >
          <span className="underline-offset-4 group-hover:underline">Get directions</span>
          <ArrowUpRight className="h-4 w-4 transition-transform duration-200 group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
        </a>
      </div>
    </div>
  );
}
