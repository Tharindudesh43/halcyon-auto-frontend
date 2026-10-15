"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ChevronDown, Menu, Phone, X } from "lucide-react";
import { Logo } from "./logo";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const PRIMARY = [
  { href: "/cars", label: "Cars for sale" },
  { href: "/finance", label: "Finance" },
  { href: "/articles", label: "Articles" },
  { href: "/about", label: "About" },
  { href: "/contact", label: "Contact" },
];

const MORE = [
  { href: "/our-trust", label: "Our trust" },
  { href: "/faq", label: "FAQ" },
  { href: "/careers", label: "Careers" },
];

export function Navbar({ phone }: { phone?: string | null }) {
  const pathname = usePathname();
  const [scrolled, setScrolled] = useState(false);
  const [openedAt, setOpenedAt] = useState<string | null>(null);
  const [moreAt, setMoreAt] = useState<string | null>(null);
  const open = openedAt === pathname;
  const moreOpen = moreAt === pathname;
  const moreRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    if (!moreOpen) return;
    const onDown = (e: MouseEvent) => {
      if (!moreRef.current?.contains(e.target as Node)) setMoreAt(null);
    };
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setMoreAt(null);
    document.addEventListener("mousedown", onDown);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onDown);
      document.removeEventListener("keydown", onKey);
    };
  }, [moreOpen]);

  const overHero = pathname === "/" && !scrolled && !open;
  const isActive = (href: string) => (href === "/" ? pathname === "/" : pathname.startsWith(href));
  const moreActive = MORE.some((l) => isActive(l.href));
  const tel = phone ? `tel:+${phone.replace(/\D/g, "")}` : null;

  const linkTone = (active: boolean) =>
    overHero
      ? active ? "text-white" : "text-white/75 hover:text-white"
      : active ? "text-primary" : "text-muted-foreground hover:text-ink";

  return (
    <header
      className={cn(
        "fixed inset-x-0 top-0 z-50 transition-all duration-300",
        overHero ? "bg-transparent" : "bg-white/90 shadow-[0_1px_0_0_var(--color-border)] backdrop-blur-lg"
      )}
    >
      <div className="container-page flex h-16 items-center justify-between gap-4 md:h-20">
        <Link href="/" aria-label="Halcyon Auto home" className="group/logo shrink-0">
          <Logo light={overHero} />
        </Link>

        <nav aria-label="Main" className="hidden items-center gap-0.5 xl:flex">
          {PRIMARY.map((link) => {
            const active = isActive(link.href);
            return (
              <Link
                key={link.href}
                href={link.href}
                aria-current={active ? "page" : undefined}
                className={cn("group relative rounded-full px-3.5 py-2 text-sm font-semibold transition-colors", linkTone(active))}
              >
                {link.label}
                <span
                  className={cn(
                    "absolute inset-x-3.5 -bottom-0.5 h-0.5 origin-left rounded-full transition-transform duration-300",
                    overHero ? "bg-accent" : "bg-primary",
                    active ? "scale-x-100" : "scale-x-0 group-hover:scale-x-100"
                  )}
                />
              </Link>
            );
          })}

          <div ref={moreRef} className="relative">
            <button
              type="button"
              aria-haspopup="menu"
              aria-expanded={moreOpen}
              onClick={() => setMoreAt(moreOpen ? null : pathname)}
              className={cn("inline-flex items-center gap-1 rounded-full px-3.5 py-2 text-sm font-semibold transition-colors", linkTone(moreActive || moreOpen))}
            >
              More
              <ChevronDown className={cn("h-4 w-4 transition-transform duration-200", moreOpen && "rotate-180")} />
            </button>
            <div
              role="menu"
              className={cn(
                "absolute right-0 top-full mt-2 w-48 origin-top-right rounded-2xl bg-white p-1.5 shadow-2xl shadow-lagoon/20 ring-1 ring-border transition-all duration-200",
                moreOpen ? "scale-100 opacity-100" : "pointer-events-none scale-95 opacity-0"
              )}
            >
              {MORE.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  role="menuitem"
                  tabIndex={moreOpen ? 0 : -1}
                  aria-current={isActive(link.href) ? "page" : undefined}
                  className={cn(
                    "block rounded-xl px-4 py-2.5 text-sm font-semibold transition-colors",
                    isActive(link.href) ? "bg-primary/10 text-primary" : "text-ink hover:bg-muted"
                  )}
                >
                  {link.label}
                </Link>
              ))}
            </div>
          </div>
        </nav>

        <div className="hidden items-center gap-3 xl:flex">
          {tel && (
            <a
              href={tel}
              className={cn("inline-flex items-center gap-2 text-sm font-semibold transition-colors", overHero ? "text-white/90 hover:text-white" : "text-ink hover:text-primary")}
            >
              <Phone className="h-4 w-4" />
              {phone}
            </a>
          )}
          <Link href="/contact" className={buttonVariants({ variant: "accent", size: "sm" })}>Sell your car</Link>
        </div>

        <button
          type="button"
          aria-label={open ? "Close menu" : "Open menu"}
          aria-expanded={open}
          aria-controls="mobile-menu"
          onClick={() => setOpenedAt(open ? null : pathname)}
          className={cn(
            "flex h-11 w-11 items-center justify-center rounded-full transition-colors xl:hidden",
            overHero ? "text-white hover:bg-white/15" : "text-ink hover:bg-muted"
          )}
        >
          {open ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </button>
      </div>

      <div
        id="mobile-menu"
        className={cn(
          "grid transition-[grid-template-rows] duration-300 ease-out xl:hidden",
          open ? "grid-rows-[1fr]" : "grid-rows-[0fr]"
        )}
      >
        <div className="overflow-hidden">
          <nav aria-label="Mobile" className="container-page max-h-[calc(100svh-4rem)] overflow-y-auto pb-6 pt-2">
            <div className="flex flex-col gap-1">
              {PRIMARY.map((link) => {
                const active = isActive(link.href);
                return (
                  <Link
                    key={link.href}
                    href={link.href}
                    tabIndex={open ? 0 : -1}
                    aria-current={active ? "page" : undefined}
                    className={cn("rounded-2xl px-4 py-3.5 text-base font-semibold transition-colors", active ? "bg-primary/10 text-primary" : "text-ink hover:bg-muted")}
                  >
                    {link.label}
                  </Link>
                );
              })}
            </div>

            <div className="mt-3 flex flex-wrap gap-2 border-t border-border pt-4">
              {[{ href: "/", label: "Home" }, ...MORE].map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  tabIndex={open ? 0 : -1}
                  aria-current={isActive(link.href) ? "page" : undefined}
                  className={cn(
                    "rounded-full px-4 py-2 text-sm font-semibold transition-colors",
                    isActive(link.href) ? "bg-primary text-white" : "bg-muted text-ink hover:bg-primary/10"
                  )}
                >
                  {link.label}
                </Link>
              ))}
            </div>

            <div className="mt-4 grid grid-cols-2 gap-3">
              {tel ? (
                <a href={tel} tabIndex={open ? 0 : -1} className={buttonVariants({ variant: "outline" })}>
                  <Phone className="h-4 w-4" /> Call
                </a>
              ) : (
                <span />
              )}
              <Link href="/contact" tabIndex={open ? 0 : -1} className={buttonVariants({ variant: "accent" })}>
                Get in touch
              </Link>
            </div>
          </nav>
        </div>
      </div>
    </header>
  );
}
