import { Navbar } from "@/components/Navbar";
import { ArtisanGallery } from "@/components/ArtisanGallery";
import { Footer } from "@/components/Footer";
import { getArtisanSpotlight } from "@/server/storefront/artisans";

export default async function ArtisansPage() {
  const artisans = await getArtisanSpotlight();

  return (
    <main className="relative overflow-hidden bg-brand-beige">
      <Navbar />
      <ArtisanGallery artisans={artisans} />
      <Footer />
    </main>
  );
}

