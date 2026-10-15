import type { Slice } from "@/lib/stats";
import { cn } from "@/lib/utils";

export function StatCard({
  label,
  value,
  hint,
  icon,
  gradient,
}: {
  label: string;
  value: string | number;
  hint?: string;
  icon: React.ReactNode;
  gradient: string;
}) {
  return (
    <div className={cn("relative overflow-hidden rounded-2xl bg-gradient-to-br p-5 text-white shadow-lg", gradient)}>
      <div className="absolute -right-6 -top-6 h-24 w-24 rounded-full bg-white/10" />
      <div className="absolute -bottom-8 right-6 h-20 w-20 rounded-full bg-white/10" />
      <div className="relative flex items-start justify-between">
        <div>
          <p className="text-sm font-medium text-white/85">{label}</p>
          <p className="mt-2 text-3xl font-bold tracking-tight">{value}</p>
          {hint && <p className="mt-1 text-xs text-white/80">{hint}</p>}
        </div>
        <div className="rounded-xl bg-white/20 p-2.5">{icon}</div>
      </div>
    </div>
  );
}

export function Panel({
  title,
  subtitle,
  children,
  className,
}: {
  title: string;
  subtitle?: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <section className={cn("rounded-2xl bg-white p-6 shadow-sm ring-1 ring-slate-200", className)}>
      <h2 className="text-base font-semibold text-slate-900">{title}</h2>
      {subtitle && <p className="text-sm text-slate-500">{subtitle}</p>}
      <div className="mt-5">{children}</div>
    </section>
  );
}

const BAR_COLORS = [
  "from-indigo-500 to-violet-500",
  "from-emerald-500 to-teal-500",
  "from-amber-400 to-orange-500",
  "from-rose-500 to-pink-500",
  "from-sky-500 to-blue-500",
  "from-fuchsia-500 to-purple-500",
];

export function BarList({ items, empty = "No data yet" }: { items: Slice[]; empty?: string }) {
  if (items.length === 0) return <p className="text-sm text-slate-400">{empty}</p>;
  const max = Math.max(...items.map((i) => i.count), 1);
  return (
    <ul className="space-y-4">
      {items.map((item, i) => (
        <li key={item.label}>
          <div className="mb-1.5 flex justify-between text-sm">
            <span className="font-medium text-slate-700">{item.label}</span>
            <span className="text-slate-500">{item.count}</span>
          </div>
          <div className="h-2.5 overflow-hidden rounded-full bg-slate-100">
            <div
              className={cn("h-full rounded-full bg-gradient-to-r", BAR_COLORS[i % BAR_COLORS.length])}
              style={{ width: `${(item.count / max) * 100}%` }}
            />
          </div>
        </li>
      ))}
    </ul>
  );
}

export function Columns({ items }: { items: Slice[] }) {
  const max = Math.max(...items.map((i) => i.count), 1);
  return (
    <div className="flex h-48 items-end gap-3">
      {items.map((item, i) => (
        <div key={`${item.label}-${i}`} className="flex h-full flex-1 flex-col items-center justify-end gap-2">
          <span className="text-xs font-semibold text-slate-600">{item.count}</span>
          <div
            className="w-full rounded-t-lg bg-gradient-to-t from-indigo-500 to-fuchsia-400"
            style={{ height: `${Math.max((item.count / max) * 100, item.count ? 6 : 2)}%`, opacity: item.count ? 1 : 0.25 }}
          />
          <span className="text-xs text-slate-500">{item.label}</span>
        </div>
      ))}
    </div>
  );
}

export function Ring({ available, sold }: { available: number; sold: number }) {
  const total = available + sold;
  const r = 52;
  const c = 2 * Math.PI * r;
  const soldLen = total ? (sold / total) * c : 0;
  const availLen = total ? (available / total) * c : 0;

  return (
    <div className="flex flex-wrap items-center gap-8">
      <svg viewBox="0 0 140 140" className="h-36 w-36 -rotate-90" role="img" aria-label={`${available} available, ${sold} sold`}>
        <circle cx="70" cy="70" r={r} fill="none" stroke="#e2e8f0" strokeWidth="16" />
        {total > 0 && (
          <>
            <circle cx="70" cy="70" r={r} fill="none" stroke="#10b981" strokeWidth="16" strokeLinecap="butt"
              strokeDasharray={`${availLen} ${c}`} />
            <circle cx="70" cy="70" r={r} fill="none" stroke="#f43f5e" strokeWidth="16" strokeLinecap="butt"
              strokeDasharray={`${soldLen} ${c}`} strokeDashoffset={-availLen} />
          </>
        )}
      </svg>
      <ul className="space-y-3 text-sm">
        <li className="flex items-center gap-3">
          <span className="h-3 w-3 rounded-full bg-emerald-500" />
          <span className="text-slate-600">Available</span>
          <span className="font-semibold text-slate-900">{available}</span>
        </li>
        <li className="flex items-center gap-3">
          <span className="h-3 w-3 rounded-full bg-rose-500" />
          <span className="text-slate-600">Sold</span>
          <span className="font-semibold text-slate-900">{sold}</span>
        </li>
      </ul>
    </div>
  );
}
