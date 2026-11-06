import { createFileRoute } from "@tanstack/react-router";

declare const process: { env: Record<string, string | undefined> };

const FREE_LIMIT = 5;
const WINDOW_MS = 24 * 60 * 60 * 1000; // counts reset after 24 hours

// Demo-grade counter: it lives in server memory and resets if the server restarts.
const usage = new Map<string, { count: number; since: number }>();

function visitorId(request: Request): string {
  const forwarded = request.headers.get("x-forwarded-for");
  return forwarded?.split(",")[0]?.trim() || "local";
}

export const Route = createFileRoute("/api/lookup")({
  server: {
    handlers: {
      GET: async ({ request }: { request: Request }) => {
        // 1. The free-check limit
        if (process.env.DEMO_UNLIMITED !== "true") {
          const id = visitorId(request);
          const now = Date.now();
          const entry = usage.get(id);
          const current = !entry || now - entry.since > WINDOW_MS ? { count: 0, since: now } : entry;
          if (current.count >= FREE_LIMIT) {
            return Response.json(
              { error: "limit_reached", message: "Free checks used up. Sign up to continue." },
              { status: 429 },
            );
          }
          usage.set(id, { count: current.count + 1, since: current.since });
        }

        // 2. Clean up the postcode
        const url = new URL(request.url);
        const raw = url.searchParams.get("postcode") ?? url.searchParams.get("code") ?? "";
        const code = raw.trim().toUpperCase().replace(/[^A-Z0-9]/g, "");
        if (code.length !== 11) {
          return Response.json({ error: "Expected an 11-character postcode" }, { status: 400 });
        }
        // The API expects hyphens, e.g. EK-01-A03-FK-01
        const hyphenated = [
          code.slice(0, 2),
          code.slice(2, 4),
          code.slice(4, 7),
          code.slice(7, 9),
          code.slice(9),
        ].join("-");

        const configured = {
          base: Boolean(process.env.POSTCODE_API_BASE),
          key: Boolean(process.env.POSTCODE_API_KEY),
        };

        // 3. Ask the real postcode API
        try {
          const upstream = await fetch(
            `${process.env.POSTCODE_API_BASE}/lookup?code=${hyphenated}`,
            { headers: { "X-API-Key": process.env.POSTCODE_API_KEY ?? "" } },
          );
          const body = await upstream.json().catch(() => null);
          return Response.json({ configured, upstreamStatus: upstream.status, body });
        } catch {
          return Response.json({ configured, error: "Lookup failed" }, { status: 502 });
        }
      },
    },
  },
});
