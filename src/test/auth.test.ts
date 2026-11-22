import { describe, expect, it } from "vitest";
import { friendlyAuthError, safeNext } from "@/lib/auth";

describe("safeNext", () => {
  it("keeps paths inside the site", () => {
    expect(safeNext("/account")).toBe("/account");
    expect(safeNext("/checkout?x=1")).toBe("/checkout?x=1");
  });

  it("falls back for anything that could leave the site", () => {
    expect(safeNext(undefined)).toBe("/account");
    expect(safeNext("")).toBe("/account");
    expect(safeNext("https://evil.example")).toBe("/account");
    expect(safeNext("//evil.example")).toBe("/account");
    expect(safeNext("/\\evil.example")).toBe("/account");
    expect(safeNext("javascript:alert(1)")).toBe("/account");
  });
});

describe("friendlyAuthError", () => {
  it("explains common problems in plain language", () => {
    expect(friendlyAuthError("Invalid login credentials")).toMatch(/don't match/);
    expect(friendlyAuthError("Email not confirmed")).toMatch(/confirm your email/);
    expect(friendlyAuthError("User already registered")).toMatch(/already exists/);
  });

  it("never shows unknown internal messages", () => {
    expect(friendlyAuthError('pq: relation "users" does not exist')).toBe(
      "Something went wrong. Please try again.",
    );
  });
});
