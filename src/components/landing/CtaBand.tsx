import { Link } from "@tanstack/react-router";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";

export function CtaBand() {
  return (
    <section className="mx-auto w-full max-w-7xl px-4 py-20 sm:px-6">
      <div className="flex flex-col items-start justify-between gap-6 rounded-3xl bg-hero p-10 text-primary-foreground md:flex-row md:items-center md:p-14">
        <div className="max-w-xl space-y-2">
          <h2 className="text-3xl font-semibold">See a score in under a second</h2>
          <p className="text-primary-foreground/75">
            Run a sample checkout, then watch the business dashboard and emergency console.
          </p>
        </div>
        <div className="flex flex-wrap gap-3">
          <Button asChild variant="inverse" size="lg">
            <Link to="/checkout">
              Open checkout demo <ArrowRight />
            </Link>
          </Button>
          <Button asChild variant="outline-inverse" size="lg">
            <Link to="/dashboard">View dashboard</Link>
          </Button>
        </div>
      </div>
    </section>
  );
}
