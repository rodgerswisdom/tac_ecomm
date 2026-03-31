import Link from "next/link";

export default function ReturnsPage() {
  return (
    <main className="relative min-h-screen overflow-hidden bg-brand-beige bg-texture-linen">
      <section className="nav-clearance section-spacing">
        <div className="gallery-container space-y-8">
          <div className="space-y-3">
            <p className="caps-spacing text-xs text-brand-teal">Returns</p>
            <h1 className="font-heading text-4xl text-brand-umber md:text-5xl">
              Returns and exchanges
            </h1>
            <p className="max-w-3xl text-sm text-brand-umber/75">
              If your item arrives damaged or does not match your order, we can
              help you with a return or exchange request.
            </p>
          </div>

          <div className="rounded-3xl border border-brand-teal/20 bg-white/90 p-6 text-sm text-brand-umber/75 shadow-[0_18px_45px_rgba(74,43,40,0.08)]">
            <h2 className="font-heading text-2xl text-brand-umber">Return window</h2>
            <p className="mt-2">
              Submit return requests within 7 days of receiving your package.
              Items should be unused and in original condition.
            </p>

            <h2 className="mt-6 font-heading text-2xl text-brand-umber">How to request</h2>
            <p className="mt-2">
              Share your order number, issue details, and clear photos (if needed)
              through our support channels so we can review promptly.
            </p>

            <div className="mt-6 flex flex-wrap gap-3">
              <Link
                href="/contact"
                className="rounded-full bg-brand-teal px-5 py-2 text-xs font-semibold uppercase tracking-wide text-white transition hover:bg-brand-teal/90"
              >
                Start a return
              </Link>
              <Link
                href="/terms-of-service"
                className="rounded-full border border-brand-teal/30 px-5 py-2 text-xs font-semibold uppercase tracking-wide text-brand-umber transition hover:bg-brand-teal/10"
              >
                Terms of service
              </Link>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
