import type { Metadata } from "next";
import { Cormorant_Garamond, Kumbh_Sans } from "next/font/google";
import "./globals.css";
import { CartProvider } from "@/contexts/CartContext";
import { SessionProvider } from "next-auth/react";

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
  title: "TAC Accessories — The African Gallery Experience",
  description:
    "Walk through a sunlit atelier of Maasai shukas, bronze jewelry, and heritage crafts. TAC Accessories blends African modernism with luxury minimalism.",
  metadataBase: new URL("https://tacaccessories.com"),
  alternates: {
    canonical: "/",
  },
  openGraph: {
    title: "TAC Accessories — The African Gallery Experience",
    description:
      "A luxurious African art eCommerce destination celebrating heritage craftsmanship through contemporary design.",
    url: "https://tacaccessories.com",
    siteName: "TAC Accessories",
    images: [
      {
        url: "/og-image.jpg",
        width: 1200,
        height: 630,
        alt: "TAC Accessories hero imagery",
      },
    ],
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "TAC Accessories — The African Gallery Experience",
    description:
      "Experience premium African artistry reimagined for the modern world.",
    images: ["/og-image.jpg"],
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${kumbhSans.variable} ${cormorantGaramond.variable} antialiased bead-scrollbar bg-texture-linen`}
      >
        <SessionProvider>
          <CartProvider>
            {children}
          </CartProvider>
        </SessionProvider>
      </body>
    </html>
  );
}
