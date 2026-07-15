import Link from "next/link";
import { FreeShippingNote } from "@/components/FreeShippingNote";

export default function ShippingPage() {
  return (
    <main className="relative min-h-screen overflow-hidden bg-brand-beige bg-texture-linen">
      <section className="nav-clearance section-spacing">
        <div className="gallery-container space-y-8">
          <div className="space-y-3">
            <p className="caps-spacing text-xs text-brand-teal">Shipping</p>
            <h1 className="font-heading text-4xl text-brand-umber md:text-5xl">
              Delivery information
            </h1>
            <p className="max-w-3xl text-sm text-brand-umber/75">
              We deliver locally and internationally. Timelines depend on your
              destination, delivery speed (standard or express), and payment
              confirmation.
            </p>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <article className="rounded-3xl border border-brand-teal/20 bg-white/90 p-5">
              <h2 className="font-heading text-2xl text-brand-umber">Kenya — Standard</h2>
              <p className="mt-2 text-sm text-brand-umber/75">
                1-3 business days after payment confirmation.
              </p>
            </article>
            <article className="rounded-3xl border border-brand-teal/20 bg-white/90 p-5">
              <h2 className="font-heading text-2xl text-brand-umber">Kenya — Express</h2>
              <p className="mt-2 text-sm text-brand-umber/75">
                1-2 business days after payment confirmation.
              </p>
            </article>
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

          <div className="rounded-3xl border border-brand-gold/30 bg-brand-gold/5 p-6 text-sm text-brand-umber/75">
            <p className="font-medium text-brand-umber">Free shipping</p>
            <FreeShippingNote className="mt-2" />
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
