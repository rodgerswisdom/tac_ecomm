"use client";

import { KeverdProvider, useKeverd } from "@keverdjs/react";
import type { ReactNode } from "react";

const keverdApiKey = process.env.NEXT_PUBLIC_KEVERD_API_KEY?.trim();

/** Without this, KeverdProvider only runs init(); the fingerprint POST is triggered by useKeverd / useKeverdVisitorData(immediate). */
function KeverdPassiveBootstrap() {
  useKeverd();
  return null;
}

const keverdEndpoint =
  process.env.NEXT_PUBLIC_KEVERD_ENDPOINT?.trim() || "https://api.keverd.com";

export function KeverdProviderWrapper({ children }: { children: ReactNode }) {
  if (!keverdApiKey) {
    return children;
  }
  return (
    <KeverdProvider apiKey={keverdApiKey} endpoint={keverdEndpoint}>
      <KeverdPassiveBootstrap />
      {children}
    </KeverdProvider>
  );
}
