"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { Loader2, Smartphone, CheckCircle2, XCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useCart } from "@/contexts/CartContext";

type PaymentPollState = {
  paymentStatus: string;
  orderStatus?: string;
  orderNumber?: string;
  totalFormatted?: string;
  stkMessage?: string | null;
  failureReason?: string | null;
  mpesaReceiptNumber?: string | null;
  confirmedAt?: string | null;
  isComplete: boolean;
  isFailed: boolean;
  isPending: boolean;
};

type MpesaPaymentWaitingProps = {
  orderId: string;
  orderNumber: string;
  initialMessage?: string;
  callbackWarning?: string | null;
};

const FAST_POLL_MS = 1500;
const SLOW_POLL_MS = 3000;
const CONFIRMING_AFTER_SECONDS = 60;
const MAX_ATTEMPTS = 180;

export function MpesaPaymentWaiting({
  orderId,
  orderNumber,
  initialMessage,
  callbackWarning,
}: MpesaPaymentWaitingProps) {
  const { clearCart } = useCart();
  const [pollState, setPollState] = useState<PaymentPollState | null>(null);
  const [pollError, setPollError] = useState<string | null>(null);
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const [showSuccess, setShowSuccess] = useState(false);
  const attemptsRef = useRef(0);
  const elapsedRef = useRef(0);
  const successShownRef = useRef(false);

  const fetchStatus = useCallback(async () => {
    const res = await fetch(
      `/api/order/payment-status?orderId=${encodeURIComponent(orderId)}`,
      { cache: "no-store" }
    );
    if (!res.ok) {
      throw new Error("Could not check payment status");
    }
    return (await res.json()) as PaymentPollState;
  }, [orderId]);

  useEffect(() => {
    const tick = setInterval(() => {
      elapsedRef.current += 1;
      setElapsedSeconds((s) => s + 1);
    }, 1000);
    return () => clearInterval(tick);
  }, []);

  useEffect(() => {
    let cancelled = false;
    let timeoutId: ReturnType<typeof setTimeout> | undefined;

    const showPaymentSuccess = () => {
      if (successShownRef.current) return;
      successShownRef.current = true;
      clearCart();
      setShowSuccess(true);
    };

    const poll = async () => {
      if (cancelled || attemptsRef.current >= MAX_ATTEMPTS) return;
      attemptsRef.current += 1;

      try {
        const data = await fetchStatus();
        if (cancelled) return;
        setPollState(data);
        setPollError(null);

        if (data.isComplete) {
          showPaymentSuccess();
          return;
        }

        if (data.isFailed) {
          return;
        }
      } catch {
        if (!cancelled) {
          setPollError("Having trouble checking payment status. Retrying…");
        }
      }

      if (!cancelled && attemptsRef.current < MAX_ATTEMPTS && !successShownRef.current) {
        const delay =
          elapsedRef.current >= CONFIRMING_AFTER_SECONDS ? SLOW_POLL_MS : FAST_POLL_MS;
        timeoutId = setTimeout(poll, delay);
      }
    };

    void poll();
    return () => {
      cancelled = true;
      if (timeoutId) clearTimeout(timeoutId);
    };
  }, [orderId, orderNumber, fetchStatus, clearCart]);

  const isFailed = pollState?.isFailed ?? false;
  const isComplete = showSuccess || (pollState?.isComplete ?? false);
  const isWaiting = !isFailed && !isComplete;
  const isConfirming = isWaiting && elapsedSeconds >= CONFIRMING_AFTER_SECONDS;

  const displayMessage = isComplete
    ? pollState?.mpesaReceiptNumber
      ? "Your M-Pesa payment went through. Save your receipt below — we have also emailed your order confirmation."
      : "Your payment is confirmed. We are preparing your order and will email you shortly."
    : isFailed
      ? pollState?.failureReason ||
        pollState?.stkMessage ||
        "The payment was not completed. You can try checkout again."
      : isConfirming
        ? "Confirming payment with M-Pesa… This usually takes a few seconds after you enter your PIN."
        : pollState?.stkMessage ||
          initialMessage ||
          "Check your phone and approve the M-Pesa STK push when prompted.";

  const heading = isFailed
    ? "Payment not completed"
    : isComplete
      ? "Payment received"
      : isConfirming
        ? "Confirming payment…"
        : "Complete payment on your phone";

  return (
    <div className="mx-auto max-w-lg space-y-8 text-center">
      {callbackWarning ? (
        <div
          role="alert"
          className="rounded-2xl border border-amber-300/60 bg-amber-50 px-4 py-3 text-left text-sm text-amber-950"
        >
          <p className="font-semibold">Local development</p>
          <p className="mt-1">{callbackWarning}</p>
        </div>
      ) : null}

      <div className="space-y-3">
        {isWaiting ? (
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full border border-brand-teal/30 bg-brand-teal/10">
            <Loader2 className="h-8 w-8 animate-spin text-brand-teal" aria-hidden />
          </div>
        ) : isFailed ? (
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full border border-red-200 bg-red-50">
            <XCircle className="h-8 w-8 text-red-600" aria-hidden />
          </div>
        ) : (
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full border border-brand-teal/30 bg-brand-teal/10">
            <CheckCircle2 className="h-8 w-8 text-brand-teal" aria-hidden />
          </div>
        )}

        <p className="caps-spacing text-xs text-brand-teal">M-Pesa payment</p>
        <h1 className="font-heading text-3xl text-brand-umber md:text-4xl">{heading}</h1>
        <p className="text-sm text-brand-umber/70">{displayMessage}</p>
      </div>

      {isWaiting ? (
        <ol className="space-y-3 rounded-2xl border border-brand-teal/20 bg-white/90 p-5 text-left text-sm text-brand-umber/80">
          <li className="flex gap-3">
            <Smartphone className="mt-0.5 h-5 w-5 shrink-0 text-brand-teal" aria-hidden />
            <span>
              <strong className="text-brand-umber">1. STK push sent</strong> — An M-Pesa prompt was sent to
              the number you entered at checkout.
            </span>
          </li>
          <li className="flex gap-3">
            <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-brand-teal/15 text-xs font-bold text-brand-teal">
              2
            </span>
            <span>
              <strong className="text-brand-umber">Enter your M-Pesa PIN</strong> on your phone to approve
              the payment.
            </span>
          </li>
          <li className="flex gap-3">
            <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-brand-teal/15 text-xs font-bold text-brand-teal">
              3
            </span>
            <span>
              <strong className="text-brand-umber">We confirm automatically</strong> once Tuma notifies us.
              This page updates when payment clears.
            </span>
          </li>
        </ol>
      ) : isComplete ? (
        <div className="space-y-4 rounded-2xl border border-brand-teal/25 bg-white/95 p-5 text-left text-sm">
          <p className="font-semibold text-brand-umber">What happens next</p>
          <ol className="space-y-2.5 text-brand-umber/80">
            <li className="flex gap-2">
              <span className="font-semibold text-brand-teal">1.</span>
              <span>Your order is confirmed and our team will prepare it for delivery.</span>
            </li>
            <li className="flex gap-2">
              <span className="font-semibold text-brand-teal">2.</span>
              <span>Check your email for the order confirmation and receipt details.</span>
            </li>
            <li className="flex gap-2">
              <span className="font-semibold text-brand-teal">3.</span>
              <span>Track your order anytime from your account.</span>
            </li>
          </ol>

          <dl className="grid gap-3 border-t border-brand-teal/15 pt-4 sm:grid-cols-2">
            <div>
              <dt className="text-xs uppercase tracking-wide text-brand-umber/55">Order number</dt>
              <dd className="mt-0.5 font-semibold text-brand-umber">
                {pollState?.orderNumber ?? orderNumber}
              </dd>
            </div>
            {pollState?.totalFormatted ? (
              <div>
                <dt className="text-xs uppercase tracking-wide text-brand-umber/55">Amount paid</dt>
                <dd className="mt-0.5 font-semibold text-brand-umber">{pollState.totalFormatted}</dd>
              </div>
            ) : null}
            {pollState?.mpesaReceiptNumber ? (
              <div className="sm:col-span-2">
                <dt className="text-xs uppercase tracking-wide text-brand-umber/55">M-Pesa receipt</dt>
                <dd className="mt-0.5 font-mono text-base font-semibold text-brand-umber">
                  {pollState.mpesaReceiptNumber}
                </dd>
              </div>
            ) : null}
          </dl>
        </div>
      ) : null}

      {!isComplete ? (
        <div className="flex flex-wrap justify-center gap-3 text-sm text-brand-umber/70">
          <span className="rounded-full border border-brand-teal/25 bg-white/80 px-4 py-1.5">
            Order <strong className="text-brand-umber">{pollState?.orderNumber ?? orderNumber}</strong>
          </span>
          {pollState?.totalFormatted ? (
            <span className="rounded-full border border-brand-teal/25 bg-white/80 px-4 py-1.5">
              Total <strong className="text-brand-umber">{pollState.totalFormatted}</strong>
            </span>
          ) : null}
          {isWaiting ? (
            <span className="rounded-full border border-brand-teal/25 bg-white/80 px-4 py-1.5">
              Waiting {elapsedSeconds}s
            </span>
          ) : null}
        </div>
      ) : null}

      {pollError ? (
        <p className="text-sm text-amber-800" role="status">
          {pollError}
        </p>
      ) : null}

      {isWaiting ? (
        <p className="text-xs text-brand-umber/55">
          Do not close this page until payment is confirmed. It may take up to a minute after you enter
          your PIN.
        </p>
      ) : null}

      <div className="flex flex-wrap justify-center gap-3">
        {isComplete ? (
          <Button asChild className="min-w-[220px]">
            <Link href="/collections">Continue shopping</Link>
          </Button>
        ) : isFailed ? (
          <Button asChild>
            <Link href="/checkout">Try checkout again</Link>
          </Button>
        ) : (
          <Button asChild variant="outline" className="border-brand-teal/40 text-brand-umber">
            <Link href="/collections">Continue shopping</Link>
          </Button>
        )}
      </div>
    </div>
  );
}
