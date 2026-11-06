/**
 * Adrex data access layer.
 *
 * Every read the UI makes goes through this module. Postcode lookups call the
 * live National Digital Alphanumeric Postcode API through /api/lookup and fall
 * back to the demo registry when the API is unreachable or has no record.
 */
import {
  AREA_FAILURE_RATES,
  AVG_FAILED_DELIVERY_COST_NGN,
  AVG_FRAUD_LOSS_NGN,
  POSTCODE_REGISTRY,
  RECENT_CHECKS,
  SAMPLE_POSTCODES,
} from "./mockData";
import type {
  AddressInput,
  DailyChecks,
  DashboardData,
  PostcodeRecord,
  ValidationReason,
  ValidationResult,
  VerificationStatus,
} from "./types";

export type * from "./types";
export { SAMPLE_POSTCODES };

export class PostcodeServiceError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "PostcodeServiceError";
  }
}

/** Score at or above which an address is Verified. */
export const VERIFIED_MIN_SCORE = 75;
/** Score at or above which an address Needs review (below is High risk). */
export const REVIEW_MIN_SCORE = 45;

/** NIPOST codes are 11 characters: State, LGA, District, Area, Building. */
const POSTCODE_PATTERN = /^[A-Z0-9]{11}$/;

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

/** Uppercases and strips spaces / punctuation: "fc-02 a09 db09" -> "FC02A09DB09". */
export function normalizePostcode(input: string): string {
  return input.toUpperCase().replace(/[^A-Z0-9]/g, "");
}

/** "FC02A09DB09" -> "FC 02 A09 DB 09". Returns the input unchanged if it is not 11 chars. */
export function formatPostcode(input: string): string {
  const n = normalizePostcode(input);
  return n.length === 11
    ? `${n.slice(0, 2)} ${n.slice(2, 4)} ${n.slice(4, 7)} ${n.slice(7, 9)} ${n.slice(9)}`
    : n;
}

export interface PostcodeParts {
  state: string;
  lga: string;
  district: string;
  area: string;
  building: string;
}

/** "FC02A09DB09" -> { state: "FC", lga: "02", district: "A09", area: "DB", building: "09" } */
export function parsePostcode(input: string): PostcodeParts | undefined {
  const n = normalizePostcode(input);
  if (n.length !== 11) return undefined;
  return {
    state: n.slice(0, 2),
    lga: n.slice(2, 4),
    district: n.slice(4, 7),
    area: n.slice(7, 9),
    building: n.slice(9),
  };
}

export function isValidPostcodeFormat(input: string): boolean {
  return POSTCODE_PATTERN.test(normalizePostcode(input));
}

export function findPostcode(input: string): PostcodeRecord | undefined {
  const n = normalizePostcode(input);
  return POSTCODE_REGISTRY.find((r) => normalizePostcode(r.postcode) === n);
}

export function statusForScore(score: number): VerificationStatus {
  if (score >= VERIFIED_MIN_SCORE) return "verified";
  if (score >= REVIEW_MIN_SCORE) return "review";
  return "high_risk";
}

const same = (a: string, b: string) => a.trim().toLowerCase() === b.trim().toLowerCase();

/** Pure scoring used by validateAddress. Exported for tests. */
export function scoreAddress(
  postcode: string,
  address: AddressInput,
  record?: PostcodeRecord,
): ValidationResult {
  const reasons: ValidationReason[] = [];
  let score = 0;

  if (record) {
    score += 35;
    reasons.push({ label: "Postcode exists in the national registry", outcome: "pass" });

    if (same(address.state, record.state)) {
      score += 15;
      reasons.push({ label: `State matches postcode (${record.state})`, outcome: "pass" });
    } else {
      reasons.push({
        label: `State doesn't match postcode (expected ${record.state})`,
        outcome: "fail",
      });
    }

    if (same(address.city, record.city)) {
      score += 20;
      reasons.push({ label: "Area matches stated city", outcome: "pass" });
    } else {
      reasons.push({
        label: `Postcode belongs to ${record.city}, not ${address.city || "the stated city"}`,
        outcome: "warn",
      });
    }

    if (record.failureHistory === "low") {
      score += 20;
      reasons.push({ label: "Low delivery failure history", outcome: "pass" });
    } else if (record.failureHistory === "medium") {
      score += 8;
      reasons.push({ label: "Some failed deliveries recorded in this area", outcome: "warn" });
    } else {
      score -= 10;
      reasons.push({ label: "High delivery failure history", outcome: "fail" });
    }

    if (record.identityFlagged) {
      score -= 25;
      reasons.push({ label: "Many unrelated identities linked to this postcode", outcome: "fail" });
    }
  } else {
    reasons.push({ label: "Postcode not found in the national registry", outcome: "fail" });
    reasons.push({ label: "Couldn't confirm city or state", outcome: "fail" });
  }

  if (/\d/.test(address.street)) {
    score += 10;
    reasons.push({ label: "Street address includes a house number", outcome: "pass" });
  } else {
    reasons.push({ label: "Street address has no house number", outcome: "warn" });
  }

  score = Math.max(0, Math.min(100, score));

  return {
    postcode: formatPostcode(postcode),
    status: statusForScore(score),
    score,
    reasons,
    matched: record ? { area: record.area, city: record.city, state: record.state } : undefined,
    checkedAt: new Date().toISOString(),
  };
}

/**
 * Asks the live postcode API (through our /api/lookup route) about a code.
 * Falls back to the demo registry if the API is unreachable or has no record.
 * The browser console shows which path was used.
 */
async function fetchRecord(postcode: string): Promise<PostcodeRecord | undefined> {
  const own = findPostcode(postcode); // Adrex's demo registry and delivery signals
  try {
    const res = await fetch(
      `/api/lookup?postcode=${encodeURIComponent(normalizePostcode(postcode))}`,
    );
    console.info("[Adrex] /api/lookup responded with HTTP", res.status);
    if (res.status === 429) {
      throw new PostcodeServiceError(
        "You've used your 5 free checks. Sign up to keep checking addresses.",
      );
    }
    if (!res.ok) throw new Error(`lookup route returned ${res.status}`);

    const api = await res.json();
    const data = api?.body?.data;
    console.info("[Adrex] postcode API says:", data);
    if (!data) throw new Error("no data in the response");

    // The API answers 200 even for unknown codes: valid=false means "no record".
    if (data.valid !== true) return own;

    const none = { name: "Not available yet", distanceKm: 0, phone: "" };
    return {
      postcode: data.postcode ?? normalizePostcode(postcode),
      area: data.area ?? own?.area ?? "",
      city: data.city ?? own?.city ?? "",
      state: data.state ?? own?.state ?? "",
      lat: data.lat ?? own?.lat ?? 0,
      lng: data.lng ?? own?.lng ?? 0,
      failureHistory: own?.failureHistory ?? "low",
      identityFlagged: own?.identityFlagged ?? false,
      nearestHospital: own?.nearestHospital ?? none,
      nearestPolice: own?.nearestPolice ?? none,
    };
  } catch (err) {
    if (err instanceof PostcodeServiceError) throw err;
    console.warn("[Adrex] live lookup failed, using demo data:", err);
    return own;
  }
}

export async function validateAddress(
  postcode: string,
  address: AddressInput,
  options: { simulateOutage?: boolean } = {},
): Promise<ValidationResult> {
  await sleep(900);
  if (options.simulateOutage) {
    throw new PostcodeServiceError("The postcode service didn't respond. Please try again.");
  }
  if (!isValidPostcodeFormat(postcode)) {
    throw new PostcodeServiceError("That postcode isn't in a valid format (e.g. FC 02 A09 DB 09).");
  }
  const record = await fetchRecord(postcode);
  return scoreAddress(postcode, address, record);
}

// ---------- Dashboard ----------

function seededRandom(seed: number) {
  let t = seed;
  return () => {
    t += 0x6d2b79f5;
    let x = Math.imul(t ^ (t >>> 15), 1 | t);
    x ^= x + Math.imul(x ^ (x >>> 7), 61 | x);
    return ((x ^ (x >>> 14)) >>> 0) / 4294967296;
  };
}

function buildDaily(days = 30): DailyChecks[] {
  const rand = seededRandom(384);
  const today = new Date();
  today.setUTCHours(0, 0, 0, 0);
  return Array.from({ length: days }, (_, i) => {
    const d = new Date(today);
    d.setUTCDate(today.getUTCDate() - (days - 1 - i));
    const weekend = d.getUTCDay() === 0 || d.getUTCDay() === 6;
    const base = 1250 + i * 18;
    const checks = Math.round(base * (weekend ? 0.72 : 1) + (rand() - 0.5) * 220);
    const flagged = Math.round(checks * (0.085 + rand() * 0.04));
    return {
      date: d.toISOString().slice(0, 10),
      label: d.toLocaleDateString("en-GB", { day: "numeric", month: "short", timeZone: "UTC" }),
      checks,
      flagged,
    };
  });
}

export async function getDashboardData(): Promise<DashboardData> {
  await sleep(150);
  const daily = buildDaily();
  const addressesChecked = daily.reduce((s, d) => s + d.checks, 0);
  const flagged = daily.reduce((s, d) => s + d.flagged, 0);
  const fakeAddressesBlocked = Math.round(flagged * 0.38);
  const failedDeliveriesAvoided = Math.round(flagged * 0.62);
  return {
    kpis: {
      addressesChecked,
      failedDeliveriesAvoided,
      fakeAddressesBlocked,
      nairaSaved:
        failedDeliveriesAvoided * AVG_FAILED_DELIVERY_COST_NGN +
        fakeAddressesBlocked * AVG_FRAUD_LOSS_NGN,
    },
    daily,
    areas: AREA_FAILURE_RATES,
    recent: RECENT_CHECKS,
  };
}

export const KPI_ASSUMPTIONS = {
  avgFailedDeliveryCost: AVG_FAILED_DELIVERY_COST_NGN,
  avgFraudLoss: AVG_FRAUD_LOSS_NGN,
};