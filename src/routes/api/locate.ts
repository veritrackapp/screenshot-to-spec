import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/api/locate")({
  server: {
    handlers: {
      GET: async ({ request }: { request: Request }) => {
        const url = new URL(request.url);
        const lat = Number(url.searchParams.get("lat"));
        const lng = Number(url.searchParams.get("lng"));
        if (!Number.isFinite(lat) || !Number.isFinite(lng) || Math.abs(lat) > 90 || Math.abs(lng) > 180) {
          return Response.json({ error: "Invalid coordinates" }, { status: 400 });
        }
        try {
          const upstream = await fetch(
            `https://nominatim.openstreetmap.org/reverse?format=jsonv2&addressdetails=1&zoom=18&lat=${lat}&lon=${lng}`,
            { headers: { "User-Agent": "Adrex/1.0 (address verification demo)", "Accept-Language": "en" } },
          );
          if (!upstream.ok) return Response.json({ error: "lookup_failed" }, { status: 502 });
          const data = await upstream.json();
          const a = data?.address ?? {};
          const street = [a.house_number, a.road].filter(Boolean).join(" ");
          const area = a.suburb ?? a.neighbourhood ?? a.quarter ?? a.city_district ?? "";
          const city = a.city ?? a.town ?? a.village ?? a.municipality ?? a.county ?? a.state_district ?? "";
          let state = String(a.state ?? "");
          if (/federal capital/i.test(state)) state = "FCT";
          state = state.replace(/\s+state$/i, "");
          return Response.json({ street, area, city, state });
        } catch {
          return Response.json({ error: "lookup_failed" }, { status: 502 });
        }
      },
    },
  },
});
