import { createFileRoute } from "@tanstack/react-router";
import { errorCode, lookupUrl, parseLookup } from "@/lib/nipost";

declare const process: { env: Record<string, string | undefined> };

const FREE_LIMIT = 3;
const WINDOW_MS = 24 * 60 * 60 * 1000; // counts reset after 24 hours
const UPSTREAM_TIMEOUT_MS = 9000;

// Demo-grade counter: it lives in server memory and resets if the server restarts.
// Phase 2 moves this into the database.
const usage = new Map<string, { count: number; since: number }>();

function visitorId(request: Request): string {
  const forwarded = request.headers.get("x-forwarded-for");
  return forwarded?.split(",")[0]?.trim() || "local";
}

function currentUsage(id: string) {
  const now = Date.now();
  const entry = usage.get(id);
  return !entry || now - entry.since > WINDOW_MS ? { count: 0, since: now } : entry;
}

const json = (body: unknown, status = 200) =>
  Response.json(body, { status, headers: { "Cache-Control": "no-store" } });

const unavailable = () =>
  json(
    {
      error: "service_unavailable",
      message: "The postcode service is not available right now. Please try again shortly.",
    },
    503,
  );

/**
 * GET /api/lookup?postcode=FC02A09DB09
 *
 * 200 { valid: true,  postcode, state, lga, locality, zone }
 * 200 { valid: false, postcode }
 * 400 { error: "invalid_format", message }
 * 429 { error: "limit_reached", message }
 * 503 { error: "service_unavailable", message }
 *
 * Only the administrative place is passed on. The recent house address and building use that
 * NIPOST can return are personal data, so they never leave this route.
 */
export const Route = createFileRoute("/api/lookup")({
  server: {
    handlers: {
      GET: async ({ request }: { request: Request }) => {
        // 1. Clean up the postcode. Bad input never uses up a free check.
        const url = new URL(request.url);
        const raw = url.searchParams.get("postcode") ?? url.searchParams.get("code") ?? "";
        const code = raw
          .trim()
          .toUpperCase()
          .replace(/[^A-Z0-9]/g, "");
        if (code.length !== 11) {
          return json(
            { error: "invalid_format", message: "Expected an 11-character postcode." },
            400,
          );
        }

        // 2. The free-check limit
        const limited = process.env["DEMO_UNLIMITED"] !== "true";
        const id = visitorId(request);
        const current = currentUsage(id);
        if (limited && current.count >= FREE_LIMIT) {
          return json(
            { error: "limit_reached", message: "Free checks used up. Sign up to continue." },
            429,
          );
        }

        // 3. The API expects hyphens, e.g. EK-01-A03-FK-01
        const hyphenated = [
          code.slice(0, 2),
          code.slice(2, 4),
          code.slice(4, 7),
          code.slice(7, 9),
          code.slice(9),
        ].join("-");

        const base = process.env["POSTCODE_API_BASE"];
        const key = process.env["POSTCODE_API_KEY"];
        if (!base || !key) {
          console.error("[Adrex] POSTCODE_API_BASE or POSTCODE_API_KEY is not set");
          return unavailable();
        }

        // 4. Ask the real postcode API (GET {base}/v1/lookup, key in the X-API-Key header)
        let upstream: Response;
        try {
          upstream = await fetch(lookupUrl(base, hyphenated), {
            headers: { "X-API-Key": key },
            signal: AbortSignal.timeout(UPSTREAM_TIMEOUT_MS),
          });
        } catch (err) {
          console.error("[Adrex] postcode API request failed:", err);
          return unavailable();
        }

        // 5. Read the answer
        const body = await upstream.json().catch(() => null);
        let lookup = upstream.ok ? parseLookup(body) : null;

        if (!upstream.ok) {
          const reason = errorCode(body);
          const unknownCode = upstream.status === 404 && /not_?found/i.test(reason ?? "");
          if (!unknownCode) {
            // 401 bad key, 402 no credits, 403 missing scope, 429 rate limit, 5xx ...
            console.error("[Adrex] postcode API returned HTTP", upstream.status, reason ?? "");
            return unavailable();
          }
          lookup = { valid: false };
        }
        if (!lookup) {
          console.error("[Adrex] postcode API sent an unexpected response");
          return unavailable();
        }

        // 6. Only a real answer uses up a free check.
        if (limited) usage.set(id, { count: current.count + 1, since: current.since });

        if (!lookup.valid || !lookup.place) return json({ valid: false, postcode: code });
        return json({ valid: true, postcode: code, ...lookup.place });
      },
    },
  },
});
