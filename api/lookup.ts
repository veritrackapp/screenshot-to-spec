declare const process: { env: Record<string, string | undefined> };
// api/lookup.ts  (server side, runs on Vercel, holds the secret key)
export default async function handler(req: any, res: any) {
  const postcode = String(req.query?.postcode ?? "").trim();
  if (!postcode) return res.status(400).json({ error: "postcode is required" });

  try {
    // TODO 1: replace "TODO-PATH" with the lookup path from docs.postcode.gov.ng
    const r = await fetch(
      `${process.env.POSTCODE_API_BASE}/TODO-PATH/${encodeURIComponent(postcode)}`,
      {
        // TODO 2: replace with the auth header the docs specify
        headers: { Authorization: `Bearer ${process.env.POSTCODE_API_KEY}` },
      },
    );

    if (r.status === 404) return res.status(200).json({ found: false });
    if (!r.ok) return res.status(502).json({ error: "Postcode service unavailable" });

    const data = await r.json();

    // TODO 3: map these to the real field names in the docs' example response
    return res.status(200).json({
      found: true,
      postcode: data.postcode ?? postcode,
      area: data.area,
      city: data.city,
      state: data.state,
    });
  } catch {
    return res.status(500).json({ error: "Lookup failed" });
  }
}