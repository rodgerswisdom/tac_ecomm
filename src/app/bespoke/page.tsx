import type { Metadata } from "next";
import { BespokeStudioPageClient } from "./BespokeStudioPageClient";

export const metadata: Metadata = {
  alternates: {
    canonical: "/bespoke",
  },
};

export default function BespokeStudioPage() {
  return <BespokeStudioPageClient />;
}
