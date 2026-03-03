"use client";

import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  ReactNode,
} from "react";
import {
  CurrencyCode,
  getStoredCurrency,
  setStoredCurrency,
  formatInCurrency,
  initializeRates,
} from "@/lib/currency";

type CurrencyContextType = {
  currency: CurrencyCode;
  setCurrency: (code: CurrencyCode) => void;
  formatPrice: (amountUsd: number) => string;
};

const CurrencyContext = createContext<CurrencyContextType | undefined>(undefined);

export function CurrencyProvider({
  children,
  initialRates
}: {
  children: ReactNode;
  initialRates?: { kes: number; eur: number };
}) {
  const [currency, setCurrencyState] = useState<CurrencyCode>("USD");
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    setCurrencyState(getStoredCurrency());

    if (initialRates) {
      initializeRates(initialRates.kes, initialRates.eur);
    }
  }, [initialRates]);

  const setCurrency = useCallback((code: CurrencyCode) => {
    setCurrencyState(code);
    setStoredCurrency(code);
  }, []);

  const formatPrice = useCallback(
    (amountUsd: number) => formatInCurrency(amountUsd, currency),
    [currency]
  );

  const value: CurrencyContextType = {
    currency: mounted ? currency : "USD",
    setCurrency,
    formatPrice,
  };

  return (
    <CurrencyContext.Provider value={value}>{children}</CurrencyContext.Provider>
  );
}

export function useCurrency() {
  const context = useContext(CurrencyContext);
  if (context === undefined) {
    throw new Error("useCurrency must be used within a CurrencyProvider");
  }
  return context;
}
