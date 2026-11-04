/**
 * Shared incident state for the emergency simulator and responder console.
 * Tiny external store: in-memory for instant updates on the same page,
 * mirrored to localStorage so other open tabs stay in sync.
 */
import { useSyncExternalStore } from "react";
import type { IncidentType } from "@/lib/ussd";

export type IncidentStatus = "new" | "dispatched" | "resolved";

export interface Incident {
  id: string;
  type: IncidentType;
  postcode: string;
  area: string;
  city: string;
  state: string;
  lat: number;
  lng: number;
  createdAt: number;
  status: IncidentStatus;
  channel: "USSD";
}

const STORAGE_KEY = "trustpost.incidents.v1";
const EMPTY: Incident[] = [];

function seed(): Incident[] {
  const now = Date.now();
  return [
    {
      id: "INC-2041",
      type: "security",
      postcode: "KN3 2SB",
      area: "Sabon Gari",
      city: "Kano",
      state: "Kano",
      lat: 12.01,
      lng: 8.53,
      createdAt: now - 6 * 60_000,
      status: "dispatched",
      channel: "USSD",
    },
    {
      id: "INC-2040",
      type: "medical",
      postcode: "FC2 9WS",
      area: "Wuse II",
      city: "Abuja",
      state: "FCT",
      lat: 9.08,
      lng: 7.47,
      createdAt: now - 19 * 60_000,
      status: "new",
      channel: "USSD",
    },
    {
      id: "INC-2039",
      type: "fire",
      postcode: "LA1 4KJ",
      area: "Ikeja GRA",
      city: "Ikeja",
      state: "Lagos",
      lat: 6.58,
      lng: 3.35,
      createdAt: now - 48 * 60_000,
      status: "resolved",
      channel: "USSD",
    },
  ];
}

let incidents: Incident[] | null = null;
const listeners = new Set<() => void>();

function load(): Incident[] {
  if (incidents) return incidents;
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    incidents = raw ? (JSON.parse(raw) as Incident[]) : seed();
  } catch {
    incidents = seed();
  }
  return incidents;
}

function commit(next: Incident[]) {
  incidents = next;
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
  } catch {
    /* storage unavailable: in-memory only */
  }
  listeners.forEach((l) => l());
}

function subscribe(listener: () => void) {
  listeners.add(listener);
  const onStorage = (e: StorageEvent) => {
    if (e.key !== STORAGE_KEY) return;
    incidents = e.newValue ? (JSON.parse(e.newValue) as Incident[]) : seed();
    listener();
  };
  window.addEventListener("storage", onStorage);
  return () => {
    listeners.delete(listener);
    window.removeEventListener("storage", onStorage);
  };
}

export function useIncidents(): Incident[] {
  return useSyncExternalStore(subscribe, load, () => EMPTY);
}

export function createIncident(
  input: Omit<Incident, "id" | "createdAt" | "status" | "channel">,
): Incident {
  const current = load();
  const maxId = current.reduce((m, i) => Math.max(m, Number(i.id.split("-")[1]) || 0), 2000);
  const incident: Incident = {
    ...input,
    id: `INC-${maxId + 1}`,
    createdAt: Date.now(),
    status: "new",
    channel: "USSD",
  };
  commit([incident, ...current]);
  return incident;
}

export function setIncidentStatus(id: string, status: IncidentStatus) {
  commit(load().map((i) => (i.id === id ? { ...i, status } : i)));
}

export function resetIncidents() {
  commit(seed());
}
