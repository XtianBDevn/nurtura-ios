/** Shown wherever the app presents health information or collects an account. */
export const MEDICAL_DISCLAIMER =
  "Nurtura organizes caregiver-entered notes and routines. It does not diagnose, treat, cure, or replace professional medical advice. In an emergency, contact local emergency services.";

export function httpsUrl(value: string | undefined): string | null {
  const trimmed = value?.trim();
  if (!trimmed || !/^https:\/\//i.test(trimmed)) return null;
  return trimmed;
}

/** Links appear only after the owner publishes real https pages and sets the env vars. */
export function legalLinks(): { label: string; url: string }[] {
  const privacy = httpsUrl(process.env.EXPO_PUBLIC_PRIVACY_POLICY_URL);
  const terms = httpsUrl(process.env.EXPO_PUBLIC_TERMS_URL);
  const support = httpsUrl(process.env.EXPO_PUBLIC_SUPPORT_URL);
  return [
    privacy ? { label: "Privacy Policy", url: privacy } : null,
    terms ? { label: "Terms of Use", url: terms } : null,
    support ? { label: "Support", url: support } : null,
  ].filter((link): link is { label: string; url: string } => link !== null);
}
