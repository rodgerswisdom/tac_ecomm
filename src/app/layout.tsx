import type { Metadata } from "next";
import { Inter, Playfair_Display } from "next/font/google";
import "./globals.css";
import { CartProvider } from "@/contexts/CartContext";
import { SessionProvider } from "next-auth/react";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

const playfairDisplay = Playfair_Display({
  variable: "--font-playfair",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "TAC Accessories - Afrocentric Jewelry & Accessories",
  description: "Discover our exquisite collection of handcrafted Afrocentric jewelry and accessories. Celebrating African heritage through modern luxury.",
  keywords: ["afrocentric jewelry", "african accessories", "handcrafted jewelry", "cultural jewelry", "african heritage"],
  authors: [{ name: "TAC Accessories" }],
  creator: "TAC Accessories",
  publisher: "TAC Accessories",
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  metadataBase: new URL("https://tacaccessories.com"),
  alternates: {
    canonical: "/",
  },
  openGraph: {
    title: "TAC Accessories - Afrocentric Jewelry & Accessories",
    description: "Discover our exquisite collection of handcrafted Afrocentric jewelry and accessories. Celebrating African heritage through modern luxury.",
    url: "https://tacaccessories.com",
    siteName: "TAC Accessories",
    images: [
      {
        url: "/og-image.jpg",
        width: 1200,
        height: 630,
        alt: "TAC Accessories - Afrocentric Jewelry",
      },
    ],
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "TAC Accessories - Afrocentric Jewelry & Accessories",
    description: "Discover our exquisite collection of handcrafted Afrocentric jewelry and accessories. Celebrating African heritage through modern luxury.",
    images: ["/og-image.jpg"],
    creator: "@tacaccessories",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
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
        className={`${inter.variable} ${playfairDisplay.variable} antialiased`}
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
