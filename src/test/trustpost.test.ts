import { describe, expect, it } from "vitest";
import { dial, isEnd, respond, MENU_TEXT } from "@/lib/ussd";
import { SAMPLE_POSTCODES, scoreAddress, statusForScore } from "@/services/postcodeService";

describe("address scoring", () => {
  it("gives each of the 5 sample postcodes its expected status", () => {
    const labels = { verified: "Verified", review: "Needs review", high_risk: "High risk" } as const;
    expect(SAMPLE_POSTCODES).toHaveLength(5);
    for (const s of SAMPLE_POSTCODES) {
      expect(labels[scoreAddress(s.postcode, s.address).status]).toBe(s.expected);
    }
  });

  it("keeps the confidence score within 0-100", () => {
    for (const s of SAMPLE_POSTCODES) {
      const { score } = scoreAddress(s.postcode, s.address);
      expect(score).toBeGreaterThanOrEqual(0);
      expect(score).toBeLessThanOrEqual(100);
    }
  });

  it("marks an unknown postcode as high risk with a reason", () => {
    const r = scoreAddress("ZZ9 0XX", { street: "1 A St", area: "", city: "Lagos", state: "Lagos" });
    expect(r.status).toBe("high_risk");
    expect(r.reasons[0].label).toMatch(/not found/i);
  });

  it("maps score bands to statuses", () => {
    expect(statusForScore(75)).toBe("verified");
    expect(statusForScore(74)).toBe("review");
    expect(statusForScore(45)).toBe("review");
    expect(statusForScore(44)).toBe("high_risk");
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
    r = respond(r.session!, "LA14KJ");
    expect(r.response).toMatch(/^CON .*Medical/s);
    r = respond(r.session!, "1");
    expect(isEnd(r.response)).toBe(true);
    expect(r.session).toBeNull();
    expect(r.incident?.type).toBe("medical");
    expect(r.incident?.record.postcode).toBe("LA1 4KJ");
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
