import Link from "next/link";
import { ExternalLink } from "lucide-react";
import { getSettings } from "@/lib/settings";
import { PageHeader } from "@/components/admin/page-header";
import {
  AboutForm,
  ContactSettingsForm,
  FinanceForm,
  HeroForm,
  PopupForm,
  TrustForm,
  LocationForm
} from "@/components/admin/content-forms";
import { cn } from "@/lib/utils";

const TABS = [
  { key: "hero", label: "Hero media", href: "/", blurb: "The home page banner - image, GIF or video, with a separate version for phones." },
  { key: "contact", label: "Owner contact", href: "/contact", blurb: "Phone, WhatsApp, email, opening hours and social links." },
  { key: "location", label: "Location", href: "/contact", blurb: "Address, map and the Get directions button." },
  { key: "about", label: "About us", href: "/about", blurb: "Your story and an optional photo." },
  { key: "trust", label: "Our trust", href: "/our-trust", blurb: "The trust points shown on the Our Trust page." },
  { key: "finance", label: "Finance", href: "/finance", blurb: "Defaults and down-payment rules for the finance calculator." },
  { key: "popup", label: "Pop-up ad", href: "/", blurb: "The image ad that opens over the site." },
] as const;

export default async function WebsiteContentPage({
  searchParams,
}: {
  searchParams: Promise<{ tab?: string }>;
}) {
  const { tab } = await searchParams;
  const active = TABS.find((t) => t.key === tab) ?? TABS[0];
  const settings = await getSettings();

  return (
    <div className="mx-auto max-w-3xl">
      <PageHeader
        title="Website content"
        description={active.blurb}
        action={
          <Link
            href={active.href}
            target="_blank"
            className="inline-flex h-10 items-center gap-2 rounded-xl bg-white px-4 text-sm font-medium text-slate-700 ring-1 ring-slate-200 transition-colors hover:bg-slate-50"
          >
            View page <ExternalLink className="h-4 w-4" />
          </Link>
        }
      />

      <nav aria-label="Website sections" className="mb-6 flex flex-wrap gap-2">
        {TABS.map((t) => (
          <Link
            key={t.key}
            href={`/admin/content?tab=${t.key}`}
            aria-current={t.key === active.key ? "page" : undefined}
            className={cn(
              "rounded-full px-4 py-2 text-sm font-medium transition-colors",
              t.key === active.key
                ? "bg-indigo-600 text-white shadow"
                : "bg-white text-slate-600 ring-1 ring-slate-200 hover:bg-slate-100"
            )}
          >
            {t.label}
          </Link>
        ))}
      </nav>

      {active.key === "hero" && <HeroForm key="hero" initial={settings.hero} />}
      {active.key === "contact" && <ContactSettingsForm key="contact" initial={settings.contact} />}
      {active.key === "about" && <AboutForm key="about" initial={settings.about} />}
      {active.key === "trust" && <TrustForm key="trust" initial={settings.trust} />}
      {active.key === "location" && <LocationForm key="location" initial={settings.location} />}
      {active.key === "finance" && <FinanceForm key="finance" initial={settings.finance} />}
      {active.key === "popup" && <PopupForm key="popup" initial={settings.popup} />}
    </div>
  );
}
