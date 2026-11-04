import { Loader2, Lock } from "lucide-react";
import { useState, type FormEvent } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { isValidPostcodeFormat } from "@/services/postcodeService";
import type { AddressInput } from "@/services/types";
import type { SamplePostcode } from "@/services/mockData";
import { SamplePicker } from "./SamplePicker";

export interface CheckoutValues extends AddressInput {
  fullName: string;
  phone: string;
  postcode: string;
}

const EMPTY: CheckoutValues = {
  fullName: "",
  phone: "",
  street: "",
  area: "",
  city: "",
  state: "",
  postcode: "",
};

export function CheckoutForm({
  pending,
  simulateOutage,
  onSimulateOutageChange,
  onSubmit,
}: {
  pending: boolean;
  simulateOutage: boolean;
  onSimulateOutageChange: (v: boolean) => void;
  onSubmit: (values: CheckoutValues) => void;
}) {
  const [values, setValues] = useState<CheckoutValues>(EMPTY);
  const [postcodeError, setPostcodeError] = useState<string | null>(null);
  const [picked, setPicked] = useState<string>();

  const set = (key: keyof CheckoutValues) => (e: React.ChangeEvent<HTMLInputElement>) => {
    setValues((v) => ({ ...v, [key]: e.target.value }));
    if (key === "postcode") setPostcodeError(null);
  };

  const pick = (s: SamplePostcode) => {
    setPicked(s.postcode);
    setPostcodeError(null);
    setValues({ fullName: "Adaeze Okafor", phone: "0803 555 0142", postcode: s.postcode, ...s.address });
  };

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (!values.postcode.trim()) return setPostcodeError("Enter a postcode.");
    if (!isValidPostcodeFormat(values.postcode)) {
      return setPostcodeError("Use the format two letters, digit, digit, two letters — e.g. LA1 4KJ.");
    }
    onSubmit(values);
  };

  return (
    <Card>
      <CardContent className="space-y-6 p-6 sm:p-8">
        <SamplePicker selected={picked} onPick={pick} />

        <form onSubmit={handleSubmit} className="space-y-5" noValidate>
          <div className="grid gap-4 sm:grid-cols-2">
            <Field id="fullName" label="Full name">
              <Input id="fullName" value={values.fullName} onChange={set("fullName")} autoComplete="name" required />
            </Field>
            <Field id="phone" label="Phone number">
              <Input id="phone" value={values.phone} onChange={set("phone")} autoComplete="tel" inputMode="tel" />
            </Field>
          </div>

          <Field id="postcode" label="Postcode" error={postcodeError}>
            <Input
              id="postcode"
              value={values.postcode}
              onChange={set("postcode")}
              placeholder="LA1 4KJ"
              className="font-mono uppercase tracking-wider"
              aria-invalid={!!postcodeError}
              aria-describedby={postcodeError ? "postcode-error" : undefined}
              maxLength={8}
            />
          </Field>

          <Field id="street" label="Street address">
            <Input id="street" value={values.street} onChange={set("street")} autoComplete="address-line1" />
          </Field>

          <div className="grid gap-4 sm:grid-cols-3">
            <Field id="area" label="Area / estate">
              <Input id="area" value={values.area} onChange={set("area")} />
            </Field>
            <Field id="city" label="City">
              <Input id="city" value={values.city} onChange={set("city")} autoComplete="address-level2" />
            </Field>
            <Field id="state" label="State">
              <Input id="state" value={values.state} onChange={set("state")} autoComplete="address-level1" />
            </Field>
          </div>

          <div className="flex flex-col gap-4 border-t pt-5 sm:flex-row sm:items-center sm:justify-between">
            <label className="flex items-center gap-2.5 text-sm text-muted-foreground">
              <Switch checked={simulateOutage} onCheckedChange={onSimulateOutageChange} />
              Simulate service outage
            </label>
            <Button type="submit" size="lg" disabled={pending}>
              {pending ? <Loader2 className="animate-spin" /> : <Lock />}
              {pending ? "Checking address…" : "Place order"}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}

function Field({
  id,
  label,
  error,
  children,
}: {
  id: string;
  label: string;
  error?: string | null;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-1.5">
      <Label htmlFor={id}>{label}</Label>
      {children}
      {error && (
        <p id={`${id}-error`} className="text-xs font-medium text-danger">
          {error}
        </p>
      )}
    </div>
  );
}
