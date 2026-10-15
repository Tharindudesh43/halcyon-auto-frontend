
export type ParsedMapLink = {
  query: string;
  lat: number | null;
  lng: number | null;
  name: string | null;
};

export function isGoogleMapsHost(hostname: string) {
  return (
    hostname === "maps.app.goo.gl" ||
    hostname === "goo.gl" ||
    /^(www\.|maps\.|consent\.)?google\.[a-z.]{2,6}$/.test(hostname)
  );
}

const COORDS = /^\s*(-?\d{1,3}(?:\.\d+)?)\s*,\s*(-?\d{1,3}(?:\.\d+)?)\s*$/;

function safeDecode(s: string) {
  try {
    return decodeURIComponent(s.replace(/\+/g, " "));
  } catch {
    return s;
  }
}

function inRange(lat: number, lng: number) {
  return Math.abs(lat) <= 90 && Math.abs(lng) <= 180;
}

export function parseMapsUrl(input: string): ParsedMapLink | null {
  let url: URL;
  try {
    url = new URL(input.trim());
  } catch {
    return null;
  }

  const wrapped = url.searchParams.get("continue");
  if (wrapped && url.hostname.startsWith("consent.")) return parseMapsUrl(wrapped);

  const full = safeDecode(url.pathname + url.search + url.hash);
  let lat: number | null = null;
  let lng: number | null = null;

  const pin = full.match(/!3d(-?\d+(?:\.\d+)?)!4d(-?\d+(?:\.\d+)?)/);
  const centre = full.match(/@(-?\d+(?:\.\d+)?),(-?\d+(?:\.\d+)?)/);
  const found = pin ?? centre;
  if (found) {
    lat = Number(found[1]);
    lng = Number(found[2]);
  }

  let textQuery: string | null = null;
  for (const key of ["q", "query", "destination", "ll", "daddr"]) {
    const value = url.searchParams.get(key);
    if (!value) continue;
    const coords = value.match(COORDS);
    if (coords && lat === null) {
      lat = Number(coords[1]);
      lng = Number(coords[2]);
    } else if (!coords && !textQuery) {
      textQuery = value.trim();
    }
  }

  const place = url.pathname.match(/\/maps\/place\/([^/]+)/);
  const name = place ? safeDecode(place[1]).trim() : textQuery;

  if (lat !== null && lng !== null && inRange(lat, lng)) {
    return { query: `${lat},${lng}`, lat, lng, name: name && !COORDS.test(name) ? name : null };
  }
  if (name && !COORDS.test(name)) return { query: name, lat: null, lng: null, name };
  return null;
}
