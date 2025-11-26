"use client";

import { Navbar } from "@/components/Navbar";
import { ArtisanGallery } from "@/components/ArtisanGallery";
import { Footer } from "@/components/Footer";
import { artisanSpotlight } from "@/data/content";

export default function ArtisansPage() {
  return (
    <main className="relative overflow-hidden bg-brand-beige">
      <Navbar />
      <ArtisanGallery artisans={artisanSpotlight} />
      <Footer />
    </main>
  );
}

