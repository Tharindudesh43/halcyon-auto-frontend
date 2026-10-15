import Image from "next/image";
import { cn } from "@/lib/utils";

export function Logo({ light = false, className }: { light?: boolean; className?: string }) {
  return (
    <span className={cn("inline-flex items-center gap-2.5", className)}>
      {/* <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-primary to-lagoon text-white shadow-md shadow-primary/30 transition-transform duration-300 group-hover/logo:-rotate-6 overflow-hidden"> */}
        <Image 
          src="/logo.png"
          alt="Halcyon Auto Logo" 
          width={80} 
          height={80} 
          className="object-cover"
        />
      {/* </span> */}
      <span className={cn("font-heading text-xl font-extrabold tracking-tight", light ? "text-white" : "text-ink")}>
        Halcyon<span className={cn("font-medium", light ? "text-white/70" : "text-primary")}> Auto</span>
      </span>
    </span>
  );
}