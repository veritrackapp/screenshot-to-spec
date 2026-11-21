import { describe, expect, it } from "vitest";
import { dial, isEnd, respond, MENU_TEXT } from "@/lib/ussd";
import {
  SAMPLE_POSTCODES,
  findPostcode,
  scoreAddress,
  statusForScore,
} from "@/services/postcodeService";

const sampleScore = (s: (typeof SAMPLE_POSTCODES)[number]) =>
  scoreAddress(s.postcode, s.address, findPostcode(s.postcode), "sample");

describe("address scoring", () => {
  it("gives each of the 5 sample postcodes its expected status", () => {
    const labels = {
      verified: "Verified",
      review: "Needs review",
      high_risk: "High risk",
    } as const;
    expect(SAMPLE_POSTCODES).toHaveLength(5);
    for (const s of SAMPLE_POSTCODES) {
      expect(labels[sampleScore(s).status]).toBe(s.expected);
    }
  });

  it("keeps the confidence score within 0-100", () => {
    for (const s of SAMPLE_POSTCODES) {
      const { score } = sampleScore(s);
      expect(score).toBeGreaterThanOrEqual(0);
      expect(score).toBeLessThanOrEqual(100);
    }
  });

  it("marks an unknown postcode as high risk with a reason", () => {
    const r = scoreAddress("ZZ9 0XX", {
      street: "1 A St",
      area: "",
      city: "Lagos",
      state: "Lagos",
    });
    expect(r.status).toBe("high_risk");
    expect(r.reasons[0]?.label).toMatch(/not found/i);
  });

  it("maps score bands to statuses", () => {
    expect(statusForScore(85)).toBe("verified");
    expect(statusForScore(84)).toBe("review");
    expect(statusForScore(60)).toBe("review");
    expect(statusForScore(59)).toBe("high_risk");
  });

  describe("scores only on real signals", () => {
    const record = findPostcode("FC 02 A09 DB 09");
    if (!record) throw new Error("sample postcode missing");
    const good = { street: "7 Aminu Kano Crescent", area: "Wuse II", city: "Abuja", state: "FCT" };

    it("gives 100 when the postcode, state, city and house number all check out", () => {
      const r = scoreAddress(record.postcode, good, record);
      expect(r.score).toBe(100);
      expect(r.status).toBe("verified");
      expect(r.source).toBe("live");
    });

    it("sends a city mismatch to review", () => {
      const r = scoreAddress(record.postcode, { ...good, city: "Lagos" }, record);
      expect(r.score).toBe(75);
      expect(r.status).toBe("review");
    });

    it("warns, but still verifies, when the street has no house number", () => {
      const r = scoreAddress(record.postcode, { ...good, street: "Near the market" }, record);
      expect(r.score).toBe(85);
      expect(r.status).toBe("verified");
      expect(r.reasons.some((x) => x.outcome === "warn")).toBe(true);
    });

    it("never mentions delivery failure history or identity flags", () => {
      for (const s of SAMPLE_POSTCODES) {
        for (const reason of sampleScore(s).reasons) {
          expect(reason.label).not.toMatch(/failure|failed|identit/i);
        }
      }
    });

    it("labels the built-in samples as sample data", () => {
      for (const s of SAMPLE_POSTCODES) expect(sampleScore(s).source).toBe("sample");
    });
  });
});

describe("USSD *384# flow", () => {
  it("opens the menu with a CON reply", () => {
    const r = dial("*384#");
    expect(r.response).toBe(MENU_TEXT);
    expect(r.response.startsWith("CON ")).toBe(true);
  });

  it("rejects other codes with END", () => {
    expect(isEnd(dial("*123#").response)).toBe(true);
  });

  it("reports an emergency: menu -> postcode -> type -> END with an incident", () => {
    let r = dial("*384#");
    r = respond(r.session!, "1");
    expect(r.response).toMatch(/^CON Enter your postcode/);
    r = respond(r.session!, "FC 02 A09 DB 09");
    expect(r.response).toMatch(/^CON .*Medical/s);
    r = respond(r.session!, "1");
    expect(isEnd(r.response)).toBe(true);
    expect(r.session).toBeNull();
    expect(r.incident?.type).toBe("medical");
    expect(r.incident?.record.postcode).toBe("FC 02 A09 DB 09");
  });

  it("re-prompts on an unknown postcode without ending", () => {
    const menu = dial("*384#");
    const ask = respond(menu.session!, "1");
    const r = respond(ask.session!, "ZZ90XX");
    expect(r.response.startsWith("CON ")).toBe(true);
    expect(r.session?.step).toBe("report_postcode");
  });

  it("exits on 0 with END and no incident", () => {
    const r = respond(dial("*384#").session!, "0");
    expect(isEnd(r.response)).toBe(true);
    expect(r.incident).toBeUndefined();
  });
});
