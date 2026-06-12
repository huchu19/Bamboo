import type { NextConfig } from "next";
import { withSentryConfig } from "@sentry/nextjs";

const nextConfig: NextConfig = {
  serverExternalPackages: ['firebase-admin', '@google-cloud/firestore', 'google-auth-library'],
};

// Sentry build plugin (source-map upload, release tagging) only engages when
// a DSN is configured — DSN-less local/preview builds stay untouched.
export default process.env.NEXT_PUBLIC_SENTRY_DSN || process.env.SENTRY_DSN
  ? withSentryConfig(nextConfig, {
      org: process.env.SENTRY_ORG,
      project: process.env.SENTRY_PROJECT,
      // Upload needs SENTRY_AUTH_TOKEN in the build env; without it the
      // build still succeeds, just without readable stack traces.
      silent: !process.env.CI,
      widenClientFileUpload: true,
      disableLogger: true,
    })
  : nextConfig;
