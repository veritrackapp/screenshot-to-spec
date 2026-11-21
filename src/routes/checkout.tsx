import { useMutation } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";
import { useRef, useState } from "react";
import { CheckoutForm, type CheckoutValues } from "@/components/checkout/CheckoutForm";
import { OrderSummary } from "@/components/checkout/OrderSummary";
import {
  ResultError,
  ResultIdle,
  ResultLoading,
  ValidationResultCard,
} from "@/components/checkout/ValidationResultCard";
import { PageHeader, PageShell } from "@/components/layout/PageHeader";
import { validateAddress } from "@/services/postcodeService";

const title = "Verify an address — Adrex";
const description =
  "Enter a Nigerian postcode and delivery address and get a Verified, Needs review or High risk score with reasons.";

export const Route = createFileRoute("/checkout")({
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
  component: CheckoutPage,
});

function CheckoutPage() {
  const lastValues = useRef<CheckoutValues | null>(null);

  const mutation = useMutation({
    mutationFn: (values: CheckoutValues) => validateAddress(values.postcode, values),
  });

  const run = (values: CheckoutValues) => {
    lastValues.current = values;
    mutation.mutate(values);
  };

  return (
    <PageShell>
      <PageHeader
        eyebrow="Address check"
        title="Check the address before you ship"
        description="Enter the delivery address and postcode. Adrex checks the postcode against the national registry and scores the address."
      />

      <div className="grid gap-6 lg:grid-cols-[1.4fr_1fr]">
        <CheckoutForm pending={mutation.isPending} onSubmit={run} />

        <div className="space-y-6 lg:sticky lg:top-24 lg:self-start">
          <div aria-live="polite">
            {mutation.isPending ? (
              <ResultLoading />
            ) : mutation.isError ? (
              <ResultError
                message={mutation.error.message}
                onRetry={() => lastValues.current && run(lastValues.current)}
              />
            ) : mutation.data ? (
              <ValidationResultCard result={mutation.data} />
            ) : (
              <ResultIdle />
            )}
          </div>
          <OrderSummary />
        </div>
      </div>
    </PageShell>
  );
}
