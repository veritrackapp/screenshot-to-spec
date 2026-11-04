import { PackageX, Siren, UserX } from "lucide-react";
import riderImage from "@/assets/lagos-dispatch-rider.jpg";

const problems = [
  {
    Icon: PackageX,
    title: "Failed deliveries",
    problem: "“Opposite the yellow church” isn't an address. Riders call, wait, and return parcels.",
    solution: "Postcodes are checked before an order ships, so bad addresses are fixed at checkout.",
  },
  {
    Icon: UserX,
    title: "Fake KYC addresses",
    problem: "Fraudsters reuse made-up addresses to open accounts and take loans.",
    solution: "Every address gets a score, and areas linked to many unrelated identities are flagged.",
  },
  {
    Icon: Siren,
    title: "Slow emergency response",
    problem: "Callers struggle to describe where they are, and minutes are lost.",
    solution: "Anyone on any phone can dial *384# and share a postcode responders can find.",
  },
];

export function ProblemSection() {
  return (
    <section className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:py-28">
      <div className="grid gap-12 lg:grid-cols-[1fr_1.15fr] lg:items-center">
        <div className="relative overflow-hidden rounded-3xl">
          <img
            src={riderImage}
            alt="A dispatch rider on a Lagos street checking a delivery address on his phone"
            width={1280}
            height={960}
            loading="lazy"
            className="aspect-[4/5] w-full object-cover sm:aspect-[4/3] lg:aspect-[4/5]"
          />
        </div>

        <div className="space-y-10">
          <div className="space-y-3">
            <p className="text-xs font-semibold uppercase tracking-[0.14em] text-primary">The problem</p>
            <h2 className="text-3xl font-semibold sm:text-4xl">An address you can't trust costs everyone</h2>
          </div>
          <div className="space-y-6">
            {problems.map(({ Icon, title, problem, solution }) => (
              <div key={title} className="flex gap-4">
                <span className="grid size-11 shrink-0 place-items-center rounded-xl bg-secondary text-primary">
                  <Icon className="size-5" aria-hidden />
                </span>
                <div className="space-y-1.5">
                  <h3 className="text-lg font-semibold">{title}</h3>
                  <p className="text-muted-foreground">{problem}</p>
                  <p className="text-sm font-medium text-primary">{solution}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
