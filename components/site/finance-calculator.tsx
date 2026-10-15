"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { CircleAlert, Info, MessageCircle, TriangleAlert } from "lucide-react";
import {
  buildSchedule,
  calculate,
  minDownPayment,
  monthlyPayment,
  type RateType,
  type VehicleCategory,
} from "@/lib/finance";
import type { FinanceSettings } from "@/lib/settings-types";
import { lkr } from "@/lib/format";
import { cn } from "@/lib/utils";

const field =
  "h-12 w-full rounded-2xl border border-input bg-card px-4 text-base font-semibold text-ink transition-colors hover:border-primary/50 focus:border-primary focus:outline-none focus:ring-2 focus:ring-ring/30";

const num = (v: string) => {
  const n = Number(v);
  return Number.isFinite(n) ? n : 0;
};

export type CalculatorStart = {
  price?: number;
  down?: number;
  category?: VehicleCategory;
  title?: string;
};

export function FinanceCalculator({
  settings,
  start,
  whatsapp,
  compact = false,
}: {
  settings: FinanceSettings;
  start?: CalculatorStart;
  whatsapp?: string;
  compact?: boolean;
}) {
  const initialCategory = start?.category ?? "used";
  const initialLtv = initialCategory === "used" ? settings.ltv_used : settings.ltv_new;
  const initialPrice = start?.price ?? 6_000_000;
  const initialDown = Math.max(start?.down ?? 0, minDownPayment(initialPrice, initialLtv));

  const [price, setPrice] = useState(String(Math.round(initialPrice)));
  const [category, setCategory] = useState<VehicleCategory>(initialCategory);
  const [down, setDown] = useState(String(Math.round(initialDown)));
  const [rate, setRate] = useState(String(settings.default_rate));
  const [type, setType] = useState<RateType>(settings.rate_type);
  const [years, setYears] = useState(Math.min(settings.default_years, settings.max_years));
  const [fees, setFees] = useState("0");
  const [income, setIncome] = useState("");

  const ltv = category === "used" ? settings.ltv_used : settings.ltv_new;
  const priceN = Math.max(num(price), 0);
  const downN = Math.min(Math.max(num(down), 0), priceN);
  const months = years * 12;
  const minDown = minDownPayment(priceN, ltv);
  const belowMin = priceN > 0 && downN < minDown;
  const downPct = priceN > 0 ? Math.round((downN / priceN) * 100) : 0;
  const minPct = 100 - ltv;

  const result = useMemo(
    () => calculate({ price: priceN, down: downN, fees: num(fees), ratePct: num(rate), months, type }),
    [priceN, downN, fees, rate, months, type]
  );

  const schedule = useMemo(() => buildSchedule(result.loan, num(rate), months, type), [result.loan, rate, months, type]);
  const yearly = useMemo(() => {
    const rows: { year: number; principal: number; interest: number; balance: number }[] = [];
    for (let y = 0; y < years; y++) {
      const slice = schedule.slice(y * 12, y * 12 + 12);
      if (!slice.length) break;
      rows.push({
        year: y + 1,
        principal: slice.reduce((a, r) => a + r.principal, 0),
        interest: slice.reduce((a, r) => a + r.interest, 0),
        balance: slice[slice.length - 1].balance,
      });
    }
    return rows;
  }, [schedule, years]);

  const durations = Array.from({ length: settings.max_years }, (_, i) => i + 1);
  const incomeN = num(income);
  const burden = incomeN > 0 ? (result.payment / incomeN) * 100 : null;

  const total = result.totalCost || 1;
  const seg = [
    { label: "Down payment", value: downN + num(fees), cls: "bg-primary" },
    { label: "Loan (principal)", value: result.loan, cls: "bg-accent" },
    { label: "Interest", value: result.totalInterest, cls: "bg-destructive/80" },
  ];

  function changeCategory(next: VehicleCategory) {
    setCategory(next);
    const nextLtv = next === "used" ? settings.ltv_used : settings.ltv_new;
    const needed = minDownPayment(priceN, nextLtv);
    if (downN < needed) setDown(String(needed));
  }

  return (
    <div className={cn("grid gap-6", !compact && "lg:grid-cols-[1.2fr_1fr] lg:gap-8")}>
      <div className="space-y-6 rounded-3xl bg-card p-5 ring-1 ring-border sm:p-7">
        {start?.title ? (
          <p className="rounded-2xl bg-muted px-4 py-3 text-sm text-muted-foreground">
            Estimating for <span className="font-semibold text-ink">{start.title}</span>. Adjust anything below.
          </p>
        ) : null}

        <div className="grid gap-5 sm:grid-cols-2">
          <label className="block space-y-2">
            <span className="text-sm font-semibold text-ink">Vehicle price (Rs)</span>
            <input
              type="number" inputMode="numeric" min={0} step={50000} value={price}
              onChange={(e) => setPrice(e.target.value)} className={field}
            />
          </label>

          <label className="block space-y-2">
            <span className="text-sm font-semibold text-ink">Vehicle category</span>
            <select value={category} onChange={(e) => changeCategory(e.target.value as VehicleCategory)} className={field}>
              <option value="used">Registered over 1 year</option>
              <option value="new">New or registered under 1 year</option>
            </select>
          </label>
        </div>

        {/* Down payment */}
        <div className="space-y-3">
          <div className="flex items-end justify-between gap-4">
            <label htmlFor="fc-down" className="text-sm font-semibold text-ink">Down payment (Rs)</label>
            <span className="text-sm font-semibold text-primary">{downPct}% of the price</span>
          </div>
          <input
            id="fc-down" type="number" inputMode="numeric" min={0} step={50000} value={down}
            onChange={(e) => setDown(e.target.value)} className={cn(field, belowMin && "border-destructive")}
          />
          <input
            type="range" min={0} max={90} step={1} value={Math.min(downPct, 90)}
            onChange={(e) => setDown(String(Math.round((priceN * Number(e.target.value)) / 100)))}
            aria-label="Down payment percentage" className="w-full accent-primary"
          />
          <p className="text-xs text-muted-foreground">
            Lenders can finance at most {ltv}% of this type of vehicle, so you need at least {minPct}% down ({lkr(minDown)}).
          </p>
          {belowMin && (
            <div role="alert" className="flex flex-wrap items-center gap-3 rounded-2xl bg-destructive/10 px-4 py-3 text-sm font-medium text-destructive">
              <TriangleAlert className="h-4 w-4 shrink-0" />
              <span className="flex-1">That&apos;s below the minimum. A lender is unlikely to approve it.</span>
              <button type="button" onClick={() => setDown(String(minDown))} className="rounded-full bg-destructive px-3.5 py-1.5 text-xs font-bold text-white">
                Use {lkr(minDown)}
              </button>
            </div>
          )}
        </div>

        {/* Rate */}
        <div className="grid gap-5 sm:grid-cols-2">
          <label className="block space-y-2">
            <span className="text-sm font-semibold text-ink">Interest rate (% a year)</span>
            <input
              type="number" inputMode="decimal" min={0} max={60} step={0.25} value={rate}
              onChange={(e) => setRate(e.target.value)} className={field}
            />
          </label>
          <fieldset className="space-y-2">
            <legend className="text-sm font-semibold text-ink">How the rate is charged</legend>
            <div className="grid grid-cols-2 gap-1 rounded-2xl bg-muted p-1">
              {(["reducing", "flat"] as const).map((t) => (
                <button
                  key={t} type="button" onClick={() => setType(t)} aria-pressed={type === t}
                  className={cn(
                    "h-10 rounded-xl text-sm font-semibold transition-all",
                    type === t ? "bg-card text-primary shadow-sm" : "text-muted-foreground hover:text-ink"
                  )}
                >
                  {t === "reducing" ? "Reducing" : "Flat"}
                </button>
              ))}
            </div>
          </fieldset>
        </div>
        <p className="-mt-3 flex items-start gap-2 text-xs text-muted-foreground">
          <Info className="mt-0.5 h-3.5 w-3.5 shrink-0" />
          {type === "reducing"
            ? "Reducing balance: interest is charged only on what you still owe the standard way."
            : "Flat rate: interest is charged on the full amount for the whole term, so the real yearly rate is much higher. See the effective rate on the right."}
        </p>

        {/* Duration */}
        <div className="space-y-3">
          <div className="flex items-end justify-between gap-4">
            <span className="text-sm font-semibold text-ink">Duration</span>
            <span className="text-sm font-semibold text-primary">
              {years} {years === 1 ? "year" : "years"} · {months} months
            </span>
          </div>
          <div className="flex flex-wrap gap-2" role="group" aria-label="Duration in years">
            {durations.map((y) => (
              <button
                key={y} type="button" onClick={() => setYears(y)} aria-pressed={years === y}
                className={cn(
                  "h-11 min-w-11 rounded-full px-4 text-sm font-bold transition-all active:scale-95",
                  years === y ? "bg-primary text-white shadow-md shadow-primary/30" : "bg-muted text-ink hover:bg-primary/10"
                )}
              >
                {y}
              </button>
            ))}
          </div>
        </div>

        <details className="group rounded-2xl bg-muted/60 px-4 py-3 open:bg-muted/60">
          <summary className="cursor-pointer list-none text-sm font-semibold text-ink [&::-webkit-details-marker]:hidden">
            More options <span className="font-normal text-muted-foreground"> fees and affordability</span>
          </summary>
          <div className="mt-4 grid gap-5 sm:grid-cols-2">
            <label className="block space-y-2">
              <span className="text-sm font-semibold text-ink">Processing &amp; documentation fees (Rs)</span>
              <input type="number" inputMode="numeric" min={0} step={5000} value={fees} onChange={(e) => setFees(e.target.value)} className={field} />
            </label>
            <label className="block space-y-2">
              <span className="text-sm font-semibold text-ink">Your monthly income (Rs)</span>
              <input type="number" inputMode="numeric" min={0} step={5000} value={income} onChange={(e) => setIncome(e.target.value)} placeholder="Optional" className={field} />
            </label>
          </div>
        </details>
      </div>

      <div className={cn("space-y-4", !compact && "lg:sticky lg:top-28 lg:self-start")}>
        <div className="overflow-hidden rounded-3xl bg-gradient-to-br from-lagoon to-primary p-6 text-white shadow-xl shadow-primary/20 sm:p-7">
          <p className="text-sm text-white/75">Estimated monthly payment</p>
          <p className="mt-1 font-heading text-5xl font-extrabold tracking-tight" aria-live="polite">
            {lkr(result.payment)}
          </p>
          <p className="mt-1 text-sm text-white/75">
            for {months} months · {rate || 0}% {type === "flat" ? "flat" : "reducing"}
          </p>

          <dl className="mt-6 grid grid-cols-2 gap-x-4 gap-y-4 border-t border-white/20 pt-5 text-sm">
            <div><dt className="text-white/70">Loan amount</dt><dd className="font-heading text-lg font-bold">{lkr(result.loan)}</dd></div>
            <div><dt className="text-white/70">Total interest</dt><dd className="font-heading text-lg font-bold">{lkr(result.totalInterest)}</dd></div>
            <div><dt className="text-white/70">Total repaid</dt><dd className="font-heading text-lg font-bold">{lkr(result.totalRepaid)}</dd></div>
            <div><dt className="text-white/70">All-in cost</dt><dd className="font-heading text-lg font-bold">{lkr(result.totalCost)}</dd></div>
          </dl>
        </div>

        <div className="rounded-3xl bg-card p-5 ring-1 ring-border sm:p-6">
          <p className="text-sm font-semibold text-ink">Where your money goes</p>
          <div className="mt-3 flex h-4 overflow-hidden rounded-full bg-muted" role="img" aria-label="Split between down payment, loan and interest">
            {seg.map((s) => (
              <div key={s.label} className={cn("h-full transition-all duration-500", s.cls)} style={{ width: `${(s.value / total) * 100}%` }} />
            ))}
          </div>
          <ul className="mt-4 grid gap-2 text-sm">
            {seg.map((s) => (
              <li key={s.label} className="flex items-center justify-between gap-3">
                <span className="flex items-center gap-2 text-muted-foreground"><span className={cn("h-3 w-3 rounded-full", s.cls)} />{s.label}</span>
                <span className="font-semibold text-ink">{lkr(s.value)}</span>
              </li>
            ))}
          </ul>

          {type === "flat" && result.effectiveRate > 0 && (
            <p className="mt-4 rounded-2xl bg-accent/20 px-4 py-3 text-sm text-ink">
              <span className="font-bold">Effective rate: {result.effectiveRate.toFixed(1)}% a year.</span> A {rate}% flat rate costs
              about the same as a {result.effectiveRate.toFixed(1)}% reducing-balance loan. Compare lenders on that number.
            </p>
          )}

          {burden !== null && (
            <p
              className={cn(
                "mt-4 flex items-start gap-2 rounded-2xl px-4 py-3 text-sm",
                burden > 35 ? "bg-destructive/10 text-destructive" : "bg-success/10 text-success"
              )}
            >
              <CircleAlert className="mt-0.5 h-4 w-4 shrink-0" />
              <span>
                This payment is <span className="font-bold">{burden.toFixed(0)}%</span> of your monthly income.{" "}
                {burden > 35
                  ? "Lenders often prefer total monthly commitments under about 35% consider a bigger down payment or a longer term."
                  : "That is within the range lenders usually like to see (under about 35%)."}
              </span>
            </p>
          )}
        </div>

        {whatsapp && (
          <a
            href={`https://wa.me/${whatsapp}?text=${encodeURIComponent(
              `Hi, I'd like to ask about financing${start?.title ? ` for the ${start.title}` : ""}. My estimate: ${lkr(result.payment)}/month over ${years} years.`
            )}`}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex h-12 w-full items-center justify-center gap-2 rounded-full bg-green-700 px-6 text-base font-semibold text-white transition-all hover:bg-green-800 hover:shadow-lg active:scale-[0.98]"
          >
            <MessageCircle className="h-5 w-5" /> Ask us about financing
          </a>
        )}
      </div>

      <div className={cn("space-y-6", !compact && "lg:col-span-2")}>
        <section className="rounded-3xl bg-card p-5 ring-1 ring-border sm:p-7">
          <h3 className="font-heading text-xl font-bold text-ink">Compare durations</h3>
          <p className="text-sm text-muted-foreground">A longer term means a smaller payment but more interest in total. Tap a row to pick it.</p>
          <div className="mt-4 overflow-x-auto">
            <table className="w-full min-w-[28rem] text-left text-sm">
              <thead className="text-muted-foreground">
                <tr><th className="py-2 pr-4 font-medium">Duration</th><th className="py-2 pr-4 font-medium">Monthly</th><th className="py-2 pr-4 font-medium">Total interest</th><th className="py-2 font-medium">Total repaid</th></tr>
              </thead>
              <tbody>
                {durations.map((y) => {
                  const m = y * 12;
                  const pay = monthlyPayment(result.loan, num(rate), m, type);
                  const selected = y === years;
                  return (
                    <tr
                      key={y} onClick={() => setYears(y)}
                      className={cn("cursor-pointer border-t border-border transition-colors", selected ? "bg-primary/10 font-semibold text-primary" : "hover:bg-muted/60")}
                    >
                      <td className="py-3 pr-4">{y} {y === 1 ? "year" : "years"}</td>
                      <td className="py-3 pr-4">{lkr(pay)}</td>
                      <td className="py-3 pr-4">{lkr(Math.max(pay * m - result.loan, 0))}</td>
                      <td className="py-3">{lkr(pay * m)}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </section>

        <details className="group rounded-3xl bg-card p-5 ring-1 ring-border sm:p-7">
          <summary className="flex cursor-pointer list-none items-center justify-between gap-4 [&::-webkit-details-marker]:hidden">
            <span>
              <span className="block font-heading text-xl font-bold text-ink">Repayment schedule</span>
              <span className="text-sm text-muted-foreground">See how each payment splits between the loan and interest.</span>
            </span>
            <span className="rounded-full bg-muted px-4 py-2 text-sm font-semibold text-ink group-open:bg-accent">
              <span className="group-open:hidden">Show</span><span className="hidden group-open:inline">Hide</span>
            </span>
          </summary>

          <div className="mt-5 overflow-x-auto">
            <table className="w-full min-w-[30rem] text-left text-sm">
              <thead className="text-muted-foreground">
                <tr><th className="py-2 pr-4 font-medium">Year</th><th className="py-2 pr-4 font-medium">Loan repaid</th><th className="py-2 pr-4 font-medium">Interest paid</th><th className="py-2 font-medium">Balance left</th></tr>
              </thead>
              <tbody>
                {yearly.map((r) => (
                  <tr key={r.year} className="border-t border-border">
                    <td className="py-3 pr-4 font-semibold text-ink">Year {r.year}</td>
                    <td className="py-3 pr-4">{lkr(r.principal)}</td>
                    <td className="py-3 pr-4">{lkr(r.interest)}</td>
                    <td className="py-3">{lkr(r.balance)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <details className="mt-5">
            <summary className="cursor-pointer text-sm font-semibold text-primary">Month-by-month</summary>
            <div className="mt-3 max-h-80 overflow-auto rounded-2xl ring-1 ring-border">
              <table className="w-full min-w-[34rem] text-left text-sm">
                <thead className="sticky top-0 bg-muted text-ink">
                  <tr><th className="px-4 py-2.5 font-semibold">#</th><th className="px-4 py-2.5 font-semibold">Payment</th><th className="px-4 py-2.5 font-semibold">Loan</th><th className="px-4 py-2.5 font-semibold">Interest</th><th className="px-4 py-2.5 font-semibold">Balance</th></tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {schedule.map((r) => (
                    <tr key={r.month}>
                      <td className="px-4 py-2 text-muted-foreground">{r.month}</td>
                      <td className="px-4 py-2">{lkr(r.payment)}</td>
                      <td className="px-4 py-2">{lkr(r.principal)}</td>
                      <td className="px-4 py-2">{lkr(r.interest)}</td>
                      <td className="px-4 py-2">{lkr(r.balance)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </details>
        </details>

        <div className="space-y-2 rounded-2xl bg-muted/60 px-5 py-4 text-sm text-muted-foreground">
          {settings.note && <p className="font-medium text-ink">{settings.note}</p>}
          <p>
            This is an estimate to help you plan, not an offer. Rates, fees and approval depend on your lender and your
            circumstances. Maximum loan-to-value limits ({settings.ltv_used}% for vehicles registered over a year,{" "}
            {settings.ltv_new}% for new or recently registered ones) follow the Central Bank of Sri Lanka rules in force from
            25 May 2026 and can change please confirm with your lender.{" "}
            <Link href="/faq" className="font-semibold text-primary underline-offset-4 hover:underline">Read the FAQ</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
