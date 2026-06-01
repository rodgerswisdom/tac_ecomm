"use client";

import { KeverdProvider, useKeverd } from "@keverdjs/react";
import { useEffect, type ReactNode } from "react";

const keverdApiKey = process.env.NEXT_PUBLIC_KEVERD_API_KEY?.trim();

/**
 * Minimal initializer: per Keverd React quickstart, the first `useKeverd()` call triggers
 * fingerprinting + the network request. We mount this once at the app root.
 */
function KeverdInit() {
  const { deviceId, riskScore, isLoading, error } = useKeverd();

  useEffect(() => {
    if (typeof window === "undefined") return;
    // Helpful for debugging / verification in DevTools.
    (window as any).__KEVERD_DEVICE_ID__ = deviceId;
    (window as any).__KEVERD_RISK_SCORE__ = riskScore;
    (window as any).__KEVERD_ERROR__ = error ? (error as any).message ?? String(error) : null;
    (window as any).__KEVERD_LOADING__ = isLoading;
  }, [deviceId, riskScore, isLoading, error]);

  return null;
}

export function KeverdProviderWrapper({ children }: { children: ReactNode }) {
  if (!keverdApiKey) {
    return children;
  }

  return (
    <KeverdProvider apiKey={keverdApiKey}>
      <KeverdInit />
      {children}
    </KeverdProvider>
  );
}
