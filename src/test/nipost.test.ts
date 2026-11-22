import { describe, expect, it } from "vitest";
import { errorCode, lookupUrl, parseLookup } from "@/lib/nipost";
import { scoreAddress } from "@/services/postcodeService";
import type { PostcodeRecord } from "@/services/types";

describe("NIPOST lookup helpers", () => {
  it("builds the /v1/lookup address from any base form", () => {
    const want = "https://api.postcode.gov.ng/v1/lookup?code=EK-01-A03-FK-01";
    expect(lookupUrl("https://api.postcode.gov.ng", "EK-01-A03-FK-01")).toBe(want);
    expect(lookupUrl("https://api.postcode.gov.ng/", "EK-01-A03-FK-01")).toBe(want);
    expect(lookupUrl("https://api.postcode.gov.ng/v1", "EK-01-A03-FK-01")).toBe(want);
  });

  it("reads only the administrative place from a valid response", () => {
    const body = {
      data: {
        postcode: "EK-01-A03-FK-01",
        valid: true,
        administrative_address: {
          state_name: "EKITI",
          lga_name: "ADO EKITI",
          locality_name: "ADO EKITI",
          zone: "SOUTH WEST",
        },
        recent_house_address: { recent: "NTA ROAD, BACK OF FABIAN HOTEL" },
        building_use_status: "RESIDENTIAL",
      },
    };
    const result = parseLookup(body);
    expect(result).toEqual({
      valid: true,
      place: { state: "EKITI", lga: "ADO EKITI", locality: "ADO EKITI", zone: "SOUTH WEST" },
    });
    expect(JSON.stringify(result)).not.toMatch(/FABIAN|RESIDENTIAL/);
  });

  it("reads an unknown postcode and rejects responses it doesn't understand", () => {
    expect(parseLookup({ data: { valid: false } })).toEqual({ valid: false });
    expect(parseLookup({})).toBeNull();
    expect(parseLookup(null)).toBeNull();
    expect(parseLookup({ data: { valid: "yes" } })).toBeNull();
  });

  it("extracts the error code from NIPOST error responses", () => {
    expect(errorCode({ error: { code: "invalid_api_key", message: "x" } })).toBe("invalid_api_key");
    expect(errorCode({})).toBeUndefined();
  });
});

describe("scoring against a live record", () => {
  const live: PostcodeRecord = {
    postcode: "EK01A03FK01",
    area: "Ado Ekiti",
    city: "Ado Ekiti",
    lga: "Ado Ekiti",
    state: "Ekiti",
    lat: 0,
    lng: 0,
    nearestHospital: { name: "", distanceKm: 0, phone: "" },
    nearestPolice: { name: "", distanceKm: 0, phone: "" },
  };

  it("matches the state ignoring case and a trailing 'State'", () => {
    const r = scoreAddress(
      live.postcode,
      { street: "4 NTA Road", area: "", city: "Ado Ekiti", state: "ekiti state" },
      live,
    );
    expect(r.score).toBe(100);
  });

  it("accepts the local government area as the city", () => {
    const r = scoreAddress(
      live.postcode,
      { street: "4 NTA Road", area: "", city: "Ado Ekiti", state: "Ekiti" },
      { ...live, city: "Fabian Quarters" },
    );
    expect(r.score).toBe(100);
  });

  it("treats FCT, Abuja and Federal Capital Territory as the same state", () => {
    const abuja = { ...live, city: "Abaji", lga: "Abaji", state: "Fct" };
    for (const state of ["FCT", "Abuja", "Federal Capital Territory"]) {
      const r = scoreAddress(
        abuja.postcode,
        { street: "1 Road", area: "", city: "Abaji", state },
        abuja,
      );
      expect(r.score).toBe(100);
    }
  });
});
