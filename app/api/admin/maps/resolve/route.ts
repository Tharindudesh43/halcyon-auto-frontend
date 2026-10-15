import { NextRequest, NextResponse } from "next/server";
import { isGoogleMapsHost, parseMapsUrl } from "@/lib/maps";

const MAX_HOPS = 6;

function allowed(url: URL) {
  return url.protocol === "https:" && isGoogleMapsHost(url.hostname);
}

export async function GET(request: NextRequest) {
  const raw = request.nextUrl.searchParams.get("url")?.trim();
  if (!raw) return NextResponse.json({ message: "Paste a Google Maps link." }, { status: 400 });

  let current: URL;
  try {
    current = new URL(raw);
  } catch {
    return NextResponse.json({ message: "That doesn't look like a link." }, { status: 400 });
  }
  if (!allowed(current)) {
    return NextResponse.json({ message: "Please paste a link from Google Maps." }, { status: 400 });
  }

  try {
    for (let hop = 0; hop <= MAX_HOPS; hop++) {
      const parsed = parseMapsUrl(current.toString());
      if (parsed) return NextResponse.json(parsed);

      const res = await fetch(current, {
        redirect: "manual",
        headers: { "User-Agent": "Mozilla/5.0 (compatible; HalcyonAuto/1.0)" },
        signal: AbortSignal.timeout(7000),
      });
      const location = res.headers.get("location");
      if (!location) break;

      const next = new URL(location, current);
      if (!allowed(next)) break;
      current = next;
    }
  } catch {
    return NextResponse.json({ message: "Couldn't open that link. Check it and try again." }, { status: 422 });
  }

  return NextResponse.json(
    { message: "Couldn't find a location in that link. Open the place in Google Maps and copy the link from the address bar." },
    { status: 422 }
  );
}
