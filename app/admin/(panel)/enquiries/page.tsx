import Link from "next/link";
import { CalendarCheck, Inbox, MessageCircle, Phone } from "lucide-react";
import { adminEnquirySummary, adminListEnquiries } from "@/lib/enquiries";
import { cld } from "@/lib/cloudinary";
import { cn } from "@/lib/utils";
import { PageHeader } from "@/components/admin/page-header";
import { EnquiryRow } from "@/components/admin/enquiry-row";
import { Panel, StatCard } from "@/components/admin/stats-widgets";

type SearchParams = { type?: string; status?: string; page?: string };

const TABS = [
  { label: "All", type: "" },
  { label: "Test drives", type: "test_drive" },
  { label: "WhatsApp taps", type: "whatsapp" },
  { label: "Call taps", type: "call" },
];

export default async function EnquiriesPage({ searchParams }: { searchParams: Promise<SearchParams> }) {
  const sp = await searchParams;
  const query: Record<string, string> = {};
  if (sp.type) query.type = sp.type;
  if (sp.status) query.status = sp.status;
  if (sp.page) query.page = sp.page;

  const [list, summary] = await Promise.all([adminListEnquiries(query), adminEnquirySummary(30)]);

  const href = (o: Record<string, string>) => {
    const qs = new URLSearchParams({ ...(sp.type ? { type: sp.type } : {}), ...(sp.status ? { status: sp.status } : {}), ...o });
    for (const [k, v] of [...qs]) if (!v) qs.delete(k);
    return `/admin/enquiries${qs.size ? `?${qs}` : ""}`;
  };

  return (
    <>
      <PageHeader
        title="Enquiries"
        description="Test-drive bookings and every WhatsApp / Call tap on a car page."
      />

      <div className="grid gap-5 sm:grid-cols-3">
        <StatCard label="Test drives to follow up" value={summary.totals.open_test_drives} hint="Not marked done yet" icon={<CalendarCheck className="h-5 w-5" />} gradient="from-fuchsia-500 to-indigo-600 shadow-indigo-200" />
        <StatCard label="WhatsApp taps" value={summary.totals.whatsapp} hint={`Last ${summary.days} days`} icon={<MessageCircle className="h-5 w-5" />} gradient="from-emerald-500 to-teal-600 shadow-emerald-200" />
        <StatCard label="Call taps" value={summary.totals.calls} hint={`Last ${summary.days} days`} icon={<Phone className="h-5 w-5" />} gradient="from-sky-500 to-blue-600 shadow-sky-200" />
      </div>

      <Panel title="Most asked-about cars" subtitle={`Taps and bookings, last ${summary.days} days`} className="mt-6">
        {summary.top.length === 0 ? (
          <p className="text-sm text-slate-400">Nothing yet - taps on car pages will show up here.</p>
        ) : (
          <ol className="divide-y divide-slate-100">
            {summary.top.map((c, i) => (
              <li key={c.car_listing_id} className="flex items-center gap-3 py-3">
                <span className="w-5 text-sm font-semibold text-slate-400">{i + 1}</span>
                <div className="h-12 w-16 shrink-0 overflow-hidden rounded-lg bg-slate-100">
                  {c.image && (
                    <img src={cld(c.image, 160)} alt="" className="h-full w-full object-cover" />
                  )}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium text-slate-900">
                    {c.title} {c.status === "sold" && <span className="text-xs font-normal text-slate-400">· sold</span>}
                  </p>
                  <p className="text-xs text-slate-500">
                    {c.whatsapp} WhatsApp · {c.calls} calls · {c.test_drives} test drives
                  </p>
                </div>
                <span className="rounded-full bg-indigo-50 px-3 py-1 text-sm font-semibold text-indigo-700">{c.total}</span>
              </li>
            ))}
          </ol>
        )}
      </Panel>

      <div className="mt-8 flex flex-wrap items-center justify-between gap-3">
        <nav className="flex flex-wrap gap-2" aria-label="Filter enquiries">
          {TABS.map((tab) => {
            const active = (sp.type ?? "") === tab.type;
            return (
              <Link
                key={tab.label}
                href={href({ type: tab.type, page: "" })}
                className={cn("rounded-full px-4 py-2 text-sm font-medium", active ? "bg-indigo-600 text-white" : "bg-white text-slate-600 ring-1 ring-slate-200 hover:bg-slate-50")}
              >
                {tab.label}
              </Link>
            );
          })}
        </nav>
        <Link
          href={href({ status: sp.status === "open" ? "" : "open", page: "" })}
          className={cn("rounded-full px-4 py-2 text-sm font-medium", sp.status === "open" ? "bg-amber-500 text-white" : "bg-white text-slate-600 ring-1 ring-slate-200 hover:bg-slate-50")}
        >
          Only not done
        </Link>
      </div>

      {list.data.length === 0 ? (
        <div className="mt-4 rounded-2xl border-2 border-dashed border-slate-200 bg-white px-6 py-16 text-center">
          <span className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-indigo-50 text-indigo-600">
            <Inbox className="h-6 w-6" />
          </span>
          <p className="mt-4 text-lg font-semibold text-slate-800">Inbox is empty</p>
          <p className="mt-1 text-sm text-slate-500">New bookings and taps appear here as they happen.</p>
        </div>
      ) : (
        <ul className="mt-4 space-y-3">
          {list.data.map((e) => (
            <EnquiryRow key={e.id} enquiry={e} />
          ))}
        </ul>
      )}

      {list.last_page > 1 && (
        <div className="mt-6 flex items-center justify-center gap-3 text-sm">
          {list.current_page > 1 && (
            <Link href={href({ page: String(list.current_page - 1) })} className="rounded-xl bg-white px-4 py-2 ring-1 ring-slate-200 hover:bg-slate-50">← Newer</Link>
          )}
          <span className="text-slate-500">Page {list.current_page} of {list.last_page}</span>
          {list.current_page < list.last_page && (
            <Link href={href({ page: String(list.current_page + 1) })} className="rounded-xl bg-white px-4 py-2 ring-1 ring-slate-200 hover:bg-slate-50">Older →</Link>
          )}
        </div>
      )}
    </>
  );
}
