"use client";

import { Button } from "@/components/ui/button";
import { Printer } from "lucide-react";

export function PrintButton() {
  return (
    <Button
      type="button"
      variant="outline"
      className="border border-border bg-white print:hidden"
      onClick={() => window.print()}
    >
      <Printer className="mr-2 h-4 w-4" />
      Print / Save PDF
    </Button>
  );
}

