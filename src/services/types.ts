export type VerificationStatus = "verified" | "review" | "high_risk";

export type FailureHistory = "low" | "medium" | "high";

export interface PostcodeRecord {
  postcode: string;
  area: string;
  city: string;
  state: string;
  /** Approximate centroid, used for the responder map placeholder. */
  lat: number;
  lng: number;
  failureHistory: FailureHistory;
  /** Many unrelated identities have claimed addresses in this postcode recently. */
  identityFlagged: boolean;
  nearestHospital: { name: string; distanceKm: number; phone: string };
  nearestPolice: { name: string; distanceKm: number; phone: string };
}

export interface AddressInput {
  street: string;
  area: string;
  city: string;
  state: string;
}

export interface ValidationReason {
  label: string;
  outcome: "pass" | "warn" | "fail";
}

export interface ValidationResult {
  postcode: string;
  status: VerificationStatus;
  score: number;
  reasons: ValidationReason[];
  matched?: Pick<PostcodeRecord, "area" | "city" | "state">;
  checkedAt: string;
}

export interface DashboardKpis {
  addressesChecked: number;
  failedDeliveriesAvoided: number;
  fakeAddressesBlocked: number;
  nairaSaved: number;
}

export interface DailyChecks {
  date: string;
  label: string;
  checks: number;
  flagged: number;
}

export interface AreaFailureRate {
  area: string;
  failureRate: number;
}

export interface RecentCheck {
  id: string;
  merchant: string;
  postcode: string;
  area: string;
  score: number;
  status: VerificationStatus;
  minutesAgo: number;
}

export interface DashboardData {
  kpis: DashboardKpis;
  daily: DailyChecks[];
  areas: AreaFailureRate[];
  recent: RecentCheck[];
}
