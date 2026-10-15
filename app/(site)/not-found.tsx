import Link from "next/link";
import { buttonVariants } from "@/components/ui/button";

export default function NotFound() {
  return (
    <div className="container-page page-top pb-8">
      <div className="mx-auto max-w-xl animate-rise py-16 text-center">
        <p className="font-heading text-8xl font-extrabold text-primary/20">404</p>
        <h1 className="-mt-4 font-heading text-3xl font-extrabold text-ink md:text-4xl">This page took a wrong turn</h1>
        <p className="mt-4 text-lg text-muted-foreground">
          The page you&apos;re looking for doesn&apos;t exist, or the car has been removed.
        </p>
        <div className="mt-8 flex flex-wrap justify-center gap-3">
          <Link href="/cars" className={buttonVariants({ variant: "accent", size: "lg" })}>Browse cars</Link>
          <Link href="/" className={buttonVariants({ variant: "outline", size: "lg" })}>Back to home</Link>
        </div>
      </div>
    </div>
  );
}
