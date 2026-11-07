import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Check, Copy, CreditCard, KeyRound, LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { getSession, signOut, type Session } from "@/lib/auth";

export const Route = createFileRoute("/account")({
  component: AccountPage,
});

type Status = "verified" | "review" | "high_risk";
type Tab = "overview" | "checks" | "key" | "billing";

interface Row {
  id: string;
  postcode: string;
  place: string;
  status: Status;
  score: number;
  source: "Live API" | "Demo data";
  when: string;
}

// SAMPLE DATA ONLY. Replace with rows from the checks table later.
const ROWS: Row[] = [
  { id: "1", postcode: "FC 02 A09 DB 09", place: "Wuse II, Abuja", status: "verified", score: 88, source: "Live API", when: "2 min ago" },
  { id: "2", postcode: "FC 05 B12 KD 03", place: "Garki, Abuja", status: "verified", score: 84, source: "Demo data", when: "9 min ago" },
  { id: "3", postcode: "RV 03 C07 PH 11", place: "GRA Phase 2, Port Harcourt", status: "review", score: 58, source: "Demo data", when: "21 min ago" },
  { id: "4", postcode: "KN 01 D04 SG 22", place: "Sabon Gari, Kano", status: "high_risk", score: 35, source: "Demo data", when: "1 hr ago" },
  { id: "5", postcode: "ZZ 99 Z99 ZZ 99", place: "Not found", status: "high_risk", score: 10, source: "Live API", when: "2 hr ago" },
  { id: "6", postcode: "OY 04 E02 BD 15", place: "Bodija, Ibadan", status: "verified", score: 95, source: "Demo data", when: "3 hr ago" },
];

const STATUS_STYLE: Record<Status, { label: string; cls: string }> = {
  verified: { label: "Verified", cls: "border-emerald-200 bg-emerald-50 text-emerald-700" },
  review: { label: "Needs review", cls: "border-amber-200 bg-amber-50 text-amber-700" },
  high_risk: { label: "High risk", cls: "border-red-200 bg-red-50 text-red-700" },
};

const ALLOWANCE = { used: 38, limit: 50 };

// Illustrative pricing for the pitch. Not final.
const PLANS = [
  { name: "Starter", price: "₦0", period: "per month", checks: "50 checks included", note: "For trying Adrex on real orders.", current: true },
  { name: "Growth", price: "₦20,000", period: "per month", checks: "1,000 checks included", note: "For growing stores and couriers. Extra checks ₦25 each.", current: false },
  { name: "Enterprise", price: "Custom", period: "", checks: "Volume pricing", note: "For banks, fintechs and large logistics firms.", current: false },
];

const TOPUPS = [
  { checks: 100, price: "₦3,000", each: "₦30 per check" },
  { checks: 500, price: "₦12,500", each: "₦25 per check" },
  { checks: 2000, price: "₦45,000", each: "₦22.50 per check" },
];

const INVOICES = [
  { id: "INV-1003", period: "Oct 2026", plan: "Starter", amount: "₦0", status: "Paid" },
  { id: "INV-1002", period: "Sep 2026", plan: "Starter", amount: "₦0", status: "Paid" },
  { id: "INV-1001", period: "Aug 2026", plan: "Starter", amount: "₦0", status: "Paid" },
];

const SNIPPET = [
  'curl "https://api.example.com/v1/validate?code=FC-02-A09-DB-09" \\',
  '  -H "X-API-Key: YOUR_KEY"',
].join("\n");

const TABS: { id: Tab; label: string }[] = [
  { id: "overview", label: "Overview" },
  { id: "checks", label: "Checks" },
  { id: "key", label: "API key" },
  { id: "billing", label: "Billing" },
];

function StatusBadge({ status, score }: { status: Status; score: number }) {
  const s = STATUS_STYLE[status];
  return (
    <span className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-medium ${s.cls}`}>
      {s.label} {score}
    </span>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <Card>
      <CardContent className="p-5">
        <p className="text-sm text-muted-foreground">{label}</p>
        <p className="mt-1 text-3xl font-semibold tracking-tight">{value}</p>
      </CardContent>
    </Card>
  );
}

function Meter({ used, limit }: { used: number; limit: number }) {
  const pct = Math.min(100, Math.round((used / limit) * 100));
  return (
    <div className="h-2.5 w-full overflow-hidden rounded-full bg-muted">
      <div className="h-full rounded-full bg-primary" style={{ width: `${pct}%` }} />
    </div>
  );
}

function ChecksTable({ rows }: { rows: Row[] }) {
  return (
    <div className="overflow-x-auto rounded-lg border">
      <table className="w-full text-left text-sm">
        <thead className="bg-muted/50 text-xs uppercase tracking-wide text-muted-foreground">
          <tr>
            <th className="px-4 py-3 font-medium">Postcode</th>
            <th className="px-4 py-3 font-medium">Place</th>
            <th className="px-4 py-3 font-medium">Result</th>
            <th className="px-4 py-3 font-medium">Source</th>
            <th className="px-4 py-3 font-medium">When</th>
          </tr>
        </thead>
        <tbody className="divide-y">
          {rows.map((r) => (
            <tr key={r.id}>
              <td className="px-4 py-3 font-mono text-xs tracking-wider">{r.postcode}</td>
              <td className="px-4 py-3">{r.place}</td>
              <td className="px-4 py-3"><StatusBadge status={r.status} score={r.score} /></td>
              <td className="px-4 py-3 text-muted-foreground">{r.source}</td>
              <td className="px-4 py-3 text-muted-foreground">{r.when}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function AccountPage() {
  const navigate = useNavigate();
  const [session, setSession] = useState<Session | null>(null);
  const [ready, setReady] = useState(false);
  const [tab, setTab] = useState<Tab>("overview");
  const [notice, setNotice] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    const current = getSession();
    if (!current) {
      navigate({ to: "/login" });
      return;
    }
    setSession(current);
    setReady(true);
  }, [navigate]);

  const copySnippet = async () => {
    try {
      await navigator.clipboard.writeText(SNIPPET);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      setCopied(false);
    }
  };

  const logout = () => {
    signOut();
    navigate({ to: "/login" });
  };

  const notConnected = () =>
    setNotice("Payments are not connected yet. This screen previews the billing flow.");

  if (!ready || !session) {
    return <main className="mx-auto max-w-6xl px-4 py-16 text-sm text-muted-foreground">Loading your account…</main>;
  }

  return (
    <main className="mx-auto w-full max-w-6xl px-4 py-10 sm:px-6">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="text-sm font-medium text-primary">Merchant portal</p>
          <h1 className="font-display mt-1 text-3xl font-semibold tracking-tight">Your Adrex dashboard</h1>
          <p className="mt-1 text-sm text-muted-foreground">Signed in as {session.email}</p>
        </div>
        <Button variant="outline" size="sm" onClick={logout}>
          <LogOut /> Sign out
        </Button>
      </div>

      <div className="mt-5 rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900">
        Preview with sample data. Live check history and payments are on the roadmap.
      </div>

      {notice && (
        <div className="mt-3 rounded-lg border border-primary/30 bg-primary/5 px-4 py-3 text-sm">{notice}</div>
      )}

      <div className="mt-6 flex gap-1 overflow-x-auto border-b">
        {TABS.map((t) => (
          <button
            key={t.id}
            type="button"
            onClick={() => setTab(t.id)}
            className={`-mb-px whitespace-nowrap border-b-2 px-4 py-2.5 text-sm font-medium transition-colors ${
              tab === t.id
                ? "border-primary text-primary"
                : "border-transparent text-muted-foreground hover:text-foreground"
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      <div className="mt-6 space-y-6">
        {tab === "overview" && (
          <>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              <Stat label="Checks this month" value={String(ALLOWANCE.used)} />
              <Stat label="Verified" value="71%" />
              <Stat label="High risk caught" value="6" />
              <Stat label="Source: live API" value="92%" />
            </div>

            <Card>
              <CardContent className="space-y-3 p-5">
                <div className="flex items-center justify-between text-sm">
                  <span className="font-medium">Monthly allowance</span>
                  <span className="text-muted-foreground">{ALLOWANCE.used} of {ALLOWANCE.limit} used</span>
                </div>
                <Meter used={ALLOWANCE.used} limit={ALLOWANCE.limit} />
                <div className="flex items-center justify-between">
                  <span className="text-xs text-muted-foreground">Refreshes on the 1st</span>
                  <Button size="sm" onClick={() => setTab("billing")}>Top up checks</Button>
                </div>
              </CardContent>
            </Card>

            <div>
              <h2 className="mb-3 text-sm font-semibold">Recent checks</h2>
              <ChecksTable rows={ROWS.slice(0, 4)} />
            </div>
          </>
        )}

        {tab === "checks" && <ChecksTable rows={ROWS} />}

        {tab === "key" && (
          <Card>
            <CardContent className="space-y-4 p-5">
              <div className="flex items-center gap-2 text-sm font-medium">
                <KeyRound className="size-4 text-primary" /> Test key (sample)
              </div>
              <p className="font-mono text-sm tracking-wider">adrex_test_••••••••••••3f9a</p>
              <p className="text-sm text-muted-foreground">
                Real keys will be issued per merchant. Keep keys on your server, never in browser code.
              </p>
              <div className="relative">
                <pre className="overflow-x-auto rounded-lg bg-muted p-4 text-xs">{SNIPPET}</pre>
                <Button size="sm" variant="outline" className="absolute right-2 top-2" onClick={copySnippet}>
                  {copied ? <Check /> : <Copy />}
                  {copied ? "Copied" : "Copy"}
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {tab === "billing" && (
          <>
            <p className="text-sm text-muted-foreground">Illustrative pricing for the pitch. Not final.</p>

            <Card>
              <CardContent className="space-y-3 p-5">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div>
                    <p className="text-sm text-muted-foreground">Current plan</p>
                    <p className="text-xl font-semibold">Starter</p>
                  </div>
                  <span className="text-sm text-muted-foreground">Next renewal: 1st of the month</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="font-medium">Checks used</span>
                  <span className="text-muted-foreground">{ALLOWANCE.used} of {ALLOWANCE.limit}</span>
                </div>
                <Meter used={ALLOWANCE.used} limit={ALLOWANCE.limit} />
              </CardContent>
            </Card>

            <div className="grid gap-4 md:grid-cols-3">
              {PLANS.map((p) => (
                <Card key={p.name} className={p.current ? "border-primary" : ""}>
                  <CardContent className="flex h-full flex-col gap-3 p-6">
                    <p className="text-sm font-medium text-muted-foreground">{p.name}</p>
                    <p className="text-3xl font-semibold tracking-tight">
                      {p.price} <span className="text-sm font-normal text-muted-foreground">{p.period}</span>
                    </p>
                    <p className="text-sm font-medium">{p.checks}</p>
                    <p className="flex-1 text-sm text-muted-foreground">{p.note}</p>
                    <Button
                      variant={p.current ? "outline" : "default"}
                      disabled={p.current}
                      onClick={notConnected}
                    >
                      {p.current ? "Current plan" : p.price === "Custom" ? "Contact us" : "Choose plan"}
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>

            <div>
              <h2 className="mb-3 text-sm font-semibold">Top up checks</h2>
              <div className="grid gap-4 sm:grid-cols-3">
                {TOPUPS.map((t) => (
                  <Card key={t.checks}>
                    <CardContent className="space-y-2 p-5">
                      <p className="text-2xl font-semibold">{t.checks.toLocaleString("en-NG")} checks</p>
                      <p className="text-sm text-muted-foreground">{t.each}</p>
                      <Button variant="outline" className="w-full" onClick={notConnected}>
                        Buy for {t.price}
                      </Button>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>

            <Card>
              <CardContent className="flex flex-wrap items-center justify-between gap-3 p-5">
                <div className="flex items-center gap-3">
                  <CreditCard className="size-5 text-primary" />
                  <div>
                    <p className="text-sm font-medium">Payment method</p>
                    <p className="text-sm text-muted-foreground">None added</p>
                  </div>
                </div>
                <Button variant="outline" size="sm" onClick={notConnected}>Add payment method</Button>
              </CardContent>
            </Card>

            <div>
              <h2 className="mb-3 text-sm font-semibold">Invoices (sample)</h2>
              <div className="overflow-x-auto rounded-lg border">
                <table className="w-full text-left text-sm">
                  <thead className="bg-muted/50 text-xs uppercase tracking-wide text-muted-foreground">
                    <tr>
                      <th className="px-4 py-3 font-medium">Invoice</th>
                      <th className="px-4 py-3 font-medium">Period</th>
                      <th className="px-4 py-3 font-medium">Plan</th>
                      <th className="px-4 py-3 font-medium">Amount</th>
                      <th className="px-4 py-3 font-medium">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y">
                    {INVOICES.map((i) => (
                      <tr key={i.id}>
                        <td className="px-4 py-3 font-mono text-xs">{i.id}</td>
                        <td className="px-4 py-3">{i.period}</td>
                        <td className="px-4 py-3">{i.plan}</td>
                        <td className="px-4 py-3">{i.amount}</td>
                        <td className="px-4 py-3 text-muted-foreground">{i.status}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </>
        )}
      </div>
    </main>
  );
}
