import type { Metadata } from "next";
import { Briefcase, ChevronDown, Clock, Mail, MapPin, MessageCircle, Wallet } from "lucide-react";
import { listOpenCareers } from "@/lib/careers";
import { getSettings } from "@/lib/settings";
import { digitsOnly } from "@/lib/format";
import { buttonVariants } from "@/components/ui/button";

export const metadata: Metadata = {
  title: "Careers",
  description: "Join the Halcyon Auto team. See our current job openings.",
};

const formatDate = (iso: string) =>
  new Date(`${iso}T00:00:00Z`).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric", timeZone: "UTC" });

const lines = (text: string | null) =>
  (text ?? "").split("\n").map((l) => l.replace(/^[-•*]\s*/, "").trim()).filter(Boolean);

export default async function CareersPage() {
  const [jobs, { contact }] = await Promise.all([listOpenCareers(), getSettings()]);
  const whatsapp = digitsOnly(contact.whatsapp ?? "");

  return (
    <div className="container-page page-top pb-8">
      <header className="max-w-3xl animate-rise">
        <span className="inline-block rounded-full bg-accent/25 px-4 py-1.5 text-sm font-semibold text-ink">
          {jobs.length > 0 ? `${jobs.length} open ${jobs.length === 1 ? "role" : "roles"}` : "Careers"}
        </span>
        <h1 className="mt-5 font-heading text-4xl font-extrabold leading-[1.05] text-ink md:text-6xl">
          Join the Halcyon Auto team
        </h1>
        <p className="mt-5 text-xl text-muted-foreground">
          We&apos;re always glad to meet friendly, honest people who love cars. Have a look at what&apos;s open right now.
        </p>
      </header>

      <div className="mt-12 space-y-4">
        {jobs.length === 0 ? (
          <div className="animate-pop rounded-3xl border-2 border-dashed border-border bg-card px-6 py-16 text-center">
            <span className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-muted">
              <Briefcase className="h-7 w-7 text-muted-foreground" />
            </span>
            <h2 className="mt-5 font-heading text-2xl font-bold text-ink">No openings right now</h2>
            <p className="mx-auto mt-2 max-w-md text-muted-foreground">
              Nothing is open at the moment, but we&apos;d still love to hear from you. Send us your CV and we&apos;ll keep it on file.
            </p>
            {contact.email && (
              <a
                href={`mailto:${contact.email}?subject=${encodeURIComponent("CV — general application")}`}
                className={`${buttonVariants({ variant: "accent", size: "lg" })} mt-7`}
              >
                <Mail className="h-5 w-5" /> Email your CV
              </a>
            )}
          </div>
        ) : (
          jobs.map((job) => {
            const requirements = lines(job.requirements);
            const paragraphs = (job.description ?? "").split(/\n\s*\n/).map((p) => p.trim()).filter(Boolean);
            return (
              <details
                key={job.id}
                id={`job-${job.id}`}
                className="reveal group overflow-hidden rounded-3xl bg-card ring-1 ring-border transition-shadow duration-300 open:shadow-xl open:shadow-primary/10 open:ring-primary/30 hover:ring-primary/30"
              >
                <summary className="flex cursor-pointer list-none items-start justify-between gap-4 p-6 md:p-8 [&::-webkit-details-marker]:hidden">
                  <div className="min-w-0">
                    <h2 className="font-heading text-xl font-bold text-ink md:text-2xl">{job.title}</h2>
                    <ul className="mt-3 flex flex-wrap gap-2 text-sm font-medium text-muted-foreground">
                      {job.department && <li className="rounded-full bg-muted px-3 py-1">{job.department}</li>}
                      {job.type && <li className="rounded-full bg-primary/10 px-3 py-1 text-primary">{job.type}</li>}
                      {job.location && (
                        <li className="inline-flex items-center gap-1.5 rounded-full bg-muted px-3 py-1">
                          <MapPin className="h-3.5 w-3.5" /> {job.location}
                        </li>
                      )}
                      {job.salary && (
                        <li className="inline-flex items-center gap-1.5 rounded-full bg-muted px-3 py-1">
                          <Wallet className="h-3.5 w-3.5" /> {job.salary}
                        </li>
                      )}
                    </ul>
                    {job.closing_date && (
                      <p className="mt-3 flex items-center gap-1.5 text-sm text-muted-foreground">
                        <Clock className="h-4 w-4" /> Apply by {formatDate(job.closing_date)}
                      </p>
                    )}
                  </div>
                  <span className="mt-1 flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-muted text-ink transition-all duration-300 group-open:rotate-180 group-open:bg-accent">
                    <ChevronDown className="h-5 w-5" />
                  </span>
                </summary>

                <div className="border-t border-border px-6 pb-8 pt-6 md:px-8">
                  {paragraphs.map((p, i) => (
                    <p key={i} className="mb-4 whitespace-pre-line text-lg leading-relaxed text-muted-foreground">{p}</p>
                  ))}

                  {requirements.length > 0 && (
                    <>
                      <h3 className="mt-6 font-heading text-lg font-bold text-ink">What we&apos;re looking for</h3>
                      <ul className="mt-3 space-y-2">
                        {requirements.map((r, i) => (
                          <li key={i} className="flex gap-3 text-muted-foreground">
                            <span className="mt-2.5 h-1.5 w-1.5 shrink-0 rounded-full bg-primary" />
                            {r}
                          </li>
                        ))}
                      </ul>
                    </>
                  )}

                  <div className="mt-8 flex flex-wrap gap-3">
                    {contact.email && (
                      <a
                        href={`mailto:${contact.email}?subject=${encodeURIComponent(`Application: ${job.title}`)}`}
                        className={buttonVariants({ variant: "default", size: "lg" })}
                      >
                        <Mail className="h-5 w-5" /> Apply by email
                      </a>
                    )}
                    {whatsapp && (
                      <a
                        href={`https://wa.me/${whatsapp}?text=${encodeURIComponent(`Hi, I'd like to apply for the ${job.title} role at Halcyon Auto.`)}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className={buttonVariants({ variant: "outline", size: "lg" })}
                      >
                        <MessageCircle className="h-5 w-5" /> WhatsApp us
                      </a>
                    )}
                  </div>
                </div>
              </details>
            );
          })
        )}
      </div>
    </div>
  );
}
