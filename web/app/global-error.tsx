'use client';

import { useEffect } from "react";

/**
 * Last-resort error boundary that catches errors thrown in the root layout
 * itself (where the regular error.tsx can't render because its providers are
 * the ones that crashed).
 *
 * Keep this file dependency-free: no SiteNav, no context providers, no global
 * CSS variables. Anything fancy here will crash the fallback.
 */
export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Dynamic import keeps the render path dependency-free; capture is a
    // no-op when no Sentry DSN is configured.
    import("@sentry/nextjs")
      .then((Sentry) => Sentry.captureException(error))
      .catch(() => {});
    if (process.env.NODE_ENV !== "production") {
      console.error("[Bamboo global error]", error);
    }
  }, [error]);

  return (
    <html lang="en">
      <body
        style={{
          margin: 0,
          minHeight: "100vh",
          display: "grid",
          placeItems: "center",
          fontFamily: "system-ui, -apple-system, Segoe UI, sans-serif",
          background: "#0d1212",
          color: "#f5f3ef",
        }}
      >
        <div style={{ textAlign: "center", padding: "2rem", maxWidth: 480 }}>
          <p
            style={{
              fontSize: 10,
              letterSpacing: "0.18em",
              textTransform: "uppercase",
              color: "#a9a9a3",
            }}
          >
            Bamboo · grove offline
          </p>
          <h1
            style={{
              fontSize: 48,
              lineHeight: 1,
              textTransform: "uppercase",
              letterSpacing: "-0.04em",
              margin: "1rem 0",
            }}
          >
            The grove is down.
          </h1>
          <p style={{ color: "#bfbfb6", lineHeight: 1.5 }}>
            We hit a critical error before the page could load. Reloading
            usually resolves it.
          </p>
          {error.digest && (
            <p style={{ fontSize: 11, color: "#7a7a72", marginTop: "1.5rem" }}>
              ref · {error.digest}
            </p>
          )}
          <button
            type="button"
            onClick={reset}
            style={{
              marginTop: "2rem",
              padding: "0.9rem 1.6rem",
              background: "#d4a93a",
              color: "#1c1a14",
              border: "none",
              borderRadius: 8,
              fontWeight: 700,
              letterSpacing: "0.15em",
              textTransform: "uppercase",
              fontSize: 12,
              cursor: "pointer",
            }}
          >
            Reload
          </button>
        </div>
      </body>
    </html>
  );
}
