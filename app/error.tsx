"use client";

import { useEffect } from "react";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("Route rendering error:", error);
  }, [error]);

  return (
    <main className="min-h-screen flex items-center justify-center px-6 text-center">
      <div className="max-w-lg space-y-5">
        <p className="text-sm uppercase tracking-[0.2em] text-primary">MACM</p>
        <h1 className="text-3xl font-bold">This page is temporarily unavailable</h1>
        <p className="text-foreground/70">
          Please try again. If the problem continues, the site may be updating or
          one of its services may be temporarily unavailable.
        </p>
        <button
          type="button"
          onClick={() => reset()}
          className="rounded-md bg-primary px-5 py-3 font-medium text-primary-foreground"
        >
          Try again
        </button>
      </div>
    </main>
  );
}
