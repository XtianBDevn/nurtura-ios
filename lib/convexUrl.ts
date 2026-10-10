/**
 * The Convex deployment this binary talks to.
 * EAS inlines EXPO_PUBLIC_* at build time, so the production environment
 * must set EXPO_PUBLIC_CONVEX_URL before `eas build`.
 */
export function requireConvexUrl(): string {
  const url = process.env.EXPO_PUBLIC_CONVEX_URL?.trim();
  if (!url) {
    throw new Error(
      "EXPO_PUBLIC_CONVEX_URL is not set. Add it to .env for local development, and set the same variable in the EAS production environment before building.",
    );
  }
  return url;
}
