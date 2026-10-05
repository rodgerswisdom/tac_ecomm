import type { Metadata } from "next";
import Link from "next/link";
import { KENYA_DELIVERY_BANDS, PICKUP_LOCATION, SHIPPING_RATES_KSH } from "@/lib/delivery";

export const metadata: Metadata = {
  alternates: {
    canonical: "/shipping",
  },
};

export default function ShippingPage() {
  return (
    <main className="relative min-h-screen overflow-hidden page-surface">
      <section className="nav-clearance section-spacing">
        <div className="gallery-container space-y-8">
          <div className="space-y-3">
            <p className="caps-spacing text-xs text-brand-teal">Shipping</p>
            <h1 className="font-heading text-4xl text-brand-umber md:text-5xl">
              Delivery information
            </h1>
            <p className="max-w-3xl text-sm text-brand-umber/75">
              We deliver across Kenya and internationally. Kenya delivery is
              priced by area, and you can always collect your order for free.
            </p>
          </div>

          <div className="rounded-3xl border border-brand-teal/20 bg-white/90 p-5">
            <h2 className="font-heading text-2xl text-brand-umber">Kenya</h2>
            <dl className="mt-3 divide-y divide-brand-umber/10 text-sm">
              <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1 py-3">
                <dt>
                  <span className="font-medium text-brand-umber">Pickup</span>
                  <span className="block text-brand-umber/65">{PICKUP_LOCATION.address}</span>
                </dt>
                <dd className="font-semibold text-brand-teal">Free</dd>
              </div>
              {KENYA_DELIVERY_BANDS.map((band) => (
                <div key={band.id} className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1 py-3">
                  <dt>
                    <span className="font-medium text-brand-umber">{band.label}</span>
                    <span className="block text-brand-umber/65">{band.areas}</span>
                  </dt>
                  <dd className="font-semibold tabular-nums text-brand-umber">
                    KSh {SHIPPING_RATES_KSH[band.id].toLocaleString("en-KE")}
                  </dd>
                </div>
              ))}
            </dl>
            <p className="mt-3 text-xs text-brand-umber/60">
              Delivery timelines start once payment is confirmed.
            </p>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <article className="rounded-3xl border border-brand-teal/20 bg-white/90 p-5">
              <h2 className="font-heading text-2xl text-brand-umber">International — Standard</h2>
              <p className="mt-2 text-sm text-brand-umber/75">
                3-7 business days plus customs processing where applicable.
              </p>
            </article>
            <article className="rounded-3xl border border-brand-teal/20 bg-white/90 p-5">
              <h2 className="font-heading text-2xl text-brand-umber">International — Express</h2>
              <p className="mt-2 text-sm text-brand-umber/75">
                2-5 business days plus customs processing where applicable.
              </p>
            </article>
          </div>

          <div className="rounded-3xl border border-brand-teal/20 bg-white/90 p-6 text-sm text-brand-umber/75">
            <p>
              Need support with a shipment? Reach our team and share your order
              reference for faster assistance.
            </p>
            <Link
              href="/contact"
              className="mt-4 inline-block rounded-full bg-brand-teal px-5 py-2 text-xs font-semibold uppercase tracking-wide text-white transition hover:bg-brand-teal/90"
            >
              Contact Support
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}
