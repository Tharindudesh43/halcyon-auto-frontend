import Link from "next/link";
import { Clock, Mail, MapPin, Phone } from "lucide-react";
import { Logo } from "./logo";
import { getSettings } from "@/lib/settings";
import { directionsUrl } from "@/lib/location";
import { CookieSettingsButton } from "./cookie-banner";
import { digitsOnly } from "@/lib/format";

const EXPLORE = [
  { href: "/cars", label: "Cars for sale" },
  { href: "/finance", label: "Finance calculator" },
  { href: "/articles", label: "Articles" },
  { href: "/faq", label: "FAQ" },
  { href: "/our-trust", label: "Our trust" },
  { href: "/about", label: "About us" },
  { href: "/careers", label: "Careers" },
  { href: "/contact", label: "Contact" },
];

export default async function Footer() {
  const { contact, location } = await getSettings();
  const socials = [
    { label: "Facebook", href: contact.facebook },
    { label: "Instagram", href: contact.instagram },
    { label: "TikTok", href: contact.tiktok },
  ].filter((s) => s.href) as { label: string; href: string }[];

  const linkCls = "inline-flex items-center gap-2.5 text-white/70 transition-colors hover:text-white";

  return (
    <footer className="mt-24 bg-lagoon-deep text-white">
      <div className="container-page grid gap-12 py-16 md:grid-cols-2 lg:grid-cols-[1.4fr_1fr_1.2fr]">
        <div>
          <Logo light />
          <p className="mt-5 max-w-sm text-white/70">
            Carefully checked cars across Sri Lanka, and a real person on the other end of every message.
          </p>
          {socials.length > 0 && (
            <div className="mt-6 flex flex-wrap gap-2">
              {socials.map((s) => (
                <a
                  key={s.label}
                  href={s.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="rounded-full border border-white/20 px-4 py-2 text-sm font-medium text-white/80 transition-colors hover:border-accent hover:text-accent"
                >
                  {s.label}
                </a>
              ))}
            </div>
          )}
        </div>

        <nav aria-label="Footer">
          <h2 className="font-heading text-base font-bold text-white">Explore</h2>
          <ul className="mt-5 space-y-3 text-sm">
            {EXPLORE.map((l) => (
              <li key={l.href}>
                <Link href={l.href} className={linkCls}>
                  {l.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        <div>
          <h2 className="font-heading text-base font-bold text-white">Talk to us</h2>
          <ul className="mt-5 space-y-3 text-sm">
            {contact.phone && (
              <li>
                <a href={`tel:+${digitsOnly(contact.phone)}`} className={linkCls}>
                  <Phone className="h-4 w-4 shrink-0 text-accent" /> {contact.phone}
                </a>
              </li>
            )}
            {contact.email && (
              <li>
                <a href={`mailto:${contact.email}`} className={`${linkCls} break-all`}>
                  <Mail className="h-4 w-4 shrink-0 text-accent" /> {contact.email}
                </a>
              </li>
            )}
            {location.address && (
              <li className="flex items-start gap-2.5 text-white/70">
                <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-accent" />
                <span>
                  {location.name && <span className="block font-semibold text-white">{location.name}</span>}
                  {location.address}
                  <a
                    href={directionsUrl(location)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mt-1 block font-semibold text-accent underline-offset-4 hover:underline"
                  >
                    Get directions
                  </a>
                </span>
              </li>
            )}
            {contact.hours && (
              <li className="flex items-start gap-2.5 text-white/70">
                <Clock className="mt-0.5 h-4 w-4 shrink-0 text-accent" /> {contact.hours}
              </li>
            )}
          </ul>
        </div>
      </div>

      <div className="border-t border-white/10">
        <div className="container-page flex flex-wrap items-center justify-between gap-3 py-6 text-sm text-white/50">
          <p>© {new Date().getFullYear()} Halcyon Auto. All rights reserved.</p>
          <div className="flex gap-5">
            <Link href="/privacy" className="transition-colors hover:text-white">Privacy &amp; cookies</Link>
            <CookieSettingsButton className="transition-colors hover:text-white" />
          </div>
        </div>
      </div>
    </footer>
  );
}
