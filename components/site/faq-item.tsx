import { ChevronDown } from "lucide-react";

export function FaqItem({ question, answer }: { question: string; answer: string }) {
  return (
    <details className="group rounded-3xl bg-card ring-1 ring-border transition-all duration-300 open:shadow-lg open:shadow-primary/10 open:ring-primary/30 hover:ring-primary/30">
      <summary className="flex cursor-pointer list-none items-center justify-between gap-4 p-5 md:p-6 [&::-webkit-details-marker]:hidden">
        <h3 className="font-heading text-lg font-bold text-ink md:text-xl">{question}</h3>
        <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-muted text-ink transition-all duration-300 group-open:rotate-180 group-open:bg-accent">
          <ChevronDown className="h-5 w-5" />
        </span>
      </summary>
      <div className="px-5 pb-6 md:px-6">
        <p className="whitespace-pre-line leading-relaxed text-muted-foreground">{answer}</p>
      </div>
    </details>
  );
}
