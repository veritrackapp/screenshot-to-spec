import { Link } from "@tanstack/react-router";
import { cn } from "@/lib/utils";

export function Logo({ className, inverse = false }: { className?: string; inverse?: boolean }) {
  return (
    <Link to="/" className={cn("flex items-center gap-2.5", className)} aria-label="Adrex home">
      <img src="/favicon.png" alt="" aria-hidden className="size-9 object-contain" />
      <span
        className={cn(
          "font-display text-lg font-semibold tracking-tight",
          inverse ? "text-primary-foreground" : "text-foreground",
        )}
      >
        Adrex
      </span>
    </Link>
  );
}