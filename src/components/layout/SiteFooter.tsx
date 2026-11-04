import { Link } from "@tanstack/react-router";
import { Info } from "lucide-react";
import { Logo } from "./Logo";
import { NAV_ITEMS } from "./SiteHeader";

export function SiteFooter() {
  return (
    <footer className="mt-auto border-t bg-card">
      <div className="mx-auto flex max-w-7xl flex-col gap-6 px-4 py-10 sm:px-6 md:flex-row md:items-start md:justify-between">
        <div className="max-w-sm space-y-3">
          <Logo />
          <p className="text-sm text-muted-foreground">
            Built on the National Digital Alphanumeric Postcode API.
          </p>
        </div>
        <nav className="flex flex-wrap gap-x-6 gap-y-2 text-sm" aria-label="Footer">
          {NAV_ITEMS.map((item) => (
            <Link key={item.to} to={item.to} className="text-muted-foreground hover:text-foreground">
              {item.label}
            </Link>
          ))}
        </nav>
      </div>
      <div className="border-t bg-muted">
        <p className="mx-auto flex max-w-7xl items-center gap-2 px-4 py-3 text-xs text-muted-foreground sm:px-6">
          <Info className="size-3.5 shrink-0" aria-hidden />
          Demo build: all postcodes, scores, incidents and business figures are mock data, not real records.
        </p>
      </div>
    </footer>
  );
}
