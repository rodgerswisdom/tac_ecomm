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
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { MaintenanceMode } from "@/components/MaintenanceMode";

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  // Fetch global settings for currency rates
  const settings = await (prisma as any).settings.upsert({
    where: { id: "singleton" },
    update: {},
    create: { id: "singleton" },
  });

  // Initialize server-side rates
  initializeRates(settings.usdToKesRate, settings.usdToEurRate);

  // Check Maintenance Mode
  const session = await auth();
  const headersList = await headers();
  const pathname = headersList.get("x-pathname") || "";
  const isAdmin = session?.user?.role === "ADMIN";
  const isMaintenanceActive = settings.maintenanceMode && !isAdmin && !pathname.startsWith('/admin') && !pathname.startsWith('/auth');

  const shopCategories = await getNavShopCategories();

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
                          {isMaintenanceActive ? <MaintenanceMode /> : children}
                      </main>
                      {!isMaintenanceActive && <Footer />}
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
