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

const title = "Checkout demo — TrustPost";
const description =
  "Try TrustPost in a sample store checkout: enter a Nigerian postcode and get a Verified, Needs review or High risk score with reasons.";

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
  const [simulateOutage, setSimulateOutage] = useState(false);
  const lastValues = useRef<CheckoutValues | null>(null);

  const mutation = useMutation({
    mutationFn: ({ values, outage }: { values: CheckoutValues; outage: boolean }) =>
      validateAddress(values.postcode, values, { simulateOutage: outage }),
  });

  const run = (values: CheckoutValues) => {
    lastValues.current = values;
    mutation.mutate({ values, outage: simulateOutage });
  };

  return (
    <PageShell>
      <PageHeader
        eyebrow="Checkout demo"
        title="Check the address before you ship"
        description="A sample store checkout. When the order is placed, TrustPost scores the delivery address against the national postcode."
      />

      <div className="grid gap-6 lg:grid-cols-[1.4fr_1fr]">
        <CheckoutForm
          pending={mutation.isPending}
          simulateOutage={simulateOutage}
          onSimulateOutageChange={setSimulateOutage}
          onSubmit={run}
        />

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
