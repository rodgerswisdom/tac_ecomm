import Link from "next/link";

export default function NotFoundPage() {
  return (
    <main className="mx-auto flex min-h-[70vh] w-full max-w-3xl flex-col items-center justify-center px-6 text-center">
      <p className="text-sm font-medium uppercase tracking-[0.24em] text-muted-foreground">
        404
      </p>
      <h1 className="mt-3 text-3xl font-semibold tracking-tight sm:text-4xl">
        Page not found
      </h1>
      <p className="mt-4 max-w-xl text-muted-foreground">
        The page you are looking for does not exist or may have been moved.
      </p>
      <div className="mt-8 flex gap-3">
        <Link
          href="/"
          className="rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition hover:opacity-90"
        >
          Back to home
        </Link>
        <Link
          href="/collections"
          className="rounded-md border border-border px-4 py-2 text-sm font-medium transition hover:bg-accent"
        >
          Browse collections
        </Link>
      </div>
    </main>
  );
}
