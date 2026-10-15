import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, Calendar, Percent, Scale, UserCheck } from "lucide-react";
import { getSettings } from "@/lib/settings";
import { digitsOnly } from "@/lib/format";
import { FinanceCalculator } from "@/components/site/finance-calculator";
import { buttonVariants } from "@/components/ui/button";

export const metadata: Metadata = {
  title: "Finance calculator",
  description:
    "Estimate your monthly car lease or loan payment in Sri Lanka. Choose the down payment, interest rate and duration.",
};

export default async function FinancePage() {
  const { finance, contact } = await getSettings();
  const whatsapp = digitsOnly(contact.whatsapp ?? "");

  const cards = [
    {
      icon: Scale,
      title: "Down payment rules",
      text: `The Central Bank limits how much of a car's price a lender can finance. Since 25 May 2026 that is ${finance.ltv_used}% for vehicles registered over a year and ${finance.ltv_new}% for new or recently registered ones so you need at least ${100 - finance.ltv_used}% or ${100 - finance.ltv_new}% down.`,
    },
    {
      icon: Calendar,
      title: "How long to pay",
      text: `Lease and loan terms usually run from 1 up to ${finance.max_years} years. A longer term lowers the monthly payment but you pay more interest overall compare them in the table.`,
    },
    {
      icon: Percent,
      title: "Flat vs reducing rate",
      text: "A flat rate charges interest on the full amount for the entire term, so it is far more expensive than the same number on a reducing-balance loan. Always compare the effective rate.",
    },
    {
      icon: UserCheck,
      title: "What lenders look at",
      text: "Mostly your income, your other monthly commitments and your credit history. Many lenders like total monthly payments to stay under roughly 35% of net income.",
    },
  ];

  return (
    <div className="container-page page-top pb-8">
      <header className="max-w-3xl animate-rise">
        <span className="inline-block rounded-full bg-accent/25 px-4 py-1.5 text-sm font-semibold text-ink">
          Finance calculator
        </span>
        <h1 className="mt-5 font-heading text-4xl font-extrabold leading-[1.05] text-ink md:text-6xl">
          Know your monthly payment before you visit
        </h1>
        <p className="mt-5 text-xl text-muted-foreground">
          Try different down payments, interest rates and durations. See the total cost, compare terms, and check the
          down payment lenders will actually ask for.
        </p>
      </header>

      <div className="mt-12 animate-rise rise-1">
        <FinanceCalculator settings={finance} whatsapp={whatsapp || undefined} />
      </div>

      <section className="mt-20" aria-labelledby="how-it-works">
        <h2 id="how-it-works" className="font-heading text-3xl font-extrabold text-ink md:text-4xl">
          Good to know before you borrow
        </h2>
        <div className="mt-8 grid gap-5 md:grid-cols-2">
          {cards.map((c) => (
            <div key={c.title} className="reveal flex gap-5 rounded-3xl bg-card p-6 ring-1 ring-border md:p-7">
              <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-primary text-white">
                <c.icon className="h-6 w-6" />
              </span>
              <div>
                <h3 className="font-heading text-lg font-bold text-ink">{c.title}</h3>
                <p className="mt-1.5 text-muted-foreground">{c.text}</p>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-10 flex flex-wrap gap-3">
          <Link href="/cars" className={buttonVariants({ variant: "default", size: "lg" })}>
            Browse cars <ArrowRight className="h-5 w-5" />
          </Link>
          <Link href="/faq" className={buttonVariants({ variant: "outline", size: "lg" })}>Read the FAQ</Link>
        </div>
      </section>
    </div>
  );
}
