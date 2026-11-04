import type { AddressInput, AreaFailureRate, PostcodeRecord, RecentCheck } from "./types";

/**
 * Mock national postcode registry. Replace with the real
 * National Digital Alphanumeric Postcode API in postcodeService.ts.
 */
export const POSTCODE_REGISTRY: PostcodeRecord[] = [
  {
    postcode: "LA1 4KJ",
    area: "Ikeja GRA",
    city: "Ikeja",
    state: "Lagos",
    lat: 6.58,
    lng: 3.35,
    failureHistory: "low",
    identityFlagged: false,
    nearestHospital: { name: "LASUTH Ikeja", distanceKm: 2.1, phone: "0800 112 000" },
    nearestPolice: { name: "Alausa Police Division", distanceKm: 1.4, phone: "0800 767 000" },
  },
  {
    postcode: "FC2 9WS",
    area: "Wuse II",
    city: "Abuja",
    state: "FCT",
    lat: 9.08,
    lng: 7.47,
    failureHistory: "medium",
    identityFlagged: false,
    nearestHospital: { name: "Wuse District Hospital", distanceKm: 1.2, phone: "0800 112 001" },
    nearestPolice: { name: "Wuse Police Division", distanceKm: 0.9, phone: "0800 767 001" },
  },
  {
    postcode: "RV7 1PH",
    area: "GRA Phase 2",
    city: "Port Harcourt",
    state: "Rivers",
    lat: 4.82,
    lng: 7.0,
    failureHistory: "medium",
    identityFlagged: false,
    nearestHospital: { name: "UPTH Port Harcourt", distanceKm: 4.6, phone: "0800 112 002" },
    nearestPolice: { name: "GRA Police Division", distanceKm: 1.8, phone: "0800 767 002" },
  },
  {
    postcode: "KN3 2SB",
    area: "Sabon Gari",
    city: "Kano",
    state: "Kano",
    lat: 12.01,
    lng: 8.53,
    failureHistory: "high",
    identityFlagged: true,
    nearestHospital: { name: "Murtala Mohammed Hospital", distanceKm: 3.0, phone: "0800 112 003" },
    nearestPolice: { name: "Sabon Gari Police Division", distanceKm: 0.7, phone: "0800 767 003" },
  },
  {
    postcode: "OY5 3XB",
    area: "Bodija",
    city: "Ibadan",
    state: "Oyo",
    lat: 7.42,
    lng: 3.91,
    failureHistory: "low",
    identityFlagged: false,
    nearestHospital: { name: "UCH Ibadan", distanceKm: 2.4, phone: "0800 112 004" },
    nearestPolice: { name: "Bodija Police Division", distanceKm: 1.1, phone: "0800 767 004" },
  },
  {
    postcode: "EN4 6GT",
    area: "Independence Layout",
    city: "Enugu",
    state: "Enugu",
    lat: 6.45,
    lng: 7.51,
    failureHistory: "low",
    identityFlagged: false,
    nearestHospital: { name: "UNTH Ituku-Ozalla", distanceKm: 6.2, phone: "0800 112 005" },
    nearestPolice: { name: "Independence Layout Division", distanceKm: 1.3, phone: "0800 767 005" },
  },
];

export interface SamplePostcode {
  postcode: string;
  label: string;
  expected: "Verified" | "Needs review" | "High risk";
  address: AddressInput;
}

/** Five demo inputs for the checkout, each producing a different outcome. */
export const SAMPLE_POSTCODES: SamplePostcode[] = [
  {
    postcode: "LA1 4KJ",
    label: "Clean match, Ikeja",
    expected: "Verified",
    address: { street: "14 Isaac John Street", area: "Ikeja GRA", city: "Ikeja", state: "Lagos" },
  },
  {
    postcode: "FC2 9WS",
    label: "Good match, some failed drops",
    expected: "Verified",
    address: { street: "7 Aminu Kano Crescent", area: "Wuse II", city: "Abuja", state: "FCT" },
  },
  {
    postcode: "RV7 1PH",
    label: "City doesn't match postcode",
    expected: "Needs review",
    address: {
      street: "22 Tombia Street",
      area: "GRA Phase 2",
      city: "Obio-Akpor",
      state: "Rivers",
    },
  },
  {
    postcode: "KN3 2SB",
    label: "Flagged area, vague street",
    expected: "High risk",
    address: { street: "Near the big mosque", area: "Sabon Gari", city: "Kano", state: "Kano" },
  },
  {
    postcode: "ZZ9 0XX",
    label: "Postcode doesn't exist",
    expected: "High risk",
    address: { street: "3 Unknown Close", area: "Lekki", city: "Lekki", state: "Lagos" },
  },
];

export const AREA_FAILURE_RATES: AreaFailureRate[] = [
  { area: "Sabon Gari", failureRate: 18.4 },
  { area: "Onitsha Main Mkt", failureRate: 15.1 },
  { area: "Ajegunle", failureRate: 13.7 },
  { area: "Aba Ariaria", failureRate: 11.2 },
  { area: "PH GRA", failureRate: 7.9 },
  { area: "Wuse II", failureRate: 6.3 },
  { area: "Bodija", failureRate: 4.1 },
  { area: "Ikeja GRA", failureRate: 2.8 },
];

export const RECENT_CHECKS: RecentCheck[] = [
  {
    id: "CHK-90412",
    merchant: "Jumia Express",
    postcode: "LA1 4KJ",
    area: "Ikeja GRA",
    score: 100,
    status: "verified",
    minutesAgo: 1,
  },
  {
    id: "CHK-90411",
    merchant: "Kuda Bank KYC",
    postcode: "KN3 2SB",
    area: "Sabon Gari",
    score: 35,
    status: "high_risk",
    minutesAgo: 3,
  },
  {
    id: "CHK-90410",
    merchant: "Chowdeck",
    postcode: "FC2 9WS",
    area: "Wuse II",
    score: 88,
    status: "verified",
    minutesAgo: 6,
  },
  {
    id: "CHK-90409",
    merchant: "Konga",
    postcode: "RV7 1PH",
    area: "GRA Phase 2",
    score: 68,
    status: "review",
    minutesAgo: 9,
  },
  {
    id: "CHK-90408",
    merchant: "GIG Logistics",
    postcode: "OY5 3XB",
    area: "Bodija",
    score: 95,
    status: "verified",
    minutesAgo: 14,
  },
  {
    id: "CHK-90407",
    merchant: "Moniepoint KYC",
    postcode: "ZZ9 0XX",
    area: "—",
    score: 10,
    status: "high_risk",
    minutesAgo: 21,
  },
  {
    id: "CHK-90406",
    merchant: "Jumia Express",
    postcode: "EN4 6GT",
    area: "Independence Layout",
    score: 92,
    status: "verified",
    minutesAgo: 27,
  },
  {
    id: "CHK-90405",
    merchant: "Kwik Delivery",
    postcode: "RV7 1PH",
    area: "GRA Phase 2",
    score: 61,
    status: "review",
    minutesAgo: 34,
  },
];

/** Average cost of one failed delivery attempt (re-dispatch, return, support). */
export const AVG_FAILED_DELIVERY_COST_NGN = 4500;
/** Average loss prevented per blocked fraudulent address (KYC / chargebacks). */
export const AVG_FRAUD_LOSS_NGN = 12000;
