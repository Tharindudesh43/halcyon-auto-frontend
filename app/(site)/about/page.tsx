import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { getSettings } from "@/lib/settings";
import { buttonVariants } from "@/components/ui/button";

export const metadata: Metadata = { title: "About us" };

export default async function AboutPage() {
  const { about } = await getSettings();
  const paragraphs = (about.body ?? "")
    .split(/\n\s*\n/)
    .map((p) => p.trim())
    .filter(Boolean);
  const [lead, ...rest] = paragraphs;

  return (
    <div className="container-page page-top pb-8">
      <header className="max-w-3xl animate-rise">
        {about.eyebrow && (
          <span className="inline-block rounded-full bg-accent/25 px-4 py-1.5 text-sm font-semibold text-ink">
            {about.eyebrow}
          </span>
        )}
        <h1 className="mt-5 font-heading text-4xl font-extrabold leading-[1.05] text-ink md:text-6xl">{about.title}</h1>
      </header>

      <div className={`mt-12 grid gap-10 ${about.image ? "lg:grid-cols-2 lg:items-start" : "max-w-3xl"}`}>
        <div className="animate-rise rise-1 space-y-5">
          {lead && <p className="text-xl leading-relaxed text-ink md:text-2xl">{lead}</p>}
          {rest.map((p, i) => (
            <p key={i} className="whitespace-pre-line text-lg leading-relaxed text-muted-foreground">
              {p}
            </p>
          ))}
        </div>

        {about.image && (
          <img
            src={about.image}
            alt={about.title}
            className="animate-rise rise-2 aspect-[4/3] w-full rounded-3xl object-cover shadow-xl shadow-primary/10 lg:sticky lg:top-28"
          />
        )}
      </div>

      <div className="mt-14 flex flex-wrap gap-3">
        <Link href="/cars" className={buttonVariants({ variant: "default", size: "lg" })}>
          Browse cars <ArrowRight className="h-5 w-5" />
        </Link>
        <Link href="/contact" className={buttonVariants({ variant: "outline", size: "lg" })}>
          Get in touch
        </Link>
      </div>
    </div>
  );
}
