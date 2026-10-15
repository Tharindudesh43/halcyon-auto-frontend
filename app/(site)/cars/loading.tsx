export default function Loading() {
  return (
    <div className="container-page page-top pb-8" aria-busy="true" aria-label="Loading cars">
      <div className="skeleton h-12 w-64 rounded-2xl" />
      <div className="skeleton mt-3 h-6 w-40 rounded-xl" />
      <div className="skeleton mt-8 h-20 w-full rounded-[1.75rem]" />
      <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="overflow-hidden rounded-3xl bg-card ring-1 ring-border">
            <div className="skeleton aspect-[4/3]" />
            <div className="space-y-3 p-5">
              <div className="skeleton h-6 w-3/4 rounded-lg" />
              <div className="skeleton h-4 w-1/2 rounded-lg" />
              <div className="skeleton h-8 w-1/3 rounded-lg" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
