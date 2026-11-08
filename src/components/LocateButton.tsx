import { Loader2, MapPin } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";

export interface FoundPlace {
  street: string;
  area: string;
  city: string;
  state: string;
}

// Above this radius the position is a rough guess (wifi or IP), so we don't fill the form.
const MAX_ACCURACY_M = 2000;

function formatDistance(m: number) {
  return m >= 1000 ? `${(m / 1000).toFixed(1)} km` : `${Math.round(m)} m`;
}

export function LocateButton({ onFound }: { onFound: (place: FoundPlace) => void }) {
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  const locate = () => {
    setMessage(null);
    if (!("geolocation" in navigator)) {
      setMessage("Your browser can't share a location.");
      return;
    }
    setBusy(true);
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        try {
          const { latitude, longitude, accuracy } = pos.coords;
          if (accuracy > MAX_ACCURACY_M) {
            setMessage(
              `Your device gave only an approximate location (within about ${formatDistance(accuracy)}), so nothing was filled in. Try on a phone with GPS, or type the address.`,
            );
            return;
          }
          const res = await fetch(`/api/locate?lat=${latitude}&lng=${longitude}`);
          const data = await res.json();
          if (!res.ok || (!data.city && !data.state)) {
            setMessage("We couldn't work out an address for this spot. Please type it in.");
            return;
          }
          onFound({
            street: data.street ?? "",
            area: data.area ?? "",
            city: data.city ?? "",
            state: data.state ?? "",
          });
          setMessage(
            `Address filled from your location (accurate to about ${formatDistance(accuracy)}). Please check it and add your house number.`,
          );
        } catch {
          setMessage("Could not look up your location. Please try again.");
        } finally {
          setBusy(false);
        }
      },
      () => {
        setBusy(false);
        setMessage("Location permission was declined, so nothing was looked up.");
      },
      { enableHighAccuracy: true, timeout: 15000, maximumAge: 0 },
    );
  };

  return (
    <div className="mt-2 space-y-1.5">
      <Button type="button" variant="outline" size="sm" onClick={locate} disabled={busy}>
        {busy ? <Loader2 className="animate-spin" /> : <MapPin />}
        {busy ? "Finding your address…" : "Use my location to fill the address"}
      </Button>
      {message && <p className="text-xs text-muted-foreground">{message}</p>}
    </div>
  );
}
