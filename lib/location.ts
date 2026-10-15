import type { LocationSettings } from "./settings-types";

export function mapQuery(loc: LocationSettings) {
  return loc.map_query?.trim() || [loc.name, loc.address].filter(Boolean).join(", ");
}

export function mapEmbedUrl(loc: LocationSettings) {
  return `https://www.google.com/maps?q=${encodeURIComponent(mapQuery(loc))}&output=embed`;
}

export function directionsUrl(loc: LocationSettings) {
  return (
    loc.directions_url?.trim() ||
    `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(mapQuery(loc))}`
  );
}
