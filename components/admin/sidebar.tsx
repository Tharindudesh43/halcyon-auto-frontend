"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  Briefcase,
  Car,
  CircleHelp,
  CirclePlus,
  Globe,
  Inbox,
  LayoutDashboard,
  LoaderCircle,
  LogOut,
  Menu,
  Newspaper,
  X,
} from "lucide-react";
import { cn } from "@/lib/utils";

const NAV = [
  { href: "/admin/dashboard", label: "Statistics", icon: LayoutDashboard, match: "/admin/dashboard" },
  { href: "/admin/listings/new", label: "Add car", icon: CirclePlus, match: "/admin/listings/new" },
  { href: "/admin/listings", label: "Listed cars", icon: Car, match: "/admin/listings" },
  { href: "/admin/enquiries", label: "Enquiries", icon: Inbox, match: "/admin/enquiries" },
  { href: "/admin/articles", label: "Articles", icon: Newspaper, match: "/admin/articles" },
  { href: "/admin/faq", label: "FAQ", icon: CircleHelp, match: "/admin/faq" },
  { href: "/admin/careers", label: "Careers", icon: Briefcase, match: "/admin/careers" },
  { href: "/admin/content", label: "Website content", icon: Globe, match: "/admin/content" },
];

function isActive(pathname: string, item: (typeof NAV)[number]) {
  if (item.match === "/admin/listings") {
    // "Listed cars" is active on the list and on edit pages, but not on /new
    return pathname === "/admin/listings" || /^\/admin\/listings\/\d+/.test(pathname);
  }
  return pathname === item.match || pathname.startsWith(`${item.match}/`);
}

export function AdminSidebar({ name, email }: { name: string; email: string }) {
  const pathname = usePathname();
  const router = useRouter();
  const [openedAt, setOpenedAt] = useState<string | null>(null);
  const open = openedAt === pathname;
  const setOpen = (value: boolean) => setOpenedAt(value ? pathname : null);
  const [loggingOut, setLoggingOut] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);

  useEffect(() => {
    if (!confirmOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape" && !loggingOut) setConfirmOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [confirmOpen, loggingOut]);

  async function logout() {
    setLoggingOut(true);
    try {
      await fetch("/api/auth/logout", { method: "POST" });
    } finally {
      router.push("/admin/login");
      router.refresh();
    }
  }

  const panel = (
    <div className="flex h-full flex-col bg-gradient-to-b from-indigo-950 via-violet-950 to-slate-950 text-white">
      <div className="flex items-center gap-3 px-6 py-6">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-fuchsia-500 to-indigo-500 shadow-lg shadow-fuchsia-500/30">
          <Car className="h-5 w-5" />
        </div>
        <div>
          <p className="text-base font-semibold leading-tight">Halcyon Auto</p>
          <p className="text-xs text-indigo-200/70">Admin panel</p>
        </div>
      </div>

      <nav className="flex-1 space-y-1.5 px-3 py-2" aria-label="Admin">
        {NAV.map((item) => {
          const active = isActive(pathname, item);
          return (
            <Link
              key={item.href}
              href={item.href}
              aria-current={active ? "page" : undefined}
              className={cn(
                "group flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium transition-colors",
                active
                  ? "bg-gradient-to-r from-fuchsia-500/90 to-indigo-500/90 text-white shadow-lg shadow-indigo-900/40"
                  : "text-indigo-100/75 hover:bg-white/10 hover:text-white"
              )}
            >
              <item.icon className="h-[18px] w-[18px]" />
              {item.label}
            </Link>
          );
        })}
      </nav>

      <div className="m-3 rounded-2xl bg-white/5 p-4 ring-1 ring-white/10">
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-amber-400 to-rose-500 text-sm font-semibold">
            {(name || email).charAt(0).toUpperCase()}
          </div>
          <div className="min-w-0">
            <p className="truncate text-sm font-medium">{name || "Admin"}</p>
            <p className="truncate text-xs text-indigo-200/70">{email}</p>
          </div>
        </div>
        <button
          type="button"
          onClick={() => setConfirmOpen(true)}
          className="mt-4 flex w-full items-center justify-center gap-2 rounded-xl bg-white/10 px-3 py-2.5 text-sm font-medium transition-colors hover:bg-rose-500"
        >
          <LogOut className="h-4 w-4" />
          Log out
        </button>
      </div>
    </div>
  );

  return (
    <>
      <aside className="fixed inset-y-0 left-0 z-30 hidden w-64 lg:block">{panel}</aside>

      <header className="sticky top-0 z-30 flex items-center justify-between bg-indigo-950 px-4 py-3 text-white lg:hidden">
        <div className="flex items-center gap-2.5">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-fuchsia-500 to-indigo-500">
            <Car className="h-4 w-4" />
          </div>
          <span className="font-semibold">Halcyon Auto</span>
        </div>
        <button
          type="button"
          aria-label="Open menu"
          onClick={() => setOpen(true)}
          className="rounded-lg p-2 hover:bg-white/10"
        >
          <Menu className="h-5 w-5" />
        </button>
      </header>

      {open && (
        <div className="fixed inset-0 z-40 lg:hidden">
          <button
            type="button"
            aria-label="Close menu"
            className="absolute inset-0 bg-black/50"
            onClick={() => setOpen(false)}
          />
          <div className="absolute inset-y-0 left-0 w-72 max-w-[85%]">
            {panel}
            <button
              type="button"
              aria-label="Close menu"
              onClick={() => setOpen(false)}
              className="absolute right-3 top-5 rounded-lg p-1.5 text-white hover:bg-white/10"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>
      )}
      {confirmOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <button
            type="button"
            aria-label="Close dialog"
            tabIndex={-1}
            disabled={loggingOut}
            onClick={() => setConfirmOpen(false)}
            className="absolute inset-0 bg-slate-950/60 backdrop-blur-sm"
          />
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="logout-title"
            aria-describedby="logout-desc"
            className="relative w-full max-w-sm rounded-2xl bg-white p-6 text-slate-900 shadow-2xl"
          >
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-rose-100 text-rose-600">
              <LogOut className="h-5 w-5" />
            </div>
            <h2 id="logout-title" className="mt-4 text-lg font-semibold">
              Log out?
            </h2>
            <p id="logout-desc" className="mt-1 text-sm text-slate-500">
              You&apos;ll need to sign in again to manage your cars.
            </p>
            <div className="mt-6 grid grid-cols-2 gap-3">
              <button
                type="button"
                autoFocus
                disabled={loggingOut}
                onClick={() => setConfirmOpen(false)}
                className="h-11 rounded-xl bg-white text-sm font-medium text-slate-700 ring-1 ring-slate-200 transition-colors hover:bg-slate-50 disabled:opacity-60"
              >
                Stay signed in
              </button>
              <button
                type="button"
                disabled={loggingOut}
                onClick={logout}
                className="inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-rose-600 text-sm font-semibold text-white transition-colors hover:bg-rose-700 disabled:opacity-70"
              >
                {loggingOut && <LoaderCircle className="h-4 w-4 animate-spin" />}
                {loggingOut ? "Logging out" : "Log out"}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
