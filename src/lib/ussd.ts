/**
 * USSD state machine for the *384# emergency service.
 * Pure: every reply starts with "CON " (session continues, expects input)
 * or "END " (session closes). Side effects are returned, never performed.
 */
import { findPostcode, formatPostcode } from "@/services/postcodeService";
import type { PostcodeRecord } from "@/services/types";

export const USSD_CODE = "*384#";

export type IncidentType = "medical" | "fire" | "security";

export type UssdStep =
  | "menu"
  | "report_postcode"
  | "report_type"
  | "hospital_postcode"
  | "police_postcode";

export interface UssdSession {
  step: UssdStep;
  record?: PostcodeRecord;
}

export interface UssdIncidentEffect {
  type: IncidentType;
  record: PostcodeRecord;
}

export interface UssdReply {
  /** null once the session has ended. */
  session: UssdSession | null;
  response: string;
  incident?: UssdIncidentEffect;
}

export const MENU_TEXT =
  "CON TrustPost Emergency\n1. Report emergency\n2. Nearest hospital\n3. Nearest police\n0. Exit";

const TYPE_BY_KEY: Record<string, IncidentType> = { "1": "medical", "2": "fire", "3": "security" };

export const INCIDENT_LABEL: Record<IncidentType, string> = {
  medical: "Medical",
  fire: "Fire",
  security: "Security",
};

export function isEnd(response: string) {
  return response.startsWith("END ");
}

export function stripPrefix(response: string) {
  return response.replace(/^(CON|END) /, "");
}

export function dial(code: string): UssdReply {
  if (code.trim() === USSD_CODE) {
    return { session: { step: "menu" }, response: MENU_TEXT };
  }
  return { session: null, response: "END Connection problem or invalid MMI code." };
}

type Lookup = (postcode: string) => PostcodeRecord | undefined;

export function respond(session: UssdSession, rawInput: string, lookup: Lookup = findPostcode): UssdReply {
  const input = rawInput.trim();

  switch (session.step) {
    case "menu": {
      if (input === "1") return { session: { step: "report_postcode" }, response: "CON Enter your postcode:" };
      if (input === "2") return { session: { step: "hospital_postcode" }, response: "CON Enter your postcode:" };
      if (input === "3") return { session: { step: "police_postcode" }, response: "CON Enter your postcode:" };
      if (input === "0") return { session: null, response: "END Thank you for using TrustPost." };
      return { session, response: `CON Invalid choice.\n${MENU_TEXT.slice(4)}` };
    }

    case "report_postcode":
    case "hospital_postcode":
    case "police_postcode": {
      const record = lookup(input);
      if (!record) {
        return { session, response: `CON Postcode ${formatPostcode(input) || "(empty)"} not found.\nEnter your postcode:` };
      }
      if (session.step === "hospital_postcode") {
        const h = record.nearestHospital;
        return { session: null, response: `END Nearest hospital:\n${h.name}\n${h.distanceKm} km away\nCall ${h.phone}` };
      }
      if (session.step === "police_postcode") {
        const p = record.nearestPolice;
        return { session: null, response: `END Nearest police:\n${p.name}\n${p.distanceKm} km away\nCall ${p.phone}` };
      }
      return {
        session: { step: "report_type", record },
        response: `CON ${record.area}, ${record.city}\nType of emergency:\n1. Medical\n2. Fire\n3. Security`,
      };
    }

    case "report_type": {
      const type = TYPE_BY_KEY[input];
      if (!type || !session.record) {
        return { session, response: "CON Invalid choice.\n1. Medical\n2. Fire\n3. Security" };
      }
      return {
        session: null,
        response: `END ${INCIDENT_LABEL[type]} help requested for ${session.record.postcode}. Responders alerted. Stay where you are.`,
        incident: { type, record: session.record },
      };
    }
  }
}
