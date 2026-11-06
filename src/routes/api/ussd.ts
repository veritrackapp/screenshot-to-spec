import { createFileRoute } from "@tanstack/react-router";
import { findPostcode, formatPostcode, isValidPostcodeFormat } from "@/services/postcodeService";

const reply = (body: string) =>
  new Response(body, { headers: { "Content-Type": "text/plain; charset=utf-8" } });

const TYPES = ["Medical", "Fire", "Security"];

export const Route = createFileRoute("/api/ussd")({
  server: {
    handlers: {
      POST: async ({ request }: { request: Request }) => {
        let input = "";
        try {
          const contentType = request.headers.get("content-type") ?? "";
          if (contentType.includes("application/json")) {
            const json = await request.json();
            input = String(json?.text ?? "");
          } else {
            const form = await request.formData();
            input = String(form.get("text") ?? "");
          }
        } catch {
          input = "";
        }

        const parts = input === "" ? [] : input.split("*");
        const [choice, postcode, kind] = parts;

        if (parts.length === 0) {
          return reply(
            "CON Adrex Emergency\n1. Report an emergency\n2. Nearest hospital\n3. Nearest police\n0. Exit",
          );
        }
        if (choice === "0") return reply("END Stay safe. Goodbye.");

        if (choice === "1" || choice === "2" || choice === "3") {
          if (parts.length === 1) {
            return reply("CON Enter your 11-character postcode (e.g. FC02A09DB09)");
          }
          if (!isValidPostcodeFormat(postcode)) {
            return reply("END That postcode is not valid. Please dial again.");
          }

          if (choice === "1") {
            if (parts.length === 2) {
              return reply("CON What is the emergency?\n1. Medical\n2. Fire\n3. Security");
            }
            const label = TYPES[Number(kind) - 1] ?? "Emergency";
            const ref = `ADX-${Math.floor(1000 + Math.random() * 9000)}`;
            return reply(
              `END ${label} alert received.\nLocation: ${formatPostcode(postcode)}\nRef: ${ref}\nIf in danger, call 112.`,
            );
          }

          const record = findPostcode(postcode);
          if (!record) {
            return reply("END No record for that postcode yet. Please call 112.");
          }
          const place = choice === "2" ? record.nearestHospital : record.nearestPolice;
          const noun = choice === "2" ? "hospital" : "police";
          return reply(`END Nearest ${noun}: ${place.name}, ${place.distanceKm} km. Tel ${place.phone}`);
        }

        return reply("END Invalid choice. Please dial again.");
      },
    },
  },
});
