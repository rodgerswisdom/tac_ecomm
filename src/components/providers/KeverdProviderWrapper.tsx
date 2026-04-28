"use client";

import { KeverdProvider, useKeverd } from "@keverdjs/react";
import { useEffect, type ReactNode } from "react";

const keverdApiKey = process.env.NEXT_PUBLIC_KEVERD_API_KEY?.trim();

/** Without this, KeverdProvider only runs init(); the fingerprint POST is triggered by useKeverd / useKeverdVisitorData(immediate). */
function KeverdPassiveBootstrap() {
  const { refresh, error, isLoading, deviceId, riskScore } = useKeverd();

  useEffect(() => {
    // Force one network attempt on mount in dev so it's visible in DevTools.
    refresh().catch(() => {
      // The hook's `error` will be populated; keep this silent to avoid noisy unhandled rejections.
    });
  }, [refresh]);

  if (process.env.NODE_ENV !== "production") {
    (globalThis as any).__KEVERD_STATE__ = { isLoading, error, deviceId, riskScore };
  }
  return null;
}

const keverdEndpoint =
  process.env.NEXT_PUBLIC_KEVERD_ENDPOINT?.trim() || "https://api.keverd.com";

export function KeverdProviderWrapper({ children }: { children: ReactNode }) {
  if (!keverdApiKey) {
    if (process.env.NODE_ENV !== "production") {
      // Lightweight runtime hint for debugging env injection.
      (globalThis as any).__KEVERD_ENABLED__ = false;
    }
    return children;
  }
  if (process.env.NODE_ENV !== "production") {
    (globalThis as any).__KEVERD_ENABLED__ = true;
    (globalThis as any).__KEVERD_ENDPOINT__ = keverdEndpoint;
  }
  return (
    <KeverdProvider
      apiKey={keverdApiKey}
      endpoint={keverdEndpoint}
      debug={process.env.NODE_ENV !== "production"}
    >
      <KeverdPassiveBootstrap />
      {children}
    </KeverdProvider>
  );
}
