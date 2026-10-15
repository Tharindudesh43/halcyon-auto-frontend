import Link from "next/link";
import { CircleCheck, Car, Percent, TrendingUp, Wallet, Package } from "lucide-react";
import { listAllCars } from "@/lib/cars";
import { buildStats } from "@/lib/stats";
import { finalPrice, lkr } from "@/lib/format";
import { cld } from "@/lib/cloudinary";
import { PageHeader } from "@/components/admin/page-header";
import { BarList, Columns, Panel, Ring, StatCard } from "@/components/admin/stats-widgets";

export default async function StatisticsPage() {
  const cars = await listAllCars();
  const s = buildStats(cars);

  return (
    <>
      <PageHeader title="Statistics" description="A live overview of your catalogue and sales." />

      <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          label="Total cars"
          value={s.total}
          hint={`${s.available} still for sale`}
          icon={<Car className="h-5 w-5" />}
          gradient="from-indigo-500 to-violet-600 shadow-indigo-200"
        />
        <StatCard
          label="Sold"
          value={s.sold}
          hint={`${s.sellThrough}% sell-through`}
          icon={<CircleCheck className="h-5 w-5" />}
          gradient="from-emerald-500 to-teal-600 shadow-emerald-200"
        />
        <StatCard
          label="On discount"
          value={s.discounted}
          hint="Available cars with a discount"
          icon={<Percent className="h-5 w-5" />}
          gradient="from-amber-400 to-orange-500 shadow-orange-200"
        />
        <StatCard
          label="Stock value"
          value={lkr(s.inventoryValue)}
          hint="After discounts"
          icon={<Wallet className="h-5 w-5" />}
          gradient="from-rose-500 to-pink-600 shadow-rose-200"
        />
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-3">
        <Panel title="Stock vs sold" subtitle="Share of your catalogue" className="lg:col-span-1">
          <Ring available={s.available} sold={s.sold} />
          <dl className="mt-6 grid grid-cols-2 gap-4 border-t border-slate-100 pt-5 text-sm">
            <div>
              <dt className="flex items-center gap-1.5 text-slate-500"><TrendingUp className="h-4 w-4" /> Sales value</dt>
              <dd className="mt-1 font-semibold text-slate-900">{lkr(s.soldValue)}</dd>
            </div>
            <div>
              <dt className="flex items-center gap-1.5 text-slate-500"><Package className="h-4 w-4" /> Average price</dt>
              <dd className="mt-1 font-semibold text-slate-900">{lkr(s.averagePrice)}</dd>
            </div>
          </dl>
        </Panel>

        <Panel title="Cars added" subtitle="Last 6 months" className="lg:col-span-2">
          <Columns items={s.byMonth} />
        </Panel>

        <Panel title="Top brands" subtitle="By number of listings">
          <BarList items={s.byBrand} />
        </Panel>

        <Panel title="Fuel type" subtitle="How your cars are powered">
          <BarList items={s.byFuel} />
        </Panel>

        <Panel title="Latest listings" subtitle="Most recently added">
          {s.recent.length === 0 ? (
            <p className="text-sm text-slate-400">Nothing yet.</p>
          ) : (
            <ul className="space-y-4">
              {s.recent.map((car) => (
                <li key={car.id}>
                  <Link href={`/admin/listings/${car.id}/edit`} className="group flex items-center gap-3">
                    <div className="h-12 w-16 shrink-0 overflow-hidden rounded-lg bg-slate-100">
                      {car.images?.[0] && (
                        <img src={cld(car.images[0], 160)} alt="" className="h-full w-full object-cover" />
                      )}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-medium text-slate-900 group-hover:text-indigo-600">{car.title}</p>
                      <p className="text-xs text-slate-500">{lkr(finalPrice(car))}</p>
                    </div>
                    <span
                      className={
                        car.status === "sold"
                          ? "rounded-full bg-slate-100 px-2 py-0.5 text-xs font-medium text-slate-600"
                          : "rounded-full bg-emerald-50 px-2 py-0.5 text-xs font-medium text-emerald-700"
                      }
                    >
                      {car.status === "sold" ? "Sold" : "Available"}
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </Panel>
      </div>
    </>
  );
}
