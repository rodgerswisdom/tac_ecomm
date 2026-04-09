import Link from "next/link";

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
              We deliver locally and internationally. Shipping timelines vary by
              destination, product type, and payment confirmation status.
            </p>
          </div>

          <div className="grid gap-4 md:grid-cols-3">
            <article className="rounded-3xl border border-brand-teal/20 bg-white/90 p-5">
              <h2 className="font-heading text-2xl text-brand-umber">Kenya</h2>
              <p className="mt-2 text-sm text-brand-umber/75">
                Typical delivery: 1-3 business days after payment confirmation.
              </p>
            </article>
            <article className="rounded-3xl border border-brand-teal/20 bg-white/90 p-5">
              <h2 className="font-heading text-2xl text-brand-umber">East Africa</h2>
              <p className="mt-2 text-sm text-brand-umber/75">
                Typical delivery: 3-7 business days depending on courier routes.
              </p>
            </article>
            <article className="rounded-3xl border border-brand-teal/20 bg-white/90 p-5">
              <h2 className="font-heading text-2xl text-brand-umber">International</h2>
              <p className="mt-2 text-sm text-brand-umber/75">
                Typical delivery: 5-12 business days plus customs processing time.
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
