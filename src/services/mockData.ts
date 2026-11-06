import type { AddressInput, AreaFailureRate, PostcodeRecord, RecentCheck } from "./types";

/**
 * DEMO registry. These are placeholder codes in NIPOST's 11-character shape
 * (State, LGA, District, Area, Building). Only the "FC" (FCT) prefix is confirmed;
 * the others are made up for the demo. Replace with real codes from the Postcode API.
 */
export const POSTCODE_REGISTRY: PostcodeRecord[] = [
  {
    postcode: "FC 02 A09 DB 09",
    area: "Wuse II",
    city: "Abuja",
    state: "FCT",
    lat: 9.08,
    lng: 7.47,
    failureHistory: "low",
    identityFlagged: false,
    nearestHospital: { name: "Wuse District Hospital", distanceKm: 1.2, phone: "0800 112 001" },
    nearestPolice: { name: "Wuse Police Division", distanceKm: 0.9, phone: "0800 767 001" },
  },
  {
    postcode: "FC 05 B12 KD 03",
    area: "Garki",
    city: "Abuja",
    state: "FCT",
    lat: 9.03,
    lng: 7.49,
    failureHistory: "medium",
    identityFlagged: false,
    nearestHospital: { name: "Garki Hospital", distanceKm: 1.6, phone: "0800 112 006" },
    nearestPolice: { name: "Garki Police Division", distanceKm: 1.0, phone: "0800 767 006" },
  },
  {
    postcode: "RV 03 C07 PH 11",
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
    postcode: "KN 01 D04 SG 22",
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
    postcode: "OY 04 E02 BD 15",
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
    postcode: "EN 02 F06 IL 08",
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
    postcode: "FC 02 A09 DB 09",
    label: "Clean match, Wuse II",
    expected: "Verified",
    address: { street: "7 Aminu Kano Crescent", area: "Wuse II", city: "Abuja", state: "FCT" },
  },
  {
    postcode: "FC 05 B12 KD 03",
    label: "Good match, some failed drops",
    expected: "Verified",
    address: { street: "12 Gimbiya Street", area: "Garki", city: "Abuja", state: "FCT" },
  },
  {
    postcode: "RV 03 C07 PH 11",
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
    postcode: "KN 01 D04 SG 22",
    label: "Flagged area, vague street",
    expected: "High risk",
    address: { street: "Near the big mosque", area: "Sabon Gari", city: "Kano", state: "Kano" },
  },
  {
    postcode: "ZZ 99 Z99 ZZ 99",
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

/** Sample data only. Merchant names are generic placeholders. */
export const RECENT_CHECKS: RecentCheck[] = [
  { id: "CHK-90412", merchant: "Online Store", postcode: "FC 02 A09 DB 09", area: "Wuse II", score: 100, status: "verified", minutesAgo: 1 },
  { id: "CHK-90411", merchant: "Lending App (KYC)", postcode: "KN 01 D04 SG 22", area: "Sabon Gari", score: 35, status: "high_risk", minutesAgo: 3 },
  { id: "CHK-90410", merchant: "Food Delivery App", postcode: "FC 05 B12 KD 03", area: "Garki", score: 88, status: "verified", minutesAgo: 6 },
  { id: "CHK-90409", merchant: "Marketplace", postcode: "RV 03 C07 PH 11", area: "GRA Phase 2", score: 68, status: "review", minutesAgo: 9 },
  { id: "CHK-90408", merchant: "Logistics Co.", postcode: "OY 04 E02 BD 15", area: "Bodija", score: 95, status: "verified", minutesAgo: 14 },
  { id: "CHK-90407", merchant: "Wallet App (KYC)", postcode: "ZZ 99 Z99 ZZ 99", area: "—", score: 10, status: "high_risk", minutesAgo: 21 },
  { id: "CHK-90406", merchant: "Online Store", postcode: "EN 02 F06 IL 08", area: "Independence Layout", score: 92, status: "verified", minutesAgo: 27 },
  { id: "CHK-90405", merchant: "Courier Co.", postcode: "RV 03 C07 PH 11", area: "GRA Phase 2", score: 61, status: "review", minutesAgo: 34 },
];

/** Average cost of one failed delivery attempt (re-dispatch, return, support). */
export const AVG_FAILED_DELIVERY_COST_NGN = 4500;
/** Average loss prevented per blocked fraudulent address (KYC / chargebacks). */
export const AVG_FRAUD_LOSS_NGN = 12000;