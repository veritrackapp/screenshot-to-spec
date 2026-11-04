import { Link } from "@tanstack/react-router";
import { cn } from "@/lib/utils";

export function Logo({ className, inverse = false }: { className?: string; inverse?: boolean }) {
  return (
    <Link to="/" className={cn("flex items-center gap-2.5", className)} aria-label="TrustPost home">
      <span
        className={cn(
          "grid size-8 place-items-center rounded-lg font-display text-sm font-bold",
          inverse
            ? "bg-primary-foreground text-primary-deep"
            : "bg-primary text-primary-foreground",
        )}
      >
        <svg
          viewBox="0 0 24 24"
          className="size-4"
          fill="none"
          stroke="currentColor"
          strokeWidth={2.4}
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden
        >
          <path d="M12 21s-7-6.2-7-11.5A7 7 0 0 1 19 9.5C19 14.8 12 21 12 21Z" />
          <path d="m9 10 2 2 4-4" />
        </svg>
      </span>
      <span
        className={cn(
          "font-display text-lg font-semibold tracking-tight",
          inverse ? "text-primary-foreground" : "text-foreground",
        )}
      >
        TrustPost
      </span>
    </Link>
  );
}
