'use client'

import Link from "next/link";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  console.error("Unhandled app error:", error);

  return (
    <html lang="en">
      <body>
        <main className="mx-auto flex min-h-screen w-full max-w-3xl flex-col items-center justify-center px-6 text-center">
          <p className="text-sm font-medium uppercase tracking-[0.24em] text-muted-foreground">
            500
          </p>
          <h1 className="mt-3 text-3xl font-semibold tracking-tight sm:text-4xl">
            Something went wrong
          </h1>
          <p className="mt-4 max-w-xl text-muted-foreground">
            An unexpected error occurred while loading this page.
          </p>
          <div className="mt-8 flex gap-3">
            <button
              onClick={() => reset()}
              className="rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition hover:opacity-90"
            >
              Try again
            </button>
            <Link
              href="/"
              className="rounded-md border border-border px-4 py-2 text-sm font-medium transition hover:bg-accent"
            >
              Go home
            </Link>
          </div>
        </main>
      </body>
    </html>
  );
}
