import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils";

export function SectionHeading({
  title,
  subtitle,
  action,
  tone = "light",
  className,
}: {
  title: string;
  subtitle?: string;
  action?: { href: string; label: string };
  tone?: "light" | "dark";
  className?: string;
}) {
  return (
    <div className={cn("mb-8 flex flex-wrap items-end justify-between gap-4 md:mb-10", className)}>
      <div className="max-w-2xl">
        <h2
          className={cn(
            "font-heading text-3xl font-extrabold leading-tight md:text-4xl",
            tone === "dark" ? "text-white" : "text-ink"
          )}
        >
          {title}
        </h2>
        {subtitle && (
          <p className={cn("mt-3 text-base md:text-lg", tone === "dark" ? "text-white/70" : "text-muted-foreground")}>
            {subtitle}
          </p>
        )}
      </div>
      {action && (
        <Link
          href={action.href}
          className={cn(
            "group inline-flex items-center gap-2 text-sm font-semibold",
            tone === "dark" ? "text-accent" : "text-primary"
          )}
        >
          {action.label}
          <ArrowRight className="h-4 w-4 transition-transform duration-200 group-hover:translate-x-1" />
        </Link>
      )}
    </div>
  );
}
