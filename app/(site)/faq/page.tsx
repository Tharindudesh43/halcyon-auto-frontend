import type { Metadata } from "next";
import Link from "next/link";
import { MessageCircle } from "lucide-react";
import { listFaqs } from "@/lib/faqs";
import { getSettings } from "@/lib/settings";
import { digitsOnly } from "@/lib/format";
import { FaqList } from "@/components/site/faq-list";
import { buttonVariants } from "@/components/ui/button";

export const metadata: Metadata = {
  title: "FAQ",
  description: "Answers to common questions about buying, financing and selling a car with Halcyon Auto.",
};

export default async function FaqPage() {
  const [faqs, { contact }] = await Promise.all([listFaqs(), getSettings()]);
  const whatsapp = digitsOnly(contact.whatsapp ?? "");

  const jsonLd = JSON.stringify({
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faqs.map((f) => ({
      "@type": "Question",
      name: f.question,
      acceptedAnswer: { "@type": "Answer", text: f.answer },
    })),
  }).replace(/</g, "\\u003c");

  return (
    <div className="container-page page-top pb-8">
      <header className="max-w-3xl animate-rise">
        <h1 className="font-heading text-4xl font-extrabold leading-[1.05] text-ink md:text-6xl">Questions, answered</h1>
        <p className="mt-5 text-xl text-muted-foreground">
          Quick answers about buying, financing and selling. Can&apos;t find yours? Just message us.
        </p>
      </header>

      <div className="mt-12 max-w-4xl">
        {faqs.length === 0 ? (
          <div className="rounded-3xl border-2 border-dashed border-border bg-card px-6 py-16 text-center">
            <h2 className="font-heading text-2xl font-bold text-ink">Nothing here yet</h2>
            <p className="mt-2 text-muted-foreground">We&apos;re putting the answers together. In the meantime, ask us directly.</p>
          </div>
        ) : (
          <FaqList faqs={faqs} />
        )}

        <div className="mt-12 flex flex-wrap items-center justify-between gap-4 rounded-3xl bg-gradient-to-br from-lagoon to-primary p-7 text-white md:p-9">
          <div>
            <h2 className="font-heading text-2xl font-extrabold">Still have a question?</h2>
            <p className="mt-1 text-white/80">A real person will get back to you.</p>
          </div>
          <div className="flex flex-wrap gap-3">
            <Link href="/contact" className={buttonVariants({ variant: "accent" })}>Contact us</Link>
            {whatsapp && (
              <a href={`https://wa.me/${whatsapp}`} target="_blank" rel="noopener noreferrer" className={buttonVariants({ variant: "glass" })}>
                <MessageCircle className="h-4 w-4" /> WhatsApp
              </a>
            )}
          </div>
        </div>
      </div>

      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: jsonLd }} />
    </div>
  );
}
