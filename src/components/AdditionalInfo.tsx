"use client";

import { useMemo, useState } from "react";
import { ChevronDown, Ruler } from "lucide-react";
import { cn } from "@/lib/utils";
import type { ProductCardData } from "@/types/product";
import {
  buildAdditionalInfoFacts,
  getAdditionalInfoPreview,
  type AdditionalInfoFact,
} from "@/lib/product-additional-info";

interface AdditionalInfoProps {
  product: ProductCardData;
}

function MaterialChips({ value }: { value: string }) {
  const chips = value.split(",").map((part) => part.trim()).filter(Boolean);
  if (chips.length === 0) return null;

  return (
    <div className="flex flex-wrap gap-1.5">
      {chips.map((chip) => (
        <span
          key={chip}
          className="rounded-full border border-brand-teal/25 bg-brand-teal/8 px-2.5 py-0.5 text-xs font-medium text-brand-umber/85"
        >
          {chip}
        </span>
      ))}
    </div>
  );
}

function FactRow({ fact }: { fact: AdditionalInfoFact }) {
  if (fact.kind === "dimension") {
    return (
      <div className="rounded-xl border border-brand-coral/20 bg-gradient-to-br from-brand-coral/10 via-white/70 to-brand-jade/10 px-3.5 py-3">
        <div className="flex items-start gap-3">
          <span className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-white/80 text-brand-coral">
            <Ruler className="h-4 w-4" aria-hidden />
          </span>
          <div className="min-w-0">
            <p className="text-[11px] font-semibold uppercase tracking-wide text-brand-coral/90">
              Dimensions
            </p>
            <p className="mt-0.5 font-heading text-lg leading-snug text-brand-umber sm:text-xl">
              {fact.value}
            </p>
          </div>
        </div>
      </div>
    );
  }

  if (fact.kind === "material") {
    return (
      <div className="space-y-1.5">
        <p className="text-xs font-semibold uppercase tracking-wide text-brand-umber/55">
          {fact.label}
        </p>
        <MaterialChips value={fact.value} />
      </div>
    );
  }

  if (fact.kind === "story") {
    return (
      <div className="space-y-1">
        <p className="text-xs font-semibold uppercase tracking-wide text-brand-umber/55">
          {fact.label}
        </p>
        <p className="text-sm leading-relaxed text-brand-umber/75 whitespace-pre-line">
          {fact.value}
        </p>
      </div>
    );
  }

  return (
    <div className="grid gap-0.5 sm:grid-cols-[6.5rem_1fr] sm:gap-3">
      <dt className="text-sm font-medium text-brand-umber">{fact.label}</dt>
      <dd className="text-sm leading-relaxed text-brand-umber/75">{fact.value}</dd>
    </div>
  );
}

export function AdditionalInfo({ product }: AdditionalInfoProps) {
  const [open, setOpen] = useState(false);

  const facts = useMemo(() => buildAdditionalInfoFacts(product), [product]);
  const preview = useMemo(() => getAdditionalInfoPreview(facts), [facts]);
  const hasFacts = facts.length > 0;

  const dimensionFact = facts.find((fact) => fact.kind === "dimension");
  const otherFacts = facts.filter((fact) => fact.kind !== "dimension");

  return (
    <div className="rounded-xl border border-brand-umber/15 bg-white/40">
      <button
        type="button"
        id="additional-info-heading"
        aria-expanded={open}
        aria-controls="additional-info-panel"
        onClick={() => setOpen((prev) => !prev)}
        className="flex w-full items-center justify-between gap-3 px-3.5 py-3 text-left sm:px-4"
      >
        <span className="min-w-0">
          <span className="block text-sm font-semibold text-brand-umber">Additional info</span>
          {!open && preview ? (
            <span className="mt-0.5 block truncate text-xs text-brand-umber/55">
              {preview}
            </span>
          ) : null}
        </span>
        <ChevronDown
          className={cn(
            "h-4 w-4 shrink-0 text-brand-umber/50 transition-transform",
            open && "rotate-180",
          )}
          aria-hidden
        />
      </button>

      {open ? (
        <div
          id="additional-info-panel"
          role="region"
          aria-labelledby="additional-info-heading"
          className="space-y-4 border-t border-brand-umber/10 px-3.5 py-3.5 sm:px-4"
        >
          {hasFacts ? (
            <>
              {dimensionFact ? <FactRow fact={dimensionFact} /> : null}
              {otherFacts.length > 0 ? (
                <dl className="space-y-3">
                  {otherFacts.map((fact) => (
                    <div key={fact.key}>
                      <FactRow fact={fact} />
                    </div>
                  ))}
                </dl>
              ) : null}
            </>
          ) : (
            <p className="text-sm text-brand-umber/65">
              Extra product details such as materials and dimensions will show here when available.
            </p>
          )}
        </div>
      ) : null}
    </div>
  );
}
