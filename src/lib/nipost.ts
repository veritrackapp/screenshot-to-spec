/**
 * Helpers for talking to the NIPOST postcode API (https://docs.postcode.gov.ng).
 * Pure functions only: no environment access, so they are easy to test.
 */

/** Only the administrative fields. House addresses and building use are personal data, so we never pass them on. */
export interface NipostPlace {
  state: string;
  lga: string;
  locality: string;
  zone: string;
}

export interface NipostLookup {
  valid: boolean;
  place?: NipostPlace;
}

/** Builds https://api.postcode.gov.ng/v1/lookup?code=XX-00-A00-AA-00 from the configured base address. */
export function lookupUrl(base: string, hyphenatedCode: string): string {
  const root = base.trim().replace(/\/+$/, "").replace(/\/v1$/, "");
  return `${root}/v1/lookup?code=${encodeURIComponent(hyphenatedCode)}`;
}

const text = (value: unknown) => (typeof value === "string" ? value.trim() : "");

/** Reads a lookup response. Returns null if it doesn't look like one. */
export function parseLookup(body: unknown): NipostLookup | null {
  const data = (body as { data?: unknown } | null)?.data;
  if (!data || typeof data !== "object") return null;
  const record = data as Record<string, unknown>;
  if (typeof record["valid"] !== "boolean") return null;
  if (!record["valid"]) return { valid: false };

  const admin = (record["administrative_address"] ?? {}) as Record<string, unknown>;
  return {
    valid: true,
    place: {
      state: text(admin["state_name"]),
      lga: text(admin["lga_name"]),
      locality: text(admin["locality_name"]),
      zone: text(admin["zone"]),
    },
  };
}

/** NIPOST errors look like { error: { code, message } }. */
export function errorCode(body: unknown): string | undefined {
  const code = (body as { error?: { code?: unknown } } | null)?.error?.code;
  return typeof code === "string" ? code : undefined;
}
