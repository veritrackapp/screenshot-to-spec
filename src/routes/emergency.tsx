import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { ArrowRight, Keyboard } from "lucide-react";
import { useCallback, useEffect } from "react";
import { toast } from "sonner";
import { PageHeader, PageShell } from "@/components/layout/PageHeader";
import { FeaturePhone } from "@/components/phone/FeaturePhone";
import { GatewayLog } from "@/components/phone/GatewayLog";
import { isTextStep, useUssdPhone } from "@/components/phone/useUssdPhone";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { INCIDENT_LABEL, USSD_CODE, type UssdIncidentEffect } from "@/lib/ussd";
import { createIncident } from "@/store/incidents";
import { SAMPLE_POSTCODES } from "@/services/postcodeService";

const title = "Emergency mode — TrustPost USSD simulator";
const description =
  "Dial *384# on a simulated feature phone to report a medical, fire or security emergency by postcode, or find the nearest hospital and police.";

export const Route = createFileRoute("/emergency")({
  head: () => ({
    meta: [
      { title },
      { name: "description", content: description },
      { property: "og:title", content: title },
      { property: "og:description", content: description },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: EmergencyPage,
});

const steps = [
  <>
    Dial <code className="font-mono font-semibold">{USSD_CODE}</code> and press the green key.
  </>,
  <>
    Choose <strong>1</strong> to report an emergency.
  </>,
  <>Enter your postcode — tap a key repeatedly for letters, or use a sample below.</>,
  <>
    Pick the type: <strong>1</strong> Medical, <strong>2</strong> Fire, <strong>3</strong> Security.
  </>,
];

function EmergencyPage() {
  const navigate = useNavigate();

  const onIncident = useCallback(
    ({ type, record }: UssdIncidentEffect) => {
      const incident = createIncident({
        type,
        postcode: record.postcode,
        area: record.area,
        city: record.city,
        state: record.state,
        lat: record.lat,
        lng: record.lng,
      });
      toast.success(`${INCIDENT_LABEL[type]} incident ${incident.id} created`, {
        description: `${record.area}, ${record.city} · now visible to responders`,
        action: { label: "Open console", onClick: () => navigate({ to: "/responders" }) },
      });
    },
    [navigate],
  );

  const phone = useUssdPhone(onIncident);
  const textStep = isTextStep(phone.state);

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement | null;
      if (target && ["INPUT", "TEXTAREA", "SELECT"].includes(target.tagName)) return;
      if (e.metaKey || e.ctrlKey || e.altKey) return;
      if (e.key === "Enter") return (e.preventDefault(), phone.call());
      if (e.key === "Escape") return phone.end();
      if (e.key === "Backspace") return (e.preventDefault(), phone.clear());
      if (/^[0-9*#]$/.test(e.key)) return phone.typeText(e.key);
      if (/^[a-zA-Z]$/.test(e.key)) return phone.typeText(e.key.toUpperCase());
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [phone]);

  return (
    <PageShell>
      <PageHeader
        eyebrow="Emergency mode"
        title="Help from any phone, no data needed"
        description="Most Nigerians in an emergency have a basic phone and no internet. TrustPost works over USSD, so a postcode is all responders need."
        actions={
          <Button asChild variant="outline">
            <Link to="/responders">
              Responder console <ArrowRight />
            </Link>
          </Button>
        }
      />

      <div className="grid gap-8 lg:grid-cols-[auto_1fr]">
        <div className="flex justify-center rounded-3xl bg-soft px-6 py-10 lg:px-14">
          <FeaturePhone
            state={phone.state}
            onKey={phone.pressKey}
            onCall={phone.call}
            onEnd={phone.end}
            onClear={phone.clear}
          />
        </div>

        <div className="space-y-6">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base">Try it</CardTitle>
            </CardHeader>
            <CardContent className="space-y-5">
              <ol className="space-y-2.5">
                {steps.map((s, i) => (
                  <li key={i} className="flex gap-3 text-sm">
                    <span className="grid size-6 shrink-0 place-items-center rounded-full bg-secondary text-xs font-semibold text-primary">
                      {i + 1}
                    </span>
                    <span className="pt-0.5">{s}</span>
                  </li>
                ))}
              </ol>

              <div className="space-y-2">
                <p className="text-sm font-medium">
                  Sample postcodes{" "}
                  {textStep ? "— tap to enter" : "(available at the postcode step)"}
                </p>
                <div className="flex flex-wrap gap-2">
                  {SAMPLE_POSTCODES.map((s) => (
                    <Button
                      key={s.postcode}
                      size="sm"
                      variant="outline"
                      className="font-mono"
                      disabled={!textStep}
                      onClick={() => phone.setBuffer(s.postcode.replace(" ", ""))}
                    >
                      {s.postcode}
                    </Button>
                  ))}
                </div>
              </div>

              <p className="flex items-center gap-2 text-xs text-muted-foreground">
                <Keyboard className="size-3.5" aria-hidden />
                Your keyboard works too: type, Enter to send, Esc to hang up.
              </p>
            </CardContent>
          </Card>

          <GatewayLog entries={phone.log} />
        </div>
      </div>
    </PageShell>
  );
}
