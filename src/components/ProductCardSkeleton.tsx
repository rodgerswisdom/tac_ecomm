"use client";

export function ProductCardSkeleton() {
  return (
    <div className="animate-pulse">
      <div className="relative aspect-square w-full overflow-hidden rounded-t-xl bg-brand-beige/30" />
      <div className="space-y-3 p-4">
        <div className="h-4 w-3/4 rounded bg-brand-umber/10" />
        <div className="h-5 w-full rounded bg-brand-umber/10" />
        <div className="h-4 w-1/2 rounded bg-brand-umber/10" />
        <div className="h-6 w-1/3 rounded bg-brand-umber/10" />
      </div>
    </div>
  );
}

