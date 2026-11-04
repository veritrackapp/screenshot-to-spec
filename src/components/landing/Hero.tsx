import { Link } from "@tanstack/react-router";
import { ArrowRight, Phone } from "lucide-react";
import { Button } from "@/components/ui/button";
import { HeroVisual } from "./HeroVisual";

export function Hero() {
  return (
    <section className="bg-hero text-primary-foreground">
      <div className="mx-auto grid max-w-7xl items-center gap-14 px-4 py-20 sm:px-6 lg:grid-cols-[1.1fr_1fr] lg:py-28">
        <div className="space-y-7">
          <p className="inline-flex items-center gap-2 rounded-full border border-primary-foreground/20 px-3 py-1 text-xs font-medium text-primary-foreground/80">
            <span className="size-1.5 rounded-full bg-primary-glow" />
            For merchants, banks and first responders
          </p>
          <h1 className="text-4xl font-semibold leading-[1.05] sm:text-5xl lg:text-6xl">
            One trusted address layer for Nigeria
          </h1>
          <p className="max-w-xl text-lg text-primary-foreground/75">
            TrustPost turns the national postcode into a confidence score you can act on — at
            checkout, during KYC, and when someone dials for help.
          </p>
          <div className="flex flex-wrap gap-3">
            <Button asChild variant="inverse" size="lg">
              <Link to="/checkout">
                Try the checkout demo <ArrowRight />
              </Link>
            </Button>
            <Button asChild variant="outline-inverse" size="lg">
              <Link to="/emergency">
                <Phone /> See emergency mode
              </Link>
            </Button>
          </div>
        </div>
        <HeroVisual />
      </div>
    </section>
  );
}
