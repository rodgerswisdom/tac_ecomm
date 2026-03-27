import { Navbar } from "@/components/Navbar";
import { SearchBar } from "@/components/SearchBar";

export default function SearchPage() {
  return (
    <main className="min-h-screen bg-brand-beige bg-texture-linen">
      <Navbar />
      <section className="nav-clearance section-spacing pb-0">
        <div className="gallery-container">
          <div className="mx-auto w-full max-w-2xl rounded-3xl border border-brand-umber/12 bg-white/85 p-5 shadow-[0_20px_50px_rgba(74,43,40,0.12)] backdrop-blur-xl sm:p-6">
            <p className="caps-spacing mb-2 text-xs text-brand-teal">Search</p>
            <h1 className="mb-4 font-heading text-3xl text-brand-umber">Find products</h1>
            <p className="mb-5 text-sm text-brand-umber/70 lg:hidden">
              Type a product name, material, or category.
            </p>
            <div className="lg:hidden">
              <SearchBar />
            </div>
            <p className="hidden rounded-xl border border-brand-umber/15 bg-brand-beige/60 px-4 py-3 text-sm text-brand-umber/70 lg:block">
              This quick search page is optimized for mobile. On desktop, use the collections pages for browsing.
            </p>
          </div>
        </div>
      </section>
    </main>
  );
}
