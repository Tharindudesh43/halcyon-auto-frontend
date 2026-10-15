import type { Metadata } from "next";
import { Clock, Mail, MessageCircle, Phone, User, type LucideIcon } from "lucide-react";
import { ContactForm } from "@/components/site/contact-form";
import { LocationCard } from "@/components/site/location-card";
import { getSettings } from "@/lib/settings";
import { digitsOnly } from "@/lib/format";
import { buttonVariants } from "@/components/ui/button";

export const metadata: Metadata = { title: "Contact" };

type Row = { icon: LucideIcon; label: string; value: string; href?: string };

export default async function ContactPage() {
  const { contact, location } = await getSettings();

  const rows = [
    contact.owner_name && { icon: User, label: "Owner", value: contact.owner_name },
    contact.phone && { icon: Phone, label: "Phone", value: contact.phone, href: `tel:+${digitsOnly(contact.phone)}` },
    contact.email && { icon: Mail, label: "Email", value: contact.email, href: `mailto:${contact.email}` },
    contact.hours && { icon: Clock, label: "Opening hours", value: contact.hours },
  ].filter(Boolean) as Row[];

  const socials = [
    { label: "Facebook", href: contact.facebook },
    { label: "Instagram", href: contact.instagram },
    { label: "TikTok", href: contact.tiktok },
  ].filter((s) => s.href) as { label: string; href: string }[];

  const whatsapp = digitsOnly(contact.whatsapp ?? "");

  return (
    <div className="container-page page-top pb-8">
      <header className="max-w-3xl animate-rise">
        {contact.heading && (
          <h1 className="font-heading text-4xl font-extrabold leading-[1.05] text-ink md:text-6xl">{contact.heading}</h1>
        )}
        {contact.intro && <p className="mt-5 text-xl text-muted-foreground">{contact.intro}</p>}

        {(whatsapp || contact.phone) && (
          <div className="mt-8 flex flex-wrap gap-3">
            {whatsapp && (
              <a
                href={`https://wa.me/${whatsapp}`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex h-12 items-center justify-center gap-2 rounded-full bg-green-700 px-7 text-base font-semibold text-white transition-all hover:bg-green-800 hover:shadow-lg active:scale-[0.97]"
              >
                <MessageCircle className="h-5 w-5" /> Chat on WhatsApp
              </a>
            )}
            {contact.phone && (
              <a href={`tel:+${digitsOnly(contact.phone)}`} className={buttonVariants({ variant: "outline", size: "lg" })}>
                <Phone className="h-5 w-5" /> Call now
              </a>
            )}
          </div>
        )}
      </header>

      <div className="mt-14 grid gap-8 lg:grid-cols-[1fr_1.1fr]">
        <div className="animate-rise rise-1 space-y-4">
          {rows.map((row) => (
            <div key={row.label} className="flex items-center gap-4 rounded-2xl bg-card p-5 ring-1 ring-border transition-colors hover:ring-primary/30">
              <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
                <row.icon className="h-5 w-5" />
              </span>
              <div className="min-w-0">
                <p className="text-sm text-muted-foreground">{row.label}</p>
                {row.href ? (
                  <a href={row.href} className="break-words font-semibold text-ink transition-colors hover:text-primary">
                    {row.value}
                  </a>
                ) : (
                  <p className="font-semibold text-ink">{row.value}</p>
                )}
              </div>
            </div>
          ))}

          {socials.length > 0 && (
            <div className="flex flex-wrap gap-2 pt-2">
              {socials.map((s) => (
                <a
                  key={s.label}
                  href={s.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="rounded-full bg-card px-5 py-2.5 text-sm font-semibold text-ink ring-1 ring-border transition-colors hover:bg-primary hover:text-white hover:ring-primary"
                >
                  {s.label}
                </a>
              ))}
            </div>
          )}
        </div>

        <div className="animate-rise rise-2 rounded-3xl bg-card p-6 shadow-xl shadow-primary/10 ring-1 ring-border md:p-8">
          <ContactForm />
        </div>
      </div>

      <section className="mt-16" aria-labelledby="find-us">
        <h2 id="find-us" className="mb-6 font-heading text-3xl font-extrabold text-ink">Find us</h2>
        <LocationCard location={location} hours={contact.hours} />
      </section>
    </div>
  );
}
