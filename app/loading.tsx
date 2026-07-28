export default function Loading() {
  return (
    <main className="min-h-screen flex items-center justify-center px-6">
      <div className="text-center text-foreground/70" role="status" aria-live="polite">
        Loading portfolio…
      </div>
      <div className="absolute bottom-4 right-4">
        <p className="text-center text-foreground/70" role="status" aria-live="polite">
          By MACM
        </p>
      </div>
    </main>
  );
}
