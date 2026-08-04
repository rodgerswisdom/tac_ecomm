import type { Metadata } from "next";
import { AboutPageClient } from "./AboutPageClient";

export const metadata: Metadata = {
  title: "About & FAQs | TAC Accessories",
  description:
    "Learn about TAC Accessories and find answers on handmade craft, M-Pesa Paybill payment, shipping, returns, and bespoke commissions.",
  alternates: {
    canonical: "/about",
  },
};

export default function AboutPage() {
  return <AboutPageClient />;
}
