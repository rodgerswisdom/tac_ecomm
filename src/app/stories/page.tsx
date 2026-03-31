import Link from "next/link";

export default function StoriesPage() {
  return (
    <main className="relative min-h-screen overflow-hidden bg-brand-beige bg-texture-linen">
      <section className="nav-clearance section-spacing">
        <div className="gallery-container space-y-8">
          <div className="space-y-3">
            <p className="caps-spacing text-xs text-brand-teal">Artisan Stories</p>
            <h1 className="font-heading text-4xl text-brand-umber md:text-5xl">
              Stories behind each piece
            </h1>
            <p className="max-w-3xl text-sm text-brand-umber/75">
              Every TAC piece is shaped by a craft journey. Meet the makers, learn
              the process, and discover the communities behind our collections.
            </p>
          </div>

          <div className="rounded-3xl border border-brand-teal/20 bg-white/85 p-6 text-sm text-brand-umber/75 shadow-[0_20px_50px_rgba(74,43,40,0.1)]">
            <p>
              We are actively curating long-form maker stories for this page. In the
              meantime, you can explore the artisan profiles currently available.
            </p>
            <div className="mt-5 flex flex-wrap gap-3">
              <Link
                href="/artisans"
                className="rounded-full bg-brand-teal px-5 py-2 text-xs font-semibold uppercase tracking-wide text-white transition hover:bg-brand-teal/90"
              >
                Explore Artisans
              </Link>
              <Link
                href="/about#legacy"
                className="rounded-full border border-brand-teal/30 px-5 py-2 text-xs font-semibold uppercase tracking-wide text-brand-umber transition hover:bg-brand-teal/10"
              >
                View Our Legacy
              </Link>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
