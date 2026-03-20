import type { Metadata } from "next";
import { Cormorant_Garamond, Kumbh_Sans } from "next/font/google";
import "./globals.css";
import { CartProvider } from "@/contexts/CartContext";
import { CurrencyProvider } from "@/contexts/CurrencyContext";
import { SessionProviderWrapper } from "@/components/providers/SessionProviderWrapper";
import { FraudDetectionProvider } from "@/components/FraudDetectionProvider";
import { Toaster } from "sonner";
import { WhatsAppWidget } from "@/components/WhatsAppWidget";

const cormorantGaramond = Cormorant_Garamond({
  variable: "--font-cormorant",
  subsets: ["latin"],
  display: "swap",
  weight: ["500", "600", "700"],
});

const kumbhSans = Kumbh_Sans({
  variable: "--font-kumbh-sans",
  subsets: ["latin"],
  display: "swap",
  weight: ["400", "500", "600", "700"],
});

export const metadata: Metadata = {
  title: "Tac Accessories — The African Gallery Experience",
  description:
    "Walk through a sunlit atelier of Maasai shukas, bronze jewelry, and heritage crafts. Tac Accessories blends African modernism with luxury minimalism.",
  icons: {
    icon: [],
    apple: [],
    shortcut: [],
  },
  metadataBase: new URL("https://tacaccessories.com"),
  alternates: {
    canonical: "/",
  },
  openGraph: {
    title: "Tac Accessories — The African Gallery Experience",
    description:
      "A luxurious African art eCommerce destination celebrating heritage craftsmanship through contemporary design.",
    url: "https://tacaccessories.com",
    siteName: "Tac Accessories",
    images: [
      {
        url: "/og-image.jpg",
        width: 1200,
        height: 630,
        alt: "Tac Accessories hero imagery",
      },
    ],
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Tac Accessories — The African Gallery Experience",
    description:
      "Experience premium African artistry reimagined for the modern world.",
    images: ["/og-image.jpg"],
  },
  robots: {
    index: true,
    follow: true,
  },
};

import { prisma } from "@/lib/prisma";
import { initializeRates } from "@/lib/currency";

import { Footer } from "@/components/Footer";
import { getNavShopCategories } from "@/server/storefront/collections";
import { NavbarCategoriesProvider } from "@/contexts/NavbarCategoriesContext";

export const dynamic = "force-dynamic";

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  let settings: { usdToKesRate: number; usdToEurRate: number } = {
    usdToKesRate: 129,
    usdToEurRate: 0.92,
  };
  let shopCategories: Awaited<ReturnType<typeof getNavShopCategories>> = [];

  try {
    // Fetch global settings for currency rates.
    const dbSettings = await (prisma as any).settings.upsert({
      where: { id: "singleton" },
      update: {},
      create: { id: "singleton" },
    });
    settings = {
      usdToKesRate: dbSettings.usdToKesRate,
      usdToEurRate: dbSettings.usdToEurRate,
    };
  } catch (error) {
    console.error("Failed to load settings in layout, using defaults:", error);
  }

  try {
    shopCategories = await getNavShopCategories();
  } catch (error) {
    console.error("Failed to load nav categories, using empty list:", error);
  }

  // Initialize server-side rates.
  initializeRates(settings.usdToKesRate, settings.usdToEurRate);

  return (
    <html lang="en">
      <body
        className={`${kumbhSans.variable} ${cormorantGaramond.variable} antialiased bead-scrollbar bg-texture-linen`}
      >
        <SessionProviderWrapper>
          <CartProvider>
            <CurrencyProvider initialRates={{ kes: settings.usdToKesRate, eur: settings.usdToEurRate }}>
              <NavbarCategoriesProvider categories={shopCategories}>
                <FraudDetectionProvider>
                  <div className="flex flex-col min-h-screen">
                      <main className="flex-grow">
                          {children}
                      </main>
                      <Footer />
                  </div>
                  <Toaster position="bottom-center" richColors />
                  <WhatsAppWidget />
                </FraudDetectionProvider>
              </NavbarCategoriesProvider>
            </CurrencyProvider>
          </CartProvider>
        </SessionProviderWrapper>
      </body>
    </html>
  );
}
