/**
 * Adrex data access layer.
 *
 * Every read the UI makes goes through this module. Postcode lookups call the
 * live National Digital Alphanumeric Postcode API through /api/lookup. If the
 * live service can't answer, the check fails with an error: we never guess.
 * The only non-live result is a clearly labelled sample postcode (see ResultSource).
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
  ResultSource,
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
export const VERIFIED_MIN_SCORE = 85;
/** Score at or above which an address Needs review (below is High risk). */
export const REVIEW_MIN_SCORE = 60;

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
  source: ResultSource = "live",
): ValidationResult {
  const reasons: ValidationReason[] = [];
  let score = 0;

  if (record) {
    score += 40;
    reasons.push({ label: "Postcode exists in the national registry", outcome: "pass" });

    if (same(address.state, record.state)) {
      score += 20;
      reasons.push({ label: `State matches postcode (${record.state})`, outcome: "pass" });
    } else {
      reasons.push({
        label: `State doesn't match postcode (expected ${record.state})`,
        outcome: "fail",
      });
    }

    if (same(address.city, record.city)) {
      score += 25;
      reasons.push({ label: "Area matches stated city", outcome: "pass" });
    } else {
      reasons.push({
        label: `Postcode belongs to ${record.city}, not ${address.city || "the stated city"}`,
        outcome: "warn",
      });
    }
  } else {
    reasons.push({ label: "Postcode not found in the national registry", outcome: "fail" });
    reasons.push({ label: "Couldn't confirm city or state", outcome: "fail" });
  }

  if (/\d/.test(address.street)) {
    score += 15;
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
    source,
    checkedAt: new Date().toISOString(),
  };
}

interface LookupOutcome {
  record: PostcodeRecord | undefined;
  source: ResultSource;
}

const SERVICE_DOWN_MESSAGE =
  "We couldn't reach the postcode service. Please try again in a moment.";
const NOT_AVAILABLE = { name: "Not available yet", distanceKm: 0, phone: "" };

/**
 * Asks the live postcode API (through our /api/lookup route) about a code.
 * If the live service can't answer, this throws. It never guesses.
 * The one non-live result is a sample postcode from the built-in demo registry,
 * used only when the live registry doesn't know the code; the UI labels it.
 */
async function fetchRecord(postcode: string): Promise<LookupOutcome> {
  const normalized = normalizePostcode(postcode);

  let res: Response;
  try {
    res = await fetch(`/api/lookup?postcode=${encodeURIComponent(normalized)}`);
  } catch {
    throw new PostcodeServiceError(SERVICE_DOWN_MESSAGE);
  }
  if (res.status === 429) {
    throw new PostcodeServiceError(
      "You've used your 3 free checks today. Sign up to keep checking addresses.",
    );
  }
  if (res.status === 400) {
    throw new PostcodeServiceError("That postcode isn't in a valid format (e.g. FC 02 A09 DB 09).");
  }
  if (!res.ok) throw new PostcodeServiceError(SERVICE_DOWN_MESSAGE);

  const data = await res.json().catch(() => null);
  if (!data || typeof data.valid !== "boolean")
    throw new PostcodeServiceError(SERVICE_DOWN_MESSAGE);

  if (!data.valid) {
    const sample = findPostcode(normalized);
    return sample ? { record: sample, source: "sample" } : { record: undefined, source: "live" };
  }

  return {
    record: {
      postcode: normalized,
      area: typeof data.area === "string" ? data.area : "",
      city: typeof data.city === "string" ? data.city : "",
      state: typeof data.state === "string" ? data.state : "",
      lat: typeof data.lat === "number" ? data.lat : 0,
      lng: typeof data.lng === "number" ? data.lng : 0,
      nearestHospital: NOT_AVAILABLE,
      nearestPolice: NOT_AVAILABLE,
    },
    source: "live",
  };
}

export async function validateAddress(
  postcode: string,
  address: AddressInput,
  options: { simulateOutage?: boolean } = {},
): Promise<ValidationResult> {
  if (options.simulateOutage) {
    throw new PostcodeServiceError("The postcode service didn't respond. Please try again.");
  }
  if (!isValidPostcodeFormat(postcode)) {
    throw new PostcodeServiceError("That postcode isn't in a valid format (e.g. FC 02 A09 DB 09).");
  }
  const { record, source } = await fetchRecord(postcode);
  return scoreAddress(postcode, address, record, source);
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
