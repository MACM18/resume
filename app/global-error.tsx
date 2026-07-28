"use client";

export default function GlobalError({ reset }: { reset: () => void }) {
  return (
    <html lang="en">
      <body>
        <main style={{ fontFamily: "system-ui", padding: "4rem", textAlign: "center" }}>
          <h1>Something went wrong</h1>
          <p>Please reload the site and try again.</p>
          <button type="button" onClick={() => reset()}>
            Reload
          </button>
        </main>
      </body>
    </html>
  );
}
